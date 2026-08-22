// Orden fijo en el que deben salir las categorías en el ticket impreso —
// lo que no esté en esta lista (o no se encuentre en MENU) se queda al
// final, en el orden en que ya estaba.
const TICKET_CATEGORIA_ORDEN = ['Patatas', 'Boniato', 'Paninis', 'Cookies', 'Tartas', 'Bebidas'];
function _ticketCategoriaRank(itemName) {
  const item = MENU.find(m => m.name === itemName);
  const idx = item ? TICKET_CATEGORIA_ORDEN.indexOf(item.cat) : -1;
  return idx === -1 ? TICKET_CATEGORIA_ORDEN.length : idx;
}

// Fetch con límite de tiempo — sin esto, si el servidor va lento o la
// petición se queda "colgada" (no falla, simplemente nunca responde), el
// cliente podía quedarse esperando indefinidamente en pantallas como
// "Enviando pedido…" o "Verificando…" sin ningún mensaje ni forma de saber
// si va a llegar respuesta alguna vez. Se usa en las peticiones que el
// cliente ve/espera directamente (guardar pedido, SMS, fidelización).
function _fetchConTimeout(url, opciones, ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms || 12000);
  return fetch(url, Object.assign({}, opciones, { signal: controller.signal }))
    .finally(() => clearTimeout(timeoutId));
}

