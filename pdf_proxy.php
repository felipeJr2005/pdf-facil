<?php
// PDF Proxy - Bypass CORS para PDFs de tribunais
// Versão: 2.0 - Com melhorias para PJe e debug avançado
// Uso: pdf_proxy.php?url=LINK_DO_PDF&debug=1&strategy=iframe

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

function debugLog($message) {
    global $debug_mode;
    if ($debug_mode) {
        logMessage("DEBUG: " . $message);
    }
}

// Iniciar log
logMessage("=== PDF PROXY V2.0 INICIADO ===");

// Configurações
set_time_limit(300); // 5 minutos
ini_set('memory_limit', '512M'); // Aumentado para 512MB
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Parâmetros
$debug_mode = isset($_GET['debug']) && $_GET['debug'] == '1';
$strategy = $_GET['strategy'] ?? 'direct'; // direct, iframe, session
$save_response = isset($_GET['save']) && $_GET['save'] == '1';

logMessage("Modo debug: " . ($debug_mode ? 'ATIVADO' : 'DESATIVADO'));
logMessage("Estratégia: " . $strategy);

// Headers de segurança
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN'); // Alterado para permitir iframe
header('X-XSS-Protection: 1; mode=block');

try {
    // Verificar se a URL foi fornecida
    if (!isset($_GET['url']) || empty($_GET['url'])) {
        throw new Exception("Parâmetro 'url' é obrigatório");
    }
    
    $pdf_url = $_GET['url'];
    logMessage("URL solicitada: " . $pdf_url);
    debugLog("Parâmetros recebidos: " . print_r($_GET, true));
    
    // Validar se é uma URL válida
    if (!filter_var($pdf_url, FILTER_VALIDATE_URL)) {
        throw new Exception("URL inválida");
    }
    
    // Analisar a URL
    $url_parts = parse_url($pdf_url);
    $url_host = $url_parts['host'];
    $url_path = $url_parts['path'] ?? '';
    $url_query = $url_parts['query'] ?? '';
    
    debugLog("Host: $url_host");
    debugLog("Path: $url_path");
    debugLog("Query: $url_query");
    
    // Detectar tipo de tribunal
    $tribunal_type = detectTribunalType($url_host);
    logMessage("Tipo de tribunal detectado: " . $tribunal_type);
    
    // Escolher estratégia baseada no tribunal
    if ($strategy === 'auto') {
        $strategy = chooseStrategy($tribunal_type, $url_path);
        logMessage("Estratégia automática escolhida: " . $strategy);
    }
    
    // Configurar headers específicos por tribunal
    $headers = getHeadersForTribunal($tribunal_type, $pdf_url);
    debugLog("Headers configurados: " . print_r($headers, true));
    
    logMessage("Iniciando download do PDF...");
    
    // Configurar cURL
    $ch = curl_init();
    
    // Configurações básicas do cURL
    $curl_options = [
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
        CURLOPT_COOKIESESSION => true,
        CURLOPT_COOKIEFILE => '', // Habilita cookies
        CURLOPT_COOKIEJAR => '', // Salva cookies
        CURLOPT_HEADER => false,
        CURLOPT_NOBODY => false,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_2_0,
        CURLOPT_VERBOSE => $debug_mode
    ];
    
    // Configurações específicas por estratégia
    switch ($strategy) {
        case 'pje':
            $curl_options = array_merge($curl_options, getPjeSpecificOptions($pdf_url));
            break;
        case 'session':
            $curl_options = array_merge($curl_options, getSessionBasedOptions());
            break;
        case 'iframe':
            $curl_options = array_merge($curl_options, getIframeCompatibleOptions());
            break;
    }
    
    curl_setopt_array($ch, $curl_options);
    
    if ($debug_mode) {
        // Capturar headers de resposta em modo debug
        curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($curl, $header) {
            debugLog("Response Header: " . trim($header));
            return strlen($header);
        });
    }
    
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
    $effective_url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    
    curl_close($ch);
    
    logMessage("Resposta HTTP: $http_code");
    logMessage("Content-Type: $content_type");
    logMessage("Tamanho: " . strlen($pdf_content) . " bytes");
    logMessage("Tempo total: {$total_time}s");
    logMessage("URL efetiva: $effective_url");
    
    // Análise detalhada do conteúdo
    $content_analysis = analyzeContent($pdf_content);
    logMessage("Análise do conteúdo: " . json_encode($content_analysis));
    
    // Salvar resposta para debug (se solicitado)
    if ($save_response && $debug_mode) {
        $debug_file = $log_dir . '/debug_response_' . date('Y-m-d_H-i-s') . '.html';
        file_put_contents($debug_file, $pdf_content);
        logMessage("Resposta salva para debug: " . $debug_file);
    }
    
    // Verificar se a requisição foi bem-sucedida
    if ($http_code !== 200) {
        throw new Exception("Erro HTTP: $http_code");
    }
    
    // Verificar se realmente recebemos um PDF
    if (!$content_analysis['is_pdf']) {
        
        if ($content_analysis['is_html']) {
            // Se recebemos HTML, tentar estratégias alternativas
            logMessage("HTML detectado. Tentando estratégias alternativas...");
            
            // Estratégia 1: Procurar por iframe ou link direto
            $pdf_link = extractPdfLinkFromHtml($pdf_content);
            if ($pdf_link) {
                logMessage("Link de PDF encontrado no HTML: " . $pdf_link);
                // Fazer nova requisição para o link encontrado
                return downloadPdfFromLink($pdf_link, $headers);
            }
            
            // Estratégia 2: Verificar se é página de login
            if (isLoginPage($pdf_content)) {
                throw new Exception("Página de login detectada. É necessário estar autenticado no navegador para acessar este PDF.");
            }
            
            // Estratégia 3: Verificar se é página de erro
            if (isErrorPage($pdf_content)) {
                $error_msg = extractErrorMessage($pdf_content);
                throw new Exception("Página de erro: " . $error_msg);
            }
            
            // Se chegou aqui, retornar informações para debug
            $preview = substr(strip_tags($pdf_content), 0, 500);
            throw new Exception("Recebido HTML em vez de PDF. Preview: " . $preview);
        }
        
        // Verificar tamanho mínimo
        if (strlen($pdf_content) < 1024) {
            logMessage("AVISO: Arquivo muito pequeno: " . strlen($pdf_content) . " bytes");
            $preview = substr($pdf_content, 0, 200);
            logMessage("Conteúdo: " . $preview);
            throw new Exception("Arquivo PDF muito pequeno ou inválido. Conteúdo: " . $preview);
        }
    }
    
    logMessage("PDF baixado com sucesso!");
    
    // Configurar headers para enviar o PDF
    header('Content-Type: application/pdf');
    header('Content-Length: ' . strlen($pdf_content));
    
    // Nome do arquivo baseado na URL
    $filename = generateFilename($pdf_url);
    header('Content-Disposition: inline; filename="' . $filename . '"');
    
    // Headers para permitir CORS
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    // Headers de cache
    header('Cache-Control: public, max-age=3600');
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 3600) . ' GMT');
    
    // Enviar o PDF
    echo $pdf_content;
    
    logMessage("PDF enviado com sucesso para o cliente");
    logMessage("=== PROCESSO CONCLUÍDO ===");
    
} catch (Exception $e) {
    logMessage("ERRO: " . $e->getMessage());
    
    // Em modo debug, incluir mais informações
    $error_response = [
        'error' => true,
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s'),
        'url' => $pdf_url ?? 'não fornecida',
        'strategy' => $strategy ?? 'não definida'
    ];
    
    if ($debug_mode && isset($content_analysis)) {
        $error_response['content_analysis'] = $content_analysis;
        $error_response['http_code'] = $http_code ?? 'não disponível';
        $error_response['content_type'] = $content_type ?? 'não disponível';
    }
    
    // Enviar erro como JSON
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    http_response_code(500);
    
    echo json_encode($error_response, JSON_UNESCAPED_UNICODE);
}

