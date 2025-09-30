// Contadores para IDs previsíveis
let contadorTestemunhaMP = 0;
let contadorTestemunhaDefesa = 0;
let contadorReu = 0;
let contadorVitima = 0;
let contadorAssistente = 0;
let contadorPolicial = 0;
let _audienciaBootstrapped = false;
const _listeners = [];


export function initialize(container) {
  if (_audienciaBootstrapped) return;
  _audienciaBootstrapped = true;

  console.log('Módulo audiencia.js inicializado com IDs para Text Blaze + DeepSeek COMPLETO');

  contadorTestemunhaMP = 0;
  contadorTestemunhaDefesa = 0;
  contadorReu = 0;
  contadorVitima = 0;
  contadorAssistente = 0;
  contadorPolicial = 0;

  function on(el, ev, fn){
    if (!el) return;
    el.addEventListener(ev, fn);
    _listeners.push({el, ev, fn});
  }

  const addAssistenteBtn = container.querySelector('[id="addAssistenteBtn"], [onclick*="addAssistenteAcusacao"]');
  on(addAssistenteBtn, 'click', () => addAssistenteAcusacao(container));

  const addVitimaBtn = container.querySelector('[id="addVitimaBtn"], [onclick*="addVitima"]');
  on(addVitimaBtn, 'click', () => addVitima(container));

  const addTestemunhaMpBtn = container.querySelector('#addTestemunhaMpBtn, [onclick*="addTestemunha(\'mp\')"]');
  on(addTestemunhaMpBtn, 'click', () => addTestemunha(container, 'mp'));

  const addPolicialBtn = container.querySelector('#addPolicialBtn, [onclick*="addPolicial"]');
  on(addPolicialBtn, 'click', () => addPolicial(container));

  const addReuBtn = container.querySelector('#addReuBtn, [onclick*="addReu"]');
  on(addReuBtn, 'click', () => addReu(container));

  const addTestemunhaDefesaBtn = container.querySelector('#addTestemunhaDefesaBtn, [onclick*="addTestemunha(\'defesa\')"]');
  on(addTestemunhaDefesaBtn, 'click', () => addTestemunha(container, 'defesa'));

  const salvarBtn = container.querySelector('#salvarBtn, [onclick*="salvarDados"]');
  on(salvarBtn, 'click', salvarDados);

  const limparBtn = container.querySelector('#limparBtn, [onclick*="limparFormulario"]');
  on(limparBtn, 'click', () => limparFormulario(container));

  const processarDeepSeekBtn = container.querySelector('#processarDeepSeek');
  if (processarDeepSeekBtn) {
    if (typeof window.chamarDeepSeekAPI !== 'function') {
      processarDeepSeekBtn.disabled = true; // evita ReferenceError
    } else {
      on(processarDeepSeekBtn, 'click', () => processarDenunciaComIA(container, 'deepseek'));
    }
  }

  const processarGeminiBtn = container.querySelector('#processarGemini');
  on(processarGeminiBtn, 'click', () => processarDenunciaComIA(container, 'gemini'));

  const limparObservacoesMPBtn = container.querySelector('#limparObservacoesMP');
  on(limparObservacoesMPBtn, 'click', () => {
    if (!confirm('Tem certeza que deseja limpar as observações do MP?')) return;
    const campoObservacoes = container.querySelector('#observacoes-mp');
    if (!campoObservacoes) return;
    if (campoObservacoes.tagName === 'TEXTAREA') campoObservacoes.value = '';
    else campoObservacoes.textContent = '';
    mostrarMensagem(container, 'Observações do MP limpas', 'info');
  });

  setupRemoveButtons(container);
  container.closest('.main-content')?.classList.add('audiencia-mode');

  console.log('Módulo de Audiência pronto para uso');
}




// ============================================
// 🔍 FUNÇÃO PRINCIPAL DEEPSEEK - PROCESSAMENTO DE DENÚNCIA
// ============================================

