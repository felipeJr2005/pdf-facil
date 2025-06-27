<?php
// SCRIPT PARA CORRIGIR PERMISSÕES AUTOMATICAMENTE
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>🔧 Correção de Permissões</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .code { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; margin: 10px 0; }
    </style>
</head>
<body>

<h1>🔧 CORREÇÃO AUTOMÁTICA DE PERMISSÕES</h1>
<hr>

<?php
$dataDir = __DIR__;
$aplicacoesJson = $dataDir . '/aplicacoes.json';

echo "<h2>📁 Status Atual</h2>";
echo "<p><strong>Pasta data:</strong> <code>$dataDir</code></p>";
echo "<p><strong>Permissões pasta:</strong> " . substr(sprintf('%o', fileperms($dataDir)), -4) . "</p>";
echo "<p><strong>Pasta é gravável?</strong> " . (is_writable($dataDir) ? '<span class="success">✅ SIM</span>' : '<span class="error">❌ NÃO</span>') . "</p>";

if (file_exists($aplicacoesJson)) {
    echo "<p><strong>Permissões aplicacoes.json:</strong> " . substr(sprintf('%o', fileperms($aplicacoesJson)), -4) . "</p>";
    echo "<p><strong>Arquivo é gravável?</strong> " . (is_writable($aplicacoesJson) ? '<span class="success">✅ SIM</span>' : '<span class="error">❌ NÃO</span>') . "</p>";
}

echo "<hr>";

// Tentar corrigir permissões
echo "<h2>🛠️ Tentando Corrigir Permissões</h2>";

$sucesso = true;

// Corrigir pasta
echo "<p>🔧 Corrigindo permissões da pasta...</p>";
if (chmod($dataDir, 0755)) {
    echo "<p class='success'>✅ Pasta corrigida: 755</p>";
} else {
    echo "<p class='error'>❌ Falha ao corrigir pasta</p>";
    $sucesso = false;
}

// Corrigir aplicacoes.json
if (file_exists($aplicacoesJson)) {
    echo "<p>🔧 Corrigindo permissões do aplicacoes.json...</p>";
    if (chmod($aplicacoesJson, 0644)) {
        echo "<p class='success'>✅ Arquivo corrigido: 644</p>";
    } else {
        echo "<p class='error'>❌ Falha ao corrigir arquivo</p>";
        $sucesso = false;
    }
}

// Corrigir outros arquivos PHP
$arquivosPHP = glob($dataDir . '/*.php');
foreach ($arquivosPHP as $arquivo) {
    $nome = basename($arquivo);
    if (chmod($arquivo, 0644)) {
        echo "<p class='success'>✅ $nome: 644</p>";
    } else {
        echo "<p class='warning'>⚠️ Falha ao corrigir $nome</p>";
    }
}

echo "<hr>";

// Teste final
echo "<h2>🧪 Teste Final</h2>";

$arquivoTeste = $dataDir . '/teste_escrita_final.tmp';
$conteudoTeste = 'Teste final: ' . date('Y-m-d H:i:s');

if (file_put_contents($arquivoTeste, $conteudoTeste)) {
    echo "<p class='success'>✅ SUCESSO! Pasta agora tem permissão de escrita!</p>";
    unlink($arquivoTeste);
    
    echo "<div class='code'>";
    echo "<h3>🎉 PROBLEMA RESOLVIDO!</h3>";
    echo "<p>Agora você pode:</p>";
    echo "<ul>";
    echo "<li>✅ Salvar dados no sistema</li>";
    echo "<li>✅ Fazer backup automático</li>";
    echo "<li>✅ Usar todas as funcionalidades</li>";
    echo "</ul>";
    echo "<p><strong>Próximo passo:</strong> Teste o sistema clicando em 'Salvar no Servidor'</p>";
    echo "</div>";
    
} else {
    echo "<p class='error'>❌ AINDA COM PROBLEMA de escrita!</p>";
    
    echo "<div class='code'>";
    echo "<h3>📋 COMANDOS MANUAIS NECESSÁRIOS</h3>";
    echo "<p>Execute estes comandos no servidor via SSH:</p>";
    echo "<pre>";
    echo "chmod 777 $dataDir/\n";
    echo "chmod 666 $aplicacoesJson\n";
    echo "chown -R www-data:www-data $dataDir/\n";
    echo "</pre>";
    echo "</div>";
}

// Status atual pós-correção
echo "<hr>";
echo "<h2>📊 Status Pós-Correção</h2>";
echo "<p><strong>Pasta é gravável?</strong> " . (is_writable($dataDir) ? '<span class="success">✅ SIM</span>' : '<span class="error">❌ NÃO</span>') . "</p>";

if (file_exists($aplicacoesJson)) {
    echo "<p><strong>Arquivo é gravável?</strong> " . (is_writable($aplicacoesJson) ? '<span class="success">✅ SIM</span>' : '<span class="error">❌ NÃO</span>') . "</p>";
}

echo "<p><strong>Permissões pasta:</strong> " . substr(sprintf('%o', fileperms($dataDir)), -4) . "</p>";

if (file_exists($aplicacoesJson)) {
    echo "<p><strong>Permissões arquivo:</strong> " . substr(sprintf('%o', fileperms($aplicacoesJson)), -4) . "</p>";
}

echo "<hr>";
echo "<p><strong>⏰ Correção executada em:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "<p><a href='./diagnostico.php'>🔍 Executar diagnóstico completo</a></p>";
echo "<p><a href='../index.html'>🏠 Voltar ao sistema principal</a></p>";

?>

</body>
</html>