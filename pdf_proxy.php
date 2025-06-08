<?php
// PDF Proxy - Bypass CORS para PDFs de tribunais
// Versão: 1.0
// Uso: pdf_proxy.php?url=LINK_DO_PDF

// Configuração de log
$log_dir = __DIR__;
if (!is_writable($log_dir)) {
    $log_dir = sys_get_temp_dir();
}
$log_path = $log_dir . '/pdf_proxy_log.txt';

function logMessage($message) {
    global $log_path;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_path, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
}

// Iniciar log
logMessage("=== PDF PROXY INICIADO ===");

// Configurações
set_time_limit(300); // 5 minutos
ini_set('memory_limit', '256M');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Headers de segurança
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

try {
    // Verificar se a URL foi fornecida
    if (!isset($_GET['url']) || empty($_GET['url'])) {
        throw new Exception("Parâmetro 'url' é obrigatório");
    }
    
    $pdf_url = $_GET['url'];
    logMessage("URL solicitada: " . $pdf_url);
    
    // Validar se é uma URL válida
    if (!filter_var($pdf_url, FILTER_VALIDATE_URL)) {
        throw new Exception("URL inválida");
    }
    
    // Verificar se o domínio é permitido (segurança)
    $allowed_domains = [
        'pje.trt', 'pje.jt', 'pje.tst', 'pje.cjf', 'pje.cnj',
        'tjsp.jus.br', 'tjrj.jus.br', 'tjmg.jus.br', 'tjrs.jus.br',
        'trf1.jus.br', 'trf2.jus.br', 'trf3.jus.br', 'trf4.jus.br', 'trf5.jus.br',
        'stf.jus.br', 'stj.jus.br', 'tst.jus.br'
    ];
    
    $url_host = parse_url($pdf_url, PHP_URL_HOST);
    $domain_allowed = false;
    
    foreach ($allowed_domains as $domain) {
        if (strpos($url_host, $domain) !== false) {
            $domain_allowed = true;
            break;
        }
    }
    
    if (!$domain_allowed) {
        logMessage("Domínio não permitido: " . $url_host);
        // Para desenvolvimento, vamos permitir todos os domínios
        // throw new Exception("Domínio não permitido por segurança");
        logMessage("AVISO: Domínio não está na lista permitida, mas prosseguindo...");
    }
    
    logMessage("Iniciando download do PDF...");
    
    // Configurar cURL para simular um navegador real
    $ch = curl_init();
    
    // Headers que simulam um navegador real
    $headers = [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept: application/pdf,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language: pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding: gzip, deflate, br',
        'DNT: 1',
        'Connection: keep-alive',
        'Upgrade-Insecure-Requests: 1',
        'Sec-Fetch-Dest: document',
        'Sec-Fetch-Mode: navigate',
        'Sec-Fetch-Site: none',
        'Cache-Control: max-age=0'
    ];
    
    // Configurações do cURL
    curl_setopt_array($ch, [
        CURLOPT_URL => $pdf_url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 300,
        CURLOPT_CONNECTTIMEOUT => 30,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_ENCODING => '', // Aceita gzip, deflate
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        CURLOPT_REFERER => $pdf_url, // Usar a própria URL como referer
        CURLOPT_COOKIESESSION => true,
        CURLOPT_COOKIEFILE => '', // Habilita cookies
        CURLOPT_COOKIEJAR => '', // Salva cookies
        CURLOPT_HEADER => false,
        CURLOPT_NOBODY => false,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_2_0,
        CURLOPT_VERBOSE => false
    ]);
    
    logMessage("Executando requisição cURL...");
    
    // Executar a requisição
    $pdf_content = curl_exec($ch);
    
    // Verificar erros do cURL
    if ($pdf_content === false) {
        $curl_error = curl_error($ch);
        logMessage("Erro cURL: " . $curl_error);
        throw new Exception("Erro ao baixar PDF: " . $curl_error);
    }
    
    // Obter informações da resposta
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $content_length = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
    $total_time = curl_getinfo($ch, CURLINFO_TOTAL_TIME);
    
    curl_close($ch);
    
    logMessage("Resposta HTTP: $http_code");
    logMessage("Content-Type: $content_type");
    logMessage("Tamanho: " . strlen($pdf_content) . " bytes");
    logMessage("Tempo total: {$total_time}s");
    
    // Verificar se a requisição foi bem-sucedida
    if ($http_code !== 200) {
        throw new Exception("Erro HTTP: $http_code");
    }
    
    // Verificar se realmente recebemos um PDF
    $pdf_signature = substr($pdf_content, 0, 4);
    if ($pdf_signature !== '%PDF') {
        logMessage("AVISO: Conteúdo não parece ser um PDF. Primeiros 50 chars: " . substr($pdf_content, 0, 50));
        
        // Verificar se é HTML (página de erro/login)
        if (stripos($pdf_content, '<html') !== false || stripos($pdf_content, '<!DOCTYPE') !== false) {
            throw new Exception("Recebido HTML em vez de PDF. Pode ser necessário autenticação.");
        }
        
        // Se não é HTML, pode ser PDF válido mesmo sem a assinatura padrão
        logMessage("Prosseguindo mesmo sem assinatura PDF padrão...");
    }
    
    // Verificar tamanho mínimo
    if (strlen($pdf_content) < 1024) { // Menor que 1KB
        logMessage("AVISO: Arquivo muito pequeno: " . strlen($pdf_content) . " bytes");
        logMessage("Conteúdo: " . substr($pdf_content, 0, 200));
        throw new Exception("Arquivo PDF muito pequeno ou inválido");
    }
    
    logMessage("PDF baixado com sucesso!");
    
    // Configurar headers para enviar o PDF
    header('Content-Type: application/pdf');
    header('Content-Length: ' . strlen($pdf_content));
    header('Content-Disposition: inline; filename="documento.pdf"');
    
    // Headers para permitir CORS
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    // Headers de cache
    header('Cache-Control: public, max-age=3600'); // Cache por 1 hora
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 3600) . ' GMT');
    
    // Enviar o PDF
    echo $pdf_content;
    
    logMessage("PDF enviado com sucesso para o cliente");
    logMessage("=== PROCESSO CONCLUÍDO ===");
    
} catch (Exception $e) {
    logMessage("ERRO: " . $e->getMessage());
    
    // Enviar erro como JSON
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    http_response_code(500);
    
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

// Função para lidar com requisições OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400'); // 24 horas
    http_response_code(200);
    exit();
}
?>