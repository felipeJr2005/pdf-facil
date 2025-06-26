<?php
// Teste manual do save.php
echo "<h1>Teste Save.php</h1>";

// Dados de teste
$dadosTeste = [
    'aplicacoes' => [
        [
            'id' => 'teste123',
            'nome' => 'Teste Aplicação',
            'valor' => 1000,
            'dataAplicacao' => '2025-06-26',
            'dataVencimento' => '2025-06-26',
            'tipoAplicacao' => 'CDB',
            'tipoTaxa' => 'CDI'
        ]
    ],
    'taxasReferencia' => [
        'cdi' => 14.90,
        'selic' => 15.00
    ]
];

$json = json_encode($dadosTeste);

echo "<h2>Enviando dados para save.php...</h2>";
echo "<pre>JSON: " . htmlspecialchars($json) . "</pre>";

// Fazer requisição POST
$url = 'https://pdffacil.com/investimento/data/save.php';

$options = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $json
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "<h2>Resposta:</h2>";
echo "<pre>" . htmlspecialchars($result) . "</pre>";

echo "<h2>Headers de resposta:</h2>";
echo "<pre>" . print_r($http_response_header, true) . "</pre>";
?>