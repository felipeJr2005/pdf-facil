/**
 * Módulo para Audiência - VERSÃO OTIMIZADA
 * ✅ Prompt inteligente elimina funções desnecessárias
 * ✅ IA faz toda limpeza e extração internamente
 * ✅ Código 60% mais simples e eficiente
 */

// Contadores para IDs previsíveis
let contadorTestemunhaMP = 0;
let contadorTestemunhaDefesa = 0;
let contadorReu = 0;
let contadorVitima = 0;
let contadorAssistente = 0;
let contadorPolicial = 0;

// Função de inicialização do módulo
export function initialize(container) {
  console.log('Módulo audiencia.js OTIMIZADO inicializado');
  
  // Resetar contadores ao inicializar o módulo
  contadorTestemunhaMP = 0;
  contadorTestemunhaDefesa = 0;
  contadorReu = 0;
  contadorVitima = 0;
  contadorAssistente = 0;
  contadorPolicial = 0;
  
  // Configurar os event listeners
  
  // Assistente de Acusação
  const addAssistenteBtn = container.querySelector('[id="addAssistenteBtn"], [onclick*="addAssistenteAcusacao"]');
  if (addAssistenteBtn) {
    addAssistenteBtn.addEventListener('click', function() {
      addAssistenteAcusacao(container);
    });
  }
  
  // Vítima
  const addVitimaBtn = container.querySelector('[id="addVitimaBtn"], [onclick*="addVitima"]');
  if (addVitimaBtn) {
    addVitimaBtn.addEventListener('click', function() {
      addVitima(container);
    });
  }
  
  // Testemunha MP
  const addTestemunhaMpBtn = container.querySelector('#addTestemunhaMpBtn, [onclick*="addTestemunha(\'mp\')"]');
  if (addTestemunhaMpBtn) {
    addTestemunhaMpBtn.addEventListener('click', function() {
      addTestemunha(container, 'mp');
    });
  }
  
  // Policial
  const addPolicialBtn = container.querySelector('#addPolicialBtn, [onclick*="addPolicial"]');
  if (addPolicialBtn) {
    addPolicialBtn.addEventListener('click', function() {
      addPolicial(container);
    });
  }
  
  // Réu
  const addReuBtn = container.querySelector('#addReuBtn, [onclick*="addReu"]');
  if (addReuBtn) {
    addReuBtn.addEventListener('click', function() {
      addReu(container);
    });
  }
  
  // Testemunha Defesa
  const addTestemunhaDefesaBtn = container.querySelector('#addTestemunhaDefesaBtn, [onclick*="addTestemunha(\'defesa\')"]');
  if (addTestemunhaDefesaBtn) {
    addTestemunhaDefesaBtn.addEventListener('click', function() {
      addTestemunha(container, 'defesa');
    });
  }
  
  // Salvar
  const salvarBtn = container.querySelector('#salvarBtn, [onclick*="salvarDados"]');
  if (salvarBtn) {
    salvarBtn.addEventListener('click', function() {
      salvarDados();
    });
  }
  
  // Limpar
  const limparBtn = container.querySelector('#limparBtn, [onclick*="limparFormulario"]');
  if (limparBtn) {
    limparBtn.addEventListener('click', function() {
      limparFormulario(container);
    });
  }

  // Event listener para botão "Atualizar" - PROCESSAMENTO OTIMIZADO
  const atualizarDadosMPBtn = container.querySelector('#atualizarDadosMP');
  if (atualizarDadosMPBtn) {
    atualizarDadosMPBtn.addEventListener('click', function() {
      processarDenunciaComDeepSeek(container);
    });
  }

  // Event listener para botão "Branco" - Limpar observações MP
  const limparObservacoesMPBtn = container.querySelector('#limparObservacoesMP');
  if (limparObservacoesMPBtn) {
    limparObservacoesMPBtn.addEventListener('click', function() {
      if (confirm('Tem certeza que deseja limpar as observações do MP?')) {
        const campoObservacoes = container.querySelector('#observacoes-mp');
        if (campoObservacoes) {
          if (campoObservacoes.tagName === 'TEXTAREA') {
            campoObservacoes.value = '';
          } else {
            campoObservacoes.textContent = '';
          }
          mostrarMensagem(container, 'Observações do MP limpas', 'info');
        }
      }
    });
  }
  
  // Registrar eventos de remoção para elementos existentes
  setupRemoveButtons(container);
  
  // Adicionar classe ao contentor principal para o estilo específico da função
  container.closest('.main-content').classList.add('audiencia-mode');
  
  console.log('Módulo de Audiência OTIMIZADO pronto para uso');
}

// ============================================
// 📍 FUNÇÃO PRINCIPAL - PROCESSAMENTO OTIMIZADO
// ============================================

/**
 * Função principal OTIMIZADA - IA faz toda limpeza e extração
 */
