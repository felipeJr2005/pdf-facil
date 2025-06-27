<?php
// API para carregar dados do servidor - VERSÃO RAIZ (como funcionava antes)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// CAMINHO CORRIGIDO - CARREGAR DA RAIZ ABSOLUTA do site (junto com bem-vindo.html, etc)
$arquivo = dirname(dirname(__DIR__)) . '/aplicacoes.json';

try {
    // Verificar se arquivo existe
    if (!file_exists($arquivo)) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Arquivo de dados não encontrado no servidor',
            'info' => 'Procurando por: aplicacoes.json na raiz absoluta do site'
        ]);
        exit;
    }
    
    // Ler conteúdo do arquivo
    $conteudo = file_get_contents($arquivo);
    
    if ($conteudo === false) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Erro ao ler arquivo do servidor'
        ]);
        exit;
    }
    
    // Decodificar JSON
    $dados = json_decode($conteudo, true);
    
    if ($dados === null) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Arquivo JSON inválido no servidor'
        ]);
        exit;
    }
    
    // Retornar dados com sucesso
    echo json_encode([
        'success' => true,
        'data' => $dados,
        'message' => 'Dados carregados do servidor com sucesso!',
        'timestamp' => date('Y-m-d H:i:s'),
        'arquivo' => 'aplicacoes.json',
        'local' => 'raiz absoluta do site (junto com bem-vindo.html, etc)'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno do servidor: ' . $e->getMessage()
    ]);
}
?>