// ── FAB y DRAWER (solo móvil) ──────────────────────────────────────────────
function _updateCartFab(count, total) {
  const fab = document.getElementById('cart-fab');
  if (!fab) return;
  // No mostrar FAB si estamos en la pantalla de éxito
  const successVisible = document.getElementById('success-screen')?.style.display === 'block';
  if (count === 0 || successVisible) {
    fab.classList.add('hidden');
  } else {
    fab.classList.remove('hidden');
    document.getElementById('cart-fab-count').textContent = count;
    document.getElementById('cart-fab-total').textContent = total.toFixed(2).replace('.', ',') + ' €';
  }
  // Botón "repetir último pedido" (solo móvil): ocupa el mismo hueco que
  // el FAB del carrito cuando este está vacío — nunca se muestran los dos
  // a la vez porque uno solo aparece cuando el otro está oculto.
  const repeatFab = document.getElementById('repeat-order-fab');
  if (repeatFab) {
    let hayUltimoPedido = false;
    try { hayUltimoPedido = !!localStorage.getItem('dpf_ultimo_pedido'); } catch (e) {}
    repeatFab.classList.toggle('hidden', count !== 0 || successVisible || !hayUltimoPedido);
  }
}
function _syncCartDrawer(cartHtml, total, discountAmt, discountCode, fidelizacionAmt, studentDiscountAmt, studentDiscountEnabledCfg, studentDiscountPctCfg, conflictoDescuentosNota, ofertaTotalAmt, ofertaTotalPct) {
  const drawerBody = document.getElementById('cart-drawer-body');
  if (!drawerBody) return;
  const ordersOpen = getOrdersOpen();
  // Fuente de verdad de la casilla estudiante/jubilado: la del formulario
  // de escritorio, igual que el código local — así el drawer siempre
  // refleja el valor real aunque se marcara desde el otro formulario.
  const _estudianteCheckedDrawer = !!(document.getElementById('student-discount-checkbox') || {}).checked;
  const _sinGastosPorCodigoLocal = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const feeLabel = getFeeLabel();
  const fee2Label = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  // El código local exime al gasto fijo etiquetado como "de gestión", sea
  // el 1º o el 2º — ver el comentario largo en carta.js/renderCart() para
  // el porqué (identificarlo por posición se rompía si se configuraban al
  // revés de lo esperado).
  const _fee1EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(feeLabel);
  const _fee2EsGestion = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(fee2Label);
  const _ningunaEsGestion = !_fee1EsGestion && !_fee2EsGestion;
  const feeEnabled = getFeeEnabled() && !(_sinGastosPorCodigoLocal && (_fee1EsGestion || _ningunaEsGestion));
  const feeAmount = getFeeAmount();
  const fee2Enabled = (typeof getFee2Enabled === 'function') && getFee2Enabled() && !(_sinGastosPorCodigoLocal && _fee2EsGestion);
  const fee2Amount = (typeof getFee2Amount === 'function') ? getFee2Amount() : 0;
  discountAmt = discountAmt || 0;
  fidelizacionAmt = fidelizacionAmt || 0;
  let html = cartHtml;
  if (feeEnabled) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#8A6A4E;border-top:1px dashed #F5E6C8;margin-top:8px\"><span>".concat(feeLabel, "</span><span>").concat(feeAmount.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  if (fee2Enabled) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#8A6A4E;border-top:1px dashed #F5E6C8;margin-top:8px\"><span>".concat(fee2Label, "</span><span>").concat(fee2Amount.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  // Enlace para meter el c\u00F3digo de "pedido desde el local" \u2014 se lee el valor
  // actual del campo (si ya exist\u00EDa) para no borrarlo en cada repintado.
  if (getFeeEnabled() && (typeof getLocalFeeCode === 'function') && getLocalFeeCode()) {
    // Se lee del campo de escritorio (fuente de verdad para _modoLocalActivo,
    // incluso cuando el código llega por la URL del QR, no solo al escribirlo
    // aquí en el drawer) para que el móvil siempre refleje el valor real.
    const _codigoLocalActual = (document.getElementById('local-fee-code-input') || {}).value || '';
    const _cajaAbierta = !!_codigoLocalActual || (document.getElementById('drawer-local-fee-code-box') && document.getElementById('drawer-local-fee-code-box').style.display !== 'none');
    html += "<div style=\"padding:4px 0 8px\">"
      + "<a href=\"#\" onclick=\"event.preventDefault();var b=document.getElementById('drawer-local-fee-code-box');b.style.display=b.style.display==='none'?'flex':'none';\" style=\"font-size:11.5px;color:#8A6A4E;text-decoration:underline\">\u00BFEst\u00E1s pidiendo desde el local?</a>"
      + "<div id=\"drawer-local-fee-code-box\" style=\"display:".concat(_cajaAbierta ? 'flex' : 'none', ";gap:6px;margin-top:6px;align-items:center\">")
      + "<input id=\"drawer-local-fee-code-input\" type=\"text\" maxlength=\"8\" placeholder=\"C\u00F3digo\" value=\"".concat(escapeHtml(_codigoLocalActual), "\" oninput=\"this.value=this.value.toUpperCase();document.getElementById('local-fee-code-input').value=this.value;comprobarCodigoLocal()\" style=\"flex:1;padding:8px 10px;border:1.5px solid #F5E6C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;text-transform:uppercase;outline:none\">")
      + "</div><div id=\"drawer-local-fee-code-feedback\" style=\"font-size:11.5px;margin-top:4px\"></div>"
      + "</div>";
  }
  // L\u00EDnea de descuento \u2014 mismo dato que ya calcul\u00F3 renderCart() para el
  // panel de escritorio (#cart-discount-row), para que el drawer m\u00F3vil
  // tambi\u00E9n deje claro por qu\u00E9 el total baj\u00F3 (c\u00F3digo manual o premio
  // ganado en la ruleta/rasca).
  if (discountAmt > 0 && discountCode) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#27855a;font-weight:700\"><span>".concat('Descuento (' + discountCode + ')', "</span><span>-").concat(discountAmt.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  if (conflictoDescuentosNota) {
    html += "<div style=\"font-size:11px;color:#8A6A4E;font-style:italic;padding:2px 0 4px\">".concat(escapeHtml(conflictoDescuentosNota), "</div>");
  }
  if (fidelizacionAmt > 0) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#27855a;font-weight:700\"><span>\uD83C\uDF81 Patata gratis (fidelizaci\u00F3n)</span><span>-".concat(fidelizacionAmt.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  studentDiscountAmt = studentDiscountAmt || 0;
  if (studentDiscountAmt > 0) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#27855a;font-weight:700\"><span>\uD83E\uDEAA Estudiante/jubilado (-".concat(studentDiscountPctCfg, "%)</span><span>-").concat(studentDiscountAmt.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  ofertaTotalAmt = ofertaTotalAmt || 0;
  if (ofertaTotalAmt > 0) {
    html += "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#27855a;font-weight:700\"><span>\u26A1 Oferta rel\u00E1mpago (-".concat(ofertaTotalPct, "%)</span><span>-").concat(ofertaTotalAmt.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  }
  const _ahorroDrawer = discountAmt + fidelizacionAmt + studentDiscountAmt + ofertaTotalAmt;
  if (_ahorroDrawer > 0) {
    html += "<div style=\"margin:2px 0 4px\"><span class=\"cart-savings-pill\">\uD83C\uDF89 \u00A1Ahorras ".concat(_ahorroDrawer.toFixed(2).replace('.', ','), " \u20AC!</span></div>");
  }
  html += "<div class=\"cart-total\" style=\"display:flex;margin-top:12px\"><span>Total</span><span>".concat(total.toFixed(2).replace('.', ','), " \u20AC</span></div>");
  if (ordersOpen) {
    // Si ya sabemos (en memoria) que hay premio activo para el teléfono actual,
    // lo incluimos directamente en el HTML generado para que sobreviva a
    // cualquier repintado del drawer (renderCart se llama muy a menudo: cada
    // minuto, al volver de segundo plano, al cambiar el carrito, etc.)
    // Igual que ya se hacía con el teléfono: leer el valor actual del campo
    // del nombre ANTES de reconstruir el drawer, para que sobreviva al
    // repintado (si no, cualquier actualización de fondo mientras el
    // cliente estaba escribiendo su nombre lo dejaba vacío sin que se
    // notara, y al confirmar el pedido se borraba y saltaba "escribe tu
    // nombre" aunque ya lo hubiera escrito).
    // Si el campo del cajón todavía no existe/está vacío (primer pintado),
    // se cae al valor del formulario de escritorio — así, si se rellenó
    // solo con el nombre/teléfono guardados de una visita anterior (ver
    // init.js), el cajón móvil también sale ya relleno en vez de vacío.
    const _nombreActualDrawer = (document.getElementById('drawer-customer-name') || {}).value || (document.getElementById('customer-name') || {}).value || '';
    const _telActualDrawer = (document.getElementById('drawer-customer-phone') || {}).value || (document.getElementById('customer-phone') || {}).value || '';
    // Mismo motivo que nombre/teléfono arriba — sin esto, la nota escrita
    // se perdía en silencio en cuanto el carrito se volvía a pintar (p.ej.
    // al añadir otro producto o cambiar una cantidad DESPUÉS de escribirla):
    // este textarea se reconstruye entero cada vez, y al no rellenarlo con
    // lo ya escrito, salía vacío otra vez aunque el cliente no lo notara y
    // confirmara el pedido creyendo que la nota seguía puesta.
    const _notasActualDrawer = (document.getElementById('drawer-customer-notes') || {}).value || (document.getElementById('customer-notes') || {}).value || '';
    // El código de descuento antes solo se podía escribir en el panel de
    // escritorio (#discount-input), que está oculto por CSS en móvil — el
    // cajón nunca ofrecía dónde escribirlo, así que un cliente con un
    // código (de un cartel, una publicación, o de un amigo) simplemente no
    // tenía forma de aplicarlo desde el móvil. Mismo motivo que
    // nombre/teléfono/notas arriba para no perder lo ya escrito al
    // repintar: si ya hay un descuento aplicado de verdad (_activeDiscount,
    // p.ej. el premio de la ruleta/rasca, que sí se aplica solo desde
    // cualquier pantalla), se muestra ese código.
    const _codigoActualDrawer = (document.getElementById('drawer-discount-input') || {}).value || (_activeDiscount ? _activeDiscount.code : '') || '';
    const _digitsActualDrawer = _telActualDrawer.replace(/\D/g, '').slice(0, 9);
    const _premioHtml = (window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === _digitsActualDrawer)
      ? "<div id=\"fidelizacion-premio-aviso\" style=\"background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600\">\uD83C\uDF81 \xA1Tienes una patata gratis disponible! A\xF1ade cualquier patata del men\xFA y se aplicar\xE1 el descuento autom\xE1ticamente al confirmar.</div>"
      : (window._fidelizacionProximoSelloActivo && window._fidelizacionProximoSelloActivo === _digitsActualDrawer
        ? "<div id=\"fidelizacion-proximo-sello-aviso\" style=\"background:#FFF3CD;border:1.5px solid #D9A441;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:13px;color:#5a3e1b;font-weight:600\">\uD83C\uDF89 \xA1Este es tu pedido n\xFAmero 10! Al confirmarlo, tu patata gratis estar\xE1 disponible en tu pr\xF3ximo pedido.</div>"
        : '');
    const _studentDiscountHtmlDrawer = studentDiscountEnabledCfg
      ? "<div style=\"margin-top:14px\"><div id=\"drawer-student-discount-box\" style=\"background:#fff;border:1.5px solid ".concat(_estudianteCheckedDrawer ? '#E8943A' : '#F5E6C8', ";border-radius:12px;padding:11px 14px\"><label style=\"display:flex;align-items:center;gap:10px;cursor:pointer\"><input type=\"checkbox\" id=\"drawer-student-discount-checkbox\" ").concat(_estudianteCheckedDrawer ? 'checked' : '', " onchange=\"document.getElementById('student-discount-checkbox').checked=this.checked;renderCart()\" style=\"width:18px;height:18px;flex-shrink:0;accent-color:#3D1F0D\"><span style=\"font-size:13px;color:#3D1F0D;font-weight:600\">\uD83E\uDEAA Soy estudiante o jubilado</span></label><div style=\"display:").concat(_estudianteCheckedDrawer ? 'block' : 'none', ";font-size:12px;color:#8A6A4E;line-height:1.45;margin-top:8px;padding-left:28px\">\u26A0\uFE0F Se pedir\xE1 el carn\xE9 en el mostrador.<br><b style=\"color:#C2711A\">Si no se presenta, el descuento no se aplicar\xE1</b> y se cobrar\xE1 el precio normal.</div></div></div>")
      : '';
    const _discountFeedbackInicialDrawer = _activeDiscount
      ? { color: '#27855a', texto: '✅ Código ' + _activeDiscount.code + ' aplicado — ' + _activeDiscount.pct + '% de descuento' }
      : { color: '', texto: '' };
    const _discountHtmlDrawer = "<div style=\"background:#fff;border:1px solid rgba(61,31,13,.10);border-radius:12px;padding:11px 13px 11px 44px;position:relative;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-top:16px\"><div style=\"position:absolute;left:11px;top:11px;width:24px;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;background:#F5E6C8\">🏷️</div><label style=\"font-size:11px;font-weight:700;color:#3D1F0D;letter-spacing:.08em;text-transform:uppercase;display:block;margin-bottom:6px\">C\xF3digo de descuento (opcional)</label><div style=\"display:flex;gap:8px\"><input id=\"drawer-discount-input\" type=\"text\" placeholder=\"\" style=\"flex:1;padding:9px 12px;border:1px solid rgba(61,31,13,.10);border-radius:9px;font-size:13px;font-family:'DM Sans',sans-serif;text-transform:uppercase;outline:none;background:#fff\" value=\"".concat(_codigoActualDrawer.replace(/"/g, '&quot;'), "\" oninput=\"this.value=this.value.toUpperCase();document.getElementById('discount-input').value=this.value\"><button type=\"button\" onclick=\"dcAplicar(document.getElementById('drawer-discount-input').value)\" style=\"padding:9px 14px;background:#3D1F0D;color:#FFF8EE;border:none;border-radius:9px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif\">Aplicar</button></div><div id=\"drawer-discount-feedback\" style=\"font-size:12px;margin-top:6px;min-height:18px;color:").concat(_discountFeedbackInicialDrawer.color, "\">").concat(_discountFeedbackInicialDrawer.texto, "</div></div>");
    const _recordatorioConfirmarHtml = (window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === _digitsActualDrawer)
      ? "<div style=\"border-radius:10px;padding:8px 12px;background:#FFF3CD;border:1.5px solid #D9A441;margin-top:14px;margin-bottom:-6px;font-size:11.5px;font-weight:700;color:#5a3e1b\">\uD83C\uDF81 No olvides tu patata gratis antes de confirmar</div>"
      : '';
    html += "\n    <div style=\"margin-top:16px\">\n      <div class=\"form-group\">\n        <label>Tu nombre y apellido *</label>\n        <input type=\"text\" id=\"drawer-customer-name\" placeholder=\"\" maxlength=\"60\" autocomplete=\"name\" value=\"".concat(_nombreActualDrawer.replace(/"/g, '&quot;'), "\" oninput=\"document.getElementById('customer-name').value=this.value\">\n      </div>\n      <div class=\"form-group\">\n        <label>Tel\xE9fono</label>\n        <input type=\"tel\" id=\"drawer-customer-phone\" placeholder=\"\" maxlength=\"11\" autocomplete=\"tel\" inputmode=\"tel\" value=\"").concat(_telActualDrawer.replace(/"/g, '&quot;'), "\" oninput=\"formatPhone(this);document.getElementById('customer-phone').value=this.value\">\n        <div id=\"drawer-customer-phone-feedback\" style=\"font-size:11.5px;margin-top:4px;display:none\"></div>\n        ").concat(_premioHtml, "\n        <div style=\"background:#fff;border:1px solid rgba(61,31,13,.10);border-radius:12px;padding:11px 13px 11px 44px;position:relative;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-top:8px\">\n          <div style=\"position:absolute;left:11px;top:11px;width:24px;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;background:#F5E6C8\">\uD83D\uDCF1</div>\n          <p style=\"font-size:12px;font-weight:700;color:#3D1F0D;margin:0\">Se verificar\xE1 tu n\xFAmero por SMS</p>\n          <p style=\"font-size:11.5px;color:#8A6A4E;margin:2px 0 0\">Solo para confirmar el pedido</p>\n          <p style=\"font-size:11.5px;color:#8A6A4E;margin:1px 0 0\">\uD83D\uDD12 No lo compartimos con nadie</p>\n        </div>\n      </div>\n      <div class=\"form-group\">\n        <label>Notas del pedido</label>\n        <textarea id=\"drawer-customer-notes\" placeholder=\"\" maxlength=\"300\" oninput=\"document.getElementById('customer-notes').value=this.value;_actualizarContadorNotas('drawer-customer-notes','drawer-notes-char-count')\">").concat(escapeHtml(_notasActualDrawer), "</textarea>\n        <div id=\"drawer-notes-char-count\" style=\"text-align:right;font-size:11px;color:#8A6A4E;margin-top:2px\">300 caracteres restantes</div>\n      </div>\n      ").concat(_discountHtmlDrawer, "\n      <div id=\"drawer-slot-picker-group\" style=\"display:none;margin-top:14px\">\n        <label style=\"display:block;font-size:12px;font-weight:700;color:#3D1F0D;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px\">\uD83D\uDD50 Hora de recogida *</label>\n        <p style=\"font-size:12px;color:#8A6A4E;margin-bottom:10px\">Los pedidos se preparan por turnos. Elige tu hora de recogida:</p>\n        <div id=\"drawer-slot-grid\" style=\"display:grid;grid-template-columns:1fr 1fr\"></div>\n        <div id=\"drawer-slot-error\" style=\"display:none;font-size:12px;color:#c0392b;margin-top:6px;font-weight:600\">\u26A0\uFE0F Por favor elige una hora de recogida</div>\n      </div>\n      ").concat(_studentDiscountHtmlDrawer, "\n      ").concat(_recordatorioConfirmarHtml, "\n      <button class=\"submit-btn\" onclick=\"submitOrderFromDrawer()\" style=\"margin-top:8px\">\n        Confirmar pedido \u2192\n      </button>\n    </div>");
  } else {
    const lockedMsg = document.getElementById('cart-locked-detail');
    html += "\n    <div style=\"margin-top:16px;background:#3D1F0D;border-radius:12px;padding:20px 16px;text-align:center\">\n      <div style=\"font-size:32px;margin-bottom:8px\">\uD83D\uDD12</div>\n      <div style=\"font-family:'Playfair Display',serif;font-size:17px;font-weight:900;color:#FFF8EE;margin-bottom:6px\">Pedidos cerrados</div>\n      <div style=\"font-size:13px;color:rgba(255,248,238,0.7);line-height:1.5\">".concat(lockedMsg ? lockedMsg.textContent : '', "</div>\n    </div>");
  }
  // El campo de código local (drawer-local-fee-code-input) llama a
  // comprobarCodigoLocal() en cada tecla para actualizar el desglose de
  // gastos al momento — pero como innerHTML sustituye TODO el cuerpo del
  // drawer de golpe, el input con el foco se destruye y se crea uno nuevo
  // en su lugar, así que el teclado del móvil se cerraba a cada dígito.
  // Se guarda qué campo tenía el foco (y la posición del cursor) para
  // devolvérselo al nuevo input justo después de repintar.
  const _focoPrevioEl = document.activeElement;
  const _focoPrevioId = (_focoPrevioEl && drawerBody.contains(_focoPrevioEl)) ? _focoPrevioEl.id : null;
  const _focoPrevioSelStart = (_focoPrevioId && typeof _focoPrevioEl.selectionStart === 'number') ? _focoPrevioEl.selectionStart : null;
  const _focoPrevioSelEnd = (_focoPrevioId && typeof _focoPrevioEl.selectionEnd === 'number') ? _focoPrevioEl.selectionEnd : null;

  drawerBody.innerHTML = html;

  if (_focoPrevioId) {
    const _nuevoFoco = document.getElementById(_focoPrevioId);
    if (_nuevoFoco) {
      _nuevoFoco.focus();
      if (_focoPrevioSelStart !== null && typeof _nuevoFoco.setSelectionRange === 'function') {
        try { _nuevoFoco.setSelectionRange(_focoPrevioSelStart, _focoPrevioSelEnd); } catch (e) {}
      }
    }
  }

  // Sincronizar slot picker en el drawer
  if (ordersOpen) _syncDrawerSlotPicker();

  // Re-pintar aviso de fidelización: innerHTML acaba de destruirlo si existía.
  // Si el teléfono ya está completo (9 dígitos), volvemos a comprobar el premio.
  const drawerPhoneEl = document.getElementById('drawer-customer-phone');
  if (drawerPhoneEl) {
    const digitsNow = drawerPhoneEl.value.replace(/\D/g, '').slice(0, 9);
    if (digitsNow.length === 9 && typeof _comprobarPremioFidelizacion === 'function') {
      _comprobarPremioFidelizacion(digitsNow);
    }
  }
}
function openCartDrawer() {
  window._drawerScrollY = window.scrollY;
  document.getElementById('cart-drawer-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  // Pre-rellenar con datos guardados si los campos están vacíos
  // Pre-rellenar campos del drawer con lo que ya haya en el formulario principal.
  // Así el usuario siempre ve sus datos aunque abra/cierre el drawer varias veces.
  // Se hace con requestAnimationFrame para esperar a que renderCart() genere el DOM.
  requestAnimationFrame(function() {
    var mainName  = document.getElementById('customer-name');
    var mainPhone = document.getElementById('customer-phone');
    var mainNotes = document.getElementById('customer-notes');
    var drawerName  = document.getElementById('drawer-customer-name');
    var drawerPhone = document.getElementById('drawer-customer-phone');
    var drawerNotes = document.getElementById('drawer-customer-notes');
    if (drawerName  && mainName)  drawerName.value  = mainName.value;
    if (drawerPhone && mainPhone) {
      drawerPhone.value = mainPhone.value;
      // Re-comprobar premio de fidelización: el HTML del drawer se reconstruye
      // cada vez que se abre, así que el aviso insertado por formatPhone() se
      // pierde aunque el valor del teléfono se mantenga. Lo regeneramos aquí.
      var digitsSync = drawerPhone.value.replace(/\D/g, '').slice(0, 9);
      if (digitsSync.length === 9 && typeof _comprobarPremioFidelizacion === 'function') {
        _comprobarPremioFidelizacion(digitsSync);
      } else {
        try {
          var savedPhone = localStorage.getItem('dpf_customer_phone');
          if (savedPhone && typeof _comprobarPremioFidelizacion === 'function') _comprobarPremioFidelizacion(savedPhone);
        } catch {}
      }
    }
    if (drawerNotes && mainNotes) drawerNotes.value = mainNotes.value;
  });
  // Recargar config de slots desde Firebase y luego sincronizar
  if (window.fb_loadSlotConfig) {
    window.fb_loadSlotConfig().then(function (cfg) {
      if (cfg) {
        if (cfg.turnos) localStorage.setItem(SLOT_TURNOS_KEY, JSON.stringify(cfg.turnos));
        if (cfg.max) localStorage.setItem(SLOT_MAX_KEY, String(cfg.max));
      }
      renderSlotPicker();
      _syncDrawerSlotPicker();
      loadOrdersStatus();
      checkAutoCloseWarning();
    }).catch(function () {
      renderSlotPicker();
      _syncDrawerSlotPicker();
    });
  } else {
    renderSlotPicker();
    _syncDrawerSlotPicker();
  }
}
function _syncDrawerSlotPicker() {
  const srcGroup = document.getElementById('slot-picker-group');
  const dstGroup = document.getElementById('drawer-slot-picker-group');
  const dstGrid = document.getElementById('drawer-slot-grid');
  if (!srcGroup || !dstGroup || !dstGrid) return;
  const needsSlot = srcGroup.style.display !== 'none';
  dstGroup.style.display = needsSlot ? 'block' : 'none';
  if (!needsSlot) return;

  // Copiar el grid de slots
  const srcGrid = document.getElementById('slot-grid');
  if (srcGrid) dstGrid.innerHTML = srcGrid.innerHTML;

  // Resaltar el slot seleccionado si ya hay uno
  if (selectedSlot) {
    const btn = dstGrid.querySelector('#slotbtn-' + selectedSlot.replace(':', '-'));
    if (btn) {
      btn.classList.add('slot-selected');
      btn.style.background = '#3D1F0D';
      btn.style.borderColor = '#3D1F0D';
      btn.style.color = '#FFF8EE';
    }
  }

  // Los botones del drawer llaman a selectSlot igual que los del panel principal
  dstGrid.querySelectorAll('.slot-btn:not([disabled])').forEach(btn => {
    btn.onclick = function () {
      const slot = btn.querySelector('span').textContent;
      selectSlot(slot);
      // Sincronizar selección visual en drawer
      dstGrid.querySelectorAll('.slot-btn').forEach(b => {
        b.classList.remove('slot-selected');
        b.style.background = '';
        b.style.borderColor = '';
        b.style.color = '';
      });
      btn.classList.add('slot-selected');
      btn.style.background = '#3D1F0D';
      btn.style.borderColor = '#3D1F0D';
      btn.style.color = '#FFF8EE';
      if (document.getElementById('drawer-slot-error')) {
        document.getElementById('drawer-slot-error').style.display = 'none';
      }
    };
  });
}
function closeCartDrawer() {
  document.getElementById('cart-drawer-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
  window.scrollTo(0, window._drawerScrollY || 0);
  // Si el usuario cierra el drawer sin confirmar, los campos del formulario
  // principal pueden tener valores del drawer que el usuario no ve.
  // Los limpiamos SOLO si el formulario principal está vacío visualmente
  // (es decir, el usuario no había escrito nada en él directamente).
  // La heurística: si el campo principal tiene valor pero el drawer YA NO
  // existe en DOM (se regenera al abrir), sincronizar hacia el principal
  // no tiene sentido — lo más seguro es NO limpiar para no perder lo que
  // el usuario escribió en el drawer antes de cerrarlo.
  // Lo que SÍ hacemos: al ABRIR el drawer, pre-rellenar sus campos con
  // lo que haya en el formulario principal (ver openCartDrawer patch).
}
function submitOrderFromDrawer() {
  var n = document.getElementById('drawer-customer-name');
  var p = document.getElementById('drawer-customer-phone');
  var t = document.getElementById('drawer-customer-notes');
  if (n) document.getElementById('customer-name').value = n.value;
  if (p) document.getElementById('customer-phone').value = p.value;
  if (t) document.getElementById('customer-notes').value = t.value;
  // No cerramos el drawer aquí: si falta un dato, _alertaConFoco necesita
  // que siga abierto para resaltar el campo correcto (drawer-customer-*).
  // Se cierra solo al confirmar con éxito, desde showSuccess().
  submitOrder();
}
function removeItem(id) {
  delete cart[id];
  renderMenu();
  renderCart();
}

// Quita del carrito cualquier producto que ya no exista en MENU (borrado o
// con el id cambiado desde el panel de admin mientras el cliente lo tenía
// añadido) — devuelve cuántos se han quitado, para que submitOrder() pueda
// avisar en vez de enviarlos igualmente.
function _limpiarItemsCarritoInvalidos() {
  let quitados = 0;
  Object.keys(cart).forEach(id => {
    if (!MENU.find(m => m.id == id)) { delete cart[id]; quitados++; }
  });
  Object.keys(custCart).forEach(key => {
    const c = custCart[key];
    if (c && c.qty > 0 && !MENU.find(m => m.id == c.menuId)) { delete custCart[key]; quitados++; }
  });
  Object.keys(extrasCart).forEach(key => {
    const c = extrasCart[key];
    if (c && c.qty > 0 && !MENU.find(m => m.id == c.menuId)) { delete extrasCart[key]; quitados++; }
  });
  return quitados;
}

// ── Recuperar un pedido que se quedó a medio enviar ──────────────────────
// Si el cliente cierra la pestaña, pierde la conexión o el navegador se
// bloquea justo después de confirmar (antes de que llegara la respuesta de
// guardar-pedido.php), el pedido podía perderse sin más rastro que un
// aviso interno. Ahora, al volver a abrir la web, se comprueba si quedó
// un pedido a medias y se reenvía solo — es seguro reenviarlo aunque el
// primer intento sí hubiera llegado a guardarse, porque el servidor
// responde éxito (no error) si el ticket ya existe con el mismo teléfono.
async function _recuperarPedidoEnCurso() {
  let raw;
  try { raw = localStorage.getItem('dpf_pedido_en_curso'); } catch (e) { return; }
  if (!raw) return;
  let marcador;
  try { marcador = JSON.parse(raw); } catch (e) { try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e2) {} return; }
  // Margen de seguridad: pasadas 2 horas ya no tiene sentido reintentar
  // (el cliente hace tiempo que se fue) — se descarta para no reenviar
  // pedidos viejísimos que ya nadie espera.
  if (!marcador || !marcador.payload || !marcador.ts || (Date.now() - marcador.ts) > 2 * 60 * 60 * 1000) {
    try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e) {}
    return;
  }
  try {
    const res = await _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(marcador.payload)
    }, 10000);
    const data = await res.json();
    try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e) {}
    if (data.success) {
      console.log('[recuperación] Pedido ' + marcador.orderNum + ' recuperado tras un cierre inesperado');
      _ocultarAvisoFalloGuardado(marcador.orderNum);
    } else {
      console.warn('[recuperación] Pedido ' + marcador.orderNum + ' rechazado al reintentar:', data.error);
    }
  } catch (e) {
    // Sigue sin red — se deja el marcador para reintentar la próxima vez
    // que se abra la web (o en cuanto vuelva la conexión, ver más abajo).
    console.warn('[recuperación] sin conexión, se reintentará más tarde', e);
  }
}
// Si el pedido no se pudo guardar por falta de conexión (no porque se
// cerrara la pestaña) y el cliente se queda esperando en la misma pantalla
// de éxito, antes había que recargar la página para que se reintentara
// solo. Ahora se reintenta en cuanto el navegador detecta que ha vuelto la
// conexión — y también cada 20s por si acaso, porque en redes con
// cobertura intermitente a veces no llega a dispararse el evento 'online'
// (el navegador nunca se considera del todo "offline", solo dan timeout
// las peticiones una a una).
window.addEventListener('online', () => { _recuperarPedidoEnCurso(); });
setInterval(() => {
  let hayPendiente;
  try { hayPendiente = !!localStorage.getItem('dpf_pedido_en_curso'); } catch (e) { return; }
  if (hayPendiente) _recuperarPedidoEnCurso();
}, 20000);
// Complementa a _avisarClienteFalloGuardado (que muestra el aviso) — al
// recuperarse solo el pedido, si el cliente sigue viendo la pantalla de
// éxito de ESE mismo pedido, se le quita el aviso de que algo falló.
function _ocultarAvisoFalloGuardado(orderNum) {
  const successVisible = document.getElementById('success-screen')?.style.display === 'block';
  const mismoNum = document.getElementById('order-num-display')?.textContent === String(orderNum);
  if (!successVisible || !mismoNum) return;
  const warning = document.getElementById('success-save-warning');
  if (warning) warning.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', () => { setTimeout(_recuperarPedidoEnCurso, 1500); });


// ── Seguridad: escapar datos de usuario antes de insertar en innerHTML ──
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
// Escapa un string para usarlo de forma segura dentro de un atributo onclick="f('VALOR')"
function escapeAttr(str) {
  return escapeHtml(String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
}

// Si el nombre del producto lleva el emoji 🆕, lo quita y pone en su lugar
// una insignia "Nuevo" en rojo, integrada con la marca (en vez del icono azul de móvil).
function formatNombreConBadgeNuevo(nombre) {
  if (!nombre) return '';
  if (nombre.indexOf('🆕') === -1) return escapeHtml(nombre);
  const limpio = nombre.replace('🆕', '').trim();
  return escapeHtml(limpio) + ' <span style="display:inline-block;font-family:\'Oswald\',sans-serif;font-weight:700;font-size:9px;color:#fff;background:#C0392B;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;vertical-align:middle">Nuevo</span>';
}

// Genera número de pedido reservándolo en el servidor (guardar-pedido.php,
// cuenta de servicio) para evitar colisiones entre pedidos simultáneos.
// Antes el propio navegador escribía directo en usedOrderNums/ vía la SDK
// de Firebase, lo que exigía dejar esa escritura abierta a cualquier
// visitante anónimo en las reglas — cualquiera podía rellenar
// usedOrderNums/<fecha>/ sin llegar a pedir nada.
// Fallback a aleatorio solo si el servidor no responde.
async function generateOrderNumber() {
  try {
    const res = await _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reservarNumeroPedido' })
    }, 8000);
    const data = await res.json();
    if (data.success && data.orderNum) return data.orderNum;
    console.warn('[orderNum] reserva en servidor falló:', data.error);
  } catch (e) {
    console.warn('[orderNum] fetch error:', e);
  }
  return 'T' + (Math.floor(Math.random() * 9000) + 1000);
}
function buildTicketText(orderNum, name, phone, notes, slotTime, orderTotal, feeAmount, discountAmt, discountCode, fidelizacionDescuento, ofertaTotalAmt, ofertaTotalPct) {
  const tc = getTicketConfig();
  const lines = Object.entries(cart).map(_ref5 => {
    let _ref6 = _slicedToArray(_ref5, 2),
      id = _ref6[0],
      qty = _ref6[1];
    const item = MENU.find(m => m.id == id);
    if (!item) {
      console.error('buildTicketText: producto no encontrado id=' + id);
      return '';
    }
    return "".concat(qty, "x ").concat(item.name, " \u2014 ").concat((_precioConOferta(item) * qty).toFixed(2), " \u20AC");
  });
  const custLines = Object.values(custCart).filter(c => c.qty > 0).map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('buildTicketText: producto custom no encontrado menuId=' + c.menuId);
      return '';
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    const details = [...c.sauces.map(s => 'Extra salsa ' + s), ...c.ingredients.map(i => 'Extra ' + i)].join(', ');
    const extrasStr = [c.extraQueso ? 'Extra Queso' : '', c.extraGratinado ? 'Gratinado' : ''].filter(Boolean).join(' + ');
    return c.qty + 'x ' + item.name + ' [' + details + (extrasStr ? ' + ' + extrasStr : '') + '] — ' + (unitPrice * c.qty).toFixed(2) + ' €';
  });
  const extLines2 = Object.values(extrasCart).filter(c => c.qty > 0).map(c => {
    return "".concat(c.qty, "x ").concat(getExtrasItemLabel(c), " \u2014 ").concat((getExtrasItemPrice(c) * c.qty).toFixed(2), " \u20AC");
  });
  const allLines = [...lines, ...custLines, ...extLines2];
  // El total final se recibe ya calculado desde submitOrder() (orderTotal)
  // en vez de recalcularse aqu\u00ED desde cero \u2014 antes este texto sumaba solo
  // los productos, sin aplicar gastos de gesti\u00F3n, c\u00F3digo de descuento ni
  // premio de fidelizaci\u00F3n, as\u00ED que el "TOTAL:" del ticket enviado por
  // email pod\u00EDa no coincidir con lo que de verdad se cobra.
  const itemsSubtotal = Object.entries(cart).reduce((s, _ref7) => {
    let _ref8 = _slicedToArray(_ref7, 2),
      id = _ref8[0],
      q = _ref8[1];
    const it = MENU.find(m => m.id == id);
    return s + (it ? _precioConOferta(it) * q : 0);
  }, 0) + Object.values(custCart).filter(c => c.qty > 0).reduce((s, c) => {
    const it = MENU.find(m => m.id == c.menuId);
    if (!it) return s;
    const up = it.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    return s + up * c.qty;
  }, 0) + Object.values(extrasCart).filter(c => c.qty > 0).reduce((s, c) => s + getExtrasItemPrice(c) * c.qty, 0);
  const total = typeof orderTotal === 'number' ? orderTotal : itemsSubtotal;
  const extraLineas = [];
  if (feeAmount > 0) extraLineas.push('Gastos de gesti\u00F3n: +' + feeAmount.toFixed(2) + ' \u20AC');
  if (discountAmt > 0) extraLineas.push('Descuento' + (discountCode ? ' (' + discountCode + ')' : '') + ': -' + discountAmt.toFixed(2) + ' \u20AC');
  if (ofertaTotalAmt > 0) extraLineas.push('Oferta rel\u00E1mpago (-' + ofertaTotalPct + '%): -' + ofertaTotalAmt.toFixed(2) + ' \u20AC');
  if (fidelizacionDescuento > 0) extraLineas.push('Patata gratis (fidelizaci\u00F3n): -' + fidelizacionDescuento.toFixed(2) + ' \u20AC');
  const extraLineasTxt = extraLineas.length ? extraLineas.join('\n') + '\n' : '';
  const now = new Date().toLocaleString('es-ES');
  const phoneCleanTxt = (phone || '').replace(/\D/g, '');
  const avisoSelloTxt = (window._fidelizacionProximoSelloActivo && window._fidelizacionProximoSelloActivo === phoneCleanTxt)
    ? "\n>>> 10\u00BA SELLO COMPLETADO. Avisar: premio disponible pr\u00F3ximo pedido <<<\n"
    : "";
  return "\n============================\n   ".concat(tc.nombre, "\n============================\nPEDIDO: ").concat(orderNum, "\nFecha: ").concat(now, "\n----------------------------\nCLIENTE: ").concat(name, "\n").concat(phone ? "Tel: " + phone : "", "\n----------------------------\nPRODUCTOS:\n").concat(allLines.join('\n'), "\n----------------------------\n").concat(extraLineasTxt, "TOTAL: ").concat(total.toFixed(2), " \u20AC\n  (").concat(tc.textoPago, ")\n----------------------------\n").concat(slotTime ? "RECOGIDA PATATA: " + slotTime + "h" : "", "\n").concat(notes ? "NOTAS: " + notes : "Sin notas", "\n").concat(avisoSelloTxt, "============================\n  ").trim();
}

