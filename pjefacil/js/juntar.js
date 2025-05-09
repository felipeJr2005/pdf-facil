// js/juntar.js

// Inicialização do módulo
export function initialize(container) {
    // Configuração inicial do PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Elementos do DOM (agora dentro do container)
    const elements = {
        dropZone: container.querySelector('#dropZone'),
        fileInput: container.querySelector('#fileInput'),
        pdfList: container.querySelector('#pdfList'),
        mergeButton: container.querySelector('#mergeButton'),
        mergeButtonText: container.querySelector('#mergeButtonText'),
        statusArea: container.querySelector('#statusArea'),
        pdfListCard: container.querySelector('#pdfListCard'),
        fileInfo: container.querySelector('#fileInfo'),
        processingOverlay: document.getElementById('processingOverlay'), // Agora global
        resultArea: container.querySelector('#resultArea'),
        downloadLink: container.querySelector('#downloadLink'),
        downloadText: container.querySelector('#downloadText'),
        processingText: document.getElementById('processingText'), // Agora global
        controlPanel: container.querySelector('#controlPanel'),
        addMoreCard: container.querySelector('#addMoreCard'),
        orderOption: container.querySelector('#orderOption'),
        totalFilesCount: container.querySelector('#totalFilesCount'),
        addBookmarks: container.querySelector('#addBookmarks'),
        mergedFilesCount: container.querySelector('#mergedFilesCount'),
        totalPagesCount: container.querySelector('#totalPagesCount'),
        finalSize: container.querySelector('#finalSize')
    };
    
    // Estado da aplicação
    const state = {
        fileArray: [],
        isProcessing: false,
        mergedPdfBlob: null,
        hasMerged: false,
        addingMoreFiles: false
    };

    // Configurar Sortable para arrastar e reorganizar
    new Sortable(elements.pdfList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onStart: function() {
            elements.pdfList.classList.add('sortable-drag-active');
        },
        onEnd: function(evt) {
            const item = state.fileArray[evt.oldIndex];
            state.fileArray.splice(evt.oldIndex, 1);
            state.fileArray.splice(evt.newIndex, 0, item);
            elements.pdfList.classList.remove('sortable-drag-active');
            updateListOrder();
            
            // Atualizar a interface para indicar que a ordem foi alterada manualmente
            elements.orderOption.value = 'manual';
        }
    });

    // Funções de utilidade
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(2) + ' MB';
    }
    
    // Função para determinar o tipo de documento
    function getDocumentType(fileName) {
        const lowerName = fileName.toLowerCase();
        
        // Definir palavras-chave para cada tipo de documento
        const keywords = {
            calculo: ['calculo', 'calculos', 'custas', 'custa', 'valor', 'valores'],
            cartaGuia: ['carta', 'guia', 'carta guia', 'cartaguia'],
            transitoJulgado: ['transito', 'julgado', 'transito em julgado', 'transitado', 'certidão', 'certidao', 'trânsito'],
            acordao: ['acordao', 'acórdão', 'acordão', 'acórdãos', 'acordaos'],
            sentenca: ['sentença', 'sentenca', 'sentencas', 'sentenças', 'decisao', 'decisão', 'decisoes', 'decisões'],
            denuncia: ['denuncia', 'denúncia', 'denuncias', 'denúncias']
        };
        
        // Atribuir prioridades (menor = maior prioridade)
        const documentPriority = {
            calculo: 1,
            cartaGuia: 2,
            transitoJulgado: 3,
            acordao: 4,
            sentenca: 5,
            denuncia: 6,
            default: 99 // Para documentos que não se encaixam em nenhuma categoria
        };
        
        // Verificar qual tipo de documento corresponde ao nome do arquivo
        for (const [docType, keywordList] of Object.entries(keywords)) {
            for (const keyword of keywordList) {
                if (lowerName.includes(keyword)) {
                    console.log(`Arquivo ${fileName} identificado como: ${docType}`);
                    return { type: docType, priority: documentPriority[docType] };
                }
            }
        }
        
        console.log(`Arquivo ${fileName} não identificado, usando prioridade padrão`);
        return { type: 'default', priority: documentPriority.default };
    }
    
    function showProcessing(show, message = 'Processando PDFs...') {
        state.isProcessing = show;
        if (show) {
            elements.processingText.textContent = message;
            elements.processingOverlay.style.display = 'flex';
        } else {
            elements.processingOverlay.style.display = 'none';
        }
    }
    
    function showMessage(type, message, duration = 5000) {
        const iconClass = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        
        elements.statusArea.innerHTML = `
            <div class="status-message ${type}">
                <i class="fas ${iconClass[type] || 'fa-info-circle'}"></i>
                ${message}
            </div>`;
        
        if (duration > 0) {
            setTimeout(() => {
                elements.statusArea.innerHTML = '';
            }, duration);
        }
    }
    
    function resetState() {
        elements.resultArea.classList.add('hidden');
        elements.statusArea.innerHTML = '';
        state.isProcessing = false;
        state.hasMerged = false;
        updateMergeButtonText();
    }
    
    function updateMergeButtonText() {
        elements.mergeButtonText.textContent = state.hasMerged ? 'Refazer Junção' : 'Juntar PDFs';
    }
    
    function cleanupResources() {
        if (elements.downloadLink.href && elements.downloadLink.href !== '#') {
            URL.revokeObjectURL(elements.downloadLink.href);
            elements.downloadLink.href = '#';
        }
        
        if (state.mergedPdfBlob) {
            URL.revokeObjectURL(state.mergedPdfBlob);
            state.mergedPdfBlob = null;
        }
    }
    
    function cleanupState() {
        state.fileArray = [];
        elements.pdfList.innerHTML = '';
        elements.totalFilesCount.textContent = '0';
        elements.pdfListCard.classList.add('hidden');
        elements.controlPanel.classList.add('hidden');
        elements.resultArea.classList.add('hidden');
        elements.mergeButton.disabled = true;
        elements.statusArea.innerHTML = '';
        state.isProcessing = false;
        elements.fileInfo.innerHTML = '';
        cleanupResources();
        elements.addBookmarks.checked = false;
        elements.orderOption.value = 'manual';
        state.hasMerged = false;
        updateMergeButtonText();
        
        elements.fileInfo.innerHTML = `
            <div class="status-message info">
                <i class="fas fa-info-circle"></i>
                Todos os arquivos foram removidos. Você pode adicionar novos PDFs agora.
            </div>`;
    }
    
    function refreshFileList() {
        elements.pdfList.innerHTML = '';
        state.fileArray.forEach(file => {
            addPdfToList(file);
        });
        updateListOrder();
        elements.totalFilesCount.textContent = state.fileArray.length;
    }
    
    function updateMergeButton() {
        elements.mergeButton.disabled = state.fileArray.length < 2;
    }
    
    function updateListOrder() {
        const inputGroups = elements.pdfList.querySelectorAll('.input-group');
        inputGroups.forEach((item, index) => {
            const fileIndex = item.querySelector('.file-index');
            if (fileIndex) fileIndex.textContent = `${index + 1}`;
        });
    }
    
    function getOrderName(orderType) {
        switch(orderType) {
            case 'name': return 'nome';
            case 'size': return 'tamanho';
            case 'date': return 'data';
            case 'cartaGuia': return 'Carta Guia (documentos judiciais)';
            default: return 'ordem manual';
        }
    }
    
    // Manipulação de arquivos PDF
    async function validatePDF(file) {
        if (file.type === 'application/pdf') return true;
        if (file.name.toLowerCase().endsWith('.pdf')) return true;
        
        try {
            // Verificar assinatura do arquivo (PDF começa com %PDF)
            const reader = new FileReader();
            const headerPromise = new Promise((resolve, reject) => {
                reader.onload = () => {
                    const arrayBuffer = reader.result;
                    const bytes = new Uint8Array(arrayBuffer).slice(0, 10);
                    const header = new TextDecoder('utf-8').decode(bytes);
                    resolve(header);
                };
                reader.onerror = reject;
            });
            
            reader.readAsArrayBuffer(file.slice(0, 10));
            const header = await headerPromise;
            
            if (header.includes('%PDF')) return true;
            
            // Tentar validar com PDF.js como último recurso
            const arrayBuffer = await file.arrayBuffer();
            const pdfJsDoc = await pdfjsLib.getDocument({data: new Uint8Array(arrayBuffer)}).promise;
            return pdfJsDoc.numPages > 0;
        } catch (error) {
            console.error(`Erro na validação: ${error.message}`);
            return false;
        }
    }
    
    function addPdfToList(file) {
        const itemGroup = document.createElement('div');
        itemGroup.className = 'input-group active mb-3';
        itemGroup.style.borderBottom = '1px solid var(--color-gray-200)';
        itemGroup.style.paddingBottom = '12px';
        
        itemGroup.innerHTML = `
            <div class="relative w-full flex items-center">
                <span class="file-index absolute left-2 z-10" style="color: var(--color-primary); font-weight: bold;"></span>
                <input type="text" class="input-field pl-8" style="border: none; background-color: var(--color-gray-50);" value="${file.name} (${formatFileSize(file.size)})" readonly>
                <button class="btn p-1 absolute right-2" onclick="pdfTools.removePdf(this)" title="Remover arquivo">
                    <i class="fas fa-trash-alt" style="color: var(--color-error);"></i>
                </button>
            </div>
        `;
        
        elements.pdfList.appendChild(itemGroup);
    }
    
    function applyOrdering() {
        if (state.fileArray.length <= 1) return;
        
        const sortType = elements.orderOption.value;
        
        if (sortType === 'name') {
            state.fileArray.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortType === 'size') {
            state.fileArray.sort((a, b) => b.size - a.size);
        } else if (sortType === 'date') {
            state.fileArray.sort((a, b) => b.lastModified - a.lastModified);
        } else if (sortType === 'cartaGuia') {
            // Ordenar por tipo de documento judicial
            state.fileArray.sort((a, b) => {
                const typeA = getDocumentType(a.name);
                const typeB = getDocumentType(b.name);
                return typeA.priority - typeB.priority;
            });
        }
        
        refreshFileList();
        showMessage('info', `Arquivos ordenados por ${getOrderName(sortType)}.`);
    }
    
    async function handleFiles(files) {
        if (files.length === 0) return;
        
        resetState();
        elements.resultArea.classList.add('hidden');
        const validationPromises = Array.from(files).map(file => validatePDF(file));
        
        try {
            showProcessing(true, 'Validando arquivos...');
            const validationResults = await Promise.all(validationPromises);
            
            let validPdfs = 0;
            let invalidFiles = 0;
            
            Array.from(files).forEach((file, index) => {
                if (validationResults[index]) {
                    // Evitar duplicatas verificando nome e tamanho
                    if (!state.fileArray.some(f => f.name === file.name && f.size === file.size)) {
                        state.fileArray.push(file);
                        addPdfToList(file);
                        validPdfs++;
                    }
                } else {
                    invalidFiles++;
                }
            });
            
            elements.totalFilesCount.textContent = state.fileArray.length;
            showProcessing(false);
            
            if (validPdfs > 0) {
                elements.pdfListCard.classList.remove('hidden');
                elements.controlPanel.classList.remove('hidden');
                updateMergeButton();
                updateListOrder();
                
                let message = `${validPdfs} ${validPdfs > 1 ? 'arquivos válidos adicionados' : 'arquivo válido adicionado'} - `;
                message += `<span style="color: var(--color-primary); font-weight: 500;">Para resetar insira novamente os arquivos</span>`;
                
                if (invalidFiles > 0) {
                    message += ` (${invalidFiles} ${invalidFiles > 1 ? 'arquivos ignorados' : 'arquivo ignorado'} por não serem PDF válidos)`;
                }
                
                elements.fileInfo.innerHTML = `
                    <div class="status-message success">
                        <i class="fas fa-check-circle"></i>
                        ${message}
                    </div>`;
                    
                if (elements.orderOption.value !== 'manual' && validPdfs > 0) {
                    applyOrdering();
                }
            } else if (invalidFiles > 0) {
                elements.fileInfo.innerHTML = `
                    <div class="status-message error">
                        <i class="fas fa-exclamation-circle"></i>
                        ${invalidFiles > 1 ? 'Os arquivos selecionados não são PDFs válidos' : 'O arquivo selecionado não é um PDF válido'}
                    </div>`;
            }
        } catch (error) {
            console.error('Erro ao validar arquivos:', error);
            showProcessing(false);
            
            elements.fileInfo.innerHTML = `
                <div class="status-message error">
                    <i class="fas fa-exclamation-circle"></i>
                    Erro ao validar arquivos: ${error.message}
                </div>`;
        }
    }
    
    async function mergePDFs() {
        if (state.isProcessing) return;
        
        if (state.fileArray.length < 2) {
            showMessage('error', 'É necessário selecionar pelo menos 2 arquivos PDF para juntar.');
            return;
        }
        
        try {
            state.isProcessing = true;
            showProcessing(true, 'Iniciando o processo de junção...');
            
            const mergedPdf = await PDFLib.PDFDocument.create();
            let totalPages = 0;
            
            // Primeiro contamos o total de páginas
            for (let i = 0; i < state.fileArray.length; i++) {
                const file = state.fileArray[i];
                showProcessing(true, `Analisando arquivo ${i+1}/${state.fileArray.length}: ${file.name}`);
                const fileBuffer = await file.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(fileBuffer);
                totalPages += pdf.getPageCount();
            }
            
            // Processo de junção
            for (let i = 0; i < state.fileArray.length; i++) {
                const file = state.fileArray[i];
                showProcessing(true, `Juntando PDF ${i+1}/${state.fileArray.length}: ${file.name}`);
                
                const fileBuffer = await file.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(fileBuffer);
                
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                
                for (let j = 0; j < pages.length; j++) {
                    const page = pages[j];
                    mergedPdf.addPage(page);
                    
                    // Lógica de marcadores (bookmarks)
                    if (elements.addBookmarks.checked && j === 0) {
                        console.log(`Marcador seria adicionado para: ${file.name}`);
                    }
                }
            }
            
            showProcessing(true, 'Finalizando e preparando o download...');
            const mergedPdfBytes = await mergedPdf.save({});
            
            state.mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const downloadUrl = URL.createObjectURL(state.mergedPdfBlob);
            
            elements.downloadText.textContent = `Baixar PDF juntados (${formatFileSize(mergedPdfBytes.length)})`;
            elements.downloadLink.href = downloadUrl;
            elements.downloadLink.download = "documentos_unidos.pdf";
            
            elements.mergedFilesCount.textContent = state.fileArray.length;
            elements.totalPagesCount.textContent = totalPages;
            elements.finalSize.textContent = formatFileSize(mergedPdfBytes.length);
            
            state.hasMerged = true;
            updateMergeButtonText();
            elements.resultArea.classList.remove('hidden');
            
            // Scroll para a área de resultado
            elements.resultArea.scrollIntoView({ behavior: 'smooth' });
            
            // Liberar URL após download
            elements.downloadLink.addEventListener('click', () => {
                setTimeout(() => {
                    URL.revokeObjectURL(downloadUrl);
                }, 1000);
            });
        } catch (error) {
            console.error('Erro ao unir PDFs:', error);
            showMessage('error', `Erro ao unir PDFs: ${error.message || 'Ocorreu um erro inesperado'}`, 0);
        } finally {
            state.isProcessing = false;
            showProcessing(false);
        }
    }
    
    // Função exposta globalmente para remover PDF - agora através do namespace pdfTools
    // Precisamos expor esta função globalmente para os botões funcionarem
    if (!window.pdfTools) window.pdfTools = {};
    window.pdfTools.removePdf = function(button) {
        const itemGroup = button.closest('.input-group');
        const index = Array.from(elements.pdfList.querySelectorAll('.input-group')).indexOf(itemGroup);
        
        if (state.isProcessing) {
            showMessage('warning', 'Aguarde o processamento atual terminar antes de remover arquivos.');
            return;
        }
        
        state.fileArray.splice(index, 1);
        itemGroup.remove();
        elements.totalFilesCount.textContent = state.fileArray.length;
        
        if (state.fileArray.length === 0) {
            elements.pdfListCard.classList.add('hidden');
            elements.controlPanel.classList.add('hidden');
        }
        
        updateMergeButton();
        updateListOrder();
    };
    
    // ======== CONFIGURAÇÃO DE EVENT LISTENERS ========
    
    // Event Listeners para Drag and Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        elements.dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        elements.dropZone.addEventListener(eventName, () => {
            elements.dropZone.classList.add('drag-over');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        elements.dropZone.addEventListener(eventName, () => {
            elements.dropZone.classList.remove('drag-over');
        });
    });

    // O drop sempre limpa o estado primeiro (comportamento padrão esperado)
    elements.dropZone.addEventListener('drop', (e) => {
        state.addingMoreFiles = false;
        cleanupState();
        handleFiles(e.dataTransfer.files);
    });

    // O clique na área de drop sempre limpa o estado primeiro
    elements.dropZone.addEventListener('click', () => {
        state.addingMoreFiles = false;
        cleanupState();
        elements.fileInput.click();
    });
    
    // O card para adicionar mais NÃO limpa o estado
    elements.addMoreCard.addEventListener('click', () => {
        state.addingMoreFiles = true;
        
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.multiple = true;
        tempInput.accept = 'application/pdf,.pdf';
        
        tempInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
        
        tempInput.click();
    });
    
    // Listener normal do input file
    elements.fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Aplicar ordenação AUTOMATICAMENTE quando a seleção mudar
    elements.orderOption.addEventListener('change', () => {
        applyOrdering();
    });
    
    // Evento para botão de junção
    elements.mergeButton.addEventListener('click', mergePDFs);

    console.log('Módulo de junção de PDFs inicializado com sucesso!');
}

// Função de limpeza - será chamada quando o usuário navegar para outra página
export function cleanup() {
    if (window.pdfTools && window.pdfTools.removePdf) {
        delete window.pdfTools.removePdf;
    }
    
    // Limpar quaisquer URLs de objetos criados
    const downloadLink = document.querySelector('#downloadLink');
    if (downloadLink && downloadLink.href && downloadLink.href !== '#') {
        URL.revokeObjectURL(downloadLink.href);
    }
    
    console.log('Módulo de junção de PDFs descarregado.');
}