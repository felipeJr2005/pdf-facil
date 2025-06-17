/**
 * Módulo para Guia de Recolhimento
 */

// Função de inicialização do módulo
export function initialize(container) {
    console.log('Módulo guia.js inicializado');
    
    // Configurar botões de expandir/retrair
    setupExpandButtons(container);
    
    // Contar caracteres nos campos editáveis
    setupCharacterCount(container);
    
    // Configurar funcionalidades de resumo
    setupResumoFunctions(container);
    
    // Configurar botões de limpar campos
    setupClearButtons(container);
    
    // Botão de preenchimento automático
    setupAutomaticFill(container);
    
    // Eventos para botões de formulário
    setupFormButtons(container);
    
    // Configurar o resumidor jurídico
    setupResumidorJuridico(container);
    
    console.log('Módulo de Guia pronto para uso');
}

// Configurar o resumidor jurídico
function setupResumidorJuridico(container) {
    // Obter referência ao botão de resumir
    const resumirBtn = container.querySelector('#resumirSentenca');
    if (!resumirBtn) return;
    
    // Adicionar evento de clique ao botão
    resumirBtn.addEventListener('click', function() {
        const sentencaElement = container.querySelector('#sentenca');
        if (!sentencaElement) return;
        
        // Verificar se há texto para resumir
        const textoOriginal = sentencaElement.textContent.trim();
        if (!textoOriginal) {
            mostrarMensagem(container, 'error', 'Não há texto para resumir. Por favor, insira a sentença judicial.');
            return;
        }
        
        // Indicador de processamento no próprio botão
        const textoOriginalBtn = resumirBtn.textContent;
        resumirBtn.textContent = 'Processando...';
        resumirBtn.disabled = true;
        
        try {
            // Limpar o texto primeiro
            const textoLimpo = limparTextoSentenca(textoOriginal);
            
            // Mostrar texto limpo
            sentencaElement.textContent = textoLimpo;
            atualizarContagemCaracteres(sentencaElement, container);
            
            // Enviar para a API DeepSeek
            processarSentenca(textoLimpo)
                .then(resultado => {
                    // Substituir o conteúdo pelo resultado
                    sentencaElement.textContent = resultado;
                    atualizarContagemCaracteres(sentencaElement, container);
                    mostrarMensagem(container, 'success', 'Sentença resumida com sucesso!');
                })
                .catch(error => {
                    console.error('Erro ao resumir sentença:', error);
                    mostrarMensagem(container, 'error', `Erro ao resumir sentença: ${error.message}`);
                })
                .finally(() => {
                    // Restaurar o botão
                    resumirBtn.textContent = textoOriginalBtn;
                    resumirBtn.disabled = false;
                });
        } catch (error) {
            console.error('Erro:', error);
            resumirBtn.textContent = textoOriginalBtn;
            resumirBtn.disabled = false;
            mostrarMensagem(container, 'error', `Erro: ${error.message}`);
        }
    });
}

// Função para limpar e otimizar texto
function limparTextoSentenca(texto) {
    if (!texto || !texto.trim()) {
        return '';
    }
    
    // Realizar limpezas no texto
    let textoLimpo = texto
        // Converter quebras de linha para espaços
        .replace(/[\r\n]+/g, ' ')
        // Remover múltiplos espaços em branco
        .replace(/\s+/g, ' ')
        // Remover espaços no início e fim
        .trim();
    
    // Adicionar quebra de linha apenas após pontuação final
    textoLimpo = textoLimpo
        .replace(/\.\s+([A-Z])/g, '.\n$1')
        .replace(/\?\s+([A-Z])/g, '?\n$1')
        .replace(/\!\s+([A-Z])/g, '!\n$1');
    
    return textoLimpo;
}

// Função para atualizar a contagem de caracteres
function atualizarContagemCaracteres(elemento, container) {
    const id = elemento.id;
    const countElement = container.querySelector(`#${id}Count`);
    
    if (countElement) {
        const count = elemento.textContent.length;
        countElement.textContent = count + ' caracteres';
        
        if (count > 5000) {
            countElement.classList.add('limit-exceeded');
        } else {
            countElement.classList.remove('limit-exceeded');
        }
    }
}

// Função para processar a sentença - VERSÃO CORRIGIDA
async function processarSentenca(textoSentenca) {
    // Prompt corrigido para melhor formatação
    const prompt = `Você é um assistente jurídico especializado em extrair dados de sentenças criminais e organizar informações de pessoas envolvidas.

INSTRUÇÕES IMPORTANTES:
1. NUNCA use "não informado" - se não encontrar uma informação, simplesmente OMITA esse campo
2. Para policiais, separe NOME da MATRÍCULA/RG - não misture no mesmo campo
3. Organize as informações de forma limpa e concisa
4. Use apenas dados que realmente existem no texto

FORMATO DE SAÍDA DESEJADO:

PROCESSAMENTO AUTOMÁTICO - [data/hora atual]

📊 ESTATÍSTICAS:
• [número] pessoas mencionadas
• [número] qualificadas  
• [número] campos preenchidos automaticamente

RÉUS ([número]):
[Para cada réu, incluir apenas campos que tenham informação real:]
1. [NOME COMPLETO][, CPF [número] se houver][, conhecido como "[apelido]" se houver][, filho de [nome da mãe] se houver][, nascido em [data] se houver]
Endereço: [endereço se houver][, situação prisional atual [status] se houver]

VÍTIMAS ([número]):
[Para cada vítima, mesmo formato dos réus - só campos com informação]
1. [NOME COMPLETO][campos opcionais apenas se existirem]

TESTEMUNHAS POLICIAIS ([número]):
[Para policiais, separar nome de matrícula:]
1. [NOME COMPLETO] / [MATRÍCULA ou RG] - [POSTO/FUNÇÃO] ([UNIDADE])

OUTRAS PESSOAS ([número]):
[Se houver outras pessoas relevantes]
1. [NOME COMPLETO][campos opcionais]

OBSERVAÇÕES:
- Se não houver CPF, NÃO escreva "CPF não informado"  
- Se não houver conhecido como, NÃO escreva "conhecido como 'não informado'"
- Se não houver filiação, NÃO escreva "filho de não informado"
- Se não houver nascimento, NÃO escreva "nascido em não informado"
- Para policiais, separe SEMPRE nome da matrícula em linha diferente ou com formatação clara

EXEMPLO DE SAÍDA CORRETA:

RÉUS (1):
1. STEEVY WILLIAMS GOIS DE ARAUJO, CPF 108.614.814-29, filho de Suely Cordeiro Gois, nascido em 25/01/1994
Endereço: Rua Sebastião de Freitas Lima, nº 64, São Cristóvão, Arcoverde/PE

VÍTIMAS (2):  
1. Valdecir Oliveira de Andrade
Endereço: Rua Sebastião de Freitas Lima, nº 30, São Cristóvão, Arcoverde/PE

2. Eduarda Lais Barbosa de Lima
Endereço: Rua Sebastião de Freitas Lima, nº 30, São Cristóvão, Arcoverde/PE

TESTEMUNHAS POLICIAIS (2):
1. Alan da Costa Nogueira
   Matrícula: 56060 PM/PE - PM (3º BPM – Arcoverde/PE)

2. José Alberes de Oliveira Silva  
   Matrícula: 50512 PM/PE - PM (3º BPM – Arcoverde/PE)

Agora processe o texto abaixo seguindo rigorosamente essas instruções:`;

    try {
        // Chave da API DeepSeek
        const apiKey = "sk-0a164d068ee643099f9d3fc508e4e612";
        
        // Configuração do temperatura (0.1 para mais consistência na formatação)
        const temperatura = 0.1;
        
        // Fazer a requisição para a API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "Você é um assistente jurídico especializado em extrair e organizar dados de sentenças judiciais de forma limpa e concisa, omitindo campos vazios."
                    },
                    {
                        role: "user",
                        content: `${prompt}\n\nTEXTO DA SENTENÇA:\n${textoSentenca}`
                    }
                ],
                temperature: temperatura,
                max_tokens: 2500
            })
        });
        
        // Verificar resposta
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Erro ${response.status}: Falha na API`);
        }
        
        // Extrair o resultado
        const data = await response.json();
        let resultado = data.choices[0].message.content;
        
        // Pós-processamento para garantir limpeza adicional
        resultado = limparResultadoFinal(resultado);
        
        return resultado;
    } catch (error) {
        console.error("Erro na API DeepSeek:", error);
        throw new Error(`Falha ao processar o texto: ${error.message}`);
    }
}

// Função auxiliar para limpeza final do resultado
function limparResultadoFinal(texto) {
    if (!texto) return texto;
    
    // Remover frases com "não informado"
    let textoLimpo = texto
        // Remover vírgulas seguidas de "conhecido como 'não informado'"
        .replace(/,\s*conhecido como\s*['"]não informado['"]?/gi, '')
        // Remover vírgulas seguidas de "CPF não informado"  
        .replace(/,\s*CPF\s*não informado/gi, '')
        // Remover vírgulas seguidas de "filho de não informado"
        .replace(/,\s*filho de\s*não informado/gi, '')
        // Remover vírgulas seguidas de "nascido em não informado"
        .replace(/,\s*nascido em\s*não informado/gi, '')
        // Remover linhas que contenham apenas "não informado"
        .replace(/^.*não informado.*$/gmi, '')
        // Limpar vírgulas duplas que podem ter sobrado
        .replace(/,\s*,/g, ',')
        // Limpar vírgulas no final de frases
        .replace(/,\s*$/gm, '')
        // Limpar linhas vazias excessivas
        .replace(/\n{3,}/g, '\n\n')
        // Limpar espaços no início e fim
        .trim();
    
    console.log('Resultado pós-processado:', textoLimpo);
    return textoLimpo;
}

// Função para configurar botões de expandir/retrair
function setupExpandButtons(container) {
    container.querySelectorAll('.btn-expandir').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Alternar classe expandido
                targetElement.classList.toggle('expandido');
                
                // Alternar ícone
                const icon = this.querySelector('.icon-expandir');
                if (icon) {
                    if (targetElement.classList.contains('expandido')) {
                        icon.textContent = '⤡';  // Ícone de retrair
                        this.setAttribute('title', 'Retrair');
                    } else {
                        icon.textContent = '⤢';  // Ícone de expandir
                        this.setAttribute('title', 'Expandir');
                    }
                }
            }
        });
    });
}
  
// Função para configurar contagem de caracteres
function setupCharacterCount(container) {
    container.querySelectorAll('.editable-content').forEach(el => {
        const countId = el.id + 'Count';
        const countEl = container.querySelector(`#${countId}`);
        
        if (countEl) {
            // Função para atualizar contagem
            const updateCount = () => {
                let count;
                
                // Tratamento especial para o campo resumo que pode conter HTML
                if (el.id === 'resumo') {
                    // Criar elemento temporário para extrair texto sem HTML
                    const tempElement = document.createElement('div');
                    tempElement.innerHTML = el.innerHTML;
                    count = tempElement.textContent.length;
                } else {
                    // Para outros campos, contar caracteres normalmente
                    count = el.textContent.length;
                }
                
                countEl.textContent = count + ' caracteres';
                
                // Destaque se for muito texto
                if (count > 5000) {
                    countEl.classList.add('limit-exceeded');
                } else {
                    countEl.classList.remove('limit-exceeded');
                }
            };
            
            // Eventos para atualizar contagem
            if (el.id === 'resumo') {
                // Para o campo resumo, monitorar mudanças no innerHTML
                const observer = new MutationObserver(updateCount);
                observer.observe(el, { 
                    childList: true, 
                    characterData: true,
                    subtree: true
                });
            } else {
                // Para outros campos, monitorar o conteúdo de texto
                el.addEventListener('input', updateCount);
            }
            
            el.addEventListener('paste', () => setTimeout(updateCount, 100));
            
            // Contagem inicial
            updateCount();
        }
    });
}
  
