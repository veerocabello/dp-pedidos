/* ═══════════════════════════════════════════════════
   Sistema de fichaje y empleados
   ═══════════════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  SISTEMA DE EMPLEADOS Y FICHAJE
// ══════════════════════════════════════════════
const EMP_KEY        = 'dpf_empleados';
const FICHAJE_KEY    = 'dpf_fichajes';
const EMP_FICHAR_KEY = 'dpf_fichar_token';

const EMP_EMPRESA_KEY = 'dpf_empresa';
const EMP_CIF_KEY     = 'dpf_cif';
// Razón social y CIF se leen desde localStorage (editables desde el panel de administración)
function getEmpEmpresa() { return localStorage.getItem(EMP_EMPRESA_KEY) || ''; }
function getEmpCIF()     { return localStorage.getItem(EMP_CIF_KEY)     || ''; }

// ⚠️ SEGURIDAD: Los datos de empleados se cargan desde Firebase (config/empleados).
// EMP_DEFAULT es solo el arranque inicial en un dispositivo nuevo sin datos en Firebase.
// Los nombres y PINs reales se gestionan SIEMPRE desde el panel de administración.
// Este array no contiene datos personales — edita los empleados desde el panel.
const EMP_DEFAULT = [
  { id:'emp1', nombre:'Empleado 1', dni:'', pin:'', dias:[2,4,5,6,0], manIn:'', manOut:'', tarIn:'16:00', tarOut:'00:00' },
  { id:'emp2', nombre:'Empleado 2', dni:'', pin:'', dias:[4,5,6,0],   manIn:'', manOut:'', tarIn:'19:00', tarOut:'00:00' },
  { id:'emp3', nombre:'Empleado 3', dni:'', pin:'', dias:[4,5,6,0],   manIn:'', manOut:'', tarIn:'19:00', tarOut:'00:00' },
  { id:'emp4', nombre:'Empleado 4', dni:'', pin:'', dias:[3,4,5,6,0], manIn:'', manOut:'', tarIn:'20:00', tarOut:'00:00' },
  { id:'emp5', nombre:'Empleado 5', dni:'', pin:'', dias:[3,4,5,6,0], manIn:'10:00', manOut:'14:00', tarIn:'20:00', tarOut:'00:00' },
  { id:'emp6', nombre:'Empleado 6', dni:'', pin:'', dias:[3,4,5,6,0], manIn:'10:00', manOut:'14:00', tarIn:'', tarOut:'' },
];

function empLoadAll() {
  try { const d=JSON.parse(localStorage.getItem(EMP_KEY)||'null'); if(d&&d.length) return d; } catch {}
  // Si no hay en localStorage, devolver default — Firebase actualizará async
  return JSON.parse(JSON.stringify(EMP_DEFAULT));
}
function empSaveAll(arr) {
  localStorage.setItem(EMP_KEY, JSON.stringify(arr));
  if (window.fb_saveEmpleados) window.fb_saveEmpleados(arr).catch(e => console.warn('Firebase empleados error', e));
}
function fichajesLoad()  { try { return JSON.parse(localStorage.getItem(FICHAJE_KEY)||'[]'); } catch { return []; } }
function fichajesSave(a) {
  localStorage.setItem(FICHAJE_KEY, JSON.stringify(a));
  if (window.fb_saveFichajes) window.fb_saveFichajes(a).catch(e => console.warn('Firebase fichajes error', e));
}

function getFicharToken() { return localStorage.getItem(EMP_FICHAR_KEY)||''; }
function empGenFicharToken() {
  const t = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now().toString(36));
  localStorage.setItem(EMP_FICHAR_KEY, t);
  if (window.fb_saveFicharToken) window.fb_saveFicharToken(t).catch(()=>{});
  empMostrarFicharUrl();
  const toast=document.getElementById('emp-fichar-toast'); toast.textContent='✅ Token generado'; toast.style.display='block'; setTimeout(()=>toast.style.display='none',2000);
}
function empCopyFicharUrl() {
  let t=getFicharToken(); if(!t){empGenFicharToken();t=getFicharToken();}
  const url=location.origin+location.pathname+'?fichar='+t;
  navigator.clipboard.writeText(url).catch(()=>{const a=document.createElement('textarea');a.value=url;document.body.appendChild(a);a.select();document.execCommand('copy');document.body.removeChild(a);});
  const toast=document.getElementById('emp-fichar-toast'); toast.textContent='📋 URL copiada'; toast.style.display='block'; setTimeout(()=>toast.style.display='none',2000);
}
function empMostrarFicharUrl() {
  const el=document.getElementById('emp-fichar-url-display'); if(!el) return;
  const t=getFicharToken();
  el.textContent=t?'🔗 '+location.origin+location.pathname+'?fichar='+t:'Sin token generado';
}

function empRenderAdmin() {
  empMostrarFicharUrl(); empRenderLista(); empRenderTrabajandoAhora(); empRenderSelectHistorial();
  const mesEl=document.getElementById('emp-hist-mes'); if(mesEl&&!mesEl.value) mesEl.value=new Date().toISOString().slice(0,7);
}

function empRenderLista() {
  const emps=empLoadAll(); const el=document.getElementById('emp-lista'); if(!el) return;
  const DN=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  el.innerHTML=emps.map(e=>`
    <div style="background:var(--white);border:1.5px solid var(--warm);border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:160px">
        <div style="font-size:14px;font-weight:700;color:var(--brown)">${e.nombre}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">DNI: ${e.dni ? e.dni.replace(/./g, (c,i,s)=>i<3||i>=s.length-2?c:'*') : '—'} · PIN: ••••</div>
        <div style="font-size:11px;color:var(--muted)">${(e.dias||[]).map(d=>DN[d]).join(', ')||'—'}${e.tarIn?' · Tarde: '+e.tarIn+'–'+e.tarOut:''}${e.manIn?' · Mañana: '+e.manIn+'–'+e.manOut:''}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button onclick="empEditarModal('${e.id}')" style="padding:6px 12px;background:var(--amber-light);color:var(--amber-dark);border:1.5px solid var(--amber);border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">✏️</button>
        <button onclick="empEliminar('${e.id}')" style="padding:6px 12px;background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">🗑️</button>
      </div>
    </div>`).join('');
}

// ── FICHAJES IMPORTADOS ────────────────────────────────────────────────────
// Los fichajes históricos ya fueron migrados a Firebase/localStorage.
// Este array está vacío: la inyección automática solo se ejecuta una vez
// (controlada por la clave dpf_fichajes_importados_v6 en localStorage).
const EMP_FICHAJES_IMPORTADOS = [];

// Inyectar fichajes importados en localStorage la primera vez
(function empInyectarImportados() {
  const KEY = 'dpf_fichajes_importados_v6';
  if (localStorage.getItem(KEY)) return;
  const fich = fichajesLoad();
  const existentes = new Set(fich.map(f => f.empId+'|'+f.fecha+'|'+f.hora+'|'+f.tipo));
  const nuevos = EMP_FICHAJES_IMPORTADOS.filter(f => !existentes.has(f.empId+'|'+f.fecha+'|'+f.hora+'|'+f.tipo));
  fichajesSave([...fich, ...nuevos]);
  localStorage.setItem(KEY, '1');
})();

// ── REGISTRO DE FICHAJES POR MES/EMPLEADO ─────
const MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function empRenderRegistroMeses() {
  const el = document.getElementById('emp-registro-meses');
  if (!el) return;
  const fich  = fichajesLoad();
  const emps  = empLoadAll();
  // Obtener todos los meses con datos
  const meses = [...new Set(fich.map(f => f.fecha.slice(0,7)))].sort().reverse();
  if (!meses.length) { el.innerHTML = '<p style="font-size:13px;color:var(--muted)">Sin fichajes registrados</p>'; return; }
  el.innerHTML = meses.map(mes => {
    const [anio, mesN] = mes.split('-').map(Number);
    const mesLabel = MESES_ES[mesN-1] + ' ' + anio;
    const fichMes  = fich.filter(f => f.fecha.startsWith(mes));
    // Empleados con fichajes ese mes
    const empIds   = [...new Set(fichMes.map(f => f.empId))];
    const subcarpetas = empIds.map(eid => {
      const emp    = emps.find(e => e.id===eid) || {nombre: eid, id: eid};
      const suyos  = fichMes.filter(f => f.empId===eid);
      // Calcular horas y días — solo cuentan días con entrada Y salida completas
      const porDia = {};
      suyos.forEach(f => { if(!porDia[f.fecha])porDia[f.fecha]={e:[],s:[]}; if(f.tipo==='entrada')porDia[f.fecha].e.push(f.hora);else porDia[f.fecha].s.push(f.hora); });
      let totalMin = 0;
      let dias = 0;
      Object.values(porDia).forEach(({e,s}) => {
        if(e.length&&s.length){const[eh,em]=e[0].split(':').map(Number),[sh,sm]=s[s.length-1].split(':').map(Number);let d=(sh*60+sm)-(eh*60+em);if(d<0)d+=24*60;totalMin+=d;dias++;}
      });
      const th = Math.floor(totalMin/60), tm = totalMin%60;
      return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--warm)">
        <span style="font-size:13px;font-weight:600;color:var(--text);flex:1">${emp.nombre.split(' ')[0]} ${emp.nombre.split(' ')[1]||''}</span>
        <span style="font-size:11px;color:var(--muted)">${dias} días · ${th}h${tm>0?' '+tm+'min':''}</span>
        <button onclick="empDescargarMesEmpleado('${eid}','${mes}')" style="padding:4px 10px;background:var(--brown);color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">📄 Doc</button>
        <button onclick="empVerDetalleRegistro('${eid}','${mes}')" style="padding:4px 10px;background:var(--amber-light);color:var(--amber-dark);border:1.5px solid var(--amber);border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">👁️ Ver</button>
      </div>`;
    }).join('');
    return `<details style="background:var(--white);border:1.5px solid var(--warm);border-radius:10px;padding:0;overflow:hidden">
      <summary style="padding:12px 14px;cursor:pointer;font-size:14px;font-weight:700;color:var(--brown);list-style:none;display:flex;align-items:center;justify-content:space-between">
        <span>📁 ${mesLabel}</span>
        <span style="font-size:11px;font-weight:500;color:var(--muted)">${empIds.length} empleado${empIds.length!==1?'s':''}</span>
      </summary>
      <div style="padding:0 14px 12px">${subcarpetas}</div>
    </details>`;
  }).join('');
}

function empDescargarMesEmpleado(empId, mes) {
  // Reutiliza empGenerarDocumento pero con parámetros directos
  document.getElementById('emp-hist-select').value = empId;
  document.getElementById('emp-hist-mes').value = mes;
  empGenerarDocumento();
}

function empVerDetalleRegistro(empId, mes) {
  document.getElementById('emp-hist-select').value = empId;
  document.getElementById('emp-hist-mes').value = mes;
  empVerHistorial();
  // Scroll al historial
  const el = document.getElementById('emp-hist-resultado');
  if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
}

// Llamar al cargar la sección
const _origEmpRenderAdmin = empRenderAdmin;
empRenderAdmin = function() {
  _origEmpRenderAdmin();
  empRenderRegistroMeses();
};
let _empManualTipo = 'entrada';

function empFichajeManualModal() {
  const emps = empLoadAll();
  const sel  = document.getElementById('emp-manual-emp');
  sel.innerHTML = emps.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
  // Fecha y hora actuales por defecto
  const ahora = new Date();
  document.getElementById('emp-manual-fecha').value = ahora.toISOString().slice(0,10);
  document.getElementById('emp-manual-hora').value  = ahora.toTimeString().slice(0,5);
  empManualTipo('entrada');
  document.getElementById('emp-manual-modal').style.display = 'flex';
}

function empManualTipo(tipo) {
  _empManualTipo = tipo;
  const btnE = document.getElementById('emp-manual-btn-entrada');
  const btnS = document.getElementById('emp-manual-btn-salida');
  btnE.style.background   = tipo==='entrada' ? '#eafaf1' : 'var(--white)';
  btnE.style.borderColor  = tipo==='entrada' ? '#27855a' : 'var(--warm)';
  btnE.style.color        = tipo==='entrada' ? '#27855a' : 'var(--muted)';
  btnS.style.background   = tipo==='salida'  ? '#fdf0ee' : 'var(--white)';
  btnS.style.borderColor  = tipo==='salida'  ? '#c0392b' : 'var(--warm)';
  btnS.style.color        = tipo==='salida'  ? '#c0392b' : 'var(--muted)';
}

function empManualGuardar() {
  const empId = document.getElementById('emp-manual-emp').value;
  const fecha = document.getElementById('emp-manual-fecha').value;
  const hora  = document.getElementById('emp-manual-hora').value;
  if (!empId || !fecha || !hora) { alert('Rellena todos los campos'); return; }
  const fich = fichajesLoad();
  fich.push({ empId, fecha, hora, tipo: _empManualTipo, manual: true });
  fichajesSave(fich);
  document.getElementById('emp-manual-modal').style.display = 'none';
  empRenderTrabajandoAhora();
  // Refrescar historial si está visible
  const res = document.getElementById('emp-hist-resultado');
  if (res && res.innerHTML) empVerHistorial();
}

// ── AUTO-REFRESCO ─────────────────────────────
let _empAutoRefreshTimer = null;

function empSetAutoRefresh(segundos) {
  clearInterval(_empAutoRefreshTimer);
  _empAutoRefreshTimer = null;
  const status = document.getElementById('emp-autorefresh-status');
  if (!segundos || segundos === '0') { if (status) status.textContent = ''; return; }
  const seg = parseInt(segundos);
  if (status) status.textContent = 'Próximo en ' + seg + 's';
  let cuenta = seg;
  _empAutoRefreshTimer = setInterval(() => {
    cuenta--;
    if (status) status.textContent = 'Próximo en ' + cuenta + 's';
    if (cuenta <= 0) {
      empRenderTrabajandoAhora();
      cuenta = seg;
      if (status) status.textContent = 'Actualizado · próximo en ' + seg + 's';
    }
  }, 1000);
}

function empRefrescar() {
  const btn = document.getElementById('emp-refresh-btn');
  if (btn) { btn.textContent = '✅ Actualizado'; setTimeout(()=>btn.textContent='🔄 Refrescar', 1500); }
  empRenderTrabajandoAhora();
}

function empRenderTrabajandoAhora() {
  const el=document.getElementById('emp-trabajando-ahora'); if(!el) return;
  const fichajes=fichajesLoad(); const emps=empLoadAll(); const hoy=new Date().toISOString().slice(0,10);
  const dentro=emps.filter(e=>{
    const s=fichajes.filter(f=>f.empId===e.id&&f.fecha===hoy).sort((a,b)=>a.hora.localeCompare(b.hora));
    return s.length>0&&s[s.length-1].tipo==='entrada';
  });
  if(!dentro.length){el.textContent='Nadie trabajando ahora mismo';return;}
  el.innerHTML=dentro.map(e=>{
    const ult=fichajes.filter(f=>f.empId===e.id&&f.fecha===hoy&&f.tipo==='entrada').sort((a,b)=>b.hora.localeCompare(a.hora))[0];
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0"><span style="color:#27855a;font-size:16px">●</span><span style="font-size:13px;font-weight:600;color:var(--brown)">${e.nombre.split(' ')[0]}</span><span style="font-size:12px;color:var(--muted)">desde las ${ult.hora}</span></div>`;
  }).join('');
}

function empRenderSelectHistorial() {
  const sel=document.getElementById('emp-hist-select'); if(!sel) return;
  sel.innerHTML='<option value="">— Todos —</option>'+empLoadAll().map(e=>`<option value="${e.id}">${e.nombre}</option>`).join('');
}

function empNuevoModal() {
  document.getElementById('emp-modal-titulo').textContent='Nuevo empleado';
  ['emp-edit-id','emp-nombre','emp-dni','emp-pin','emp-man-in','emp-man-out','emp-tar-in','emp-tar-out'].forEach(id=>document.getElementById(id).value='');
  document.querySelectorAll('.emp-dia-btn').forEach(b=>b.classList.remove('activo'));
  document.getElementById('emp-modal').style.display='flex';
}

function empEditarModal(id) {
  const e=empLoadAll().find(x=>x.id===id); if(!e) return;
  document.getElementById('emp-modal-titulo').textContent='Editar empleado';
  document.getElementById('emp-edit-id').value=e.id; document.getElementById('emp-nombre').value=e.nombre;
  document.getElementById('emp-dni').value=e.dni;     document.getElementById('emp-pin').value=e.pin;
  document.getElementById('emp-man-in').value=e.manIn||'';   document.getElementById('emp-man-out').value=e.manOut||'';
  document.getElementById('emp-tar-in').value=e.tarIn||'';   document.getElementById('emp-tar-out').value=e.tarOut||'';
  document.querySelectorAll('.emp-dia-btn').forEach(b=>b.classList.toggle('activo',(e.dias||[]).includes(parseInt(b.dataset.d))));
  document.getElementById('emp-modal').style.display='flex';
}

function empToggleDia(btn) { btn.classList.toggle('activo'); }

function empModalGuardar() {
  const nombre=document.getElementById('emp-nombre').value.trim();
  const pin=document.getElementById('emp-pin').value.trim();
  if(!nombre||pin.length!==4){alert('Nombre y PIN de 4 dígitos son obligatorios');return;}
  const dias=[]; document.querySelectorAll('.emp-dia-btn.activo').forEach(b=>dias.push(parseInt(b.dataset.d)));
  const emp={id:document.getElementById('emp-edit-id').value||'emp_'+Date.now(),nombre,
    dni:document.getElementById('emp-dni').value.trim(),pin,dias,
    manIn:document.getElementById('emp-man-in').value,manOut:document.getElementById('emp-man-out').value,
    tarIn:document.getElementById('emp-tar-in').value,tarOut:document.getElementById('emp-tar-out').value};
  const all=empLoadAll();
  if(all.some(e=>e.pin===pin&&e.id!==emp.id)){alert('PIN ya en uso');return;}
  const idx=all.findIndex(e=>e.id===emp.id);
  if(idx>=0) all[idx]=emp; else all.push(emp);
  empSaveAll(all); document.getElementById('emp-modal').style.display='none'; empRenderAdmin();
}

function empEliminar(id) {
  const e=empLoadAll().find(x=>x.id===id);
  if(!e||!confirm('¿Eliminar a '+e.nombre+'?')) return;
  empSaveAll(empLoadAll().filter(x=>x.id!==id)); fichajesSave(fichajesLoad().filter(f=>f.empId!==id)); empRenderAdmin();
}

function empVerHistorial() {
  const empId=document.getElementById('emp-hist-select').value;
  const mes=document.getElementById('emp-hist-mes').value;
  const el=document.getElementById('emp-hist-resultado');
  const emps=empLoadAll();
  let fich=fichajesLoad();
  if(empId) fich=fich.filter(f=>f.empId===empId);
  if(mes)   fich=fich.filter(f=>f.fecha.startsWith(mes));
  fich.sort((a,b)=>(a.fecha+a.hora).localeCompare(b.fecha+b.hora));
  if(!fich.length){el.innerHTML='<p style="font-size:13px;color:var(--muted);padding:8px 0">Sin fichajes para ese período</p>';return;}
  const byEmp={};
  fich.forEach(f=>{if(!byEmp[f.empId])byEmp[f.empId]={};if(!byEmp[f.empId][f.fecha])byEmp[f.empId][f.fecha]=[];byEmp[f.empId][f.fecha].push(f);});
  let html='';
  Object.keys(byEmp).forEach(eid=>{
    const emp=emps.find(e=>e.id===eid)||{nombre:eid}; let totalMin=0;
    html+=`<div style="margin-bottom:20px"><div style="font-size:14px;font-weight:700;color:var(--brown);margin-bottom:8px">${emp.nombre}</div>`;
    Object.keys(byEmp[eid]).sort().forEach(fecha=>{
      const ff=byEmp[eid][fecha];
      const ent=ff.filter(f=>f.tipo==='entrada');
      const sal=ff.filter(f=>f.tipo==='salida');
      let horas='—';
      if(ent.length&&sal.length){
        const[eh,em]=ent[0].hora.split(':').map(Number),[sh,sm]=sal[sal.length-1].hora.split(':').map(Number);
        let min=(sh*60+sm)-(eh*60+em); if(min<0)min+=24*60; totalMin+=min;
        horas=Math.floor(min/60)+'h'+(min%60>0?' '+min%60+'min':'');
      }
      html+=`<div style="background:var(--white);border:1.5px solid var(--warm);border-radius:10px;padding:10px;margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:13px;font-weight:700;color:var(--brown)">${fecha.slice(5).replace('-','/')}</span>
          <span style="font-size:12px;font-weight:700;color:var(--amber-dark)">${horas}</span>
        </div>`;
      ff.forEach(f=>{
        const idx=fichajesLoad().findIndex(x=>x.empId===f.empId&&x.fecha===f.fecha&&x.hora===f.hora&&x.tipo===f.tipo);
        html+=`<div style="display:flex;align-items:center;gap:8px;padding:3px 0;border-top:1px solid var(--warm)">
          <span style="font-size:12px;min-width:20px">${f.tipo==='entrada'?'🟢':'🔴'}</span>
          <span style="font-size:13px;font-weight:600;color:var(--text);flex:1">${f.hora}</span>
          <span style="font-size:11px;color:var(--muted)">${f.tipo}</span>
          <button onclick="empEditarFichaje(${idx})" style="padding:3px 8px;background:var(--amber-light);color:var(--amber-dark);border:1.5px solid var(--amber);border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">✏️</button>
          <button onclick="empEliminarFichaje(${idx})" style="padding:3px 8px;background:#fdf0ee;color:#c0392b;border:1.5px solid #c0392b;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">🗑️</button>
        </div>`;
      });
      html+=`</div>`;
    });
    const th=Math.floor(totalMin/60),tm=totalMin%60;
    html+=`<div style="text-align:right;font-size:13px;font-weight:700;color:var(--brown);padding:4px 0 8px">Total: ${th}h${tm>0?' '+tm+'min':''}</div></div>`;
  });
  el.innerHTML=html;
}

function empEditarFichaje(idx) {
  const fich=fichajesLoad();
  if(!fich[idx]) return;
  const f=fich[idx];
  const nuevaHora=prompt(`Editar hora de ${f.tipo} del ${f.fecha}:\nHora actual: ${f.hora}\n\nNueva hora (formato HH:MM):`, f.hora);
  if(!nuevaHora||!nuevaHora.match(/^\d{2}:\d{2}$/)){if(nuevaHora!==null)alert('Formato incorrecto. Usa HH:MM');return;}
  fich[idx].hora=nuevaHora;
  fichajesSave(fich);
  empVerHistorial();
}

function empEliminarFichaje(idx) {
  const fich=fichajesLoad();
  if(!fich[idx]) return;
  const f=fich[idx];
  if(!confirm(`¿Eliminar fichaje?\n${f.tipo} — ${f.fecha} ${f.hora}`)) return;
  fich.splice(idx,1);
  fichajesSave(fich);
  empVerHistorial();
}

async function empGenerarDocumento() {
  const empId=document.getElementById('emp-hist-select').value;
  const mes=document.getElementById('emp-hist-mes').value;
  if(!empId){alert('Selecciona un empleado');return;} if(!mes){alert('Selecciona el mes');return;}
  const emp=empLoadAll().find(e=>e.id===empId); if(!emp) return;
  const[anio,mesN]=mes.split('-').map(Number);
  const diasEnMes=new Date(anio,mesN,0).getDate();
  const mesNombre=new Date(anio,mesN-1,1).toLocaleString('es-ES',{month:'long',year:'numeric'}).toUpperCase();
  const porDia={};
  fichajesLoad().filter(f=>f.empId===empId&&f.fecha.startsWith(mes)).forEach(f=>{
    const d=parseInt(f.fecha.slice(8));
    if(!porDia[d])porDia[d]={e:[],s:[]};
    if(f.tipo==='entrada')porDia[d].e.push(f.hora); else porDia[d].s.push(f.hora);
  });
  let totalMin=0,filas='';
  for(let d=1;d<=diasEnMes;d++){
    const dd=porDia[d]; let manIn='',manOut='',tarIn='',tarOut='',horas='';
    if(dd){
      dd.e.forEach(h=>{const hh=parseInt(h);if(hh<15)manIn=h;else tarIn=h;});
      dd.s.forEach(h=>{const hh=parseInt(h);if(hh<15&&hh>6)manOut=h;else tarOut=h;});
      let min=0;
      [[manIn,manOut],[tarIn,tarOut]].forEach(([ei,si])=>{
        if(ei&&si){const[eh,em]=ei.split(':').map(Number),[sh,sm]=si.split(':').map(Number);let diff=(sh*60+sm)-(eh*60+em);if(diff<0)diff+=24*60;min+=diff;}
      });
      if(min>0){totalMin+=min;horas=Math.floor(min/60)+(min%60>0?'.'+min%60:'');}
    }
    filas+=`<tr><td style="text-align:center;border:1px solid #000;padding:3px">${d}</td><td style="text-align:center;border:1px solid #000;padding:3px">${manIn}</td><td style="text-align:center;border:1px solid #000;padding:3px">${tarIn}</td><td style="text-align:center;border:1px solid #000;padding:3px">${manOut}</td><td style="text-align:center;border:1px solid #000;padding:3px">${tarOut}</td><td style="text-align:center;border:1px solid #000;padding:3px">${horas}</td><td style="border:1px solid #000;padding:3px"></td></tr>`;
  }
  const html=`<html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;font-size:10pt;margin:20mm}table{border-collapse:collapse;width:100%}th{background:#ddd;border:1px solid #000;padding:4px;text-align:center;font-size:9pt}td{border:1px solid #000;padding:3px;font-size:9pt}.t{font-size:12pt;font-weight:bold;text-align:center;margin-bottom:10px}.c td{border:none;padding:2px 4px}</style></head><body>
    <div class="t">REGISTRO DIARIO DE JORNADA DE TRABAJO</div>
    <table class="c"><tr><td><b>Razón social:</b> ${getEmpEmpresa()}</td><td><b>Nombre:</b> ${emp.nombre}</td></tr><tr><td><b>CIF:</b> ${getEmpCIF()}</td><td><b>DNI:</b> ${emp.dni}</td></tr><tr><td></td><td><b>Fecha:</b> ${mesNombre}</td></tr></table>
    <table><thead><tr><th rowspan="2">Día</th><th colspan="2">Hora de entrada</th><th colspan="2">Hora de salida</th><th rowspan="2">Total horas</th><th rowspan="2">Firma</th></tr><tr><th>Mañana</th><th>Tarde</th><th>Mañana</th><th>Tarde</th></tr></thead><tbody>${filas}</tbody>
    <tfoot><tr><td colspan="5" style="text-align:right;font-weight:bold;border:1px solid #000;padding:4px">TOTAL MES</td><td style="text-align:center;font-weight:bold;border:1px solid #000;padding:4px">${Math.floor(totalMin/60)}</td><td style="border:1px solid #000"></td></tr></tfoot></table>
    </body></html>`;
  const blob=new Blob([html],{type:'application/msword'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=emp.nombre.split(' ')[0].toUpperCase()+'_'+mes.replace('-','_')+'.doc'; a.click(); URL.revokeObjectURL(url);
}

// ── PANTALLA FICHAJE ──────────────────────────
let _ficharPin='', _ficharEmpActivo=null;

function ficharMostrarOverlay() { document.getElementById('fichar-overlay').classList.add('open'); ficharIrVistaPIN(); }
function ficharIrVistaPIN() {
  _ficharPin=''; _ficharEmpActivo=null; ficharActualizarDots();
  document.getElementById('fichar-pin-view').style.display='block';
  document.getElementById('fichar-emp-view').style.display='none';
  document.getElementById('fichar-ok-view').style.display='none';
  document.getElementById('fichar-pin-error').style.display='none';
}
function ficharPin(d) { if(_ficharPin.length>=4)return; _ficharPin+=d; ficharActualizarDots(); if(_ficharPin.length===4)setTimeout(ficharPinOk,100); }
function ficharPinBorrar() { _ficharPin=_ficharPin.slice(0,-1); ficharActualizarDots(); }
function ficharActualizarDots() { document.querySelectorAll('.pin-dot').forEach((d,i)=>d.classList.toggle('filled',i<_ficharPin.length)); }
function ficharPinOk() {
  const emp=empLoadAll().find(e=>e.pin===_ficharPin);
  if(!emp){document.getElementById('fichar-pin-error').style.display='block';_ficharPin='';ficharActualizarDots();return;}
  _ficharEmpActivo=emp; ficharMostrarVista(emp);
}
function ficharMostrarVista(emp) {
  document.getElementById('fichar-pin-view').style.display  = 'none';
  document.getElementById('fichar-emp-view').style.display  = 'block';
  document.getElementById('fichar-ok-view').style.display   = 'none';

  // Saludo y fecha
  document.getElementById('fichar-emp-saludo').textContent = 'Hola, ' + emp.nombre.split(' ')[0] + ' 👋';
  const hoy = new Date();
  const hoyStr = hoy.toISOString().slice(0,10);
  const hoyLabel = hoy.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
  document.getElementById('fichar-fecha-hoy').textContent = hoyLabel.charAt(0).toUpperCase() + hoyLabel.slice(1);

  // Estado: ¿dentro o fuera?
  const fich = fichajesLoad();
  const suyosHoy = fich.filter(f => f.empId===emp.id && f.fecha===hoyStr).sort((a,b)=>a.hora.localeCompare(b.hora));
  const dentro = suyosHoy.length > 0 && suyosHoy[suyosHoy.length-1].tipo === 'entrada';
  document.getElementById('fichar-emp-estado').textContent = dentro ? '🟢 Estás trabajando' : '⚪ No has fichado entrada hoy';

  // Botones siempre activos, solo cambia el estilo visual
  const btnE = document.getElementById('fichar-btn-entrada');
  const btnS = document.getElementById('fichar-btn-salida');
  btnE.style.opacity = dentro ? '0.5' : '1';
  btnS.style.opacity = dentro ? '1'   : '0.5';
  btnE.style.pointerEvents = 'auto';
  btnS.style.pointerEvents = 'auto';

  // Resumen del mes
  const mes = hoy.toISOString().slice(0,7);
  const porDia = {};
  fich.filter(f => f.empId===emp.id && f.fecha.startsWith(mes)).forEach(f => {
    if (!porDia[f.fecha]) porDia[f.fecha] = {e:[],s:[]};
    if (f.tipo==='entrada') porDia[f.fecha].e.push(f.hora); else porDia[f.fecha].s.push(f.hora);
  });
  let totalMin=0, dias=new Set();
  Object.keys(porDia).forEach(fecha => {
    const {e,s} = porDia[fecha];
    if (e.length && s.length) {
      dias.add(fecha);
      const [eh,em]=e[0].split(':').map(Number), [sh,sm]=s[s.length-1].split(':').map(Number);
      let diff=(sh*60+sm)-(eh*60+em); if(diff<0)diff+=24*60; totalMin+=diff;
    }
  });
  const th=Math.floor(totalMin/60), tm=totalMin%60;
  const mesN = hoy.toLocaleString('es-ES',{month:'long'});
  document.getElementById('fichar-resumen-mes').innerHTML =
    '<b>' + mesN.charAt(0).toUpperCase()+mesN.slice(1) + ':</b><br>' +
    'Días trabajados: <b>' + dias.size + '</b><br>' +
    'Horas totales: <b>' + th + 'h' + (tm>0?' '+tm+'min':'') + '</b>';

  // Últimos fichajes
  const rec = fich.filter(f=>f.empId===emp.id).sort((a,b)=>(b.fecha+b.hora).localeCompare(a.fecha+a.hora)).slice(0,8);
  document.getElementById('fichar-historial-reciente').innerHTML = rec.length
    ? rec.map(f => '<div>' + f.fecha.slice(5).replace('-','/') + ' ' + f.hora + ' — ' + (f.tipo==='entrada'?'🟢 Entrada':'🔴 Salida') + (f.auto?' <span style="font-size:10px;color:var(--muted)">(auto)</span>':'') + '</div>').join('')
    : '<span style="color:var(--muted)">Sin fichajes recientes</span>';
}

function ficharRegistrar(tipo) {
  if (!_ficharEmpActivo) { alert('Error: no hay empleado activo'); return; }
  const ahora = new Date();
  const fecha = ahora.toISOString().slice(0,10);
  const hora  = ahora.toTimeString().slice(0,5);
  const fich  = fichajesLoad();
  // Guardia: evitar doble entrada o doble salida consecutiva
  const suyosHoy = fich.filter(f => f.empId === _ficharEmpActivo.id && f.fecha === fecha)
                       .sort((a,b) => a.hora.localeCompare(b.hora));
  const ultimoTipo = suyosHoy.length > 0 ? suyosHoy[suyosHoy.length-1].tipo : null;
  if (tipo === 'entrada' && ultimoTipo === 'entrada') {
    alert('Ya tienes una entrada registrada. Registra primero la salida.');
    return;
  }
  if (tipo === 'salida' && ultimoTipo !== 'entrada') {
    alert('No tienes una entrada activa. Registra primero la entrada.');
    return;
  }
  fich.push({ empId: _ficharEmpActivo.id, fecha, hora, tipo });
  fichajesSave(fich);

  // Mostrar confirmación
  document.getElementById('fichar-emp-view').style.display = 'none';
  document.getElementById('fichar-ok-view').style.display  = 'block';
  document.getElementById('fichar-ok-icon').textContent = tipo === 'entrada' ? '🟢' : '🔴';
  document.getElementById('fichar-ok-msg').textContent  = tipo === 'entrada' ? '¡Entrada registrada!' : '¡Salida registrada!';
  const fechaLabel = ahora.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
  document.getElementById('fichar-ok-hora').textContent = fechaLabel.charAt(0).toUpperCase()+fechaLabel.slice(1) + ' · ' + hora;
}
function ficharVolverEmp()   { ficharMostrarVista(_ficharEmpActivo); }
function ficharCerrarSesion(){ _ficharEmpActivo=null; ficharIrVistaPIN(); }

// ── Datos empresa ───────────────────────────────────────────────────────────
function empCargarEmpresaUI() {
  const eEl = document.getElementById('emp-empresa-input');
  const cEl = document.getElementById('emp-cif-input');
  if (eEl) eEl.value = getEmpEmpresa();
  if (cEl) cEl.value = getEmpCIF();
}

function empGuardarEmpresa() {
  const empresa = document.getElementById('emp-empresa-input').value.trim();
  const cif     = document.getElementById('emp-cif-input').value.trim();
  localStorage.setItem(EMP_EMPRESA_KEY, empresa);
  localStorage.setItem(EMP_CIF_KEY, cif);
  if (window.fb_saveEmpresa) window.fb_saveEmpresa(empresa, cif).catch(() => {});
  const ok = document.getElementById('emp-empresa-ok');
  if (ok) { ok.style.display = 'block'; setTimeout(() => ok.style.display = 'none', 2000); }
  logActivity('🏢 Datos empresa actualizados');
}

// ── Borrar fichajes por fecha ────────────────────────────────────────────────
function empBorrarFechaModal() {
  // Rellenar select de empleados
  const sel = document.getElementById('emp-borrar-emp-sel');
  sel.innerHTML = '<option value="">— Todos los empleados —</option>' +
    empLoadAll().map(e => `<option value="${e.id}">${e.nombre.split(' ')[0]} ${e.nombre.split(' ')[1]||''}</option>`).join('');
  // Fecha por defecto: hoy
  document.getElementById('emp-borrar-fecha-input').value = new Date().toISOString().slice(0,10);
  document.getElementById('emp-borrar-preview').textContent = '';
  document.getElementById('emp-borrar-fecha-modal').style.display = 'flex';
  // Preview en tiempo real
  const update = () => empBorrarFechaPreview();
  document.getElementById('emp-borrar-fecha-input').oninput = update;
  document.getElementById('emp-borrar-emp-sel').onchange = update;
  empBorrarFechaPreview();
}

function empBorrarFechaPreview() {
  const fecha  = document.getElementById('emp-borrar-fecha-input').value;
  const empId  = document.getElementById('emp-borrar-emp-sel').value;
  const prev   = document.getElementById('emp-borrar-preview');
  if (!fecha) { prev.textContent = ''; return; }
  const fich   = fichajesLoad();
  const cuenta = fich.filter(f => f.fecha === fecha && (!empId || f.empId === empId)).length;
  prev.textContent = cuenta > 0
    ? `⚠️ Se borrarán ${cuenta} fichaje${cuenta !== 1 ? 's' : ''} de esa fecha.`
    : '✅ No hay fichajes en esa fecha.';
  prev.style.color = cuenta > 0 ? '#c0392b' : '#27855a';
}

function empBorrarFechaConfirmar() {
  const fecha = document.getElementById('emp-borrar-fecha-input').value;
  const empId = document.getElementById('emp-borrar-emp-sel').value;
  if (!fecha) { alert('Selecciona una fecha'); return; }
  const fich    = fichajesLoad();
  const borrar  = fich.filter(f => f.fecha === fecha && (!empId || f.empId === empId)).length;
  if (borrar === 0) { alert('No hay fichajes en esa fecha.'); return; }
  const quien   = empId ? empLoadAll().find(e=>e.id===empId)?.nombre.split(' ')[0] : 'todos los empleados';
  if (!confirm(`¿Borrar ${borrar} fichaje${borrar!==1?'s':''} del ${fecha} de ${quien}?`)) return;
  const nuevos  = fich.filter(f => !(f.fecha === fecha && (!empId || f.empId === empId)));
  fichajesSave(nuevos);
  document.getElementById('emp-borrar-fecha-modal').style.display = 'none';
  empRenderAdmin();
  logActivity(`🗑️ Borrados ${borrar} fichaje${borrar!==1?'s':''} del ${fecha}${empId?' ('+quien+')':''}`);
}

// ── Migración / comprobación Firebase ──────────────────────────────────────
async function empCheckFirebaseBanner() {
  const banner = document.getElementById('emp-firebase-banner');
  if (!banner) return;
  // Si Firebase no está listo todavía, escondemos el banner y esperamos
  if (!window.fb_loadEmpleados) { banner.style.display = 'none'; return; }
  try {
    const fbData = await window.fb_loadEmpleados();
    const localData = empLoadAll();
    // Mostrar banner solo si hay empleados en local pero Firebase está vacío
    if ((!fbData || fbData.length === 0) && localData.length > 0) {
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
  } catch(e) {
    banner.style.display = 'none';
  }
}

// ── Migración PP2 + Stock a Firebase ──
async function pp2MigrarAFirebase() {
  const btn = document.querySelector('#pp2-firebase-banner button');
  if (btn) { btn.disabled = true; btn.textContent = 'Subiendo…'; }
  try {
    const keys = {
      state:       'dpf_pedidos_prov_list',
      custom:      'dpf_pp_custom_items',
      hidden:      'dpf_pp_hidden_items',
      provHab:     'dpf_pp_prov_habitual',
      minimos:     'dpf_pp_minimos',
      historial:   'dpf_pp_historial',
      customProvs: 'dpf_pp_custom_provs',
      order:       'dpf_pp_order',
    };
    const promises = Object.entries(keys).map(([fbKey, lsKey]) => {
      try {
        const val = JSON.parse(localStorage.getItem(lsKey) || 'null');
        if (val !== null && window.fb_savePP2) return window.fb_savePP2(fbKey, val);
      } catch(e) {}
      return Promise.resolve();
    });
    // También subir historial de stock
    try {
      const stockHist = JSON.parse(localStorage.getItem('dpf_stock_historial') || 'null');
      if (stockHist && window.fb_saveStockHistorial) promises.push(window.fb_saveStockHistorial(stockHist));
    } catch(e) {}
    await Promise.all(promises);
    document.getElementById('pp2-firebase-banner').style.display = 'none';
    alert('✅ Stock y pedidos subidos a Firebase. Ahora tu socio los verá en todos los dispositivos.');
  } catch(e) {
    alert('❌ Error al subir a Firebase: ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = '☁️ Subir a Firebase ahora'; }
  }
}

async function pp2CheckFirebaseBanner() {
  const banner = document.getElementById('pp2-firebase-banner');
  if (!banner || !window.fb_loadPP2) return;
  try {
    // Comprobar si hay datos en local pero no en Firebase
    const localState = localStorage.getItem('dpf_pedidos_prov_list');
    const localStock = localStorage.getItem('dpf_stock_historial');
    const hasLocal = (localState && localState !== '{}') || (localStock && localStock !== '[]');
    if (!hasLocal) return; // nada que migrar
    const fbState = await window.fb_loadPP2('state');
    const fbEmpty = !fbState || (typeof fbState === 'object' && Object.keys(fbState).length === 0);
    banner.style.display = fbEmpty ? 'block' : 'none';
  } catch(e) {}
}

async function pp2SincronizarStock() {
  const btn = document.getElementById('pp2-sync-stock-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Sincronizando…'; }
  try {
    if (window.fb_syncPP2toLocal) {
      await window.fb_syncPP2toLocal();
    }
    pp2Render();
    if (btn) {
      btn.textContent = '✅ Sincronizado';
      btn.style.color = '#fff';
      btn.style.background = '#1a7a4a';
      btn.style.border = '2px solid #1a7a4a';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = '📦 Sincronizar stock';
        btn.style.color = '#1a7a4a';
        btn.style.background = 'var(--white)';
        btn.style.border = '2px solid #1a7a4a';
      }, 2000);
    }
  } catch(e) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '📦 Sincronizar stock';
      btn.style.color = '#1a7a4a';
      btn.style.background = 'var(--white)';
    }
    alert('❌ Error al sincronizar: ' + e.message);
  }
}

async function empMigrarAFirebase() {
  const btn = document.querySelector('#emp-firebase-banner button');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }
  try {
    const localData = empLoadAll();
    if (!localData.length) { alert('No hay empleados en este dispositivo para guardar.'); return; }
    await window.fb_saveEmpleados(localData);
    document.getElementById('emp-firebase-banner').style.display = 'none';
    alert('✅ Empleados guardados en Firebase correctamente. Ya están disponibles en todos los dispositivos.');
  } catch(e) {
    alert('❌ Error al guardar en Firebase: ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = '☁️ Guardar en Firebase ahora'; }
  }
}

// Cargar sección empleados al activar la pestaña
document.addEventListener('DOMContentLoaded', ()=>{
  const orig=window.showAdminSection;
  if(orig) window.showAdminSection=function(id,btn){ orig(id,btn); if(id==='empleados') { setTimeout(empRenderAdmin,50); setTimeout(empCheckFirebaseBanner,300); setTimeout(empCargarEmpresaUI,50); } };
});

// Comprobar token fichaje en URL
(function(){
  const params=new URLSearchParams(window.location.search);
  const key=params.get('fichar'); if(!key) return;

  function abrirFichar() {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', () => setTimeout(ficharMostrarOverlay, 300));
    } else {
      setTimeout(ficharMostrarOverlay, 300);
    }
  }

  // Primero comprobar localStorage (rápido)
  const saved = getFicharToken();
  if (saved && key === saved) { abrirFichar(); return; }

  // Si no está en localStorage, consultar Firebase
  function checkFirebase() {
    if (window.fb_loadFicharToken) {
      window.fb_loadFicharToken().then(fbToken => {
        if (fbToken && key === fbToken) {
          localStorage.setItem(EMP_FICHAR_KEY, fbToken); // cachear para futuras visitas
          abrirFichar();
        }
      }).catch(() => {});
    }
  }

  if (window._firebaseReady) {
    checkFirebase();
  } else {
    document.addEventListener('firebaseReady', checkFirebase);
  }
})();
