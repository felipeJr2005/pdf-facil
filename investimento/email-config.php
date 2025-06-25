

<?php
// Configurações de email - ALTERE os dados abaixo

// ⬇️ ALTERE AQUI:
define('SMTP_USERNAME', 'felipejunior@gmail.com');        // Seu email Gmail
define('SMTP_PASSWORD', 'tomg zgbo eelj cgjf');           // Cole aqui a senha de 16 caracteres
define('EMAIL_FROM_NAME', 'Controlador Financeiro');      // Nome que aparece no email

// Configurações Gmail (não alterar)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls');

// Bloquear acesso direto
if (basename($_SERVER['PHP_SELF']) === 'email-config.php') {
    die('❌ Acesso negado');
}
?>