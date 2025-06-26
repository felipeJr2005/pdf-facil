<?php
// DIAGNÓSTICO COMPLETO DO SISTEMA
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔍 Diagnóstico do Sistema Financeiro</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .code { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; margin: 10px 0; }
        .log { background: #f9f9f9; padding: 10px; border: 1px solid #ccc; max-height: 300px; overflow-y: auto; }
    </style>
</head>
<body>

<h1>🔍 DIAGNÓSTICO COMPLETO DO SISTEMA</h1>
<hr>

<?php
// Informações do servidor
echo "<h2>🖥️ INFORMAÇÕES DO SERVIDOR</h2>";
echo "<table>";
echo "<tr><th>Item</th><th>Valor</th></tr>";
echo "<tr><td>PHP Version</td><td>" . PHP_VERSION . "</td></tr>";
echo "<tr><td>Sistema Operacional</td><td>" . PHP_OS . "</td></tr>";
echo "<tr><td>Servidor Web</td><td>" . ($_SERVER['SERVER_SOFTWARE'] ?? 'N/A') . "</td></tr>";
echo "<tr><td>Document Root</td><td>" . ($_SERVER['DOCUMENT_ROOT'] ?? 'N/A') . "</td></tr>";
echo "<tr><td>Script Atual</td><td>" . __FILE__ . "</td></tr>";
echo "<tr><td>Diretório Atual</td><td>" . __DIR__ . "</td></tr>";
echo "<tr><td>Usuário PHP</td><td>" . (function_exists('posix_getpwuid') ? posix_getpwuid(posix_geteuid())['name'] : 'N/A') . "</td></tr>";
echo "</table>";

// Verificar permissões detalhadas
echo "<h2>📁 PERMISSÕES E ARQUIVOS</h2>";

$arquivos = [
    'Pasta data/' => __DIR__,
    'save.php' => __DIR__ . '/save.php',
    'load.php' => __DIR__ . '/load.php',
    'aplicacoes.json' => __DIR__ . '/aplicacoes.json',
    'debug.log' => __DIR__ . '/debug.log'
];

echo "<table>";
echo "<tr><th>Arquivo/Pasta</th><th>Existe</th><th>Legível</th><th>Gravável</th><th>Tamanho</th><th>Permissões</th></tr>";

foreach ($arquivos as $nome => $caminho) {
    $existe = file_exists($caminho);
    $legivel = $existe ? is_readable($caminho) : false;
    $gravavel = $existe ? is_writable($caminho) : false;
    $tamanho = $existe ? filesize($caminho) : 0;
    $perms = $existe ? substr(sprintf('%o', fileperms($caminho)), -4) : 'N/A';
    
    echo "<tr>";
    echo "<td><strong>$nome</strong><br><small>$caminho</small></td>";
    echo "<td class='" . ($existe ? 'success' : 'error') . "'>" . ($existe ? '✅ SIM' : '❌ NÃO') . "</td>";
    echo "<td class='" . ($legivel ? 'success' : 'error') . "'>" . ($legivel ? '✅ SIM' : '❌ NÃO') . "</td>";
    echo "<td class='" . ($gravavel ? 'success' : 'error') . "'>" . ($gravavel ? '✅ SIM' : '❌ NÃO') . "</td>";
    echo "<td>" . ($tamanho > 0 ? number_format($tamanho) . ' bytes' : '0') . "</td>";
    echo "<td>$perms</td>";
    echo "</tr>";
}

echo "</table>";

// Teste de escrita
echo "<h2>✏️ TESTE DE ESCRITA</h2>";

$arquivoTeste = __DIR__ . '/teste_escrita_' . time() . '.tmp';
$conteudoTeste = 'Teste de escrita: ' . date('Y-m-d H:i:s');

echo "<p><strong>Testando escrita em:</strong> <code>$arquivoTeste</code></p>";

if (file_put_contents($arquivoTeste, $conteudoTeste)) {
    echo "<p class='success'>✅ Escrita bem-sucedida!</p>";
    
    // Verificar se consegue ler
    $leitura = file_get_contents($arquivoTeste);
    if ($leitura === $conteudoTeste) {
        echo "<p class='success'>✅ Leitura confirmada!</p>";
    } else {
        echo "<p class='error'>❌ Erro na leitura!</p>";
    }
    
    // Limpar arquivo de teste
    unlink($arquivoTeste);
    echo "<p class='info'>🗑️ Arquivo de teste removido</p>";
    
} else {
    echo "<p class='error'>❌ FALHA NA ESCRITA - Este é o problema!</p>";
    echo "<p class='warning'>⚠️ Verifique as permissões da pasta data/</p>";
}

// Verificar JSON atual
if (file_exists(__DIR__ . '/aplicacoes.json')) {
    echo "<h2>📄 ANÁLISE DO aplicacoes.json</h2>";
    
    $jsonPath = __DIR__ . '/aplicacoes.json';
    $jsonContent = file_get_contents($jsonPath);
    $jsonData = json_decode($jsonContent, true);
    
    echo "<p><strong>Tamanho:</strong> " . strlen($jsonContent) . " caracteres</p>";
    echo "<p><strong>Última modificação:</strong> " . date('Y-m-d H:i:s', filemtime($jsonPath)) . "</p>";
    
    if ($jsonData) {
        echo "<p class='success'>✅ JSON válido</p>";
        echo "<p><strong>Versão:</strong> " . ($jsonData['versao'] ?? 'N/A') . "</p>";
        echo "<p><strong>Total aplicações:</strong> " . count($jsonData['aplicacoes']) . "</p>";
        echo "<p><strong>Última exportação:</strong> " . ($jsonData['dataExportacao'] ?? 'N/A') . "</p>";
        
        if (isset($jsonData['ultimoSalvamento'])) {
            echo "<p><strong>Último salvamento:</strong> " . $jsonData['ultimoSalvamento']['data'] . "</p>";
            echo "<p><strong>IP do último salvamento:</strong> " . $jsonData['ultimoSalvamento']['ip'] . "</p>";
        }
        
    } else {
        echo "<p class='error'>❌ JSON inválido: " . json_last_error_msg() . "</p>";
    }
}

// Verificar configuração PHP
echo "<h2>⚙️ CONFIGURAÇÃO PHP</h2>";

$configs = [
    'allow_url_fopen' => ini_get('allow_url_fopen'),
    'file_uploads' => ini_get('file_uploads'),
    'max_execution_time' => ini_get('max_execution_time'),
    'memory_limit' => ini_get('memory_limit'),
    'post_max_size' => ini_get('post_max_size'),
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'display_errors' => ini_get('display_errors'),
    'log_errors' => ini_get('log_errors'),
    'error_log' => ini_get('error_log')
];

echo "<table>";
echo "<tr><th>Configuração</th><th>Valor</th></tr>";
foreach ($configs as $nome => $valor) {
    echo "<tr><td>$nome</td><td>" . ($valor ?: 'OFF/Empty') . "</td></tr>";
}
echo "</table>";

// Testar conectividade HTTP
echo "<h2>🌐 TESTE DE CONECTIVIDADE</h2>";

$urlBase = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']);
$urlSave = $urlBase . '/save.php';
$urlLoad = $urlBase . '/load.php';

echo "<p><strong>URL Base:</strong> <code>$urlBase</code></p>";
echo "<p><strong>URL Save:</strong> <code>$urlSave</code></p>";
echo "<p><strong>URL Load:</strong> <code>$urlLoad</code></p>";

// Teste GET no load.php
echo "<h3>📥 Teste GET no load.php</h3>";
$loadResponse = @file_get_contents($urlLoad);
if ($loadResponse) {
    echo "<p class='success'>✅ load.php respondeu</p>";
    $loadData = json_decode($loadResponse, true);
    if ($loadData) {
        echo "<p class='success'>✅ JSON válido retornado</p>";
        if (isset($loadData['success']) && $loadData['success']) {
            echo "<p class='success'>✅ Load funcionando corretamente</p>";
        }
    }
} else {
    echo "<p class='error'>❌ load.php não respondeu</p>";
}

// Mostrar últimas linhas do debug.log
if (file_exists(__DIR__ . '/debug.log')) {
    echo "<h2>📝 ÚLTIMAS ENTRADAS DO DEBUG.LOG</h2>";
    
    $logContent = file_get_contents(__DIR__ . '/debug.log');
    $lines = explode("\n", trim($logContent));
    $lastLines = array_slice($lines, -20); // Últimas 20 linhas
    
    echo "<div class='log'>";
    foreach ($lastLines as $line) {
        if (!empty(trim($line))) {
            echo htmlspecialchars($line) . "<br>";
        }
    }
    echo "</div>";
    
    echo "<p><a href='./debug.log' target='_blank'>📄 Ver log completo</a></p>";
} else {
    echo "<h2>📝 DEBUG.LOG</h2>";
    echo "<p class='warning'>⚠️ Arquivo debug.log não existe - nenhuma requisição foi feita ainda</p>";
}

// JavaScript para teste em tempo real
echo "<h2>🧪 TESTE EM TEMPO REAL</h2>";
?>

<button onclick="testarSalvamento()">🚀 Testar Salvamento Agora</button>
<button onclick="testarCarregamento()">📥 Testar Carregamento</button>
<button onclick="location.reload()">🔄 Atualizar Diagnóstico</button>

<div id="resultadoTeste" style="margin-top: 20px;"></div>

<script>
async function testarSalvamento() {
    const resultado = document.getElementById('resultadoTeste');
    resultado.innerHTML = '<p>⏳ Testando salvamento...</p>';
    
    const dadosTeste = {
        versao: "2.0",
        dataExportacao: new Date().toISOString(),
        totalAplicacoes: 1,
        aplicacoes: [{
            id: 99999,
            tipo: 'TESTE_DIAGNOSTICO',
            tipoTaxa: 'CDI',
            valorAplicado: 1000,
            dataAplicacao: new Date().toISOString().split('T')[0],
            porcentagemCDI: 100,
            banco: 'TESTE_BANCO'
        }],
        taxasReferencia: {
            cdi: '14.90',
            selic: '15.00',
            poupanca: '0.6721'
        }
    };
    
    try {
        console.log('🚀 Iniciando teste de salvamento...');
        console.log('📊 Dados:', dadosTeste);
        
        const response = await fetch('./save.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosTeste)
        });
        
        console.log('📨 Response status:', response.status);
        console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const result = await response.json();
        console.log('📊 Result:', result);
        
        if (result.success) {
            resultado.innerHTML = `
                <div class="success">
                    <h3>✅ SUCESSO!</h3>
                    <p>Salvamento funcionou perfeitamente!</p>
                    <pre>${JSON.stringify(result, null, 2)}</pre>
                </div>
            `;
        } else {
            resultado.innerHTML = `
                <div class="error">
                    <h3>❌ ERRO</h3>
                    <p>Erro: ${result.error}</p>
                    <pre>${JSON.stringify(result, null, 2)}</pre>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('💥 Erro capturado:', error);
        resultado.innerHTML = `
            <div class="error">
                <h3>💥 EXCEÇÃO</h3>
                <p>Erro: ${error.message}</p>
                <p>Verifique o console do navegador para mais detalhes</p>
            </div>
        `;
    }
}

async function testarCarregamento() {
    const resultado = document.getElementById('resultadoTeste');
    resultado.innerHTML = '<p>⏳ Testando carregamento...</p>';
    
    try {
        const response = await fetch('./load.php');
        const result = await response.json();
        
        if (result.success) {
            resultado.innerHTML = `
                <div class="success">
                    <h3>✅ CARREGAMENTO OK!</h3>
                    <p>Total de aplicações: ${result.data.totalAplicacoes}</p>
                </div>
            `;
        } else {
            resultado.innerHTML = `
                <div class="error">
                    <h3>❌ ERRO NO CARREGAMENTO</h3>
                    <p>Erro: ${result.error}</p>
                </div>
            `;
        }
        
    } catch (error) {
        resultado.innerHTML = `
            <div class="error">
                <h3>💥 ERRO NO CARREGAMENTO</h3>
                <p>Erro: ${error.message}</p>
            </div>
        `;
    }
}
</script>

<hr>
<p><strong>⏰ Diagnóstico executado em:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
<p><strong>🔄 Atualize esta página após fazer um teste para ver os logs mais recentes</strong></p>

</body>
</html>