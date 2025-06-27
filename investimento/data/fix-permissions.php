<?php
// CORREÇÃO SIMPLES - SÓ PASTA DATA
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>🔧 Corrigir Permissões - Data</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .info { color: blue; }
        .code { background: #f5f5f5; padding: 15px; border: 1px solid #ddd; margin: 10px 0; }
    </style>
</head>
<body>

<h1>🔧 CORREÇÃO DE PERMISSÕES - PASTA DATA</h1>
<hr>

<?php
$pastaData = __DIR__;
$arquivo = $pastaData . '/aplicacoes.json';

echo "<h2>📍 LOCAL</h2>";
echo "<p><strong>Pasta data:</strong> <code>$pastaData</code></p>";
echo "<p><strong>Arquivo JSON:</strong> <code>$arquivo</code></p>";

echo "<h2>📊 STATUS ANTES</h2>";
echo "<p><strong>Pasta gravável:</strong> " . (is_writable($pastaData) ? '<span class="success">✅ SIM</span>' : '<span class="error">❌ NÃO</span>') . "</p>";

if (file_exists($arquivo)) {
    echo "<p><strong>Arquivo gravável:</strong> " . (is_writable($arquivo) ? '<span class="success">✅ SIM</span>' : '<span class="error">❌ NÃO</span>') . "</p>";
}

echo "<h2>🛠️ CORREÇÃO AUTOMÁTICA</h2>";

$sucesso = true;

// Corrigir pasta
echo "<p>🔧 Corrigindo pasta data...</p>";
if (chmod($pastaData, 0755)) {
    echo "<p class='success'>✅ Pasta: 755 aplicado</p>";
} else {
    echo "<p class='error'>❌ Falha ao corrigir pasta</p>";
    $sucesso = false;
}

// Corrigir arquivo se existir
if (file_exists($arquivo)) {
    echo "<p>🔧 Corrigindo aplicacoes.json...</p>";
    if (chmod($arquivo, 0644)) {
        echo "<p class='success'>✅ Arquivo: 644 aplicado</p>";
    } else {
        echo "<p class='error'>❌ Falha ao corrigir arquivo</p>";
        $sucesso = false;
    }
}

// Corrigir arquivos PHP
$arquivosPHP = glob($pastaData . '/*.php');
echo "<p>🔧 Corrigindo arquivos PHP...</p>";
foreach ($arquivosPHP as $phpFile) {
    $nome = basename($phpFile);
    if (chmod($phpFile, 0644)) {
        echo "<p class='success'>✅ $nome: 644</p>";
    } else {
        echo "<p class='error'>❌ Falha: $nome</p>";
    }
}

echo "<h2>📊 STATUS DEPOIS</h2>";
echo "<p><strong>Pasta gravável:</strong> " . (is_writable($pastaData) ? '<span class="success">✅ SIM</span>' : '<span class="error">❌ NÃO</span>') . "</p>";

if (file_exists($arquivo)) {
    echo "<p><strong>Arquivo gravável:</strong> " . (is_writable($arquivo) ? '<span class="success">✅ SIM</span>' : '<span class="error">❌ NÃO</span>') . "</p>";
}

// Teste final
echo "<h2>🧪 TESTE FINAL</h2>";

$arquivoTeste = $pastaData . '/teste_final_' . time() . '.tmp';

if (file_put_contents($arquivoTeste, 'Teste final: ' . date('Y-m-d H:i:s'))) {
    echo "<p class='success'>✅ ESCRITA FUNCIONANDO!</p>";
    unlink($arquivoTeste);
    
    echo "<div class='code' style='background: #d4edda; border-color: #c3e6cb;'>";
    echo "<h3 class='success'>🎉 PERMISSÕES CORRIGIDAS!</h3>";
    echo "<p>✅ Pasta data/ agora tem permissão de escrita</p>";
    echo "<p>✅ Sistema pode salvar aplicacoes.json</p>";
    echo "<p>🚀 Teste o sistema principal!</p>";
    echo "</div>";
    
} else {
    echo "<p class='error'>❌ AINDA NÃO CONSEGUE ESCREVER</p>";
    
    echo "<div class='code' style='background: #f8d7da; border-color: #f5c6cb;'>";
    echo "<h3 class='error'>❌ COMANDOS MANUAIS NECESSÁRIOS</h3>";
    echo "<p>Execute no servidor:</p>";
    echo "<pre>";
    echo "chmod 777 $pastaData/\n";
    echo "chmod 666 $arquivo\n";
    echo "chown -R www-data:www-data $pastaData/\n";
    echo "</pre>";
    echo "</div>";
}

echo "<hr>";
echo "<p><strong>⏰ Correção executada em:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "<p><a href='./teste-simples.php'>🧪 Fazer teste completo</a></p>";
echo "<p><a href='../index.html'>🏠 Ir para o sistema</a></p>";

?>

</body>
</html>