<?php
// Verificador automático de vencimentos
// Este arquivo será executado diariamente via cron

// Configurações
define('LOG_FILE', __DIR__ . '/logs/vencimentos.log');
define('EMAIL_DESTINO', 'felipejunior@gmail.com'); // ⬅️ ALTERE AQUI

// Função para logging
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logDir = dirname(LOG_FILE);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    file_put_contents(LOG_FILE, "[$timestamp] $message\n", FILE_APPEND);
    echo "[$timestamp] $message\n";
}

logMessage("=== INICIANDO VERIFICAÇÃO DE VENCIMENTOS ===");

try {
    // 1. Verificar se arquivo de aplicações existe
    $arquivoAplicacoes = __DIR__ . '/aplicacoes.json';
    if (!file_exists($arquivoAplicacoes)) {
        logMessage("❌ Arquivo aplicacoes.json não encontrado");
        exit;
    }

    // 2. Ler aplicações
    $conteudo = file_get_contents($arquivoAplicacoes);
    $aplicacoes = json_decode($conteudo, true);
    
    if (!$aplicacoes) {
        logMessage("❌ Erro ao decodificar aplicacoes.json");
        exit;
    }

    logMessage("📊 Total de aplicações: " . count($aplicacoes));

    // 3. Data de hoje
    $hoje = date('Y-m-d');
    logMessage("📅 Verificando vencimentos para: $hoje");

    // 4. Buscar vencimentos de hoje
    $vencimentosHoje = [];
    
    foreach ($aplicacoes as $aplicacao) {
        // Verificar se tem data de vencimento
        if (isset($aplicacao['dataVencimento']) && !empty($aplicacao['dataVencimento'])) {
            // Normalizar formato da data (DD/MM/YYYY -> YYYY-MM-DD)
            $dataVencimento = $aplicacao['dataVencimento'];
            
            // Se está no formato DD/MM/YYYY, converter
            if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dataVencimento, $matches)) {
                $dataVencimento = $matches[3] . '-' . $matches[2] . '-' . $matches[1];
            }
            
            // Verificar se vence hoje
            if ($dataVencimento === $hoje) {
                $vencimentosHoje[] = $aplicacao;
                logMessage("⚠️  VENCIMENTO HOJE: " . $aplicacao['nome']);
            }
        }
    }

    // 5. Se não há vencimentos hoje
    if (empty($vencimentosHoje)) {
        logMessage("✅ Nenhum vencimento para hoje");
        logMessage("=== VERIFICAÇÃO CONCLUÍDA ===");
        exit;
    }

    // 6. Há vencimentos - preparar dados para email
    logMessage("📧 Preparando email para " . count($vencimentosHoje) . " vencimento(s)");

    // Calcular totais das aplicações que vencem
    $dadosEmail = [
        'totalInvestido' => 0,
        'valorAtual' => 0,
        'rendimento' => 0,
        'rentabilidade' => 0,
        'aplicacoes' => []
    ];

    foreach ($vencimentosHoje as $app) {
        $valorAplicado = floatval($app['valorAplicado'] ?? 0);
        $valorAtual = floatval($app['valorAtual'] ?? $valorAplicado);
        $rendimento = $valorAtual - $valorAplicado;
        $rentabilidade = $valorAplicado > 0 ? ($rendimento / $valorAplicado) * 100 : 0;

        $dadosEmail['totalInvestido'] += $valorAplicado;
        $dadosEmail['valorAtual'] += $valorAtual;
        $dadosEmail['rendimento'] += $rendimento;
        
        $dadosEmail['aplicacoes'][] = [
            'nome' => $app['nome'] ?? 'Sem nome',
            'valorAplicado' => $valorAplicado,
            'valorAtual' => $valorAtual,
            'rendimento' => $rendimento,
            'rentabilidade' => $rentabilidade,
            'dataVencimento' => $app['dataVencimento'] ?? '',
            'banco' => $app['banco'] ?? ''
        ];
    }

    // Calcular rentabilidade geral
    if ($dadosEmail['totalInvestido'] > 0) {
        $dadosEmail['rentabilidade'] = ($dadosEmail['rendimento'] / $dadosEmail['totalInvestido']) * 100;
    }

    // 7. Chamar API de envio de email
    $dadosParaAPI = [
        'dados' => $dadosEmail,
        'email' => EMAIL_DESTINO,
        'tipo' => 'vencimento' // Identificar que é email de vencimento
    ];

    $urlAPI = 'https://' . $_SERVER['HTTP_HOST'] . '/investimento/send-email.php';
    
    // Fazer requisição POST para a API
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $urlAPI);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dadosParaAPI));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $erro = curl_error($ch);
    curl_close($ch);

    // 8. Verificar resultado
    if ($erro) {
        logMessage("❌ Erro cURL: $erro");
    } elseif ($httpCode !== 200) {
        logMessage("❌ Erro HTTP: $httpCode - $response");
    } else {
        $resultado = json_decode($response, true);
        if ($resultado && $resultado['success']) {
            logMessage("✅ Email enviado com sucesso!");
        } else {
            logMessage("❌ Falha no envio: " . ($resultado['message'] ?? 'Erro desconhecido'));
        }
    }

} catch (Exception $e) {
    logMessage("❌ ERRO CRÍTICO: " . $e->getMessage());
}

logMessage("=== VERIFICAÇÃO CONCLUÍDA ===");
?>