// ══════════════════════════════════════════
//  SISTEMA DE TURNOS DE RECOGIDA (DINÁMICO)
// ══════════════════════════════════════════
const SLOT_TURNOS_KEY = 'dpf_slot_turnos';
const SLOT_MAX_KEY = 'dpf_slot_max';

// Turnos por defecto si no hay nada guardado
const DEFAULT_TURNOS = [{
  start: '19:30',
  end: '23:30',
  interval: 30
}];
function getSlotTurnos() {
  try {
    const t = JSON.parse(localStorage.getItem(SLOT_TURNOS_KEY));
    if (Array.isArray(t) && t.length > 0) return t;
  } catch {}
  return DEFAULT_TURNOS;
}
function getSlotMax() {
  return parseInt(localStorage.getItem(SLOT_MAX_KEY) || '4', 10);
}

// Para compatibilidad con código legacy que usa SLOT_MAX directamente
function getSlotMaxVal() {
  return getSlotMax();
}

// Genera lista de todos los slots de todos los turnos activos
function getSlots() {
  const turnos = getSlotTurnos();
  const slots = [];
  turnos.forEach(turno => {
    const _turno$start$split$ma = turno.start.split(':').map(Number),
      _turno$start$split$ma2 = _slicedToArray(_turno$start$split$ma, 2),
      sh = _turno$start$split$ma2[0],
      sm = _turno$start$split$ma2[1];
    let _turno$end$split$map = turno.end.split(':').map(Number),
      _turno$end$split$map2 = _slicedToArray(_turno$end$split$map, 2),
      eh = _turno$end$split$map2[0],
      em = _turno$end$split$map2[1];
    const interval = turno.interval || 30;
    // Si el cierre cruza la medianoche (end <= start), sumar 24h al end
    let endMins = eh * 60 + em;
    const startMins = sh * 60 + sm;
    if (endMins <= startMins) endMins += 1440;
    // Guardia anti-bucle infinito: máximo 96 slots por turno (24h / 15min)
    let count = 0;
    let curMins = startMins;
    while (curMins <= endMins && count < 96) {
      const hh = Math.floor(curMins / 60) % 24;
      const mm = curMins % 60;
      const slot = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
      if (!slots.includes(slot)) slots.push(slot);
      curMins += interval;
      count++;
    }
  });
  slots.sort();
  return slots;
}