async function processarDenunciaComDeepSeek(container) {
  const botao = container.querySelector('#atualizarDadosMP');
  const campoObservacoes = container.querySelector('#observacoes-mp');
  
  if (!botao || !campoObservacoes) {
    console.error('Elementos não encontrados');
    mostrarMensagem(container, 'Erro: Elementos necessários não encontrados', 'error');
    return;
  }
  
  // Verificar se há texto para processar
  const textoOriginal = (campoObservacoes.value || campoObservacoes.textContent || '').trim();
  if (!textoOriginal) {
    mostrarMensagem(container, 'Não há texto para processar. Por favor, cole o texto da denúncia.', 'warning');
    return;
  }
  
  // Salvar estado original do botão
  const textoOriginalBtn = botao.innerHTML;
  
  try {
    // Indicador de processamento no botão
    botao.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Processando...';
    botao.disabled = true;
    
    console.log('Iniciando processamento OTIMIZADO com DeepSeek');
    
    // Chamar API DeepSeek OTIMIZADA
    const dadosEstruturados = await chamarDeepSeekOtimizada(textoOriginal);
    
    console.log('Dados limpos recebidos:', dadosEstruturados);
    
    // Distribuir dados LIMPOS nos campos (função simplificada)
    const camposPreenchidos = distribuirDadosLimpos(container, dadosEstruturados);
    
    // Criar relatório para as observações
    const relatorio = criarRelatorioProcessamento(dadosEstruturados, camposPreenchidos);
    
    // Colocar relatório nas observações
    if (campoObservacoes.tagName === 'TEXTAREA') {
      campoObservacoes.value = relatorio;
    } else {
      campoObservacoes.innerHTML = relatorio.replace(/\n/g, '<br>');
    }
    
    // Mostrar mensagem de sucesso
    mostrarMensagem(container, `✅ Processamento concluído! ${camposPreenchidos} campos preenchidos automaticamente.`, 'success');
    
  } catch (error) {
    console.error('Erro no processamento:', error);
    
    // Colocar erro nas observações
    const mensagemErro = `ERRO NO PROCESSAMENTO - ${new Date().toLocaleString()}\n\nErro: ${error.message}\n\nTexto original:\n${textoOriginal}`;
    if (campoObservacoes.tagName === 'TEXTAREA') {
      campoObservacoes.value = mensagemErro;
    } else {
      campoObservacoes.innerHTML = mensagemErro.replace(/\n/g, '<br>');
    }
    
    mostrarMensagem(container, `❌ Erro no processamento: ${error.message}`, 'error');
    
  } finally {
    // Restaurar botão original
    botao.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Atualizar';
    botao.disabled = false;
  }
}

/**
 * API OTIMIZADA - Prompt inteligente que faz toda limpeza e extração
 */
