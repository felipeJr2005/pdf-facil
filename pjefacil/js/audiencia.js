/**
 * Módulo para Audiência - Integrado ao tema do dashboard
 * Versão com IDs fixos e grupos separados para Text Blaze + DeepSeek COMPLETO
 * ✅ VERSÃO REESTRUTURADA - Limpeza inteligente + Extração de telefone
 */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

// Contadores para IDs previsíveis
let contadorTestemunhaMP = 0;
let contadorTestemunhaDefesa = 0;
let contadorReu = 0;
let contadorVitima = 0;
let contadorAssistente = 0;
let contadorPolicial = 0;

// ============================================
// FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO
// ============================================

export function initialize(container) {
  console.log('Módulo audiencia.js inicializado com IDs para Text Blaze + DeepSeek COMPLETO');
  
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

  // Event listener para botão "DeepSeek"
  const processarDeepSeekBtn = container.querySelector('#processarDeepSeek');
  if (processarDeepSeekBtn) {
    processarDeepSeekBtn.addEventListener('click', function() {
      processarDenunciaComIA(container, 'deepseek');
    });
  }

  // Event listener para botão "Gemini"
  const processarGeminiBtn = container.querySelector('#processarGemini');
  if (processarGeminiBtn) {
    processarGeminiBtn.addEventListener('click', function() {
      processarDenunciaComIA(container, 'gemini');
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
  
  console.log('Módulo de Audiência pronto para uso');
}

// ============================================
// FUNÇÕES DE PROCESSAMENTO IA
// ============================================

/**
 * Função GENÉRICA para processar denúncia com qualquer IA
 */
async function processarDenunciaComIA(container, modelo) {
  const botao = container.querySelector(`#processar${modelo === 'deepseek' ? 'DeepSeek' : 'Gemini'}`);
  const campoObservacoes = container.querySelector('#observacoes-mp');
  
  if (!botao || !campoObservacoes) {
    console.error('Elementos não encontrados:', {
      botao: !!botao, 
      campoObservacoes: !!campoObservacoes,
      container: container
    });
    mostrarMensagem(container, 'Erro: Elementos necessários não encontrados', 'error');
    return;
  }
  
  const textoOriginal = (campoObservacoes.value || campoObservacoes.textContent || '').trim();
  if (!textoOriginal) {
    mostrarMensagem(container, 'Não há texto para processar. Por favor, cole o texto da denúncia.', 'warning');
    return;
  }
  
  const textoOriginalBtn = botao.innerHTML;
  
  try {
    botao.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Processando...';
    botao.disabled = true;
    
    const nomeModelo = modelo === 'deepseek' ? 'DeepSeek' : 'Gemini';
    console.log(`Iniciando processamento de denúncia com ${nomeModelo}`);
    
    const dadosEstruturados = modelo === 'deepseek' ? 
      await chamarDeepSeekAPI(textoOriginal) : 
      await chamarGeminiAPI(textoOriginal);
    
    console.log('Dados estruturados recebidos:', dadosEstruturados);
    
    const camposPreenchidos = distribuirDadosNosCampos(container, dadosEstruturados, textoOriginal);
    const relatorio = criarRelatorioProcessamento(dadosEstruturados, camposPreenchidos, nomeModelo);
    
    if (campoObservacoes.tagName === 'TEXTAREA') {
      campoObservacoes.value = relatorio;
    } else {
      campoObservacoes.innerHTML = relatorio.replace(/\n/g, '<br>');
    }
    
    mostrarMensagem(container, `✅ Processamento ${nomeModelo} concluído! ${camposPreenchidos} campos preenchidos.`, 'success');
    
  } catch (error) {
    console.error(`Erro no processamento ${modelo}:`, error);
    
    const mensagemErro = `ERRO NO PROCESSAMENTO - ${new Date().toLocaleString()}\n\nErro: ${error.message}\n\nTexto original:\n${textoOriginal}`;
    if (campoObservacoes.tagName === 'TEXTAREA') {
      campoObservacoes.value = mensagemErro;
    } else {
      campoObservacoes.innerHTML = mensagemErro.replace(/\n/g, '<br>');
    }
    
    const nomeModelo = modelo === 'deepseek' ? 'DeepSeek' : 'Gemini';
    mostrarMensagem(container, `❌ Erro no processamento ${nomeModelo}: ${error.message}`, 'error');
    
  } finally {
    const nomeModelo = modelo === 'deepseek' ? 'Ds' : 'Ge';
    botao.innerHTML = `Modelo ${nomeModelo}`;
    botao.disabled = false;
  }
}

/**
 * Função para chamar a API Gemini
 */
async function chamarGeminiAPI(textoCompleto) {
  try {
    console.log('Chamando API Gemini...');
    
    const apiKey = "AIzaSyDm3k3ABMfK8qm73alwDK8GWgJhE368w-s";
    const prompt = `Analise o texto da denúncia judicial e extraia dados estruturados em JSON com testemunhas policiais no formato "NOME / MATRÍCULA".`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${prompt}\n\nTexto: ${textoCompleto}` }] }],
        generationConfig: { temperature: 0.0, maxOutputTokens: 2500 }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Erro ${response.status}: Falha na API Gemini`);
    }
    
    const data = await response.json();
    const resposta = data.candidates[0].content.parts[0].text;
    
    let jsonString = resposta.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const dados = JSON.parse(jsonString);
    return dados;
    
  } catch (error) {
    console.error("Erro na API Gemini:", error);
    throw new Error(`Falha ao processar texto: ${error.message}`);
  }
}

/**
 * Função para chamar a API DeepSeek
 */
async function chamarDeepSeekAPI(textoCompleto) {
  try {
    console.log('Chamando API DeepSeek...');
    
    const apiKey = "sk-0a164d068ee643099f9d3fc508e4e612";
    const prompt = `Analise o texto da denúncia judicial e extraia dados estruturados em JSON com testemunhas policiais no formato "NOME / MATRÍCULA".`;
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Você é um assistente jurídico. Retorne APENAS JSON válido." },
          { role: "user", content: `${prompt}\n\nTexto: ${textoCompleto}` }
        ],
        temperature: 0.0,
        max_tokens: 2500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Erro ${response.status}: Falha na API`);
    }
    
    const data = await response.json();
    const resposta = data.choices[0].message.content;
    
    let jsonString = resposta.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const dados = JSON.parse(jsonString);
    return dados;
    
  } catch (error) {
    console.error("Erro na API DeepSeek:", error);
    throw new Error(`Falha ao processar texto: ${error.message}`);
  }
}
// ============================================
// FUNÇÕES DE PROCESSAMENTO DE DADOS
// ============================================

/**
 * Função para extrair dados de policial (nome e matrícula)
 */
function extrairDadosPolicial(qualificacaoCompleta) {
  const partes = qualificacaoCompleta.split(' / ');
  return {
    nome: partes[0] ? partes[0].trim() : qualificacaoCompleta,
    matricula: partes[1] ? partes[1].trim() : ''
  };
}

/**
 * Extrair nome base da qualificação
 */
function extrairNomeBase(qualificacaoCompleta) {
  if (!qualificacaoCompleta) return '';
  
  const partes = qualificacaoCompleta.split(',');
  let nomeBase = partes[0].trim();
  
  nomeBase = nomeBase
    .replace(/^[^\w\s]+/, '')
    .replace(/[^\w\s]+$/, '')
    .trim();
  
  if (nomeBase.length > 2 && !nomeBase.toLowerCase().includes('não informad')) {
    return nomeBase;
  }
  
  return '';
}

/**
 * Função para limpeza inteligente de qualificação
 */
function limparQualificacaoInteligente(qualificacaoCompleta, textoOriginal = '', nomePessoa = '') {
  if (!qualificacaoCompleta || qualificacaoCompleta.trim() === '') {
    return '';
  }
  
  let qualificacaoLimpa = qualificacaoCompleta
    .replace(/,\s*conhecid[oa]\s+como\s+['"]não\s+informad[oa]['"]?/gi, '')
    .replace(/,\s*CPF\s+não\s+informado/gi, '')
    .replace(/,\s*filh[oa]\s+de\s+não\s+informad[oa]/gi, '')
    .replace(/,\s*nascid[oa]\s+em\s+não\s+informad[oa]/gi, '')
    .replace(/,\s*RG\s+não\s+informado/gi, '')
    .replace(/,\s*natural\s+de\s+não\s+informad[oa]/gi, '')
    .replace(/,\s*residente\s+em\s+não\s+informad[oa]/gi, '')
    .replace(/,\s*,+/g, ',')
    .replace(/,\s*$/g, '')
    .replace(/^\s*,+/g, '')
    .trim();
  
  if (qualificacaoLimpa.length < 3 || qualificacaoLimpa.toLowerCase().includes('não informad')) {
    const nomeBase = extrairNomeBase(qualificacaoCompleta);
    return nomeBase;
  }
  
  return qualificacaoLimpa;
}

/**
 * Distribuir dados nos campos
 */
function distribuirDadosNosCampos(container, dados, textoOriginal = '') {
  let camposPreenchidos = 0;
  
  try {
    console.log('Processando dados:', dados);
    
    // Processar réus
    if (dados.reus && dados.reus.length > 0) {
      dados.reus.forEach((reu) => {
        const nomeBase = extrairNomeBase(reu.qualificacaoCompleta);
        const qualificacaoLimpa = limparQualificacaoInteligente(reu.qualificacaoCompleta, textoOriginal, nomeBase);
        
        if (qualificacaoLimpa && qualificacaoLimpa.length > 2) {
          addReu(container);
          const ultimoReu = container.querySelector('#reus-container').lastElementChild;
          
          if (ultimoReu) {
            const nomeInput = ultimoReu.querySelector('input[placeholder="Nome"]');
            const enderecoInput = ultimoReu.querySelector('input[placeholder="Endereço"]');
            
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = qualificacaoLimpa;
              camposPreenchidos++;
            }
            
            if (enderecoInput && !enderecoInput.value && reu.endereco && reu.endereco.trim() !== '') {
              enderecoInput.value = reu.endereco;
              camposPreenchidos++;
            }
          }
        }
      });
    }
    
    // Processar vítimas
    if (dados.vitimas && dados.vitimas.length > 0) {
      dados.vitimas.forEach((vitima) => {
        const nomeBase = extrairNomeBase(vitima.qualificacaoCompleta);
        const qualificacaoLimpa = limparQualificacaoInteligente(vitima.qualificacaoCompleta, textoOriginal, nomeBase);
        
        if (qualificacaoLimpa && qualificacaoLimpa.length > 2) {
          addVitima(container);
          const ultimaVitima = container.querySelector('#vitimas-container').lastElementChild;
          
          if (ultimaVitima) {
            const nomeInput = ultimaVitima.querySelector('input[placeholder="Nome"]');
            const enderecoInput = ultimaVitima.querySelector('input[placeholder="Endereço"]');
            
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = qualificacaoLimpa;
              camposPreenchidos++;
            }
            
            if (enderecoInput && !enderecoInput.value && vitima.endereco && vitima.endereco.trim() !== '') {
              enderecoInput.value = vitima.endereco;
              camposPreenchidos++;
            }
          }
        }
      });
    }
    
    // Processar testemunhas gerais
    if (dados.testemunhasGerais && dados.testemunhasGerais.length > 0) {
      dados.testemunhasGerais.forEach((testemunha) => {
        const nomeBase = extrairNomeBase(testemunha.qualificacaoCompleta);
        const qualificacaoLimpa = limparQualificacaoInteligente(testemunha.qualificacaoCompleta, textoOriginal, nomeBase);
        
        if (qualificacaoLimpa && qualificacaoLimpa.length > 2) {
          addTestemunha(container, 'mp');
          const ultimaTestemunha = container.querySelector('#testemunhas-mp-container').lastElementChild;
          
          if (ultimaTestemunha) {
            const nomeInput = ultimaTestemunha.querySelector('input[placeholder="Nome"]');
            const enderecoInput = ultimaTestemunha.querySelector('input[placeholder="Endereço"]');
            
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = qualificacaoLimpa;
              camposPreenchidos++;
            }
            
            if (enderecoInput && !enderecoInput.value && testemunha.endereco && testemunha.endereco.trim() !== '') {
              enderecoInput.value = testemunha.endereco;
              camposPreenchidos++;
            }
          }
        }
      });
    }
    
    // Processar testemunhas policiais - CORRIGIDO
    if (dados.testemunhasPoliciais && dados.testemunhasPoliciais.length > 0) {
      dados.testemunhasPoliciais.forEach((policial) => {
        const qualificacaoLimpa = policial.qualificacaoCompleta
          .replace(/,\s*conhecid[oa]\s+como\s+['"]não\s+informad[oa]['"]?/gi, '')
          .replace(/,\s*CPF\s+não\s+informado/gi, '')
          .replace(/,\s*filh[oa]\s+de\s+não\s+informad[oa]/gi, '')
          .replace(/,\s*nascid[oa]\s+em\s+não\s+informad[oa]/gi, '')
          .replace(/,\s*,+/g, ',')
          .replace(/,\s*$/g, '')
          .replace(/^\s*,+/g, '')
          .trim();
        
        if (qualificacaoLimpa && qualificacaoLimpa.length > 2) {
          addPolicial(container);
          const ultimoPolicial = container.querySelector('#policiais-container').lastElementChild;
          
          if (ultimoPolicial) {
            const tipoSelect = ultimoPolicial.querySelector('select');
            const nomeInput = ultimoPolicial.querySelector('input[placeholder="Nome"]');
            const matriculaInput = ultimoPolicial.querySelector('input[placeholder="Matrícula/RG"]');
            
            // Extrair dados do policial
            const dadosPolicial = extrairDadosPolicial(qualificacaoLimpa);
            
            // Preencher tipo de policial
            if (tipoSelect && policial.tipo) {
              const tipoLower = policial.tipo.toLowerCase();
              if (['pm', 'pc', 'pf', 'prf'].includes(tipoLower)) {
                tipoSelect.value = tipoLower;
                camposPreenchidos++;
              }
            }
            
            // Preencher nome
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = dadosPolicial.nome;
              camposPreenchidos++;
            }
            
            // Preencher matrícula
            if (matriculaInput && !matriculaInput.value && dadosPolicial.matricula) {
              matriculaInput.value = dadosPolicial.matricula;
              camposPreenchidos++;
            }
            
            console.log('Policial preenchido:', dadosPolicial.nome, '/', dadosPolicial.matricula);
          }
        }
      });
    }
    
    console.log(`Total de campos preenchidos: ${camposPreenchidos}`);
    
  } catch (error) {
    console.error('Erro ao distribuir dados:', error);
  }
  
  return camposPreenchidos;
}

/**
 * Criar relatório do processamento
 */
function criarRelatorioProcessamento(dados, camposPreenchidos, nomeModelo = 'IA') {
  const timestamp = new Date().toLocaleString();
  let relatorio = `PROCESSAMENTO - ${timestamp}\n\n`;
  
  if (dados.estatisticas) {
    relatorio += `ESTATÍSTICAS:\n`;
    relatorio += `• ${dados.estatisticas.totalMencionados || 0} pessoas mencionadas\n`;
    relatorio += `• ${dados.estatisticas.totalQualificados || 0} qualificadas\n`;
    relatorio += `• ${camposPreenchidos} campos preenchidos automaticamente\n\n`;
  }
  
  if (dados.reus && dados.reus.length > 0) {
    relatorio += `RÉUS (${dados.reus.length}):\n`;
    dados.reus.forEach((reu, index) => {
      relatorio += `${index + 1}. ${reu.qualificacaoCompleta}\n`;
    });
    relatorio += '\n';
  }
  
  if (dados.vitimas && dados.vitimas.length > 0) {
    relatorio += `VÍTIMAS (${dados.vitimas.length}):\n`;
    dados.vitimas.forEach((vitima, index) => {
      relatorio += `${index + 1}. ${vitima.qualificacaoCompleta}\n`;
    });
    relatorio += '\n';
  }
  
  if (dados.testemunhasGerais && dados.testemunhasGerais.length > 0) {
    relatorio += `TESTEMUNHAS ACUSAÇÃO (${dados.testemunhasGerais.length}):\n`;
    dados.testemunhasGerais.forEach((testemunha, index) => {
      relatorio += `${index + 1}. ${testemunha.qualificacaoCompleta}\n`;
    });
    relatorio += '\n';
  }
  
  if (dados.testemunhasPoliciais && dados.testemunhasPoliciais.length > 0) {
    relatorio += `TESTEMUNHAS POLICIAIS (${dados.testemunhasPoliciais.length}):\n`;
    dados.testemunhasPoliciais.forEach((policial, index) => {
      relatorio += `${index + 1}. ${policial.qualificacaoCompleta}`;
      if (policial.tipo) relatorio += ` - ${policial.tipo.toUpperCase()}`;
      relatorio += '\n';
    });
    relatorio += '\n';
  }
  
  return relatorio;
}
// ============================================
// FUNÇÕES DE CRIAÇÃO DE ELEMENTOS
// ============================================

/**
 * Criar linha de assistente de acusação
 */
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

  linha.innerHTML = `
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

  return linha;
}

/**
 * Adicionar assistente de acusação
 */
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

/**
 * Criar linha vítima
 */
function criarLinhaVitima() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  contadorVitima++;
  const currentIndex = contadorVitima;
  
  const itemId = `vitima-${currentIndex}`;
  const nomeId = `vitima-nome-${currentIndex}`;
  const enderecoId = `vitima-endereco-${currentIndex}`;
  const intim