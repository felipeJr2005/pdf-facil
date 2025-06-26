<?php
// TESTE ISOLADO - Verificar se save.php funciona independentemente
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🧪 TESTE ISOLADO DO SISTEMA DE SALVAMENTO</h1>";
echo "<hr>";

// Dados de teste
$dadosTeste = [
    'versao' => '2.0',
    'dataExportacao' => date('c'),
    'totalAplicacoes' => 2,
    'aplicacoes' => [
        [
            'id' => 999,
            'tipo' => 'TESTE_CDB',
            'tipoTaxa' => 'CDI',
            'valorAplicado' => 1000,
            'dataAplicacao' => date('Y-m-d'),
            'dataResgate' => date('Y-m-d', strtotime('+1 year')),
            'porcentagemCDI' => 120,
            'taxaPreFixada' => null,
            'taxaAdmin' => null,
            'banco' => 'TESTE_BANCO'
        ],
        [
            'id' => 998,
            'tipo' => 'TESTE_LCA',
            'tipoTaxa' => 'PRE',
            'valorAplicado' => 5000,
            'dataAplicacao' => date('Y-m-d'),
            'dataResgate' => date('Y-m-d', strtotime('+2 years')),
            'porcentagemCDI' => null,
            'taxaPreFixada' => 15.5,
            'taxaAdmin' => null,
            'banco' => 'TESTE_BANCO_2'
        ]
    ],
    'taxasReferencia' => [
        'cdi' => '14.90',
        'selic' => '15.00',
        'poupanca' => '0.6721'
    ]
];

echo "<h2>📊 DADOS DE TESTE</h2>";
echo "<pre>" . json_encode($dadosTeste, JSON_PRETTY_PRINT) . "</pre>";

echo "<h2>🔧 VERIFICAÇÕES PRELIMINARES</h2>";

// Verificar arquivo save.php
$savePhpPath = __DIR__ . '/save.php';
echo "<p><strong>save.php existe?</strong> " . (file_exists($savePhpPath) ? '✅ SIM' : '❌ NÃO') . "</p>";
echo "<p><strong>Caminho:</strong> <code>$savePhpPath</code></p>";

// Verificar aplicacoes.json
$jsonPath = __DIR__ . '/aplicacoes.json';
echo "<p><strong>aplicacoes.json existe?</strong> " . (file_exists($jsonPath) ? '✅ SIM' : '❌ NÃO') . "</p>";
echo "<p><strong>Caminho:</strong> <code>$jsonPath</code></p>";

if (file_exists($jsonPath)) {
    echo "<p><strong>Tamanho atual:</strong> " . filesize($jsonPath) . " bytes</p>";
    echo "<p><strong>Última modificação:</strong> " . date('Y-m-d H:i:s', filemtime($jsonPath)) . "</p>";
}

// Verificar permissões
echo "<p><strong>Pasta é gravável?</strong> " . (is_writable(__DIR__) ? '✅ SIM' : '❌ NÃO') . "</p>";

if (file_exists($jsonPath)) {
    echo "<p><strong>Arquivo é gravável?</strong> " . (is_writable($jsonPath) ? '✅ SIM' : '❌ NÃO') . "</p>";
}

// Verificar arquivo de debug
$debugPath = __DIR__ . '/debug.log';
echo "<p><strong>debug.log existe?</strong> " . (file_exists($debugPath) ? '✅ SIM' : '❌ NÃO') . "</p>";

if (file_exists($debugPath)) {
    echo "<p><strong>Tamanho do log:</strong> " . filesize($debugPath) . " bytes</p>";
    echo "<p><strong>Última modificação:</strong> " . date('Y-m-d H:i:s', filemtime($debugPath)) . "</p>";
}

echo "<hr>";

// TESTE 1: Via cURL (simular JavaScript)
echo "<h2>🚀 TESTE 1: Via cURL (simula o JavaScript)</h2>";

$url = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/save.php';
echo "<p><strong>URL de teste:</strong> <code>$url</code></p>";

$json = json_encode($dadosTeste);
echo "<p><strong>JSON enviado:</strong> " . strlen($json) . " caracteres</p>";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($json)
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "<h3>📨 Resultado do cURL:</h3>";
echo "<p><strong>HTTP Code:</strong> $httpCode</p>";

if ($error) {
    echo "<p><strong>Erro cURL:</strong> <span style='color: red;'>$error</span></p>";
} else {
    echo "<p><strong>Erro cURL:</strong> ✅ Nenhum</p>";
}

echo "<p><strong>Resposta:</strong></p>";
echo "<pre style='background: #f5f5f5; padding: 10px; border: 1px solid #ddd;'>";
echo htmlspecialchars($response);
echo "</pre>";

