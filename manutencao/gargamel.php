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
$cacheMessage = '';
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
    
    $cacheMessage = 'Cache limpo com sucesso! Cache do PHP e do navegador foram atualizados.';
}

// Ler notas de manutenção (se existirem)
$notesFile = $siteRoot . '/maintenance_notes.json';
$notes = [];
if (file_exists($notesFile)) {
    $notesContent = file_get_contents($notesFile);
    if (!empty($notesContent)) {
        $notes = json_decode($notesContent, true) ?: [];
    }
}

// Processar adição de notas
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
    
    // Tentar salvar notas
    $notesSaved = @file_put_contents($notesFile, json_encode($notes, JSON_PRETTY_PRINT));
    
    // Mensagem de sucesso ou erro
    if ($notesSaved) {
        $cacheMessage = 'Nota adicionada com sucesso!';
    } else {
        $cacheMessage = 'Erro ao salvar nota. Problema de permissão.';
    }
}
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
        
        .note-priority {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            color: white;
        }
        
        .priority-alta {
            background-color: var(--error-color);
        }
        
        .priority-média {
            background-color: var(--warning-color);
        }
        
        .priority-baixa {
            background-color: var(--primary-color);
        }
        
        @media (max-width: 768px) {
            .grid {
                grid-template-columns: 1fr;
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
            
            <?php if (!empty($cacheMessage)): ?>
                <div class="success-message">
                    <?php echo htmlspecialchars($cacheMessage); ?>
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
                    
                    <!-- Card para listar notas -->
                    <div class="card">
                        <div class="card-title">Notas de Manutenção</div>
                        
                        <?php if (empty($notes)): ?>
                            <p>Nenhuma nota de manutenção encontrada.</p>
                        <?php else: ?>
                            <div class="notes-container">
                                <?php foreach ($notes as $note): ?>
                                    <div class="note-item">
                                        <div class="note-header">
                                            <div class="note-title"><?php echo htmlspecialchars($note['title']); ?></div>
                                        </div>
                                        <div class="note-meta">
                                            <span><strong>Módulo:</strong> <?php echo htmlspecialchars($note['module']); ?></span>
                                            <span><strong>Status:</strong> <?php echo htmlspecialchars($note['status']); ?></span>
                                            <span class="note-priority priority-<?php echo htmlspecialchars($note['priority']); ?>">
                                                <?php echo ucfirst(htmlspecialchars($note['priority'])); ?>
                                            </span>
                                            <span><strong>Data:</strong> <?php echo htmlspecialchars($note['date_created']); ?></span>
                                        </div>
                                        <div class="note-content"><?php echo htmlspecialchars($note['content']); ?></div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
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