/**
 * Função GENÉRICA para processar denúncia com qualquer IA - REFATORADA
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
    
    const nomeModelo = modelo === 'deepseek' ? 'DeepSeek' : 'Gemini';
    console.log(`Iniciando processamento de denúncia com ${nomeModelo} + Telefone (exceto policiais)`);
    
    // Chamar API específica baseada no modelo
    const dadosEstruturados = modelo === 'deepseek' ? 
      await chamarDeepSeekAPI(textoOriginal) : 
      await chamarGeminiAPI(textoOriginal);
    
    console.log('Dados estruturados recebidos:', dadosEstruturados);
    
    // Distribuir os dados nos campos (com texto original para busca de telefone)
    const camposPreenchidos = distribuirDadosNosCampos(container, dadosEstruturados, textoOriginal);
    
    // Criar relatório para as observações
    const relatorio = criarRelatorioProcessamento(dadosEstruturados, camposPreenchidos, nomeModelo);
    
    // Colocar relatório nas observações com quebras de linha
    if (campoObservacoes.tagName === 'TEXTAREA') {
      campoObservacoes.value = relatorio;
    } else {
      // Para contenteditable, usar innerHTML com <br> para quebras de linha
      campoObservacoes.innerHTML = relatorio.replace(/\n/g, '<br>');
    }
    
    // Mostrar mensagem de sucesso
    mostrarMensagem(container, `✅ Processamento ${nomeModelo} concluído! ${camposPreenchidos} campos preenchidos (telefones para réus, vítimas e testemunhas gerais).`, 'success');
    
  } catch (error) {
    console.error(`Erro no processamento ${modelo}:`, error);
    
    // Colocar erro nas observações
    const mensagemErro = `ERRO NO PROCESSAMENTO - ${new Date().toLocaleString()}\n\nErro: ${error.message}\n\nTexto original:\n${textoOriginal}`;
    if (campoObservacoes.tagName === 'TEXTAREA') {
      campoObservacoes.value = mensagemErro;
    } else {
      campoObservacoes.innerHTML = mensagemErro.replace(/\n/g, '<br>');
    }
    
    // Mostrar mensagem de erro
    const nomeModelo = modelo === 'deepseek' ? 'DeepSeek' : 'Gemini';
    mostrarMensagem(container, `❌ Erro no processamento ${nomeModelo}: ${error.message}`, 'error');
    
  } finally {
    // Restaurar botão original com verificação de segurança
    if (botao) {
      botao.innerHTML = textoOriginalBtn;
      botao.disabled = false;
    }
  }
}


async function chamarGeminiAPI(textoCompleto) {
  const apiKey = (typeof G_API_KEY !== 'undefined' && G_API_KEY) ? G_API_KEY : 'AIzaSyDm3k3ABMfK8qm73alwDK8GWgJhE368w-s'; // mova p/ backend
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Analise o texto da denúncia judicial abaixo e extraia dados estruturados em JSON.
INSTRUÇÕES:
1) Réus: monte qualificação completa; 2) Vítimas/Testemunhas gerais idem quando possível;
3) Telefone obrigatório p/ réus, vítimas, testemunhas gerais; exceção policiais;
4) Se faltar dado use "não informado";
5) Policiais: "NOME COMPLETO / MATRÍCULA" + tipo(livre) + lotação(opc).
Retorne APENAS JSON válido.

TEXTO:
${textoCompleto}`;

  const body = {
    contents: [{ parts: [{ text: `Você é um assistente jurídico. Retorne APENAS JSON válido.\n\n${prompt}` }]}],
    generationConfig: { temperature: 0.0, maxOutputTokens: 4096 }
  };

  const maxTentativas = 3;
  for (let i = 0; i < maxTentativas; i++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const resp = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body), signal: ctrl.signal });

      if (resp.ok) {
        const data = await resp.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        let s = String(raw).trim();
        if (/^```/m.test(s)) s = s.replace(/^```json?\s*/i,'').replace(/```$/,'').trim();
        try { return JSON.parse(s); } catch { throw new Error('Resposta não-JSON da API Gemini'); }
      }

      if (resp.status === 429) {
        const ra = resp.headers.get('Retry-After');
        const waitMs = ra ? Number(ra) * 1000 : (1000 * (2 ** i));
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      let msg = `Erro ${resp.status}: Falha na API Gemini`;
      try { const err = await resp.json(); msg = err?.error?.message || msg; } catch {}
      throw new Error(msg);
    } catch (e) {
      if (e.name === 'AbortError') {
        if (i < maxTentativas - 1) continue;
        throw new Error('Timeout na API Gemini');
      }
      if (i < maxTentativas - 1) continue;
      throw e;
    } finally {
      clearTimeout(t);
    }
  }
  throw new Error('Limite temporário excedido. Tente novamente depois.');
}




// ============================================
// 🔍 FUNÇÕES CORRIGIDAS - LIMPEZA E TELEFONE
// ============================================

/**
 * Função para extrair telefones do texto original da denúncia
 * Busca vários formatos de telefone comuns
 */


function extrairTelefonesDaOrigemTexto(textoCompleto, nomePessoa) {
  if (!textoCompleto || !nomePessoa) return '';
  const padroes = [
    /\(\d{2}\)\s?(?:9?\d{4})-?\d{4}\b/g,
    /\b\d{2}\s(?:9?\d{4})[-\s]?\d{4}\b/g,
    /\b\d{2}9\d{8}\b/g
  ];
  const alvo = nomePessoa.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const linhas = textoCompleto.split('\n');
  for (let i=0;i<linhas.length;i++){
    const ln = linhas[i].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if (!ln.includes(alvo)) continue;
    for (let j=i;j<Math.min(i+3, linhas.length);j++){
      for (const p of padroes){
        const m = linhas[j].match(p);
        if (m) for (const cand of m){ const t = validarEFormatarTelefone(cand); if (t) return t; }
      }
    }
  }
  return '';
}

function validarEFormatarTelefone(telefone) {
  const n = String(telefone||'').replace(/\D/g,'');
  if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  return '';
}



/**
 * Função CORRIGIDA para limpeza inteligente de qualificação
 * Remove apenas "não informado" mas mantém informações úteis
 */
function limparQualificacaoInteligente(qualificacaoCompleta, textoOriginal = '', nomePessoa = '') {
  if (!qualificacaoCompleta || qualificacaoCompleta.trim() === '') {
    return '';
  }
  
  console.log('🔍 ENTRADA:', qualificacaoCompleta);
  
  // PASSO 1: Remover APENAS padrões com "não informado" - MAIS ESPECÍFICO
  let qualificacaoLimpa = qualificacaoCompleta
    // Remover ", conhecido como 'não informado'" mas manter ", conhecido como 'APELIDO'"
    .replace(/,\s*conhecid[oa]\s+como\s+['"]não\s+informad[oa]['"]?/gi, '')
    
    // Remover ", CPF não informado" mas manter ", CPF 123.456.789-00"
    .replace(/,\s*CPF\s+não\s+informado/gi, '')
    
    // Remover ", filho de não informado" mas manter ", filho de NOME_MÃE"
    .replace(/,\s*filh[oa]\s+de\s+não\s+informad[oa]/gi, '')
    
    // Remover ", nascido em não informado" mas manter ", nascido em DD/MM/AAAA"
    .replace(/,\s*nascid[oa]\s+em\s+não\s+informad[oa]/gi, '')
    
    // Remover outros padrões similares
    .replace(/,\s*RG\s+não\s+informado/gi, '')
    .replace(/,\s*natural\s+de\s+não\s+informad[oa]/gi, '')
    .replace(/,\s*residente\s+em\s+não\s+informad[oa]/gi, '')
    
    // PASSO 2: Limpar vírgulas duplas e órfãs
    .replace(/,\s*,+/g, ',')        // Remove vírgulas duplas ou múltiplas
    .replace(/,\s*$/g, '')          // Remove vírgula no final
    .replace(/^\s*,+/g, '')         // Remove vírgula no início
    .trim();
  
  console.log('🧹 APÓS LIMPEZA:', qualificacaoLimpa);
  
  // PASSO 3: Buscar telefone se temos texto original e nome
  let telefone = '';
  if (textoOriginal && nomePessoa) {
    telefone = extrairTelefonesDaOrigemTexto(textoOriginal, nomePessoa);
  }
  
  // PASSO 4: Adicionar telefone ao final se encontrado
  if (telefone) {
    qualificacaoLimpa += `, telefone ${telefone}`;
    console.log('📱 COM TELEFONE:', qualificacaoLimpa);
  }
  
  // PASSO 5: Validar se sobrou conteúdo útil
  // Se a qualificação ficou muito curta ou só tem "não informado", extrair nome base
  if (qualificacaoLimpa.length < 3 || qualificacaoLimpa.toLowerCase().includes('não informad')) {
    const nomeBase = extrairNomeBase(qualificacaoCompleta);
    console.log('🔍 USANDO NOME BASE:', nomeBase);
    
    // Se encontrou telefone, adicionar ao nome base
    if (telefone && nomeBase) {
      return `${nomeBase}, telefone ${telefone}`;
    }
    
    return nomeBase;
  }
  
  console.log('✅ RESULTADO FINAL:', qualificacaoLimpa);
  return qualificacaoLimpa;
}

/**
 * Extrair nome base da qualificação (função melhorada)
 */


function extrairNomeBase(q) {
  if (!q) return '';
  const nome = q.split(',')[0].trim().replace(/^[^\w\s]+/,'').replace(/[^\w\s]+$/,'').trim();
  return (nome.length>2 && !nome.toLowerCase().includes('não informad')) ? nome : '';
}


function separarNomeMatricula(q) {
  if (!q) return {nome:'', matricula:''};
  const [nomeParte, resto=''] = q.split(' / ');
  const m = resto.match(/\b(matr(í|i)cula|matr\.?|rg)\s*[:#-]?\s*(\w+)\b/i);
  return { nome:(nomeParte||'').trim(), matricula: m ? m[4].replace(/[^\w]/g,'') : '' };
}


/**
 * Helper para processar uma lista de pessoas (réus, vítimas, testemunhas) e preencher a UI.
 * @param {HTMLElement} container - O elemento container principal.
 * @param {Array} pessoas - A lista de objetos de pessoa para processar.
 * @param {string} textoOriginal - O texto original para contexto (ex: busca de telefone).
 * @param {object} config - Configuração para o processamento.
 * @param {string} config.tipoPessoa - O tipo de pessoa (ex: 'Réu', 'Vítima').
 * @param {string} config.logIcon - O ícone para o log.
 * @param {string} config.containerSelector - O seletor CSS para o container na UI.
 * @param {Function} config.addFuncao - A função para adicionar um novo elemento na UI.
 * @param {Array} [config.addFuncaoArgs] - Argumentos extras para a função de adicionar.
 * @returns {number} - O número de campos preenchidos.
 */


function processarPessoasUI(container, pessoas, textoOriginal, config) {
  if (!pessoas || pessoas.length === 0) return 0;
  let n = 0;
  pessoas.forEach(p => {
    const nomeBase = extrairNomeBase(p?.qualificacaoCompleta || '');
    const qual = limparQualificacaoInteligente(p?.qualificacaoCompleta || '', textoOriginal, nomeBase);
    if (!qual) return;
    config.addFuncao(container, ...(config.addFuncaoArgs || []));
    const el = container.querySelector(config.containerSelector)?.lastElementChild;
    if (!el) return;
    const nome = el.querySelector('input[placeholder="Nome"]');
    const end = el.querySelector('input[placeholder="Endereço"]');
    if (nome && !nome.value) { nome.value = qual; n++; }
    if (end && !end.value && p?.endereco && p.endereco.trim()) { end.value = p.endereco; n++; }
  });
  return n;
}

function distribuirDadosNosCampos(container, dados = {}, textoOriginal = '') {
  let k = 0;
  k += processarPessoasUI(container, dados.reus, textoOriginal, { tipoPessoa:'Réu', containerSelector:'#reus-container', addFuncao: addReu });
  k += processarPessoasUI(container, dados.vitimas, textoOriginal, { tipoPessoa:'Vítima', containerSelector:'#vitimas-container', addFuncao: addVitima });
  k += processarPessoasUI(container, dados.testemunhasGerais, textoOriginal, { tipoPessoa:'Testemunha', containerSelector:'#testemunhas-mp-container', addFuncao: addTestemunha, addFuncaoArgs:['mp'] });

  if (Array.isArray(dados.testemunhasPoliciais)) {
    dados.testemunhasPoliciais.forEach(pol => {
      const qual = (pol?.qualificacaoCompleta || '')
        .replace(/,\s*conhecid[oa]\s+como\s+['"]não\s+informad[oa]['"]?/gi,'')
        .replace(/,\s*CPF\s+não\s+informado/gi,'')
        .replace(/,\s*filh[oa]\s+de\s+não\s+informad[oa]/gi,'')
        .replace(/,\s*nascid[oa]\s+em\s+não\s+informad[oa]/gi,'')
        .replace(/,\s*,+/g,',').replace(/,\s*$/,'').replace(/^\s*,+/,'').trim();
      if (!qual) return;
      addPolicial(container);
      const el = container.querySelector('#policiais-container')?.lastElementChild;
      if (!el) return;
      const sel = el.querySelector('select');
      const nome = el.querySelector('input[placeholder="Nome"]');
      const mat = el.querySelector('input[placeholder="Matrícula/RG"]');
      if (sel && pol?.tipo && ['pm','pc','pf','prf'].includes(pol.tipo.toLowerCase())) { sel.value = pol.tipo.toLowerCase(); k++; }
      const {nome:nm, matricula} = separarNomeMatricula(qual);
      if (nome && !nome.value && nm) { nome.value = nm; k++; }
      if (mat && !mat.value && matricula) { mat.value = matricula; k++; }
    });
  }
  return k;
}




/**
 * Criar relatório do processamento - CORRIGIDO COM QUEBRAS DE LINHA + MODELO
 */


function criarRelatorioProcessamento(dados, camposPreenchidos, nomeModelo='IA') {
  const t = new Date().toLocaleString();
  let r = `PROCESSAMENTO - ${t}\n\n`;
  if (dados?.estatisticas) {
    r += `📊 ESTATÍSTICAS:\n`;
    r += `• ${dados.estatisticas.totalMencionados || 0} pessoas mencionadas\n`;
    r += `• ${dados.estatisticas.totalQualificados || 0} qualificadas\n`;
    r += `• ${dados.estatisticas.telefonesEncontrados || 0} telefones encontrados\n`;
    r += `• ${camposPreenchidos} campos preenchidos automaticamente\n\n`;
  }
  const seção = (titulo, arr) => {
    if (!Array.isArray(arr) || arr.length===0) return;
    r += `${titulo.toUpperCase()} (${arr.length}):\n`;
    arr.forEach((it, i) => {
      r += `${i+1}. ${it.qualificacaoCompleta || it.nome || ''}\n`;
      if (it.endereco && String(it.endereco).trim()) r += `   Endereço: ${it.endereco}\n`;
    });
    r += '\n';
  };
  seção('Réus', dados?.reus);
  seção('Vítimas', dados?.vitimas);
  seção('Testemunhas Acusação', dados?.testemunhasGerais);
  if (Array.isArray(dados?.testemunhasPoliciais) && dados.testemunhasPoliciais.length) {
    r += `TESTEMUNHAS POLICIAIS (${dados.testemunhasPoliciais.length}):\n`;
    dados.testemunhasPoliciais.forEach((p, i) => {
      let l = `${i+1}. ${p.qualificacaoCompleta || ''}`;
      if (p.tipo) l += ` - ${p.tipo.toUpperCase()}`;
      if (p.lotacao) l += ` (${p.lotacao})`;
      r += `${l}\n`;
    });
    r += '\n';
  }
  if (Array.isArray(dados?.observacoesImportantes) && dados.observacoesImportantes.length) {
    r += `📋 OBSERVAÇÕES IMPORTANTES:\n`;
    dados.observacoesImportantes.forEach(o => r += `• ${o}\n`);
    r += '\n';
  }
  if (Array.isArray(dados?.outros) && dados.outros.length) {
    r += `⚠️ NÃO QUALIFICADOS (${dados.outros.length}):\n`;
    dados.outros.forEach((o,i)=>{ r += `${i+1}. ${o.nome}${o.motivo?` (${o.motivo})`:''}\n`; });
  }
  return r;
}



// ============================================
// 🔍 FUNÇÕES DE UI (CRIAÇÃO E MANIPULAÇÃO DE ELEMENTOS)
// ============================================

/**
 * Função genérica para adicionar um elemento a um contêiner com animação e botão de remover.
 * @param {HTMLElement} container - O contêiner principal do módulo.
 * @param {object} config - Configurações.
 * @param {string} config.containerSelector - Seletor CSS do contêiner onde o elemento será adicionado.
 * @param {Function} config.createElementFn - Função que cria e retorna o novo HTMLElement.
 * @param {Function} [config.postAddHook] - Hook opcional para executar lógica adicional no elemento criado.
 */
function addElement(container, config) {
  const targetContainer = container.querySelector(config.containerSelector);
  if (targetContainer) {
    const element = config.createElementFn();
    
    const removeBtn = element.querySelector('.remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => element.remove());
    }

    if (config.postAddHook) {
      config.postAddHook(element);
    }

    targetContainer.appendChild(element);

    setTimeout(() => {
      element.classList.add('active');
    }, 10);
  }
}

// --- Funções de Criação ---

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
  
  linha.innerHTML = `
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
  return linha;
}

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
  
  linha.innerHTML = `
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
  return linha;
}

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
  
  linha.innerHTML = `
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
  return linha;
}