// Função para configurar funcionalidades de resumo
function setupResumoFunctions(container) {
    // Botão de concatenar campos
    const concatenarBtn = container.querySelector('#concatenarCampos');
    if (concatenarBtn) {
        concatenarBtn.addEventListener('click', function() {
            concatenarCampos(container);
        });
    }
    
    // Botão de limpar campos
    const limparCamposBtn = container.querySelector('#limparCampos');
    if (limparCamposBtn) {
        limparCamposBtn.addEventListener('click', function() {
            limparCamposEditor(container);
        });
    }
    
    // Botão de salvar resumo (agora copia para clipboard)
    const salvarResumoBtn = container.querySelector('#salvarResumo');
    if (salvarResumoBtn) {
        salvarResumoBtn.addEventListener('click', function() {
            salvarResumo(container);
        });
    }
}

// Função salvar resumo atualizada para copiar para clipboard
function salvarResumo(container) {
    const resumoElement = container.querySelector('#resumo');
    
    if (!resumoElement) return;
    
    // Obter o conteúdo HTML do elemento
    const resumoHTML = resumoElement.innerHTML || '';
    
    if (!resumoHTML.trim()) {
        mostrarMensagem(container, 'error', 'O resumo está vazio. Não há nada para copiar.');
        return;
    }
    
    // Criar um elemento temporário para extrair apenas o texto (removendo as tags HTML)
    const tempElement = document.createElement('div');
    tempElement.innerHTML = resumoHTML;
    const resumoTexto = tempElement.textContent;
    
    // Criar um elemento temporário para copiar para a área de transferência
    const copyElement = document.createElement('textarea');
    copyElement.value = resumoTexto; // Usar texto sem formatação para copiar
    copyElement.setAttribute('readonly', '');
    copyElement.style.position = 'absolute';
    copyElement.style.left = '-9999px';
    document.body.appendChild(copyElement);
    
    // Selecionar e copiar o texto
    copyElement.select();
    let copiado = false;
    
    try {
        copiado = document.execCommand('copy');
    } catch (err) {
        console.error('Falha ao copiar texto:', err);
    }
    
    // Remover o elemento temporário
    document.body.removeChild(copyElement);
    
    // Feedback ao usuário
    if (copiado) {
        mostrarMensagem(container, 'success', 'Resumo copiado para a área de transferência!');
    } else {
        mostrarMensagem(container, 'error', 'Não foi possível copiar o resumo. Tente selecionar o texto manualmente e usar Ctrl+C.');
    }
}
  
// Função para configurar botões de limpar campos
function setupClearButtons(container) {
    container.querySelectorAll('.clear-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const input = e.target.closest('.input-with-clear').querySelector('input');
            if (input) {
                input.value = '';
                input.focus();
                // Remover destaque de preenchimento automático, se houver
                input.classList.remove('campo-preenchido-auto');
            }
        });
    });
}
  
// Função para configurar preenchimento automático
function setupAutomaticFill(container) {
    const preencherBtn = container.querySelector('#preencherAutomatico');


    // Event listener para botão "Receber Dados"
    const botaoReceberDados = container.querySelector('#receberDados');
    if (botaoReceberDados) {
        botaoReceberDados.addEventListener('click', function() {
            receberDados();
        });
    }



    if (preencherBtn) {
        preencherBtn.addEventListener('click', function() {
            const resumoElement = container.querySelector('#resumo');
            if (!resumoElement || !(resumoElement.textContent.trim() || resumoElement.innerHTML.trim())) {
                mostrarMensagem(container, 'error', 'O resumo está vazio. Não há dados para preencher o formulário.');
                return;
            }

            // Obter conteúdo do resumo - pode ser HTML
            const conteudoResumo = resumoElement.innerHTML;
            
            // Verificar se o texto contém informações jurídicas relevantes
            // Criar elemento temporário para extrair texto sem formatação
            const tempElement = document.createElement('div');
            tempElement.innerHTML = conteudoResumo;
            const textoResumo = tempElement.textContent;
            
            if (!textoResumo.match(/(processo|sentença|acórdão|réu|pena)/i)) {
                mostrarMensagem(container, 'warning', 'O texto do resumo não parece conter informações jurídicas relevantes.');
                return;
            }

            // Configurar estado de processamento
            preencherBtn.classList.add('processing');
            const originalText = preencherBtn.textContent;
            preencherBtn.textContent = 'Processando...';
            preencherBtn.disabled = true;
            
            mostrarMensagem(container, 'info', 'Analisando o resumo para preenchimento automático...');

            // Usar setTimeout para liberar o thread da UI
            setTimeout(() => {
                try {
                    preencherFormularioAutomatico(container, conteudoResumo);
                } catch (error) {
                    console.error('Erro no preenchimento automático:', error);
                    mostrarMensagem(container, 'error', 'Ocorreu um erro durante o preenchimento automático.');
                } finally {
                    preencherBtn.classList.remove('processing');
                    preencherBtn.textContent = originalText;
                    preencherBtn.disabled = false;
                }
            }, 100);
        });
    }
}
  
// Função para configurar botões do formulário
function setupFormButtons(container) {
    // Cancelar formulário
    const cancelarBtn = container.querySelector('#cancelarForm');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja cancelar? Todas as alterações serão perdidas.')) {
                limparFormulario(container);
            }
        });
    }
    
    // Salvar rascunho
    const salvarRascunhoBtn = container.querySelector('#salvarRascunho');
    if (salvarRascunhoBtn) {
        salvarRascunhoBtn.addEventListener('click', function() {
            salvarRascunho(container);
        });
    }
    
    // Salvar formulário
    const salvarFormularioBtn = container.querySelector('#salvarFormulario');
    if (salvarFormularioBtn) {
        salvarFormularioBtn.addEventListener('click', function(e) {
            e.preventDefault();
            salvarFormulario(container);
        });
    }
}
  



