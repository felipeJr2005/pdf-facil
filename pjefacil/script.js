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
        const btnGerarTexto = document.getElementById('gerarTextoCumprimento');
        const btnLimpar = document.getElementById('limparCumprimento');
        const resultadoAudiencia = document.getElementById('resultado-audiencia');
        
        if (btnGerarTexto) {
            btnGerarTexto.addEventListener('click', function() {
                // Coleta os valores do formulário
                const numeroProcesso = document.getElementById('numeroProcesso').value.trim();
                const vara = document.getElementById('vara').value.trim();
                const cidade = document.getElementById('cidade').value.trim();
                const dataAudiencia = document.getElementById('dataAudiencia').value;
                const horaAudiencia = document.getElementById('horaAudiencia').value;
                const tipoAudiencia = document.getElementById('tipoAudiencia').value;
                const reclamante = document.getElementById('reclamante').value.trim();
                const reclamada = document.getElementById('reclamada').value.trim();
                const advogadoReclamante = document.getElementById('advogadoReclamante').value.trim();
                const preposto = document.getElementById('preposto').value.trim();
                const advogadoReclamada = document.getElementById('advogadoReclamada').value.trim();
                
                // Verifica se os campos obrigatórios estão preenchidos
                if (!numeroProcesso || !vara || !cidade || !dataAudiencia || !horaAudiencia || 
                    !reclamante || !reclamada) {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                    return;
                }
                
                // Formata a data para exibição
                const dataObj = new Date(dataAudiencia);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                
                // Mapeia os tipos de audiência para texto mais amigável
                const tiposAudiencia = {
                    'una': 'Una',
                    'inicial': 'Inicial',
                    'instrucao': 'Instrução',
                    'julgamento': 'Julgamento',
                    'conciliacao': 'Conciliação'
                };
                
                const tipoAudienciaTexto = tiposAudiencia[tipoAudiencia] || tipoAudiencia;
                
                // Gera o texto com base nos valores do formulário
                let textoGerado = `
                    <h3>CUMPRIMENTO DE AUDIÊNCIA</h3>
                    <p>Processo nº: ${numeroProcesso}</p>
                    <p>${vara} de ${cidade}</p>
                    <p>Data: ${dataFormatada} às ${horaAudiencia}</p>
                    <p>Audiência de ${tipoAudienciaTexto}</p>
                    <br>
                    <p><strong>Reclamante:</strong> ${reclamante}</p>
                    <p><strong>Advogado(a) do Reclamante:</strong> ${advogadoReclamante || 'Não informado'}</p>
                    <br>
                    <p><strong>Reclamada:</strong> ${reclamada}</p>
                    <p><strong>Preposto:</strong> ${preposto || 'Não informado'}</p>
                    <p><strong>Advogado(a) da Reclamada:</strong> ${advogadoReclamada || 'Não informado'}</p>
                    <br>
                    <p>Compareci à audiência designada, acompanhando a parte ${reclamada ? 'Reclamada' : 'Reclamante'}, conforme designado.</p>
                    <p>Resultado da Audiência: </p>
                    <p>[Adicione aqui o resultado da audiência]</p>
                    <br>
                    <p>Próxima audiência (se houver): </p>
                    <p>[Data, hora e tipo da próxima audiência, se aplicável]</p>
                `;
                
                // Exibe o resultado
                resultadoAudiencia.innerHTML = textoGerado;
                resultadoAudiencia.style.display = 'block';
                
                // Adiciona o texto gerado ao editor principal
                const editor = document.getElementById('editor');
                if (editor) {
                    // Se o usuário estiver na página principal, adiciona o texto ao editor
                    editor.innerHTML = textoGerado;
                    
                    // Fecha o container dinâmico
                    setTimeout(() => {
                        const conteudoDinamico = document.getElementById('conteudo-dinamico');
                        if (conteudoDinamico) {
                            conteudoDinamico.style.display = 'none';
                        }
                    }, 1000);
                }
            });
        }
        
        if (btnLimpar) {
            btnLimpar.addEventListener('click', function() {
                // Limpa os campos do formulário
                document.getElementById('numeroProcesso').value = '';
                document.getElementById('vara').value = '';
                document.getElementById('cidade').value = '';
                document.getElementById('dataAudiencia').value = '';
                document.getElementById('horaAudiencia').value = '';
                document.getElementById('tipoAudiencia').selectedIndex = 0;
                document.getElementById('reclamante').value = '';
                document.getElementById('reclamada').value = '';
                document.getElementById('advogadoReclamante').value = '';
                document.getElementById('preposto').value = '';
                document.getElementById('advogadoReclamada').value = '';
                
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
