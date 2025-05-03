document.addEventListener('DOMContentLoaded', function() {
    // Parte 1: Editor de Texto
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

    // Parte 2: Botões de Ação
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
    
    // Parte 3: Funcionalidades dos formulários dinâmicos
    
    // Funções para inicializar funcionalidades após carregamento
    function inicializarFuncionalidadesAudiencia() {
        // Implementação das funções para o formulário de audiência
        window.addAssistenteAcusacao = function() {
            const container = document.getElementById('assistente-acusacao-container');
            const id = new Date().getTime();
            
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
            const id = new Date().getTime();
            
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
            const id = new Date().getTime();
            
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
            const id = new Date().getTime();
            
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
            const id = new Date().getTime();
            
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
            // Coletando dados do formulário
            const intimadoMP = document.getElementById('intimado_mp').checked;
            
            // Coletando assistentes de acusação
            const assistentes = [];
            document.querySelectorAll('.pessoa-container').forEach(el => {
                const nome = el.querySelector('.assistente-nome').value;
                const representante = el.querySelector('.assistente-representante').value;
                const intimado = el.querySelector('.assistente-intimado').checked;
                
                if (nome) {
                    assistentes.push({
                        nome: nome,
                        representante: representante,
                        intimado: intimado
                    });
                }
            });
            
            // Coletando vítimas
            const vitimas = [];
            document.querySelectorAll('.vitima-container').forEach(el => {
                const nome = el.querySelector('.vitima-nome').value;
                const presente = el.querySelector('.vitima-presente').checked;
                const intimado = el.querySelector('.vitima-intimado').checked;
                
                if (nome) {
                    vitimas.push({
                        nome: nome,
                        presente: presente,
                        intimado: intimado
                    });
                }
            });
            
            // Coletando testemunhas do MP
            const testemunhasMP = [];
            document.querySelectorAll('.testemunha-nome[data-tipo="mp"]').forEach(el => {
                const container = el.closest('.testemunha-container');
                const nome = el.value;
                const presente = container.querySelector('.testemunha-presente').checked;
                const intimado = container.querySelector('.testemunha-intimado').checked;
                
                if (nome) {
                    testemunhasMP.push({
                        nome: nome,
                        presente: presente,
                        intimado: intimado
                    });
                }
            });
            
            // Coletando policiais
            const policiais = [];
            document.querySelectorAll('.policial-container').forEach(el => {
                const nome = el.querySelector('.policial-nome').value;
                const matricula = el.querySelector('.policial-matricula').value;
                const presente = el.querySelector('.policial-presente').checked;
                const intimado = el.querySelector('.policial-intimado').checked;
                
                if (nome) {
                    policiais.push({
                        nome: nome,
                        matricula: matricula,
                        presente: presente,
                        intimado: intimado
                    });
                }
            });
            
            // Coletando réus
            const reus = [];
            document.querySelectorAll('.reu-container').forEach(el => {
                const nome = el.querySelector('.reu-nome').value;
                const presente = el.querySelector('.reu-presente').checked;
                const advogado = el.querySelector('.reu-advogado').value;
                const intimado = el.querySelector('.reu-intimado').checked;
                
                if (nome) {
                    reus.push({
                        nome: nome,
                        presente: presente,
                        advogado: advogado,
                        intimado: intimado
                    });
                }
            });
            
            // Coletando testemunhas da defesa
            const testemunhasDefesa = [];
            document.querySelectorAll('.testemunha-nome[data-tipo="defesa"]').forEach(el => {
                const container = el.closest('.testemunha-container');
                const nome = el.value;
                const presente = container.querySelector('.testemunha-presente').checked;
                const intimado = container.querySelector('.testemunha-intimado').checked;
                
                if (nome) {
                    testemunhasDefesa.push({
                        nome: nome,
                        presente: presente,
                        intimado: intimado
                    });
                }
            });
            
            // Coletando observações
            const observacoesMP = document.getElementById('observacoes-mp').value;
            const observacoesDefesa = document.getElementById('observacoes-defesa').value;
            
            // Gerando o texto
            const hoje = new Date();
            const dataFormatada = hoje.toLocaleDateString('pt-BR');
            
            let texto = `
                <h2>CUMPRIMENTO DE AUDIÊNCIA - ${dataFormatada}</h2>
                
                <h3>ACUSAÇÃO</h3>
                
                <p><strong>Ministério Público:</strong> ${intimadoMP ? 'Intimado' : 'Não intimado'}</p>
            `;
            
            // Adicionando assistentes de acusação
            if (assistentes.length > 0) {
                texto += `<h4>Assistentes de Acusação:</h4>`;
                assistentes.forEach(assistente => {
                    texto += `
                        <p>- ${assistente.nome}
                        ${assistente.representante ? ` (Representante: ${assistente.representante})` : ''}
                        ${assistente.intimado ? ' - Intimado' : ' - Não intimado'}</p>
                    `;
                });
            }
            
            // Adicionando vítimas
            if (vitimas.length > 0) {
                texto += `<h4>Vítimas:</h4>`;
                vitimas.forEach(vitima => {
                    texto += `
                        <p>- ${vitima.nome}
                        ${vitima.presente ? ' - Presente' : ' - Ausente'}
                        ${vitima.intimado ? ' - Intimado' : ' - Não intimado'}</p>
                    `;
                });
            }
            
            // Adicionando testemunhas do MP
            if (testemunhasMP.length > 0) {
                texto += `<h4>Testemunhas do MP:</h4>`;
                testemunhasMP.forEach(testemunha => {
                    texto += `
                        <p>- ${testemunha.nome}
                        ${testemunha.presente ? ' - Presente' : ' - Ausente'}
                        ${testemunha.intimado ? ' - Intimado' : ' - Não intimado'}</p>
                    `;
                });
            }
            
            // Adicionando policiais
            if (policiais.length > 0) {
                texto += `<h4>Policiais:</h4>`;
                policiais.forEach(policial => {
                    texto += `
                        <p>- ${policial.nome}
                        ${policial.matricula ? ` (Matrícula: ${policial.matricula})` : ''}
                        ${policial.presente ? ' - Presente' : ' - Ausente'}
                        ${policial.intimado ? ' - Intimado' : ' - Não intimado'}</p>
                    `;
                });
            }
            
            // Adicionando observações do MP
            if (observacoesMP) {
                texto += `
                    <h4>Observações do MP:</h4>
                    <p>${observacoesMP.replace(/\n/g, '<br>')}</p>
                `;
            }
            
            texto += `<h3>DEFESA</h3>`;
            
            // Adicionando réus
            if (reus.length > 0) {
                texto += `<h4>Réus:</h4>`;
                reus.forEach(reu => {
                    texto += `
                        <p>- ${reu.nome}
                        ${reu.presente ? ' - Presente' : ' - Ausente'}
                        ${reu.advogado ? ` - Advogado: ${reu.advogado}` : ''}
                        ${reu.intimado ? ' - Intimado' : ' - Não intimado'}</p>
                    `;
                });
            }
            
            // Adicionando testemunhas da defesa
            if (testemunhasDefesa.length > 0) {
                texto += `<h4>Testemunhas da Defesa:</h4>`;
                testemunhasDefesa.forEach(testemunha => {
                    texto += `
                        <p>- ${testemunha.nome}
                        ${testemunha.presente ? ' - Presente' : ' - Ausente'}
                        ${testemunha.intimado ? ' - Intimado' : ' - Não intimado'}</p>
                    `;
                });
            }
            
            // Adicionando observações da defesa
            if (observacoesDefesa) {
                texto += `
                    <h4>Observações da Defesa:</h4>
                    <p>${observacoesDefesa.replace(/\n/g, '<br>')}</p>
                `;
            }
            
            // Exibindo o resultado
            const resultadoAudiencia = document.getElementById('resultado-audiencia');
            resultadoAudiencia.innerHTML = texto;
            resultadoAudiencia.style.display = 'block';
            
            // Adicionando o texto ao editor principal
            const editor = document.getElementById('editor');
            if (editor) {
                editor.innerHTML = texto;
                
                // Fecha o container dinâmico após um tempo
                setTimeout(() => {
                    const conteudoDinamico = document.getElementById('conteudo-dinamico');
                    if (conteudoDinamico) {
                        conteudoDinamico.style.display = 'none';
                    }
                }, 1000);
            }
        };

        window.limparFormulario = function() {
            if (confirm('Deseja realmente limpar todos os campos?')) {
                // Limpando checkbox do MP
                document.getElementById('intimado_mp').checked = false;
                
                // Limpando containers
                document.getElementById('assistente-acusacao-container').innerHTML = '';
                document.getElementById('vitimas-container').innerHTML = '';
                document.getElementById('testemunhas-mp-container').innerHTML = '';
                document.getElementById('policiais-container').innerHTML = '';
                document.getElementById('reus-container').innerHTML = '';
                document.getElementById('testemunhas-defesa-container').innerHTML = '';
                
                // Limpando textareas
                document.getElementById('observacoes-mp').value = '';
                document.getElementById('observacoes-defesa').value = '';
                
                // Escondendo resultado
                document.getElementById('resultado-audiencia').style.display = 'none';
            }
        };

        window.salvarDados = function() {
            alert('Funcionalidade de salvamento será implementada em uma versão futura.');
        };
    }

    function inicializarFuncionalidadesCarta() {
        // Implementação das funções para o formulário de carta guia
        window.addAnexo = function() {
            const container = document.getElementById('anexos-container');
            const id = new Date().getTime();
            
            const html = `
                <div class="anexo-container" id="anexo-${id}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4>Anexo</h4>
                        <button class="btn btn-danger" onclick="removerElementoCarta('anexo-${id}')">Remover</button>
                    </div>
                    <div class="input-group">
                        <label>Descrição:</label>
                        <input type="text" class="anexo-descricao" placeholder="Ex: Cópia da Certidão">
                    </div>
                    <div class="input-group">
                        <label>Quantidade de páginas:</label>
                        <input type="number" class="anexo-paginas" min="1" value="1">
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', html);
        };

        window.removerElementoCarta = function(id) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.remove();
            }
        };

        window.gerarCartaGuia = function() {
            // Coletando dados do formulário
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
            const resultadoCarta = document.getElementById('resultado-carta');
            resultadoCarta.innerHTML = cartaGerada;
            resultadoCarta.style.display = 'block';
            
            // Adiciona o texto ao editor principal
            const editor = document.getElementById('editor');
            if (editor) {
                editor.innerHTML = cartaGerada;
                
                // Fecha o container dinâmico após um tempo
                setTimeout(() => {
                    const conteudoDinamico = document.getElementById('conteudo-dinamico');
                    if (conteudoDinamico) {
                        conteudoDinamico.style.display = 'none';
                    }
                }, 1000);
            }
        };

        window.limparCartaGuia = function() {
            if (confirm('Deseja realmente limpar todos os campos?')) {
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
                const resultadoCarta = document.getElementById('resultado-carta');
                if (resultadoCarta) {
                    resultadoCarta.style.display = 'none';
                }
            }
        };
    }
});
