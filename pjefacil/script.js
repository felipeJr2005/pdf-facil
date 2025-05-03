document.addEventListener('DOMContentLoaded', function() {
    // Inicialização do editor
    const editor = document.getElementById('editor');
    const buttons = document.querySelectorAll('.toolbar button');
    const fontSizeSelect = document.getElementById('fontSize');
    
    // Limpando o texto inicial
    editor.addEventListener('focus', function() {
        if (editor.textContent === 'Digite seu texto aqui...') {
            editor.textContent = '';
        }
    });

    // Implementação dos botões da barra de ferramentas
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const command = this.id;
            
            switch(command) {
                case 'save':
                    saveContent();
                    break;
                case 'load':
                    loadContent();
                    break;
                case 'clear':
                    clearContent();
                    break;
                default:
                    document.execCommand(command, false, null);
            }
        });
    });

    // Implementação do seletor de tamanho de fonte
    fontSizeSelect.addEventListener('change', function() {
        document.execCommand('fontSize', false, this.value);
    });

    // Funções de salvar, carregar e limpar
    function saveContent() {
        localStorage.setItem('editorContent', editor.innerHTML);
        alert('Conteúdo salvo com sucesso!');
    }

    function loadContent() {
        const savedContent = localStorage.getItem('editorContent');
        if (savedContent) {
            editor.innerHTML = savedContent;
        } else {
            alert('Nenhum conteúdo salvo encontrado.');
        }
    }

    function clearContent() {
        if (confirm('Tem certeza que deseja limpar todo o conteúdo?')) {
            editor.innerHTML = '<p>Digite seu texto aqui...</p>';
        }
    }

    // Implementação dos botões de ação usando Fetch API
    const btnCumprirAudiencia = document.getElementById('btn-cumprir-audiencia');
    const btnCartaGuia = document.getElementById('btn-carta-guia');
    const conteudoDinamico = document.getElementById('conteudo-dinamico');
    
    // Cache para conteúdos já carregados
    const conteudoCache = {};

    // Função para carregar conteúdo usando Fetch API
    async function carregarConteudo(arquivo) {
        // Verifica se o conteúdo já está em cache
        if (conteudoCache[arquivo]) {
            return conteudoCache[arquivo];
        }
        
        try {
            const resposta = await fetch(arquivo);
            
            if (!resposta.ok) {
                throw new Error(`Erro ao carregar ${arquivo}: ${resposta.status} ${resposta.statusText}`);
            }
            
            const html = await resposta.text();
            
            // Armazena no cache para uso futuro
            conteudoCache[arquivo] = html;
            
            return html;
        } catch (erro) {
            console.error('Erro ao carregar o conteúdo:', erro);
            return `<div class="erro">Erro ao carregar o conteúdo: ${erro.message}</div>`;
        }
    }

    // Função para exibir conteúdo no container
    async function exibirConteudo(arquivo) {
        // Mostra indicador de carregamento
        conteudoDinamico.style.display = 'block';
        conteudoDinamico.innerHTML = '<div class="carregando">Carregando...</div>';
        
        // Carrega o conteúdo
        const html = await carregarConteudo(arquivo);
        
        // Exibe o conteúdo
        conteudoDinamico.innerHTML = html;
        
        // Inicializa funcionalidades específicas após carregamento
        if (arquivo === 'cumprir-audiencia.html') {
            inicializarFuncionalidadesAudiencia();
        } else if (arquivo === 'carta-guia.html') {
            inicializarFuncionalidadesCarta();
        }
    }

    // Event listeners para os botões
    btnCumprirAudiencia.addEventListener('click', function() {
        exibirConteudo('cumprir-audiencia.html');
    });

    btnCartaGuia.addEventListener('click', function() {
        exibirConteudo('carta-guia.html');
    });
    
    // Funções para inicializar funcionalidades após carregamento
    function inicializarFuncionalidadesAudiencia() {
        const btnGerarTexto = document.getElementById('gerar-texto-audiencia');
        const btnLimpar = document.getElementById('limpar-audiencia');
        const resultadoAudiencia = document.getElementById('resultado-audiencia');
        
        if (btnGerarTexto) {
            btnGerarTexto.addEventListener('click', function() {
                // Coleta os valores do formulário
                const dataAudiencia = document.getElementById('data-audiencia').value;
                const numeroProcesso = document.getElementById('numero-processo').value;
                const nomeCliente = document.getElementById('nome-cliente').value;
                const tipoAudiencia = document.getElementById('tipo-audiencia').value;
                const localAudiencia = document.getElementById('local-audiencia').value;
                const observacoes = document.getElementById('observacoes').value;
                
                // Formata a data para exibição
                const dataFormatada = dataAudiencia ? new Date(dataAudiencia).toLocaleDateString('pt-BR') : '';
                
                // Gera o texto
                let textoGerado = `
                    <h3>Informações da Audiência</h3>
                    <p><strong>Data:</strong> ${dataFormatada}</p>
                    <p><strong>Processo:</strong> ${numeroProcesso}</p>
                    <p><strong>Cliente:</strong> ${nomeCliente}</p>
                    <p><strong>Tipo de Audiência:</strong> ${document.getElementById('tipo-audiencia').options[document.getElementById('tipo-audiencia').selectedIndex].text}</p>
                    <p><strong>Local:</strong> ${localAudiencia}</p>
                    <p><strong>Observações:</strong> ${observacoes}</p>
                `;
                
                // Exibe o resultado
                resultadoAudiencia.innerHTML = textoGerado;
                resultadoAudiencia.style.display = 'block';
            });
        }
        
        if (btnLimpar) {
            btnLimpar.addEventListener('click', function() {
                // Limpa os campos do formulário
                document.getElementById('data-audiencia').value = '';
                document.getElementById('numero-processo').value = '';
                document.getElementById('nome-cliente').value = '';
                document.getElementById('tipo-audiencia').selectedIndex = 0;
                document.getElementById('local-audiencia').value = '';
                document.getElementById('observacoes').value = '';
                
                // Esconde o resultado
                resultadoAudiencia.style.display = 'none';
            });
        }
    }
    
    function inicializarFuncionalidadesCarta() {
        const btnGerarCarta = document.getElementById('gerar-carta');
        const btnLimparCarta = document.getElementById('limpar-carta');
        const resultadoCarta = document.getElementById('resultado-carta');
        
        if (btnGerarCarta) {
            btnGerarCarta.addEventListener('click', function() {
                // Coleta os valores do formulário
                const dataCarta = document.getElementById('data-carta').value;
                const destinatario = document.getElementById('destinatario').value;
                const endereco = document.getElementById('endereco-destinatario').value;
                const referencia = document.getElementById('numero-referencia').value;
                const assunto = document.getElementById('assunto').value;
                const conteudo = document.getElementById('conteudo-carta').value;
                const remetente = document.getElementById('remetente').value;
                const cargo = document.getElementById('cargo-remetente').value;
                
                // Formata a data para exibição
                const dataFormatada = dataCarta ? new Date(dataCarta).toLocaleDateString('pt-BR') : '';
                
                // Gera o texto da carta
                let cartaGerada = `
                    <div class="carta">
                        <div class="cabecalho-carta">
                            <p class="data-carta">${dataFormatada}</p>
                            
                            <div class="destinatario">
                                <p>${destinatario}</p>
                                <p>${endereco.replace(/\n/g, '<br>')}</p>
                            </div>
                            
                            <p class="referencia">Ref: ${referencia}</p>
                            
                            <p class="assunto"><strong>Assunto:</strong> ${assunto}</p>
                        </div>
                        
                        <div class="corpo-carta">
                            <p>${conteudo.replace(/\n/g, '<br>')}</p>
                        </div>
                        
                        <div class="assinatura">
                            <p>Atenciosamente,</p>
                            <p class="remetente">${remetente}</p>
                            <p class="cargo">${cargo}</p>
                        </div>
                    </div>
                `;
                
                // Exibe o resultado
                resultadoCarta.innerHTML = cartaGerada;
                resultadoCarta.style.display = 'block';
            });
        }
        
        if (btnLimparCarta) {
            btnLimparCarta.addEventListener('click', function() {
                // Limpa os campos do formulário
                document.getElementById('data-carta').value = '';
                document.getElementById('destinatario').value = '';
                document.getElementById('endereco-destinatario').value = '';
                document.getElementById('numero-referencia').value = '';
                document.getElementById('assunto').value = '';
                document.getElementById('conteudo-carta').value = '';
                document.getElementById('remetente').value = '';
                document.getElementById('cargo-remetente').value = '';
                
                // Esconde o resultado
                resultadoCarta.style.display = 'none';
            });
        }
    }
});