function criarLinhaPolicial() {
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
    <input type="text" placeholder="Matrícula/RG" class="form-control matricula" id="${matriculaId}" data-textblaze-policial-matricula="${currentIndex}">
    <div class="d-flex align-items-center ms-auto">
      <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-policial-intimado="${currentIndex}">
      <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
    </div>
    <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
      <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
    </button>
  `;
  return linha;
}

function criarLinhaReu() {
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
    return reuContainer;
}

// --- Funções de Adição (Refatoradas) ---

function addAssistenteAcusacao(container) {
  addElement(container, {
    containerSelector: '#assistente-acusacao-container',
    createElementFn: criarLinhaAssistenteAcusacao
  });
}

function addVitima(container) {
  addElement(container, {
    containerSelector: '#vitimas-container',
    createElementFn: criarLinhaVitima
  });
}

function addTestemunha(container, tipo) {
  addElement(container, {
    containerSelector: `#testemunhas-${tipo}-container`,
    createElementFn: tipo === 'mp' ? criarLinhaTestemunhaMP : criarLinhaTestemunhaDefesa
  });
}

function addPolicial(container) {
  addElement(container, {
    containerSelector: '#policiais-container',
    createElementFn: criarLinhaPolicial
  });
}

function addReu(container) {
  addElement(container, {
    containerSelector: '#reus-container',
    createElementFn: criarLinhaReu,
    postAddHook: (element) => {
      const tipoDefesaSelect = element.querySelector('.tipo-defesa');
      const nomeAdvogadoInput = element.querySelector('.nome-advogado');
      if (tipoDefesaSelect && nomeAdvogadoInput) {
        tipoDefesaSelect.addEventListener('change', function() {
          nomeAdvogadoInput.style.display = this.value === 'particular' ? 'block' : 'none';
        });
      }
    }
  });
}

