<?php
// API para salvar dados - VERSÃO LIMPA
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

// ARQUIVO NA MESMA PASTA (data/)
$arquivo = __DIR__ . '/aplicacoes.json';

try {
    // Ler dados
    $input = file_get_contents('php://input');
    if (empty($input)) {
        throw new Exception('Dados não enviados');
    }
    
    $dados = json_decode($input, true);
    if (!$dados) {
        throw new Exception('JSON inválido');
    }
    
    // Validar estrutura
    if (!isset($dados['aplicacoes']) || !isset($dados['taxasReferencia'])) {
        throw new Exception('Campos obrigatórios ausentes');
    }
    
    // Metadados
    $dados['versao'] = '2.0';
    $dados['dataExportacao'] = date('c');
    $dados['totalAplicacoes'] = count($dados['aplicacoes']);
    $dados['ultimoSalvamento'] = [
        'timestamp' => time(),
        'data' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'desconhecido'
    ];
    
    // Backup
    if (file_exists($arquivo)) {
        $backup = $arquivo . '.backup.' . date('Y-m-d_H-i-s');
        @copy($arquivo, $backup);
    }
    
    // Salvar
    $json = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if (file_put_contents($arquivo, $json, LOCK_EX) === false) {
        throw new Exception('Falha ao salvar arquivo');
    }
    
    // Sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Dados salvos com sucesso!',
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
        'error' => $e->getMessage(),
        'debug' => [
            'arquivo' => $arquivo,
            'pasta_gravavel' => is_writable(dirname($arquivo)),
            'arquivo_existe' => file_exists($arquivo)
        ]
    ]);
}
?>