// Alias para compatibilidad — ahora SLOT_MAX es dinámico
const SLOT_START_H = 19,
  SLOT_START_M = 30; // solo para referencia legacy
const SLOT_END_H = 23,
  SLOT_END_M = 30;
let SLOT_MAX = getSlotMax(); // sincronizado con localStorage

// Lee ocupación de slots guardada en localStorage (por día)
// ── Slots: in-memory cache synced from Firebase ──
let _slotsCache = {}; // { slotTime: count }

function getSlotsData() {
  const todayKey = new Date().toISOString().slice(0, 10);
  // Contar siempre desde pedidos reales (fuente de verdad)
  let stats;
  try { stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { stats = {}; }
  const realSlots = {};
  if (stats && stats.date === todayKey) {
    (stats.orders || []).forEach(o => {
      const s = o.slot ? o.slot.trim() : null;
      if (s) realSlots[s] = (realSlots[s] || 0) + 1;
    });
  }
  // Usar el máximo entre Firebase y pedidos reales
  // para que un slot nunca quede liberado aunque se cancele un pedido
  if (Object.keys(_slotsCache).length > 0) {
    const merged = Object.assign({}, _slotsCache);
    Object.entries(realSlots).forEach(([slot, count]) => {
      merged[slot] = Math.max(merged[slot] || 0, count);
    });
    return { date: todayKey, slots: merged };
  }
  return { date: todayKey, slots: realSlots };
}
function saveSlotsData(data) {
  _slotsCache = data.slots || {};
  localStorage.setItem(SLOTS_KEY, JSON.stringify(data)); // fallback
}
function getSlotCount(slotTime) {
  // Count from actual orders for accuracy
  const todayKey = new Date().toISOString().slice(0, 10);
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
  } catch {
    stats = {};
  }
  if (!stats || stats.date !== todayKey) return _slotsCache[slotTime] || 0;
  const slot = slotTime ? slotTime.trim() : slotTime;
  return (stats.orders || []).filter(o => o.slot && o.slot.trim() === slot).length;
}
// Devuelve true/false según si la reserva real (atómica, con cuenta de
// servicio) se hizo de verdad — antes esto se llamaba ya con el pedido
// confirmado en pantalla (showSuccess(), ver antifraude.js) y una respuesta
// negativa no se comunicaba a nadie: el turno se podía sobrevender de
// verdad si varios clientes pasaban a la vez la comprobación "blanda"
// anterior (solo una lectura, sin reservar nada) antes de que ninguno
// llegara a reservar. Ahora se llama ANTES de guardar el pedido (ver
// submitOrder) y si falla, se aborta el pedido igual que antes se abortaba
// con la comprobación blanda — así el hueco no se puede sobrevender.
async function incrementSlot(slotTime) {
  // Update local cache immediately for UI responsiveness
  _slotsCache[slotTime] = (_slotsCache[slotTime] || 0) + 1;
  // Reservar en el servidor (guardar-pedido.php, cuenta de servicio) — antes
  // se escribía directo en Firebase (fb_incrementSlot), lo que exigía dejar
  // slots/ abierto a escritura anónima en las reglas.
  try {
    const resp = await _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reservarSlot', slotTime })
    }, 8000);
    // Antes solo se comprobaba que la petición no lanzara una excepción de
    // red — si el servidor respondía 200 con {"success":false} (turno
    // lleno, fallo al escribir tras los reintentos...) no se detectaba, y
    // el incremento optimista de arriba se quedaba puesto para siempre en
    // este dispositivo aunque la reserva real nunca hubiera cuajado en
    // Firebase, mostrando el turno más ocupado de lo que está de verdad.
    const data = await resp.json().catch(() => null);
    if (!data || !data.success) {
      _slotsCache[slotTime] = Math.max(0, (_slotsCache[slotTime] || 0) - 1);
      saveSlotsData(getSlotsData());
      console.warn('Slot reserve rejected by server', data && data.error);
      return false;
    }
    return true;
  } catch (e) {
    // Fallo de red/timeout: deshacer el incremento optimista en vez de
    // dejarlo inflado — no sabemos si la reserva llegó a cuajar en el
    // servidor, pero es más seguro infravalorar la ocupación local (el
    // máximo con los pedidos reales en getSlotsData() sigue protegiendo de
    // mostrar menos ocupación de la real) que sobrevalorarla para siempre.
    _slotsCache[slotTime] = Math.max(0, (_slotsCache[slotTime] || 0) - 1);
    saveSlotsData(getSlotsData());
    console.warn('Slot reserve error', e);
    // Fallo de red (no "turno lleno" confirmado): dejar pasar el pedido en
    // vez de bloquearlo — es mejor arriesgarse a una sobreventa puntual por
    // un fallo de conexión que impedir pedidos legítimos porque el propio
    // aviso de reserva no llegó a viajar.
    return true;
  }
}
async function decrementSlot(slotTime) {
  if (!slotTime) return;
  // Solo actualiza la caché local (_slotsCache/localStorage) para que este
  // mismo dispositivo vea el turno libre al instante. La liberación real en
  // Firebase la hace el servidor (guardar-pedido.php, acción
  // "cancelarPedido") con la cuenta de servicio — el navegador nunca tuvo
  // permiso de escritura directa sobre slots/ (por eso ya no existe
  // fb_decrementSlot: se quitó junto con fb_incrementSlot al mover la
  // reserva de turnos al servidor, ver incrementSlot() arriba).
  _slotsCache[slotTime] = Math.max(0, (_slotsCache[slotTime] || 0) - 1);
  saveSlotsData(getSlotsData());
}

// ¿El carrito tiene patatas?
function cartHasPatatas() {
  const reg = Object.keys(cart).some(id => {
    const item = MENU.find(m => m.id == id);
    return item && item.cat === 'Patatas';
  });
  const cust = Object.values(custCart).some(c => {
    const item = MENU.find(m => m.id == c.menuId);
    return c.qty > 0 && item && item.cat === 'Patatas';
  });
  // extrasCart también puede contener patatas completas (con queso/gratinado/
  // ingredientes extra personalizados), no solo complementos sueltos.
  const extras = Object.values(extrasCart).some(c => {
    const item = MENU.find(m => m.id == c.menuId);
    return c.qty > 0 && item && item.cat === 'Patatas';
  });
  return reg || cust || extras;
}

// ¿El carrito tiene algún producto?
function cartHasAnyItem() {
  return Object.keys(cart).length > 0 || Object.values(custCart).some(c => c.qty > 0) || Object.values(extrasCart).some(c => c.qty > 0);
}

// ¿Estamos en horario de turnos? Siempre activo — los slots pasados se deshabilitan solos
function isSlotHour() {
  return true;
}

// ¿El slot ya pasó?
// Compara minutos dentro del mismo "día de servicio" (hasta las 06:00 del día siguiente)
// para manejar correctamente turnos que cruzan la medianoche.
function slotIsPast(slotTime) {
  const now = new Date();
  const _slotTime$split$map = slotTime.split(':').map(Number),
    _slotTime$split$map2 = _slicedToArray(_slotTime$split$map, 2),
    sh = _slotTime$split$map2[0],
    sm = _slotTime$split$map2[1];
  // Normalizar al "día de servicio": horas 0-5 se tratan como 24-29
  const SERVICE_DAY_CUTOFF = 6 * 60; // 06:00
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const slotMins = sh * 60 + sm;
  const nowAdj = nowMins < SERVICE_DAY_CUTOFF ? nowMins + 1440 : nowMins;
  const slotAdj = slotMins < SERVICE_DAY_CUTOFF ? slotMins + 1440 : slotMins;
  return nowAdj > slotAdj;
}

