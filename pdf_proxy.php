<?php
// PDF Proxy Simplificado - Versão 2.2
// Foco na funcionalidade essencial

// Teste de ping
if (isset($_GET['test']) && $_GET['test'] === 'ping') {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    echo json_encode([
        'status' => 'ok',
        'message' => 'PDF Proxy v2.2 funcionando',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit();
}

// Configurações básicas
set_time_limit(300);
ini_set('memory_limit', '256M');

// Log simples
$log_path = __DIR__ . '/proxy_log.txt';
function logMsg($msg) {
    global $log_path;
    file_put_contents($log_path, "[" . date('Y-m-d H:i:s') . "] $msg\n", FILE_APPEND);
}

try {
    logMsg("=== PROXY INICIADO ===");
    
    // Verificar URL
    if (!isset($_GET['url']) || empty($_GET['url'])) {
        throw new Exception("URL obrigatória");
    }
    
    $url = $_GET['url'];
    $action = $_GET['action'] ?? 'proxy';
    $force = isset($_GET['force']); // Forçar download mesmo com login
    $debug = isset($_GET['debug']);
    
    logMsg("URL: $url");
    logMsg("Ação: $action");
    logMsg("Forçar: " . ($force ? 'sim' : 'não'));
    
    // Headers especiais para PJe (simular navegador logado)
    $headers = [
        'Accept: application/pdf,text/html,application/xhtml+xml,*/*;q=0.9',
        'Accept-Language: pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding: gzip, deflate, br',
        'Connection: keep-alive',
        'Upgrade-Insecure-Requests: 1',
        'Sec-Fetch-Dest: document',
        'Sec-Fetch-Mode: navigate',
        'Sec-Fetch-Site: same-origin',
        'Cache-Control: no-cache',
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    
    // Se é PJe, adicionar headers específicos
    if (strpos($url, 'pje.') !== false) {
        $headers[] = 'Referer: https://pje.cloud.tjpe.jus.br/1g/';
        $headers[] = 'X-Requested-With: XMLHttpRequest';
    }
    
    // Configurar cURL
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 120,
        CURLOPT_CONNECTTIMEOUT => 30,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_ENCODING => '', // Aceitar gzip
        CURLOPT_COOKIESESSION => true,
        CURLOPT_COOKIEFILE => '', // Usar cookies
        CURLOPT_COOKIEJAR => '',  // Salvar cookies
    ]);
    
    logMsg("Executando cURL...");
    $content = curl_exec($ch);
    
    if ($content === false) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new Exception("Erro cURL: $error");
    }
    
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);
    
    logMsg("HTTP: $httpCode, Tipo: $contentType, Tamanho: " . strlen($content));
    
    // Verificar resposta
    if ($httpCode !== 200) {
        throw new Exception("HTTP $httpCode");
    }
    
    // Verificar se é PDF
    $isPdf = (substr($content, 0, 4) === '%PDF');
    $isHtml = (stripos($content, '<html') !== false);
    
    if ($isPdf) {
        logMsg("PDF detectado");
        
        // Headers CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        
        if ($action === 'download') {
            // Forçar download
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="documento.pdf"');
            header('Content-Length: ' . strlen($content));
        } else {
            // Visualização normal
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="documento.pdf"');
            header('Content-Length: ' . strlen($content));
        }
        
        echo $content;
        logMsg("PDF enviado com sucesso");
        
    } else {
        logMsg("Não é PDF - HTML detectado: " . ($isHtml ? 'sim' : 'não'));
        
        if ($isHtml) {
            // Página de login detectada
            $preview = strip_tags(substr($content, 0, 200));
            $error = [
                'error' => true,
                'message' => 'Página de login detectada',
                'preview' => $preview,
                'suggestion' => 'Use iframe para fazer login primeiro'
            ];
        } else {
            $error = [
                'error' => true,
                'message' => 'Conteúdo não é PDF',
                'content_type' => $contentType
            ];
        }
        
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        http_response_code(400);
        echo json_encode($error);
    }
    
} catch (Exception $e) {
    logMsg("ERRO: " . $e->getMessage());
    
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}

logMsg("=== PROXY FINALIZADO ===");
?>