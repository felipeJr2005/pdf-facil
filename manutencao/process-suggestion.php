<?php
/**
 * PDFFacil - Processador de Sugestões (Versão Simplificada)
 * Caminho: manutencao/process-suggestion.php
 */

// Configuração
$siteRoot = dirname(dirname(__FILE__));
$notesFile = $siteRoot . '/maintenance_notes.json';
$logFile = __DIR__ . '/suggestion_log.txt';

// Receber dados
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

// Resposta padrão
$response = ['success' => false, 'message' => 'Erro desconhecido'];

// Validar dados
if (!$data) {
    $response['message'] = 'Dados inválidos';
    sendResponse($response);
}

// Campos obrigatórios
if (empty($data['name']) || empty($data['email']) || empty($data['module']) || empty($data['content'])) {
    $response['message'] = 'Todos os campos são obrigatórios';
    sendResponse($response);
}

// Validar email
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Email inválido';
    sendResponse($response);
}

// Sanitizar
$name = htmlspecialchars(strip_tags(trim($data['name'])));
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$module = htmlspecialchars(strip_tags(trim($data['module'])));
$content = htmlspecialchars(strip_tags(trim($data['content'])));

// Carregar notas existentes
$notes = [];
if (file_exists($notesFile)) {
    $jsonContent = file_get_contents($notesFile);
    $notes = json_decode($jsonContent, true) ?: [];
}

// Nova nota
$id = time() . '_' . mt_rand(1000, 9999);
$newNote = [
    'id' => $id,
    'title' => '[SUGESTÃO] ' . substr($name, 0, 30),
    'content' => "De: $name\nEmail: $email\n\n" . $content,
    'module' => $module,
    'priority' => 'média',
    'date_created' => date('Y-m-d H:i:s'),
    'status' => 'pendente',
    'source' => 'public'
];

// Adicionar e salvar
$notes[] = $newNote;
$saved = @file_put_contents($notesFile, json_encode($notes, JSON_PRETTY_PRINT));

if ($saved !== false) {
    // Log de sucesso
    $logMessage = "[" . date('Y-m-d H:i:s') . "] SUCESSO: Nova sugestão de $name ($email)\n";
    @file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    $response['success'] = true;
    $response['message'] = 'Sugestão recebida com sucesso';
} else {
    // Log de erro
    $error = error_get_last()['message'] ?? 'Erro desconhecido';
    $logMessage = "[" . date('Y-m-d H:i:s') . "] ERRO: Falha ao salvar: $error\n";
    @file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    $response['message'] = 'Não foi possível salvar sua sugestão';
}

// Enviar resposta
sendResponse($response);

// Função para enviar resposta
function sendResponse($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
