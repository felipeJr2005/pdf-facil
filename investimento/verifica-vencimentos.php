<?php
// Configuração básica
date_default_timezone_set('America/Sao_Paulo');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Função para log com timestamp
function logMsg($message) {
    $timestamp = date('[Y-m-d H:i:s]');
    echo $timestamp . ' ' . $message . PHP_EOL;
}

logMsg("=== INICIANDO VERIFICAÇÃO DE VENCIMENTOS ===");

// Buscar arquivo aplicacoes.json - PRIORIDADE: PASTA PRINCIPAL
$locaisPossiveis = [
    __DIR__ . '/aplicacoes.json',                    // Pasta principal (NOVA PRIORIDADE)
    __DIR__ . '/data/aplicacoes.json',               // Pasta data (backup)
    '/tmp/aplicacoes.json'                           // Temporário (último recurso)
];

$arquivoEncontrado = null;
$localEncontrado = null;

logMsg("🔍 Procurando arquivo aplicacoes.json...");

foreach ($locaisPossiveis as $local) {
    logMsg("🔍 Verificando: $local");
    
    if (file_exists($local)) {
        $arquivoEncontrado = $local;
        $localEncontrado = dirname($local);
        logMsg("✅ Encontrado em: $local");
        break;
    } else {
        logMsg("❌ Não encontrado: $local");
    }
}

if (!$arquivoEncontrado) {
    logMsg("❌ ERRO: Arquivo aplicacoes.json não encontrado em nenhuma localização!");
    logMsg("📂 Locais verificados:");
    foreach ($locaisPossiveis as $local) {
        logMsg("   - $local");
    }
    exit(1);
}

// Tentar ler o arquivo
$conteudo = file_get_contents($arquivoEncontrado);

if ($conteudo === false) {
    logMsg("❌ ERRO: Não foi possível ler o arquivo: $arquivoEncontrado");
    exit(1);
}

logMsg("📄 Arquivo lido com sucesso: " . strlen($conteudo) . " bytes");
logMsg("📄 Primeiros 100 chars: " . substr($conteudo, 0, 100));

// Decodificar JSON
$dados = json_decode($conteudo, true);

if ($dados === null) {
    logMsg("❌ ERRO: JSON inválido no arquivo: " . json_last_error_msg());
    exit(1);
}

// Verificar estrutura
if (isset($dados['versao'])) {
    logMsg("📦 Estrutura detectada: Arquivo com metadata (versão " . $dados['versao'] . ")");
    $aplicacoes = $dados['aplicacoes'] ?? [];
} else {
    logMsg("📦 Estrutura detectada: Array direto de aplicações");
    $aplicacoes = $dados;
}

$totalAplicacoes = count($aplicacoes);
logMsg("📊 Total de aplicações: $totalAplicacoes");

if ($totalAplicacoes === 0) {
    logMsg("ℹ️ Nenhuma aplicação encontrada no arquivo");
    exit(0);
}

// Data atual para comparação
$hoje = date('Y-m-d');
logMsg("📅 Verificando vencimentos para: $hoje");

$vencimentosHoje = [];
$vencimentosProximos = [];

// Verificar cada aplicação
foreach ($aplicacoes as $aplicacao) {
    $nome = $aplicacao['nome'] ?? 'Sem nome';
    $dataVencimento = $aplicacao['dataVencimento'] ?? null;
    
    logMsg("🔍 Verificando: $nome - Vencimento: " . ($dataVencimento ?: 'Sem data'));
    
    if (!$dataVencimento) {
        continue;
    }
    
    // Converter data para formato comparável
    $vencimento = null;
    
    // Tentar diferentes formatos de data
    $formatosData = ['Y-m-d', 'd/m/Y', 'Y/m/d', 'd-m-Y'];
    
    foreach ($formatosData as $formato) {
        $dataObj = DateTime::createFromFormat($formato, $dataVencimento);
        if ($dataObj !== false) {
            $vencimento = $dataObj->format('Y-m-d');
            break;
        }
    }
    
    if (!$vencimento) {
        logMsg("⚠️ Data de vencimento inválida para $nome: $dataVencimento");
        continue;
    }
    
    // Verificar se vence hoje
    if ($vencimento === $hoje) {
        logMsg("🎯 VENCIMENTO HOJE: $nome");
        $vencimentosHoje[] = $aplicacao;
    }
    
    // Verificar próximos 7 dias
    $diasDiferenca = (strtotime($vencimento) - strtotime($hoje)) / (24 * 3600);
    
    if ($diasDiferenca > 0 && $diasDiferenca <= 7) {
        logMsg("📅 Vencimento próximo: $nome em $diasDiferenca dias");
        $vencimentosProximos[] = [
            'aplicacao' => $aplicacao,
            'dias' => $diasDiferenca
        ];
    }
}

