// Arquivo: preencher_guia.js
// Função principal para processar o resumo e preencher os campos do formulário

function processarResumo(texto) {
    console.log("Processando resumo:", texto);
    
    // Mapeamento entre os rótulos no resumo e os IDs dos campos correspondentes
    const mapeamentoCampos = {
        'Data da Infração': 'dataInfracao',
        'Data de Recebimento da Denúncia': 'dataRecebimentoDenuncia',
        'Data do Recebimento da Denúncia': 'dataRecebimentoDenuncia',
        'Recebimento da Denúncia': 'dataRecebimentoDenuncia',
        'Data de Recebimento da Queixa': 'dataRecebimentoDenuncia',
        'Data de Publicação da Pronúncia': 'dataPublicacaoPronuncia',
        'Data do Publicação da Pronúncia': 'dataPublicacaoPronuncia',
        'Publicação da Pronúncia': 'dataPublicacaoPronuncia',
        'Data de Publicação da Sentença': 'dataPublicacaoSentenca',
        'Data do Publicação da Sentença': 'dataPublicacaoSentenca',
        'Publicação da Sentença': 'dataPublicacaoSentenca',
        'Data de Publicação do Acórdão': 'dataPublicacaoAcordao',
        'Data do Publicação do Acórdão': 'dataPublicacaoAcordao',
        'Publicação do Acórdão': 'dataPublicacaoAcordao',
        'Data do Trânsito em Julgado': 'dataTransitoDefesa',
        'Data de Trânsito em Julgado': 'dataTransitoDefesa',
        'Trânsito em Julgado': 'dataTransitoDefesa',
        'Data do Trânsito em Julgado para Defesa': 'dataTransitoDefesa',
        'Data de Trânsito em Julgado para Defesa': 'dataTransitoDefesa',
        'Trânsito em Julgado para Defesa': 'dataTransitoDefesa',
        'Data do Trânsito em Julgado da Acusação': 'dataTransitoAcusacao',
        'Data de Trânsito em Julgado da Acusação': 'dataTransitoAcusacao',
        'Trânsito em Julgado da Acusação': 'dataTransitoAcusacao',
        'Data do Trânsito em Julgado da Assistente': 'dataTransitoAssistente',
        'Data de Trânsito em Julgado da Assistente': 'dataTransitoAssistente',
        'Trânsito em Julgado da Assistente': 'dataTransitoAssistente',
        'Data do Trânsito em Julgado do réu': 'dataTransitoReu',
        'Data de Trânsito em Julgado do réu': 'dataTransitoReu',
        'Trânsito em Julgado do réu': 'dataTransitoReu',
        'Data do Trânsito em Julgado do Réu': 'dataTransitoReu',
        'Data de Trânsito em Julgado do Réu': 'dataTransitoReu',
        'Trânsito em Julgado do Réu': 'dataTransitoReu',
        'Número de Inquérito': 'numeroInquerito',
        'Nº de Inquérito': 'numeroInquerito',
        'Inquérito nº': 'numeroInquerito',
        'Inquérito n.': 'numeroInquerito',
        'Número do Processo': 'numeroProcesso',
        'Nº do Processo': 'numeroProcesso',
        'Processo nº': 'numeroProcesso',
        'Processo n.': 'numeroProcesso',
        'Número do Recurso': 'numeroRecurso',
        'Nº do Recurso': 'numeroRecurso',
        'Recurso nº': 'numeroRecurso',
        'Recurso n.': 'numeroRecurso',
        'Órgão Judiciário': 'orgaoJudiciario',
        'Mandado de Prisão': 'mandadoPrisao',
        'Local da Custódia': 'localCustodia',
        'Município': 'municipio',
        'UF': 'uf',
        'Câmara Julgadora': 'camaraJulgadora',
        'Artigo': 'artigo',
        'Art.': 'artigo',
        'Art': 'artigo',
        'Data do Delito': 'dataDelito',
        'Tipo de Processo Criminal': 'tipoProcessoCriminal',
        'Lei': 'lei',
        'Regime Prisional': 'regimePrisional',
        'Data de Decisão do Recurso': 'dataDecisaoRecurso',
        'Data do Decisão do Recurso': 'dataDecisaoRecurso',
        'Decisão do Recurso': 'dataDecisaoRecurso',
        'Data de Trânsito em Julgado do Recurso': 'dataTransitoRecurso',
        'Data do Trânsito em Julgado do Recurso': 'dataTransitoRecurso',
        'Trânsito em Julgado do Recurso': 'dataTransitoRecurso',
        'Órgão Judiciário do Recurso': 'orgaoJudiciarioRecurso'
    };
    
    // Array para armazenar campos preenchidos para destacar permanentemente
    const camposPreenchidos = [];
    
    // Função auxiliar para extrair datas do texto no formato dd/mm/aaaa
    function extrairDatas(texto) {
        const datasEncontradas = {};
        const regexData = /(\d{2}\/\d{2}\/\d{4})/g;
        let match;
        
        // Buscar datas próximas a termos específicos
        const termosDatas = [
            { termo: "infração", campo: "dataInfracao" },
            { termo: "denúncia", campo: "dataRecebimentoDenuncia" },
            { termo: "pronúncia", campo: "dataPublicacaoPronuncia" },
            { termo: "sentença", campo: "dataPublicacaoSentenca" },
            { termo: "acórdão", campo: "dataPublicacaoAcordao" },
            { termo: "trânsito em julgado", campo: "dataTransitoDefesa" },
            { termo: "trânsito em julgado para defesa", campo: "dataTransitoDefesa" },
            { termo: "trânsito em julgado da acusação", campo: "dataTransitoAcusacao" },
            { termo: "trânsito em julgado do réu", campo: "dataTransitoReu" },
            { termo: "trânsito em julgado do recurso", campo: "dataTransitoRecurso" },
            { termo: "decisão do recurso", campo: "dataDecisaoRecurso" },
            { termo: "delito", campo: "dataDelito" }
        ];
        
        // Para cada termo, buscar datas próximas (até 100 caracteres)
        termosDatas.forEach(({termo, campo}) => {
            const indice = texto.toLowerCase().indexOf(termo.toLowerCase());
            if (indice !== -1) {
                // Examinar 100 caracteres antes e depois do termo
                const inicio = Math.max(0, indice - 100);
                const fim = Math.min(texto.length, indice + 100);
                const trecho = texto.substring(inicio, fim);
                
                // Buscar datas neste trecho
                const datasNoTrecho = trecho.match(regexData);
                if (datasNoTrecho && datasNoTrecho.length > 0) {
                    // Usar a data mais próxima do termo
                    datasEncontradas[campo] = datasNoTrecho[0];
                }
            }
        });
        
        return datasEncontradas;
    }
    
    // Procurar por datas no texto
    const datasExtras = extrairDatas(texto);
    console.log("Datas extraídas:", datasExtras);
    
    // Preencher campos de data encontrados
    for (const [campo, valor] of Object.entries(datasExtras)) {
        const campoEl = document.getElementById(campo);
        if (campoEl) {
            campoEl.value = valor;
            camposPreenchidos.push(campoEl);
        }
    }
    
    // Procurar por padrões no texto usando expressões regulares mais flexíveis
    for (const [rotulo, campoId] of Object.entries(mapeamentoCampos)) {
        // Expressão regular mais flexível para encontrar o valor após o rótulo
        // Considera vários tipos de separadores e espaços
        const regex = new RegExp(`${rotulo}\\s*[:;.,\\-–—]?\\s*([^\\n\\r:;.,]+)`, 'i');
        const match = texto.match(regex);
        
        console.log(`Buscando: ${rotulo} para campo ${campoId}`);
        
        if (match && match[1]) {
            const valor = match[1].trim();
            console.log(`Encontrado: ${rotulo} = "${valor}"`);
            
            const campo = document.getElementById(campoId);
            
            if (campo && !camposPreenchidos.includes(campo)) { // Evitar sobrescrever dados já encontrados
                // Verificar se é um campo de seleção
                if (campo.tagName === 'SELECT') {
                    // Procurar a opção pelo texto
                    const opcaoEncontrada = Array.from(campo.options).find(
                        option => option.text.toLowerCase().includes(valor.toLowerCase())
                    );
                    
                    if (opcaoEncontrada) {
                        campo.value = opcaoEncontrada.value;
                        camposPreenchidos.push(campo);
                    } else {
                        console.log(`Não foi possível encontrar a opção "${valor}" para o campo ${campoId}`);
                    }
                } else {
                    // Campo normal de texto
                    campo.value = valor;
                    camposPreenchidos.push(campo);
                }
                
                // Destacar o campo preenchido temporariamente
                campo.style.transition = 'background-color 0.5s ease';
                campo.style.backgroundColor = '#e6ffec';
            }
        }
    }
    
    // Extrair artigos do código penal (formato comum: "Art. 121, §2º")
    const regexArtigo = /art(?:igo)?\.?\s*(\d+)[^\d]+((?:\d+|§\d+º?|[IVX]+|inciso\s+[IVX]+)[^.;]*)?/gi;
    let artigoMatch;
    while ((artigoMatch = regexArtigo.exec(texto)) !== null) {
        const numeroArtigo = artigoMatch[1];
        let complemento = artigoMatch[2] ? artigoMatch[2].trim() : '';
        
        const campoArtigo = document.getElementById('artigo');
        const campoComplemento = document.getElementById('complemento');
        
        if (campoArtigo && !campoArtigo.value) {
            campoArtigo.value = numeroArtigo;
            camposPreenchidos.push(campoArtigo);
            
            // Se houver complemento e o campo existir
            if (complemento && campoComplemento && !campoComplemento.value) {
                campoComplemento.value = complemento;
                camposPreenchidos.push(campoComplemento);
            }
            
            // Destacar
            campoArtigo.style.transition = 'background-color 0.5s ease';
            campoArtigo.style.backgroundColor = '#e6ffec';
            
            if (campoComplemento && campoComplemento.value) {
                campoComplemento.style.transition = 'background-color 0.5s ease';
                campoComplemento.style.backgroundColor = '#e6ffec';
            }
            
            // Tentar detectar a lei com base no artigo
            const campoLei = document.getElementById('lei');
            if (campoLei && !campoLei.value) {
                // Tentar identificar qual lei baseado no contexto
                if (texto.toLowerCase().includes('código penal') || texto.toLowerCase().includes('cp')) {
                    const opcaoCodPenal = Array.from(campoLei.options).find(
                        option => option.text.toLowerCase().includes('código penal')
                    );
                    if (opcaoCodPenal) {
                        campoLei.value = opcaoCodPenal.value;
                        camposPreenchidos.push(campoLei);
                    }
                } else if (texto.toLowerCase().includes('lei de drogas') || texto.toLowerCase().includes('11343')) {
                    const opcaoDrogas = Array.from(campoLei.options).find(
                        option => option.text.toLowerCase().includes('lei 11343')
                    );
                    if (opcaoDrogas) {
                        campoLei.value = opcaoDrogas.value;
                        camposPreenchidos.push(campoLei);
                    }
                } else if (texto.toLowerCase().includes('estatuto da criança') || texto.toLowerCase().includes('eca')) {
                    const opcaoECA = Array.from(campoLei.options).find(
                        option => option.text.toLowerCase().includes('lei 8069')
                    );
                    if (opcaoECA) {
                        campoLei.value = opcaoECA.value;
                        camposPreenchidos.push(campoLei);
                    }
                } else if (texto.toLowerCase().includes('desarmamento') || texto.toLowerCase().includes('porte de arma')) {
                    const opcaoArmas = Array.from(campoLei.options).find(
                        option => option.text.toLowerCase().includes('lei 10826')
                    );
                    if (opcaoArmas) {
                        campoLei.value = opcaoArmas.value;
                        camposPreenchidos.push(campoLei);
                    }
                }
            }
        }
    }
    
    // Verificar padrões específicos para checkbox
    const checkboxPatterns = {
        'Crime Tentado': 'crimeTentado',
        'Tentativa': 'crimeTentado',
        'Violência Doméstica': 'violenciaDomestica',
        'Maria da Penha': 'violenciaDomestica',
        'Resultado da Morte': 'resultadoMorte',
        'Seguido de Morte': 'resultadoMorte',
        'Violência ou Grave Ameaça': 'violenciaGraveAmeaca',
        'Mediante Violência': 'violenciaGraveAmeaca',
        'Reincidente Comum': 'reincidenteComum',
        'Reincidente': 'reincidenteComum',
        'Reincidente Específico': 'reincidenteEspecifico',
        'Comando Organização Criminosa': 'comandoOrganizacao',
        'Facção Criminosa': 'comandoOrganizacao',
        'Organização Criminosa': 'comandoOrganizacao'
    };
    
    const checkboxesPreenchidos = [];
    
    for (const [pattern, checkboxId] of Object.entries(checkboxPatterns)) {
        if (texto.toLowerCase().includes(pattern.toLowerCase())) {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = true;
                checkboxesPreenchidos.push(checkboxId);
                
                // Destacar o checkbox preenchido
                const label = document.querySelector(`label[for="${checkboxId}"]`);
                if (label) {
                    label.style.transition = 'color 0.5s ease';
                    label.style.color = '#4CAF50';
                }
            }
        }
    }
    
    // Detectar regime prisional
    const regimePadroes = {
        'regime fechado': 'fechado',
        'fechado': 'fechado',
        'regime semiaberto': 'semiaberto',
        'semiaberto': 'semiaberto',
        'regime aberto': 'aberto',
        'aberto': 'aberto'
    };
    
    const campoRegime = document.getElementById('regimePrisional');
    if (campoRegime && !camposPreenchidos.includes(campoRegime)) {
        for (const [padrao, valor] of Object.entries(regimePadroes)) {
            if (texto.toLowerCase().includes(padrao)) {
                campoRegime.value = valor;
                camposPreenchidos.push(campoRegime);
                break;
            }
        }
    }
    
    // Processar tempo de pena (ex: "3 anos, 2 meses e 15 dias") - padrão mais flexível
    const penaPadrao = /(?:pena|condenado a|condenação de)(?:[^.;]*?)(?:(\d+)\s*anos?)?(?:[^.;]*?)(?:(\d+)\s*meses?)?(?:[^.;]*?)(?:(\d+)\s*dias?)?/i;
    const penaMatch = texto.match(penaPadrao);
    
    const camposPena = [];
    
    if (penaMatch) {
        const anosField = document.getElementById('anos');
        const mesesField = document.getElementById('meses');
        const diasField = document.getElementById('dias');
        
        if (penaMatch[1] && anosField) {
            anosField.value = penaMatch[1];
            camposPena.push(anosField);
        }
        if (penaMatch[2] && mesesField) {
            mesesField.value = penaMatch[2];
            camposPena.push(mesesField);
        }
        if (penaMatch[3] && diasField) {
            diasField.value = penaMatch[3];
            camposPena.push(diasField);
        }
        
        // Destacar campos
        camposPena.forEach(field => {
            field.style.transition = 'background-color 0.5s ease';
            field.style.backgroundColor = '#e6ffec';
        });
    }
    
    // Detectar tipo de processo criminal
    const tipoProcessoTextos = {
        'procedimento ordinário': '283',
        'ação penal - procedimento ordinário': '283',
        'procedimento sumário': '284',
        'ação penal - procedimento sumário': '284',
        'procedimento especial': '285',
        'ação penal - procedimento especial': '285'
    };
    
    const campoTipoProcesso = document.getElementById('tipoProcessoCriminal');
    if (campoTipoProcesso && !camposPreenchidos.includes(campoTipoProcesso)) {
        for (const [texto_padrao, valor] of Object.entries(tipoProcessoTextos)) {
            if (texto.toLowerCase().includes(texto_padrao)) {
                campoTipoProcesso.value = valor;
                camposPreenchidos.push(campoTipoProcesso);
                break;
            }
        }
    }
    
    // Após 2 segundos, marcar permanentemente os campos preenchidos
    setTimeout(() => {
        // Adicionar uma classe para campos preenchidos (será definida no CSS)
        camposPreenchidos.forEach(campo => {
            // Adicionar a classe que mantém a cor verde mais suave
            campo.classList.add('campo-preenchido-auto');
            
            // Adicionar evento para remover a classe quando o usuário editar o campo
            campo.addEventListener('input', function() {
                this.classList.remove('campo-preenchido-auto');
            });
            
            // Para selects, remover a classe quando o valor mudar
            if (campo.tagName === 'SELECT') {
                campo.addEventListener('change', function() {
                    this.classList.remove('campo-preenchido-auto');
                });
            }
        });
        
        // Marcar checkboxes preenchidos
        checkboxesPreenchidos.forEach(checkboxId => {
            const label = document.querySelector(`label[for="${checkboxId}"]`);
            if (label) {
                label.classList.add('checkbox-preenchido-auto');
                
                // Remover classe quando o checkbox for desmarcado
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) {
                    checkbox.addEventListener('change', function() {
                        if (!this.checked) {
                            label.classList.remove('checkbox-preenchido-auto');
                        }
                    });
                }
            }
        });
        
        // Marcar campos de pena
        camposPena.forEach(campo => {
            campo.classList.add('campo-preenchido-auto');
            
            // Remover classe quando o valor for alterado
            campo.addEventListener('input', function() {
                this.classList.remove('campo-preenchido-auto');
            });
        });
        
    }, 2000);
    
    // Log dos campos preenchidos para debugging
    console.log("Campos preenchidos:", camposPreenchidos.map(campo => campo.id));
    
    // Mostrar mensagem de sucesso
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#4CAF50';
    toast.style.color = 'white';
    toast.style.padding = '15px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '1000';
    toast.textContent = `Campos preenchidos automaticamente! Foram encontrados ${camposPreenchidos.length} valores no resumo.`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 4000);
    
    // Adicionar CSS para os campos marcados
    if (!document.getElementById('estilos-campos-preenchidos')) {
        const estilos = document.createElement('style');
        estilos.id = 'estilos-campos-preenchidos';
        estilos.textContent = `
            .campo-preenchido-auto {
                background-color: #e8f5e9 !important;
                border-color: #81c784 !important;
            }
            
            .checkbox-preenchido-auto {
                color: #4CAF50 !important;
                font-weight: bold;
            }
            
            /* Para evitar que a cor desapareça ao focar no campo */
            .campo-preenchido-auto:focus {
                background-color: #e8f5e9 !important;
                border-color: #81c784 !important;
                box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.25) !important;
            }
        `;
        document.head.appendChild(estilos);
    }
}

// Adicionar evento ao botão de preenchimento automático quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    const preencherBtn = document.getElementById('preencherAutomatico');
    if (preencherBtn) {
        preencherBtn.addEventListener('click', function() {
            const resumoField = document.getElementById('resumo');
            const resumoText = resumoField.innerText || resumoField.textContent;
            
            if (!resumoText.trim()) {
                alert('O campo de resumo está vazio! Preencha o resumo primeiro.');
                return;
            }
            
            // Chamar a função de processamento
            processarResumo(resumoText);
        });
    }
});
