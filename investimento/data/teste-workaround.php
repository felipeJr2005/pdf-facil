<?php
// TESTE WORKAROUND - Verificar se consegue salvar em locais alternativos
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>🔄 Teste Workaround</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; }
        .code { background: #f5f5f5; padding: 15px; border: 1px solid #ddd; margin: 10px 0; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>

<h1>🔄 TESTE WORKAROUND - LOCAIS ALTERNATIVOS</h1>
<hr>

<?php
// Locais para testar
$locais = [
    'data_original' => [
        'path' => __DIR__ . '/aplicacoes.json',
        'desc' => 'pasta data (ideal)',
        'pasta' => __DIR__
    ],
    'temp_sistema' => [
        'path' => sys_get_temp_dir() . '/aplicacoes.json',
        'desc' => 'pasta temporária do sistema',
        'pasta' => sys_get_temp_dir()
    ],
    'tmp_linux' => [
        'path' => '/tmp/aplicacoes.json',
        'desc' => 'pasta /tmp',
        'pasta' => '/tmp'
    ],
    'home_user' => [
        'path' => (getenv('HOME') ?: '/home/www-data') . '/aplicacoes.json',
        'desc' => 'pasta home do usuário',
        'pasta' => getenv('HOME') ?: '/home/www-data'
    ]
];

echo "<h2>📍 TESTANDO LOCAIS DE ESCRITA</h2>";
echo "<table>";
echo "<tr><th>Local</th><th>Pasta</th><th>Existe</th><th>Gravável</th><th>Teste Escrita</th></tr>";

$locaisGravaveis = [];

foreach ($locais as $tipo => $info) {
    $pastaExiste = is_dir($info['pasta']);
    $pastaGravavel = $pastaExiste ? is_writable($info['pasta']) : false;
    
    // Teste de escrita
    $testeEscrita = false;
    if ($pastaGravavel) {
        $arquivoTeste = $info['pasta'] . '/teste_' . time() . '.tmp';
        if (@file_put_contents($arquivoTeste, 'teste workaround')) {
            $testeEscrita = true;
            @unlink($arquivoTeste);
            $locaisGravaveis[] = $info;
        }
    }
    
    echo "<tr>";
    echo "<td><strong>{$info['desc']}</strong><br><small>$tipo</small></td>";
    echo "<td><small>{$info['pasta']}</small></td>";
    echo "<td class='" . ($pastaExiste ? 'success' : 'error') . "'>" . ($pastaExiste ? '✅' : '❌') . "</td>";
    echo "<td class='" . ($pastaGravavel ? 'success' : 'error') . "'>" . ($pastaGravavel ? '✅' : '❌') . "</td>";
    echo "<td class='" . ($testeEscrita ? 'success' : 'error') . "'>" . ($testeEscrita ? '✅' : '❌') . "</td>";
    echo "</tr>";
}

echo "</table>";

// Resultado
echo "<h2>📊 RESULTADO</h2>";

if (count($locaisGravaveis) > 0) {
    echo "<div class='code' style='background: #d4edda; border-color: #c3e6cb;'>";
    echo "<h3 class='success'>✅ WORKAROUND VIÁVEL!</h3>";
    echo "<p>Encontrados " . count($locaisGravaveis) . " local(is) gravável(is):</p>";
    echo "<ul>";
    foreach ($locaisGravaveis as $local) {
        echo "<li><strong>{$local['desc']}</strong>: {$local['pasta']}</li>";
    }
    echo "</ul>";
    echo "<p>🚀 O save.php workaround deve funcionar!</p>";
    echo "</div>";
} else {
    echo "<div class='code' style='background: #f8d7da; border-color: #f5c6cb;'>";
    echo "<h3 class='error'>❌ NENHUM LOCAL GRAVÁVEL</h3>";
    echo "<p>Todos os locais testados falharam.</p>";
    echo "<p>🐳 Será necessário usar o Dockerfile para Railway.</p>";
    echo "</div>";
}

// Informações do sistema
echo "<h2>🖥️ INFORMAÇÕES DO SISTEMA</h2>";
echo "<table>";
echo "<tr><th>Item</th><th>Valor</th></tr>";
echo "<tr><td>Usuário PHP</td><td>" . get_current_user() . "</td></tr>";
echo "<tr><td>Processo ID</td><td>" . getmypid() . "</td></tr>";
echo "<tr><td>Pasta temp sistema</td><td>" . sys_get_temp_dir() . "</td></tr>";
echo "<tr><td>HOME environment</td><td>" . (getenv('HOME') ?: 'não definido') . "</td></tr>";
echo "<tr><td>PHP Version</td><td>" . PHP_VERSION . "</td></tr>";
echo "<tr><td>Sistema</td><td>" . php_uname() . "</td></tr>";
echo "</table>";

?>

<h2>🧪 TESTE JAVASCRIPT COM WORKAROUND</h2>
<p>Teste se o save.php workaround consegue salvar:</p>

<button onclick="testarWorkaround()" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
    🚀 Testar Save Workaround
</button>

<button onclick="testarLoad()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">
    📥 Testar Load Compatível
</button>

<div id="resultadoTeste" style="margin-top: 20px;"></div>

<script>
async function testarWorkaround() {
    const resultado = document.getElementById('resultadoTeste');
    resultado.innerHTML = '<p>⏳ Testando save workaround...</p>';
    
    try {
        const response = await fetch('./save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                versao: '2.0',
                aplicacoes: [
                    { 
                        id: 999, 
                        tipo: 'TESTE_WORKAROUND', 
                        valorAplicado: 1000,
                        tipoTaxa: 'CDI',
                        porcentagemCDI: 100,
                        dataAplicacao: new Date().toISOString().split('T')[0]
                    }
                ],
                taxasReferencia: { cdi: '14.90', selic: '15.00', poupanca: '0.6721' }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            resultado.innerHTML = `
                <div style="background: #d4edda; padding: 15px; border-radius: 5px; border: 1px solid #c3e6cb;">
                    <h4 style="color: green;">🎉 WORKAROUND FUNCIONANDO!</h4>
                    <p><strong>Local usado:</strong> ${result.data.localUsado}</p>
                    <p><strong>Tipo:</strong> ${result.data.tipoLocal}</p>
                    <p><strong>Caminho:</strong> ${result.data.caminhoCompleto}</p>
                    <p><strong>Total aplicações:</strong> ${result.data.totalAplicacoes}</p>
                    <p><strong>Tamanho:</strong> ${result.data.tamanhoArquivo}</p>
                    ${result.workaround ? '<p style="color: orange;"><strong>⚠️ Aviso:</strong> ' + result.aviso + '</p>' : ''}
                </div>
            `;
        } else {
            resultado.innerHTML = `
                <div style="background: #f8d7da; padding: 15px; border-radius: 5px; border: 1px solid #f5c6cb;">
                    <h4 style="color: red;">❌ WORKAROUND FALHOU</h4>
                    <p><strong>Erro:</strong> ${result.error}</p>
                    <p><strong>Debug:</strong> ${JSON.stringify(result.debug, null, 2)}</p>
                </div>
            `;
        }
    } catch (error) {
        resultado.innerHTML = `
            <div style="background: #f8d7da; padding: 15px; border-radius: 5px;">
                <h4 style="color: red;">💥 ERRO DE CONEXÃO</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
}

async function testarLoad() {
    const resultado = document.getElementById('resultadoTeste');
    resultado.innerHTML = '<p>⏳ Testando load compatível...</p>';
    
    try {
        const response = await fetch('./load.php');
        const result = await response.json();
        
        if (result.success) {
            resultado.innerHTML = `
                <div style="background: #d4edda; padding: 15px; border-radius: 5px;">
                    <h4 style="color: green;">✅ LOAD FUNCIONANDO!</h4>
                    <p><strong>Fonte:</strong> ${result.fonte.local_usado}</p>
                    <p><strong>Total aplicações:</strong> ${result.data.totalAplicacoes}</p>
                    <p><strong>Tamanho:</strong> ${result.fonte.tamanho}</p>
                    <p><strong>Modificação:</strong> ${result.fonte.modificacao}</p>
                    <p><strong>Arquivos encontrados:</strong> ${result.fonte.total_encontrados}</p>
                </div>
            `;
        } else {
            resultado.innerHTML = `
                <div style="background: #f8d7da; padding: 15px; border-radius: 5px;">
                    <h4 style="color: red;">❌ LOAD FALHOU</h4>
                    <p>${result.error}</p>
                </div>
            `;
        }
    } catch (error) {
        resultado.innerHTML = `
            <div style="background: #f8d7da; padding: 15px; border-radius: 5px;">
                <h4 style="color: red;">💥 ERRO DE CONEXÃO</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
}
</script>

<hr>
<p><strong>⏰ Teste executado em:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
<p><a href="../index.html">🏠 Testar sistema principal</a></p>

</body>
</html>