// Resultados
if (count($vencimentosHoje) > 0) {
    logMsg("🚨 AÇÃO NECESSÁRIA: " . count($vencimentosHoje) . " vencimento(s) hoje!");
    
    foreach ($vencimentosHoje as $app) {
        $nome = $app['nome'] ?? 'Sem nome';
        $valor = isset($app['valor']) ? 'R$ ' . number_format($app['valor'], 2, ',', '.') : 'Valor não informado';
        logMsg("   - $nome: $valor");
    }
    
    // Tentar enviar email
    if (file_exists(__DIR__ . '/send-email.php')) {
        logMsg("📧 Tentando enviar email de notificação...");
        
        try {
            // Include do arquivo de email
            include_once __DIR__ . '/send-email.php';
            
            // Preparar dados para o email
            $assunto = "⚠️ Aplicações Vencendo Hoje - " . date('d/m/Y');
            
            $mensagem = "Você tem " . count($vencimentosHoje) . " aplicação(ões) vencendo hoje:\n\n";
            
            foreach ($vencimentosHoje as $app) {
                $nome = $app['nome'] ?? 'Sem nome';
                $valor = isset($app['valor']) ? 'R$ ' . number_format($app['valor'], 2, ',', '.') : 'Valor não informado';
                $tipo = $app['tipoAplicacao'] ?? 'Não informado';
                
                $mensagem .= "• $nome\n";
                $mensagem .= "  Valor: $valor\n";
                $mensagem .= "  Tipo: $tipo\n";
                $mensagem .= "  Vencimento: " . date('d/m/Y') . "\n\n";
            }
            
            $mensagem .= "Acesse o sistema para mais detalhes: https://pdffacil.com/investimento/\n";
            
            // Tentar enviar email (a função deve estar definida em send-email.php)
            if (function_exists('enviarEmail')) {
                $resultado = enviarEmail($assunto, $mensagem);
                if ($resultado) {
                    logMsg("✅ Email enviado com sucesso!");
                } else {
                    logMsg("❌ Falha ao enviar email");
                }
            } else {
                logMsg("⚠️ Função enviarEmail não encontrada em send-email.php");
            }
            
        } catch (Exception $e) {
            logMsg("❌ Erro ao enviar email: " . $e->getMessage());
        }
    } else {
        logMsg("⚠️ Arquivo send-email.php não encontrado - email não enviado");
    }
    
} else {
    logMsg("✅ Nenhum vencimento para hoje");
}

// Informar sobre próximos vencimentos
if (count($vencimentosProximos) > 0) {
    logMsg("📅 Próximos vencimentos (7 dias):");
    foreach ($vencimentosProximos as $item) {
        $nome = $item['aplicacao']['nome'] ?? 'Sem nome';
        $dias = round($item['dias']);
        logMsg("   - $nome em $dias dia(s)");
    }
}

logMsg("=== VERIFICAÇÃO CONCLUÍDA ===");

// Se chamado via URL, mostrar resultado em JSON também
if (isset($_SERVER['HTTP_HOST'])) {
    echo "\n\n<!-- JSON para JavaScript -->\n";
    echo "<script>console.log(" . json_encode([
        'vencimentosHoje' => count($vencimentosHoje),
        'vencimentosProximos' => count($vencimentosProximos),
        'arquivoEncontrado' => $arquivoEncontrado,
        'totalAplicacoes' => $totalAplicacoes
    ]) . ");</script>";
}
?>