/**
 * Função para verificar se o Scribe.js está realmente disponível e funcional
 */
function isScribeAvailable() {
    // Verificar se o objeto global 'scribe' existe
    if (typeof window.scribe === 'undefined') {
        console.warn('Objeto global scribe não encontrado.');
        return false;
    }
    
    // Verificar se o método extractText está disponível
    if (typeof window.scribe.extractText !== 'function') {
        console.warn('Método scribe.extractText não encontrado.');
        return false;
    }
    
    return true;
}







/**
 * Versão simplificada e robusta da função concatenarCampos
 * Não depende diretamente do Scribe.js para funcionar
 */
async function concatenarCampos(container) {
    // Mostrar overlay de processamento
    const processingOverlay = document.getElementById('processingOverlay');
    const processingText = document.getElementById('processingText');
    
    if (processingOverlay && processingText) {
        processingOverlay.style.display = 'flex';
        processingText.textContent = 'Iniciando processamento...';
    }
    
    try {
        // 1. Verificar se o Scribe está disponível
        const scribeDisponivel = isScribeAvailable();
        
        if (!scribeDisponivel) {
            if (processingText) {
                processingText.textContent = 'Scribe.js não disponível. Usando modo alternativo...';
            }
            console.warn('Scribe.js não está disponível. Usando modo alternativo sem processamento de PDF.');
        } else {
            console.log('Scribe.js disponível. Prosseguindo com processamento completo.');
        }
        
        // 2. Coletar dados dos campos simples
        const numeroInquerito = container.querySelector('#numeroInquerito')?.value || '';
        const recebimentoDenuncia = container.querySelector('#recebimentoDenuncia')?.value || '';
        const dataSentenca = container.querySelector('#dataSentenca')?.value || '';
        
        // 3. Iniciar o resumo com os campos básicos
        let resumoConcatenado = '';
        
        if (numeroInquerito.trim()) {
            resumoConcatenado += `<strong>Inquérito:</strong><br>${numeroInquerito.trim()}<br><br>`;
        }
        
        if (recebimentoDenuncia.trim()) {
            resumoConcatenado += `<strong>Recebimento da denúncia:</strong><br>${recebimentoDenuncia.trim()}<br><br>`;
        }
        
        if (dataSentenca.trim()) {
            resumoConcatenado += `<strong>Data da Sentença:</strong><br>${dataSentenca.trim()}<br><br>`;
        }
        
        // 4. Adicionar os campos de documentos (com ou sem processamento)
        const documentos = [
            { id: 'denuncia', nome: 'Denúncia' },
            { id: 'sentenca', nome: 'Sentença' },
            { id: 'acordao', nome: 'Acórdão' },
            { id: 'transitoJulgado', nome: 'Trânsito em Julgado' }
        ];
        
        for (const doc of documentos) {
            if (processingText) {
                processingText.textContent = `Processando ${doc.nome}...`;
            }
            
            const elemento = container.querySelector(`#${doc.id}`);
            if (!elemento) continue;
            
            const conteudo = elemento.textContent || elemento.innerHTML || '';
            if (!conteudo.trim()) continue;
            
            let textoProcessado = '';
            
            // Verificar se é um link e como processá-lo
            if (conteudo.trim().startsWith('http') || conteudo.includes('pje.tj')) {
                if (scribeDisponivel) {
                    try {
                        // Tentativa de usar o Scribe.js
                        textoProcessado = await processarLink(conteudo, doc.nome);
                    } catch (error) {
                        console.error(`Erro ao processar ${doc.nome}:`, error);
                        textoProcessado = `[Link ${doc.nome}]: ${conteudo}\n\n(Não foi possível processar automaticamente)`;
                    }
                } else {
                    // Scribe não disponível, usar o link direto
                    textoProcessado = `[Link ${doc.nome}]: ${conteudo}`;
                }
            } else {
                // Não é link, usar o conteúdo como está
                textoProcessado = conteudo.trim();
            }
            
            // Adicionar ao resumo
            resumoConcatenado += `<strong>${doc.nome}:</strong><br>${textoProcessado}<br><br>`;
        }
        
        // 5. Atualizar o campo de resumo
        const resumoElement = container.querySelector('#resumo');
        if (resumoElement) {
            resumoElement.innerHTML = resumoConcatenado.trim();
            
            // Atualizar contagem de caracteres
            const contadorElement = container.querySelector('#resumoCount');
            if (contadorElement) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = resumoConcatenado;
                const textoSemTags = tempDiv.textContent || tempDiv.innerText || '';
                
                const count = textoSemTags.trim().length;
                contadorElement.textContent = count + ' caracteres';
                
                if (count > 5000) {
                    contadorElement.classList.add('limit-exceeded');
                } else {
                    contadorElement.classList.remove('limit-exceeded');
                }
            }
        }
        
        // 6. Mostrar mensagem de sucesso apropriada
        const msgSucesso = scribeDisponivel 
            ? 'Campos concatenados com sucesso!' 
            : 'Campos concatenados com sucesso (sem processamento de PDF - Scribe.js não disponível)';
        
        mostrarMensagem(container, 'success', msgSucesso);
        
    } catch (error) {
        console.error('Erro ao concatenar campos:', error);
        mostrarMensagem(container, 'error', `Ocorreu um erro: ${error.message}`);
    } finally {
        // Esconder overlay de processamento
        if (processingOverlay) {
            processingOverlay.style.display = 'none';
        }
    }
}