// ===== FUNÇÕES AUXILIARES =====

function detectTribunalType($host) {
    if (strpos($host, 'pje.') !== false) return 'pje';
    if (strpos($host, 'tjsp.') !== false) return 'tjsp';
    if (strpos($host, 'tjrj.') !== false) return 'tjrj';
    if (strpos($host, 'trf') !== false) return 'trf';
    if (strpos($host, 'stf.') !== false) return 'stf';
    if (strpos($host, 'stj.') !== false) return 'stj';
    return 'generico';
}

function chooseStrategy($tribunal_type, $path) {
    switch ($tribunal_type) {
        case 'pje':
            return 'pje';
        case 'tjsp':
        case 'tjrj':
            return 'session';
        default:
            return 'direct';
    }
}

function getHeadersForTribunal($tribunal_type, $url) {
    $base_headers = [
        'Accept: application/pdf,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language: pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding: gzip, deflate, br',
        'DNT: 1',
        'Connection: keep-alive',
        'Upgrade-Insecure-Requests: 1',
        'Sec-Fetch-Dest: document',
        'Sec-Fetch-Mode: navigate',
        'Sec-Fetch-Site: cross-site',
        'Cache-Control: max-age=0'
    ];
    
    switch ($tribunal_type) {
        case 'pje':
            return array_merge($base_headers, [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer: ' . dirname($url),
                'X-Requested-With: XMLHttpRequest',
                'Accept: application/pdf,*/*'
            ]);
            
        case 'tjsp':
            return array_merge($base_headers, [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer: https://esaj.tjsp.jus.br/'
            ]);
            
        default:
            return array_merge($base_headers, [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]);
    }
}

