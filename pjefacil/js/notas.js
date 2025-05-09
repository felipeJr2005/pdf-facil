/**
 * Módulo para Função 01
 */

// Função de inicialização do módulo
export function initialize(container) {
    console.log('Módulo funcao01.js inicializado');
    
    // Elementos DOM
    const actionButton = container.querySelector('#actionButton');
    const resultArea = container.querySelector('#resultArea');
    const statusArea = container.querySelector('#statusArea');
    const exampleInput = container.querySelector('#exampleInput');
    const dropZone = container.querySelector('#dropZone');
    
    // Aplicar ajustes de tema inicial
    applyTheme();
    
    // Adicionar ouvinte para mudanças de tema
    const observer = new MutationObserver(() => applyTheme());
    observer.observe(document.documentElement, { attributes: true });
    
    // Configurar event listeners
    if (actionButton) {
        actionButton.addEventListener('click', handleAction);
    }
    
    /**
     * Ajusta elementos para o tema corrente
     */
    function applyTheme() {
        const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        
        // Ajustar classe de fundo para o tema atual
        if (dropZone) {
            if (isDarkTheme) {
                dropZone.classList.remove('bg-light');
                dropZone.classList.add('bg-dark', 'text-light');
            } else {
                dropZone.classList.add('bg-light');
                dropZone.classList.remove('bg-dark', 'text-light');
            }
        }
    }
    
    /**
     * Manipula o clique no botão de ação
     */
    function handleAction() {
        const inputValue = exampleInput ? exampleInput.value : '';
        
        // Validação simples
        if (inputValue && inputValue.trim() === '') {
            showMessage('Por favor, preencha o campo de exemplo.', 'error');
            return;
        }
        
        // Simulação de processamento
        showProcessingOverlay(true, 'Processando...');
        
        // Simulação de atraso de processamento
        setTimeout(() => {
            showProcessingOverlay(false);
            
            // Mostrar resultado
            if (resultArea) {
                resultArea.classList.remove('hidden');
            }
            
            // Mostrar mensagem de sucesso
            showMessage('Operação realizada com sucesso!', 'success');
        }, 1500);
    }
    
    /**
     * Exibe uma mensagem de status
     */
    function showMessage(message, type = 'info') {
        if (!statusArea) return;
        
        const iconClass = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        
        statusArea.innerHTML = `
            <div class="status-message ${type}">
                <i class="fas ${iconClass[type] || 'fa-info-circle'}"></i>
                ${message}
            </div>
        `;
        
        // Remover mensagem após 5 segundos
        setTimeout(() => {
            statusArea.innerHTML = '';
        }, 5000);
    }
    
    /**
     * Controla o overlay de processamento
     */
    function showProcessingOverlay(show, message = 'Processando...') {
        const processingOverlay = document.getElementById('processingOverlay');
        const processingText = document.getElementById('processingText');
        
        if (!processingOverlay) return;
        
        if (show) {
            if (processingText) {
                processingText.textContent = message;
            }
            processingOverlay.style.display = 'flex';
        } else {
            processingOverlay.style.display = 'none';
        }
    }
}

// Função de limpeza do módulo
export function cleanup() {
    console.log('Módulo funcao01.js descarregado');
    // Remover event listeners, limpar timeouts, etc.
}