// Função para limpar campos do editor
// Função para limpar TODOS os campos do editor e formulário
function limparCamposEditor(container) {
    const confirmacao = confirm('Tem certeza que deseja limpar todos os campos? Esta ação não pode ser desfeita.');
    if (!confirmacao) return;
    
    // ===== LIMPAR CAMPOS DE TEXTO SIMPLES =====
    const camposTexto = [
        'numeroInquerito', 'recebimentoDenuncia', 'dataSentenca',
        'numeroProcesso', 'dataExpedicao', 'uf', 'municipio', 'localCustodia',
        'mandadoPrisao', 'orgaoJudiciario', 'numeroRecurso', 'orgaoJudiciarioRecurso',
        'camaraJulgadora', 'artigo', 'complemento', 'anos', 'meses', 'dias',
        'dataInfracao', 'dataRecebimentoDenuncia', 'dataPublicacaoPronuncia',
        'dataPublicacaoSentenca', 'dataPublicacaoAcordao', 'dataTransitoDefesa',
        'dataTransitoAcusacao', 'dataTransitoAssistente', 'dataTransitoReu',
        'dataDecisaoRecurso', 'dataTransitoRecurso', 'dataDelito',
        'dataPrisao', 'dataSoltura'
    ];
    
    camposTexto.forEach(campo => {
        const elemento = container.querySelector(`#${campo}`);
        if (elemento) {
            elemento.value = '';
            elemento.classList.remove('campo-preenchido-auto', 'invalid');
        }
    });
    
    // ===== LIMPAR CAMPOS EDITÁVEIS (contenteditable) =====
    const camposEditaveis = ['denuncia', 'sentenca', 'acordao', 'transitoJulgado'];
    camposEditaveis.forEach(campo => {
        const elemento = container.querySelector(`#${campo}`);
        if (elemento) {
            elemento.textContent = '';
            elemento.innerHTML = '';
            
            // Atualizar contagem de caracteres
            const contadorElement = container.querySelector(`#${campo}Count`);
            if (contadorElement) {
                contadorElement.textContent = '0 caracteres';
                contadorElement.classList.remove('limit-exceeded');
            }
        }
    });
    
    // ===== LIMPAR CAMPO DE RESUMO (que pode conter HTML) =====
    const resumoElement = container.querySelector('#resumo');
    if (resumoElement) {
        resumoElement.innerHTML = '';
        resumoElement.textContent = '';
        
        // Atualizar contagem de caracteres
        const contadorElement = container.querySelector('#resumoCount');
        if (contadorElement) {
            contadorElement.textContent = '0 caracteres';
            contadorElement.classList.remove('limit-exceeded');
        }
    }
    
    // ===== LIMPAR TODOS OS CHECKBOXES =====
    const checkboxes = [
        'expedicaoExcepcional', 'crimeTentado', 'violenciaDomestica',
        'resultadoMorte', 'violenciaGraveAmeaca', 'reincidenteComum',
        'reincidenteEspecifico', 'comandoOrganizacao'
    ];
    
    checkboxes.forEach(checkboxId => {
        const checkbox = container.querySelector(`#${checkboxId}`);
        if (checkbox) {
            checkbox.checked = false;
            checkbox.classList.remove('campo-preenchido-auto');
        }
    });
    
    // ===== RESETAR TODOS OS SELECTS PARA VALORES PADRÃO =====
    
    // Tipo de Peça - valor padrão: recolhimento
    const tipoPeca = container.querySelector('#tipoPeca');
    if (tipoPeca) {
        tipoPeca.value = 'recolhimento';
        tipoPeca.classList.remove('campo-preenchido-auto');
    }
    
    // Regime Prisional - valor padrão: semiaberto
    const regimePrisional = container.querySelector('#regimePrisional');
    if (regimePrisional) {
        regimePrisional.value = 'semiaberto';
        regimePrisional.classList.remove('campo-preenchido-auto');
    }
    
    // Tipo de Processo Criminal - limpar seleção
    const tipoProcessoCriminal = container.querySelector('#tipoProcessoCriminal');
    if (tipoProcessoCriminal) {
        tipoProcessoCriminal.value = '';
        tipoProcessoCriminal.classList.remove('campo-preenchido-auto');
    }
    
    // Tipo da Pena - valor padrão: apelacao
    const tipoPena = container.querySelector('#tipoPena');
    if (tipoPena) {
        tipoPena.value = 'originaria';
        tipoPena.classList.remove('campo-preenchido-auto');
    }
    
    // Recorrentes do Recurso - valor padrão: reu
    const recorrentesRecurso = container.querySelector('#recorrentesRecurso');
    if (recorrentesRecurso) {
        recorrentesRecurso.value = 'reu';
        recorrentesRecurso.classList.remove('campo-preenchido-auto');
    }
    
    // Lei - limpar seleção
    const lei = container.querySelector('#lei');
    if (lei) {
        lei.value = '';
        lei.classList.remove('campo-preenchido-auto');
    }
    
    // Fração Progressão - limpar seleção
    const fracaoProgressao = container.querySelector('#fracaoProgressao');
    if (fracaoProgressao) {
        fracaoProgressao.value = '';
        fracaoProgressao.classList.remove('campo-preenchido-auto');
    }
    
    // Fração Livramento - limpar seleção
    const fracaoLivramento = container.querySelector('#fracaoLivramento');
    if (fracaoLivramento) {
        fracaoLivramento.value = '';
        fracaoLivramento.classList.remove('campo-preenchido-auto');
    }
    
    // Motivo Prisão - limpar seleção
    const motivoPrisao = container.querySelector('#motivoPrisao');
    if (motivoPrisao) {
        motivoPrisao.value = '';
        motivoPrisao.classList.remove('campo-preenchido-auto');
    }
    
    // Motivo Soltura - limpar seleção
    const motivoSoltura = container.querySelector('#motivoSoltura');
    if (motivoSoltura) {
        motivoSoltura.value = '';
        motivoSoltura.classList.remove('campo-preenchido-auto');
    }
    
    // ===== RESETAR RADIO BUTTONS PARA VALORES PADRÃO =====
    
    // Tipo de Guia - padrão: definitiva
    const guiaDefinitiva = container.querySelector('#guiaDefinitiva');
    const guiaProvisoria = container.querySelector('#guiaProvisoria');
    if (guiaDefinitiva && guiaProvisoria) {
        guiaDefinitiva.checked = true;
        guiaProvisoria.checked = false;
        guiaDefinitiva.classList.remove('campo-preenchido-auto');
        guiaProvisoria.classList.remove('campo-preenchido-auto');
    }
    
    // Revisão Criminal - padrão: não
    const revisaoSim = container.querySelector('#revisaoSim');
    const revisaoNao = container.querySelector('#revisaoNao');
    if (revisaoSim && revisaoNao) {
        revisaoSim.checked = false;
        revisaoNao.checked = true;
        revisaoSim.classList.remove('campo-preenchido-auto');
        revisaoNao.classList.remove('campo-preenchido-auto');
    }
    
    // ===== RESTAURAR CAMPOS COM VALORES FIXOS =====
    
    // Data de Expedição - manter valor padrão
    const dataExpedicao = container.querySelector('#dataExpedicao');
    if (dataExpedicao) {
        dataExpedicao.value = '15/04/2025 14:10';
        dataExpedicao.classList.remove('campo-preenchido-auto');
    }
    
    // UF - manter valor padrão
    const uf = container.querySelector('#uf');
    if (uf) {
        uf.value = 'Pernambuco';
        uf.classList.remove('campo-preenchido-auto');
    }
    
    // ===== LIMPAR QUALQUER CAMPO RESTANTE =====
    // Esta seção garante que não deixemos nada para trás
    
    // Limpar todos os inputs que possam ter sido esquecidos
    container.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
        // Não limpar campos com valores fixos já restaurados
        if (input.id !== 'dataExpedicao' && input.id !== 'uf') {
            input.value = '';
        }
        input.classList.remove('campo-preenchido-auto', 'invalid');
    });
    
    // Limpar todos os textareas se houver
    container.querySelectorAll('textarea').forEach(textarea => {
        textarea.value = '';
        textarea.classList.remove('campo-preenchido-auto', 'invalid');
    });
    
    // ===== LIMPAR RASCUNHO DO LOCALSTORAGE =====
    localStorage.removeItem('guiaRascunho');
    
    // ===== MOSTRAR MENSAGEM DE SUCESSO =====
    mostrarMensagem(container, 'success', 'Todos os campos foram limpos com sucesso! Pronto para uma nova carta guia.');
    
    console.log('Limpeza completa realizada - todos os campos resetados');
}

