<?php
// CONFIGURAÇÃO DE AUTOMAÇÃO - SISTEMA DE VERIFICAÇÃO DE VENCIMENTOS
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuração de Automação - Verificação de Vencimentos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .container { max-width: 900px; margin: 0 auto; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .section { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3498db; }
        .code { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; overflow-x: auto; margin: 10px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 10px 0; }
        .error { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 10px 0; }
        .teste { background: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .btn { display: inline-block; padding: 10px 20px; margin: 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .btn-primary { background: #007bff; color: white; }
        .btn-success { background: #28a745; color: white; }
        .btn-warning { background: #ffc107; color: #212529; }
        .status-ok { color: #28a745; font-weight: bold; }
        .status-error { color: #dc3545; font-weight: bold; }
        .urgente { background: #f8d7da; border: 2px solid #dc3545; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Configuração de Automação</h1>
            <p>Sistema de Verificação de Vencimentos - Controlador Financeiro</p>
        </div>

        <!-- VERIFICAÇÃO DE STATUS -->
        <div class="section">
            <h2>📊 Status do Sistema</h2>
            
            <?php
            // Verificar arquivos necessários
            $arquivos_necessarios = [
                'verifica-vencimentos.php' => __DIR__ . '/verifica-vencimentos.php',
                'send-email-direto.php' => __DIR__ . '/send-email-direto.php',
                'email-config.php' => __DIR__ . '/email-config.php',
                'aplicacoes.json' => __DIR__ . '/aplicacoes.json',
                'load.php' => __DIR__ . '/data/load.php'
            ];
            
            echo "<table>";
            echo "<tr><th>Arquivo</th><th>Status</th><th>Observações</th></tr>";
            
            $todos_ok = true;
            foreach ($arquivos_necessarios as $nome => $caminho) {
                $existe = file_exists($caminho);
                $status = $existe ? "<span class='status-ok'>✅ OK</span>" : "<span class='status-error'>❌ FALTANDO</span>";
                $obs = $existe ? "Encontrado" : "Arquivo não encontrado";
                
                if (!$existe) $todos_ok = false;
                
                echo "<tr><td>$nome</td><td>$status</td><td>$obs</td></tr>";
            }
            
            echo "</table>";
            
            if ($todos_ok) {
                echo "<div class='success'><strong>✅ Todos os arquivos necessários estão presentes!</strong></div>";
            } else {
                echo "<div class='error'><strong>❌ Alguns arquivos estão faltando. Verifique a instalação.</strong></div>";
            }
            ?>
        </div>

        <!-- VENCIMENTOS URGENTES -->
        <div class="urgente">
            <h2>🚨 VENCIMENTOS URGENTES DETECTADOS</h2>
            <?php
            // Verificar vencimentos próximos
            $arquivo_dados = __DIR__ . '/aplicacoes.json';
            if (file_exists($arquivo_dados)) {
                $conteudo = file_get_contents($arquivo_dados);
                $dados = json_decode($conteudo, true);
                $aplicacoes = $dados['aplicacoes'] ?? [];
                
                $hoje = new DateTime();
                $vencimentos_proximos = [];
                $vencimentos_urgentes = [];
                
                foreach ($aplicacoes as $app) {
                    if (isset($app['dataResgate']) && !empty($app['dataResgate'])) {
                        $vencimento = new DateTime($app['dataResgate']);
                        $diferenca = $hoje->diff($vencimento);
                        $diasDiferenca = $diferenca->days;
                        
                        if ($vencimento > $hoje) {
                            if ($diasDiferenca <= 30) {
                                $item = [
                                    'nome' => $app['tipo'] . ($app['banco'] ? ' (' . $app['banco'] . ')' : ''),
                                    'valor' => $app['valorAplicado'],
                                    'data' => $app['dataResgate'],
                                    'dias' => $diasDiferenca
                                ];
                                
                                $vencimentos_proximos[] = $item;
                                
                                if ($diasDiferenca <= 7) {
                                    $vencimentos_urgentes[] = $item;
                                }
                            }
                        } elseif ($vencimento < $hoje) {
                            // Aplicação vencida
                            $vencimentos_urgentes[] = [
                                'nome' => $app['tipo'] . ($app['banco'] ? ' (' . $app['banco'] . ')' : ''),
                                'valor' => $app['valorAplicado'],
                                'data' => $app['dataResgate'],
                                'dias' => -$diasDiferenca,
                                'vencida' => true
                            ];
                        }
                    }
                }
                
                if (count($vencimentos_urgentes) > 0) {
                    echo "<p><strong>⚠️ ATENÇÃO: " . count($vencimentos_urgentes) . " aplicação(ões) precisam de ação IMEDIATA!</strong></p>";
                    echo "<table>";
                    echo "<tr><th>Aplicação</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr>";
                    
                    $total_urgente = 0;
                    foreach ($vencimentos_urgentes as $v) {
                        $valor_formatado = 'R$ ' . number_format($v['valor'], 2, ',', '.');
                        $data_formatada = date('d/m/Y', strtotime($v['data']));
                        $total_urgente += $v['valor'];
                        
                        if (isset($v['vencida']) && $v['vencida']) {
                            $status = "<span style='color: #dc3545; font-weight: bold;'>VENCIDA há " . abs($v['dias']) . " dias</span>";
                        } else {
                            $status = "<span style='color: #ffc107; font-weight: bold;'>Vence em " . $v['dias'] . " dias</span>";
                        }
                        
                        echo "<tr><td>{$v['nome']}</td><td>$valor_formatado</td><td>$data_formatada</td><td>$status</td></tr>";
                    }
                    
                    echo "</table>";
                    
                    $total_formatado = 'R$ ' . number_format($total_urgente, 2, ',', '.');
                    echo "<p><strong>💰 VALOR TOTAL EM RISCO: $total_formatado</strong></p>";
                    echo "<p><strong>🚨 Configure a automação AGORA para não perder mais vencimentos!</strong></p>";
                    
                } elseif (count($vencimentos_proximos) > 0) {
                    echo "<p><strong>📅 Você tem " . count($vencimentos_proximos) . " vencimento(s) nos próximos 30 dias:</strong></p>";
                    echo "<table>";
                    echo "<tr><th>Aplicação</th><th>Valor</th><th>Vencimento</th><th>Dias</th></tr>";
                    
                    foreach ($vencimentos_proximos as $v) {
                        $valor_formatado = 'R$ ' . number_format($v['valor'], 2, ',', '.');
                        $data_formatada = date('d/m/Y', strtotime($v['data']));
                        echo "<tr><td>{$v['nome']}</td><td>$valor_formatado</td><td>$data_formatada</td><td>{$v['dias']} dias</td></tr>";
                    }
                    
                    echo "</table>";
                    echo "<p><strong>⚠️ Configure a automação para receber alertas!</strong></p>";
                } else {
                    echo "<p>✅ Nenhum vencimento nos próximos 30 dias.</p>";
                }
            } else {
                echo "<p>⚠️ Arquivo de dados não encontrado para verificar vencimentos.</p>";
            }
            ?>
        </div>

        <!-- TESTE RÁPIDO -->
        <div class="teste">
            <h2>🧪 Teste Rápido do Sistema</h2>
            <p>Execute estes testes para verificar se tudo está funcionando:</p>
            
            <table>
                <tr>
                    <th>Teste</th>
                    <th>Link</th>
                    <th>O que verifica</th>
                </tr>
                <tr>
                    <td>Email Básico</td>
                    <td><a href="send-email-direto.php?teste=1" class="btn btn-primary">🧪 Testar Email</a></td>
                    <td>Configuração SMTP e envio</td>
                </tr>
                <tr>
                    <td>Verificação de Vencimentos</td>
                    <td><a href="verifica-vencimentos.php" class="btn btn-success">🔍 Verificar Vencimentos</a></td>
                    <td>Leitura de dados e alertas</td>
                </tr>
                <tr>
                    <td>Carregamento de Dados</td>
                    <td><a href="data/load.php" class="btn btn-warning">📊 Carregar Dados</a></td>
                    <td>API de dados funcionando</td>
                </tr>
            </table>
        </div>

        <!-- CONFIGURAÇÃO RAILWAY -->
        <div class="section">
            <h2>🚂 Configuração no Railway</h2>
            
            <h3>OPÇÃO 1: Railway Cron (Recomendado)</h3>
            <p>Criar arquivo <code>railway.toml</code> na <strong>raiz</strong> do projeto:</p>
            
            <div class="code">
[build]
builder = "dockerfile"

[cron]
# Verificar vencimentos todos os dias às 08:00 (horário do servidor)
"0 8 * * *" = "php /var/www/html/investimento/verifica-vencimentos.php"

# Verificar às 18:00 também (segundo alerta do dia)
"0 18 * * *" = "php /var/www/html/investimento/verifica-vencimentos.php"
            </div>
            
            <h3>OPÇÃO 2: Webhook Externo (Mais Simples)</h3>
            <p>Use um serviço gratuito como <strong>cron-job.org</strong> ou <strong>easycron.com</strong>:</p>
            
            <div class="code">
# URL para webhook:
https://<?php echo $_SERVER['HTTP_HOST']; ?>/investimento/verifica-vencimentos.php

# Configurar para executar:
# - Todo dia às 08:00
# - Opcional: Todo dia às 18:00 (segundo alerta)
            </div>
            
            <h3>OPÇÃO 3: GitHub Actions (Para desenvolvedores)</h3>
            <p>Criar arquivo <code>.github/workflows/check-investments.yml</code>:</p>
            
            <div class="code">
name: Verificar Vencimentos
on:
  schedule:
    - cron: '0 8 * * *'  # Todo dia às 08:00 UTC
  workflow_dispatch:      # Permite execução manual

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Verificar Vencimentos
        run: |
          curl -s "https://<?php echo $_SERVER['HTTP_HOST']; ?>/investimento/verifica-vencimentos.php"
            </div>
        </div>

        <!-- MONITORAMENTO -->
        <div class="section">
            <h2>📈 Monitoramento e Logs</h2>
            
            <h3>1. Logs do Railway</h3>
            <div class="code">
# No terminal:
railway logs

# Procurar por:
# "=== INICIANDO VERIFICAÇÃO DE VENCIMENTOS ==="
# "✅ Email enviado com sucesso!"
# "🚨 APLICAÇÃO VENCIDA"
# "❌ Erro ao enviar email"
            </div>
            
            <h3>2. Teste Manual Diário</h3>
            <p>Acesse esta URL para verificar manualmente:</p>
            <div class="code">
https://<?php echo $_SERVER['HTTP_HOST']; ?>/investimento/verifica-vencimentos.php
            </div>
            
            <h3>3. Arquivo de Log de Emergência</h3>
            <p>Se o email falhar, o sistema cria automaticamente:</p>
            <ul>
                <li><code>log_vencimentos_YYYY-MM-DD.html</code> - Conteúdo do email</li>
                <li>Logs no console - Visíveis nos logs do Railway</li>
            </ul>
        </div>

        <!-- TROUBLESHOOTING -->
        <div class="section">
            <h2>🔧 Solução de Problemas</h2>
            
            <h3>❌ Email não está sendo enviado</h3>
            <ol>
                <li>✅ Testar: <a href="send-email-direto.php?teste=1">🧪 Teste de Email</a></li>
                <li>✅ Verificar configurações em <code>email-config.php</code></li>
                <li>✅ Verificar senha de aplicativo do Gmail</li>
                <li>✅ Verificar caixa de spam</li>
                <li>✅ Verificar logs do Railway</li>
            </ol>
            
            <h3>❌ Dados não estão sendo lidos</h3>
            <ol>
                <li>✅ Testar: <a href="data/load.php">📊 API de Dados</a></li>
                <li>✅ Verificar se arquivo <code>aplicacoes.json</code> existe</li>
                <li>✅ Verificar permissões de arquivo</li>
                <li>✅ Verificar estrutura do JSON</li>
            </ol>
            
            <h3>❌ Automação não está executando</h3>
            <ol>
                <li>✅ Verificar configuração de CRON</li>
                <li>✅ Testar execução manual primeiro</li>
                <li>✅ Verificar logs do sistema</li>
                <li>✅ Usar webhook externo como alternativa</li>
            </ol>
        </div>

        <!-- LINKS ÚTEIS -->
        <div class="section">
            <h2>🔗 Links de Teste e Navegação</h2>
            <ul>
                <li><a href="send-email-direto.php?teste=1" class="btn btn-primary">🧪 Teste de Email</a></li>
                <li><a href="verifica-vencimentos.php" class="btn btn-success">🔍 Verificar Vencimentos</a></li>
                <li><a href="data/load.php" class="btn btn-warning">📊 API de Dados</a></li>
                <li><a href="../" class="btn btn-primary">🏠 Sistema Principal</a></li>
            </ul>
        </div>

        <hr>
        <p><small><em>Sistema de Verificação de Vencimentos - Controlador Financeiro<br>
        Painel de configuração gerado em <?php echo date('d/m/Y H:i:s'); ?></em></small></p>
    </div>
</body>
</html>