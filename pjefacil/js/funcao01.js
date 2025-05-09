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
    const fileInput = container.querySelector('#fileInput');
    const fileInfo = container.querySelector('#fileInfo');
    const controlPanel = container.querySelector('#controlPanel');
    
    // Aplicar ajustes de tema inicial
    applyThemeToElements();
    
    // Adicionar ouvinte para mudanças de tema
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'data-bs-theme') {
                applyThemeToElements();
            }
        });
    });
    
    // Observar mudanças no atributo data-bs-theme do documento
    observer.observe(document.documentElement, { attributes: true });
    
    // Configurar event listeners para funcionalidade de upload
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Configurar event listeners para botão de ação
    if (actionButton) {
        actionButton.addEventListener('click', handleAction);
    }
    
    /**
     * Aplica os ajustes necessários para o tema atual
     */
    function applyThemeToElements() {
        const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        
        // Ajusta a área de upload
        if (dropZone) {
            if (isDarkTheme) {
                dropZone.classList.remove('bg-light');
                dropZone.classList.add('bg-dark', 'text-light', 'border-secondary');
            } else {
                dropZone.classList.add('bg-light');
                dropZone.classList.remove('bg-dark', 'text-light', 'border-secondary');
            }
        }
        
        // Ajusta outros elementos com bg-light se necessário
        const lightBgElements = container.querySelectorAll('.bg-light');
        lightBgElements.forEach(element => {
            if (isDarkTheme) {
                element.classList.remove('bg-light');
                element.classList.add('bg-dark', 'text-light');
            } else {
                element.classList.add('bg-light');
                element.classList.remove('bg-dark', 'text-light');
            }
        });
        
        // Ajusta alertas e outros elementos conforme necessário
        const alerts = container.querySelectorAll('.alert');
        alerts.forEach(alert => {
            // A maioria dos alertas se adapta automaticamente, mas podemos fazer ajustes se necessário
        });
    }
    
    /**
     * Manipula evento de arquivo sendo arrastado sobre a área
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('border-primary');
    }
    
    /**
     * Manipula evento de arquivo deixando a área de arrasto
     */
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('border-primary');
    }
    
    /**
     * Manipula evento de soltar arquivos na área
     */
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('border-primary');
        
        const files = e.dataTransfer.files;
        processFiles(files);
    }
    
    /**
     * Manipula seleção de arquivos via dialog
     */
    function handleFileSelect(e) {
        const files = e.target.files;
        processFiles(files);
    }
    
    /**
     * Processa os arquivos selecionados
     */
    function processFiles(files) {
        if (files.length === 0) return;
        
        // Exibe informações dos arquivos
        let fileInfoHTML = '<div class="mt-3"><h6>Arquivos selecionados:</h6><ul class="list-group">';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const sizeInKB = Math.round(file.size / 1024);
            
            fileInfoHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas fa-file me-2"></i>
                        <span>${file.name}</span>
                    </div>
                    <span class="badge bg-primary rounded-pill">${sizeInKB} KB</span>
                </li>
            `;
        }
        
        fileInfoHTML += '</ul></div>';
        fileInfo.innerHTML = fileInfoHTML;
        
        // Mostrar painel de controle
        if (controlPanel) {
            controlPanel.classList.remove('d-none');
        }
        
        // Habilitar botão de ação
        if (actionButton) {
            actionButton.disabled = false;
        }
    }
    
    /**
     * Manipula o clique no botão de ação
     */
    function handleAction() {
        // Simulação de processamento
        showProcessingOverlay(true, 'Processando arquivos...');
        
        // Simulação de atraso de processamento
        setTimeout(() => {
            showProcessingOverlay(false);
            
            // Mostrar resultado
            if (resultArea) {
                resultArea.classList.remove('d-none');
            }
            
            // Mostrar mensagem de sucesso
            showMessage('Arquivos processados com sucesso!', 'success');
        }, 1500);
    }
    
    /**
     * Exibe uma mensagem de status
     */
    function showMessage(message, type = 'info') {
        if (!statusArea) return;
        
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        };
        
        const iconClass = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        
        statusArea.innerHTML = `
            <div class="alert ${alertClass[type] || 'alert-info'} d-flex align-items-center" role="alert">
                <i class="fas ${iconClass[type] || 'fa-info-circle'} me-2"></i>
                <div>${message}</div>
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