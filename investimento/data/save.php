<?php
// Suprimir warnings que quebram JSON
error_reporting(0);
ini_set('display_errors', 0);

// API para salvar dados no servidor
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método não permitido. Use POST.'
    ]);
    exit;
}

// CAMINHO CORRIGIDO - Arquivo JSON na mesma pasta (data/)
$arquivo = __DIR__ . '/aplicacoes.json';

try {
    // Ler dados enviados
    $input = file_get_contents('php://input');
    $dados = json_decode($input, true);
    
    if ($dados === null) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Dados JSON inválidos enviados'
        ]);
        exit;
    }
    
    // Validar estrutura básica
    if (!isset($dados['aplicacoes']) || !isset($dados['taxasReferencia'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Estrutura de dados inválida. Faltam campos obrigatórios.'
        ]);
        exit;
    }
    
    // Adicionar metadados de salvamento
    $dados['versao'] = '2.0';
    $dados['dataExportacao'] = date('c'); // Formato ISO 8601
    $dados['totalAplicacoes'] = count($dados['aplicacoes']);
    $dados['ultimoSalvamento'] = [
        'timestamp' => time(),
        'data' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'desconhecido'
    ];
    
    // Fazer backup do arquivo atual (se existir)
    if (file_exists($arquivo)) {
        $backup = $arquivo . '.backup.' . date('Y-m-d_H-i-s');
        if (!copy($arquivo, $backup)) {
            // Log do erro, mas não falhar por causa disso
            error_log("Falha ao criar backup: $backup");
        }
    }
    
    // Converter para JSON formatado
    $json = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if ($json === false) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Erro ao codificar dados para JSON'
        ]);
        exit;
    }
    
    // Salvar arquivo
    if (file_put_contents($arquivo, $json, LOCK_EX) === false) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Erro ao salvar arquivo no servidor'
        ]);
        exit;
    }
    
    // Sucesso!
    echo json_encode([
        'success' => true,
        'message' => 'Dados salvos no servidor com sucesso!',
        'data' => [
            'totalAplicacoes' => $dados['totalAplicacoes'],
            'dataUltimoSalvamento' => $dados['ultimoSalvamento']['data'],
            'tamanhoArquivo' => filesize($arquivo) . ' bytes'
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno do servidor: ' . $e->getMessage()
    ]);
}
?>