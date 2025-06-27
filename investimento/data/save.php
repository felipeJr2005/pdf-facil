<?php
// SAVE.PHP INTELIGENTE - Detecta automaticamente onde consegue escrever
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido. Use POST.']);
    exit;
}

// FUNÇÃO INTELIGENTE: Detectar melhor local para escrita
function detectarLocalEscrita() {
    $tentativas = [
        // 1ª tentativa: Raiz absoluta (ideal)
        'raiz_absoluta' => dirname(dirname(__DIR__)) . '/aplicacoes.json',
        // 2ª tentativa: Pasta investimento
        'investimento' => dirname(__DIR__) . '/aplicacoes.json',
        // 3ª tentativa: Pasta data atual
        'data' => __DIR__ . '/aplicacoes.json',
        // 4ª tentativa: Pasta temporária do sistema
        'temp' => sys_get_temp_dir() . '/aplicacoes.json',
        // 5ª tentativa: Forçar na raiz com permissões
        'raiz_forcada' => dirname(dirname(__DIR__)) . '/aplicacoes.json'
    ];
    
    foreach ($tentativas as $tipo => $caminho) {
        $pasta = dirname($caminho);
        
        // Testar se consegue escrever
        $arquivoTeste = $pasta . '/teste_' . time() . '.tmp';
        
        if (@file_put_contents($arquivoTeste, 'teste')) {
            @unlink($arquivoTeste);
            return [
                'arquivo' => $caminho,
                'tipo' => $tipo,
                'pasta' => $pasta,
                'sucesso' => true
            ];
        }
        
        // Se for raiz absoluta, tentar corrigir permissões
        if ($tipo === 'raiz_forcada' && is_dir($pasta)) {
            @chmod($pasta, 0755);
            if (@file_put_contents($arquivoTeste, 'teste')) {
                @unlink($arquivoTeste);
                return [
                    'arquivo' => $caminho,
                    'tipo' => $tipo . '_corrigida',
                    'pasta' => $pasta,
                    'sucesso' => true
                ];
            }
        }
    }
    
    return ['sucesso' => false, 'erro' => 'Nenhum local gravável encontrado'];
}

try {
    // Ler dados enviados
    $input = file_get_contents('php://input');
    if (empty($input)) {
        throw new Exception('Nenhum dado foi enviado');
    }
    
    $dados = json_decode($input, true);
    if ($dados === null) {
        throw new Exception('Dados JSON inválidos: ' . json_last_error_msg());
    }
    
    // Validar estrutura
    if (!isset($dados['aplicacoes']) || !isset($dados['taxasReferencia'])) {
        throw new Exception('Estrutura de dados inválida');
    }
    
    // Detectar local de escrita
    $localInfo = detectarLocalEscrita();
    if (!$localInfo['sucesso']) {
        throw new Exception($localInfo['erro']);
    }
    
    $arquivo = $localInfo['arquivo'];
    
    // Fazer backup se arquivo existir
    if (file_exists($arquivo)) {
        $backup = $arquivo . '.backup.' . date('Y-m-d_H-i-s');
        @copy($arquivo, $backup);
    }
    
    // Adicionar metadados
    $dados['versao'] = '2.0';
    $dados['dataExportacao'] = date('c');
    $dados['totalAplicacoes'] = count($dados['aplicacoes']);
    $dados['ultimoSalvamento'] = [
        'timestamp' => time(),
        'data' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'desconhecido',
        'local_detectado' => $localInfo['tipo'],
        'caminho_completo' => $arquivo
    ];
    
    // Converter para JSON
    $json = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        throw new Exception('Erro ao gerar JSON: ' . json_last_error_msg());
    }
    
    // Tentar salvar
    $resultado = file_put_contents($arquivo, $json, LOCK_EX);
    if ($resultado === false) {
        throw new Exception('Falha na escrita final do arquivo');
    }
    
    // Sucesso!
    echo json_encode([
        'success' => true,
        'message' => 'Dados salvos com sucesso!',
        'data' => [
            'totalAplicacoes' => $dados['totalAplicacoes'],
            'dataUltimoSalvamento' => $dados['ultimoSalvamento']['data'],
            'tamanhoArquivo' => filesize($arquivo) . ' bytes',
            'bytesEscritos' => $resultado,
            'arquivo' => basename($arquivo),
            'local_usado' => $localInfo['tipo'],
            'caminho_completo' => $arquivo,
            'pasta' => $localInfo['pasta']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    
    // Informações detalhadas do erro
    $debug = [
        'erro' => $e->getMessage(),
        'arquivo_tentado' => $arquivo ?? 'N/A',
        'permissoes_testadas' => [],
        'usuario_php' => get_current_user(),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Testar permissões de vários locais
    $locais = [
        'raiz_absoluta' => dirname(dirname(__DIR__)),
        'investimento' => dirname(__DIR__),
        'data_atual' => __DIR__,
        'temp_sistema' => sys_get_temp_dir()
    ];
    
    foreach ($locais as $nome => $pasta) {
        $debug['permissoes_testadas'][$nome] = [
            'pasta' => $pasta,
            'existe' => is_dir($pasta),
            'gravavel' => is_writable($pasta),
            'permissoes' => is_dir($pasta) ? substr(sprintf('%o', fileperms($pasta)), -4) : 'N/A'
        ];
    }
    
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => $debug,
        'solucao' => 'Execute: data/fix-permissions-final.php para diagnóstico completo'
    ]);
}
?>