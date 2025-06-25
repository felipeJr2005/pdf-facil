<?php
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
    echo "✅ PHPMailer instalado com sucesso!<br>";
    echo "📦 Pronto para usar!";
} else {
    echo "❌ PHPMailer ainda não foi instalado<br>";
    echo "⏳ Aguarde alguns minutos...";
}
?>