// ============================================
// 🔍 FUNÇÕES AUXILIARES
// ============================================

// Registrar event listeners para botões de remover
function setupRemoveButtons(container) {
  const handler = (e) => {
    const btn = e.target.closest('.remove-btn');
    if (!btn) return;
    const linha = btn.closest('.linha, .d-flex, .reu-item');
    if (linha) linha.remove();
  };
  container.addEventListener('click', handler);
  _listeners.push({ el: container, ev: 'click', fn: handler });
}


// Função para salvar dados (imprimir)
function salvarDados() {
  // Mostrar overlay de processamento
  const processingOverlay = document.getElementById('processingOverlay');
  const processingText = document.getElementById('processingText');
  
  if (processingOverlay) {
    processingOverlay.style.display = 'flex';
    if (processingText) {
      processingText.textContent = 'Preparando documento...';
    }
  }
  
  // Ocultar elementos antes da impressão
  const originalStyles = {
    header: document.querySelector('.dashboard-header')?.style.display,
    footer: document.querySelector('.dashboard-footer')?.style.display,
    contentHeader: document.querySelector('.content-header')?.style.marginBottom,
    sidebar: document.querySelector('.sidebar')?.style.display,
    botoes: [],
    removeButtons: []
  };
  
  // Ocultar cabeçalho e rodapé
  if (document.querySelector('.dashboard-header')) {
    document.querySelector('.dashboard-header').style.display = 'none';
  }
  
  if (document.querySelector('.dashboard-footer')) {
    document.querySelector('.dashboard-footer').style.display = 'none';
  }
  
  // Ocultar sidebar
  if (document.querySelector('.sidebar')) {
    document.querySelector('.sidebar').style.display = 'none';
  }
  
  // Reduzir espaçamento do content-header
  if (document.querySelector('.content-header')) {
    document.querySelector('.content-header').style.marginBottom = '0';
  }
  
  // Ocultar botões de ação
  document.querySelectorAll('.btn').forEach((btn, index) => {
    if (!btn.classList.contains('remove-btn')) {
      originalStyles.botoes.push({el: btn, display: btn.style.display});
      btn.style.display = 'none';
    }
  });
  
  // Ocultar botões de remover
  document.querySelectorAll('.remove-btn').forEach((btn, index) => {
    originalStyles.removeButtons.push({el: btn, display: btn.style.display});
    btn.style.display = 'none';
  });
  
  // Adicionar folha de estilo temporária para impressão
  const printStyle = document.createElement('style');
  printStyle.id = 'print-styles';
  printStyle.innerHTML = `
    @media print {
      /* Reset de margens da página */
      @page {
        margin: 1cm;
      }
      
      /* Ocultar elementos do dashboard */
      .dashboard-header, .dashboard-footer, .sidebar, .btn, .remove-btn {
        display: none !important;
      }
      
      /* Remover espaçamento excessivo */
      .content-header {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }
      
      #content-container {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      
      /* Formatar layout para impressão */
      .audiencia-grid {
        display: block !important;
      }
      
      /* Alinhar o Ministério Público à esquerda */
      .section h3.section-title,
      .section .linha {
        text-align: left !important;
        justify-content: flex-start !important;
      }
      
      /* Evitar quebra de página dentro dos elementos */
      .panel {
        page-break-inside: avoid;
        margin-bottom: 20px;
      }
      
      /* Ajustes de fonte */
      body, html {
        font-size: 12pt !important;
      }
      
      /* Reduzir espaçamentos gerais */
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
  
  // Ocultar overlay após um pequeno atraso
  setTimeout(() => {
    if (processingOverlay) {
      processingOverlay.style.display = 'none';
    }
    
    // Realizar a impressão
    window.print();
    
    // Remover a folha de estilo temporária
    setTimeout(() => {
      document.getElementById('print-styles')?.remove();
      
      // Restaurar os elementos ocultos
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
      
      // Mostrar mensagem de sucesso após a impressão
      mostrarMensagem(document.querySelector('#content-container'), 'Documento salvo com sucesso!', 'success');
    }, 1000);
  }, 500);
}

// Função para limpar o formulário
function limparFormulario(container) {
  if (confirm('Tem certeza que deseja limpar todos os dados?')) {
    // Mostrar overlay de processamento
    const processingOverlay = document.getElementById('processingOverlay');
    const processingText = document.getElementById('processingText');
    
    if (processingOverlay) {
      processingOverlay.style.display = 'flex';
      if (processingText) {
        processingText.textContent = 'Limpando formulário...';
      }
    }
    
    // Resetar contadores ao limpar o formulário
    contadorTestemunhaMP = 0;
    contadorTestemunhaDefesa = 0;
    contadorReu = 0;
    contadorVitima = 0;
    contadorAssistente = 0;
    contadorPolicial = 0;
    
    // Limpar os containers dinâmicos com animação
    ['assistente-acusacao-container', 'vitimas-container', 'testemunhas-mp-container', 
     'policiais-container', 'reus-container', 'testemunhas-defesa-container'].forEach(id => {
      const element = container.querySelector(`#${id}`);
      if (element) {
        // Adicionar classe de fade-out a todos os elementos filhos
        Array.from(element.children).forEach(child => {
          child.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          child.style.opacity = '0';
          child.style.transform = 'translateY(-10px)';
        });
        
        // Limpar após a animação
        setTimeout(() => {
          element.innerHTML = '';
        }, 300);
      }
    });
    
    // Limpar as observações
    const observacoesMp = container.querySelector('#observacoes-mp');
    const observacoesDefesa = container.querySelector('#observacoes-defesa');
    
    if (observacoesMp) observacoesMp.textContent = '';
    if (observacoesDefesa) observacoesDefesa.value = '';
    
    // Limpar todos os checkboxes
    container.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    
    // Limpar todos os campos de texto
    container.querySelectorAll('input[type="text"]').forEach(el => el.value = '');
    
    // Limpar os selects
    container.querySelectorAll('select').forEach(el => el.value = '');
    
    // Limpar o campo de nome do advogado (se houver)
    container.querySelectorAll('.nome-advogado').forEach(el => {
      el.value = '';
      el.style.display = 'none';
    });
    
    // Ocultar overlay após um pequeno atraso
    setTimeout(() => {
      if (processingOverlay) {
        processingOverlay.style.display = 'none';
      }
      
      // Mostrar uma mensagem de sucesso
      mostrarMensagem(container, 'Formulário limpo com sucesso!', 'success');
    }, 500);
  }
}