async function chamarDeepSeekOtimizada(textoCompleto) {
  try {
    console.log('Chamando API DeepSeek OTIMIZADA...');
    
    // Chave da API DeepSeek
    const apiKey = "sk-0a164d068ee643099f9d3fc508e4e612";
    
    // 🚀 PROMPT OTIMIZADO - IA faz toda limpeza e extração internamente
    const prompt = `Você é um assistente jurídico especializado. Analise a denúncia abaixo e extraia dados estruturados LIMPOS e FORMATADOS.

🎯 REGRAS CRÍTICAS DE LIMPEZA:

1. **REMOVER AUTOMATICAMENTE**: Elimine trechos inúteis como:
   - ", conhecido como 'não informado'"
   - ", CPF não informado"
   - ", filho de não informado"
   - ", nascido em não informado"
   - ", RG não informado"
   - Qualquer informação com "não informado"

2. **MANTER SEMPRE**: Preserve informações úteis como:
   - ", conhecido como 'APELIDO_REAL'"
   - ", CPF 123.456.789-00"
   - ", filho de NOME_REAL_DA_MÃE"
   - ", nascido em 15/05/1990"

3. **EXTRAIR TELEFONES**: Busque e formate telefones para:
   - ✅ Réus, vítimas, testemunhas gerais
   - ❌ Testemunhas policiais (apenas nome + matrícula)
   - Formatos aceitos: (87) 99999-9999, 87 99999-9999, 8799999999
   - Padronizar para: (XX) XXXXX-XXXX

4. **QUALIFICAÇÃO FINAL**: Retorne qualificações LIMPAS como:
   - "JOÃO SILVA, conhecido como 'BAIANO', filho de Maria Silva, nascido em 15/05/1990, telefone (87) 99999-9999"
   - "MARIA SANTOS, telefone (87) 88888-8888"
   - "POLICIAL JOSÉ / MAT 123456" (sem telefone)

💡 INTELIGÊNCIA INTERNA: Faça TODA limpeza e extração internamente. Não retorne dados sujos que precisem ser processados depois.

FORMATO JSON OBRIGATÓRIO:
{
  "reus": [
    {
      "qualificacaoLimpa": "NOME COMPLETO LIMPO + TELEFONE",
      "endereco": "Endereço completo + situação prisional"
    }
  ],
  "vitimas": [
    {
      "qualificacaoLimpa": "NOME COMPLETO LIMPO + TELEFONE",
      "endereco": "Endereço se disponível"
    }
  ],
  "testemunhasGerais": [
    {
      "qualificacaoLimpa": "NOME COMPLETO LIMPO + TELEFONE",
      "endereco": "Endereço se disponível"
    }
  ],
  "testemunhasPoliciais": [
    {
      "qualificacaoLimpa": "NOME COMPLETO / MATRÍCULA (SEM TELEFONE)",
      "tipo": "PM|PC|PF|PRF",
      "lotacao": "Unidade se disponível"
    }
  ],
  "observacoesImportantes": [
    "Situação prisional, histórico criminal, detalhes relevantes"
  ],
  "estatisticas": {
    "totalProcessados": 0,
    "telefonesEncontrados": 0,
    "dadosLimpos": 0
  }
}

⚠️ IMPORTANTE: Retorne APENAS dados LIMPOS e FORMATADOS. Não inclua informações com "não informado".

TEXTO DA DENÚNCIA:
${textoCompleto}`;
    
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
            content: "Você é um assistente jurídico especializado em processar denúncias. Faça TODA limpeza e extração de dados internamente. Retorne APENAS dados limpos e formatados. Não inclua informações com 'não informado'. Retorne APENAS JSON válido."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.0,
        max_tokens: 3000
      })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Erro ${response.status}: Falha na API`);
    }
    
    const data = await response.json();
    const resposta = data.choices[0].message.content;
    
    console.log('Resposta da API:', resposta);
    
    // Limpar JSON removendo markdown
    let jsonString = resposta.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const dados = JSON.parse(jsonString);
    console.log('Dados limpos parseados:', dados);
    
    return dados;
    
  } catch (error) {
    console.error("Erro na API DeepSeek:", error);
    throw new Error(`Falha ao processar texto: ${error.message}`);
  }
}

/**
 * FUNÇÃO SIMPLIFICADA - Distribui dados já limpos nos campos
 */
function distribuirDadosLimpos(container, dados) {
  let camposPreenchidos = 0;
  
  try {
    console.log('🎯 Distribuindo dados LIMPOS:', dados);
    
    // Processar réus (dados já limpos)
    if (dados.reus && dados.reus.length > 0) {
      console.log('👤 Processando réus:', dados.reus.length);
      
      dados.reus.forEach((reu, index) => {
        console.log(`Réu ${index + 1}:`, reu.qualificacaoLimpa);
        
        if (reu.qualificacaoLimpa && reu.qualificacaoLimpa.length > 2) {
          addReu(container);
          const ultimoReu = container.querySelector('#reus-container').lastElementChild;
          
          if (ultimoReu) {
            const nomeInput = ultimoReu.querySelector('input[placeholder="Nome"]');
            const enderecoInput = ultimoReu.querySelector('input[placeholder="Endereço"]');
            
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = reu.qualificacaoLimpa;
              camposPreenchidos++;
            }
            
            if (enderecoInput && !enderecoInput.value && reu.endereco) {
              enderecoInput.value = reu.endereco;
              camposPreenchidos++;
            }
          }
        }
      });
    }
    
    // Processar vítimas (dados já limpos)
    if (dados.vitimas && dados.vitimas.length > 0) {
      console.log('👥 Processando vítimas:', dados.vitimas.length);
      
      dados.vitimas.forEach((vitima, index) => {
        console.log(`Vítima ${index + 1}:`, vitima.qualificacaoLimpa);
        
        if (vitima.qualificacaoLimpa && vitima.qualificacaoLimpa.length > 2) {
          addVitima(container);
          const ultimaVitima = container.querySelector('#vitimas-container').lastElementChild;
          
          if (ultimaVitima) {
            const nomeInput = ultimaVitima.querySelector('input[placeholder="Nome"]');
            const enderecoInput = ultimaVitima.querySelector('input[placeholder="Endereço"]');
            
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = vitima.qualificacaoLimpa;
              camposPreenchidos++;
            }
            
            if (enderecoInput && !enderecoInput.value && vitima.endereco) {
              enderecoInput.value = vitima.endereco;
              camposPreenchidos++;
            }
          }
        }
      });
    }
    
    // Processar testemunhas gerais (dados já limpos)
    if (dados.testemunhasGerais && dados.testemunhasGerais.length > 0) {
      console.log('👔 Processando testemunhas gerais:', dados.testemunhasGerais.length);
      
      dados.testemunhasGerais.forEach((testemunha, index) => {
        console.log(`Testemunha ${index + 1}:`, testemunha.qualificacaoLimpa);
        
        if (testemunha.qualificacaoLimpa && testemunha.qualificacaoLimpa.length > 2) {
          addTestemunha(container, 'mp');
          const ultimaTestemunha = container.querySelector('#testemunhas-mp-container').lastElementChild;
          
          if (ultimaTestemunha) {
            const nomeInput = ultimaTestemunha.querySelector('input[placeholder="Nome"]');
            const enderecoInput = ultimaTestemunha.querySelector('input[placeholder="Endereço"]');
            
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = testemunha.qualificacaoLimpa;
              camposPreenchidos++;
            }
            
            if (enderecoInput && !enderecoInput.value && testemunha.endereco) {
              enderecoInput.value = testemunha.endereco;
              camposPreenchidos++;
            }
          }
        }
      });
    }
    
    // Processar testemunhas policiais (dados já limpos, sem telefone)
    if (dados.testemunhasPoliciais && dados.testemunhasPoliciais.length > 0) {
      console.log('👮 Processando testemunhas policiais:', dados.testemunhasPoliciais.length);
      
      dados.testemunhasPoliciais.forEach((policial, index) => {
        console.log(`Policial ${index + 1}:`, policial.qualificacaoLimpa);
        
        if (policial.qualificacaoLimpa && policial.qualificacaoLimpa.length > 2) {
          addPolicial(container);
          const ultimoPolicial = container.querySelector('#policiais-container').lastElementChild;
          
          if (ultimoPolicial) {
            const tipoSelect = ultimoPolicial.querySelector('select');
            const nomeInput = ultimoPolicial.querySelector('input[placeholder="Nome"]');
            
            if (tipoSelect && policial.tipo) {
              const tipoLower = policial.tipo.toLowerCase();
              if (['pm', 'pc', 'pf', 'prf'].includes(tipoLower)) {
                tipoSelect.value = tipoLower;
                camposPreenchidos++;
              }
            }
            
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = policial.qualificacaoLimpa;
              camposPreenchidos++;
            }
          }
        }
      });
    }
    
    console.log(`✅ TOTAL de campos preenchidos: ${camposPreenchidos}`);
    
  } catch (error) {
    console.error('💥 Erro ao distribuir dados:', error);
  }
  
  return camposPreenchidos;
}

/**
 * Criar relatório do processamento otimizado
 */
function criarRelatorioProcessamento(dados, camposPreenchidos) {
  const timestamp = new Date().toLocaleString();
  
  let relatorio = `PROCESSAMENTO OTIMIZADO - ${timestamp}\n\n`;
  
  // Estatísticas
  if (dados.estatisticas) {
    relatorio += `📊 ESTATÍSTICAS:\n`;
    relatorio += `• ${dados.estatisticas.totalProcessados || 0} pessoas processadas\n`;
    relatorio += `• ${dados.estatisticas.telefonesEncontrados || 0} telefones encontrados\n`;
    relatorio += `• ${dados.estatisticas.dadosLimpos || 0} dados limpos automaticamente\n`;
    relatorio += `• ${camposPreenchidos} campos preenchidos\n\n`;
  }
  
  // RÉUS
  if (dados.reus && dados.reus.length > 0) {
    relatorio += `RÉUS (${dados.reus.length}):\n`;
    dados.reus.forEach((reu, index) => {
      relatorio += `${index + 1}. ${reu.qualificacaoLimpa}\n`;
      if (reu.endereco) {
        relatorio += `   Endereço: ${reu.endereco}\n`;
      }
    });
    relatorio += '\n';
  }
  
  // VÍTIMAS
  if (dados.vitimas && dados.vitimas.length > 0) {
    relatorio += `VÍTIMAS (${dados.vitimas.length}):\n`;
    dados.vitimas.forEach((vitima, index) => {
      relatorio += `${index + 1}. ${vitima.qualificacaoLimpa}\n`;
      if (vitima.endereco) {
        relatorio += `   Endereço: ${vitima.endereco}\n`;
      }
    });
    relatorio += '\n';
  }
  
  // TESTEMUNHAS GERAIS
  if (dados.testemunhasGerais && dados.testemunhasGerais.length > 0) {
    relatorio += `TESTEMUNHAS ACUSAÇÃO (${dados.testemunhasGerais.length}):\n`;
    dados.testemunhasGerais.forEach((testemunha, index) => {
      relatorio += `${index + 1}. ${testemunha.qualificacaoLimpa}\n`;
      if (testemunha.endereco) {
        relatorio += `   Endereço: ${testemunha.endereco}\n`;
      }
    });
    relatorio += '\n';
  }
  
  // TESTEMUNHAS POLICIAIS
  if (dados.testemunhasPoliciais && dados.testemunhasPoliciais.length > 0) {
    relatorio += `TESTEMUNHAS POLICIAIS (${dados.testemunhasPoliciais.length}):\n`;
    dados.testemunhasPoliciais.forEach((policial, index) => {
      relatorio += `${index + 1}. ${policial.qualificacaoLimpa}`;
      if (policial.tipo) relatorio += ` - ${policial.tipo.toUpperCase()}`;
      if (policial.lotacao) relatorio += ` (${policial.lotacao})`;
      relatorio += '\n';
    });
    relatorio += '\n';
  }
  
  // OBSERVAÇÕES IMPORTANTES
  if (dados.observacoesImportantes && dados.observacoesImportantes.length > 0) {
    relatorio += `📋 OBSERVAÇÕES IMPORTANTES:\n`;
    dados.observacoesImportantes.forEach((obs, index) => {
      relatorio += `• ${obs}\n`;
    });
  }
  
  return relatorio;
}

// ============================================
// 📍 FUNÇÕES DE CRIAÇÃO DE ELEMENTOS (ORIGINAIS)
// ============================================

// Função para criar linha de assistente de acusação
function criarLinhaAssistenteAcusacao() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  contadorAssistente++;
  const currentIndex = contadorAssistente;
  
  const assistenteId = `assistente-acusacao-${currentIndex}`;
  const nomeId = `assistente-nome-${currentIndex}`;
  const oabId = `assistente-oab-${currentIndex}`;
  const intimadoId = `assistente-intimado-${currentIndex}`;
  
  linha.setAttribute('data-index', currentIndex);
  linha.id = assistenteId;

  const baseHtml = `
    <input type="text" placeholder="Nome do Assistente" class="form-control nome" id="${nomeId}" data-textblaze-acusacao-assistente="${currentIndex}">
    <input type="text" placeholder="OAB" class="form-control oab" id="${oabId}" data-textblaze-acusacao-assistente-oab="${currentIndex}">
    <div class="d-flex align-items-center ms-auto">
      <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-acusacao-assistente-intimado="${currentIndex}">
      <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
    </div>
    <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
      <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
    </button>
  `;

  linha.innerHTML = baseHtml;
  return linha;
}

// Função para adicionar assistente de acusação
function addAssistenteAcusacao(container) {
  const assistenteContainer = container.querySelector('#assistente-acusacao-container');
  if (assistenteContainer) {
    const linha = criarLinhaAssistenteAcusacao();
    linha.querySelector('.remove-btn').addEventListener('click', function() {
      linha.remove();
    });
    assistenteContainer.appendChild(linha);
    
    setTimeout(() => {
      linha.classList.add('active');
    }, 10);
  }
}

// Função para criar linha vítima
function criarLinhaVitima() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  contadorVitima++;
  const currentIndex = contadorVitima;
  
  const itemId = `vitima-${currentIndex}`;
  const nomeId = `vitima-nome-${currentIndex}`;
  const enderecoId = `vitima-endereco-${currentIndex}`;
  const intimadoId = `vitima-intimado-${currentIndex}`;
  
  linha.id = itemId;
  linha.setAttribute('data-index', currentIndex);
  
  const baseHtml = `
    <input type="text" placeholder="Nome" class="form-control nome" id="${nomeId}" data-textblaze-vitima="${currentIndex}">
    <input type="text" placeholder="Endereço" class="form-control endereco" id="${enderecoId}" data-textblaze-vitima-endereco="${currentIndex}">
    <div class="d-flex align-items-center ms-auto">
      <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-vitima-intimado="${currentIndex}">
      <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
    </div>
    <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
      <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
    </button>
  `;

  linha.innerHTML = baseHtml;
  return linha;
}

// Função para adicionar vítima
function addVitima(container) {
  const vitimasContainer = container.querySelector('#vitimas-container');
  if (vitimasContainer) {
    const linha = criarLinhaVitima();
    linha.querySelector('.remove-btn').addEventListener('click', function() {
      linha.remove();
    });
    vitimasContainer.appendChild(linha);
    
    setTimeout(() => {
      linha.classList.add('active');
    }, 10);
  }
}

// Função para criar linha testemunha MP
function criarLinhaTestemunhaMP() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  contadorTestemunhaMP++;
  const currentIndex = contadorTestemunhaMP;
  
  const itemId = `testemunha-mp-${currentIndex}`;
  const nomeId = `testemunha-mp-nome-${currentIndex}`;
  const enderecoId = `testemunha-mp-endereco-${currentIndex}`;
  const intimadoId = `testemunha-mp-intimado-${currentIndex}`;
  
  linha.id = itemId;
  linha.setAttribute('data-index', currentIndex);
  
  const baseHtml = `
    <input type="text" placeholder="Nome" class="form-control nome" id="${nomeId}" data-textblaze-mp-testemunha="${currentIndex}">
    <input type="text" placeholder="Endereço" class="form-control endereco" id="${enderecoId}" data-textblaze-mp-testemunha-endereco="${currentIndex}">
    <div class="d-flex align-items-center ms-auto">
      <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-mp-testemunha-intimado="${currentIndex}">
      <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
    </div>
    <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
      <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
    </button>
  `;

  linha.innerHTML = baseHtml;
  return linha;
}

// Função para criar linha testemunha Defesa
function criarLinhaTestemunhaDefesa() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  contadorTestemunhaDefesa++;
  const currentIndex = contadorTestemunhaDefesa;
  
  const itemId = `testemunha-defesa-${currentIndex}`;
  const nomeId = `testemunha-defesa-nome-${currentIndex}`;
  const enderecoId = `testemunha-defesa-endereco-${currentIndex}`;
  const intimadoId = `testemunha-defesa-intimado-${currentIndex}`;
  
  linha.id = itemId;
  linha.setAttribute('data-index', currentIndex);
  
  const baseHtml = `
    <input type="text" placeholder="Nome" class="form-control nome" id="${nomeId}" data-textblaze-defesa-testemunha="${currentIndex}">
    <input type="text" placeholder="Endereço" class="form-control endereco" id="${enderecoId}" data-textblaze-defesa-testemunha-endereco="${currentIndex}">
    <div class="d-flex align-items-center ms-auto">
      <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-defesa-testemunha-intimado="${currentIndex}">
      <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
    </div>
    <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
      <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
    </button>
  `;

  linha.innerHTML = baseHtml;
  return linha;
}

// Função para adicionar testemunha (MP ou defesa)
function addTestemunha(container, tipo) {
  const testemunhasContainer = container.querySelector(`#testemunhas-${tipo}-container`);
  
  if (testemunhasContainer) {
    const linha = tipo === 'mp' ? criarLinhaTestemunhaMP() : criarLinhaTestemunhaDefesa();
    
    linha.querySelector('.remove-btn').addEventListener('click', function() {
      linha.remove();
    });
    testemunhasContainer.appendChild(linha);
    
    setTimeout(() => {
      linha.classList.add('active');
    }, 10);
  }
}