// Função para preencher o formulário automaticamente a partir do resumo
function preencherFormularioAutomatico(container, textoResumo) {
    if (!textoResumo || textoResumo.trim() === '') {
        mostrarMensagem(container, 'error', 'O texto está vazio.');
        return;
    }
    
    console.log('Iniciando preenchimento automático...');
    
    // Limpar o HTML do texto antes de processar
    const tempElement = document.createElement('div');
    tempElement.innerHTML = textoResumo;
    const textoSemHTML = tempElement.textContent;
    
    // Modificação para a função extrairValorCampo no código existente:
function extrairValorCampo(texto, nomeCampo) {
    const regex = new RegExp(`${nomeCampo}\\s*:\\s*([^\\n]+)`, 'i');
    const match = texto.match(regex);
    if (match && match[1]) {
        // Garante que pegamos apenas até o final da linha ou até encontrar outro "Campo:"
        let valor = match[1].trim();
        
        // NOVA LÓGICA: Se o campo é uma data, extrair apenas o formato DD/MM/AAAA
        if (nomeCampo.toLowerCase().includes('data')) {
            const dataMatch = valor.match(/(\d{2}\/\d{2}\/\d{4})/);
            if (dataMatch && dataMatch[1]) {
                return dataMatch[1]; // Retorna apenas a data no formato DD/MM/AAAA
            }
        }
        
        // Verificar se há outro "Data" na mesma linha e corta o texto nesse ponto
        const dataIndex = valor.search(/Data\s+d[aeoi]/i);
        if (dataIndex > -1) {
            valor = valor.substring(0, dataIndex).trim();
        }
        
        // Verificar se há outro campo com letra maiúscula seguido de dois pontos na mesma linha
        const proximoCampoIndex = valor.search(/\s+[A-ZÀ-Ú][a-zà-ú\s]*:/);
        if (proximoCampoIndex > -1) {
            valor = valor.substring(0, proximoCampoIndex).trim();
        }
        
        // Verificar se há "Número dos" na mesma linha (caso específico)
        const numeroIndex = valor.search(/Número\s+dos/i);
        if (numeroIndex > -1) {
            valor = valor.substring(0, numeroIndex).trim();
        }
        
        return valor;
    }
    return null;
}
    
    // Campos preenchidos com sucesso
    const camposPreenchidos = [];
   
    // Extrair número do processo
    const processoRegex = /\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}/;
    const matchProcesso = textoSemHTML.match(processoRegex);
    if (matchProcesso) {
        const numeroProcesso = container.querySelector('#numeroProcesso');
        if (numeroProcesso) {
            numeroProcesso.value = matchProcesso[0];
            camposPreenchidos.push(numeroProcesso);
        }
    }
    
    // Órgão Judiciário - extrair diretamente pelo formato específico
    const orgaoJudiciarioValor = extrairValorCampo(textoSemHTML, 'Órgão Judiciário');
    if (orgaoJudiciarioValor) {
        const orgaoJudiciario = container.querySelector('#orgaoJudiciario');
        if (orgaoJudiciario) {
            orgaoJudiciario.value = orgaoJudiciarioValor;
            camposPreenchidos.push(orgaoJudiciario);
        }
        
        // Também preencher o órgão judiciário do recurso
        const orgaoJudiciarioRecurso = container.querySelector('#orgaoJudiciarioRecurso');
        if (orgaoJudiciarioRecurso) {
            orgaoJudiciarioRecurso.value = orgaoJudiciarioValor;
            camposPreenchidos.push(orgaoJudiciarioRecurso);
        }
    } else {
        // Fallback para o método anterior
        const orgaoRegex = /(Vara|Juizado|Tribunal).+?(?=\n)/i;
        const matchOrgao = textoSemHTML.match(orgaoRegex);
        if (matchOrgao) {
            const orgaoJudiciario = container.querySelector('#orgaoJudiciario');
            if (orgaoJudiciario) {
                orgaoJudiciario.value = matchOrgao[0].trim();
                camposPreenchidos.push(orgaoJudiciario);
            }
            
            // Também preencher o órgão judiciário do recurso
            const orgaoJudiciarioRecurso = container.querySelector('#orgaoJudiciarioRecurso');
            if (orgaoJudiciarioRecurso) {
                orgaoJudiciarioRecurso.value = matchOrgao[0].trim();
                camposPreenchidos.push(orgaoJudiciarioRecurso);
            }
        }
    }
    
    // Extrair UF e Município
    // UF
    const ufRegex = /(?:UF|estado)[\s:]*([A-Za-zÀ-ÖØ-öø-ÿ\s]+)(?=\n|,|\.|\s-)/i;
    const matchUF = textoSemHTML.match(ufRegex);
    if (matchUF && matchUF[1]) {
        const ufField = container.querySelector('#uf');
        if (ufField) {
            ufField.value = matchUF[1].trim();
            camposPreenchidos.push(ufField);
        }
    }
    
    // Município
    const municipioRegex = /(?:munic[íi]pio|cidade)[\s:]*([A-Za-zÀ-ÖØ-öø-ÿ\s]+)(?=\n|,|\.|\s-)/i;
    const matchMunicipio = textoSemHTML.match(municipioRegex);
    if (matchMunicipio && matchMunicipio[1]) {
        const municipioField = container.querySelector('#municipio');
        if (municipioField) {
            municipioField.value = matchMunicipio[1].trim();
            camposPreenchidos.push(municipioField);
        }
    }
    
    // Local de Custódia
    const custodiaRegex = /(?:local\s*(?:de|da)\s*cust[óo]dia|estabelecimento\s*(?:prisional|penal)|pres[íi]dio|cadeia)[\s:]*([A-Za-zÀ-ÖØ-öø-ÿ\s\d\-\.]+)(?=\n|,|\.|\s-)/i;
    const matchCustodia = textoSemHTML.match(custodiaRegex);
    if (matchCustodia && matchCustodia[1]) {
        const custodiaField = container.querySelector('#localCustodia');
        if (custodiaField) {
            custodiaField.value = matchCustodia[1].trim();
            camposPreenchidos.push(custodiaField);
        }
    }
    
    // Câmara Julgadora - corrigir a expressão regular para não capturar texto extra
    const camaraValor = extrairValorCampo(textoSemHTML, 'Câmara Julgadora do Recurso');
    if (camaraValor) {
        const camara = container.querySelector('#camaraJulgadora');
        if (camara) {
            camara.value = camaraValor;
            camposPreenchidos.push(camara);
            console.log('Câmara Julgadora preenchida via extração direta:', camaraValor);
        }
    } else {
        // Expressão regular melhorada para não capturar texto além do esperado
        const camaraRegex = /C[âa]mara\s*(?:Julgadora|Criminal|Regional)?\s*(?:do\s*Recurso)?[:\s]*([^,\n\.;]+?)(?=\s*Data|\s*\n|$)/i;
        const matchCamara = textoSemHTML.match(camaraRegex);
        if (matchCamara && matchCamara[1]) {
            const camara = container.querySelector('#camaraJulgadora');
            if (camara) {
                camara.value = matchCamara[1].trim();
                camposPreenchidos.push(camara);
                console.log('Câmara Julgadora preenchida via regex:', matchCamara[1].trim());
            }
        }
    }
    
    // Extrair tipo processo criminal
    const tipoProcessoValor = extrairValorCampo(textoSemHTML, 'Tipo de Processo Criminal');
    if (tipoProcessoValor) {
        const tipoProcesso = container.querySelector('#tipoProcessoCriminal');
        if (tipoProcesso) {
            const tipoTexto = tipoProcessoValor.toLowerCase();
            if (tipoTexto.includes('ordinário') || tipoTexto.includes('ordinario')) {
                tipoProcesso.value = '283';
                camposPreenchidos.push(tipoProcesso);
                console.log('Tipo de Processo Criminal preenchido: Ordinário (283)');
            } else if (tipoTexto.includes('sumário') || tipoTexto.includes('sumario')) {
                tipoProcesso.value = '284';
                camposPreenchidos.push(tipoProcesso);
                console.log('Tipo de Processo Criminal preenchido: Sumário (284)');
            } else if (tipoTexto.includes('sumaríssimo') || tipoTexto.includes('sumarissimo')) {
                tipoProcesso.value = '285';
                camposPreenchidos.push(tipoProcesso);
                console.log('Tipo de Processo Criminal preenchido: Sumaríssimo (285)');
            }
        }
    } else {
        // Fallback para o método anterior
        const tipoProcessoRegex = /a[çc][ãa]o\s*penal\s*(?:-|–)?\s*(ordin[áa]ri[ao]|sum[áa]ri[ao]|sumar[ií]ssim[ao])/i;
        const matchTipoProcesso = textoSemHTML.match(tipoProcessoRegex);
        if (matchTipoProcesso && matchTipoProcesso[1]) {
            const tipoProcesso = container.querySelector('#tipoProcessoCriminal');
            if (tipoProcesso) {
                const tipoTexto = matchTipoProcesso[1].toLowerCase();
                if (tipoTexto.includes('ordinari')) {
                    tipoProcesso.value = '283';
                    camposPreenchidos.push(tipoProcesso);
                    console.log('Tipo de Processo Criminal preenchido via regex: Ordinário (283)');
                } else if (tipoTexto.includes('sumari') && !tipoTexto.includes('sumarissim')) {
                    tipoProcesso.value = '284';
                    camposPreenchidos.push(tipoProcesso);
                    console.log('Tipo de Processo Criminal preenchido via regex: Sumário (284)');
                } else if (tipoTexto.includes('sumarissim')) {
                    tipoProcesso.value = '285';
                    camposPreenchidos.push(tipoProcesso);
                    console.log('Tipo de Processo Criminal preenchido via regex: Sumaríssimo (285)');
                }
            }
        }
    }
    
    // Extrair revisão criminal
    const revisaoRegex = /revis[ãa]o\s*criminal[\s:]*(sim|n[ãa]o)/i;
    const matchRevisao = textoSemHTML.match(revisaoRegex);
    if (matchRevisao && matchRevisao[1]) {
        const revisaoSim = container.querySelector('#revisaoSim');
        const revisaoNao = container.querySelector('#revisaoNao');
        if (matchRevisao[1].toLowerCase().includes('sim')) {
            if (revisaoSim) {
                revisaoSim.checked = true;
                camposPreenchidos.push(revisaoSim);
            }
        } else {
            if (revisaoNao) {
                revisaoNao.checked = true;
                camposPreenchidos.push(revisaoNao);
            }
        }
    }
    
    // Extrair datas usando o formato padronizado "Campo: Valor"
    // Data da Infração - extrair e preencher data do delito
    const dataInfracaoValor = extrairValorCampo(textoSemHTML, 'Data da Infração');
    if (dataInfracaoValor && dataInfracaoValor.match(/\d{2}\/\d{2}\/\d{4}/)) {
        // Preencher dataInfracao
        const dataInfracao = container.querySelector('#dataInfracao');
        if (dataInfracao) {
            dataInfracao.value = dataInfracaoValor;
            camposPreenchidos.push(dataInfracao);
        }
        
        // Também preencher dataDelito com o mesmo valor
        const dataDelito = container.querySelector('#dataDelito');
        if (dataDelito) {
            dataDelito.value = dataInfracaoValor;
            camposPreenchidos.push(dataDelito);
            console.log('Data do Delito preenchida a partir da Data da Infração:', dataInfracaoValor);
        }
    }
    
    // Data de Trânsito em Julgado da Acusação - extrair da Data do Transito MP
    const transitoMPValor = extrairValorCampo(textoSemHTML, 'Data do Transito MP');
    if (transitoMPValor && transitoMPValor.match(/\d{2}\/\d{2}\/\d{4}/)) {
        const transitoAcusacao = container.querySelector('#dataTransitoAcusacao');
        if (transitoAcusacao) {
            transitoAcusacao.value = transitoMPValor;
            camposPreenchidos.push(transitoAcusacao);
            console.log('Data Trânsito Acusação preenchida a partir da Data do Transito MP:', transitoMPValor);
        }
    }
    
    // Outras datas - mapear normal
    const datasMap = {
        'dataRecebimentoDenuncia': 'Data do Recebimento da Denúncia',
        'dataPublicacaoPronuncia': 'Data da Publicação da Pronúncia',
        'dataPublicacaoSentenca': 'Data da Sentença',
        'dataPublicacaoAcordao': 'Data da Publicação do Acórdão',
        'dataTransitoDefesa': 'Data do Transito Defesa',
        'dataTransitoAssistente': 'Data do Transito Assistente',
        'dataTransitoReu': 'Data do Transito Réu',
        'dataDecisaoRecurso': 'Data da Decisão do Recurso',
        'dataTransitoRecurso': 'Data do Transito do Recurso',
        'dataTransitoJulgado': 'Data da Trânsito em Julgado do Processo'
    };
    
    // Extrair outras datas usando os nomes mapeados
    Object.entries(datasMap).forEach(([campoId, nomeCampo]) => {
        // Não processar datas que já foram tratadas especialmente
        if (campoId === 'dataInfracao' || campoId === 'dataDelito' || campoId === 'dataTransitoAcusacao') {
            return;
        }
        
        const campo = container.querySelector(`#${campoId}`);
        if (campo) {
            const valorDireto = extrairValorCampo(textoSemHTML, nomeCampo);
            if (valorDireto && valorDireto.match(/\d{2}\/\d{2}\/\d{4}/)) {
                campo.value = valorDireto;
                camposPreenchidos.push(campo);
                console.log(`Campo ${campoId} preenchido com ${valorDireto}`);
            }
        }
    });
    
    // Extrair Data do Transito do Recurso para determinar o Tipo da Pena
    const dataTransitoRecursoValor = extrairValorCampo(textoSemHTML, 'Data do Transito do Recurso');
    
    // Determinar o Tipo da Pena com base na Data do Transito do Recurso
    const tipoPena = container.querySelector('#tipoPena');
    if (tipoPena) {
        if (dataTransitoRecursoValor && dataTransitoRecursoValor.match(/\d{2}\/\d{2}\/\d{4}/)) {
            // Se tiver data de trânsito do recurso, é uma Apelação Criminal
            tipoPena.value = 'apelacao';
            console.log('Tipo da Pena definido como Apelação Criminal devido à presença de data de trânsito do recurso');
        } else {
            // Se não tiver data de trânsito do recurso, é Originária
            tipoPena.value = 'originaria';
            console.log('Tipo da Pena definido como Originária devido à ausência de data de trânsito do recurso');
        }
        camposPreenchidos.push(tipoPena);
    }
    
    // Número do Recurso
    const numRecursoRegex = /(?:n[°º]|n[úu]mero)\s*(?:do)?\s*recurso[:\s]*(\d+[-./]?\d*)/i;
    const matchNumRecurso = textoSemHTML.match(numRecursoRegex);
    if (matchNumRecurso && matchNumRecurso[1]) {
        const numRecurso = container.querySelector('#numeroRecurso');
        if (numRecurso) {
            numRecurso.value = matchNumRecurso[1].trim();
            camposPreenchidos.push(numRecurso);
        }
    }
    
    // Recorrentes do Recurso
    const recorrentesRegex = /recorrente[s]?[:\s]*((?:o\s*r[ée]u|(?:minist[ée]rio\s*p[úu]blico|mp)|defensor(?:ia)?|advogado))/i;
    const matchRecorrentes = textoSemHTML.match(recorrentesRegex);
    if (matchRecorrentes && matchRecorrentes[1]) {
        const recorrentes = container.querySelector('#recorrentesRecurso');
        if (recorrentes) {
            const recorrenteTexto = matchRecorrentes[1].toLowerCase();
            if (recorrenteTexto.includes('réu') || recorrenteTexto.includes('reu')) {
                recorrentes.value = 'reu';
            } else if (recorrenteTexto.includes('ministério') || recorrenteTexto.includes('ministerio') || recorrenteTexto.includes('mp')) {
                recorrentes.value = 'mp';
            } else {
                recorrentes.value = 'outro';
            }
            camposPreenchidos.push(recorrentes);
        }
    }
    
    // Tipificação Penal
    
    // Lei
    const leiRegex = /(?:lei|c[óo]digo)\s*(?:n[°º]?)?\s*(\d+)/i;
    const matchLei = textoSemHTML.match(leiRegex);
    if (matchLei && matchLei[1]) {
        const lei = container.querySelector('#lei');
        if (lei) {
            const leiNum = matchLei[1].trim();
            
            // Verificar se o número corresponde a alguma das opções no select
            const options = Array.from(lei.options);
            const found = options.some(option => {
                if (option.value === leiNum || option.textContent.includes(leiNum)) {
                    lei.value = option.value;
                    camposPreenchidos.push(lei);
                    return true;
                }
                return false;
            });
        }
    }
    
    // Complemento com Infração Imputada
    const infracaoImputadaValor = extrairValorCampo(textoSemHTML, 'Infração Imputada');
    if (infracaoImputadaValor) {
        // Preencher o complemento com a infração imputada completa
        const complemento = container.querySelector('#complemento');
        if (complemento) {
            complemento.value = infracaoImputadaValor;
            camposPreenchidos.push(complemento);
            console.log('Complemento preenchido com Infração Imputada:', infracaoImputadaValor);
        }
        
        // Verificar se também podemos extrair o artigo da infração imputada
        const artigoMatch = infracaoImputadaValor.match(/(?:art(?:igo)?\.?|§)\s*(\d+(?:[,.\-]\d+)?)/i);
        if (artigoMatch && artigoMatch[1]) {
            const artigo = container.querySelector('#artigo');
            if (artigo) {
                artigo.value = artigoMatch[1].trim();
                camposPreenchidos.push(artigo);
            }
        }
    } else {
        // Artigo - fallback
        const artigoRegex = /(?:art(?:igo)?\.?|§)\s*(\d+(?:[,.\-]\d+)?)/i;
        const matchArtigo = textoSemHTML.match(artigoRegex);
        if (matchArtigo && matchArtigo[1]) {
            const artigo = container.querySelector('#artigo');
            if (artigo) {
                artigo.value = matchArtigo[1].trim();
                camposPreenchidos.push(artigo);
            }
        }
        
        // Complemento - fallback
        const complementoRegex = /(?:(?:art(?:igo)?\.?|§)\s*\d+[,.\-]\d+)\s*([^,.\n]+)(?=,|\.|$)/i;
        const matchComplemento = textoSemHTML.match(complementoRegex);
        if (matchComplemento && matchComplemento[1]) {
            const complemento = container.querySelector('#complemento');
            if (complemento) {
                complemento.value = matchComplemento[1].trim();
                camposPreenchidos.push(complemento);
            }
        }
    }
    
    // Checkboxes - Atributos do Crime
    const checkboxMap = {
        'crimeTentado': [/crime\s*tentado/i, /tentativa\s*(?:de|do)\s*crime/i],
        'violenciaDomestica': [/viol[êe]ncia\s*dom[ée]stica/i, /lei\s*maria\s*da\s*penha/i],
        'resultadoMorte': [/resultado\s*(?:de|da)\s*morte/i, /seguido\s*de\s*morte/i],
        'violenciaGraveAmeaca': [/viol[êe]ncia\s*ou\s*grave\s*amea[çc]a/i, /com\s*grave\s*amea[çc]a/i],
        'reincidenteComum': [/reincidente\s*comum/i, /reincid[êe]ncia\s*(?:gen[ée]rica|comum)/i],
        'reincidenteEspecifico': [/reincidente\s*espec[íi]fico/i, /reincid[êe]ncia\s*espec[íi]fica/i],
        'comandoOrganizacao': [/comando\s*(?:de|da)\s*organiza[çc][ãa]o/i, /lideran[çc]a\s*(?:de|da)\s*organiza[çc][ãa]o/i, /hediondo/i]
    };
    
    Object.entries(checkboxMap).forEach(([checkboxId, padroes]) => {
        const checkbox = container.querySelector(`#${checkboxId}`);
        if (checkbox) {
            const encontrado = padroes.some(padrao => padrao.test(textoSemHTML));
            if (encontrado) {
                checkbox.checked = true;
                camposPreenchidos.push(checkbox);
            }
        }
    });
    
    // Frações para progressão de regime e livramento condicional
    
    // Fração Progressão Regime
    const progressaoRegex = /(?:fra[çc][ãa]o|percentual)\s*(?:para)?\s*progress[ãa]o\s*(?:de|do)?\s*regime[:\s]*(\d+\/\d+)/i;
    const matchProgressao = textoSemHTML.match(progressaoRegex);
    if (matchProgressao && matchProgressao[1]) {
        const progressao = container.querySelector('#fracaoProgressao');
        if (progressao) {
            const fracao = matchProgressao[1].trim();
            // Verificar se a fração está nas opções do select
            const options = Array.from(progressao.options);
            options.some(option => {
                if (option.value === fracao) {
                    progressao.value = fracao;
                    camposPreenchidos.push(progressao);
                    return true;
                }
                return false;
            });
        }
    }
    
    // Fração Livramento Condicional
    const livramentoRegex = /(?:fra[çc][ãa]o|percentual)\s*(?:para)?\s*livramento\s*condicional[:\s]*(\d+\/\d+)/i;
    const matchLivramento = textoSemHTML.match(livramentoRegex);
    if (matchLivramento && matchLivramento[1]) {
        const livramento = container.querySelector('#fracaoLivramento');
        if (livramento) {
            const fracao = matchLivramento[1].trim();
            // Verificar se a fração está nas opções do select
            const options = Array.from(livramento.options);
            options.some(option => {
                if (option.value === fracao) {
                    livramento.value = fracao;
                    camposPreenchidos.push(livramento);
                    return true;
                }
                return false;
            });
        }
    }
    
    // Extrair Pena
    const penaValor = extrairValorCampo(textoSemHTML, 'Pena');
    if (penaValor) {
        // Tentar extrair os componentes da pena (anos, meses, dias)
        const penaPadrao = /(\d+)(?:\s*anos?)?(?:\s*(?:,|e)?\s*(\d+)\s*meses?)?(?:\s*(?:,|e)?\s*(\d+)\s*dias?)?/i;
        const matchPena = penaValor.match(penaPadrao);
        
        if (matchPena) {
            if (matchPena[1]) {
                const anos = container.querySelector('#anos');
                if (anos) {
                    anos.value = matchPena[1];
                    camposPreenchidos.push(anos);
                }
            }
            
            if (matchPena[2]) {
                const meses = container.querySelector('#meses');
                if (meses) {
                    meses.value = matchPena[2];
                    camposPreenchidos.push(meses);
                }
            }
            
            if (matchPena[3]) {
                const dias = container.querySelector('#dias');
                if (dias) {
                    dias.value = matchPena[3];
                    camposPreenchidos.push(dias);
                }
            }
        } else {
            // Se não conseguiu extrair com o padrão completo, tentar só com o número
            const anosMatch = penaValor.match(/(\d+)/);
            if (anosMatch && anosMatch[1]) {
                const anos = container.querySelector('#anos');
                if (anos) {
                    anos.value = anosMatch[1];
                    camposPreenchidos.push(anos);
                }
            }
        }
    } else {
        // Fallback para o método anterior
        const penaPadrao = /(?:pena|condena[çc][ãa]o|condena(?:do|da))\s*(?:de|a)?\s*(\d+)\s*anos?(?:\s*(?:,|e)?\s*(\d+)\s*meses?)?(?:\s*(?:,|e)?\s*(\d+)\s*dias?)?/i;
        const matchPena = textoSemHTML.match(penaPadrao);
        
        if (matchPena) {
            if (matchPena[1]) {
                const anos = container.querySelector('#anos');
                if (anos) {
                    anos.value = matchPena[1];
                    camposPreenchidos.push(anos);
                }
            }
            
            if (matchPena[2]) {
                const meses = container.querySelector('#meses');
                if (meses) {
                    meses.value = matchPena[2];
                    camposPreenchidos.push(meses);
                }
            }
            
            if (matchPena[3]) {
                const dias = container.querySelector('#dias');
                if (dias) {
                    dias.value = matchPena[3];
                    camposPreenchidos.push(dias);
                }
            }
        }
    }

