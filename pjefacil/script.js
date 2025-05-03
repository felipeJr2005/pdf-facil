document.addEventListener('DOMContentLoaded', function() {
    // Parte 1: Editor de Texto
    const editor = document.getElementById('editor');
    const buttons = document.querySelectorAll('.toolbar button');
    const fontSizeSelect = document.getElementById('fontSize');
    
    // Limpar texto inicial ao focar
    editor.addEventListener('focus', function() {
        if (editor.textContent === 'Digite seu texto aqui...') {
            editor.textContent = '';
        }
    });

    // Configurar botões da barra de ferramentas
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

    // Configurar seletor de tamanho de fonte
    fontSizeSelect.addEventListener('change', function() {
        document.execCommand('fontSize', false, this.value);
    });

    // Funções para salvar, carregar e limpar conteúdo
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

    // Parte 2: Botões de Ação
    const btnCumprirAudiencia = document.getElementById('btn-cumprir-audiencia');
    const btnCartaGuia = document.getElementById('btn-carta-guia');
    const conteudoDinamico = document.getElementById('conteudo-dinamico');

    // Função para exibir conteúdo no container dinâmico
    function exibirConteudo(tipo) {
        conteudoDinamico.style.display = 'block';

        if (tipo === 'audiencia') {
            fetch('cumprir-audiencia.html')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Falha ao carregar o arquivo');
                    }
                    return response.text();
                })
                .then(html => {
                    conteudoDinamico.innerHTML = html;
                    inicializarFuncionalidadesAudiencia();
                })
                .catch(error => {
                    console.error('Erro ao carregar o formulário:', error);
                    conteudoDinamico.innerHTML = `
                        <div class="erro">
                            <p>Não foi possível carregar o formulário de audiência.</p>
                            <p>Erro: ${error.message}</p>
                        </div>
                    `;
                });
        } else if (tipo === 'carta') {
            conteudoDinamico.innerHTML = `
                <div class="conteudo-carta">
                    <h2>Carta Guia</h2>
                    <div class="form-carta-guia">
                        <div class="grupo-formulario">
                            <label for="data-carta">Data:</label>
                            <input type="date" id="data-carta">
                        </div>
                        <div class="grupo-formulario">
                            <label for="destinatario">Destinatário:</label>
                            <input type="text" id="destinatario" placeholder="Nome do destinatário">
                        </div>
                        <div class="grupo-formulario">
                            <label for="endereco-destinatario">Endereço:</label>
                            <textarea id="endereco-destinatario" rows="3" placeholder="Endereço completo"></textarea>
                        </div>
                        <div class="grupo-formulario">
                            <label for="numero-referencia">Número/Referência:</label>
                            <input type="text" id="numero-referencia" placeholder="Número ou referência">
                        </div>
                        <div class="grupo-formulario">
                            <label for="assunto">Assunto:</label>
                            <input type="text" id="assunto" placeholder="Assunto da carta">
                        </div>
                        <div class="grupo-formulario">
                            <label for="conteudo-carta">Conteúdo:</label>
                            <textarea id="conteudo-carta" rows="6" placeholder="Corpo da carta"></textarea>
                        </div>
                        <div class="grupo-formulario">
                            <label for="remetente">Remetente:</label>
                            <input type="text" id="remetente" placeholder="Seu nome">
                        </div>
                        <div class="grupo-formulario">
                            <label for="cargo-remetente">Cargo:</label>
                            <input type="text" id="cargo-remetente" placeholder="Seu cargo">
                        </div>
                        <div class="acoes-formulario">
                            <button onclick="gerarCartaGuia()" class="botao-primario">Gerar Carta</button>
                            <button onclick="limparCartaGuia()" class="botao-secundario">Limpar</button>
                        </div>
                    </div>
                    <div id="resultado-carta" class="carta" style="display: none;"></div>
                </div>
            `;
            inicializarFuncionalidadesCarta();
        }
    }

    // Event listeners para os botões
    btnCumprirAudiencia.addEventListener('click', function() {
        exibirConteudo('audiencia');
    });

    btnCartaGuia.addEventListener('click', function() {
        exibirConteudo('carta');
    });

    // Parte 3: Funcionalidades dos formulários dinâmicos
    
    // Funções para o formulário de audiência
    function inicializarFuncionalidadesAudiencia() {
        window.addAssistenteAcusacao = function() {
            const container = document.getElementById('assistente-acusacao-container');
            const id = Date.now();
            
            const html = `
                <div class="pessoa-container" id="assistente-${id}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4>Assistente de Acusação</h4>
                        <button class="btn btn-danger" onclick="removerElemento('assistente-${id}')">Remover</button>
                    </div>
                    <div class="input-group">
                        <label>Nome:</label>
                        <input type="text" class="assistente-nome">
                    </div>
                    <div class="input-group">
                        <label>Representante:</label>
                        <input type="text" class="assistente-representante">
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="intimado-assistente-${id}" class="assistente-intimado">
                        <label for="intimado-assistente-${id}">Intimado</label>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        };

        window.addVitima = function() {
            const container = document.getElementById('vitimas-container');
            const id = Date.now();
            
            const html = `
                <div class="vitima-container" id="vitima-${id}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4>Vítima</h4>
                        <button class="btn btn-danger" onclick="removerElemento('vitima-${id}')">Remover</button>
                    </div>
                    <div class="input-group">
                        <label>Nome:</label>
                        <input type="text" class="vitima-nome">
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="presente-vitima-${id}" class="vitima-presente">
                        <label for="presente-vitima-${id}">Presente</label>
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="intimado-vitima-${id}" class="vitima-intimado">
                        <label for="intimado-vitima-${id}">Intimado</label>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        };

        window.addTestemunha = function(tipo) {
            const container = document.getElementById(`testemunhas-${tipo}-container`);
            const id = Date.now();
            
            const html = `
                <div class="testemunha-container" id="testemunha-${id}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4>Testemunha ${tipo === 'mp' ? 'MP' : 'Defesa'}</h4>
                        <button class="btn btn-danger" onclick="removerElemento('testemunha-${id}')">Remover</button>
                    </div>
                    <div class="input-group">
                        <label>Nome:</label>
                        <input type="text" class="testemunha-nome" data-tipo="${tipo}">
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="presente-testemunha-${id}" class="testemunha-presente">
                        <label for="presente-testemunha-${id}">Presente</label>
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="intimado-testemunha-${id}" class="testemunha-intimado">
                        <label for="intimado-testemunha-${id}">Intimado</label>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        };

        window.addPolicial = function() {
            const container = document.getElementById('policiais-container');
            const id = Date.now();
            
            const html = `
                <div class="policial-container" id="policial-${id}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4>Policial</h4>
                        <button class="btn btn-danger" onclick="removerElemento('policial-${id}')">Remover</button>
                    </div>
                    <div class="input-group">
                        <label>Nome:</label>
                        <input type="text" class="policial-nome">
                    </div>
                    <div class="input-group">
                        <label>Matrícula:</label>
                        <input type="text" class="policial-matricula">
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="presente-policial-${id}" class="policial-presente">
                        <label for="presente-policial-${id}">Presente</label>
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="intimado-policial-${id}" class="policial-intimado">
                        <label for="intimado-policial-${id}">Intimado</label>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        };

        window.addReu = function() {
            const container = document.getElementById('reus-container');
            const id = Date.now();
            
            const html = `
                <div class="reu-container" id="reu-${id}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4>Réu</h4>
                        <button class="btn btn-danger" onclick="removerElemento('reu-${id}')">Remover</button>
                    </div>
                    <div class="input-group">
                        <label>Nome:</label>
                        <input type="text" class="reu-nome">
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="presente-reu-${id}" class="reu-presente">
                        <label for="presente-reu-${id}">Presente</label>
                    </div>
                    <div class="input-group">
                        <label>Advogado:</label>
                        <input type="text" class="reu-advogado">
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="intimado-reu-${id}" class="reu-intimado">
                        <label for="intimado-reu-${id}">Intimado</label>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        };

        window.removerElemento = function(id) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.remove();
            }
        };

        window.gerarTextoCumprimento = function() {
            const intimadoMP = document.getElementById('intimado_mp').checked;
            const hoje = new Date();
            const dataFormatada = hoje.toLocaleDateString('pt-BR');
            
            let texto = `<h2>CUMPRIMENTO DE AUDIÊNCIA - ${dataFormatada}</h2>`;
            
            // Adiciona todas as seções do formulário ao texto...
            // (Implementação completa conforme necessidade)
            
            const resultadoAudiencia = document.getElementById('resultado-audiencia');
            resultadoAudiencia.innerHTML = texto;
            resultadoAudiencia.style.display = 'block';
            
            const editor = document.getElementById('editor');
            if (editor) {
                editor.innerHTML = texto;
                setTimeout(() => {
                    conteudoDinamico.style.display = 'none';
                }, 1000);
            }
        };

        window.limparFormulario = function() {
            if (confirm('Deseja realmente limpar todos os campos?')) {
                document.getElementById('intimado_mp').checked = false;
                document.getElementById('assistente-acusacao-container').innerHTML = '';
                document.getElementById('vitimas-container').innerHTML = '';
                document.getElementById('testemunhas-mp-container').innerHTML = '';
                document.getElementById('policiais-container').innerHTML = '';
                document.getElementById('reus-container').innerHTML = '';
                document.getElementById('testemunhas-defesa-container').innerHTML = '';
                document.getElementById('observacoes-mp').value = '';
                document.getElementById('observacoes-defesa').value = '';
                document.getElementById('resultado-audiencia').style.display = 'none';
            }
        };

        window.salvarDados = function() {
            alert('Funcionalidade de salvamento será implementada em breve.');
        };
    }

    // Funções para o formulário de carta guia
    function inicializarFuncionalidadesCarta() {
        window.gerarCartaGuia = function() {
            const dataCarta = document.getElementById('data-carta').value;
            const destinatario = document.getElementById('destinatario').value;
            const endereco = document.getElementById('endereco-destinatario').value;
            const referencia = document.getElementById('numero-referencia').value;
            const assunto = document.getElementById('assunto').value;
            const conteudo = document.getElementById('conteudo-carta').value;
            const remetente = document.getElementById('remetente').value;
            const cargo = document.getElementById('cargo-remetente').value;
            
            const dataFormatada = dataCarta ? new Date(dataCarta).toLocaleDateString('pt-BR') : '';
            
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
            
            const resultadoCarta = document.getElementById('resultado-carta');
            resultadoCarta.innerHTML = cartaGerada;
            resultadoCarta.style.display = 'block';
            
            const editor = document.getElementById('editor');
            if (editor) {
                editor.innerHTML = cartaGerada;
                setTimeout(() => {
                    conteudoDinamico.style.display = 'none';
                }, 1000);
            }
        };

        window.limparCartaGuia = function() {
            if (confirm('Deseja realmente limpar todos os campos?')) {
                document.getElementById('data-carta').value = '';
                document.getElementById('destinatario').value = '';
                document.getElementById('endereco-destinatario').value = '';
                document.getElementById('numero-referencia').value = '';
                document.getElementById('assunto').value = '';
                document.getElementById('conteudo-carta').value = '';
                document.getElementById('remetente').value = '';
                document.getElementById('cargo-remetente').value = '';
                document.getElementById('resultado-carta').style.display = 'none';
            }
        };
    }
});
