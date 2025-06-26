<?php
// Configuração básica
ini_set('display_errors', 0);
error_reporting(0);

// Headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Função para log
function debug($msg) {
    error_log("[SAVE DEBUG] " . $msg);
}

// Função para resposta segura
function responder($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

try {
    debug("=== SAVE.PHP INICIADO ===");
    
    // CORS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        responder(['status' => 'CORS OK']);
    }
    
    // Verificar método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder([
            'success' => false,
            'error' => 'Use POST',
            'metodo' => $_SERVER['REQUEST_METHOD']
        ], 405);
    }
    
    debug("Método POST confirmado");
    
    // Verificar se consegue ler input
    $input = file_get_contents('php://input');
    debug("Input lido: " . strlen($input) . " bytes");
    
    if (empty($input)) {
        responder([
            'success' => false,
            'error' => 'Nenhum dado recebido'
        ], 400);
    }
    
    // Tentar decodificar JSON
    $dados = json_decode($input, true);
    debug("JSON decode: " . (is_array($dados) ? 'OK' : 'FALHOU'));
    
    if (!is_array($dados)) {
        responder([
            'success' => false,
            'error' => 'JSON inválido',
            'json_error' => json_last_error_msg(),
            'primeiro_char' => substr($input, 0, 1)
        ], 400);
    }
    
    // Verificar se tem aplicações
    if (!isset($dados['aplicacoes'])) {
        responder([
            'success' => false,
            'error' => 'Campo aplicacoes não encontrado',
            'campos' => array_keys($dados)
        ], 400);
    }
    
    debug("Aplicações encontradas: " . count($dados['aplicacoes']));
    
    // Verificar permissões
    $dir = __DIR__;
    debug("Diretório: $dir");
    
    if (!is_writable($dir)) {
        responder([
            'success' => false,
            'error' => 'Sem permissão de escrita',
            'diretorio' => $dir
        ], 500);
    }
    
    // Arquivo destino
    $arquivo = $dir . '/aplicacoes.json';
    debug("Arquivo: $arquivo");
    
    // Preparar dados finais
    $dadosFinais = [
        'versao' => '2.0',
        'dataExportacao' => date('c'),
        'totalAplicacoes' => count($dados['aplicacoes']),
        'aplicacoes' => $dados['aplicacoes']
    ];
    
    // Se tem taxas, incluir
    if (isset($dados['taxasReferencia'])) {
        $dadosFinais['taxasReferencia'] = $dados['taxasReferencia'];
    }
    
    debug("Dados preparados");
    
    // Converter para JSON
    $json = json_encode($dadosFinais, JSON_PRETTY_PRINT);
    
    if ($json === false) {
        responder([
            'success' => false,
            'error' => 'Erro ao gerar JSON',
            'json_error' => json_last_error_msg()
        ], 500);
    }
    
    debug("JSON gerado: " . strlen($json) . " bytes");
    
    // Backup se arquivo existir
    if (file_exists($arquivo)) {
        $backup = $arquivo . '.bak';
        copy($arquivo, $backup);
        debug("Backup criado");
    }
    
    // Salvar
    $resultado = file_put_contents($arquivo, $json, LOCK_EX);
    
    if ($resultado === false) {
        responder([
            'success' => false,
            'error' => 'Falha ao salvar arquivo'
        ], 500);
    }
    
    debug("Arquivo salvo: $resultado bytes");
    
    // Sucesso
    responder([
        'success' => true,
        'message' => 'Salvo com sucesso!',
        'totalAplicacoes' => count($dados['aplicacoes']),
        'bytes' => $resultado,
        'dataHora' => date('d/m/Y H:i:s')
    ]);
    
} catch (Exception $e) {
    debug("ERRO: " . $e->getMessage());
    responder([
        'success' => false,
        'error' => 'Erro interno: ' . $e->getMessage()
    ], 500);
}
?>