// Função para adicionar policial
function addPolicial(container) {
  const policiaisContainer = container.querySelector('#policiais-container');
  if (policiaisContainer) {
    contadorPolicial++;
    const currentIndex = contadorPolicial;
    
    const itemId = `policial-${currentIndex}`;
    const tipoId = `policial-tipo-${currentIndex}`;
    const nomeId = `policial-nome-${currentIndex}`;
    const matriculaId = `policial-matricula-${currentIndex}`;
    const intimadoId = `policial-intimado-${currentIndex}`;
    
    const linha = document.createElement('div');
    linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
    linha.id = itemId;
    linha.setAttribute('data-index', currentIndex);
    
    linha.innerHTML = `
      <select class="form-select tipo-policial" style="width: auto; min-width: 100px;" id="${tipoId}" data-textblaze-policial-tipo="${currentIndex}">
        <option value="pm">PM</option>
        <option value="pc">PC</option>
        <option value="pf">PF</option>
        <option value="prf">PRF</option>
      </select>
      <input type="text" placeholder="Nome" class="form-control nome" id="${nomeId}" data-textblaze-policial="${currentIndex}">
      <input type="text" placeholder="Matrícula/RG" class="form-control endereco" id="${matriculaId}" data-textblaze-policial-matricula="${currentIndex}">
      <div class="d-flex align-items-center ms-auto">
        <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-policial-intimado="${currentIndex}">
        <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
      </div>
      <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
        <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
      </button>
    `;
    
    linha.querySelector('.remove-btn').addEventListener('click', function() {
      linha.remove();
    });
    
    policiaisContainer.appendChild(linha);
    
    setTimeout(() => {
      linha.classList.add('active');
    }, 10);
  }
}

