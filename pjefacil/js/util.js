/**
 * Módulo de utilitários compartilhados
 */
const UtilModule = (function() {
    // Cache simples em memória
    const cache = new Map();
    
    /**
     * Gera um hash simples para uso como chave de cache
     * @param {string} texto - Texto para gerar hash
     * @returns {number} - Hash numérico
     */
    function hashTexto(texto) {
        let hash = 0;
        for (let i = 0; i < texto.length; i++) {
            const char = texto.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return hash;
    }
    
    /**
     * Atualiza estatísticas de texto em um elemento
     * @param {string} texto - Texto para analisar
     * @param {string} elementId - ID do elemento para mostrar estatísticas
     */
    function atualizarEstatisticasTexto(texto, elementId) {
        const statsDiv = document.getElementById(elementId);
        if (!statsDiv) return;
        
        const caracteres = texto.length;
        const palavras = texto.split(/\s+/).filter(word => word.length > 0).length;
        
        statsDiv.textContent = `Caracteres: ${caracteres} | Palavras: ${palavras}`;
    }
    
    /**
     * Limpa e otimiza texto
     * @param {string} texto - Texto para limpar
     * @returns {string} - Texto limpo e otimizado
     */
    function limparTexto(texto) {
        if (!texto.trim()) {
            return texto;
        }
        
        // Realizar limpezas mais agressivas no texto:
        let textoLimpo = texto
            // Converter quebras de linha para espaços
            .replace(/[\r\n]+/g, ' ')
            // Remover múltiplos espaços em branco
            .replace(/\s+/g, ' ')
            // Remover espaços no início e fim
            .trim();
        
        // Tratamento especial para preservar estrutura básica do documento
        // Adicionar quebra de linha apenas após pontuação final de frases
        textoLimpo = textoLimpo
            .replace(/\.\s+([A-Z])/g, '.\n$1')
            .replace(/\?\s+([A-Z])/g, '?\n$1')
            .replace(/\!\s+([A-Z])/g, '!\n$1');
        
        return textoLimpo;
    }
    
    /**
     * Carrega uma página HTML em um elemento modal
     * @param {string} url - URL da página a ser carregada
     * @param {string} titulo - Título para o modal
     */
    function carregarEmModal(url, titulo) {
        // Criar ou obter o modal
        let modal = document.getElementById('modal-container');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-container';
            modal.className = 'modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            const closeButton = document.createElement('span');
            closeButton.className = 'close-modal';
            closeButton.innerHTML = '&times;';
            closeButton.onclick = function() {
                modal.style.display = 'none';
            };
            
            const modalHeader = document.createElement('div');
            modalHeader.className = 'modal-header';
            
            const modalTitle = document.createElement('h2');
            modalTitle.id = 'modal-title';
            
            const modalBody = document.createElement('div');
            modalBody.id = 'modal-body';
            modalBody.className = 'modal-body';
            
            modalHeader.appendChild(modalTitle);
            modalHeader.appendChild(closeButton);
            
            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Fechar ao clicar fora do conteúdo
            window.onclick = function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        }
        
        // Atualizar título
        document.getElementById('modal-title').textContent = titulo;
        
        // Carregar conteúdo
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Extrair o conteúdo entre as tags <body> </body>
                const bodyContent = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
                const content = bodyContent ? bodyContent[1] : html;
                
                document.getElementById('modal-body').innerHTML = content;
                
                // Mostrar o modal
                modal.style.display = 'block';
                
                // Inicializar scripts na página carregada
                const scripts = document.getElementById('modal-body').querySelectorAll('script');
                scripts.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar página:', error);
                document.getElementById('modal-body').innerHTML = `
                    <div class="error">
                        Erro ao carregar conteúdo: ${error.message}
                    </div>
                `;
                modal.style.display = 'block';
            });
    }
    
    /**
     * Exibe uma notificação temporária
     * @param {string} mensagem - Mensagem para exibir
     * @param {string} tipo - Tipo de notificação (success, error, info)
     * @param {number} duracao - Duração em ms para exibir notificação (padrão: 3000ms)
     */
    function mostrarNotificacao(mensagem, tipo = 'info', duracao = 3000) {
        // Remover notificação existente, se houver
        const notificacaoExistente = document.getElementById('notificacao-toast');
        if (notificacaoExistente) {
            document.body.removeChild(notificacaoExistente);
        }
        
        // Definir cor com base no tipo
        let corFundo, corTexto;
        switch (tipo) {
            case 'success':
                corFundo = '#27ae60';
                corTexto = 'white';
                break;
            case 'error':
                corFundo = '#e74c3c';
                corTexto = 'white';
                break;
            default: // info
                corFundo = '#3498db';
                corTexto = 'white';
                break;
        }
        
        // Criar elemento de notificação
        const toast = document.createElement('div');
        toast.id = 'notificacao-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = corFundo;
        toast.style.color = corTexto;
        toast.style.padding = '15px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        toast.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        toast.textContent = mensagem;
        
        document.body.appendChild(toast);
        
        // Remover após duração especificada
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, duracao);
    }
    
    // Interface pública do módulo
    return {
        cache: cache,
        hashTexto: hashTexto,
        atualizarEstatisticasTexto: atualizarEstatisticasTexto,
        limparTexto: limparTexto,
        carregarEmModal: carregarEmModal,
        mostrarNotificacao: mostrarNotificacao
    };
})();