// Tentar decodificar a resposta
if ($response) {
    $decoded = json_decode($response, true);
    if ($decoded) {
        echo "<h4>📊 Resposta decodificada:</h4>";
        echo "<pre>";
        print_r($decoded);
        echo "</pre>";
        
        if (isset($decoded['success']) && $decoded['success']) {
            echo "<p style='color: green; font-weight: bold;'>✅ TESTE 1: SUCESSO!</p>";
        } else {
            echo "<p style='color: red; font-weight: bold;'>❌ TESTE 1: FALHOU!</p>";
            if (isset($decoded['error'])) {
                echo "<p><strong>Erro:</strong> " . htmlspecialchars($decoded['error']) . "</p>";
            }
        }
    } else {
        echo "<p style='color: orange;'>⚠️ Resposta não é JSON válido</p>";
    }
}

echo "<hr>";

// TESTE 2: Via file_get_contents
echo "<h2>🌐 TESTE 2: Via file_get_contents</h2>";

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $json
    ]
]);

$response2 = @file_get_contents($url, false, $context);

echo "<h3>📨 Resultado do file_get_contents:</h3>";

if ($response2 === false) {
    echo "<p style='color: red;'>❌ Falha na requisição</p>";
    
    // Verificar $http_response_header
    if (isset($http_response_header)) {
        echo "<h4>📋 Headers de resposta:</h4>";
        echo "<pre>";
        foreach ($http_response_header as $header) {
            echo htmlspecialchars($header) . "\n";
        }
        echo "</pre>";
    }
} else {
    echo "<p>✅ Requisição bem-sucedida</p>";
    echo "<p><strong>Resposta:</strong></p>";
    echo "<pre style='background: #f0f8f0; padding: 10px; border: 1px solid #4CAF50;'>";
    echo htmlspecialchars($response2);
    echo "</pre>";
    
    $decoded2 = json_decode($response2, true);
    if ($decoded2) {
        if (isset($decoded2['success']) && $decoded2['success']) {
            echo "<p style='color: green; font-weight: bold;'>✅ TESTE 2: SUCESSO!</p>";
        } else {
            echo "<p style='color: red; font-weight: bold;'>❌ TESTE 2: FALHOU!</p>";
        }
    }
}

echo "<hr>";

// TESTE 3: Verificar se arquivo foi modificado
echo "<h2>📄 TESTE 3: Verificação do arquivo aplicacoes.json</h2>";

if (file_exists($jsonPath)) {
    $conteudoAtual = file_get_contents($jsonPath);
    $dadosAtuais = json_decode($conteudoAtual, true);
    
    echo "<p><strong>Tamanho atual:</strong> " . strlen($conteudoAtual) . " caracteres</p>";
    echo "<p><strong>Última modificação:</strong> " . date('Y-m-d H:i:s', filemtime($jsonPath)) . "</p>";
    
    if ($dadosAtuais) {
        echo "<p><strong>Total de aplicações:</strong> " . count($dadosAtuais['aplicacoes']) . "</p>";
        echo "<p><strong>Última exportação:</strong> " . ($dadosAtuais['dataExportacao'] ?? 'N/A') . "</p>";
        
        // Verificar se tem aplicações de teste
        $temTeste = false;
        foreach ($dadosAtuais['aplicacoes'] as $app) {
            if (isset($app['id']) && ($app['id'] == 999 || $app['id'] == 998)) {
                $temTeste = true;
                break;
            }
        }
        
        if ($temTeste) {
            echo "<p style='color: green; font-weight: bold;'>✅ Aplicações de teste encontradas - salvamento funcionou!</p>";
        } else {
            echo "<p style='color: orange;'>⚠️ Aplicações de teste não encontradas</p>";
        }
    }
} else {
    echo "<p style='color: red;'>❌ Arquivo aplicacoes.json não existe</p>";
}

// Mostrar log de debug se existir
if (file_exists($debugPath)) {
    echo "<hr>";
    echo "<h2>📝 LOG DE DEBUG (últimas 50 linhas)</h2>";
    
    $logContent = file_get_contents($debugPath);
    $lines = explode("\n", $logContent);
    $lastLines = array_slice($lines, -50);
    
    echo "<pre style='background: #f9f9f9; padding: 10px; border: 1px solid #ccc; max-height: 400px; overflow-y: auto;'>";
    echo htmlspecialchars(implode("\n", $lastLines));
    echo "</pre>";
    
    echo "<p><a href='./debug.log' target='_blank'>📄 Ver log completo</a></p>";
}

echo "<hr>";
echo "<p><strong>🎯 Conclusão:</strong> Use este teste para identificar onde está o problema!</p>";
echo "<p><strong>⏰ Teste executado em:</strong> " . date('Y-m-d H:i:s') . "</p>";
?>