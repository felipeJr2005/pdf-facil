<?php
// Suprimir warnings que quebram JSON
error_reporting(0);
ini_set('display_errors', 0);

// Headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Função para resposta
function responder($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}

// Se for GET, mostrar diagnóstico
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $diretorio = __DIR__;
    $arquivo = $diretorio . '/aplicacoes.json';
    
    $diagnostico = [
        'metodo' => 'GET',
        'diretorio_atual' => $diretorio,
        'arquivo_destino' => $arquivo,
        'diretorio_existe' => is_dir($diretorio) ? 'SIM' : 'NÃO',
        'diretorio_legivel' => is_readable($diretorio) ? 'SIM' : 'NÃO',
        'diretorio_gravavel' => is_writable($diretorio) ? 'SIM' : 'NÃO',
        'arquivo_existe' => file_exists($arquivo) ? 'SIM' : 'NÃO',
        'arquivo_legivel' => file_exists($arquivo) && is_readable($arquivo) ? 'SIM' : 'NÃO',
        'arquivo_gravavel' => file_exists($arquivo) && is_writable($arquivo) ? 'SIM' : 'NÃO',
        'permissoes_diretorio' => file_exists($diretorio) ? substr(sprintf('%o', fileperms($diretorio)), -4) : 'N/A',
        'permissoes_arquivo' => file_exists($arquivo) ? substr(sprintf('%o', fileperms($arquivo)), -4) : 'N/A',
        'usuario_php' => get_current_user(),
        'uid_php' => getmyuid(),
        'gid_php' => getmygid()
    ];
    
    if (file_exists($arquivo)) {
        $diagnostico['tamanho_arquivo'] = filesize($arquivo) . ' bytes';
        $diagnostico['data_modificacao'] = date('Y-m-d H:i:s', filemtime($arquivo));
    }
    
    responder($diagnostico);
}

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder([
        'success' => false,
        'error' => 'Método não permitido. Use POST.'
    ], 405);
}

// Verificar permissões ANTES de tentar salvar
$diretorio = __DIR__;
$arquivo = $diretorio . '/aplicacoes.json';

if (!is_writable($diretorio)) {
    responder([
        'success' => false,
        'error' => 'Diretório sem permissão de escrita',
        'diretorio' => $diretorio,
        'permissoes' => substr(sprintf('%o', fileperms($diretorio)), -4),
        'usuario_php' => get_current_user()
    ], 500);
}

try {
    // Ler dados enviados
    $input = file_get_contents('php://input');
    $dados = json_decode($input, true);
    
    if ($dados === null) {
        responder([
            'success' => false,
            'error' => 'Dados JSON inválidos enviados: ' . json_last_error_msg()
        ], 400);
    }
    
    // Validar estrutura básica
    if (!isset($dados['aplicacoes'])) {
        responder([
            'success' => false,
            'error' => 'Campo "aplicacoes" é obrigatório'
        ], 400);
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
    
    // Backup do arquivo atual (se existir)
    if (file_exists($arquivo)) {
        $backup = $arquivo . '.backup.' . date('Y-m-d_H-i-s');
        @copy($arquivo, $backup);
    }
    
    // Converter para JSON formatado
    $json = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if ($json === false) {
        responder([
            'success' => false,
            'error' => 'Erro ao codificar dados para JSON: ' . json_last_error_msg()
        ], 500);
    }
    
    // TESTE: Tentar criar arquivo de teste primeiro
    $arquivoTeste = $diretorio . '/teste-permissao.txt';
    $testePerm = file_put_contents($arquivoTeste, 'teste');
    
    if ($testePerm === false) {
        responder([
            'success' => false,
            'error' => 'Falha no teste de permissão - não consegue criar arquivo',
            'arquivo_teste' => $arquivoTeste,
            'diretorio' => $diretorio
        ], 500);
    } else {
        // Limpar arquivo de teste
        @unlink($arquivoTeste);
    }
    
    // Salvar arquivo principal
    $resultado = file_put_contents($arquivo, $json, LOCK_EX);
    
    if ($resultado === false) {
        responder([
            'success' => false,
            'error' => 'Erro ao salvar arquivo no servidor',
            'arquivo' => $arquivo,
            'json_size' => strlen($json)
        ], 500);
    }
    
    // Verificar se o arquivo foi realmente salvo
    if (!file_exists($arquivo)) {
        responder([
            'success' => false,
            'error' => 'Arquivo não foi criado após file_put_contents'
        ], 500);
    }
    
    // Sucesso!
    responder([
        'success' => true,
        'message' => 'Dados salvos no servidor com sucesso!',
        'data' => [
            'totalAplicacoes' => $dados['totalAplicacoes'],
            'dataUltimoSalvamento' => $dados['ultimoSalvamento']['data'],
            'tamanhoArquivo' => filesize($arquivo) . ' bytes',
            'arquivo' => basename($arquivo),
            'diretorio' => $diretorio
        ]
    ]);
    
} catch (Exception $e) {
    responder([
        'success' => false,
        'error' => 'Erro interno do servidor: ' . $e->getMessage()
    ], 500);
}
?>