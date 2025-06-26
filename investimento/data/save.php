<?php
// Configuração básica
ini_set('display_errors', 0);
error_reporting(0);

// Headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Função para resposta segura
function responder($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

try {
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
    
    // Ler dados
    $input = file_get_contents('php://input');
    
    if (empty($input)) {
        responder([
            'success' => false,
            'error' => 'Nenhum dado recebido'
        ], 400);
    }
    
    // Decodificar JSON
    $dados = json_decode($input, true);
    
    if (!is_array($dados)) {
        responder([
            'success' => false,
            'error' => 'JSON inválido: ' . json_last_error_msg()
        ], 400);
    }
    
    // Verificar aplicações
    if (!isset($dados['aplicacoes'])) {
        responder([
            'success' => false,
            'error' => 'Campo aplicacoes não encontrado'
        ], 400);
    }
    
    // TENTAR MÚLTIPLAS LOCALIZAÇÕES COM PERMISSÃO
    $locaisPossiveis = [
        __DIR__ . '/aplicacoes.json',                    // Pasta atual
        __DIR__ . '/../aplicacoes.json',                 // Pasta pai  
        '/tmp/aplicacoes.json',                          // Pasta temporária
        __DIR__ . '/data/aplicacoes.json'                // Pasta data (última tentativa)
    ];
    
    $arquivoEscolhido = null;
    $localEscolhido = null;
    
    // Testar cada local
    foreach ($locaisPossiveis as $local) {
        $dir = dirname($local);
        
        // Verificar se diretório existe e é gravável
        if (is_dir($dir) && is_writable($dir)) {
            $arquivoEscolhido = $local;
            $localEscolhido = $dir;
            break;
        }
    }
    
    // Se nenhum local com permissão
    if (!$arquivoEscolhido) {
        $permissoes = [];
        foreach ($locaisPossiveis as $local) {
            $dir = dirname($local);
            $permissoes[] = [
                'diretorio' => $dir,
                'existe' => is_dir($dir) ? 'SIM' : 'NÃO',
                'gravavel' => is_writable($dir) ? 'SIM' : 'NÃO'
            ];
        }
        
        responder([
            'success' => false,
            'error' => 'Nenhum diretório com permissão de escrita encontrado',
            'testados' => $permissoes
        ], 500);
    }
    
    // Preparar dados finais
    $dadosFinais = [
        'versao' => '2.0',
        'dataExportacao' => date('c'),
        'totalAplicacoes' => count($dados['aplicacoes']),
        'aplicacoes' => $dados['aplicacoes'],
        'localSalvamento' => $localEscolhido
    ];
    
    // Incluir taxas se existirem
    if (isset($dados['taxasReferencia'])) {
        $dadosFinais['taxasReferencia'] = $dados['taxasReferencia'];
    }
    
    // Converter para JSON
    $json = json_encode($dadosFinais, JSON_PRETTY_PRINT);
    
    if ($json === false) {
        responder([
            'success' => false,
            'error' => 'Erro ao gerar JSON: ' . json_last_error_msg()
        ], 500);
    }
    
    // Backup se arquivo existir
    if (file_exists($arquivoEscolhido)) {
        $backup = $arquivoEscolhido . '.backup.' . date('Ymd-His');
        @copy($arquivoEscolhido, $backup);
    }
    
    // Salvar
    $resultado = file_put_contents($arquivoEscolhido, $json, LOCK_EX);
    
    if ($resultado === false) {
        responder([
            'success' => false,
            'error' => 'Falha ao salvar arquivo',
            'arquivo' => $arquivoEscolhido,
            'diretorio' => $localEscolhido
        ], 500);
    }
    
    // Sucesso
    responder([
        'success' => true,
        'message' => 'Dados salvos com sucesso!',
        'data' => [
            'totalAplicacoes' => count($dados['aplicacoes']),
            'bytes' => $resultado,
            'arquivo' => basename($arquivoEscolhido),
            'local' => $localEscolhido,
            'dataHora' => date('d/m/Y H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    responder([
        'success' => false,
        'error' => 'Erro interno: ' . $e->getMessage()
    ], 500);
}
?>