// Renderiza el selector de slots en el formulario
function renderSlotPicker() {
  const group = document.getElementById('slot-picker-group');
  if (!group) return;
  // Con el código local activo (cliente en tienda, llegó por el QR del
  // mostrador) el pedido se prepara para ahora mismo — no tiene sentido
  // hacerle elegir un turno futuro, así que se salta el selector entero.
  const enTienda = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const needsSlot = cartHasAnyItem() && isSlotHour() && !enTienda;
  group.style.display = needsSlot ? 'block' : 'none';
  if (!needsSlot) {
    return;
  }
  const slots = getSlots();
  const slotsData = getSlotsData();
  const slotMax = getSlotMax();
  let html = '';
  // Calcular plazas extra absorbidas: SOLO del slot inmediatamente anterior
  const extraPlazas = {};
  slots.forEach((slot, i) => {
    if (i === 0) return;
    const prevSlot = slots[i - 1];
    const prevCount = slotsData.slots[prevSlot] || 0;
    const prevPast = slotIsPast(prevSlot);
    const currPast = slotIsPast(slot);
    // Solo transferir si: el anterior ya pasó Y el actual aún no ha pasado
    if (prevPast && !currPast) {
      const sobrantes = Math.max(0, slotMax - prevCount);
      if (sobrantes > 0) extraPlazas[slot] = sobrantes;
    }
  });
  // Aviso de saturación moderada activo: empuja la selección hacia turnos
  // más tarde (en vez de amontonar todo en el más próximo) tratando como
  // "saturados" los que caen dentro de los próximos X minutos — pero solo
  // si queda al menos un turno libre más allá de ese margen, para no dejar
  // a nadie sin ningún turno donde poder elegir.
  const _nowMinsGlobal = (() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); })();
  const _avisoCfg = (typeof getAvisoSaturacionConfig === 'function') ? getAvisoSaturacionConfig() : null;
  let _saturacionSlotsActiva = !!(window._saturacionAvisoActiva && _avisoCfg && _avisoCfg.minutosSalto > 0);
  if (_saturacionSlotsActiva) {
    const hayTurnoLibreTrasSalto = slots.some(slot => {
      const m = slot.split(':').map(Number);
      const slotMins = m[0] * 60 + m[1];
      if (slotMins - _nowMinsGlobal < _avisoCfg.minutosSalto) return false;
      return !slotIsPast(slot) && (slotsData.slots[slot] || 0) < slotMax;
    });
    if (!hayTurnoLibreTrasSalto) _saturacionSlotsActiva = false;
  }
  slots.forEach(slot => {
    const count = slotsData.slots[slot] || 0;
    const extra = extraPlazas[slot] || 0;
    const effectiveMax = slotMax + extra;
    const full = count >= effectiveMax;
    const almostFull = !full && count === effectiveMax - 1;
    const past = slotIsPast(slot);
    const nowMs = new Date();
    const nowMinsSlot = nowMs.getHours() * 60 + nowMs.getMinutes();
    const _slot$split$map = slot.split(':').map(Number),
      _slot$split$map2 = _slicedToArray(_slot$split$map, 2),
      slotH = _slot$split$map2[0],
      slotM = _slot$split$map2[1];
    const slotTotalMins = slotH * 60 + slotM;
    const saturado = !full && !past && _saturacionSlotsActiva && (slotTotalMins - nowMinsSlot) < _avisoCfg.minutosSalto;
    const disabled = full || past || saturado;
    const pct = Math.min(100, Math.round(count / effectiveMax * 100));
    const color = full ? '#e74c3c' : almostFull ? '#e74c3c' : pct >= 50 ? '#3D1F0D' : '#5ECC76';
    const libres = effectiveMax - count;
    const availableLabel = full ? '❌ Completo' : past ? 'Pasado' : saturado ? '⏳ Elige más tarde' : almostFull ? '⚠️ ¡Solo queda 1!' : libres + ' libre' + (libres !== 1 ? 's' : '') + (extra > 0 ? ' (+' + extra + ')' : '');
    const isLateSlot = !disabled && slotTotalMins - nowMinsSlot <= 5;
    const btnBg = disabled ? 'background:#f5f5f5;border-color:#ccc;' : isLateSlot ? 'background:#fffbe6;border-color:#f0c040;' : full ? 'background:#fff0f0;border-color:#e74c3c;' : pct >= 75 ? 'background:rgba(244,196,48,0.08);border-color:#3D1F0D;' : 'background:#FFF8EE;border-color:#E8D5B0;';
    html += '<button type="button"' + ' class="slot-btn ' + (disabled ? 'slot-disabled' : '') + '"' + ' id="slotbtn-' + slot.replace(':', '-') + '"' + ' onclick="' + (disabled ? '' : 'selectSlot(\'' + slot + '\')') + '"' + (disabled ? ' disabled' : '') + ' style="' + btnBg + '"' + ' title="' + (full ? 'Turno completo' : past ? 'Hora pasada' : saturado ? 'Hay bastante ambiente ahora mismo, elige un turno más tarde' : count + '/' + slotMax + ' plazas') + '">' + '<span style="font-size:17px;font-weight:900">' + slot + '</span>' + (isLateSlot ? '<span style="font-size:10px;font-weight:700;color:#b45a00">⚠️ cierre del turno</span>' : '') + '<span style="font-size:13px;color:' + (disabled ? '#aaa' : color) + ';font-weight:600">' + availableLabel + '</span>' + (almostFull ? '<span style="font-size:10px;color:#c0392b;font-weight:700;margin-top:2px">¡Solo queda 1 pedido disponible en esta franja!</span>' : '') + '<div style="height:4px;border-radius:99px;background:#eee;margin-top:4px;overflow:hidden">' + '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:99px;transition:width .3s"></div></div>' + '</button>';
  });
  document.getElementById('slot-grid').innerHTML = html;
}
let selectedSlot = null;
function selectSlot(slot) {
  selectedSlot = slot;
  document.getElementById('slot-error').style.display = 'none';
  document.querySelectorAll('.slot-btn').forEach(b => {
    b.classList.remove('slot-selected');
    b.style.background = '';
    b.style.borderColor = '';
    b.style.color = '';
  });
  const btn = document.getElementById('slotbtn-' + slot.replace(':', '-'));
  if (btn) {
    btn.classList.add('slot-selected');
    btn.style.background = '#3D1F0D';
    btn.style.borderColor = '#3D1F0D';
    btn.style.color = '#fff';
  }

  // Aviso franja poco margen ahora es inline en el botón
}

