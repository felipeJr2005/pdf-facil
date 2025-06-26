<?php
// MONITOR DE LOGS EM TEMPO REAL
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📝 Monitor de Logs - Sistema Financeiro</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            background: #1e1e1e;
            color: #d4d4d4;
        }
        .header {
            background: #2d2d30;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            color: #ffffff;
        }
        .log-container {
            background: #0d1117;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 16px;
            max-height: 600px;
            overflow-y: auto;
            font-size: 14px;
            line-height: 1.4;
        }
        .log-line {
            margin: 2px 0;
            padding: 2px 4px;
            border-radius: 3px;
        }
        .log-timestamp { color: #7c3aed; }
        .log-debug { color: #06b6d4; }
        .log-success { color: #10b981; }
        .log-error { color: #ef4444; }
        .log-warning { color: #f59e0b; }
        .controls {
            margin-bottom: 15px;
        }
        .btn {
            background: #238636;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
            font-size: 14px;
        }
        .btn:hover { background: #2ea043; }
        .btn-clear { background: #da3633; }
        .btn-clear:hover { background: #b91c1c; }
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-online { background: #10b981; color: white; }
        .status-offline { background: #ef4444; color: white; }
        .stats {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 15px;
        }
        .stats-item {
            display: inline-block;
            margin-right: 20px;
            color: #f0f6fc;
        }
        .stats-value {
            color: #58a6ff;
            font-weight: bold;
        }
    </style>
</head>
<body>

<div class="header">
    <h1>📝 Monitor de Logs - Sistema Financeiro</h1>
    <p>Monitoramento em tempo real das operações de salvamento</p>
</div>

<div class="stats">
    <span class="stats-item">Status: <span id="status" class="status status-offline">OFFLINE</span></span>
    <span class="stats-item">Último update: <span id="lastUpdate" class="stats-value">Nunca</span></span>
    <span class="stats-item">Total de linhas: <span id="totalLines" class="stats-value">0</span></span>
    <span class="stats-item">Tamanho do log: <span id="logSize" class="stats-value">0 bytes</span></span>
</div>

<div class="controls">
    <button class="btn" onclick="startMonitoring()">▶️ Iniciar Monitoramento</button>
    <button class="btn" onclick="stopMonitoring()">⏸️ Parar</button>
    <button class="btn" onclick="refreshLogs()">🔄 Atualizar</button>
    <button class="btn btn-clear" onclick="clearLogs()">🗑️ Limpar Log</button>
    <button class="btn" onclick="downloadLogs()">💾 Download</button>
</div>

<div class="log-container" id="logContainer">
    <div class="log-line" style="color: #6b7280;">
        📋 Aguardando logs... Clique em "Iniciar Monitoramento" para começar.
    </div>
</div>

<script>
let monitoringInterval = null;
let isMonitoring = false;
let lastLogSize = 0;

function formatLogLine(line) {
    if (!line.trim()) return '';
    
    // Detectar timestamp
    if (line.match(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/)) {
        line = line.replace(/^(\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\])/, '<span class="log-timestamp">$1</span>');
    }
    
    // Colorir baseado no conteúdo
    let cssClass = '';
    if (line.includes('ERRO') || line.includes('ERROR') || line.includes('FALHA')) {
        cssClass = 'log-error';
    } else if (line.includes('SUCESSO') || line.includes('SUCCESS') || line.includes('✅')) {
        cssClass = 'log-success';
    } else if (line.includes('AVISO') || line.includes('WARNING') || line.includes('⚠️')) {
        cssClass = 'log-warning';
    } else if (line.includes('[DEBUG]') || line.includes('DEBUG')) {
        cssClass = 'log-debug';
    }
    
    return `<div class="log-line ${cssClass}">${line}</div>`;
}

async function refreshLogs() {
    try {
        const response = await fetch('./debug.log?t=' + Date.now());
        
        if (response.ok) {
            const logContent = await response.text();
            const lines = logContent.split('\n');
            
            // Atualizar estatísticas
            document.getElementById('totalLines').textContent = lines.length;
            document.getElementById('logSize').textContent = logContent.length + ' bytes';
            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
            
            // Se o log cresceu, destacar novas linhas
            const newContent = lines.length > lastLogSize;
            lastLogSize = lines.length;
            
            // Formatar e exibir logs
            const container = document.getElementById('logContainer');
            
            if (logContent.trim()) {
                let html = '';
                lines.forEach((line, index) => {
                    if (line.trim()) {
                        const isNew = newContent && index >= (lines.length - 10); // Últimas 10 linhas
                        const formatted = formatLogLine(line);
                        if (isNew && formatted) {
                            html += formatted.replace('log-line', 'log-line' + (isNew ? ' style="background: rgba(16, 185, 129, 0.1);"' : ''));
                        } else {
                            html += formatted;
                        }
                    }
                });
                container.innerHTML = html;
            } else {
                container.innerHTML = '<div class="log-line" style="color: #6b7280;">📝 Log vazio ou não encontrado</div>';
            }
            
            // Auto-scroll para o final
            container.scrollTop = container.scrollHeight;
            
            // Atualizar status
            document.getElementById('status').textContent = 'ONLINE';
            document.getElementById('status').className = 'status status-online';
            
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error('Erro ao carregar logs:', error);
        document.getElementById('logContainer').innerHTML = 
            `<div class="log-line log-error">❌ Erro ao carregar logs: ${error.message}</div>`;
        
        document.getElementById('status').textContent = 'OFFLINE';
        document.getElementById('status').className = 'status status-offline';
    }
}

function startMonitoring() {
    if (isMonitoring) return;
    
    isMonitoring = true;
    monitoringInterval = setInterval(refreshLogs, 2000); // Atualizar a cada 2 segundos
    refreshLogs(); // Primeira carga
    
    console.log('🚀 Monitoramento iniciado');
}

function stopMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
    isMonitoring = false;
    
    document.getElementById('status').textContent = 'PARADO';
    document.getElementById('status').className = 'status status-offline';
    
    console.log('⏸️ Monitoramento parado');
}

async function clearLogs() {
    if (!confirm('Tem certeza que deseja limpar o log de debug?')) return;
    
    try {
        const response = await fetch('./save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clear_log' })
        });
        
        // Limpar também visualmente
        document.getElementById('logContainer').innerHTML = 
            '<div class="log-line" style="color: #6b7280;">📝 Log limpo</div>';
        
        document.getElementById('totalLines').textContent = '0';
        document.getElementById('logSize').textContent = '0 bytes';
        
    } catch (error) {
        alert('Erro ao limpar log: ' + error.message);
    }
}

function downloadLogs() {
    const link = document.createElement('a');
    link.href = './debug.log';
    link.download = 'debug_' + new Date().toISOString().slice(0,19).replace(/:/g, '-') + '.log';
    link.click();
}

// Carregar logs iniciais
window.addEventListener('load', () => {
    refreshLogs();
    
    // Avisar quando sair da página
    window.addEventListener('beforeunload', () => {
        if (isMonitoring) {
            stopMonitoring();
        }
    });
});
</script>

</body>
</html>