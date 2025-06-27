<?php
// LOAD.PHP COMPATÍVEL - Lê de múltiplos locais possíveis
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// FUNÇÃO: Procurar arquivo em locais possíveis
function procurarArquivo() {
    $locais = [
        'data_original' => [
            'path' => __DIR__ . '/aplicacoes.json',
            'desc' => 'pasta data (ideal)'
        ],
        'temp_sistema' => [
            'path' => sys_get_temp_dir() . '/aplicacoes.json',
            'desc' => 'pasta temporária do sistema'
        ],
        'tmp_linux' => [
            'path' => '/tmp/aplicacoes.json',
            'desc' => 'pasta /tmp'
        ],
        'home_user' => [
            'path' => getenv('HOME') . '/aplicacoes.json',
            'desc' => 'pasta home do usuário'
        ]
    ];
    
    $arquivosEncontrados = [];
    
    foreach ($locais as $tipo => $info) {
        if (file_exists($info['path']) && is_readable($info['path'])) {
            $stat = stat($info['path']);
            $arquivosEncontrados[] = [
                'path' => $info['path'],
                'tipo' => $tipo,
                'desc' => $info['desc'],
                'tamanho' => $stat['size'],
                'modificacao' => $stat['mtime']
            ];
        }
    }
    
    if (empty($arquivosEncontrados)) {
        return ['success' => false, 'error' => 'Nenhum arquivo encontrado'];
    }
    
    // Usar o arquivo mais recente
    usort($arquivosEncontrados, function($a, $b) {
        return $b['modificacao'] - $a['modificacao'];
    });
    
    return [
        'success' => true,
        'arquivo' => $arquivosEncontrados[0],
        'todos_encontrados' => $arquivosEncontrados
    ];
}

try {
    // Procurar arquivo
    $busca = procurarArquivo();
    if (!$busca['success']) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => $busca['error']
        ]);
        exit;
    }
    
    $arquivoInfo = $busca['arquivo'];
    $arquivo = $arquivoInfo['path'];
    
    // Ler conteúdo
    $conteudo = file_get_contents($arquivo);
    if ($conteudo === false) {
        throw new Exception('Erro ao ler arquivo de: ' . $arquivoInfo['desc']);
    }
    
    // Decodificar JSON
    $dados = json_decode($conteudo, true);
    if (!$dados) {
        throw new Exception('JSON inválido no arquivo de: ' . $arquivoInfo['desc']);
    }
    
    // Sucesso
    echo json_encode([
        'success' => true,
        'data' => $dados,
        'message' => 'Dados carregados com sucesso!',
        'fonte' => [
            'local_usado' => $arquivoInfo['desc'],
            'tipo' => $arquivoInfo['tipo'],
            'tamanho' => $arquivoInfo['tamanho'] . ' bytes',
            'modificacao' => date('Y-m-d H:i:s', $arquivoInfo['modificacao']),
            'total_encontrados' => count($busca['todos_encontrados'])
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>