// Precio a descontar por el premio de fidelización activo (patata gratis) —
// la patata más cara del carrito, en beneficio del cliente. Compartida entre
// el total mostrado mientras se compra (renderCart(), en carta.js) y el del
// pedido final (submitOrder(), aquí abajo) para que nunca puedan mostrar
// cifras distintas — antes solo se calculaba aquí, así que el total del
// carrito no bajaba hasta confirmar el pedido, igual que pasaba con los
// códigos de descuento manuales antes de arreglarlo.
function getFidelizacionDescuento(phoneClean) {
  if (!window._fidelizacionPremioActivo || window._fidelizacionPremioActivo !== phoneClean) return 0;
  const preciosPatatasRegular = Object.entries(cart).map(([id, q]) => {
    const it = MENU.find(m => m.id == id);
    return it && typeof it.name === 'string' && it.name.trim().toLowerCase().startsWith('patata') && q > 0 ? it.price : 0;
  });
  const preciosPatatasCustom = Object.values(custCart).map(c => {
    const it = MENU.find(m => m.id == c.menuId);
    if (!it || it.cat !== 'Patatas' || !(c.qty > 0)) return 0;
    return it.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
  });
  const preciosPatatasExtras = Object.values(extrasCart).map(c => {
    const it = MENU.find(m => m.id == c.menuId);
    if (!it || it.cat !== 'Patatas' || !(c.qty > 0)) return 0;
    return getExtrasItemPrice(c);
  });
  const todosLosPrecios = [...preciosPatatasRegular, ...preciosPatatasCustom, ...preciosPatatasExtras];
  return todosLosPrecios.length ? Math.max(...todosLosPrecios) : 0;
}
// Guarda contra doble envío — antes el botón "Confirmar pedido" no se
// deshabilitaba hasta después de varias llamadas de red seguidas (lista
// negra, cooldown, turnos, número de pedido), así que un doble-toque en
// una conexión lenta podía lanzar dos submitOrder() a la vez: dos números
// de pedido reservados, dos emails de confirmación, y _pendingOrderData/
// _pendingTicketData del segundo pisando los del primero en mitad del
// proceso, todo para lo que el cliente vivió como un único clic.
let _submitOrderEnCurso = false;
async function submitOrder() {
  if (_submitOrderEnCurso) return;
  _submitOrderEnCurso = true;
  try {
    await _submitOrderInner();
  } finally {
    _submitOrderEnCurso = false;
  }
}
async function _submitOrderInner() {
  // Gate de config crítica (gastos de gestión, bolsa, código local) — ver
  // comentario junto a esperarConfigCriticaLista() en admin-config.js. En
  // el caso normal esta espera ya está resuelta y esto no tarda nada; solo
  // se nota (y se avisa en el botón) en una visita nueva/muy rápida.
  if (typeof esperarConfigCriticaLista === 'function' && !(window._feeConfigListo && window._fee2ConfigListo && window._localCodeListo && window._studentDiscountConfigListo)) {
    const btnGate = document.getElementById('submit-btn');
    const prevGateText = btnGate ? btnGate.textContent : null;
    const prevGateDisabled = btnGate ? btnGate.disabled : false;
    if (btnGate) { btnGate.disabled = true; btnGate.textContent = 'Comprobando datos…'; }
    await esperarConfigCriticaLista(4000);
    if (btnGate && prevGateText !== null) { btnGate.disabled = prevGateDisabled; btnGate.textContent = prevGateText; }
  }
  // Si el admin borra o renombra un producto justo mientras un cliente lo
  // tiene en el carrito, antes se descartaba en silencio al enviar el
  // pedido (solo quedaba un console.error) — el cliente no se enteraba de
  // que su pedido había cambiado hasta recogerlo. Ahora se detecta antes
  // de seguir, se quita del carrito y se avisa claramente, dejando el
  // carrito abierto para que pueda revisar/completar el pedido en vez de
  // confirmarlo tal cual con algo menos sin saberlo.
  if (typeof _limpiarItemsCarritoInvalidos === 'function') {
    const _quitados = _limpiarItemsCarritoInvalidos();
    if (_quitados > 0) {
      renderMenu();
      renderCart();
      showAlert('Uno de los productos de tu pedido ya no está disponible y se ha quitado del carrito. Revisa tu pedido antes de confirmar.');
      if (typeof openCartDrawer === 'function') openCartDrawer();
      return;
    }
  }
  // Igual que ya hace changeQty() al añadir al carrito — antes esta función
  // nunca comprobaba el horario/vacaciones/pausa al confirmar, así que si
  // el formulario ya estaba abierto cuando la tienda cerraba, el pedido se
  // enviaba igual (el servidor ahora también lo rechaza, esto es solo para
  // avisar al momento sin esperar la respuesta).
  if (isShopBlocked()) {
    showClosedToast();
    return;
  }
  const name = document.getElementById("customer-name").value.trim();
  if (!name) {
    _alertaConFoco("Por favor escribe tu nombre", "customer-name");
    return;
  }
  if (name.length > 60) {
    _alertaConFoco("El nombre es demasiado largo (máximo 60 caracteres)", "customer-name");
    return;
  }
  if (Object.keys(cart).length === 0 && Object.values(custCart).filter(c => c.qty > 0).length === 0 && Object.values(extrasCart).filter(c => c.qty > 0).length === 0) {
    showAlert("El pedido está vacío");
    return;
  }

  // Validar teléfono
  const phone = document.getElementById("customer-phone").value.trim();
  const phoneClean = phone.replace(/[\s\-().+]/g, '');
  if (!phone) {
    _alertaConFoco("Por favor escribe tu teléfono", "customer-phone");
    return;
  }
  if (!/^\d{9}$/.test(phoneClean)) {
    _alertaConFoco("El teléfono debe tener exactamente 9 dígitos", "customer-phone");
    return;
  }
  // Prefijo válido español: móviles 6/7, fijos 8/9 — excluye 800/900/901/902 y similares
  if (!/^[6789]/.test(phoneClean)) {
    _alertaConFoco("El teléfono no parece válido. Debe empezar por 6, 7, 8 o 9", "customer-phone");
    return;
  }
  // Excluir numeración especial: 800, 900, 901, 902, 803, 806, 807
  if (/^(800|900|901|902|803|806|807)/.test(phoneClean)) {
    _alertaConFoco("No se admiten números de tarificación especial", "customer-phone");
    return;
  }
  // Detectar números absurdos: todos iguales, secuencias obvias
  const _absurdos = ['000000000', '111111111', '222222222', '333333333', '444444444', '555555555', '666666666', '777777777', '888888888', '999999999', '123456789', '987654321', '600000000', '700000000', '612345678'];
  if (_absurdos.includes(phoneClean)) {
    _alertaConFoco("El teléfono introducido no parece real. Por favor usa tu número real", "customer-phone");
    return;
  }
  // Detectar repetición: 7+ dígitos iguales consecutivos (ej. 611111111, 699999999)
  if (/(\d)\1{6,}/.test(phoneClean)) {
    _alertaConFoco("El teléfono introducido no parece real. Por favor usa tu número real", "customer-phone");
    return;
  }

  // ── Honeypot anti-bots: si el campo oculto está relleno, es un bot
  const hp = document.getElementById('hp-website');
  if (hp && hp.value.trim()) {
    // `btn` (más abajo, para el resto de la función) todavía no existe en
    // este punto — usarlo aquí lanzaba un ReferenceError ("Cannot access
    // 'btn' before initialization") por ser un `const` del mismo scope
    // referenciado antes de su declaración, así que se busca el elemento
    // aparte en vez de depender de esa variable.
    const hpBtn = document.getElementById('submit-btn');
    if (hpBtn) {
      hpBtn.disabled = true;
      hpBtn.textContent = 'Enviando pedido…';
      setTimeout(() => {
        hpBtn.disabled = false;
        hpBtn.textContent = 'Confirmar pedido';
      }, 2000);
    }
    return;
  }

  // ── Blacklist: teléfono bloqueado (local + Firebase)
  const blacklist = getBlacklist();
  if (blacklist.includes(phoneClean)) {
    showAlert('No es posible realizar pedidos desde este número de teléfono.');
    return;
  }
  // Verificar blacklist en Firebase (fuente de verdad — no bypasseable desde localStorage)
  if (window.fb_loadBlacklist) {
    try {
      const fbBlacklist = await window.fb_loadBlacklist();
      if (fbBlacklist && fbBlacklist.includes(phoneClean)) {
        // Sincronizar también al localStorage para futuras consultas offline
        saveBlacklistLocal(fbBlacklist);
        showAlert('No es posible realizar pedidos desde este número de teléfono.');
        return;
      }
    } catch (e) {
      // Si Firebase falla, continúa con la comprobación local ya hecha arriba
      console.warn('[antispam] Firebase blacklist check failed, usando caché local:', e);
    }
  }

  // ── Cooldown + límite diario (verificación contra Firebase — no bypasseable)
  if (window.fb_getPhoneLog) {
    try {
      const cfg = getAntiSpamCfg();
      const log = await window.fb_getPhoneLog(phoneClean);
      if (log) {
        // Límite diario
        if (cfg.dailyLimit > 0 && (log.count || 0) >= cfg.dailyLimit) {
          showAlert('Has alcanzado el límite de pedidos para hoy. Inténtalo mañana.');
          return;
        }
        // Cooldown: comprobar el último timestamp
        const now = Date.now();
        const cooldownMs = cfg.cooldown * 60 * 1000;
        const lastTs = log.timestamps && log.timestamps.length
          ? Math.max(...log.timestamps)
          : 0;
        if (lastTs && now - lastTs < cooldownMs) {
          const remaining = Math.ceil((cooldownMs - (now - lastTs)) / 60000);
          showAlert('Debes esperar ' + remaining + ' minuto' + (remaining !== 1 ? 's' : '') + ' antes de hacer otro pedido.');
          return;
        }
      }
    } catch (e) {
      console.warn('[antispam] Firebase phone log check failed:', e);
    }
  }

  // Validar slot si aplica — igual que en renderSlotPicker(), un pedido con
  // el código local activo (cliente en tienda) no necesita turno.
  const _enTiendaSubmit = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const needsSlot = cartHasAnyItem() && isSlotHour() && !_enTiendaSubmit;
  if (needsSlot && !selectedSlot) {
    const _slotErrorDesktop = document.getElementById('slot-error');
    const _slotErrorDrawer = document.getElementById('drawer-slot-error');
    if (_slotErrorDesktop) _slotErrorDesktop.style.display = 'block';
    if (_slotErrorDrawer) _slotErrorDrawer.style.display = 'block';
    // En móvil, el panel de escritorio (donde vive #slot-error) está oculto
    // por CSS bajo 700px — este aviso nunca llegaba a verse ahí, así que el
    // botón "Confirmar pedido" del cajón móvil parecía no hacer nada.
    // showAlert() no depende de qué parte del DOM esté visible, así que
    // siempre se ve, tanto en el cajón móvil como en escritorio.
    showAlert('Por favor, elige una hora de recogida antes de confirmar.');
    const _grupoDrawer = document.getElementById('drawer-slot-picker-group');
    const _grupoDesktop = document.getElementById('slot-picker-group');
    const _grupoVisible = (_grupoDrawer && _grupoDrawer.offsetParent !== null) ? _grupoDrawer
      : (_grupoDesktop && _grupoDesktop.offsetParent !== null) ? _grupoDesktop
      : (_grupoDrawer || _grupoDesktop);
    if (_grupoVisible) {
      _grupoVisible.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  // Reservar el turno de verdad (atómico, en el servidor) ANTES de guardar
  // el pedido — no solo mirar si está lleno. Antes esto solo se comprobaba
  // con una lectura (podía pasarla más de un cliente a la vez) y la reserva
  // real no se hacía hasta que el pedido YA estaba confirmado en pantalla
  // (ver incrementSlot() en showSuccess()/antifraude.js) — eso permitía que
  // un turno se sobrevendiera de verdad si varios pedían casi a la vez para
  // el mismo turno. Ahora la reserva ocurre aquí, antes incluso de pedir el
  // código SMS, y si el turno ya está lleno de verdad, se aborta el pedido
  // igual que antes se abortaba con la comprobación blanda.
  if (needsSlot) {
    const reservado = await incrementSlot(selectedSlot);
    if (!reservado) {
      showAlert("El turno de las ".concat(selectedSlot, " se ha llenado justo ahora. Por favor elige otro."));
      selectedSlot = null;
      renderSlotPicker();
      return;
    }
  }
  const notes = document.getElementById("customer-notes").value.trim();
  if (notes.length > 300) {
    _alertaConFoco("La nota del pedido es demasiado larga (máximo 300 caracteres)", "customer-notes");
    return;
  }
  const orderNum = await generateOrderNumber();
  // Si hay un tiempo de espera configurado para los pedidos "desde el
  // local" (panel > Configuración impresora), aquí se reparte la hora que
  // saldrá en el ticket para este pedido, en vez de "ahora mismo" — ver
  // _asignarHoraTiendaQR() en admin-config.js. Se hace aquí (con el número
  // de pedido ya reservado) y no antes, para no gastar un hueco de la cola
  // si el pedido se corta por una validación anterior.
  const _horaTiendaAsignadaSubmit = _enTiendaSubmit && typeof _asignarHoraTiendaQR === 'function'
    ? await _asignarHoraTiendaQR()
    : null;
  const regularTotal = Object.entries(cart).reduce((s, _ref9) => {
    let _ref0 = _slicedToArray(_ref9, 2),
      id = _ref0[0],
      q = _ref0[1];
    const it = MENU.find(m => m.id == id);
    return s + (it ? _precioConOferta(it) * q : 0);
  }, 0);
  const custTotal = Object.values(custCart).filter(c => c.qty > 0).reduce((s, c) => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('submitOrder: producto custom no encontrado menuId=' + c.menuId);
      return s;
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    return s + unitPrice * c.qty;
  }, 0);
  const extTotal = Object.values(extrasCart).filter(c => c.qty > 0).reduce((s, c) => s + getExtrasItemPrice(c) * c.qty, 0);
  const subTotal = regularTotal + custTotal + extTotal;
  const _sinGastosPorCodigoLocalSubmit = (typeof _modoLocalActivo === 'function') && _modoLocalActivo();
  const feeLabel = getFeeLabel();
  const fee2Label = (typeof getFee2Label === 'function') ? getFee2Label() : '';
  // Ver comentario largo en carta.js/renderCart(): el código local exime
  // al gasto etiquetado como "de gestión", sea el 1º o el 2º.
  const _fee1EsGestionSubmit = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(feeLabel);
  const _fee2EsGestionSubmit = (typeof _esEtiquetaDeGestion === 'function') && _esEtiquetaDeGestion(fee2Label);
  const _ningunaEsGestionSubmit = !_fee1EsGestionSubmit && !_fee2EsGestionSubmit;
  const feeEnabled = getFeeEnabled() && !(_sinGastosPorCodigoLocalSubmit && (_fee1EsGestionSubmit || _ningunaEsGestionSubmit));
  const feeAmount = feeEnabled ? getFeeAmount() : 0;
  const fee2Enabled = (typeof getFee2Enabled === 'function') && getFee2Enabled() && !(_sinGastosPorCodigoLocalSubmit && _fee2EsGestionSubmit);
  const fee2Amount = fee2Enabled && typeof getFee2Amount === 'function' ? getFee2Amount() : 0;
  // _comprobarPremioFidelizacion() se dispara sola en segundo plano al
  // terminar de escribir el teléfono (con un pequeño margen + una llamada
  // al servidor) — si el cliente confirma el pedido muy rápido justo
  // después, esa comprobación puede no haber terminado todavía, y
  // getFidelizacionDescuento() de abajo mira window._fidelizacionPremioActivo
  // tal cual esté en ese momento. Sin esperarla aquí, un cliente con premio
  // de verdad disponible podía confirmar el pedido sin que se le aplicara,
  // porque el aviso "aún no había llegado" a tiempo aunque en el servidor
  // sí lo tuviera. Se vuelve a comprobar (y esperar) justo antes de
  // calcular el descuento, para no depender de si la comprobación de fondo
  // llegó a tiempo o no.
  if (typeof _comprobarPremioFidelizacion === 'function') {
    await _comprobarPremioFidelizacion(phoneClean);
  }
  const _fidelizacionDescuento = getFidelizacionDescuento(phoneClean);
  // Descuento estudiante/jubilado — autodeclarado por el cliente; la
  // verificación real del carné se hace en caja al cobrar, avisado en el
  // ticket/cocina.
  const _esEstudianteJubiladoRaw = (typeof getStudentDiscountEnabled === 'function') && getStudentDiscountEnabled()
    && !!(document.getElementById('student-discount-checkbox') || {}).checked;
  const _studentDiscountPctSubmit = (typeof getStudentDiscountPct === 'function') ? getStudentDiscountPct() : 0;
  // No se combinan entre sí el código de descuento (manual o de ruleta/
  // rasca), el de estudiante/jubilado ni la oferta relámpago sobre el
  // pedido entero — se aplica solo el mayor de los tres, nunca la suma,
  // igual que ya decide el carrito en renderCart() (carta.js). La
  // fidelización no entra en este conflicto: se sigue sumando siempre, sin
  // condición. La oferta relámpago de tipo "producto" tampoco entra aquí:
  // ya va incluida en subTotal, porque regularTotal (más arriba) se calculó
  // con _precioConOferta().
  const _ofertaTotalSubmit = window._ofertaRelampagoActiva;
  const _ofertaTotalPctSubmit = (_ofertaTotalSubmit && _ofertaTotalSubmit.tipo === 'total' && _ofertaRelampagoVigente(_ofertaTotalSubmit)) ? _ofertaTotalSubmit.pct : 0;
  let _discountAmt = getDiscountAmount(subTotal);
  let _studentDiscountAmt = _esEstudianteJubiladoRaw ? Math.round(subTotal * _studentDiscountPctSubmit) / 100 : 0;
  let _ofertaTotalAmt = _ofertaTotalPctSubmit > 0 ? Math.round(subTotal * _ofertaTotalPctSubmit) / 100 : 0;
  let _esEstudianteJubiladoSubmit = _esEstudianteJubiladoRaw;
  const _candidatosSubmit = [
    { tipo: 'codigo', amt: _discountAmt },
    { tipo: 'estudiante', amt: _studentDiscountAmt },
    { tipo: 'oferta', amt: _ofertaTotalAmt }
  ].filter(c => c.amt > 0);
  if (_candidatosSubmit.length > 1) {
    _candidatosSubmit.sort((a, b) => b.amt - a.amt);
    const _ganadorSubmit = _candidatosSubmit[0].tipo;
    if (_ganadorSubmit !== 'codigo') _discountAmt = 0;
    if (_ganadorSubmit !== 'estudiante') { _studentDiscountAmt = 0; _esEstudianteJubiladoSubmit = false; } // no se aplicó de verdad: no se marca el pedido ni se avisa de verificar carné
    if (_ganadorSubmit !== 'oferta') _ofertaTotalAmt = 0;
  }
  const orderTotal = Math.max(0, subTotal + feeAmount + fee2Amount - _discountAmt - _fidelizacionDescuento - _studentDiscountAmt - _ofertaTotalAmt);
  const regularItems = Object.entries(cart).map(_ref1 => {
    let _ref10 = _slicedToArray(_ref1, 2),
      id = _ref10[0],
      qty = _ref10[1];
    const item = MENU.find(m => m.id == id);
    if (!item) {
      console.error('submitOrder: producto no encontrado id=' + id);
      return null;
    }
    return {
      name: item.name,
      qty,
      subtotal: _precioConOferta(item) * qty
    };
  }).filter(Boolean);
  const custItems = Object.values(custCart).filter(c => c.qty > 0).map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) {
      console.error('submitOrder: producto custom no encontrado menuId=' + c.menuId);
      return null;
    }
    const unitPrice = item.price + (c.extraQueso ? 1.00 : 0) + (c.extraGratinado ? 0.50 : 0);
    // Queso Mozzarella siempre al final (puede venir de ingredientes o como extra)
    const ingsWithoutQueso = c.ingredients.filter(i => i !== 'Queso Mozzarella' && i !== '4 Quesos');
    const quesosFromIng = c.ingredients.filter(i => i === 'Queso Mozzarella' || i === '4 Quesos');
    const extras = [...c.sauces.map(s => 'Extra salsa ' + s), ...ingsWithoutQueso.map(i => 'Extra ' + i)];
    // Añadir quesos al final
    quesosFromIng.forEach(q => extras.push('Extra ' + q));
    if (c.extraQueso) extras.push('Extra Queso Mozzarella +1€');
    // El gratinado siempre va el último, sea cual sea el resto de extras.
    if (c.extraGratinado) extras.push('Gratinado +0,50€');
    return {
      name: item.name,
      qty: c.qty,
      subtotal: unitPrice * c.qty,
      extras
    };
  }).filter(Boolean);
  // Cada patata con extras (queso/gratinado/ingredientes) se desglosa en
  // el ticket: la línea principal muestra solo el precio de la patata
  // sola, y cada extra sale debajo con un guión y su propio precio — igual
  // que ya hacían las Patatas Al Gusto/Bomba (ver "extras" en custItems
  // más arriba). Antes salía todo junto en una sola línea con el precio ya
  // sumado ("Patata Carbonara + Gratinado" a 6,30€), sin ver cuánto era la
  // patata y cuánto el extra.
  const extItems = Object.values(extrasCart).filter(c => c.qty > 0).map(c => {
    const item = MENU.find(m => m.id == c.menuId);
    if (!item) return null;
    const extras = [];
    // La carne elegida en Cheddar-Bacon (Carne Picada/Carne Kebab) antes no
    // llegaba ni al carrito del cliente ni al ticket de cocina — solo se
    // guardaba para el correo de respaldo (buildTicketText), que puede
    // fallar sin bloquear el pedido, así que cocina se quedaba sin saber
    // qué carne poner. Va como un extra informativo (precio 0) en vez de
    // dentro de "name", para no romper la comprobación de precio del
    // servidor contra config/menu (corregirPreciosCatalogo en
    // guardar-pedido.php busca por nombre EXACTO del producto).
    if (c.cheddarCarne) extras.push({ name: c.cheddarCarne, price: 0 });
    if (c.queso) extras.push({ name: 'Extra Queso', price: 1.00 });
    (c.ingredientesExtra || []).forEach(ing => {
      const precioIng = EXTRAS_ING_PRECIO1.includes(ing) ? 1.00 : EXTRAS_ING_PRECIO07.includes(ing) ? 0.70 : 0;
      extras.push({ name: 'Extra ' + ing, price: precioIng });
    });
    (c.salsasExtra || []).forEach(salsa => {
      extras.push({ name: 'Extra salsa ' + salsa, price: EXTRAS_SALSA_PRECIO });
    });
    // El gratinado siempre va el último, sea cual sea el resto de extras.
    if (c.gratinado) extras.push({ name: 'Gratinado', price: 0.50 });
    return {
      name: item.name,
      qty: c.qty,
      subtotal: c.basePrice * c.qty,
      extras: extras.length ? extras : undefined
    };
  }).filter(Boolean);
  const feeItems = feeEnabled ? [{
    name: feeLabel,
    qty: 1,
    subtotal: feeAmount,
    isFee: true
  }] : [];
  const fee2Items = fee2Enabled ? [{
    name: fee2Label,
    qty: 1,
    subtotal: fee2Amount,
    isFee: true
  }] : [];
  const fidelizacionItems = _fidelizacionDescuento > 0 ? [{
    name: '🎁 Premio fidelización (patata gratis)',
    qty: 1,
    subtotal: -_fidelizacionDescuento
  }] : [];
  const studentDiscountItems = _studentDiscountAmt > 0 ? [{
    // Aclaración breve de que el % es solo sobre productos (no sobre bolsa
    // ni gastos de gestión) — así se ve en el propio ticket sin tener que
    // explicarlo aparte si alguien pregunta por qué no baja más el total.
    name: '🪪 Descuento estudiante/jubilado (-' + _studentDiscountPctSubmit + '% en productos)',
    qty: 1,
    subtotal: -_studentDiscountAmt
  }] : [];
  // La oferta relámpago de tipo "producto" no necesita línea aparte: ya se
  // ve reflejada en el precio de esa línea de comida (_precioConOferta).
  const ofertaRelampagoItems = _ofertaTotalAmt > 0 ? [{
    name: '⚡ Oferta relámpago (-' + _ofertaTotalPctSubmit + '%)',
    qty: 1,
    subtotal: -_ofertaTotalAmt
  }] : [];
  // Si este pedido es el que completa el ciclo de 10 sellos, añadimos una
  // línea informativa en el ticket (sin afectar al precio) para que se
  // imprima y se vea en cocina/caja que hay que avisar al cliente.
  const _completaSelloEsteTicket = !!(window._fidelizacionProximoSelloActivo && window._fidelizacionProximoSelloActivo === phoneClean);
  const fidelizacionAvisoItems = _completaSelloEsteTicket ? [{
    name: '🎉 ¡10º SELLO COMPLETADO! Avisar: premio disponible próximo pedido',
    qty: 1,
    subtotal: 0
  }] : [];
  // El ticket siempre imprime la comida en este orden fijo (patatas primero,
  // bebidas al final), sin importar en qué orden se fueron añadiendo al
  // carrito — más fácil de montar en cocina. Los gastos/descuentos/avisos
  // van siempre después, tal cual ya estaban.
  const foodItems = [...regularItems, ...custItems, ...extItems];
  foodItems.sort((a, b) => _ticketCategoriaRank(a.name) - _ticketCategoriaRank(b.name));
  const orderItems = [...foodItems, ...feeItems, ...fee2Items, ...fidelizacionItems, ...studentDiscountItems, ...ofertaRelampagoItems, ...fidelizacionAvisoItems];
  const now = new Date().toLocaleString('es-ES');

  // Estadística "¿le metes algo dulce/de beber?": si se llegó a mostrar
  // alguna sugerencia (window._upsellFueMostrado, marcado por
  // getUpsellCarrito() al ofrecerla, sea de postre o de bebida) y si el
  // cliente acabó añadiendo alguna de las opciones ofrecidas de cualquiera
  // de los dos tipos.
  const upsellMostrado = !!window._upsellFueMostrado;
  const _upsellIdsOfrecidos = window._upsellOpcionesElegidas
    ? [].concat((window._upsellOpcionesElegidas.dulce || {}).ids || [], (window._upsellOpcionesElegidas.bebida || {}).ids || [])
    : [];
  const upsellAnadido = _upsellIdsOfrecidos.some(id => (cart[id] || 0) > 0);

  // Aviso destacado en el ticket para que no se olvide entregar/descontar
  // el premio — solo cuando el cliente YA tenía una patata gratis
  // pendiente de canjear ANTES de este pedido (window._fidelizacionPremioActivo,
  // calculado al escribir el teléfono en _comprobarPremioFidelizacion). No
  // es lo mismo que "este pedido es elegible para sumar sello" (eso pasaba
  // casi en cada ticket, con patata + 5€ de mínimo, y hacía el aviso inútil
  // por repetirse siempre). El caso de "este pedido completa el 10º sello
  // ahora mismo" ya tiene su propio aviso separado más abajo
  // (fidelizacionAvisoItems, "¡10º SELLO COMPLETADO!").
  const _fidelizacionElegibleSubmit = !!(window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === phoneClean);

  // Datos estructurados del ticket (para impresión HTML)
  const ticketData = {
    orderNum,
    name,
    phone,
    notes,
    // Si el pedido es "desde el local" (QR) y hay un tiempo de espera entre
    // tickets configurado, _horaTiendaAsignadaSubmit reparte la hora que
    // sale en el ticket en vez de "ahora mismo" (ver más arriba).
    slotTime: selectedSlot || _horaTiendaAsignadaSubmit || null,
    items: orderItems,
    total: orderTotal,
    time: now,
    upsellMostrado,
    upsellAnadido,
    // Pedido "desde el local" (código de cola aplicado): para que en cocina
    // pueda mostrarse primero, ya que ese cliente está esperando físicamente
    // en el mostrador y no se puede ir a pedir a otro sitio.
    esPedidoLocal: _sinGastosPorCodigoLocalSubmit,
    // Descuento estudiante/jubilado autodeclarado — se imprime destacado en
    // el ticket y se marca en cocina para que se compruebe el carné al cobrar.
    esEstudianteJubilado: _esEstudianteJubiladoSubmit,
    fidelizacionElegible: _fidelizacionElegibleSubmit
  };
  _lastTicketData = ticketData;
  window._pendingTicketData = ticketData;

  // Texto plano para el email (se mantiene igual)
  const ticketText = buildTicketText(orderNum, name, phone, notes, selectedSlot, orderTotal, feeAmount, _discountAmt, (_activeDiscount ? _activeDiscount.code : null), _fidelizacionDescuento, _ofertaTotalAmt, _ofertaTotalPctSubmit);
  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.textContent = "Enviando pedido…";

  // ── Enviar por EmailJS ── (fallo no bloquea el pedido)
  if (typeof emailjs !== "undefined") {
    emailjs.init(CONFIG.emailjs_public_key);
    try {
      await emailjs.send(CONFIG.emailjs_service_id, CONFIG.emailjs_template_id, {
        to_email: CONFIG.store_email,
        order_num: orderNum,
        customer: name,
        phone: phone || "–",
        notes: notes || "–",
        ticket: ticketText,
        pickup_time: needsSlot ? selectedSlot : (_horaTiendaAsignadaSubmit || "–"),
        total: orderTotal.toFixed(2) + " €"
      });
    } catch (err) {
      console.error("EmailJS error:", err);
      logActivity("⚠️ Email de confirmación NO enviado — pedido " + orderNum + " — " + (err && err.text || err && err.message || "error desconocido"));
    }
  } else {
    console.warn("EmailJS no cargado — email omitido");
  }
  // El uso del código de descuento se registra en el servidor al
  // finalizar el pedido (ver guardar-pedido.php) — incrementar
  // discounts/<code>/uses exige el UID de admin en las reglas, así que
  // el navegador ya no puede hacerlo directamente. Si el código perdió el
  // conflicto con el descuento de estudiante/jubilado (_discountAmt quedó
  // en 0 más arriba), no se envía — no se ha llegado a usar de verdad, así
  // que no debe consumir ningún uso del cupón.
  const _discountCodeUsado = (_activeDiscount && _discountAmt > 0) ? _activeDiscount.code : null;
  _activeDiscount = null;
  document.querySelectorAll('#discount-input, #drawer-discount-input').forEach(el => { el.value = ''; });
  document.querySelectorAll('#discount-feedback, #drawer-discount-feedback').forEach(el => { el.textContent = ''; });
  // Desmarcar la casilla estudiante/jubilado para el siguiente pedido — no
  // debe quedar marcada por defecto sin que el cliente vuelva a elegirlo.
  const _studentCb = document.getElementById('student-discount-checkbox');
  if (_studentCb) _studentCb.checked = false;
  const _studentCbDrawer = document.getElementById('drawer-student-discount-checkbox');
  if (_studentCbDrawer) _studentCbDrawer.checked = false;
  // ── Verificación SMS ──────────────────────────────────────
  // Guardar datos del pedido pendiente hasta que se verifique el teléfono
  window._pendingOrderData = {
    orderNum,
    slotTime: needsSlot ? selectedSlot : (_horaTiendaAsignadaSubmit || null),
    phone,
    phoneClean,
    ticketData: ticketData,
    discountCode: _discountCodeUsado
  };

  // Pedido "desde el local" (código del QR del mostrador validado y de
  // hoy): el cliente lo tiene el personal delante, así que no tiene
  // sentido pedirle un SMS — se salta el modal y se finaliza directo. Ojo:
  // esto NO basta por sí solo, guardar-pedido.php vuelve a comprobar el
  // código y su fecha de verdad contra Firebase (ver localCodeValido allí)
  // antes de aceptar un pedido sin smsToken, así que un pedido con
  // esPedidoLocal falseado a mano sin el código real seguiría rechazándose.
  // Interruptor de emergencia del panel (Twilio caído, etc.) — mientras
  // esté desactivado, ningún pedido pide SMS, no solo los del QR local.
  // guardar-pedido.php vuelve a comprobar config/smsVerificacionActiva de
  // verdad contra Firebase antes de aceptar un pedido sin smsToken, así
  // que esto tampoco basta por sí solo si alguien lo falsea a mano.
  const _smsDesactivadaSubmit = (typeof getSmsVerificacionActiva === 'function') && !getSmsVerificacionActiva();
  if (_sinGastosPorCodigoLocalSubmit || _smsDesactivadaSubmit) {
    const _codigoLocalUsado = ((document.getElementById('local-fee-code-input') || {}).value || '').trim().toUpperCase();
    window._pendingOrderData.localCode = _codigoLocalUsado;
    btn.disabled = false;
    btn.textContent = 'Confirmar pedido →';
    await _finalizarPedido();
    return;
  }

  // Intentar enviar SMS de verificación — ya no hay atajo que se la salte
  // (ni el antiguo _skipSmsVerification del navegador, ni dejar pasar el
  // pedido si el envío falla): guardar-pedido.php ahora exige de verdad un
  // comprobante firmado de que este teléfono verificó su código con
  // Twilio (ver validarSmsToken), así que sin verificación real el pedido
  // se rechazaría de todas formas más adelante — mejor decirlo claro aquí
  // que dejar avanzar algo que va a fallar solo.
  let smsOk = false;
  let smsError = null;
  try {
    const smsRes = await _fetchConTimeout('/send-code.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+34' + phoneClean })
    }, 8000);
    const smsData = await smsRes.json();
    if (smsData.success) {
      smsOk = true;
    } else {
      smsError = smsData.error;
      console.warn('[SMS] send-code error:', smsData.error);
    }
  } catch (e) {
    smsError = e.message;
    console.warn('[SMS] fetch error:', e);
  }

  btn.disabled = false;
  btn.textContent = 'Confirmar pedido →';

  if (smsOk) {
    // Mostrar modal de verificación SMS
    const modal = document.getElementById('sms-verify-modal');
    const txt = document.getElementById('sms-verify-text');
    if (modal) {
      if (txt) txt.textContent = 'Te hemos enviado un código de 4 dígitos al ' + phone + '.';
      // Limpiar inputs anteriores
      ['sms-code-1','sms-code-2','sms-code-3','sms-code-4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const errEl = document.getElementById('sms-error-msg');
      if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
      modal.style.display = 'flex';
      const firstInput = document.getElementById('sms-code-1');
      if (firstInput) firstInput.focus();
    }
  } else {
    showAlert('No se pudo enviar el código de verificación por SMS (' + (smsError || 'error desconocido') + '). Inténtalo de nuevo en unos minutos.');
    window._pendingOrderData = null;
  }
  return; // El pedido se finaliza desde smsVerifyCode()
}