// Extrair Tipo de Guia
    const tipoGuiaValor = extrairValorCampo(textoSemHTML, 'Tipo de Guia');
    if (tipoGuiaValor) {
        const tipoPeca = container.querySelector('#tipoPeca');
        if (tipoPeca) {
            const tipoGuiaTexto = tipoGuiaValor.toLowerCase();
            if (tipoGuiaTexto.includes('recolhimento')) {
                tipoPeca.value = 'recolhimento';
                camposPreenchidos.push(tipoPeca);
                console.log('Tipo de Peça preenchido: Guia de Recolhimento');
            } else if (tipoGuiaTexto.includes('execução') || tipoGuiaTexto.includes('execucao')) {
                tipoPeca.value = 'execucao';
                camposPreenchidos.push(tipoPeca);
                console.log('Tipo de Peça preenchido: Guia de Execução Definitiva');
            } else if (tipoGuiaTexto.includes('internação') || tipoGuiaTexto.includes('internacao')) {
                tipoPeca.value = 'internacao';
                camposPreenchidos.push(tipoPeca);
                console.log('Tipo de Peça preenchido: Guia de Internação');
            }
        }
    }
    // Extrair Regime
    const regimeValor = extrairValorCampo(textoSemHTML, 'Regime');
    if (regimeValor) {
        const regimePrisional = container.querySelector('#regimePrisional');
        if (regimePrisional) {
            const regimeTexto = regimeValor.toLowerCase();
            if (regimeTexto.includes('fech')) {
                regimePrisional.value = 'fechado';
            } else if (regimeTexto.includes('semi') || regimeTexto.includes('semi-aberto')) {
                regimePrisional.value = 'semiaberto';
            } else if (regimeTexto.includes('aber')) {
                regimePrisional.value = 'aberto';
            }
            camposPreenchidos.push(regimePrisional);
        }
    } else {
        // Fallback para o método anterior
        const regimeRegex = /regime\s*(fechado|semi[- ]?aberto|aberto)/i;
        const matchRegime = textoSemHTML.match(regimeRegex);
        if (matchRegime && matchRegime[1]) {
            const regimePrisional = container.querySelector('#regimePrisional');
            if (regimePrisional) {
                const regimeTexto = matchRegime[1].toLowerCase();
                if (regimeTexto.includes('fech')) {
                    regimePrisional.value = 'fechado';
                } else if (regimeTexto.includes('semi')) {
                    regimePrisional.value = 'semiaberto';
                } else if (regimeTexto.includes('aber')) {
                    regimePrisional.value = 'aberto';
                }
                camposPreenchidos.push(regimePrisional);
            }
        }
    }
    
    // Extrair dados de prisão e soltura
    const dataPrisaoValor = extrairValorCampo(textoSemHTML, 'Data da Prisão');
    if (dataPrisaoValor && dataPrisaoValor.match(/\d{2}\/\d{2}\/\d{4}/)) {
        const dataPrisao = container.querySelector('#dataPrisao');
        if (dataPrisao) {
            dataPrisao.value = dataPrisaoValor;
            camposPreenchidos.push(dataPrisao);
        }
    }
    
    const dataSolturaValor = extrairValorCampo(textoSemHTML, 'Data da Soltura');
    if (dataSolturaValor && dataSolturaValor.match(/\d{2}\/\d{2}\/\d{4}/)) {
        const dataSoltura = container.querySelector('#dataSoltura');
        if (dataSoltura) {
            dataSoltura.value = dataSolturaValor;
            camposPreenchidos.push(dataSoltura);
        }
    }
    
    // Destacar campos preenchidos
    destacarCamposPreenchidos(camposPreenchidos);
    
    // Mostrar mensagem de sucesso
    mostrarMensagem(container, 'success', `Preenchimento automático concluído. ${camposPreenchidos.length} campos atualizados.`);
    console.log('Preenchimento automático concluído com sucesso.');
}
// Função para destacar campos preenchidos automaticamente
function destacarCamposPreenchidos(campos) {
    campos.forEach(campo => {
        campo.classList.add('campo-preenchido-auto');
        
        // Evento para remover destaque quando editado
        const removeDestaque = () => campo.classList.remove('campo-preenchido-auto');
        
        if (campo.type === 'checkbox' || campo.type === 'radio') {
            campo.addEventListener('change', removeDestaque, {once: true});
        } else {
            campo.addEventListener('input', removeDestaque, {once: true});
        }
    });
}

