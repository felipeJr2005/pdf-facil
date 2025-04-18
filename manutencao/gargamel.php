<?php
/**
 * Gargamel - Painel de Administração PDFFacil para Railway
 * Caminho: manutencao/gargamel.php
 */

// Configuração básica
$adminUser = 'admin';
$adminPassword = '1364@Fe1980';
$sessionTimeout = 86400; // 24 horas em segundos
$siteRoot = dirname(dirname(__FILE__));

// Iniciar sessão
session_start();

// Verificar se já está logado
$isLoggedIn = false;
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    // Verificar se a sessão expirou
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] < $sessionTimeout)) {
        $isLoggedIn = true;
        $_SESSION['last_activity'] = time(); // Atualizar último acesso
    } else {
        // Sessão expirada
        session_unset();
        session_destroy();
    }
}

// Processar login
$loginError = '';
if (isset($_POST['action']) && $_POST['action'] === 'login') {
    if ($_POST['username'] === $adminUser && $_POST['password'] === $adminPassword) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['last_activity'] = time();
        $isLoggedIn = true;
        
        // Redirecionar para evitar reenvio do formulário
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    } else {
        $loginError = 'Usuário ou senha incorretos.';
    }
}

// Processar logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_unset();
    session_destroy();
    header("Location: " . $_SERVER['PHP_SELF']);
    exit;
}

// Processar limpeza de cache
$message = '';
if ($isLoggedIn && isset($_POST['action']) && $_POST['action'] === 'clear_cache') {
    // Atualizar timestamp (se possível)
    $timestampFile = $siteRoot . '/.last_cache_clean';
    $timestampUpdated = @file_put_contents($timestampFile, time());
    
    // Limpar cache PHP
    $opcacheCleared = false;
    if (function_exists('opcache_reset')) {
        opcache_reset();
        $opcacheCleared = true;
    }
    
    // Limpar cache de estatísticas
    clearstatcache(true);
    
    // Enviar cabeçalhos anti-cache
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
    header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
    
    $message = 'Cache limpo com sucesso! Cache do PHP e do navegador foram atualizados.';
}

// Arquivo de notas de manutenção
$notesFile = $siteRoot . '/maintenance_notes.json';

// Função para ler notas do arquivo
function getNotes() {
    global $notesFile;
    if (file_exists($notesFile)) {
        $content = file_get_contents($notesFile);
        return json_decode($content, true) ?: [];
    }
    return [];
}

// Função para salvar notas no arquivo
function saveNotes($notes) {
    global $notesFile, $message;
    $saved = @file_put_contents($notesFile, json_encode($notes, JSON_PRETTY_PRINT));
    return $saved !== false;
}

// Obter notas
$notes = getNotes();

// Processar adição de nova nota
if ($isLoggedIn && isset($_POST['action']) && $_POST['action'] === 'add_note') {
    // Gerar ID único baseado no timestamp
    $id = time() . '_' . mt_rand(1000, 9999);
    
    // Criar nova nota
    $newNote = [
        'id' => $id,
        'title' => $_POST['note_title'],
        'content' => $_POST['note_content'],
        'module' => $_POST['note_module'],
        'priority' => $_POST['note_priority'],
        'date_created' => date('Y-m-d H:i:s'),
        'status' => 'pendente'
    ];
    
    // Adicionar à lista de notas
    $notes[] = $newNote;
    
    // Salvar notas
    if (saveNotes($notes)) {
        $message = 'Nota adicionada com sucesso!';
    } else {
        $message = 'Erro ao salvar nota. Verifique as permissões de arquivo.';
    }
}

// Lidar com a conclusão de uma nota
if ($isLoggedIn && isset($_GET['complete']) && !empty($_GET['complete'])) {
    $idToComplete = $_GET['complete'];
    
    // Encontrar e atualizar a nota
    foreach ($notes as $key => $note) {
        if ($note['id'] === $idToComplete) {
            $notes[$key]['status'] = 'concluído';
            $notes[$key]['date_completed'] = date('Y-m-d H:i:s');
            break;
        }
    }
    
    // Salvar notas atualizadas
    if (saveNotes($notes)) {
        $message = 'Tarefa marcada como concluída!';
    }
    
    // Redirecionar para evitar recargas
    header("Location: " . $_SERVER['PHP_SELF']);
    exit;
}