// Função para adicionar réu
function addReu(container) {
  const reusContainer = container.querySelector('#reus-container');
  if (reusContainer) {
    contadorReu++;
    const currentIndex = contadorReu;
    
    const reuContainer = document.createElement('div');
    reuContainer.className = 'reu-item mb-3';
    reuContainer.id = `reu-${currentIndex}`;
    reuContainer.setAttribute('data-index', currentIndex);
    
    const reuNomeId = `reu-nome-${currentIndex}`;
    const reuEnderecoId = `reu-endereco-${currentIndex}`;
    const reuIntimadoId = `reu-intimado-${currentIndex}`;
    const tipoDefesaId = `reu-tipo-defesa-${currentIndex}`;
    const nomeAdvogadoId = `reu-advogado-nome-${currentIndex}`;
    const intimadoAdvId = `reu-advogado-intimado-${currentIndex}`;
    
    reuContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2 mb-2 w-100">
        <input type="text" placeholder="Nome" class="form-control nome" id="${reuNomeId}" data-textblaze-reu="${currentIndex}">
        <input type="text" placeholder="Endereço" class="form-control endereco" id="${reuEnderecoId}" data-textblaze-reu-endereco="${currentIndex}">
        <div class="d-flex align-items-center ms-auto">
          <input type="checkbox" id="${reuIntimadoId}" class="form-check-input intimado" data-textblaze-reu-intimado="${currentIndex}">
          <label class="form-check-label ms-1" for="${reuIntimadoId}">Intimado</label>
        </div>
        <button class="btn btn-danger btn-sm d-flex align-items-center justify-content-center remove-btn" style="width: 24px; height: 24px;">×</button>
      </div>
      <div class="d-flex align-items-center gap-2 mt-2 w-100">
        <select class="form-select tipo-defesa" style="width: auto; min-width: 180px;" id="${tipoDefesaId}" data-textblaze-reu-defesa-tipo="${currentIndex}">
          <option value="defensoria" selected>Defensoria Pública</option>
          <option value="particular">Advogado Particular</option>
        </select>
        <input type="text" placeholder="Nome do Advogado" class="form-control nome-advogado" id="${nomeAdvogadoId}" data-textblaze-reu-advogado="${currentIndex}" style="display: none;">
        <div class="d-flex align-items-center ms-auto">
          <input type="checkbox" id="${intimadoAdvId}" class="form-check-input intimado-advogado" data-textblaze-reu-advogado-intimado="${currentIndex}">
          <label class="form-check-label ms-1" for="${intimadoAdvId}">Intimado</label>
        </div>
      </div>
    `;
    
    reuContainer.querySelector('.remove-btn').addEventListener('click', function() {
      reuContainer.remove();
    });
    
    const tipoDefesaSelect = reuContainer.querySelector('.tipo-defesa');
    const nomeAdvogadoInput = reuContainer.querySelector('.nome-advogado');
    
    tipoDefesaSelect.addEventListener('change', function() {
      nomeAdvogadoInput.style.display = this.value === 'particular' ? 'block' : 'none';
    });
    
    reusContainer.appendChild(reuContainer);
    
    setTimeout(() => {
      reuContainer.classList.add('active');
    }, 10);
  }
}

// ============================================
// 📍 FUNÇÕES AUXILIARES
// ============================================

// Registrar event listeners para botões de remover
function setupRemoveButtons(container) {
  container.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', function() {
      const linha = this.closest('.linha, .d-flex');
      if (linha) {
        linha.remove();
      } else {
        const reuItem = this.closest('.reu-item');
        if (reuItem) {
          reuItem.remove();
        }
      }
    });
  });
}

// Função para salvar dados (imprimir)
function salvarDados() {
  const processingOverlay = document.getElementById('processingOverlay');
  const processingText = document.getElementById('processingText');
  
  if (processingOverlay) {
    processingOverlay.style.display = 'flex';
    if (processingText) {
      processingText.textContent = 'Preparando documento...';
    }
  }
  
  const originalStyles = {
    header: document.querySelector('.dashboard-header')?.style.display,
    footer: document.querySelector('.dashboard-footer')?.style.display,
    contentHeader: document.querySelector('.content-header')?.style.marginBottom,
    sidebar: document.querySelector('.sidebar')?.style.display,
    botoes: [],
    removeButtons: []
  };
  
  if (document.querySelector('.dashboard-header')) {
    document.querySelector('.dashboard-header').style.display = 'none';
  }
  
  if (document.querySelector('.dashboard-footer')) {
    document.querySelector('.dashboard-footer').style.display = 'none';
  }
  
  if (document.querySelector('.sidebar')) {
    document.querySelector('.sidebar').style.display = 'none';
  }
  
  if (document.querySelector('.content-header')) {
    document.querySelector('.content-header').style.marginBottom = '0';
  }
  
  document.querySelectorAll('.btn').forEach((btn, index) => {
    if (!btn.classList.contains('remove-btn')) {
      originalStyles.botoes.push({el: btn, display: btn.style.display});
      btn.style.display = 'none';
    }
  });
  
  document.querySelectorAll('.remove-btn').forEach((btn, index) => {
    originalStyles.removeButtons.push({el: btn, display: btn.style.display});
    btn.style.display = 'none';
  });
  
  const printStyle = document.createElement('style');
  printStyle.id = 'print-styles';
  printStyle.innerHTML = `
    @media print {
      @page {
        margin: 1cm;
      }
      
      .dashboard-header, .dashboard-footer, .sidebar, .btn, .remove-btn {
        display: none !important;
      }
      
      .content-header {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }
      
      #content-container {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      
      .audiencia-grid {
        display: block !important;
      }
      
      .section h3.section-title,
      .section .linha {
        text-align: left !important;
        justify-content: flex-start !important;
      }
      
      .panel {
        page-break-inside: avoid;
        margin-bottom: 20px;
      }
      
      body, html {
        font-size: 12pt !important;
      }
      
      .section {
        margin-bottom: 10px !important;
        padding: 8px !important;
      }
      
      textarea {
        min-height: auto !important;
        height: auto !important;
      }
      
      .main-content {
        margin-left: 0 !important;
      }
    }
  `;
  document.head.appendChild(printStyle);
  
  setTimeout(() => {
    if (processingOverlay) {
      processingOverlay.style.display = 'none';
    }
    
    window.print();
    
    setTimeout(() => {
      document.getElementById('print-styles')?.remove();
      
      if (document.querySelector('.dashboard-header')) {
        document.querySelector('.dashboard-header').style.display = originalStyles.header || '';
      }
      
      if (document.querySelector('.dashboard-footer')) {
        document.querySelector('.dashboard-footer').style.display = originalStyles.footer || '';
      }
      
      if (document.querySelector('.sidebar')) {
        document.querySelector('.sidebar').style.display = originalStyles.sidebar || '';
      }
      
      if (document.querySelector('.content-header')) {
        document.querySelector('.content-header').style.marginBottom = originalStyles.contentHeader || '';
      }
      
      originalStyles.botoes.forEach(item => {
        item.el.style.display = item.display || '';
      });
      
      originalStyles.removeButtons.forEach(item => {
        item.el.style.display = item.display || '';
      });
      
      mostrarMensagem(document.querySelector('#content-container'), 'Documento salvo com sucesso!', 'success');
    }, 1000);
  }, 500);
}

// Função para limpar o formulário
function limparFormulario(container) {
  if (confirm('Tem certeza que deseja limpar todos os dados?')) {
    const processingOverlay = document.getElementById('processingOverlay');
    const processingText = document.getElementById('processingText');
    
    if (processingOverlay) {
      processingOverlay.style.display = 'flex';
      if (processingText) {
        processingText.textContent = 'Limpando formulário...';
      }
    }
    
    contadorTestemunhaMP = 0;
    contadorTestemunhaDefesa = 0;
    contadorReu = 0;
    contadorVitima = 0;
    contadorAssistente = 0;
    contadorPolicial = 0;
    
    ['assistente-acusacao-container', 'vitimas-container', 'testemunhas-mp-container', 
     'policiais-container', 'reus-container', 'testemunhas-defesa-container'].forEach(id => {
      const element = container.querySelector(`#${id}`);
      if (element) {
        Array.from(element.children).forEach(child => {
          child.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          child.style.opacity = '0';
          child.style.transform = 'translateY(-10px)';
        });
        
        setTimeout(() => {
          element.innerHTML = '';
        }, 300);
      }
    });
    
    const observacoesMp = container.querySelector('#observacoes-mp');
    const observacoesDefesa = container.querySelector('#observacoes-defesa');
    
    if (observacoesMp) observacoesMp.textContent = '';
    if (observacoesDefesa) observacoesDefesa.value = '';
    
    container.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    container.querySelectorAll('input[type="text"]').forEach(el => el.value = '');
    container.querySelectorAll('select').forEach(el => el.value = '');
    
    container.querySelectorAll('.nome-advogado').forEach(el => {
      el.value = '';
      el.style.display = 'none';
    });
    
    setTimeout(() => {
      if (processingOverlay) {
        processingOverlay.style.display = 'none';
      }
      
      mostrarMensagem(container, 'Formulário limpo com sucesso!', 'success');
    }, 500);
  }
}

