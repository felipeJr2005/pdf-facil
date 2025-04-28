// Arquivo: preencher_guia.js
// Função principal para processar o resumo e preencher os campos do formulário

function processarResumo(texto) {
    // Mapeamento entre os rótulos no resumo e os IDs dos campos correspondentes
    const mapeamentoCampos = {
        'Data da Infração': 'dataInfracao',
        'Data de Recebimento da Denúncia': 'dataRecebimentoDenuncia',
        'Data de Recebimento da Queixa': 'dataRecebimentoDenuncia',
        'Data do Publicação da Pronúncia': 'dataPublicacaoPronuncia',
        'Data de Publicação da Sentença': 'dataPublicacaoSentenca',
        'Data de Publicação do Acórdão': 'dataPublicacaoAcordao',
        'Data do Trânsito em Julgado para Defesa': 'dataTransitoDefesa',
        'Data de Trânsito em Julgado da Acusação': 'dataTransitoAcusacao',
        'Data de Trânsito em Julgado da Assistente': 'dataTransitoAssistente',
        'Data de Trânsito em Julgado do réu': 'dataTransitoReu',
        'Número de Inquérito': 'numeroInquerito',
        'Número do Processo': 'numeroProcesso',
        'Nº do Processo': 'numeroProcesso',
        'Número do Recurso': 'numeroRecurso',
        'Nº do Recurso': 'numeroRecurso',
        'Órgão Judiciário': 'orgaoJudiciario',
        'Mandado de Prisão': 'mandadoPrisao',
        'Local da Custódia': 'localCustodia',
        'Município': 'municipio',
        'UF': 'uf',
        'Câmara Julgadora': 'camaraJulgadora',
        'Artigo': 'artigo',
        'Data do Delito': 'dataDelito',
        'Tipo de Processo Criminal': 'tipoProcessoCriminal',
        'Lei': 'lei',
        'Regime Prisional': 'regimePrisional',
        'Data de Decisão do Recurso': 'dataDecisaoRecurso',
        'Data de Trânsito em Julgado do Recurso': 'dataTransitoRecurso',
        'Órgão Judiciário do Recurso': 'orgaoJudiciarioRecurso'
    };
    
    // Array para armazenar campos preenchidos para destacar permanentemente
    const camposPreenchidos = [];
    
    // Procurar por padrões no texto
    for (const [rotulo, campoId] of Object.entries(mapeamentoCampos)) {
        const regex = new RegExp(`${rotulo}\\s*[:;.-]\\s*([^\\n\\r]+)`, 'i');
        const match = texto.match(regex);
        
        if (match && match[1]) {
            const valor = match[1].trim();
            const campo = document.getElementById(campoId);
            
            if (campo) {
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
    
    // Verificar padrões específicos para checkbox
    const checkboxPatterns = {
        'Crime Tentado': 'crimeTentado',
        'Violência Doméstica': 'violenciaDomestica',
        'Resultado da Morte': 'resultadoMorte',
        'Violência ou Grave Ameaça': 'violenciaGraveAmeaca',
        'Reincidente Comum': 'reincidenteComum',
        'Reincidente Específico': 'reincidenteEspecifico',
        'Comando Organização Criminosa': 'comandoOrganizacao'
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
    
    // Processar tempo de pena (ex: "3 anos, 2 meses e 15 dias")
    const penaPadrao = /(?:Tempo de Pena|Pena)[\s:;.-]*(?:(\d+)\s*anos?)?[\s,]*(?:(\d+)\s*meses?)?[\s,]*(?:(\d+)\s*dias?)?/i;
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
    toast.textContent = 'Campos preenchidos automaticamente! Os campos marcados em verde foram preenchidos com base no resumo.';
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