// Função para salvar rascunho
function salvarRascunho(container) {
    const formData = new FormData(container.querySelector('#guiaRecolhimentoForm'));
    const rascunho = {};
    
    formData.forEach((valor, chave) => {
        rascunho[chave] = valor;
    });
    
    // Também salvar os campos editáveis
    const camposEditaveis = ['denuncia', 'sentenca', 'acordao', 'transitoJulgado'];
    camposEditaveis.forEach(campo => {
        const elemento = container.querySelector(`#${campo}`);
        if (elemento) {
            rascunho[campo] = elemento.textContent;
        }
    });
    
    // Salvar o campo resumo com seu conteúdo HTML
    const resumoElement = container.querySelector('#resumo');
    if (resumoElement) {
        rascunho['resumoHTML'] = resumoElement.innerHTML;
    }
    
    // Também salvar os campos de texto simples
    const camposTexto = ['numeroInquerito', 'recebimentoDenuncia'];
    camposTexto.forEach(campo => {
        const elemento = container.querySelector(`#${campo}`);
        if (elemento) {
            rascunho[campo] = elemento.value;
        }
    });
    
    // Salvar em localStorage
    localStorage.setItem('guiaRascunho', JSON.stringify(rascunho));
    
    // Mostrar mensagem
    mostrarMensagem(container, 'success', 'Rascunho salvo com sucesso!');
}

