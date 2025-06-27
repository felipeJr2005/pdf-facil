<?php
// SAVE.PHP WORKAROUND - Usa pasta temporária quando não há permissão
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

// FUNÇÃO: Detectar melhor local para salvar
function detectarLocalSalvamento() {
    $tentativas = [
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
    
    foreach ($tentativas as $tipo => $info) {
        $pasta = dirname($info['path']);
        
        // Pular se pasta não existe
        if (!is_dir($pasta)) continue;
        
        // Testar escrita
        $teste = $pasta . '/teste_' . time() . '.tmp';
        if (@file_put_contents($teste, 'teste')) {
            @unlink($teste);
            return [
                'success' => true,
                'path' => $info['path'],
                'tipo' => $tipo,
                'desc' => $info['desc'],
                'pasta' => $pasta
            ];
        }
    }
    
    return ['success' => false];
}

try {
    // Ler dados
    $input = file_get_contents('php://input');
    if (empty($input)) {
        throw new Exception('Dados não enviados');
    }
    
    $dados = json_decode($input, true);
    if (!$dados) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    // Validar
    if (!isset($dados['aplicacoes']) || !isset($dados['taxasReferencia'])) {
        throw new Exception('Campos obrigatórios ausentes');
    }
    
    // Detectar onde salvar
    $local = detectarLocalSalvamento();
    if (!$local['success']) {
        throw new Exception('Nenhum local gravável encontrado');
    }
    
    $arquivo = $local['path'];
    
    // Metadados
    $dados['versao'] = '2.0';
    $dados['dataExportacao'] = date('c');
    $dados['totalAplicacoes'] = count($dados['aplicacoes']);
    $dados['ultimoSalvamento'] = [
        'timestamp' => time(),
        'data' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'desconhecido',
        'local_usado' => $local['tipo'],
        'descricao' => $local['desc'],
        'arquivo_completo' => $arquivo
    ];
    
    // Fazer backup se arquivo existir
    if (file_exists($arquivo)) {
        $backup = $arquivo . '.backup.' . date('Y-m-d_H-i-s');
        @copy($arquivo, $backup);
    }
    
    // Salvar
    $json = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $resultado = file_put_contents($arquivo, $json, LOCK_EX);
    
    if ($resultado === false) {
        throw new Exception('Falha ao salvar no local detectado: ' . $local['desc']);
    }
    
    // Sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Dados salvos com workaround!',
        'data' => [
            'totalAplicacoes' => $dados['totalAplicacoes'],
            'dataUltimoSalvamento' => $dados['ultimoSalvamento']['data'],
            'tamanhoArquivo' => filesize($arquivo) . ' bytes',
            'localUsado' => $local['desc'],
            'tipoLocal' => $local['tipo'],
            'caminhoCompleto' => $arquivo
        ],
        'workaround' => true,
        'aviso' => 'Arquivo salvo em local alternativo devido a permissões'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => [
            'tentativas_testadas' => [
                'data_original' => is_writable(__DIR__),
                'temp_sistema' => is_writable(sys_get_temp_dir()),
                'tmp_linux' => is_writable('/tmp'),
                'usuario_php' => get_current_user(),
                'processo_id' => getmypid()
            ]
        ]
    ]);
}
?>