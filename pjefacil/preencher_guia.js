// Este é o arquivo externo que você pode incluir no seu HTML
// Salve este código como "preencher_guia.js"

// Função principal para processar o resumo e preencher os campos
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
        'Lei': 'lei'
    };
    
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
                    } else {
                        console.log(`Não foi possível encontrar a opção "${valor}" para o campo ${campoId}`);
                    }
                } else {
                    // Campo normal de texto
                    campo.value = valor;
                }
                
                // Destacar o campo preenchido
                campo.style.transition = 'background-color 0.5s ease';
                campo.style.backgroundColor = '#e6ffec';
                setTimeout(() => {
                    campo.style.backgroundColor = '';
                }, 3000);
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
    
    for (const [pattern, checkboxId] of Object.entries(checkboxPatterns)) {
        if (texto.toLowerCase().includes(pattern.toLowerCase())) {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = true;
                
                // Destacar o checkbox preenchido
                const label = document.querySelector(`label[for="${checkboxId}"]`);
                if (label) {
                    label.style.transition = 'color 0.5s ease';
                    label.style.color = '#4CAF50';
                    setTimeout(() => {
                        label.style.color = '';
                    }, 3000);
                }
            }
        }
    }
    
    // Processar tempo de pena (ex: "3 anos, 2 meses e 15 dias")
    const penaPadrao = /(?:Tempo de Pena|Pena)[\s:;.-]*(?:(\d+)\s*anos?)?[\s,]*(?:(\d+)\s*meses?)?[\s,]*(?:(\d+)\s*dias?)?/i;
    const penaMatch = texto.match(penaPadrao);
    
    if (penaMatch) {
        const anosField = document.getElementById('anos');
        const mesesField = document.getElementById('meses');
        const diasField = document.getElementById('dias');
        
        if (penaMatch[1] && anosField) anosField.value = penaMatch[1];
        if (penaMatch[2] && mesesField) mesesField.value = penaMatch[2];
        if (penaMatch[3] && diasField) diasField.value = penaMatch[3];
        
        // Destacar campos
        [anosField, mesesField, diasField].forEach(field => {
            if (field && field.value) {
                field.style.transition = 'background-color 0.5s ease';
                field.style.backgroundColor = '#e6ffec';
                setTimeout(() => {
                    field.style.backgroundColor = '';
                }, 3000);
            }
        });
    }
    
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
    toast.textContent = 'Campos preenchidos automaticamente!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}