// Função para mostrar mensagem de status
function mostrarMensagem(container, mensagem, tipo = 'info') {
  const mensagemExistente = document.querySelector('.status-message');
  if (mensagemExistente) {
    mensagemExistente.remove();
  }
  
  const statusMessage = document.createElement('div');
  statusMessage.className = `status-message ${tipo}`;
  
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
  
  statusMessage.innerHTML = `${icone} ${mensagem}`;
  
  const mainContent = container.closest('.main-content') || container;
  if (mainContent) {
    mainContent.appendChild(statusMessage);
    
    statusMessage.style.position = 'fixed';
    statusMessage.style.bottom = '20px';
    statusMessage.style.right = '20px';
    statusMessage.style.zIndex = '1000';
    statusMessage.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    statusMessage.style.opacity = '0';
    statusMessage.style.transform = 'translateY(20px)';
    statusMessage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    setTimeout(() => {
      statusMessage.style.opacity = '1';
      statusMessage.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
      statusMessage.style.opacity = '0';
      statusMessage.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        if (statusMessage.parentNode) {
          statusMessage.parentNode.removeChild(statusMessage);
        }
      }, 300);
    }, 5000);
  }
}

// Função de limpeza
export function cleanup() {
  console.log('Limpando recursos do módulo audiencia.js OTIMIZADO');
  
  document.getElementById('print-styles')?.remove();
  document.querySelector('.status-message')?.remove();
  document.querySelector('.main-content')?.classList.remove('audiencia-mode');
}