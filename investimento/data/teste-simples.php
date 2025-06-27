<?php
// TESTE SIMPLES - Verificar se pasta data/ funciona
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>✅ Teste Simples</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .info { color: blue; }
        .code { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; margin: 10px 0; }
    </style>
</head>
<body>

<h1>✅ TESTE SIMPLES - PASTA DATA</h1>
<hr>

<?php
$arquivo = __DIR__ . '/aplicacoes.json';

echo "<h2>📍 CONFIGURAÇÃO</h2>";
echo "<p><strong>Arquivo:</strong> <code>$arquivo</code></p>";
echo "<p><strong>Pasta:</strong> <code>" . __DIR__ . "</code></p>";

echo "<h2>📊 STATUS</h2>";

// Verificar pasta
$pastaGravavel = is_writable(__DIR__);
echo "<p><strong>Pasta é gravável:</strong> " . ($pastaGravavel ? '<span class="success">✅ SIM</span>' : '<span class="error">❌ NÃO</span>') . "</p>";

// Verificar arquivo
if (file_exists($arquivo)) {
    $arquivoGravavel = is_writable($arquivo);
    $tamanho = filesize($arquivo);
    $modificacao = date('Y-m-d H:i:s', filemtime($arquivo));
    
    echo "<p><strong>Arquivo existe:</strong> <span class='success'>✅ SIM</span></p>";
    echo "<p><strong>Arquivo é gravável:</strong> " . ($arquivoGravavel ? '<span class="success">✅ SIM</span>' : '<span class="error">❌ NÃO</span>') . "</p>";
    echo "<p><strong>Tamanho:</strong> $tamanho bytes</p>";
    echo "<p><strong>Última modificação:</strong> $modificacao</p>";
} else {
    echo "<p><strong>Arquivo existe:</strong> <span class='error'>❌ NÃO</span></p>";
}

// Teste de escrita
echo "<h2>✏️ TESTE DE ESCRITA</h2>";

if ($pastaGravavel) {
    $arquivoTeste = __DIR__ . '/teste_' . time() . '.tmp';
    
    if (file_put_contents($arquivoTeste, 'teste: ' . date('Y-m-d H:i:s'))) {
        echo "<p class='success'>✅ ESCRITA FUNCIONANDO!</p>";
        unlink($arquivoTeste);
    } else {
        echo "<p class='error'>❌ Falha na escrita</p>";
    }
} else {
    echo "<p class='error'>❌ Pasta sem permissão de escrita</p>";
    
    echo "<div class='code'>";
    echo "<h4>🔧 COMANDOS PARA CORRIGIR:</h4>";
    echo "<pre>";
    echo "chmod 755 " . __DIR__ . "/\n";
    echo "chmod 644 " . __DIR__ . "/*.json\n";
    echo "chmod 644 " . __DIR__ . "/*.php\n";
    echo "</pre>";
    echo "</div>";
}

// Resultado
echo "<hr>";
echo "<h2>🎯 RESULTADO</h2>";

if ($pastaGravavel) {
    echo "<div class='code' style='background: #d4edda; border-color: #c3e6cb;'>";
    echo "<h3 class='success'>🎉 PRONTO PARA USAR!</h3>";
    echo "<p>✅ Pasta data/ tem permissão de escrita</p>";
    echo "<p>✅ Sistema pode salvar aplicacoes.json</p>";
    echo "<p>🚀 Teste o sistema principal agora!</p>";
    echo "</div>";
} else {
    echo "<div class='code' style='background: #f8d7da; border-color: #f5c6cb;'>";
    echo "<h3 class='error'>❌ PRECISA CORRIGIR PERMISSÕES</h3>";
    echo "<p>❌ Pasta data/ sem permissão de escrita</p>";
    echo "<p>🔧 Execute os comandos acima</p>";
    echo "</div>";
}

echo "<hr>";
echo "<p><strong>⏰ Teste executado em:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "<p><a href='../index.html'>🏠 Ir para o sistema</a></p>";

?>

<h2>🧪 TESTE JAVASCRIPT</h2>
<button onclick="testarSalvamento()">🚀 Testar Save.php</button>
<button onclick="testarCarregamento()">📥 Testar Load.php</button>

<div id="resultado" style="margin-top: 20px;"></div>

<script>
async function testarSalvamento() {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '<p>⏳ Testando salvamento...</p>';
    
    try {
        const response = await fetch('./save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                versao: '2.0',
                aplicacoes: [{ id: 999, tipo: 'TESTE', valorAplicado: 1000 }],
                taxasReferencia: { cdi: '14.90', selic: '15.00' }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            resultado.innerHTML = `
                <div style="background: #d4edda; padding: 10px; border-radius: 5px;">
                    <h4 style="color: green;">✅ SALVAMENTO FUNCIONANDO!</h4>
                    <p>Total: ${result.data.totalAplicacoes}</p>
                    <p>Tamanho: ${result.data.tamanhoArquivo}</p>
                </div>
            `;
        } else {
            resultado.innerHTML = `
                <div style="background: #f8d7da; padding: 10px; border-radius: 5px;">
                    <h4 style="color: red;">❌ ERRO NO SALVAMENTO</h4>
                    <p>Erro: ${result.error}</p>
                    <p>Debug: ${JSON.stringify(result.debug)}</p>
                </div>
            `;
        }
    } catch (error) {
        resultado.innerHTML = `
            <div style="background: #f8d7da; padding: 10px; border-radius: 5px;">
                <h4 style="color: red;">💥 ERRO DE CONEXÃO</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
}

async function testarCarregamento() {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '<p>⏳ Testando carregamento...</p>';
    
    try {
        const response = await fetch('./load.php');
        const result = await response.json();
        
        if (result.success) {
            resultado.innerHTML = `
                <div style="background: #d4edda; padding: 10px; border-radius: 5px;">
                    <h4 style="color: green;">✅ CARREGAMENTO FUNCIONANDO!</h4>
                    <p>Total: ${result.data.totalAplicacoes}</p>
                    <p>Versão: ${result.data.versao}</p>
                </div>
            `;
        } else {
            resultado.innerHTML = `
                <div style="background: #f8d7da; padding: 10px; border-radius: 5px;">
                    <h4 style="color: red;">❌ ERRO NO CARREGAMENTO</h4>
                    <p>Erro: ${result.error}</p>
                </div>
            `;
        }
    } catch (error) {
        resultado.innerHTML = `
            <div style="background: #f8d7da; padding: 10px; border-radius: 5px;">
                <h4 style="color: red;">💥 ERRO DE CONEXÃO</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
}
</script>

</body>
</html>