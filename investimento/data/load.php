<?php
// API para carregar aplicações financeiras
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$arquivo = __DIR__ . '/aplicacoes.json';

try {
    if (!file_exists($arquivo)) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Arquivo não encontrado'
        ]);
        exit;
    }
    
    $conteudo = file_get_contents($arquivo);
    if ($conteudo === false) {
        throw new Exception('Erro ao ler arquivo');
    }
    
    $dados = json_decode($conteudo, true);
    if (!$dados) {
        throw new Exception('JSON inválido no arquivo');
    }
    
    echo json_encode([
        'success' => true,
        'data' => $dados,
        'message' => 'Dados carregados com sucesso!'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>