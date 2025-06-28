<?php
// SISTEMA DE VERIFICAÇÃO DE VENCIMENTOS - VERSÃO AJUSTADA PARA 3 DIAS
// Configuração básica
date_default_timezone_set('America/Sao_Paulo');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Incluir configurações de email
require_once __DIR__ . '/email-config.php';

// Função para log com timestamp
function logMsg($message) {
    $timestamp = date('[Y-m-d H:i:s]');
    echo $timestamp . ' ' . $message . PHP_EOL;
}

logMsg("=== INICIANDO VERIFICAÇÃO DE VENCIMENTOS (3 DIAS + DIA DO VENCIMENTO) ===");

// Buscar arquivo aplicacoes.json com prioridade correta
$locaisPossiveis = [
    __DIR__ . '/aplicacoes.json',                    // Pasta principal
    __DIR__ . '/data/aplicacoes.json',               // Pasta data
    '/tmp/aplicacoes.json'                           // Temporário
];

$arquivoEncontrado = null;

logMsg("🔍 Procurando arquivo aplicacoes.json...");

foreach ($locaisPossiveis as $local) {
    logMsg("🔍 Verificando: $local");
    
    if (file_exists($local)) {
        $arquivoEncontrado = $local;
        logMsg("✅ Encontrado em: $local");
        break;
    } else {
        logMsg("❌ Não encontrado: $local");
    }
}

if (!$arquivoEncontrado) {
    logMsg("❌ ERRO: Arquivo aplicacoes.json não encontrado!");
    exit(1);
}

// Ler e decodificar arquivo
$conteudo = file_get_contents($arquivoEncontrado);

if ($conteudo === false) {
    logMsg("❌ ERRO: Não foi possível ler o arquivo: $arquivoEncontrado");
    exit(1);
}

logMsg("📄 Arquivo lido com sucesso: " . strlen($conteudo) . " bytes");

$dados = json_decode($conteudo, true);

if ($dados === null) {
    logMsg("❌ ERRO: JSON inválido no arquivo: " . json_last_error_msg());
    exit(1);
}

