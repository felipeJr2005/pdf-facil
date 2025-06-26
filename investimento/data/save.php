<?php
// Configurações para evitar qualquer saída indesejada
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Buffer de saída para controlar exatamente o que é enviado
ob_start();

// Headers obrigatórios
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Função para enviar resposta JSON e finalizar
function enviarResposta($data, $status = 200) {
    ob_clean(); // Limpar qualquer saída anterior
    http_response_code($status);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    ob_end_flush();
    exit;
}

// Função para log de debug
function logDebug($message) {
    error_log("[SAVE.PHP DEBUG] " . $message);
}

try {
    logDebug("=== INICIANDO SAVE.PHP ===");
    logDebug("Método: " . ($_SERVER['REQUEST_METHOD'] ?? 'INDEFINIDO'));
    logDebug("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'INDEFINIDO'));
    
    // Verificar método (aceitar OPTIONS para CORS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        enviarResposta(['message' => 'CORS OK']);
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        logDebug("Método inválido: " . $_SERVER['REQUEST_METHOD']);
        enviarResposta([
            'success' => false,
            'error' => 'Método não permitido. Use POST.',
            'metodo_recebido' => $_SERVER['REQUEST_METHOD']
        ], 405);
    }

    // Verificar se consegue acessar o diretório
    $diretorio = __DIR__;
    logDebug("Diretório atual: $diretorio");
    
    if (!is_dir($diretorio)) {
        logDebug("Diretório não existe: $diretorio");
        enviarResposta([
            'success' => false,
            'error' => 'Diretório não encontrado',
            'diretorio' => $diretorio
        ], 500);
    }
    
    if (!is_writable($diretorio)) {
        logDebug("Sem permissão de escrita: $diretorio");
        enviarResposta([
            'success' => false,
            'error' => 'Sem permissão de escrita no diretório',
            'diretorio' => $diretorio,
            'permissoes' => substr(sprintf('%o', fileperms($diretorio)), -4)
        ], 500);
    }

    // Caminho do arquivo JSON
    $arquivo = $diretorio . '/aplicacoes.json';
    logDebug("Arquivo destino: $arquivo");

    // Ler dados enviados
    $input = file_get_contents('php://input');
    logDebug("Tamanho dos dados recebidos: " . strlen($input) . " bytes");
    logDebug("Primeiros 100 chars: " . substr($input, 0, 100));
    
    if (empty($input)) {
        logDebug("Nenhum dado recebido");
        enviarResposta([
            'success' => false,
            'error' => 'Nenhum dado enviado'
        ], 400);
    }
    
    // Decodificar JSON
    $dados = json_decode($input, true);
    
    if ($dados === null) {
        $jsonError = json_last_error_msg();
        logDebug("Erro JSON: $jsonError");
        enviarResposta([
            'success' => false,
            'error' => 'Dados JSON inválidos: ' . $jsonError,
            'dados_recebidos' => substr($input, 0, 200)
        ], 400);
    }
    
    logDebug("JSON decodificado com sucesso");
    logDebug("Chaves principais: " . implode(', ', array_keys($dados)));
    
    // Validar estrutura básica (flexível)
    if (!isset($dados['aplicacoes'])) {
        logDebug("Campo 'aplicacoes' não encontrado");
        enviarResposta([
            'success' => false,
            'error' => 'Campo obrigatório "aplicacoes" não encontrado',
            'campos_encontrados' => array_keys($dados)
        ], 400);
    }
    
    if (!is_array($dados['aplicacoes'])) {
        logDebug("Campo 'aplicacoes' não é array");
        enviarResposta([
            'success' => false,
            'error' => 'Campo "aplicacoes" deve ser um array',
            'tipo_recebido' => gettype($dados['aplicacoes'])
        ], 400);
    }
    
    // Adicionar metadados
    $dados['versao'] = '2.0';
    $dados['dataExportacao'] = date('c');
    $dados['totalAplicacoes'] = count($dados['aplicacoes']);
    $dados['ultimoSalvamento'] = [
        'timestamp' => time(),
        'data' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'desconhecido'
    ];
    
    logDebug("Metadados adicionados. Total aplicações: " . $dados['totalAplicacoes']);
    
    // Backup do arquivo existente
    if (file_exists($arquivo)) {
        $backup = $arquivo . '.backup.' . date('Y-m-d_H-i-s');
        if (copy($arquivo, $backup)) {
            logDebug("Backup criado: $backup");
        } else {
            logDebug("Falha ao criar backup: $backup");
        }
    } else {
        logDebug("Arquivo não existe ainda, primeiro salvamento");
    }
    
    // Converter para JSON
    $json = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if ($json === false) {
        $jsonError = json_last_error_msg();
        logDebug("Erro ao codificar JSON: $jsonError");
        enviarResposta([
            'success' => false,
            'error' => 'Erro ao codificar dados: ' . $jsonError
        ], 500);
    }
    
    logDebug("JSON codificado. Tamanho: " . strlen($json) . " bytes");
    
    // Salvar arquivo
    $bytesEscritos = file_put_contents($arquivo, $json, LOCK_EX);
    
    if ($bytesEscritos === false) {
        logDebug("Falha ao escrever arquivo");
        enviarResposta([
            'success' => false,
            'error' => 'Erro ao salvar arquivo no servidor',
            'arquivo' => $arquivo,
            'diretorio_permissoes' => is_writable($diretorio) ? 'OK' : 'SEM PERMISSÃO'
        ], 500);
    }
    
    logDebug("Arquivo salvo com sucesso. Bytes escritos: $bytesEscritos");
    
    // Verificar se o arquivo foi realmente salvo
    if (!file_exists($arquivo)) {
        logDebug("Arquivo não foi criado após file_put_contents");
        enviarResposta([
            'success' => false,
            'error' => 'Arquivo não foi criado após salvamento'
        ], 500);
    }
    
    $tamanhoFinal = filesize($arquivo);
    logDebug("Verificação final: arquivo existe, tamanho: $tamanhoFinal bytes");
    
    // Sucesso!
    enviarResposta([
        'success' => true,
        'message' => 'Dados salvos no servidor com sucesso!',
        'data' => [
            'totalAplicacoes' => $dados['totalAplicacoes'],
            'dataUltimoSalvamento' => $dados['ultimoSalvamento']['data'],
            'tamanhoArquivo' => $tamanhoFinal . ' bytes',
            'arquivo' => basename($arquivo)
        ]
    ]);
    
} catch (Throwable $e) {
    logDebug("ERRO CAPTURADO: " . $e->getMessage());
    logDebug("Arquivo: " . $e->getFile() . " Linha: " . $e->getLine());
    
    enviarResposta([
        'success' => false,
        'error' => 'Erro interno do servidor',
        'debug' => [
            'message' => $e->getMessage(),
            'file' => basename($e->getFile()),
            'line' => $e->getLine(),
            'php_version' => PHP_VERSION
        ]
    ], 500);
}
?>