// Lidar com a exclusão de uma nota
if ($isLoggedIn && isset($_GET['delete']) && !empty($_GET['delete'])) {
    $idToDelete = $_GET['delete'];
    
    // Remover a nota pelo ID
    foreach ($notes as $key => $note) {
        if ($note['id'] === $idToDelete) {
            unset($notes[$key]);
            break;
        }
    }
    
    // Reindexar array e salvar
    $notes = array_values($notes);
    if (saveNotes($notes)) {
        $message = 'Nota removida com sucesso!';
    }
    
    // Redirecionar
    header("Location: " . $_SERVER['PHP_SELF']);
    exit;
}

// Filtrar notas por status
$pendingNotes = array_filter($notes, function($note) {
    return $note['status'] === 'pendente';
});

$completedNotes = array_filter($notes, function($note) {
    return $note['status'] === 'concluído';
});

// Ordenar notas pendentes por prioridade e depois por data
usort($pendingNotes, function($a, $b) {
    // Mapear prioridade para valor numérico
    $priorityMap = ['alta' => 1, 'média' => 2, 'baixa' => 3];
    
    // Comparar por prioridade primeiro
    $priorityCompare = $priorityMap[$a['priority']] - $priorityMap[$b['priority']];
    if ($priorityCompare !== 0) {
        return $priorityCompare;
    }
    
    // Se mesma prioridade, ordenar por data (mais recente primeiro)
    return strtotime($b['date_created']) - strtotime($a['date_created']);
});