// Função para mostrar mensagem de status
function mostrarMensagem(container, mensagem, tipo = 'info') {
  // Verificar se já existe uma mensagem e removê-la
  const mensagemExistente = document.querySelector('.status-message');
  if (mensagemExistente) {
    mensagemExistente.remove();
  }
  
  // Criar elemento de mensagem
  const statusMessage = document.createElement('div');
  statusMessage.className = `status-message ${tipo}`;
  
 // Adicionar ícone adequado
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
  
  // Adicionar ao container e posicionar
  const mainContent = container.closest('.main-content') || container;
  if (mainContent) {
    mainContent.appendChild(statusMessage);
    
    // Posicionar no canto inferior direito
    statusMessage.style.position = 'fixed';
    statusMessage.style.bottom = '20px';
    statusMessage.style.right = '20px';
    statusMessage.style.zIndex = '1000';
    statusMessage.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    statusMessage.style.opacity = '0';
    statusMessage.style.transform = 'translateY(20px)';
    statusMessage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    // Animar entrada
    setTimeout(() => {
      statusMessage.style.opacity = '1';
      statusMessage.style.transform = 'translateY(0)';
    }, 10);
    
    // Guardar referência do timeout para possível cleanup
    let timeoutId = setTimeout(() => {
      statusMessage.style.opacity = '0';
      statusMessage.style.transform = 'translateY(20px)';
      
      // Remover do DOM após a animação
      setTimeout(() => {
        if (statusMessage.parentNode) {
          statusMessage.parentNode.removeChild(statusMessage);
        }
      }, 300);
    }, 5000);
    
    // Permitir cleanup manual do timeout se necessário
    statusMessage._timeoutId = timeoutId;
  }
}

// Função de limpeza
export function cleanup() {
  console.log('audiencia.cleanup()');
  for (const {el, ev, fn} of _listeners) {
    try { el.removeEventListener(ev, fn); } catch {}
  }
  _listeners.length = 0;
  _audienciaBootstrapped = false;

  document.getElementById('print-styles')?.remove();
  document.querySelector('.status-message')?.remove();
  document.querySelector('.main-content')?.classList.remove('audiencia-mode');
}
