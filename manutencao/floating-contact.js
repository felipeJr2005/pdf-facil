(function() {
    // Criar o elemento de estilo
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos para o painel flutuante */
        #pdf-floating-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-end;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        #pdf-floating-panel * {
            box-sizing: border-box;
        }
        
        .pdf-floating-panel-buttons {
            display: none;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        #pdf-floating-panel.active .pdf-floating-panel-buttons {
            display: flex;
        }
        
        .pdf-floating-button {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.25rem;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .pdf-floating-button:hover {
            transform: translateY(-3px);
        }
        
        .pdf-floating-button.main {
            background: linear-gradient(135deg, #5c95ce, #1976d2);
            color: white;
            font-size: 1.5rem;
            width: 60px;
            height: 60px;
            animation: pdfPulse 2s infinite;
        }
        
        .pdf-floating-button.whatsapp {
            background: linear-gradient(135deg, #25D366, #128C7E);
            color: white;
        }
        
        .pdf-floating-button.suggestion {
            background: linear-gradient(135deg, #ffb700, #ff9500);
            color: white;
        }
        
        .pdf-button-tooltip {
            position: absolute;
            right: 60px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.8125rem;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            pointer-events: none;
        }
        
        .pdf-floating-button:hover .pdf-button-tooltip {
            opacity: 1;
            visibility: visible;
        }
        
        /* Modal de sugestões */
        #pdf-suggestion-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000000;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        #pdf-suggestion-modal.active {
            display: flex;
        }
        
        .pdf-suggestion-modal-content {
            background-color: white;
            padding: 1.5rem;
            border-radius: 0.75rem;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .pdf-suggestion-close {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 1.25rem;
            color: #999;
            cursor: pointer;
            border: none;
            background: transparent;
            width: auto;
            height: auto;
            padding: 5px;
        }
        
        #pdf-suggestion-modal h3 {
            color: #5c95ce;
            margin-bottom: 1rem;
            font-size: 1.25rem;
        }
        
        .pdf-suggestion-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .pdf-suggestion-form label {
            font-weight: 600;
            margin-bottom: 0.25rem;
            display: block;
        }
        
        .pdf-suggestion-form input,
        .pdf-suggestion-form textarea,
        .pdf-suggestion-form select {
            padding: 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            font-family: inherit;
            font-size: 0.9375rem;
            width: 100%;
        }
        
        .pdf-suggestion-form textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        .pdf-suggestion-form button {
            background: linear-gradient(135deg, #5c95ce, #1976d2);
            color: white;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            width: 100%;
        }
        
        .pdf-suggestion-form button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(92, 149, 206, 0.3);
        }
        
        .pdf-suggestion-thanks {
            display: none;
            text-align: center;
            padding: 2rem 1rem;
        }
        
        .pdf-suggestion-thanks.active {
            display: block;
        }
        
        .pdf-suggestion-thanks i {
            font-size: 3rem;
            color: #4CAF50;
            margin-bottom: 1rem;
        }
        
        .pdf-suggestion-thanks h4 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            color: #5c95ce;
        }
        
        /* Animação de pulso para o botão principal */
        @keyframes pdfPulse {
            0% {
                box-shadow: 0 0 0 0 rgba(92, 149, 206, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(92, 149, 206, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(92, 149, 206, 0);
            }
        }
        
        @media (max-width: 767px) {
            #pdf-floating-panel {
                bottom: 70px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Carregar Font Awesome se não estiver presente
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
    
    // Criar o painel flutuante
    const floatingPanel = document.createElement('div');
    floatingPanel.id = 'pdf-floating-panel';
    floatingPanel.innerHTML = `
        <div class="pdf-floating-panel-buttons">
            <button onclick="pdfFloatingContact.openWhatsApp()" class="pdf-floating-button whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span class="pdf-button-tooltip">Entrar em contato via WhatsApp</span>
            </button>
            <button onclick="pdfFloatingContact.openSuggestionForm()" class="pdf-floating-button suggestion">
                <i class="fas fa-lightbulb"></i>
                <span class="pdf-button-tooltip">Sugerir melhoria</span>
            </button>
        </div>
        <button onclick="pdfFloatingContact.togglePanel()" class="pdf-floating-button main">
            <i class="fas fa-comments"></i>
        </button>
    `;
    
    // Criar o modal de sugestões
    const suggestionModal = document.createElement('div');
    suggestionModal.id = 'pdf-suggestion-modal';
    suggestionModal.innerHTML = `
        <div class="pdf-suggestion-modal-content">
            <button class="pdf-suggestion-close" onclick="pdfFloatingContact.closeSuggestionModal()">
                <i class="fas fa-times"></i>
            </button>
            
            <div id="pdf-suggestion-form">
                <h3>Sugerir melhoria para o PDFFacil</h3>
                <form class="pdf-suggestion-form" id="pdf-improvement-form" onsubmit="pdfFloatingContact.submitSuggestion(event)">
                    <div>
                        <label for="pdf-suggestion-module">Módulo:</label>
                        <select id="pdf-suggestion-module" required>
                            <option value="" disabled selected>Selecione uma opção</option>
                            <option value="geral">Geral</option>
                            <option value="comprimir">Comprimir</option>
                            <option value="converter">Converter</option>
                            <option value="dividir">Dividir</option>
                            <option value="editar">Editar</option>
                            <option value="extrair">Extrair Páginas</option>
                            <option value="extrair_imagens">Extrair Imagens</option>
                            <option value="filtro">Filtro</option>
                            <option value="juntar">Juntar</option>
                            <option value="otimizar_pje">Otimizar PJE</option>
                            <option value="apagar">Remover Páginas</option>
                            <option value="reorganizar">Reorganizar</option>
                            <option value="rotacionar">Rotacionar</option>
                        </select>
                    </div>
                    <div>
                        <label for="pdf-suggestion-type">Tipo de sugestão:</label>
                        <select id="pdf-suggestion-type" required>
                            <option value="" disabled selected>Selecione uma opção</option>
                            <option value="melhoria">Melhoria</option>
                            <option value="erro">Correção de erro</option>
                            <option value="nova_funcao">Nova funcionalidade</option>
                        </select>
                    </div>
                    <div>
                        <label for="pdf-suggestion-title">Título:</label>
                        <input type="text" id="pdf-suggestion-title" placeholder="Título da sua sugestão" required>
                    </div>
                    <div>
                        <label for="pdf-suggestion-content">Descrição:</label>
                        <textarea id="pdf-suggestion-content" placeholder="Descreva sua sugestão em detalhes" required></textarea>
                    </div>
                    <div>
                        <label for="pdf-suggestion-email">Email (opcional):</label>
                        <input type="email" id="pdf-suggestion-email" placeholder="Seu email para contato">
                    </div>
                    
                    <button type="submit">Enviar sugestão</button>
                </form>
            </div>
            
            <div id="pdf-suggestion-thanks" class="pdf-suggestion-thanks">
                <i class="fas fa-check-circle"></i>
                <h4>Obrigado pela sua sugestão!</h4>
                <p>Sua contribuição é muito importante para melhorarmos o PDFFacil.</p>
                <button onclick="pdfFloatingContact.closeSuggestionModal()">Fechar</button>
            </div>
        </div>
    `;
    
    // Adicionar elementos ao DOM
    document.body.appendChild(floatingPanel);
    document.body.appendChild(suggestionModal);
    
    // Definir o objeto global com as funções
    window.pdfFloatingContact = {
        // Alternar exibição do painel
        togglePanel: function() {
            document.getElementById('pdf-floating-panel').classList.toggle('active');
        },
        
        // Abrir WhatsApp
        openWhatsApp: function() {
            window.open('https://wa.me/5587988281725', '_blank');
            document.getElementById('pdf-floating-panel').classList.remove('active');
        },
        
        // Abrir formulário de sugestão
        openSuggestionForm: function() {
            document.getElementById('pdf-suggestion-modal').classList.add('active');
            document.getElementById('pdf-suggestion-form').style.display = 'block';
            document.getElementById('pdf-suggestion-thanks').classList.remove('active');
            document.getElementById('pdf-floating-panel').classList.remove('active');
        },
        
        // Fechar modal
        closeSuggestionModal: function() {
            document.getElementById('pdf-suggestion-modal').classList.remove('active');
            document.getElementById('pdf-improvement-form').reset();
        },
        
        // Enviar sugestão
        submitSuggestion: function(event) {
            event.preventDefault();
            
            // Coletar dados do formulário
            const module = document.getElementById('pdf-suggestion-module').value;
            const type = document.getElementById('pdf-suggestion-type').value;
            const title = document.getElementById('pdf-suggestion-title').value;
            const content = document.getElementById('pdf-suggestion-content').value;
            const email = document.getElementById('pdf-suggestion-email').value;
            
            // Preparar dados para envio
            const suggestionData = {
                module,
                type,
                title,
                content,
                email,
                date: new Date().toISOString()
            };
            
            // Salvar em localStorage
            try {
                const pendingSuggestions = JSON.parse(localStorage.getItem('pendingSuggestions') || '[]');
                pendingSuggestions.push(suggestionData);
                localStorage.setItem('pendingSuggestions', JSON.stringify(pendingSuggestions));
            } catch (e) {
                console.error('Erro ao salvar sugestão localmente:', e);
            }
            
            // Tentativa de envio por API
            try {
                fetch('/api/sugestoes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(suggestionData)
                })
                .catch(error => {
                    console.error('Erro ao enviar sugestão:', error);
                    // Erro silencioso, mostraremos agradecimento de qualquer forma
                });
            } catch (e) {
                console.error('Erro ao enviar sugestão:', e);
                // Erro silencioso, mostraremos agradecimento de qualquer forma
            }
            
            // Mostrar tela de agradecimento independente do resultado
            document.getElementById('pdf-suggestion-form').style.display = 'none';
            document.getElementById('pdf-suggestion-thanks').classList.add('active');
        }
    };
    
    // Adicionar listeners para fechamento do modal
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('pdf-suggestion-modal');
        if (event.target === modal) {
            window.pdfFloatingContact.closeSuggestionModal();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && document.getElementById('pdf-suggestion-modal').classList.contains('active')) {
            window.pdfFloatingContact.closeSuggestionModal();
        }
    });
})();