// Verificar estrutura e extrair aplicações
if (isset($dados['versao'])) {
    logMsg("📦 Estrutura detectada: Arquivo com metadata (versão " . $dados['versao'] . ")");
    $aplicacoes = $dados['aplicacoes'] ?? [];
    $taxasReferencia = $dados['taxasReferencia'] ?? [];
} else {
    logMsg("📦 Estrutura detectada: Array direto de aplicações");
    $aplicacoes = $dados;
    $taxasReferencia = ['cdi' => '14.90', 'selic' => '15.00', 'poupanca' => '0.6721'];
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
logMsg("⚙️ Configuração de alertas: 3 dias antes + dia do vencimento");

// FUNÇÃO PARA CALCULAR RENTABILIDADE (SIMPLIFICADA)
function calcularValorAtual($aplicacao, $taxasReferencia) {
    $valorAplicado = $aplicacao['valorAplicado'];
    $dataAplicacao = $aplicacao['dataAplicacao'];
    $hoje = date('Y-m-d');
    
    // Calcular dias corridos
    $dataInicio = new DateTime($dataAplicacao);
    $dataFim = new DateTime($hoje);
    $diasCorridos = $dataFim->diff($dataInicio)->days;
    
    if ($diasCorridos == 0) {
        return $valorAplicado; // Aplicação hoje, sem rendimento
    }
    
    $rentabilidade = 0;
    
    // Calcular rentabilidade baseada no tipo
    if ($aplicacao['tipo'] === 'Poupança') {
        $taxaPoupancaMensal = floatval($taxasReferencia['poupanca']) / 100;
        $meses = $diasCorridos / 30;
        $rentabilidade = pow(1 + $taxaPoupancaMensal, $meses) - 1;
    } else if ($aplicacao['tipoTaxa'] === 'PRE') {
        $taxaPreFixada = $aplicacao['taxaPreFixada'] / 100;
        $rentabilidade = pow(1 + $taxaPreFixada, $diasCorridos / 365) - 1;
    } else if ($aplicacao['tipoTaxa'] === 'CDI') {
        $taxaCDI = floatval($taxasReferencia['cdi']) / 100;
        $porcentagemCDI = $aplicacao['porcentagemCDI'] / 100;
        $taxaEfetiva = $taxaCDI * $porcentagemCDI;
        $diasUteis = round($diasCorridos * 0.7); // Aproximação
        $rentabilidade = pow(1 + $taxaEfetiva, $diasUteis / 252) - 1;
    }
    
    $valorBruto = $valorAplicado * (1 + $rentabilidade);
    
    // Calcular IR simplificado (se não for LCA/Poupança)
    $ir = 0;
    if ($aplicacao['tipo'] !== 'LCA' && $aplicacao['tipo'] !== 'Poupança') {
        $rendimento = $valorBruto - $valorAplicado;
        if ($diasCorridos <= 180) $ir = $rendimento * 0.225;
        else if ($diasCorridos <= 360) $ir = $rendimento * 0.20;
        else if ($diasCorridos <= 720) $ir = $rendimento * 0.175;
        else $ir = $rendimento * 0.15;
    }
    
    return $valorBruto - $ir;
}

// FUNÇÃO PARA FORMATAR NOME DA APLICAÇÃO
function formatarNomeAplicacao($aplicacao) {
    $nome = $aplicacao['tipo'];
    if (!empty($aplicacao['banco'])) {
        $nome .= " (" . $aplicacao['banco'] . ")";
    }
    return $nome;
}

// Arrays para armazenar resultados
$vencimentosHoje = [];
$vencimentosProximos = []; // 3 dias antes
$aplicacoesVencidas = [];

// Verificar cada aplicação
foreach ($aplicacoes as $aplicacao) {
    $nome = formatarNomeAplicacao($aplicacao);
    $dataResgate = $aplicacao['dataResgate'] ?? null;
    
    logMsg("🔍 Verificando: $nome - Resgate: " . ($dataResgate ?: 'Liquidez diária'));
    
    if (!$dataResgate) {
        logMsg("   ℹ️ Liquidez diária - sem data de vencimento");
        continue;
    }
    
    // Calcular diferença de dias
    $dataVencimento = new DateTime($dataResgate);
    $dataHoje = new DateTime($hoje);
    $diferenca = $dataHoje->diff($dataVencimento);
    $diasDiferenca = $diferenca->days;
    
    // Se data já passou (vencida)
    if ($dataHoje > $dataVencimento) {
        logMsg("🚨 APLICAÇÃO VENCIDA: $nome - há $diasDiferenca dias!");
        
        $valorAtual = calcularValorAtual($aplicacao, $taxasReferencia);
        $aplicacoesVencidas[] = [
            'aplicacao' => $aplicacao,
            'nome' => $nome,
            'dias_vencida' => $diasDiferenca,
            'valor_atual' => $valorAtual
        ];
    }
    // Se vence hoje
    else if ($diferenca->days == 0 && $dataHoje->format('Y-m-d') == $dataVencimento->format('Y-m-d')) {
        logMsg("🎯 VENCIMENTO HOJE: $nome");
        
        $valorAtual = calcularValorAtual($aplicacao, $taxasReferencia);
        $vencimentosHoje[] = [
            'aplicacao' => $aplicacao,
            'nome' => $nome,
            'valor_atual' => $valorAtual
        ];
    }
    // Se vence nos próximos 3 dias (mas não hoje)
    else if ($diasDiferenca <= 3 && $diasDiferenca > 0) {
        logMsg("📅 Vencimento em 3 dias: $nome em $diasDiferenca dias");
        
        $valorAtual = calcularValorAtual($aplicacao, $taxasReferencia);
        $vencimentosProximos[] = [
            'aplicacao' => $aplicacao,
            'nome' => $nome,
            'dias' => $diasDiferenca,
            'valor_atual' => $valorAtual
        ];
    }
}

// FUNÇÃO PARA ENVIAR EMAIL USANDO send-email-direto.php
function enviarEmailVencimento($assunto, $conteudoHtml, $destinatario = null) {
    if (!$destinatario) {
        $destinatario = SMTP_USERNAME; // Usar email configurado
    }
    
    // Tentar usar send-email-direto.php
    try {
        logMsg("📧 Preparando envio de email...");
        
        // Incluir arquivo de envio direto
        if (file_exists(__DIR__ . '/send-email-direto.php')) {
            include_once __DIR__ . '/send-email-direto.php';
            
            // Chamar função de envio direto
            if (function_exists('enviarEmailDireto')) {
                $resultado = enviarEmailDireto($destinatario, $assunto, $conteudoHtml);
                
                if ($resultado['success']) {
                    logMsg("✅ Email enviado com sucesso!");
                    return true;
                } else {
                    logMsg("❌ Falha ao enviar email: " . $resultado['message']);
                    return false;
                }
            } else {
                logMsg("❌ Função enviarEmailDireto não encontrada");
                return false;
            }
        } else {
            logMsg("❌ Arquivo send-email-direto.php não encontrado");
            return false;
        }
        
    } catch (Exception $e) {
        logMsg("❌ Erro ao enviar email: " . $e->getMessage());
        return false;
    }
}

// PROCESSAR RESULTADOS E ENVIAR EMAILS

$totalAlertas = count($aplicacoesVencidas) + count($vencimentosHoje) + count($vencimentosProximos);

if ($totalAlertas > 0) {
    logMsg("🚨 ALERTAS ENCONTRADOS: $totalAlertas");
    
    // Determinar tipo de alerta para o assunto
    $tipoAlerta = "";
    if (count($aplicacoesVencidas) > 0) {
        $tipoAlerta = "DINHEIRO PARADO";
    } else if (count($vencimentosHoje) > 0) {
        $tipoAlerta = "VENCE HOJE";
    } else {
        $tipoAlerta = "VENCE EM 3 DIAS";
    }
    
    // Construir conteúdo do email
    $assunto = "🚨 $tipoAlerta - Investimentos (" . date('d/m/Y') . ")";
    
    $conteudoHtml = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { color: #c0392b; border-bottom: 3px solid #e74c3c; padding-bottom: 10px; margin-bottom: 20px; }
            .secao { margin: 20px 0; padding: 15px; border-radius: 5px; }
            .vencida { background: #fadbd8; border-left: 5px solid #e74c3c; }
            .hoje { background: #fdeaa7; border-left: 5px solid #f39c12; }
            .proxima { background: #d5f4e6; border-left: 5px solid #27ae60; }
            .valor { font-weight: bold; color: #2c3e50; }
            .dias { font-weight: bold; color: #8e44ad; }
            .data { font-size: 0.9em; color: #666; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>🚨 Alerta de Vencimentos de Investimentos</h1>
            <p><strong>Data:</strong> " . date('d/m/Y H:i') . "</p>
            <p><strong>Configuração:</strong> Alertas em 3 dias + dia do vencimento</p>
        </div>
    ";
    
    // Aplicações vencidas (PRIORIDADE MÁXIMA)
    if (count($aplicacoesVencidas) > 0) {
        $conteudoHtml .= "<div class='secao vencida'>";
        $conteudoHtml .= "<h2>🚨 APLICAÇÕES VENCIDAS - DINHEIRO PARADO!</h2>";
        $conteudoHtml .= "<p><strong>ATENÇÃO:</strong> As aplicações abaixo já venceram e não estão mais rendendo!</p>";
        
        $totalVencido = 0;
        foreach ($aplicacoesVencidas as $item) {
            $valorFormatado = 'R$ ' . number_format($item['valor_atual'], 2, ',', '.');
            $totalVencido += $item['valor_atual'];
            
            $conteudoHtml .= "<p><strong>{$item['nome']}</strong><br>";
            $conteudoHtml .= "Valor atual: <span class='valor'>$valorFormatado</span><br>";
            $conteudoHtml .= "Vencida há: <span class='dias'>{$item['dias_vencida']} dias</span></p>";
        }
        
        $totalVencidoFormatado = 'R$ ' . number_format($totalVencido, 2, ',', '.');
        $conteudoHtml .= "<p><strong>💰 TOTAL PARADO: <span class='valor'>$totalVencidoFormatado</span></strong></p>";
        $conteudoHtml .= "</div>";
    }
    
    // Vencimentos hoje
    if (count($vencimentosHoje) > 0) {
        $conteudoHtml .= "<div class='secao hoje'>";
        $conteudoHtml .= "<h2>⏰ VENCIMENTOS HOJE - PARA DE RENDER!</h2>";
        $conteudoHtml .= "<p><strong>HOJE:</strong> Estas aplicações param de render e o dinheiro fica disponível.</p>";
        
        $totalHoje = 0;
        foreach ($vencimentosHoje as $item) {
            $valorFormatado = 'R$ ' . number_format($item['valor_atual'], 2, ',', '.');
            $totalHoje += $item['valor_atual'];
            
            $conteudoHtml .= "<p><strong>{$item['nome']}</strong><br>";
            $conteudoHtml .= "Valor disponível hoje: <span class='valor'>$valorFormatado</span><br>";
            $conteudoHtml .= "<span class='data'>Dinheiro já na conta para nova aplicação</span></p>";
        }
        
        $totalHojeFormatado = 'R$ ' . number_format($totalHoje, 2, ',', '.');
        $conteudoHtml .= "<p><strong>💰 TOTAL DISPONÍVEL: <span class='valor'>$totalHojeFormatado</span></strong></p>";
        $conteudoHtml .= "</div>";
    }
    
    // Próximos vencimentos (3 dias)
    if (count($vencimentosProximos) > 0) {
        $conteudoHtml .= "<div class='secao proxima'>";
        $conteudoHtml .= "<h2>📅 VENCIMENTOS EM 3 DIAS - PREPARE-SE!</h2>";
        $conteudoHtml .= "<p><strong>PLANEJAMENTO:</strong> Você tem 3 dias para decidir o que fazer com estes valores.</p>";
        
        foreach ($vencimentosProximos as $item) {
            $valorFormatado = 'R$ ' . number_format($item['valor_atual'], 2, ',', '.');
            
            // Calcular data exata do vencimento
            $dataVencimento = new DateTime();
            $dataVencimento->modify("+{$item['dias']} days");
            $dataFormatada = $dataVencimento->format('d/m/Y');
            
            $conteudoHtml .= "<p><strong>{$item['nome']}</strong><br>";
            $conteudoHtml .= "Valor atual: <span class='valor'>$valorFormatado</span><br>";
            $conteudoHtml .= "Vence em: <span class='dias'>{$item['dias']} dias</span> <span class='data'>($dataFormatada)</span></p>";
        }
        $conteudoHtml .= "</div>";
    }
    
    $conteudoHtml .= "
        <div style='margin-top: 30px; padding: 10px; background: #ecf0f1; border-radius: 5px;'>
            <p><strong>💡 Próximos passos:</strong></p>
            <ul>
                <li>Acesse seu sistema: <a href='https://seudominio.railway.app/investimento/'>Controlador Financeiro</a></li>
                <li>Para vencimentos hoje: Verificar se dinheiro já está na conta</li>
                <li>Para vencimentos em 3 dias: Pesquisar novas opções de investimento</li>
                <li>Considerar reaplicar ou resgatar conforme sua estratégia</li>
                <li>Atualizar datas no sistema após ações tomadas</li>
            </ul>
        </div>
        
        <hr>
        <p><small><em>Email automático - Sistema de Verificação de Vencimentos<br>
        Configuração: Alertas 3 dias antes + dia do vencimento<br>
        Arquivo verificado: $arquivoEncontrado<br>
        Aplicações analisadas: $totalAplicacoes<br>
        Próxima verificação: " . date('d/m/Y', strtotime('+1 day')) . "</em></small></p>
    </body>
    </html>";
    
    // Tentar enviar email
    logMsg("📧 Enviando email de alerta...");
    
    $emailEnviado = enviarEmailVencimento($assunto, $conteudoHtml);
    
    if ($emailEnviado) {
        logMsg("✅ Email de alerta enviado com sucesso!");
    } else {
        logMsg("❌ Falha ao enviar email de alerta");
        
        // Log alternativo - salvar conteúdo em arquivo
        $arquivoLog = __DIR__ . '/log_vencimentos_' . date('Y-m-d') . '.html';
        file_put_contents($arquivoLog, $conteudoHtml);
        logMsg("💾 Conteúdo salvo em: $arquivoLog");
    }
    
} else {
    logMsg("✅ Nenhum vencimento em 3 dias ou aplicação vencida encontrada");
}

logMsg("=== VERIFICAÇÃO CONCLUÍDA ===");

// Resultado para logs do servidor/CRON
if (php_sapi_name() === 'cli') {
    echo "\n--- RESUMO FINAL ---\n";
    echo "Aplicações vencidas: " . count($aplicacoesVencidas) . "\n";
    echo "Vencimentos hoje: " . count($vencimentosHoje) . "\n";
    echo "Vencimentos em 3 dias: " . count($vencimentosProximos) . "\n";
    echo "Email enviado: " . ($totalAlertas > 0 ? 'SIM' : 'NÃO') . "\n";
}

// Para debug via web
if (isset($_SERVER['HTTP_HOST'])) {
    echo "\n\n<!-- Dados para JavaScript -->\n";
    echo "<script>console.log(" . json_encode([
        'vencidas' => count($aplicacoesVencidas),
        'hoje' => count($vencimentosHoje),
        'proximas_3_dias' => count($vencimentosProximos),
        'total_aplicacoes' => $totalAplicacoes,
        'arquivo' => $arquivoEncontrado,
        'configuracao' => '3 dias + dia do vencimento',
        'timestamp' => date('Y-m-d H:i:s')
    ]) . ");</script>";
}
?>