// Ordenar notas concluídas por data de conclusão
usort($completedNotes, function($a, $b) {
    return strtotime($b['date_completed'] ?? $b['date_created']) - strtotime($a['date_completed'] ?? $a['date_created']);
});
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gargamel - PDFFacil</title>
    <style>
        :root {
            --primary-color: #5c95ce;
            --primary-dark: #1976d2;
            --success-color: #4CAF50;
            --error-color: #f44336;
            --warning-color: #ff9800;
            --text-color: #333;
            --text-secondary: #666;
            --bg-color: #f5f5f5;
            --card-bg: #ffffff;
            --border-color: #e0e0e0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .card {
            background-color: var(--card-bg);
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 30px;
            margin-bottom: 20px;
        }
        
        .login-container {
            max-width: 400px;
            margin: 50px auto;
        }
        
        h1, h2 {
            color: var(--primary-color);
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        input[type="text"],
        input[type="password"],
        textarea,
        select {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-size: 16px;
            font-family: inherit;
        }
        
        textarea {
            resize: vertical;
            min-height: 100px;
        }
        
        button, .btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
            text-decoration: none;
            display: inline-block;
        }
        
        button:hover, .btn:hover {
            background-color: var(--primary-dark);
        }
        
        .error-message {
            color: var(--error-color);
            background-color: rgba(244, 67, 54, 0.1);
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        
        .success-message {
            color: var(--success-color);
            background-color: rgba(76, 175, 80, 0.1);
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .card-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .card-content {
            margin-bottom: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        
        .logout-link {
            font-size: 14px;
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .logout-link:hover {
            text-decoration: underline;
        }
        
        .timestamp {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
        }
        
        .tabs {
            display: flex;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 20px;
        }
        
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            border-bottom: 3px solid transparent;
        }
        
        .tab.active {
            font-weight: 600;
            color: var(--primary-color);
            border-bottom-color: var(--primary-color);
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .note-item {
            padding: 15px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            margin-bottom: 15px;
            background-color: var(--card-bg);
            position: relative;
        }
        
        .note-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .note-title {
            font-weight: 600;
            font-size: 18px;
        }
        
        .note-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 10px;
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        .note-content {
            background-color: #f9f9f9;
            padding: 12px;
            border-radius: 4px;
            white-space: pre-wrap;
        }
        
        .tag {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            color: white;
        }
        
        .tag-alta {
            background-color: var(--error-color);
        }
        
        .tag-média {
            background-color: var(--warning-color);
            color: #212529;
        }
        
        .tag-baixa {
            background-color: var(--primary-color);
        }
        
        .tag-pendente {
            background-color: var(--warning-color);
            color: #212529;
        }
        
        .tag-concluído {
            background-color: var(--success-color);
        }
        
        .note-actions {
            position: absolute;
            top: 15px;
            right: 15px;
            display: flex;
            gap: 10px;
        }
        
        .action-link {
            color: var(--text-secondary);
            font-size: 16px;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .action-link:hover {
            color: var(--primary-color);
        }
        
        .delete-link:hover {
            color: var(--error-color);
        }
        
        .complete-link:hover {
            color: var(--success-color);
        }
        
        .empty-message {
            padding: 20px;
            text-align: center;
            color: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
            .grid {
                grid-template-columns: 1fr;
            }
            
            .note-meta {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <?php if (!$isLoggedIn): ?>
            <!-- Formulário de Login -->
            <div class="login-container card">
                <h1>Gargamel</h1>
                <p style="margin-bottom: 20px;">Painel de administração do PDFFacil para o Railway</p>
                
                <?php if (!empty($loginError)): ?>
                    <div class="error-message">
                        <?php echo htmlspecialchars($loginError); ?>
                    </div>
                <?php endif; ?>
                
                <form method="post" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>">
                    <input type="hidden" name="action" value="login">
                    
                    <div class="form-group">
                        <label for="username">Usuário</label>
                        <input type="text" id="username" name="username" required autofocus>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    
                    <button type="submit">Entrar</button>
                </form>
            </div>
        <?php else: ?>
            <!-- Painel de Administração -->
            <div class="header">
                <h1>Gargamel - Painel de Administração</h1>
                <a href="?action=logout" class="logout-link">Sair</a>
            </div>
            
            <?php if (!empty($message)): ?>
                <div class="success-message">
                    <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>
            
            <div class="tabs">
                <div class="tab active" data-tab="dashboard">Dashboard</div>
                <div class="tab" data-tab="notes">Notas de Manutenção</div>
            </div>
            
            <div id="dashboard" class="tab-content active">
                <div class="grid">
                    <!-- Card de Limpeza de Cache -->
                    <div class="card">
                        <div class="card-title">Gerenciamento de Cache</div>
                        <div class="card-content">
                            <p>Use esta opção para limpar o cache do PHP e notificar os navegadores para atualizarem seus caches.</p>
                            
                            <?php
                            $timestampFile = $siteRoot . '/.last_cache_clean';
                            if (file_exists($timestampFile)):
                                $lastCleanTime = (int)file_get_contents($timestampFile);
                            ?>
                                <div class="timestamp">
                                    Última limpeza: <?php echo date('d/m/Y H:i:s', $lastCleanTime); ?>
                                </div>
                            <?php endif; ?>
                        </div>
                        
                        <form method="post" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>">
                            <input type="hidden" name="action" value="clear_cache">
                            <button type="submit">Limpar Cache</button>
                        </form>
                    </div>
                    
                    <!-- Card de Status do Servidor -->
                    <div class="card">
                        <div class="card-title">Status do Servidor</div>
                        <div class="card-content">
                            <p><strong>Servidor:</strong> <?php echo $_SERVER['SERVER_SOFTWARE']; ?></p>
                            <p><strong>PHP:</strong> <?php echo phpversion(); ?></p>
                            <p><strong>Data atual:</strong> <?php echo date('d/m/Y H:i:s'); ?></p>
                            
                            <?php if (function_exists('opcache_get_status')): 
                                $opcache = @opcache_get_status(false);
                                if ($opcache !== false):
                            ?>
                                <p><strong>OPCache:</strong> 
                                    <?php echo $opcache['opcache_enabled'] ? 'Ativado' : 'Desativado'; ?>
                                </p>
                            <?php endif; endif; ?>
                            
                            <p><strong>Diretório:</strong> <?php echo htmlspecialchars($siteRoot); ?></p>
                        </div>
                        
                        <a href="/" class="btn">Voltar para o site</a>
                    </div>
                </div>
            </div>
            
            <div id="notes" class="tab-content">
                <div class="grid">
                    <!-- Card para adicionar notas -->
                    <div class="card">
                        <div class="card-title">Adicionar Nota de Manutenção</div>
                        <form method="post" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>">
                            <input type="hidden" name="action" value="add_note">
                            
                            <div class="form-group">
                                <label for="note_title">Título</label>
                                <input type="text" id="note_title" name="note_title" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="note_module">Módulo</label>
                                <input type="text" id="note_module" name="note_module" required placeholder="Ex: converter, juntar, etc">
                            </div>
                            
                            <div class="form-group">
                                <label for="note_priority">Prioridade</label>
                                <select id="note_priority" name="note_priority" required>
                                    <option value="baixa">Baixa</option>
                                    <option value="média" selected>Média</option>
                                    <option value="alta">Alta</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="note_content">Conteúdo</label>
                                <textarea id="note_content" name="note_content" required placeholder="Descreva a tarefa ou problema"></textarea>
                            </div>
                            
                            <button type="submit">Adicionar Nota</button>
                        </form>
                    </div>
                    
                    <!-- Card para listar notas pendentes -->
                    <div class="card">
                        <div class="card-title">Tarefas Pendentes</div>
                        
                        <?php if (empty($pendingNotes)): ?>
                            <div class="empty-message">
                                <p>Não há tarefas pendentes.</p>
                            </div>
                        <?php else: ?>
                            <?php foreach ($pendingNotes as $note): ?>
                                <div class="note-item">
                                    <div class="note-header">
                                        <div class="note-title"><?php echo htmlspecialchars($note['title']); ?></div>
                                    </div>
                                    <div class="note-meta">
                                        <span><strong>Módulo:</strong> <?php echo htmlspecialchars($note['module']); ?></span>
                                        <span class="tag tag-<?php echo htmlspecialchars($note['priority']); ?>">
                                            <?php echo ucfirst(htmlspecialchars($note['priority'])); ?>
                                        </span>
                                        <span><strong>Data:</strong> <?php echo htmlspecialchars($note['date_created']); ?></span>
                                    </div>
                                    <div class="note-content"><?php echo htmlspecialchars($note['content']); ?></div>
                                    <div class="note-actions">
                                        <a href="?complete=<?php echo urlencode($note['id']); ?>" class="action-link complete-link" title="Marcar como concluída">
                                            <i class="✓">✓</i>
                                        </a>
                                        <a href="?delete=<?php echo urlencode($note['id']); ?>" class="action-link delete-link" title="Excluir nota" onclick="return confirm('Tem certeza que deseja excluir esta nota?');">
                                            <i class="✕">✕</i>
                                        </a>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Card para listar notas concluídas -->
                    <div class="card">
                        <div class="card-title">Tarefas Concluídas</div>
                        
                        <?php if (empty($completedNotes)): ?>
                            <div class="empty-message">
                                <p>Não há tarefas concluídas.</p>
                            </div>
                        <?php else: ?>
                            <?php foreach ($completedNotes as $note): ?>
                                <div class="note-item" style="opacity: 0.7;">
                                    <div class="note-header">
                                        <div class="note-title"><?php echo htmlspecialchars($note['title']); ?></div>
                                    </div>
                                    <div class="note-meta">
                                        <span><strong>Módulo:</strong> <?php echo htmlspecialchars($note['module']); ?></span>
                                        <span class="tag tag-concluído">Concluído</span>
                                        <span><strong>Concluído em:</strong> <?php echo htmlspecialchars($note['date_completed'] ?? 'N/A'); ?></span>
                                    </div>
                                    <div class="note-content"><?php echo htmlspecialchars($note['content']); ?></div>
                                    <div class="note-actions">
                                        <a href="?delete=<?php echo urlencode($note['id']); ?>" class="action-link delete-link" title="Excluir nota" onclick="return confirm('Tem certeza que deseja excluir esta nota?');">
                                            <i class="✕">✕</i>
                                        </a>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>
    
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Controle de abas
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Desativar todas as abas
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Ativar a aba clicada
                this.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // Esconder mensagem de sucesso após 5 segundos
        const successMessage = document.querySelector('.success-message');
        if (successMessage) {
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }
    });
    </script>
</body>
</html>
