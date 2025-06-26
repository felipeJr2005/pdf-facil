<?php
// VERSÃO DEBUG - save.php com logs detalhados
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');

// Função para log detalhado
function debugLog($message) {
    $timestamp = date('[Y-m-d H:i:s]');
    $logFile = __DIR__ . '/debug.log';
    $logMessage = $timestamp . ' [SAVE.PHP] ' . $message . PHP_EOL;
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    return $logMessage;
}

debugLog("=== INÍCIO DA REQUISIÇÃO ===");
debugLog("Método: " . $_SERVER['REQUEST_METHOD']);
debugLog("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'não definido'));
debugLog("User-Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'não definido'));
debugLog("IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'não definido'));

// Headers CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

debugLog("Headers CORS enviados");

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    debugLog("ERRO: Método não é POST - é: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método não permitido. Use POST.',
        'debug' => 'Método recebido: ' . $_SERVER['REQUEST_METHOD']
    ]);
    exit;
}

debugLog("Método POST confirmado");

// Caminho do arquivo
$arquivo = __DIR__ . '/aplicacoes.json';
debugLog("Caminho do arquivo: " . $arquivo);
debugLog("Diretório atual: " . __DIR__);
debugLog("Arquivo existe? " . (file_exists($arquivo) ? 'SIM' : 'NÃO'));

// Verificar permissões da pasta
$pastaPai = dirname($arquivo);
debugLog("Pasta pai: " . $pastaPai);
debugLog("Pasta é gravável? " . (is_writable($pastaPai) ? 'SIM' : 'NÃO'));
debugLog("Pasta existe? " . (is_dir($pastaPai) ? 'SIM' : 'NÃO'));

// Se arquivo existe, verificar permissões
if (file_exists($arquivo)) {
    debugLog("Arquivo é gravável? " . (is_writable($arquivo) ? 'SIM' : 'NÃO'));
    debugLog("Tamanho atual do arquivo: " . filesize($arquivo) . ' bytes');
}

try {
    // Ler dados enviados
    debugLog("Tentando ler input...");
    $input = file_get_contents('php://input');
    debugLog("Input recebido: " . strlen($input) . " caracteres");
    debugLog("Primeiros 200 chars: " . substr($input, 0, 200));
    
    if (empty($input)) {
        debugLog("ERRO: Input vazio!");
        throw new Exception('Nenhum dado foi enviado no POST');
    }
    
    // Decodificar JSON
    debugLog("Tentando decodificar JSON...");
    $dados = json_decode($input, true);
    
    if ($dados === null) {
        $jsonError = json_last_error_msg();
        debugLog("ERRO JSON: " . $jsonError);
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Dados JSON inválidos: ' . $jsonError,
            'debug' => [
                'input_length' => strlen($input),
                'json_error' => $jsonError,
                'first_chars' => substr($input, 0, 100)
            ]
        ]);
        exit;
    }
    
    debugLog("JSON decodificado com sucesso");
    debugLog("Estrutura recebida: " . print_r(array_keys($dados), true));
    
    // Validar estrutura básica
    if (!isset($dados['aplicacoes'])) {
        debugLog("ERRO: Campo 'aplicacoes' não encontrado");
        throw new Exception("Campo 'aplicacoes' obrigatório não encontrado");
    }
    
    if (!isset($dados['taxasReferencia'])) {
        debugLog("ERRO: Campo 'taxasReferencia' não encontrado");
        throw new Exception("Campo 'taxasReferencia' obrigatório não encontrado");
    }
    
    debugLog("Validação de estrutura: OK");
    debugLog("Total de aplicações: " . count($dados['aplicacoes']));
    
    // Adicionar metadados de salvamento
    $dados['versao'] = '2.0';
    $dados['dataExportacao'] = date('c');
    $dados['totalAplicacoes'] = count($dados['aplicacoes']);
    $dados['ultimoSalvamento'] = [
        'timestamp' => time(),
        'data' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'desconhecido'
    ];
    
    debugLog("Metadados adicionados");
    
    // Fazer backup do arquivo atual (se existir)
    if (file_exists($arquivo)) {
        $backup = $arquivo . '.backup.' . date('Y-m-d_H-i-s');
        debugLog("Tentando criar backup: " . $backup);
        
        if (copy($arquivo, $backup)) {
            debugLog("Backup criado com sucesso");
        } else {
            debugLog("AVISO: Falha ao criar backup");
        }
    }
    
    // Converter para JSON formatado
    debugLog("Convertendo dados para JSON...");
    $json = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if ($json === false) {
        $jsonError = json_last_error_msg();
        debugLog("ERRO na codificação JSON: " . $jsonError);
        throw new Exception('Erro ao codificar dados para JSON: ' . $jsonError);
    }
    
    debugLog("JSON gerado: " . strlen($json) . " caracteres");
    
    // Tentar salvar arquivo
    debugLog("Tentando salvar arquivo...");
    $resultado = file_put_contents($arquivo, $json, LOCK_EX);
    
    if ($resultado === false) {
        debugLog("ERRO: file_put_contents retornou FALSE");
        throw new Exception('Falha ao escrever no arquivo');
    }
    
    debugLog("Arquivo salvo com sucesso! Bytes escritos: " . $resultado);
    
    // Verificar se arquivo foi realmente salvo
    if (file_exists($arquivo)) {
        $novoTamanho = filesize($arquivo);
        debugLog("Verificação pós-salvamento: arquivo existe, tamanho: " . $novoTamanho);
    } else {
        debugLog("ERRO: Arquivo não existe após salvamento!");
        throw new Exception('Arquivo não foi criado após salvamento');
    }
    
    // Sucesso!
    $response = [
        'success' => true,
        'message' => 'Dados salvos no servidor com sucesso!',
        'data' => [
            'totalAplicacoes' => $dados['totalAplicacoes'],
            'dataUltimoSalvamento' => $dados['ultimoSalvamento']['data'],
            'tamanhoArquivo' => filesize($arquivo) . ' bytes'
        ],
        'debug' => [
            'arquivo' => $arquivo,
            'bytes_escritos' => $resultado,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ];
    
    debugLog("Resposta de sucesso preparada");
    debugLog("=== FIM DA REQUISIÇÃO (SUCESSO) ===");
    
    echo json_encode($response);
    
} catch (Exception $e) {
    $errorMsg = $e->getMessage();
    debugLog("EXCEÇÃO CAPTURADA: " . $errorMsg);
    debugLog("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $errorMsg,
        'debug' => [
            'arquivo' => $arquivo,
            'pasta_gravavel' => is_writable(dirname($arquivo)),
            'arquivo_existe' => file_exists($arquivo),
            'timestamp' => date('Y-m-d H:i:s'),
            'trace' => $e->getTraceAsString()
        ]
    ]);
    
    debugLog("=== FIM DA REQUISIÇÃO (ERRO) ===");
}
?>