// Função para salvar formulário
function salvarFormulario(container) {
    // Verificar campos obrigatórios
    const camposObrigatorios = container.querySelectorAll('[required]');
    let camposVazios = false;
    
    camposObrigatorios.forEach(campo => {
        if (!campo.value.trim()) {
            campo.classList.add('invalid');
            camposVazios = true;
        } else {
            campo.classList.remove('invalid');
        }
    });
    
    if (camposVazios) {
        mostrarMensagem(container, 'error', 'Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    // Implementação da função de salvamento
    // Aqui poderia ter uma chamada AJAX para enviar os dados ao servidor
    // Ou exportar para PDF, etc.
    
    // Para fins de demonstração, vamos imprimir o formulário
    window.print();
    
    // Mostrar mensagem
    mostrarMensagem(container, 'success', 'Carta Guia salva com sucesso!');
}

// Função para limpar formulário
function limparFormulario(container) {
    // Limpar valores dos campos
    container.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
        input.value = '';
        input.classList.remove('campo-preenchido-auto');
        input.classList.remove('invalid');
    });
    
    // Limpar checkboxes
    container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
        checkbox.classList.remove('campo-preenchido-auto');
    });
    
    // Restaurar valores padrão dos selects
    const regimePrisional = container.querySelector('#regimePrisional');
    if (regimePrisional) {
        regimePrisional.value = 'semiaberto';
        regimePrisional.classList.remove('campo-preenchido-auto');
    }
    
    const selectLei = container.querySelector('#lei');
    if (selectLei) {
        selectLei.value = '';
        selectLei.classList.remove('campo-preenchido-auto');
    }
    
    // Restaurar valores padrão dos radios
    const radioDef = container.querySelector('input[name="tipoGuia"][value="definitiva"]');
    if (radioDef) {
        radioDef.checked = true;
    }
    
    // Restaurar campos com valores fixos (se houver)
    const dataExpedicao = container.querySelector('#dataExpedicao');
    if (dataExpedicao) {
        dataExpedicao.value = '15/04/2025 14:10';
    }
    
    const tipoPeca = container.querySelector('#tipoPeca');
    if (tipoPeca) {
        tipoPeca.value = 'Guia de Recolhimento';
    }
    
    // Mostrar mensagem
    mostrarMensagem(container, 'success', 'Formulário limpo com sucesso!');
}

// Função para mostrar mensagem ao usuário
function mostrarMensagem(container, tipo, texto) {
    // Remover mensagem anterior, se existir
    const mensagemAnterior = container.querySelector('.status-message');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }
    
    // Criar nova mensagem
    const mensagem = document.createElement('div');
    mensagem.className = `status-message ${tipo}`;
    
    // Ícone adequado ao tipo de mensagem
    let icone = '';
    switch (tipo) {
        case 'success':
            icone = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icone = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icone = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icone = '<i class="fas fa-info-circle"></i>';
    }
    
    mensagem.innerHTML = `${icone} ${texto}`;
    
    // Adicionar ao container
    container.appendChild(mensagem);
    
    // Remover após alguns segundos
    setTimeout(() => {
        if (container.contains(mensagem)) {
            mensagem.remove();
        }
    }, 5000);
}

// ===== FUNÇÕES PARA RECEBER DADOS - VERSÃO CORRIGIDA =====


// Função simples para receber dados do clipboard e distribuir nos campos
async function receberDados() {
    try {
        // Obter dados do clipboard
        const dadosClipboard = await navigator.clipboard.readText();
        
        if (!dadosClipboard || dadosClipboard.trim() === '') {
            alert('Clipboard vazio. Copie o texto antes de clicar no botão.');
            return;
        }
        
        // Normalizar quebras de linha
        const dadosNormalizados = dadosClipboard.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // Extrair valores com regex simples
        const numeroInquerito = extrairValor(dadosNormalizados, /Número de Inquérito:[\s\n]*([\s\S]*?)(?=Data|Denúncia|$)/i);
        const dataRecebimento = extrairValor(dadosNormalizados, /Data do Recebimento da Denúncia:[\s\n]*([\s\S]*?)(?=Data|Denúncia|$)/i);
        const dataSentenca = extrairValor(dadosNormalizados, /Data Sentença:[\s\n]*([\s\S]*?)(?=Sentença|Acórdão|Trânsito|$)/i);
        const linkDenuncia = extrairValor(dadosNormalizados, /Denúncia:[\s\n]*(https?:\/\/[^\s\n]+)/i);
        const linkSentenca = extrairValor(dadosNormalizados, /Sentença:[\s\n]*(https?:\/\/[^\s\n]+)/i);
        const linkAcordao = extrairValor(dadosNormalizados, /Acórdão:[\s\n]*(https?:\/\/[^\s\n]+)/i);
        const linkTransitoJulgado = extrairValor(dadosNormalizados, /Trânsito em Julgado:[\s\n]*(https?:\/\/[^\s\n]+)/i);
        
        // Preencher campos de input
        preencherCampo('#numeroInquerito', numeroInquerito, true);
        preencherCampo('#recebimentoDenuncia', dataRecebimento, true);
        preencherCampo('#dataSentenca', dataSentenca, true);
        
        // Preencher campos de contenteditable
        preencherCampo('#denuncia', linkDenuncia, false);
        preencherCampo('#sentenca', linkSentenca, false);
        preencherCampo('#acordao', linkAcordao, false);
        preencherCampo('#transitoJulgado', linkTransitoJulgado, false);
        
        // Notificar usuário
        alert('Dados preenchidos com sucesso!');
    } catch (error) {
        console.error('Erro ao acessar clipboard:', error);
        alert('Erro ao acessar clipboard. Verifique se o navegador tem permissão para acessar a área de transferência.');
    }
}

// Função auxiliar para extrair valor usando regex
function extrairValor(texto, regex) {
    const match = texto.match(regex);
    return match && match[1] ? match[1].trim() : '';
}

// Função auxiliar para preencher campo
function preencherCampo(seletor, valor, isInput) {
    if (!valor) return;
    
    const campo = document.querySelector(seletor);
    if (!campo) return;
    
    if (isInput) {
        campo.value = valor;
    } else {
        campo.textContent = valor;
        
        // Atualizar contador de caracteres se existir
        const countElement = document.querySelector(`${seletor}Count`);
        if (countElement) {
            countElement.textContent = `${valor.length} caracteres`;
        }
    }
}


// AQUI ADICIONAMOS AS 3 FUNÇÕES AUXILIARES - ANTES DA FUNÇÃO cleanup()

/**
 * Verifica se o conteúdo é um link
 */
function isLink(conteudo) {
    if (!conteudo || typeof conteudo !== 'string') return false;
    
    const texto = conteudo.trim();
    
    // Verificar se começa com http/https
    if (texto.startsWith('http://') || texto.startsWith('https://')) {
        return true;
    }
    
    // Verificar padrão de link do PJE
    const linkPJEPattern = /pje\.tj[a-z]{2}\.jus\.br.*documento/i;
    return linkPJEPattern.test(texto);
}

/**
 * Função simplificada para processar links com o Scribe.js
 * Esta função lida apenas com a parte de processamento de links
 */
async function processarLink(url, nomeDocumento) {
    try {
        console.log(`Processando ${nomeDocumento}: ${url}`);
        
        if (!url || !url.trim()) {
            return `[Link vazio para ${nomeDocumento}]`;
        }
        
        // Se o Scribe não estiver disponível, retornar o link
        if (typeof window.scribe === 'undefined' || typeof window.scribe.extractText !== 'function') {
            throw new Error('Scribe.js não disponível');
        }
        
        // Configurar opções para extração
        const options = {
            timeout: 30000,   // 30 segundos de timeout
            pages: 'all'      // Processar todas as páginas
        };
        
        // Adicionar timeout manual como segurança adicional
        const resultado = await Promise.race([
            window.scribe.extractText(url, options),
            new Promise((_, reject) => setTimeout(() => 
                reject(new Error('Timeout ao processar documento')), 35000)
            )
        ]);
        
        if (resultado && resultado.text) {
            return resultado.text.trim();
        } else {
            throw new Error('Não foi possível extrair texto');
        }
    } catch (error) {
        console.error(`Erro ao processar ${nomeDocumento}:`, error);
        return `[Link ${nomeDocumento}]: ${url}\n\n(Erro: ${error.message})`;
    }
}

/**
 * Atualizar contagem de caracteres para Scribe
 */
function atualizarContagemCaracteresScribe(elemento, container) {
    const id = elemento.id;
    const countElement = container.querySelector(`#${id}Count`);
    
    if (countElement) {
        // Criar elemento temporário para extrair texto sem HTML
        const tempElement = document.createElement('div');
        tempElement.innerHTML = elemento.innerHTML;
        const count = tempElement.textContent.length;
        
        countElement.textContent = count + ' caracteres';
        
        if (count > 5000) {
            countElement.classList.add('limit-exceeded');
        } else {
            countElement.classList.remove('limit-exceeded');
        }
    }
}

// Função de limpeza (será chamada quando o usuário sair da página)
export function cleanup() {
    console.log('Limpando recursos do módulo guia.js');
    
    // Remover toast de notificação, se existir
    const toast = document.getElementById('toast-notificacao');
    if (toast) {
        document.body.removeChild(toast);
    }
}