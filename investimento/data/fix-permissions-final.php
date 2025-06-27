<?php
// CORREÇÃO DEFINITIVA DE PERMISSÕES - TODAS AS ABORDAGENS
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>🔧 Correção Definitiva de Permissões</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; font-weight: bold; }
        .code { background: #f5f5f5; padding: 15px; border: 1px solid #ddd; margin: 10px 0; border-radius: 5px; }
        .box { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .box-success { background: #d4edda; border: 1px solid #c3e6cb; }
        .box-error { background: #f8d7da; border: 1px solid #f5c6cb; }
        .box-warning { background: #fff3cd; border: 1px solid #ffeaa7; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #218838; }
    </style>
</head>
<body>

<h1>🔧 CORREÇÃO DEFINITIVA DE PERMISSÕES</h1>
<p>Vamos resolver o problema de "Falha ao escrever no arquivo" de uma vez por todas!</p>
<hr>

<?php
// Detectar caminhos
$raizAbsoluta = dirname(dirname(__DIR__)); // 2 níveis acima
$arquivoDestino = $raizAbsoluta . '/aplicacoes.json';

// Informações do sistema
echo "<h2>🖥️ INFORMAÇÕES DO SISTEMA</h2>";
echo "<table>";
echo "<tr><th>Item</th><th>Valor</th></tr>";
echo "<tr><td>PHP Version</td><td>" . PHP_VERSION . "</td></tr>";
echo "<tr><td>Sistema Operacional</td><td>" . PHP_OS . "</td></tr>";
echo "<tr><td>Usuário PHP</td><td>" . (function_exists('posix_getpwuid') ? posix_getpwuid(posix_geteuid())['name'] : get_current_user()) . "</td></tr>";
echo "<tr><td>Grupo PHP</td><td>" . (function_exists('posix_getgrgid') ? posix_getgrgid(posix_getegid())['name'] : 'N/A') . "</td></tr>";
echo "<tr><td>umask</td><td>" . sprintf('%04o', umask()) . "</td></tr>";
echo "<tr><td>DOCUMENT_ROOT</td><td>" . ($_SERVER['DOCUMENT_ROOT'] ?? 'N/A') . "</td></tr>";
echo "</table>";

// Detectar ambiente (Railway, etc)
echo "<h2>☁️ AMBIENTE DETECTADO</h2>";
$isRailway = isset($_ENV['RAILWAY_ENVIRONMENT']) || isset($_SERVER['RAILWAY_ENVIRONMENT']);
$isDocker = file_exists('/.dockerenv');

echo "<p><strong>Railway:</strong> " . ($isRailway ? '<span class="success">✅ SIM</span>' : '<span class="info">❌ NÃO</span>') . "</p>";
echo "<p><strong>Docker:</strong> " . ($isDocker ? '<span class="success">✅ SIM</span>' : '<span class="info">❌ NÃO</span>') . "</p>";

if ($isRailway) {
    echo "<div class='box box-warning'>";
    echo "<h4>⚠️ RAILWAY DETECTADO</h4>";
    echo "<p>Railway pode ter configurações específicas de permissões.</p>";
    echo "<p>Permissões podem ser resetadas a cada deploy.</p>";
    echo "</div>";
}

// Análise detalhada de permissões
echo "<h2>🔍 ANÁLISE DETALHADA DE PERMISSÕES</h2>";

$caminhos = [
    'Raiz absoluta' => $raizAbsoluta,
    'Pasta investimento' => dirname(__DIR__),
    'Pasta data' => __DIR__,
    'Arquivo destino' => $arquivoDestino
];

echo "<table>";
echo "<tr><th>Caminho</th><th>Existe</th><th>Legível</th><th>Gravável</th><th>Permissões</th><th>Proprietário</th></tr>";

foreach ($caminhos as $nome => $caminho) {
    $existe = file_exists($caminho);
    $legivel = $existe ? is_readable($caminho) : false;
    $gravavel = $existe ? is_writable($caminho) : false;
    $perms = $existe ? substr(sprintf('%o', fileperms($caminho)), -4) : 'N/A';
    
    // Tentar obter proprietário
    $owner = 'N/A';
    if ($existe && function_exists('posix_getpwuid')) {
        $stat = stat($caminho);
        $ownerInfo = posix_getpwuid($stat['uid']);
        $owner = $ownerInfo['name'] ?? $stat['uid'];
    }
    
    echo "<tr>";
    echo "<td><strong>$nome</strong><br><small>$caminho</small></td>";
    echo "<td class='" . ($existe ? 'success' : 'error') . "'>" . ($existe ? '✅' : '❌') . "</td>";
    echo "<td class='" . ($legivel ? 'success' : 'error') . "'>" . ($legivel ? '✅' : '❌') . "</td>";
    echo "<td class='" . ($gravavel ? 'success' : 'error') . "'>" . ($gravavel ? '✅' : '❌') . "</td>";
    echo "<td>$perms</td>";
    echo "<td>$owner</td>";
    echo "</tr>";
}

echo "</table>";

// Teste de escrita múltiplo
echo "<h2>✏️ TESTES DE ESCRITA</h2>";

$testePaths = [
    'Raiz absoluta' => $raizAbsoluta . '/teste_escrita.tmp',
    'Pasta investimento' => dirname(__DIR__) . '/teste_escrita.tmp', 
    'Pasta data' => __DIR__ . '/teste_escrita.tmp',
    'Pasta temp sistema' => sys_get_temp_dir() . '/teste_escrita.tmp'
];

$localEscritaOK = null;

foreach ($testePaths as $nome => $arquivoTeste) {
    $conteudoTeste = "Teste de escrita: " . date('Y-m-d H:i:s');
    
    echo "<p><strong>$nome:</strong> ";
    
    if (@file_put_contents($arquivoTeste, $conteudoTeste)) {
        echo "<span class='success'>✅ SUCESSO</span>";
        @unlink($arquivoTeste);
        if (!$localEscritaOK) $localEscritaOK = dirname($arquivoTeste);
    } else {
        echo "<span class='error'>❌ FALHA</span>";
    }
    echo "</p>";
}

// ABORDAGEM 1: Correção automática de permissões
echo "<hr>";
echo "<h2>🛠️ ABORDAGEM 1: CORREÇÃO AUTOMÁTICA</h2>";

$sucessoCorrecao = false;

// Tentar chmod na raiz
if (is_dir($raizAbsoluta)) {
    echo "<p>🔧 Tentando corrigir permissões da raiz...</p>";
    if (@chmod($raizAbsoluta, 0755)) {
        echo "<p class='success'>✅ Raiz: 755 aplicado</p>";
        
        // Tentar criar/corrigir arquivo
        if (file_exists($arquivoDestino)) {
            if (@chmod($arquivoDestino, 0666)) {
                echo "<p class='success'>✅ Arquivo: 666 aplicado</p>";
            }
        }
        
        // Teste final
        $testeConteudo = '{"teste": "' . date('Y-m-d H:i:s') . '"}';
        if (@file_put_contents($arquivoDestino, $testeConteudo)) {
            echo "<p class='success'>✅ CORREÇÃO AUTOMÁTICA FUNCIONOU!</p>";
            $sucessoCorrecao = true;
        } else {
            echo "<p class='error'>❌ Ainda não consegue escrever</p>";
        }
    } else {
        echo "<p class='error'>❌ Não conseguiu alterar permissões da raiz</p>";
    }
}

// ABORDAGEM 2: Local alternativo
if (!$sucessoCorrecao && $localEscritaOK) {
    echo "<hr>";
    echo "<h2>🔄 ABORDAGEM 2: LOCAL ALTERNATIVO</h2>";
    
    echo "<div class='box box-warning'>";
    echo "<h4>⚠️ WORKAROUND TEMPORÁRIO</h4>";
    echo "<p>Como a raiz não tem permissão, vamos usar: <strong>$localEscritaOK</strong></p>";
    echo "<p>O arquivo será salvo em local acessível e depois podemos mover.</p>";
    echo "</div>";
    
    // Criar save.php alternativo
    $saveAlternativo = __DIR__ . '/save-alternativo.php';
    $conteudoSave = '<?php
// SAVE ALTERNATIVO - Local com permissão de escrita
error_reporting(0);
ini_set("display_errors", 0);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Método não permitido"]);
    exit;
}

// LOCAL ALTERNATIVO COM PERMISSÃO
$arquivo = "' . $localEscritaOK . '/aplicacoes.json";

try {
    $input = file_get_contents("php://input");
    if (empty($input)) throw new Exception("Dados vazios");
    
    $dados = json_decode($input, true);
    if (!$dados) throw new Exception("JSON inválido");
    
    $dados["ultimoSalvamento"] = [
        "timestamp" => time(),
        "data" => date("Y-m-d H:i:s"),
        "local" => "' . $localEscritaOK . '"
    ];
    
    $json = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if (file_put_contents($arquivo, $json, LOCK_EX) === false) {
        throw new Exception("Falha na escrita");
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Salvo em local alternativo!",
        "data" => [
            "arquivo" => basename($arquivo),
            "local" => dirname($arquivo),
            "tamanho" => filesize($arquivo) . " bytes"
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>';
    
    if (file_put_contents($saveAlternativo, $conteudoSave)) {
        echo "<p class='success'>✅ save-alternativo.php criado!</p>";
        echo "<p class='info'>📋 Para usar: altere o JavaScript para apontar para './data/save-alternativo.php'</p>";
    }
}

// ABORDAGEM 3: Comandos para o servidor
echo "<hr>";
echo "<h2>🖥️ ABORDAGEM 3: COMANDOS PARA O SERVIDOR</h2>";

echo "<div class='box box-error'>";
echo "<h4>⚠️ SE NADA FUNCIONAR - COMANDOS MANUAIS</h4>";
echo "<p>Execute estes comandos no terminal do Railway/servidor:</p>";
echo "<div class='code'>";
echo "<strong>Via SSH ou Console:</strong><br>";
echo "<pre>";
echo "# Permissões mais amplas\n";
echo "chmod 777 $raizAbsoluta/\n";
echo "chmod 666 $raizAbsoluta/*.json\n";
echo "\n";
echo "# Ou alterar proprietário\n";
echo "chown -R www-data:www-data $raizAbsoluta/\n";
echo "chmod 755 $raizAbsoluta/\n";
echo "\n";
echo "# Para Railway especificamente\n";
echo "chmod -R 755 /app/\n";
echo "</pre>";
echo "</div>";
echo "</div>";

// ABORDAGEM 4: Railway específico
if ($isRailway) {
    echo "<hr>";
    echo "<h2>🚂 ABORDAGEM 4: RAILWAY ESPECÍFICO</h2>";
    
    echo "<div class='box box-warning'>";
    echo "<h4>🚂 CONFIGURAÇÃO RAILWAY</h4>";
    echo "<p>No Railway, você pode precisar:</p>";
    echo "<ol>";
    echo "<li><strong>Dockerfile personalizado</strong> para definir permissões</li>";
    echo "<li><strong>Script de inicialização</strong> que rode chmod no startup</li>";
    echo "<li><strong>Variável de ambiente</strong> para local de escrita</li>";
    echo "</ol>";
    
    echo "<h5>📝 Dockerfile exemplo:</h5>";
    echo "<div class='code'>";
    echo "<pre>";
    echo "FROM php:8.1-apache\n";
    echo "COPY . /var/www/html/\n";
    echo "RUN chmod -R 755 /var/www/html/\n";
    echo "RUN chown -R www-data:www-data /var/www/html/\n";
    echo "</pre>";
    echo "</div>";
    echo "</div>";
}

// Status final
echo "<hr>";
echo "<h2>🎯 STATUS FINAL</h2>";

if ($sucessoCorrecao) {
    echo "<div class='box box-success'>";
    echo "<h3 class='success'>🎉 PROBLEMA RESOLVIDO!</h3>";
    echo "<p>✅ Permissões corrigidas automaticamente</p>";
    echo "<p>✅ Teste de escrita funcionando</p>";
    echo "<p>🚀 Teste o sistema agora - deve funcionar!</p>";
    echo "</div>";
} elseif ($localEscritaOK) {
    echo "<div class='box box-warning'>";
    echo "<h3 class='warning'>⚠️ WORKAROUND DISPONÍVEL</h3>";
    echo "<p>❌ Raiz sem permissão de escrita</p>";
    echo "<p>✅ Local alternativo: $localEscritaOK</p>";
    echo "<p>🔧 Use save-alternativo.php como solução temporária</p>";
    echo "</div>";
} else {
    echo "<div class='box box-error'>";
    echo "<h3 class='error'>❌ PROBLEMA PERSISTE</h3>";
    echo "<p>❌ Nenhum local com permissão de escrita encontrado</p>";
    echo "<p>🛠️ Execute os comandos manuais no servidor</p>";
    echo "<p>🚂 Se Railway: considere Dockerfile personalizado</p>";
    echo "</div>";
}

echo "<hr>";
echo "<p><strong>⏰ Análise executada em:</strong> " . date('Y-m-d H:i:s') . "</p>";

// Botões de ação
if ($localEscritaOK) {
    echo "<p><button onclick='testarAlternativo()' class='btn-success'>🧪 Testar Local Alternativo</button></p>";
}
echo "<p><button onclick='location.reload()' class='btn-primary'>🔄 Atualizar Diagnóstico</button></p>";
echo "<p><a href='../index.html'><button class='btn-primary'>🏠 Voltar ao Sistema</button></a></p>";

if ($localEscritaOK) {
    echo "<script>
    async function testarAlternativo() {
        try {
            const response = await fetch('./save-alternativo.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    versao: '2.0',
                    aplicacoes: [{id: 999, teste: 'alternativo'}],
                    taxasReferencia: {cdi: '14.90'}
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ WORKAROUND FUNCIONANDO!\\n\\nLocal: ' + result.data.local + '\\nArquivo: ' + result.data.arquivo);
            } else {
                alert('❌ Erro: ' + result.error);
            }
        } catch (error) {
            alert('❌ Erro: ' + error.message);
        }
    }
    </script>";
}
?>

</body>
</html>