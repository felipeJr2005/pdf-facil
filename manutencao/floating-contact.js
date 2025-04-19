/**
 * PDFFacil - Sistema de Contato Flutuante (Versão Simplificada)
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inserir CSS diretamente (ao invés de usar arquivo separado)
    injectStyles();
    
    // Criar elementos do botão flutuante e formulário
    createFloatingButton();
    
    // Adicionar event listeners
    setupEvents();
});

// Injetar estilos CSS diretamente no documento
function injectStyles() {
    const styles = `
    .fc-container {position:fixed;bottom:30px;right:30px;z-index:9998;display:flex;flex-direction:column;align-items:flex-end;}
    .fc-button {width:60px;height:60px;border-radius:50%;background:linear-gradient(145deg,#4361ee,#3a56d4);color:white;border:none;box-shadow:0 4px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;transition:all 0.3s ease;z-index:9999;}
    .fc-button:hover {transform:scale(1.05);box-shadow:0 6px 12px rgba(0,0,0,0.3);}
    .fc-button.active {background:linear-gradient(145deg,#3a56d4,#2a3bba);transform:rotate(45deg);}
    .fc-menu {position:absolute;bottom:75px;right:5px;background-color:white;border-radius:12px;box-shadow:0 5px 20px rgba(0,0,0,0.15);padding:10px;display:flex;flex-direction:column;gap:8px;opacity:0;visibility:hidden;transform:translateY(20px);transition:all 0.3s ease;min-width:200px;}
    .fc-menu.active {opacity:1;visibility:visible;transform:translateY(0);}
    .fc-option {padding:12px 16px;border-radius:8px;display:flex;align-items:center;gap:10px;font-weight:500;transition:all 0.2s ease;text-decoration:none;background:none;border:none;font-family:inherit;font-size:15px;cursor:pointer;color:#334155;width:100%;text-align:left;}
    .fc-option:hover {background-color:#f1f5f9;}
    .fc-option i {font-size:18px;}
    .fc-whatsapp {color:#25D366;}
    .fc-whatsapp:hover {background-color:rgba(37,211,102,0.1);}
    .fc-form {color:#4361ee;}
    .fc-form:hover {background-color:#eef2ff;}
    .fc-overlay {position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:all 0.3s ease;backdrop-filter:blur(3px);}
    .fc-overlay.active {opacity:1;visibility:visible;}
    .fc-form-container {background-color:white;width:95%;max-width:500px;border-radius:12px;box-shadow:0 5px 25px rgba(0,0,0,0.2);overflow:hidden;animation:fcSlideIn 0.4s ease;}
    @keyframes fcSlideIn {from{opacity:0;transform:translateY(-30px);}to{opacity:1;transform:translateY(0);}}
    .fc-form-header {padding:16px 20px;background-color:#eef2ff;color:#4361ee;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;}
    .fc-form-header h3 {margin:0;font-size:18px;font-weight:600;}
    .fc-form-close {background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;transition:color 0.2s ease;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;}
    .fc-form-close:hover {color:#4361ee;background-color:rgba(0,0,0,0.05);}
    .fc-form-content {padding:20px;}
    .fc-form-group {margin-bottom:16px;}
    .fc-form-group label {display:block;margin-bottom:8px;font-weight:500;color:#334155;}
    .fc-input, .fc-select, .fc-textarea {width:100%;padding:12px;border:1px solid #e2e8f0;border-radius:6px;font-size:15px;transition:all 0.2s ease;background-color:white;font-family:inherit;}
    .fc-input:focus, .fc-select:focus, .fc-textarea:focus {outline:none;border-color:#4361ee;box-shadow:0 0 0 3px rgba(67,97,238,0.15);}
    .fc-textarea {resize:vertical;min-height:120px;}
    .fc-submit {width:100%;padding:12px;border:none;border-radius:6px;background:linear-gradient(to right,#4361ee,#3a56d4);color:white;font-weight:600;font-size:16px;cursor:pointer;transition:all 0.3s ease;box-shadow:0 2px 5px rgba(0,0,0,0.1);margin-top:8px;}
    .fc-submit:hover {background:linear-gradient(to right,#3a56d4,#2a3bba);box-shadow:0 4px 8px rgba(0,0,0,0.15);transform:translateY(-2px);}
    .fc-message {padding:12px 20px;margin:0 20px 20px;border-radius:6px;font-size:15px;font-weight:500;}
    .fc-message.success {background-color:#dcfce7;color:#10b981;border-left:4px solid #10b981;}
    .fc-message.error {background-color:#fee2e2;color:#ef4444;border-left:4px solid #ef4444;}
    .fc-message.info {background-color:#eef2ff;color:#4361ee;border-left:4px solid #4361ee;}
    @media (max-width:768px) {.fc-container{bottom:20px;right:20px;}.fc-menu{right:0;min-width:180px;}.fc-form-container{max-height:90vh;overflow-y:auto;}}
    @media (prefers-color-scheme:dark) {.fc-menu,.fc-form-container{background-color:#1f2937;}.fc-form-header{background-color:#111827;}.fc-input,.fc-select,.fc-textarea{background-color:#1f2937;color:#cbd5e1;border-color:#374151;}.fc-option:hover{background-color:#374151;}.fc-form:hover{background-color:rgba(67,97,238,0.2);}.fc-whatsapp:hover{background-color:rgba(37,211,102,0.2);}.fc-message.success{background-color:rgba(16,185,129,0.1);}.fc-message.error{background-color:rgba(239,68,68,0.1);}.fc-message.info{background-color:rgba(67,97,238,0.1);}}
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

// Criar e adicionar elementos ao DOM
function createFloatingButton() {
    // Container principal
    const container = document.createElement('div');
    container.className = 'fc-container';
    
    // Botão principal
    const button = document.createElement('button');
    button.className = 'fc-button';
    button.innerHTML = '<i class="fas fa-comment"></i>';
    button.setAttribute('aria-label', 'Opções de contato');
    
    // Menu de opções
    const menu = document.createElement('div');
    menu.className = 'fc-menu';
    
    // Opção de WhatsApp
    const whatsapp = document.createElement('a');
    whatsapp.className = 'fc-option fc-whatsapp';
    whatsapp.href = 'https://wa.me/5587988281725';
    whatsapp.target = '_blank';
    whatsapp.innerHTML = '<i class="fab fa-whatsapp"></i> WhatsApp';
    
    // Opção de formulário
    const form = document.createElement('button');
    form.className = 'fc-option fc-form';
    form.innerHTML = '<i class="fas fa-envelope"></i> Sugestões';
    
    // Adicionar ao DOM
    menu.appendChild(whatsapp);
    menu.appendChild(form);
    container.appendChild(menu);
    container.appendChild(button);
    document.body.appendChild(container);
    
    // Overlay do formulário
    const overlay = document.createElement('div');
    overlay.className = 'fc-overlay';
    overlay.innerHTML = `
        <div class="fc-form-container">
            <div class="fc-form-header">
                <h3>Enviar Sugestão</h3>
                <button class="fc-form-close"><i class="fas fa-times"></i></button>
            </div>
            <form id="fcForm" class="fc-form-content">
                <div class="fc-form-group">
                    <label for="fc-name">Nome</label>
                    <input type="text" id="fc-name" name="name" class="fc-input" required>
                </div>
                <div class="fc-form-group">
                    <label for="fc-email">Email</label>
                    <input type="email" id="fc-email" name="email" class="fc-input" required>
                </div>
                <div class="fc-form-group">
                    <label for="fc-module">Módulo</label>
                    <select id="fc-module" name="module" class="fc-select" required>
                        <option value="" disabled selected>Selecione um módulo</option>
                        <option value="converter">Converter PDF</option>
                        <option value="juntar">Juntar PDF</option>
                        <option value="dividir">Dividir PDF</option>
                        <option value="comprimir">Comprimir PDF</option>
                        <option value="editar">Editar PDF</option>
                        <option value="apagar">Apagar Páginas</option>
                        <option value="extrair">Extrair Páginas</option>
                        <option value="rotacionar">Rotacionar PDF</option>
                        <option value="geral">Geral</option>
                    </select>
                </div>
                <div class="fc-form-group">
                    <label for="fc-content">Sua sugestão</label>
                    <textarea id="fc-content" name="content" class="fc-textarea" required placeholder="Descreva sua sugestão ou problema"></textarea>
                </div>
                <button type="submit" class="fc-submit">Enviar Sugestão</button>
            </form>
            <div id="fcMessage" class="fc-message" style="display:none;"></div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Configurar eventos
function setupEvents() {
    const button = document.querySelector('.fc-button');
    const menu = document.querySelector('.fc-menu');
    const formButton = document.querySelector('.fc-form');
    const overlay = document.querySelector('.fc-overlay');
    const closeButton = document.querySelector('.fc-form-close');
    const form = document.getElementById('fcForm');
    const message = document.getElementById('fcMessage');
    
    // Abrir/fechar menu
    button.addEventListener('click', () => {
        menu.classList.toggle('active');
        button.classList.toggle('active');
    });
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.fc-container')) {
            menu.classList.remove('active');
            button.classList.remove('active');
        }
    });
    
    // Abrir formulário
    formButton.addEventListener('click', () => {
        overlay.classList.add('active');
        menu.classList.remove('active');
        button.classList.remove('active');
    });
    
    // Fechar formulário
    closeButton.addEventListener('click', () => overlay.classList.remove('active'));
    
    // Fechar formulário ao clicar no overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
    
    // Enviar formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Dados do formulário
        const data = {
            name: document.getElementById('fc-name').value,
            email: document.getElementById('fc-email').value,
            module: document.getElementById('fc-module').value,
            content: document.getElementById('fc-content').value,
            date_created: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'pendente'
        };
        
        // Exibir mensagem de carregamento
        message.className = 'fc-message info';
        message.textContent = 'Enviando sua sugestão...';
        message.style.display = 'block';
        
        // Enviar para o servidor
        fetch('manutencao/process-suggestion.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Sucesso
                message.className = 'fc-message success';
                message.textContent = 'Obrigado! Sua sugestão foi recebida com sucesso.';
                form.reset();
                
                // Fechar formulário após 3s
                setTimeout(() => {
                    overlay.classList.remove('active');
                    message.style.display = 'none';
                }, 3000);
            } else {
                // Erro
                message.className = 'fc-message error';
                message.textContent = result.message || 'Ocorreu um erro. Tente novamente.';
            }
        })
        .catch(error => {
            // Erro de rede
            message.className = 'fc-message error';
            message.textContent = 'Falha na conexão. Verifique sua internet e tente novamente.';
        });
    });
}