// ── Finalizar pedido tras verificación SMS ──────────────────
async function _finalizarPedido() {
  if (!window._pendingOrderData) return;
  const { orderNum, slotTime, phone, phoneClean, ticketData: _ticketDataParaFidelizacion, discountCode, smsToken, localCode } = window._pendingOrderData;
  try { if (phoneClean) localStorage.setItem('dpf_customer_phone', phoneClean); } catch {}
  window._pendingOrderData = null;

  // Cerrar modal SMS si está abierto
  const modal = document.getElementById('sms-verify-modal');
  if (modal) modal.style.display = 'none';

  // Guardar el pedido en el servidor: ticket completo + estadísticas del
  // día + uso del código de descuento (si lo hubo). tickets/ y stats/
  // exigen el UID de admin en las reglas de Firebase, así que un cliente
  // anónimo (cualquiera que pida sin haber iniciado sesión de admin) no
  // puede escribir ahí directamente — lo hace guardar-pedido.php con la
  // cuenta de servicio.
  // No se espera aquí (para que la pantalla de éxito aparezca al instante),
  // pero SÍ hay que esperar a que termine antes de pedir el sello de
  // fidelización más abajo — fidelizacion.php ahora comprueba contra el
  // ticket ya guardado en Firebase (tickets/<fecha>/<num>), así que si se
  // llamara antes de que este guardado termine, el sello se rechazaría por
  // "pedido no encontrado" en pedidos completamente legítimos.
  let _pedidoGuardadoPromise = Promise.resolve();
  if (window._pendingTicketData) {
    const _pedidoPayload = {
      orderNum,
      name: window._pendingTicketData.name,
      phone: window._pendingTicketData.phone,
      notes: window._pendingTicketData.notes,
      slotTime: window._pendingTicketData.slotTime,
      items: window._pendingTicketData.items,
      total: window._pendingTicketData.total,
      discountCode: discountCode || null,
      // Comprobante de verificación SMS que exige guardar-pedido.php ahora
      // (ver validarSmsToken allí) — lo genera verify-code.php tras
      // confirmar el código de verdad con Twilio.
      smsToken: smsToken || null,
      // Código "pedido desde el local" tal cual lo escribió/trajo el
      // cliente — junto con esPedidoLocal, es lo que guardar-pedido.php
      // revalida de verdad contra Firebase para decidir si puede aceptar
      // el pedido sin smsToken (ver localCodeValido allí).
      localCode: localCode || null,
      upsellMostrado: window._pendingTicketData.upsellMostrado || false,
      upsellAnadido: window._pendingTicketData.upsellAnadido || false,
      esPedidoLocal: window._pendingTicketData.esPedidoLocal || false,
      esEstudianteJubilado: window._pendingTicketData.esEstudianteJubilado || false,
      fidelizacionElegible: window._pendingTicketData.fidelizacionElegible || false
    };
    // Se guarda un marcador ANTES de mandar la petición — si la pestaña se
    // cierra o se pierde la conexión justo después de confirmar (antes de
    // recibir la respuesta), _recuperarPedidoEnCurso() lo reenvía solo al
    // volver a abrir la web. Reenviar el mismo pedido es seguro aunque el
    // primer intento sí hubiera llegado a guardarse: guardar-pedido.php
    // responde éxito (no error) si el ticket ya existe con el mismo
    // teléfono, en vez de duplicarlo.
    try { localStorage.setItem('dpf_pedido_en_curso', JSON.stringify({ orderNum, payload: _pedidoPayload, ts: Date.now() })); } catch (e) {}
    console.log('💾 Guardando pedido en el servidor:', orderNum);
    _pedidoGuardadoPromise = _fetchConTimeout('guardar-pedido.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(_pedidoPayload)
    }, 12000)
      .then(res => res.json())
      .then(data => {
        try { localStorage.removeItem('dpf_pedido_en_curso'); } catch (e) {}
        if (data.success) {
          console.log('✅ Pedido guardado');
          window._pendingTicketData = null;
          if (typeof _actualizarTiempoEstimadoTrasGuardar === 'function') _actualizarTiempoEstimadoTrasGuardar(data);
        }
        else { console.error('❌ Error guardando pedido:', data.error); logActivity('⚠️ Pedido ' + orderNum + ' NO se guardó — ' + (data.error || 'error desconocido')); _avisarClienteFalloGuardado(orderNum); }
      })
      .catch((e) => {
        // No se borra el marcador aquí: no hubo respuesta del servidor (fallo
        // de red/pestaña cerrada), así que no se sabe si el pedido llegó a
        // guardarse — se deja para que _recuperarPedidoEnCurso() lo reintente
        // en la próxima visita.
        console.error('❌ Error guardando pedido:', e);
        logActivity('⚠️ Pedido ' + orderNum + ' NO se guardó — ' + (e && e.message || 'error de conexión'));
        _avisarClienteFalloGuardado(orderNum);
      });
  } else {
    console.warn('⚠️ _pendingTicketData vacío, no se pudo guardar el pedido');
  }

  // Programa de fidelización: sumar sello si el pedido incluye al menos 1
  // patata. Se encadena a partir de que termine el guardado (fidelizacion.php
  // comprueba contra el ticket ya guardado) y se publica esa promesa YA en
  // window._selloEnCursoPorPedido — antes incluso de mostrar la pantalla de
  // éxito, que es cuando los botones "Modificar"/"Cancelar pedido" se
  // activan. Publicarla más tarde (como antes) dejaba un hueco real: un
  // cliente que pulsara "Modificar" muy rápido nada más confirmar podía
  // cancelar el pedido justo en ese hueco — _borrarPedidoDeFirebase()
  // (antifraude.js) no encontraba ninguna promesa que esperar todavía, así
  // que pedía revertir el sello antes de que el sello llegara siquiera a
  // registrarse (no había nada que deshacer), y cuando el registro real
  // llegaba justo después, se quedaba puesto un sello para un pedido ya
  // cancelado — el cliente se llevaba un sello de más que no le tocaba.
  const _consumioPremioFidelizacion = window._fidelizacionPremioActivo && window._fidelizacionPremioActivo === phoneClean;
  const _selloPromise = _pedidoGuardadoPromise
    .catch(() => {})
    .then(() => _procesarSelloFidelizacion(phoneClean, _ticketDataParaFidelizacion, _consumioPremioFidelizacion))
    .catch(e => console.warn('[fidelizacion] error:', e));
  if (orderNum) {
    window._selloEnCursoPorPedido[orderNum] = _selloPromise;
    _selloPromise.then(() => {
      if (window._selloEnCursoPorPedido[orderNum] === _selloPromise) delete window._selloEnCursoPorPedido[orderNum];
    });
  }

  await showSuccess(orderNum, slotTime);
  // El registro en phoneLog (para el cooldown/límite diario) ya lo hace
  // guardar-pedido.php al guardar el pedido — hacerlo también aquí
  // contaría cada pedido dos veces.
  window._fidelizacionPremioActivo = null;
  _ocultarAvisoPremioFidelizacion();
}
// Antes, si guardar-pedido.php fallaba, el cliente veía "pedido confirmado"
// igual y solo quedaba un aviso en el log de actividad que ve el admin —
// nadie en cocina se enteraba de que el pedido no había llegado. Ahora, si
// el cliente sigue en la pantalla de éxito de ESE pedido, se lo decimos.
function _avisarClienteFalloGuardado(orderNum) {
  const successVisible = document.getElementById('success-screen')?.style.display === 'block';
  const mismoNum = document.getElementById('order-num-display')?.textContent === String(orderNum);
  if (!successVisible || !mismoNum) return;
  const warning = document.getElementById('success-save-warning');
  if (warning) warning.style.display = 'block';
}

