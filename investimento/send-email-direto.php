<?php
// ENVIO DIRETO DE EMAIL - PARA INTEGRAÇÃO COM VERIFICAÇÃO AUTOMÁTICA
// Este arquivo permite envio de email sem depender de POST HTTP

// Incluir configurações e PHPMailer
require_once __DIR__ . '/email-config.php';
require_once __DIR__ . '/lib/phpmailer/PHPMailer.php';
require_once __DIR__ . '/lib/phpmailer/SMTP.php';
require_once __DIR__ . '/lib/phpmailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Função principal para envio direto
function enviarEmailDireto($destinatario, $assunto, $conteudoHtml, $conteudoTexto = null) {
    try {
        // Criar instância do PHPMailer
        $mail = new PHPMailer(true);
        
        // Configurações SMTP
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port = SMTP_PORT;
        $mail->CharSet = 'UTF-8';
        
        // Debug para desenvolvimento (comentar em produção)
        // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        
        // Configurações do email
        $mail->setFrom(SMTP_USERNAME, EMAIL_FROM_NAME);
        $mail->addAddress($destinatario);
        $mail->Subject = $assunto;
        
        // Conteúdo
        if ($conteudoHtml) {
            $mail->isHTML(true);
            $mail->Body = $conteudoHtml;
            
            // Se não foi fornecido texto simples, gerar automaticamente
            if (!$conteudoTexto) {
                $conteudoTexto = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $conteudoHtml));
            }
            $mail->AltBody = $conteudoTexto;
        } else {
            $mail->isHTML(false);
            $mail->Body = $conteudoTexto ?: $conteudoHtml;
        }
        
        // Enviar
        $resultado = $mail->send();
        
        return [
            'success' => true,
            'message' => 'Email enviado com sucesso',
            'destinatario' => $destinatario,
            'assunto' => $assunto,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Erro ao enviar email: ' . $e->getMessage(),
            'destinatario' => $destinatario,
            'assunto' => $assunto,
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
}

// COMPATIBILIDADE COM CHAMADAS HTTP (se chamado via web)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST)) {
    header('Content-Type: application/json');
    
    try {
        $destinatario = $_POST['email'] ?? '';
        $dados = $_POST['dados'] ?? [];
        
        if (empty($destinatario)) {
            throw new Exception('Email de destino não fornecido');
        }
        
        $assunto = $dados['assunto'] ?? 'Email do Sistema Financeiro';
        $conteudo = $dados['conteudo'] ?? '';
        
        if (empty($conteudo)) {
            throw new Exception('Conteúdo do email não fornecido');
        }
        
        $resultado = enviarEmailDireto($destinatario, $assunto, $conteudo);
        
        echo json_encode($resultado);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}

// COMPATIBILIDADE COM INCLUDE/REQUIRE (se chamado via include)
else if (isset($_POST['dados']) && isset($_POST['email'])) {
    $destinatario = $_POST['email'];
    $dados = $_POST['dados'];
    
    $assunto = $dados['assunto'] ?? 'Email do Sistema Financeiro';
    $conteudo = $dados['conteudo'] ?? '';
    
    if (!empty($destinatario) && !empty($conteudo)) {
        $resultado = enviarEmailDireto($destinatario, $assunto, $conteudo);
        return $resultado['success'];
    }
    
    return false;
}

