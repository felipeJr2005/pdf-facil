<?php
// Teste manual do PHPMailer
if (file_exists(__DIR__ . '/lib/phpmailer/PHPMailer.php')) {
    require_once __DIR__ . '/lib/phpmailer/PHPMailer.php';
    require_once __DIR__ . '/lib/phpmailer/SMTP.php';
    require_once __DIR__ . '/lib/phpmailer/Exception.php';
    
    echo "✅ PHPMailer instalado manualmente!<br>";
    echo "📦 Versão: Manual<br>";
    echo "🚀 Pronto para usar!";
} else {
    echo "❌ PHPMailer não encontrado<br>";
    echo "📁 Verifique se está em: lib/phpmailer/";
}
?>