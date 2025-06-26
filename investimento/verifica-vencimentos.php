<?php
// Verificador automático de vencimentos
// Este arquivo será executado diariamente via cron

// Configurações
define('EMAIL_DESTINO', 'felipejunior@gmail.com'); // ⬅️ ALTERE AQUI

// Função para logging simplificada (sem criar diretório)
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    echo "[$timestamp] $message<br>\n";
    
    // Tentar log em arquivo simples (se não conseguir, continua)
    @file_put_contents(__DIR__ . '/vencimentos.log', "[$timestamp] $message\n", FILE_APPEND);
}

logMessage("=== INICIANDO VERIFICAÇÃO DE VENCIMENTOS ===");

try {
    // 1. Debug - mostrar diretório atual e arquivos
    logMessage("📁 Diretório atual: " . __DIR__);
    $arquivos = scandir(__DIR__);
    logMessage("📂 Arquivos no diretório: " . implode(', ', $arquivos));

    // 2. Verificar se arquivo de aplicações existe
    $arquivoAplicacoes = __DIR__ . '/aplicacoes.json';
    $arquivoAplicacoesData = __DIR__ . '/data/aplicacoes.json';
    
    logMessage("🔍 Procurando arquivo: $arquivoAplicacoes");
    
    if (file_exists($arquivoAplicacoes)) {
        logMessage("✅ Encontrado em: $arquivoAplicacoes");
    } elseif (file_exists($arquivoAplicacoesData)) {
        $arquivoAplicacoes = $arquivoAplicacoesData;
        logMessage("✅ Encontrado em: $arquivoAplicacoes");
    } else {
        logMessage("❌ Arquivo aplicacoes.json não encontrado em:");
        logMessage("   - $arquivoAplicacoes");
        logMessage("   - $arquivoAplicacoesData");
        
        // Verificar conteúdo da pasta data
        if (is_dir(__DIR__ . '/data')) {
            $arquivosData = scandir(__DIR__ . '/data');
            logMessage("📂 Arquivos em /data: " . implode(', ', $arquivosData));
        }
        exit;
    }

    // 3. Ler aplicações
    $conteudo = file_get_contents($arquivoAplicacoes);
    logMessage("📄 Conteúdo do arquivo (primeiros 100 chars): " . substr($conteudo, 0, 100));
    
    $dados = json_decode($conteudo, true);
    
    if (!$dados) {
        logMessage("❌ Erro ao decodificar aplicacoes.json");
        logMessage("🔍 JSON erro: " . json_last_error_msg());
        exit;
    }
    
    // Verificar se existe a propriedade 'aplicacoes'
    if (isset($dados['aplicacoes'])) {
        $aplicacoes = $dados['aplicacoes'];
        logMessage("📦 Estrutura detectada: Arquivo com metadata (versão {$dados['versao']})");
    } else {
        // Fallback: se não tem propriedade aplicacoes, assume que o array é a raiz
        $aplicacoes = $dados;
        logMessage("📦 Estrutura detectada: Array simples de aplicações");
    }

    logMessage("📊 Total de aplicações: " . count($aplicacoes));

    // 4. Data de hoje
    $hoje = date('Y-m-d');
    logMessage("📅 Verificando vencimentos para: $hoje");

    // 5. Buscar vencimentos de hoje
    $vencimentosHoje = [];
    
    foreach ($aplicacoes as $aplicacao) {
        // Debug - mostrar cada aplicação
        logMessage("🔍 Verificando: " . ($aplicacao['nome'] ?? 'Sem nome') . " - Vencimento: " . ($aplicacao['dataVencimento'] ?? 'Sem data'));
        
        // Verificar se tem data de vencimento
        if (isset($aplicacao['dataVencimento']) && !empty($aplicacao['dataVencimento'])) {
            // Normalizar formato da data (DD/MM/YYYY -> YYYY-MM-DD)
            $dataVencimento = $aplicacao['dataVencimento'];
            
            // Se está no formato DD/MM/YYYY, converter
            if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dataVencimento, $matches)) {
                $dataVencimento = $matches[3] . '-' . $matches[2] . '-' . $matches[1];
                logMessage("📅 Data convertida: {$aplicacao['dataVencimento']} -> $dataVencimento");
            }
            
            // Verificar se vence hoje
            if ($dataVencimento === $hoje) {
                $vencimentosHoje[] = $aplicacao;
                logMessage("⚠️  VENCIMENTO HOJE: " . $aplicacao['nome']);
            }
        }
    }

    // 6. Se não há vencimentos hoje
    if (empty($vencimentosHoje)) {
        logMessage("✅ Nenhum vencimento para hoje");
        logMessage("=== VERIFICAÇÃO CONCLUÍDA ===");
        exit;
    }

    // 7. Há vencimentos - preparar dados para email
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

    // 8. Chamar API de envio de email
    $dadosParaAPI = [
        'dados' => $dadosEmail,
        'email' => EMAIL_DESTINO,
        'tipo' => 'vencimento'
    ];

    // Descobrir URL base automaticamente
    $protocolo = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $urlAPI = $protocolo . '://' . $host . '/investimento/send-email.php';
    
    logMessage("🔗 Chamando API: $urlAPI");
    
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
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Para evitar problemas SSL
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $erro = curl_error($ch);
    curl_close($ch);

    // 9. Verificar resultado
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