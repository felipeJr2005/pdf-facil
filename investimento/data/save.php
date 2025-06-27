<?php
// API para salvar dados no servidor - VERSÃO LIMPA
error_reporting(0);
ini_set('display_errors', 0);

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
    
    if (empty($input)) {
        throw new Exception('Nenhum dado foi enviado');
    }
    
    // Decodificar JSON
    $dados = json_decode($input, true);
    
    if ($dados === null) {
        throw new Exception('Dados JSON inválidos: ' . json_last_error_msg());
    }
    
    // Validar estrutura básica
    if (!isset($dados['aplicacoes']) || !isset($dados['taxasReferencia'])) {
        throw new Exception('Estrutura de dados inválida. Faltam campos obrigatórios.');
    }
    
    // Adicionar metadados de salvamento
    $dados['versao'] = '2.0';
    $dados['dataExportacao'] = date('c');
    $dados['totalAplicacoes'] = count($dados['aplicacoes']);
    $dados['ultimoSalvamento'] = [
        'timestamp' => time(),
        'data' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'desconhecido'
    ];
    
    // Fazer backup do arquivo atual (se existir)
    if (file_exists($arquivo)) {
        $backup = $arquivo . '.backup.' . date('Y-m-d_H-i-s');
        @copy($arquivo, $backup); // @ para suprimir aviso se falhar
    }
    
    // Converter para JSON formatado
    $json = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if ($json === false) {
        throw new Exception('Erro ao codificar dados para JSON: ' . json_last_error_msg());
    }
    
    // Verificar se pasta é gravável
    if (!is_writable(dirname($arquivo))) {
        throw new Exception('Pasta não tem permissão de escrita. Execute: chmod 755 ' . dirname($arquivo));
    }
    
    // Tentar salvar arquivo
    $resultado = file_put_contents($arquivo, $json, LOCK_EX);
    
    if ($resultado === false) {
        throw new Exception('Falha ao escrever no arquivo. Verifique permissões.');
    }
    
    // Sucesso!
    echo json_encode([
        'success' => true,
        'message' => 'Dados salvos no servidor com sucesso!',
        'data' => [
            'totalAplicacoes' => $dados['totalAplicacoes'],
            'dataUltimoSalvamento' => $dados['ultimoSalvamento']['data'],
            'tamanhoArquivo' => filesize($arquivo) . ' bytes',
            'bytesEscritos' => $resultado
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
            'arquivo_existe' => file_exists($arquivo),
            'arquivo_gravavel' => file_exists($arquivo) ? is_writable($arquivo) : false,
            'timestamp' => date('Y-m-d H:i:s'),
            'permissoes_pasta' => is_dir(dirname($arquivo)) ? substr(sprintf('%o', fileperms(dirname($arquivo))), -4) : 'N/A',
            'permissoes_arquivo' => file_exists($arquivo) ? substr(sprintf('%o', fileperms($arquivo)), -4) : 'N/A'
        ]
    ]);
}
?>