// FUNÇÃO DE TESTE (se chamado diretamente)
else if (isset($_GET['teste'])) {
    echo "<!DOCTYPE html>
    <html>
    <head>
        <title>Teste de Email</title>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .success { color: green; font-weight: bold; }
            .error { color: red; font-weight: bold; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <h1>🧪 Teste do Sistema de Email</h1>";
    
    $emailTeste = SMTP_USERNAME; // Enviar para próprio email
    $assuntoTeste = "✅ Teste do Sistema - " . date('d/m/Y H:i');
    $conteudoTeste = "
    <html>
    <body>
        <h2>✅ Teste do Sistema de Email</h2>
        <p><strong>Data/Hora:</strong> " . date('d/m/Y H:i:s') . "</p>
        <p><strong>Sistema:</strong> Controlador Financeiro</p>
        <p><strong>Função:</strong> send-email-direto.php</p>
        <p><strong>Status:</strong> ✅ Funcionando corretamente!</p>
        
        <hr>
        <p><small>Se você recebeu este email, o sistema está configurado corretamente.</small></p>
    </body>
    </html>";
    
    echo "<p>📧 Enviando email de teste para: <strong>$emailTeste</strong></p>";
    
    $resultado = enviarEmailDireto($emailTeste, $assuntoTeste, $conteudoTeste);
    
    if ($resultado['success']) {
        echo "<p class='success'>✅ SUCESSO! Email enviado com sucesso!</p>";
        echo "<p>Verifique sua caixa de entrada (e spam) em alguns minutos.</p>";
    } else {
        echo "<p class='error'>❌ ERRO: " . htmlspecialchars($resultado['message']) . "</p>";
    }
    
    echo "<div class='info'>
    <p><strong>📋 Detalhes da configuração:</strong></p>
    <ul>
        <li><strong>SMTP Host:</strong> " . SMTP_HOST . "</li>
        <li><strong>SMTP Port:</strong> " . SMTP_PORT . "</li>
        <li><strong>SMTP Username:</strong> " . SMTP_USERNAME . "</li>
        <li><strong>Email From Name:</strong> " . EMAIL_FROM_NAME . "</li>
    </ul>
    </div>
    
    <hr>
    <p><a href='?'>← Voltar</a> | <a href='verifica-vencimentos.php'>Testar Verificação de Vencimentos</a></p>
    </body>
    </html>";
}

// PÁGINA DE INFORMAÇÕES (se chamado sem parâmetros)
else if (isset($_SERVER['HTTP_HOST'])) {
    echo "<!DOCTYPE html>
    <html>
    <head>
        <title>Sistema de Email - Controlador Financeiro</title>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
            .btn { display: inline-block; padding: 10px 15px; margin: 5px; text-decoration: none; 
                   background: #007bff; color: white; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>📧 Sistema de Email - Controlador Financeiro</h1>
        
        <div class='status info'>
            <strong>ℹ️ Informações do Sistema</strong><br>
            Data/Hora: " . date('d/m/Y H:i:s') . "<br>
            Arquivo: send-email-direto.php<br>
            Status: ✅ Ativo e funcionando
        </div>
        
        <h2>🛠️ Funcionalidades Disponíveis</h2>
        <ul>
            <li><strong>Envio Direto:</strong> Função <code>enviarEmailDireto()</code></li>
            <li><strong>Compatibilidade HTTP:</strong> Aceita POST requests</li>
            <li><strong>Compatibilidade Include:</strong> Pode ser incluído em outros scripts</li>
            <li><strong>Teste de Configuração:</strong> Verificação automática de funcionamento</li>
        </ul>
        
        <h2>🧪 Testes Disponíveis</h2>
        <ul>
            <li><a href='?teste=1' class='btn'>🧪 Teste de Envio de Email</a></li>
            <li><a href='verifica-vencimentos.php' class='btn'>🔍 Verificação de Vencimentos</a></li>
            <li><a href='cron-setup.php' class='btn'>⚙️ Configuração de Automação</a></li>
            <li><a href='../' class='btn'>🏠 Voltar ao Sistema Principal</a></li>
        </ul>
        
        <h2>⚙️ Configuração Atual</h2>
        <ul>
            <li><strong>SMTP Host:</strong> " . SMTP_HOST . "</li>
            <li><strong>SMTP Port:</strong> " . SMTP_PORT . "</li>
            <li><strong>Email configurado:</strong> " . SMTP_USERNAME . "</li>
            <li><strong>Nome remetente:</strong> " . EMAIL_FROM_NAME . "</li>
        </ul>
        
        <hr>
        <p><small><em>Sistema desenvolvido para verificação automática de vencimentos de investimentos.</em></small></p>
    </body>
    </html>";
}
?>