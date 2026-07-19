<?php
header('Access-Control-Allow-Origin: https://pedidos.dulcepatatafood.es');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

require_once __DIR__ . '/twilio-config.php';

$data = json_decode(file_get_contents('php://input'), true);
$phone = isset($data['phone']) ? preg_replace('/[^0-9+]/', '', $data['phone']) : '';
$code  = isset($data['code'])  ? preg_replace('/[^0-9]/', '', $data['code'])   : '';

if (empty($phone) || empty($code)) {
    echo json_encode(['error' => 'Datos incompletos']);
    exit();
}

if (!str_starts_with($phone, '+')) {
    if (str_starts_with($phone, '34')) {
        $phone = '+' . $phone;
    } else {
        $phone = '+34' . $phone;
    }
}

$url = 'https://verify.twilio.com/v2/Services/' . TWILIO_SERVICE_SID . '/VerificationCheck';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'To'   => $phone,
    'Code' => $code
]));
curl_setopt($ch, CURLOPT_USERPWD, TWILIO_ACCOUNT_SID . ':' . TWILIO_AUTH_TOKEN);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

if (isset($result['status']) && $result['status'] === 'approved') {
    echo json_encode(['success' => true, 'verified' => true]);
} else {
    echo json_encode(['success' => false, 'verified' => false, 'error' => 'Código incorrecto']);
}
