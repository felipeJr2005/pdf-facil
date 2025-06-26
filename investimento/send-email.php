<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir configurações e PHPMailer
require_once __DIR__ . '/email-config.php';
require_once __DIR__ . '/lib/phpmailer/PHPMailer.php';
require_once __DIR__ . '/lib/phpmailer/SMTP.php';
require_once __DIR__ . '/lib/phpmailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

try {
    // Receber dados do POST
    $input = json_decode(file_get_contents('php://input'), true);
    $dados = $input['dados'] ?? null;
    $email_destino = $input['email'] ?? '';
    
    if (!$dados || !$email_destino) {
        throw new Exception('Dados ou email de destino não fornecidos');
    }

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
    
    // Configurações do email
    $mail->setFrom(SMTP_USERNAME, EMAIL_FROM_NAME);
    $mail->addAddress($email_destino);
    $mail->Subject = 'Resumo Financeiro - ' . date('d/m/Y');
    
    // Montar conteúdo do email
    $html = montarEmailHTML($dados);
    $mail->isHTML(true);
    $mail->Body = $html;
    
    // Enviar email
    $mail->send();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Email enviado com sucesso!'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Erro ao enviar email: ' . $e->getMessage()
    ]);
}

function montarEmailHTML($dados) {
    $html = '
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .total { background: #f8f9fa; padding: 10px; border-left: 4px solid #28a745; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .valor { text-align: right; font-weight: bold; }
        </style>
    </head>
    <body>
        <h1 class="header">📊 Resumo Financeiro</h1>
        <p><strong>Data:</strong> ' . date('d/m/Y H:i') . '</p>
        
        <div class="section">
            <h2>💰 Resumo Geral</h2>
            <div class="total">
                <p><strong>Total Investido:</strong> R$ ' . number_format($dados['totalInvestido'], 2, ',', '.') . '</p>
                <p><strong>Valor Atual:</strong> R$ ' . number_format($dados['valorAtual'], 2, ',', '.') . '</p>
                <p><strong>Rendimento:</strong> R$ ' . number_format($dados['rendimento'], 2, ',', '.') . '</p>
                <p><strong>Rentabilidade:</strong> ' . number_format($dados['rentabilidade'], 2, ',', '.') . '%</p>
            </div>
        </div>
        
        <div class="section">
            <h2>📈 Detalhes por Aplicação</h2>
            <table>
                <thead>
                    <tr>
                        <th>Aplicação</th>
                        <th>Valor Aplicado</th>
                        <th>Valor Atual</th>
                        <th>Rendimento</th>
                        <th>Rentabilidade</th>
                    </tr>
                </thead>
                <tbody>';
    
    foreach ($dados['aplicacoes'] as $app) {
        $html .= '
                    <tr>
                        <td>' . htmlspecialchars($app['nome']) . '</td>
                        <td class="valor">R$ ' . number_format($app['valorAplicado'], 2, ',', '.') . '</td>
                        <td class="valor">R$ ' . number_format($app['valorAtual'], 2, ',', '.') . '</td>
                        <td class="valor">R$ ' . number_format($app['rendimento'], 2, ',', '.') . '</td>
                        <td class="valor">' . number_format($app['rentabilidade'], 2, ',', '.') . '%</td>
                    </tr>';
    }
    
    $html .= '
                </tbody>
            </table>
        </div>
        
        <p><em>Relatório gerado automaticamente pelo Controlador Financeiro</em></p>
    </body>
    </html>';
    
    return $html;
}
?>