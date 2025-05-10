/**
 * Módulo para Notas
 * Sistema simples para edição, salvamento e impressão de notas
 */

// Função de inicialização do módulo
export function initialize(container) {
    console.log('Módulo notas.js inicializado');
    console.log('Container recebido:', container);
    
    // Elementos do DOM
    const editor = container.querySelector('#notas-editor');
    const clearBtn = container.querySelector('#clearBtn');
    const printBtn = container.querySelector('#printBtn');
    const saveBtn = container.querySelector('#saveBtn');
    const statusMessage = container.querySelector('#statusMessage');
    
    // Log para debug
    console.log('Elementos encontrados:', {
        editor: editor ? 'Sim' : 'Não',
        clearBtn: clearBtn ? 'Sim' : 'Não',
        printBtn: printBtn ? 'Sim' : 'Não',
        saveBtn: saveBtn ? 'Sim' : 'Não',
        statusMessage: statusMessage ? 'Sim' : 'Não'
    });
    
    // Verificar se os elementos foram encontrados
    if (!editor || !clearBtn || !printBtn || !saveBtn || !statusMessage) {
        console.error('Elementos necessários não encontrados no DOM');
        console.error('HTML do container:', container.innerHTML);
        return;
    }
    
    // Aplicar ajustes de tema inicial
    applyTheme();
    
    // Adicionar ouvinte para mudanças de tema
    const observer = new MutationObserver(() => applyTheme());
    observer.observe(document.documentElement, { attributes: true });
    
    // Carregar conteúdo salvo ao inicializar
    carregarConteudo();
    
    // Configurar event listeners - usando o método on para maior compatibilidade
    console.log('Configurando event listener para clearBtn (limpar)');
    clearBtn.onclick = function(e) {
        console.log('Botão limpar clicado!');
        limparEditor();
    };
    
    console.log('Configurando event listener para printBtn (imprimir)');
    printBtn.onclick = function(e) {
        console.log('Botão imprimir clicado!');
        imprimirNotas();
    };
    
    console.log('Configurando event listener para saveBtn (salvar)');
    saveBtn.onclick = function(e) {
        console.log('Botão salvar clicado!');
        salvarNotas();
    };
    
    // Adicionar evento para detectar se o editor está vazio ou não
    editor.addEventListener('input', verificarEditorVazio);
    
    // Adicionar suporte para colar texto e imagens
    editor.addEventListener('paste', gerenciarCola);
    
    // Verificar se o editor está vazio ao inicializar
    verificarEditorVazio();
    
    /**
     * Ajusta elementos para o tema corrente
     */
    function applyTheme() {
        const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        
        // Ajustar classes para o tema
        if (isDarkTheme) {
            editor.classList.add('bg-dark', 'text-light');
            editor.classList.remove('bg-light');
        } else {
            editor.classList.add('bg-light');
            editor.classList.remove('bg-dark', 'text-light');
        }
    }
    
    /**
     * Verifica se o editor está vazio e aplica atributo data-empty
     */
    function verificarEditorVazio() {
        // Verificar se há conteúdo (ignorando espaços em branco)
        const conteudo = editor.innerHTML.trim();
        const vazio = conteudo === '' || conteudo === '<br>' || conteudo === '<div><br></div>';
        
        // Aplicar atributo que será usado pelo CSS para exibir placeholder
        editor.setAttribute('data-empty', vazio ? 'true' : 'false');
    }
    
    /**
     * Gerencia o evento de colar conteúdo no editor
     */
    function gerenciarCola(event) {
        // Verificar se há itens de imagem no clipboard
        const clipboardData = event.clipboardData;
        const items = clipboardData?.items;
        
        // Se não houver items, permitir cola padrão
        if (!items || items.length === 0) return;
        
        let imagemColada = false;
        
        // Verificar cada item do clipboard
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // Se for uma imagem
            if (item.type.indexOf('image') !== -1) {
                event.preventDefault();
                imagemColada = true;
                
                const blob = item.getAsFile();
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Criar elemento de imagem
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.margin = '10px 0';
                    
                    // Inserir a imagem na posição do cursor
                    document.execCommand('insertHTML', false, img.outerHTML);
                    verificarEditorVazio();
                    
                    mostrarMensagem('Imagem adicionada com sucesso', 'success');
                };
                
                reader.readAsDataURL(blob);
                break;
            }
        }
        
        // Se não for uma imagem, permitir a cola padrão
        if (!imagemColada) {
            // Já tratamos as imagens, podemos deixar o comportamento padrão para texto
            // Não precisamos fazer nada aqui
        }
    }
    
    /**
     * Salva o conteúdo no localStorage
     */
    function salvarNotas() {
        try {
            console.log('Função salvarNotas chamada');
            
            // Obter o conteúdo do editor
            const conteudo = editor.innerHTML;
            
            // Verificar se está vazio
            if (conteudo.trim() === '' || conteudo === '<br>' || conteudo === '<div><br></div>') {
                mostrarMensagem('Não há conteúdo para salvar', 'warning');
                return;
            }
            
            // Salvar no localStorage
            localStorage.setItem('pjefacil-notas', conteudo);
            
            // Mostrar mensagem de sucesso
            mostrarMensagem('Notas salvas com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao salvar notas:', error);
            mostrarMensagem('Erro ao salvar as notas', 'danger');
        }
    }
    
    /**
     * Carrega o conteúdo salvo do localStorage
     */
    function carregarConteudo() {
        try {
            console.log('Carregando conteúdo salvo');
            
            // Obter conteúdo do localStorage
            const conteudo = localStorage.getItem('pjefacil-notas');
            
            // Se houver conteúdo, colocar no editor
            if (conteudo) {
                editor.innerHTML = conteudo;
                verificarEditorVazio();
                console.log('Conteúdo carregado com sucesso');
            } else {
                console.log('Nenhum conteúdo salvo encontrado');
            }
        } catch (error) {
            console.error('Erro ao carregar notas:', error);
            mostrarMensagem('Erro ao carregar as notas salvas', 'danger');
        }
    }
    
    /**
     * Limpa o conteúdo do editor
     */
    function limparEditor() {
        console.log('Função limparEditor chamada');
        
        // Confirmação antes de limpar
        if (editor.innerHTML.trim() !== '' && 
            editor.innerHTML !== '<br>' && 
            editor.innerHTML !== '<div><br></div>') {
            
            if (!confirm('Tem certeza que deseja limpar todas as notas?')) {
                console.log('Limpeza cancelada pelo usuário');
                return;
            }
        }
        
        // Limpar o editor
        editor.innerHTML = '';
        verificarEditorVazio();
        
        // Mostrar mensagem
        mostrarMensagem('Notas limpas com sucesso', 'info');
        console.log('Editor limpo com sucesso');
    }
    
    /**
     * Imprime o conteúdo das notas
     */
    function imprimirNotas() {
        console.log('Função imprimirNotas chamada');
        
        // Verificar se há conteúdo para imprimir
        if (editor.innerHTML.trim() === '' || 
            editor.innerHTML === '<br>' || 
            editor.innerHTML === '<div><br></div>') {
            
            mostrarMensagem('Não há conteúdo para imprimir', 'warning');
            return;
        }
        
        try {
            // Criar uma janela de impressão
            const janelaImpressao = window.open('', '_blank', 'width=800,height=600');
            
            // Conteúdo da janela de impressão
            janelaImpressao.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>PjeFácil - Notas</title>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                            line-height: 1.6;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                        @media print {
                            body {
                                margin: 15mm;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h1 style="text-align: center; margin-bottom: 20px;">Notas - PjeFácil</h1>
                    <div>${editor.innerHTML}</div>
                    <div style="text-align: right; margin-top: 30px; font-style: italic; font-size: 0.8em;">
                        Impresso em ${new Date().toLocaleString()}
                    </div>
                </body>
                </html>
            `);
            
            // Fechar o documento para finalizar a escrita
            janelaImpressao.document.close();
            
            // Chamar o método de impressão depois que o documento for carregado
            janelaImpressao.onload = function() {
                janelaImpressao.print();
                // janelaImpressao.close(); // Descomente para fechar automaticamente após imprimir
            };
            
            mostrarMensagem('Enviado para impressão', 'success');
        } catch (error) {
            console.error('Erro ao imprimir:', error);
            mostrarMensagem('Erro ao preparar impressão', 'danger');
        }
    }
    
    /**
     * Exibe uma mensagem de status
     */
    function mostrarMensagem(texto, tipo = 'info') {
        console.log(`Mensagem: ${texto} (${tipo})`);
        
        // Remover qualquer classe anterior
        statusMessage.classList.remove('alert-success', 'alert-warning', 'alert-danger', 'alert-info', 'd-none');
        
        // Adicionar classe de acordo com o tipo
        statusMessage.classList.add(`alert-${tipo}`);
        
        // Definir o texto da mensagem
        statusMessage.innerHTML = texto;
        
        // Mostrar a mensagem
        statusMessage.classList.remove('d-none');
        
        // Esconder a mensagem após alguns segundos
        setTimeout(() => {
            statusMessage.classList.add('d-none');
        }, 3000);
    }
}

// Exportar diretamente a função de limpar para teste
export function limparEditor() {
    console.log('Função limparEditor externa chamada - esta é apenas uma versão para diagnóstico');
    alert('A função de limpar foi chamada diretamente, mas precisa ser chamada a partir do contexto correto.');
}

// Função de limpeza do módulo
export function cleanup() {
    console.log('Módulo notas.js descarregado');
    // Remover event listeners e limpar referências
}