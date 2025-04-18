</div>
                </div>
            </div>
            
            <!-- Aba de Sugestões -->
            <div id="sugestoes" class="tab-content <?php echo $activeTab === 'sugestoes' ? 'active' : ''; ?>">
                <!-- Importar do localStorage -->
                <div class="import-container">
                    <h3>Importar sugestões do localStorage</h3>
                    <p>Se houver sugestões salvas no localStorage deste navegador, você pode importá-las para o banco de dados:</p>
                    <form method="post" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>?tab=sugestoes" onsubmit="return prepareImport()">
                        <input type="hidden" name="action" value="import_suggestions">
                        <input type="hidden" name="local_data" id="local_data">
                        <button type="submit" id="importButton" disabled>Importar sugestões do localStorage</button>
                    </form>
                </div>
                
                <!-- Estatísticas -->
                <div class="card-stats">
                    <div class="stat-box">
                        <h4>Total de Sugestões</h4>
                        <div class="stat-value"><?php echo count($pendingSuggestions) + count($completedSuggestions); ?></div>
                    </div>
                    <div class="stat-box">
                        <h4>Pendentes</h4>
                        <div class="stat-value"><?php echo count($pendingSuggestions); ?></div>
                    </div>
                    <div class="stat-box">
                        <h4>Concluídas</h4>
                        <div class="stat-value"><?php echo count($completedSuggestions); ?></div>
                    </div>
                </div>
                
                <div class="grid">
                    <!-- Sugestões pendentes -->
                    <div class="card">
                        <h3>Sugestões Pendentes</h3>
                        
                        <?php if (empty($pendingSuggestions)): ?>
                            <div class="empty-message">
                                <p>Não há sugestões pendentes.</p>
                            </div>
                        <?php else: ?>
                            <?php foreach ($pendingSuggestions as $suggestion): ?>
                                <div class="suggestion-item">
                                    <div class="suggestion-header">
                                        <div class="suggestion-title"><?php echo htmlspecialchars($suggestion['title']); ?></div>
                                    </div>
                                    <div class="suggestion-meta">
                                        <span class="tag tag-module">
                                            <?php echo htmlspecialchars($availableModules[$suggestion['module']] ?? $suggestion['module']); ?>
                                        </span>
                                        <span class="tag tag-<?php echo htmlspecialchars($suggestion['type']); ?>">
                                            <?php echo htmlspecialchars($typeLabels[$suggestion['type']] ?? $suggestion['type']); ?>
                                        </span>
                                        <span>
                                            <i class="far fa-clock"></i> 
                                            <?php echo date('d/m/Y H:i', strtotime($suggestion['date'])); ?>
                                        </span>
                                    </div>
                                    <div class="suggestion-content"><?php echo htmlspecialchars($suggestion['content']); ?></div>
                                    <?php if (!empty($suggestion['email'])): ?>
                                        <div class="suggestion-email">
                                            <strong>Email:</strong> <?php echo htmlspecialchars($suggestion['email']); ?>
                                        </div>
                                    <?php endif; ?>
                                    <div class="suggestion-actions">
                                        <a href="?tab=sugestoes&complete_suggestion=<?php echo $suggestion['id']; ?>" class="action-link complete-link" title="Marcar como concluída">
                                            <i class="fas fa-check-circle"></i>
                                        </a>
                                        <a href="?tab=sugestoes&delete_suggestion=<?php echo $suggestion['id']; ?>" class="action-link delete-link" title="Excluir" onclick="return confirm('Tem certeza que deseja excluir esta sugestão?');">
                                            <i class="fas fa-trash"></i>
                                        </a>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Sugestões concluídas -->
                    <div class="card">
                        <h3>Sugestões Concluídas</h3>
                        
                        <?php if (empty($completedSuggestions)): ?>
                            <div class="empty-message">
                                <p>Não há sugestões concluídas.</p>
                            </div>
                        <?php else: ?>
                            <?php foreach ($completedSuggestions as $suggestion): ?>
                                <div class="suggestion-item" style="opacity: 0.8;">
                                    <div class="suggestion-header">
                                        <div class="suggestion-title"><?php echo htmlspecialchars($suggestion['title']); ?></div>
                                    </div>
                                    <div class="suggestion-meta">
                                        <span class="tag tag-module">
                                            <?php echo htmlspecialchars($availableModules[$suggestion['module']] ?? $suggestion['module']); ?>
                                        </span>
                                        <span class="tag tag-<?php echo htmlspecialchars($suggestion['type']); ?>">
                                            <?php echo htmlspecialchars($typeLabels[$suggestion['type']] ?? $suggestion['type']); ?>
                                        </span>
                                        <span>
                                            <i class="far fa-clock"></i> 
                                            <?php echo date('d/m/Y H:i', strtotime($suggestion['date'])); ?>
                                        </span>
                                        <span class="tag tag-concluído">Concluído</span>
                                    </div>
                                    <div class="suggestion-content"><?php echo htmlspecialchars($suggestion['content']); ?></div>
                                    <?php if (!empty($suggestion['email'])): ?>
                                        <div class="suggestion-email">
                                            <strong>Email:</strong> <?php echo htmlspecialchars($suggestion['email']); ?>
                                        </div>
                                    <?php endif; ?>
                                    <div class="suggestion-actions">
                                        <a href="?tab=sugestoes&delete_suggestion=<?php echo $suggestion['id']; ?>" class="action-link delete-link" title="Excluir" onclick="return confirm('Tem certeza que deseja excluir esta sugestão?');">
                                            <i class="fas fa-trash"></i>
                                        </a>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            
            <!-- Aba de Notas de Manutenção -->
            <div id="notas" class="tab-content <?php echo $activeTab === 'notas' ? 'active' : ''; ?>">
                <div class="grid">
                    <!-- Card para adicionar notas -->
                    <div class="card">
                        <div class="card-title">Adicionar Nota de Manutenção</div>
                        <form method="post" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>?tab=notas">
                            <input type="hidden" name="action" value="add_note">
                            
                            <div class="form-group">
                                <label for="note_title">Título</label>
                                <input type="text" id="note_title" name="note_title" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="note_module">Módulo</label>
                                <select id="note_module" name="note_module" required>
                                    <option value="" disabled selected>Selecione um módulo</option>
                                    <?php foreach ($availableModules as $value => $label): ?>
                                    <option value="<?php echo htmlspecialchars($value); ?>"><?php echo htmlspecialchars($label); ?></option>
                                    <?php endforeach; ?>
                                </select>
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
                                        <span><strong>Módulo:</strong> <?php echo htmlspecialchars($availableModules[$note['module']] ?? $note['module']); ?></span>
                                        <span class="tag tag-<?php echo htmlspecialchars($note['priority']); ?>">
                                            <?php echo ucfirst(htmlspecialchars($note['priority'])); ?>
                                        </span>
                                        <span><strong>Data:</strong> <?php echo htmlspecialchars($note['date_created']); ?></span>
                                    </div>
                                    <div class="note-content"><?php echo htmlspecialchars($note['content']); ?></div>
                                    <div class="note-actions">
                                        <a href="?tab=notas&complete=<?php echo urlencode($note['id']); ?>" class="action-link complete-link" title="Marcar como concluída">
                                            <i class="fas fa-check-circle"></i>
                                        </a>
                                        <a href="?tab=notas&delete=<?php echo urlencode($note['id']); ?>" class="action-link delete-link" title="Excluir nota" onclick="return confirm('Tem certeza que deseja excluir esta nota?');">
                                            <i class="fas fa-trash"></i>
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
                                        <span><strong>Módulo:</strong> <?php echo htmlspecialchars($availableModules[$note['module']] ?? $note['module']); ?></span>
                                        <span class="tag tag-<?php echo htmlspecialchars($note['priority']); ?>">
                                            <?php echo ucfirst(htmlspecialchars($note['priority'])); ?>
                                        </span>
                                        <span><strong>Data:</strong> <?php echo htmlspecialchars($note['date_created']); ?></span>
                                        <span><strong>Concluído em:</strong> <?php echo htmlspecialchars($note['date_completed'] ?? 'N/A'); ?></span>
                                    </div>
                                    <div class="note-content"><?php echo htmlspecialchars($note['content']); ?></div>
                                    <div class="note-actions">
                                        <a href="?tab=notas&delete=<?php echo urlencode($note['id']); ?>" class="action-link delete-link" title="Excluir nota" onclick="return confirm('Tem certeza que deseja excluir esta nota?');">
                                            <i class="fas fa-trash"></i>
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
            // Função para verificar localStorage
            function checkLocalStorage() {
                const importButton = document.getElementById('importButton');
                if (importButton) {
                    try {
                        const pendingSuggestions = JSON.parse(localStorage.getItem('pendingSuggestions') || '[]');
                        if (pendingSuggestions.length > 0) {
                            importButton.textContent = `Importar ${pendingSuggestions.length} sugestões do localStorage`;
                            importButton.disabled = false;
                        }
                    } catch (e) {
                        console.error('Erro ao verificar localStorage:', e);
                    }
                }
            }
            
            // Preparar dados para importação
            window.prepareImport = function() {
                try {
                    const pendingSuggestions = JSON.parse(localStorage.getItem('pendingSuggestions') || '[]');
                    if (pendingSuggestions.length === 0) {
                        alert('Não há sugestões para importar no localStorage.');
                        return false;
                    }
                    
                    document.getElementById('local_data').value = JSON.stringify(pendingSuggestions);
                    
                    // Limpar localStorage após importação bem-sucedida
                    localStorage.removeItem('pendingSuggestions');
                    
                    return true;
                } catch (e) {
                    console.error('Erro ao preparar dados para importação:', e);
                    alert('Erro ao preparar dados para importação: ' + e.message);
                    return false;
                }
            }
            
            // Mostrar a aba correta baseado na URL
            function showActiveTab() {
                const urlParams = new URLSearchParams(window.location.search);
                const tab = urlParams.get('tab');
                
                const tabs = ['dashboard', 'sugestoes', 'notas'];
                
                // Se não houver aba especificada, mostrar dashboard
                const activeTab = tabs.includes(tab) ? tab : 'dashboard';
                
                // Esconder todas as abas
                tabs.forEach(t => {
                    const content = document.getElementById(t);
                    if (content) {
                        content.style.display = 'none';
                    }
                });
                
                // Mostrar a aba ativa
                const activeContent = document.getElementById(activeTab);
                if (activeContent) {
                    activeContent.style.display = 'block';
                }
            }
            
            // Esconder mensagem de sucesso após 5 segundos
            const successMessage = document.querySelector('.success-message');
            if (successMessage) {
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            }
            
            // Inicializar
            checkLocalStorage();
            showActiveTab();
        });
    </script>
</body>
</html>