// ── PROGRAMA DE FIDELIZACIÓN (SELLO DIGITAL) ──────────────────────────────
const FIDELIZACION_META = 10;
// Pedido mínimo para sumar sello — evita que un pedido mínimo (p.ej. 1
// patata suelta de 2€) valga igual que uno grande a efectos de fidelización.
const FIDELIZACION_PEDIDO_MINIMO = 5;
function _ticketTienePatata(ticketData) {
  if (!ticketData || !Array.isArray(ticketData.items)) return false;
  return ticketData.items.some(it => typeof it.name === 'string' && it.name.trim().toLowerCase().startsWith('patata'));
}
// El mínimo de 5€ lo decide SIEMPRE el servidor, contra el total real del
// ticket ya guardado (fidelizacion.php, con FIDELIZACION_PEDIDO_MINIMO) —
// aquí solo se filtra por "lleva patata" antes de llamar, para no gastar
// una petición en pedidos que claramente no cuentan. Antes este filtro
// también comprobaba el total en el propio navegador (con el mismo umbral
// de 5€ duplicado en dos sitios): si por lo que fuera ese cálculo del
// cliente no coincidía exactamente con el total ya guardado en el
// servidor, el pedido ni siquiera llegaba a pedir el sello — y como el
// filtro corta ANTES de la llamada a fidelizacion.php, no queda ningún
// aviso en el registro de actividad de ese fallo (a diferencia de un
// rechazo del servidor, que sí se registra y aparece en Alertas con botón
// "Reintentar sello"). Quitar la comprobación de aquí cierra ese punto
// ciego sin cambiar el resultado final, porque el servidor igualmente
// rechaza (en silencio, sin alerta, es el caso normal y esperado) los
// pedidos por debajo del mínimo.
function _pedidoElegibleFidelizacion(ticketData) {
  return _ticketTienePatata(ticketData);
}
// Pedido → promesa de "todo lo que le falta a este pedido para terminar de
// asentarse (guardado + intento de sumar sello)" — la publica
// _finalizarPedido() nada más conocer el orderNum, y _borrarPedidoDeFirebase()
// (antifraude.js) la espera antes de pedir que se revierta el sello, si el
// cliente cancela/modifica el pedido justo después de confirmarlo. Ver el
// comentario en _finalizarPedido de por qué hace falta.
window._selloEnCursoPorPedido = window._selloEnCursoPorPedido || {};
async function _procesarSelloFidelizacion(phoneClean, ticketData, consumioPremio) {
  if (!phoneClean || !_pedidoElegibleFidelizacion(ticketData)) return;
  // El cálculo del sello (sumar, resetear a los 10, descontar premio
  // canjeado) se hace en el servidor (fidelizacion.php): el navegador ya
  // no lee ni escribe fidelizacion/<telefono> directamente, para que nadie
  // pueda regalarse sellos/premios abriendo las devtools.
  try {
    const res = await _fetchConTimeout('fidelizacion.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'registrarSello',
        telefono: phoneClean,
        orderNum: (ticketData && ticketData.orderNum) || '',
        tienePatata: true,
        consumioPremio: !!consumioPremio,
        nombre: (ticketData && ticketData.name) || ''
      })
    }, 10000);
    // Si el servidor rechaza el sello (success:false, no "skipped"), ya lo
    // registra fidelizacion.php por su cuenta con la cuenta de servicio
    // (fbAgregarActivityLog) — hacerlo también aquí en el navegador del
    // cliente no servía de nada en producción (un cliente anónimo real no
    // tiene permiso para escribir en config/activityLog) y solo duplicaba
    // el aviso cuando quien probaba era la propia admin con el panel
    // abierto en el mismo navegador.
  } catch (e) { /* no crítico: si falla, el cliente simplemente no suma sello esta vez */ }
  // Nota: el aviso de "completaste tus 10 pedidos" ya se mostró ANTES de
  // confirmar (ver _comprobarPremioFidelizacion / _mostrarAvisoProximoSelloFidelizacion),
  // así que aquí no se repite para no duplicar el mensaje.
}
function _mostrarAvisoFidelizacionCompletada() {
  // Aviso simple superpuesto a la pantalla de éxito; no bloquea el flujo.
  try {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#3D1F0D;color:#FFF8EE;padding:16px 22px;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,0.3);z-index:9999;max-width:90vw;text-align:center;font-family:\'DM Sans\',sans-serif;font-size:14.5px;font-weight:600';
    el.innerHTML = '🎉 ¡Has completado tus 10 pedidos! Tu patata gratis estará disponible en tu próximo pedido.';
    document.body.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 6000);
  } catch (e) {}
}

// ── Tiempo de modificación de pedido (en minutos) ──
function saveModifyWindow() {
  var _document$getElementB2;
  const v = parseInt(((_document$getElementB2 = document.getElementById('modify-window-input')) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.value) || '1');
  const valid = isNaN(v) || v < 1 || v > 30 ? 1 : v;
  localStorage.setItem('dpf_modify_window_mins', valid);
  if (window.fb_saveConfig) {
    try {
      // IMPORTANTE: usar la misma clave (CONFIG_KEY) que saveConfig(), no
      // 'dpf_local_config'. Antes esto leía/escribía una clave distinta y
      // sobreescribía en Firebase toda la config (incluidas las claves de
      // EmailJS) con un objeto que solo tenía modifyWindowMins, borrando
      // sin querer el resto de ajustes guardados.
      const cfg = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
      cfg.modifyWindowMins = valid;
      localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
      Object.assign(CONFIG, cfg);
      window.fb_saveConfig(cfg).catch(() => {});
    } catch (e) {}
  }
  showToast('modify-window-toast');
}
function loadModifyWindowInput() {
  const v = localStorage.getItem('dpf_modify_window_mins') || '1';
  const el = document.getElementById('modify-window-input');
  if (el) el.value = v;
}