function getPjeSpecificOptions($url) {
    return [
        CURLOPT_REFERER => dirname($url),
        CURLOPT_AUTOREFERER => true,
        CURLOPT_FRESH_CONNECT => true,
        CURLOPT_FORBID_REUSE => false,
        CURLOPT_TCP_KEEPALIVE => 1,
        CURLOPT_TCP_KEEPIDLE => 2,
        CURLOPT_TCP_KEEPINTVL => 2
    ];
}

function getSessionBasedOptions() {
    return [
        CURLOPT_COOKIESESSION => true,
        CURLOPT_FRESH_CONNECT => false,
        CURLOPT_FORBID_REUSE => false
    ];
}

function getIframeCompatibleOptions() {
    return [
        CURLOPT_REFERER => '',
        CURLOPT_AUTOREFERER => false
    ];
}

function analyzeContent($content) {
    $analysis = [
        'size' => strlen($content),
        'is_pdf' => false,
        'is_html' => false,
        'is_json' => false,
        'is_empty' => strlen($content) < 10,
        'preview' => substr($content, 0, 100)
    ];
    
    // Verificar se é PDF
    if (substr($content, 0, 4) === '%PDF') {
        $analysis['is_pdf'] = true;
    }
    
    // Verificar se é HTML
    if (stripos($content, '<html') !== false || stripos($content, '<!DOCTYPE') !== false) {
        $analysis['is_html'] = true;
    }
    
    // Verificar se é JSON
    if (substr(trim($content), 0, 1) === '{' || substr(trim($content), 0, 1) === '[') {
        $analysis['is_json'] = true;
    }
    
    return $analysis;
}

function isLoginPage($html) {
    $login_indicators = [
        'login', 'senha', 'password', 'entrar', 'autenticar',
        'type="password"', 'name="password"', 'id="password"',
        'Usuario', 'CPF', 'CNPJ'
    ];
    
    $html_lower = strtolower($html);
    foreach ($login_indicators as $indicator) {
        if (strpos($html_lower, strtolower($indicator)) !== false) {
            return true;
        }
    }
    
    return false;
}

function isErrorPage($html) {
    $error_indicators = [
        'erro', 'error', 'não encontrado', 'not found',
        'acesso negado', 'access denied', 'forbidden',
        'sessão expirada', 'session expired'
    ];
    
    $html_lower = strtolower($html);
    foreach ($error_indicators as $indicator) {
        if (strpos($html_lower, strtolower($indicator)) !== false) {
            return true;
        }
    }
    
    return false;
}

function extractErrorMessage($html) {
    // Tentar extrair mensagem de erro comum
    $patterns = [
        '/<title[^>]*>(.*?)<\/title>/i',
        '/<h1[^>]*>(.*?)<\/h1>/i',
        '/<div[^>]*class[^>]*error[^>]*>(.*?)<\/div>/i'
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $html, $matches)) {
            return strip_tags($matches[1]);
        }
    }
    
    return 'Erro não identificado';
}

function extractPdfLinkFromHtml($html) {
    // Procurar por links diretos para PDF
    $patterns = [
        '/src=["\']([^"\']*\.pdf[^"\']*)["\']/',
        '/href=["\']([^"\']*\.pdf[^"\']*)["\']/',
        '/url\(["\']?([^"\']*\.pdf[^"\']*)["\']?\)/'
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $html, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

function downloadPdfFromLink($link, $headers) {
    // Implementar download recursivo (simplificado)
    logMessage("Tentando download recursivo do link: " . $link);
    // Por enquanto, retornar erro - implementar se necessário
    throw new Exception("Link PDF encontrado, mas download recursivo ainda não implementado: " . $link);
}

function generateFilename($url) {
    $path = parse_url($url, PHP_URL_PATH);
    $filename = basename($path);
    
    if (empty($filename) || !strpos($filename, '.')) {
        $filename = 'documento_' . date('Y-m-d_H-i-s') . '.pdf';
    }
    
    return $filename;
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