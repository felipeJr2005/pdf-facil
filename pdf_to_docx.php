<?php
// Verificar permissões de gravação no diretório
$log_dir = __DIR__;
if (!is_writable($log_dir)) {
    // Tente usar um diretório temporário se o atual não for gravável
    $log_dir = sys_get_temp_dir();
}
$log_path = $log_dir . '/pdf_docx_log.txt';

// Iniciar arquivo de log
file_put_contents($log_path, "[" . date('Y-m-d H:i:s') . "] Iniciando conversão\n");

function logMessage($message) {
    global $log_path;
    file_put_contents($log_path, "[" . date('Y-m-d H:i:s') . "] " . $message . "\n", FILE_APPEND);
}

// Desativar limite de tempo
set_time_limit(0);

// Ativar exibição de erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    logMessage("Verificando arquivo enviado");
    if (!isset($_FILES["file"])) {
        throw new Exception("Nenhum arquivo enviado");
    }
    
    $file = $_FILES["file"];
    logMessage("Arquivo recebido: " . $file["name"]);
    
    if ($file["error"] !== UPLOAD_ERR_OK) {
        throw new Exception("Erro no upload: " . $file["error"]);
    }
    
    // URL da API
    $api_url = "https://pdffacil-jwuynw.fly.dev/pdf-to-docx/";
    logMessage("URL da API: " . $api_url);
    
    // Verificar se o arquivo temporário existe
    if (!is_uploaded_file($file["tmp_name"])) {
        throw new Exception("Arquivo temporário não encontrado: " . $file["tmp_name"]);
    }
    logMessage("Arquivo temporário OK: " . $file["tmp_name"]);
    
    // Iniciar cURL
    $curl = curl_init();
    if ($curl === false) {
        throw new Exception("Falha ao inicializar cURL");
    }
    logMessage("cURL inicializado");
    
    // Configurar cURL
    $curlfile = new CURLFile($file["tmp_name"], $file["type"], $file["name"]);
    logMessage("CURLFile criado");
    
    curl_setopt($curl, CURLOPT_URL, $api_url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, array('file' => $curlfile));
    curl_setopt($curl, CURLOPT_TIMEOUT, 300); // 5 minutos
    logMessage("cURL configurado");
    
    // Executar requisição
    logMessage("Enviando requisição para a API");
    $response = curl_exec($curl);
    
    if ($response === false) {
        $curl_error = curl_error($curl);
        logMessage("Erro cURL: " . $curl_error);
        throw new Exception("Erro ao enviar arquivo: " . $curl_error);
    }
    
    $http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $content_type = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);
    logMessage("Resposta HTTP: " . $http_code . ", Tipo: " . $content_type);
    
    curl_close($curl);
    logMessage("cURL finalizado");
    
    if ($http_code !== 200) {
        if (strpos($content_type, 'application/json') !== false) {
            $error_data = json_decode($response, true);
            if ($error_data && isset($error_data['detail'])) {
                throw new Exception($error_data['detail']);
            }
        }
        throw new Exception("Erro no servidor: HTTP " . $http_code);
    }
    
    // Retornar o DOCX
    logMessage("Enviando arquivo DOCX para o cliente");
    header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    header('Content-Disposition: attachment; filename="' . pathinfo($file["name"], PATHINFO_FILENAME) . '.docx"');
    header('Content-Length: ' . strlen($response));
    echo $response;
    logMessage("Conversão concluída com sucesso");
    
} catch (Exception $e) {
    logMessage("ERRO: " . $e->getMessage());
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>