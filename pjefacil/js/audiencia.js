import { getProvider, IA_PROVIDERS, TIPOS_POLICIAL, setSessionKey, getDeepInfraKey, maskSecret } from './ia/index.js';

let contadorTestemunhaMP = 0;
let contadorTestemunhaDefesa = 0;
let contadorReu = 0;
let contadorVitima = 0;
let contadorAssistente = 0;
let contadorPolicial = 0;
let _audienciaBootstrapped = false;
let _geminiBusy = false;
let _geminiTimer = null;
const _listeners = [];
const _busyByProvider = new Set();

// === item 2: memoização por entrada ===
const _geminiCache = new Map(); // key: hash(texto), value: JSON

function _hashTexto(s) {
  s = String(s || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return String(h >>> 0);
}
// === fim item 2 ===

function _countdownButton(btn, ms, label='Modelo') {
  if (!btn) return;
  try { clearInterval(_geminiTimer); } catch {}
  const end = Date.now() + Math.max(0, ms||0);
  const base = btn.textContent || label;
  btn.disabled = true;
  _geminiTimer = setInterval(() => {
    const left = Math.max(0, end - Date.now());
    const s = Math.ceil(left / 1000);
    btn.textContent = s > 0 ? `${base} • aguarde ${s}s` : base;
    if (left <= 0) { clearInterval(_geminiTimer); btn.disabled = false; }
  }, 250);
}


export function initialize(container) {
  if (_audienciaBootstrapped) return;
  _audienciaBootstrapped = true;

  console.log('Módulo audiencia.js inicializado (IA desacoplada + Text Blaze)');

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

  for (const provider of Object.values(IA_PROVIDERS)) {
    const btn = container.querySelector(provider.buttonSelector);
    if (!btn) continue;
    if (typeof provider.requires === 'function' && !provider.requires()) {
      btn.disabled = true;
      btn.title = `${provider.label} indisponível (use DiP/DiF ou configure a API)`;
      continue;
    }
    on(btn, 'click', () => processarDenunciaComIA(container, provider.id));
  }

  const configDiKeyBtn = container.querySelector('#configDeepInfraKey');
  on(configDiKeyBtn, 'click', () => {
    const atual = getDeepInfraKey();
    const msg = atual
      ? `Chave atual: ${maskSecret(atual)}\n\nCole a nova chave DeepInfra (ou deixe em branco para remover):`
      : 'Cole a chave DeepInfra (fica só neste navegador):';
    const pasted = window.prompt(msg, '');
    if (pasted === null) return;
    setSessionKey('deepinfra', pasted);
    if (String(pasted).trim()) {
      mostrarMensagem(container, `Chave DeepInfra salva (${maskSecret(pasted.trim())}).`, 'success');
    } else {
      mostrarMensagem(container, 'Chave DeepInfra removida deste navegador.', 'info');
    }
  });

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

function lerTextoObservacoes(el) {
  if (!el) return '';
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return (el.value || '').trim();
  return (el.innerText || el.textContent || '').trim();
}

function escreverTextoObservacoes(el, texto) {
  if (!el) return;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') el.value = texto;
  else el.innerHTML = String(texto).replace(/\n/g, '<br>');
}

/**
 * Orquestra UI + provedor IA (chamada real fica em ./ia/).
 */
async function processarDenunciaComIA(container, modelo) {
  let provider;
  try {
    provider = getProvider(modelo);
  } catch (e) {
    mostrarMensagem(container, e.message, 'error');
    return;
  }

  const botao = container.querySelector(provider.buttonSelector);
  const campoObservacoes = container.querySelector('#observacoes-mp');

  if (!botao || !campoObservacoes) {
    mostrarMensagem(container, 'Erro: Elementos necessários não encontrados', 'error');
    return;
  }

  const textoOriginal = lerTextoObservacoes(campoObservacoes);
  if (!textoOriginal) {
    mostrarMensagem(container, 'Não há texto para processar. Por favor, cole o texto da denúncia.', 'warning');
    return;
  }

  if (_busyByProvider.has(modelo) || (modelo === 'gemini' && _geminiBusy)) {
    mostrarMensagem(container, `${provider.shortLabel} está em uso. Aguarde terminar.`, 'warning');
    return;
  }

  const htmlOriginal = botao.innerHTML;
  _busyByProvider.add(modelo);
  if (modelo === 'gemini') _geminiBusy = true;

  try {
    botao.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Processando...';
    botao.disabled = true;

    console.log(`Iniciando processamento com ${provider.label}`);

    let dadosEstruturados;
    if (modelo === 'gemini') {
      const key = _hashTexto(textoOriginal);
      if (_geminiCache.has(key)) {
        dadosEstruturados = _geminiCache.get(key);
      } else {
        dadosEstruturados = await provider.call(textoOriginal);
        try { _geminiCache.set(key, dadosEstruturados); } catch {}
      }
    } else {
      dadosEstruturados = await provider.call(textoOriginal);
    }

    console.log('Dados estruturados recebidos:', dadosEstruturados);

    const camposPreenchidos = distribuirDadosNosCampos(container, dadosEstruturados, textoOriginal);
    const relatorio = criarRelatorioProcessamento(dadosEstruturados, camposPreenchidos, provider.label);
    escreverTextoObservacoes(campoObservacoes, relatorio);

    mostrarMensagem(
      container,
      `✅ Processamento ${provider.label} concluído! ${camposPreenchidos} campos preenchidos.`,
      'success'
    );
  } catch (error) {
    console.error(`Erro no processamento ${modelo}:`, error);

    const m = String(error?.message || '').match(/retry in\s+(\d+(?:\.\d+)?)s/i);
    if (m || /429|rate|quota|limite/i.test(String(error?.message || ''))) {
      const waitMs = m ? Math.ceil(parseFloat(m[1]) * 1000) : 30_000;
      try { _countdownButton(botao, waitMs, provider.shortLabel); } catch {}
    }

    escreverTextoObservacoes(
      campoObservacoes,
      `ERRO NO PROCESSAMENTO - ${new Date().toLocaleString()}\n\n` +
      `Erro: ${error.message}\n\n` +
      `Texto original:\n${textoOriginal}`
    );

    mostrarMensagem(container, `❌ Erro no processamento ${provider.label}: ${error.message}`, 'error');
  } finally {
    botao.innerHTML = htmlOriginal || `Modelo ${provider.shortLabel}`;
    if (!botao.textContent.includes('aguarde')) botao.disabled = false;
    _busyByProvider.delete(modelo);
    if (modelo === 'gemini') _geminiBusy = false;
  }
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
  if (!q) return { nome: '', matricula: '' };

  // Formatos: "NOME / Mat. 121.687-2" | "NOME / Matrícula 9807306" | "NOME / 121.687-2"
  const parts = String(q).split(/\s*\/\s*/);
  const nome = (parts[0] || '').trim();
  let resto = (parts.slice(1).join(' / ') || '').trim();
  if (!resto) return { nome, matricula: '' };

  // Remove rótulo (Mat., Matrícula, RG...) e sufixos tipo "- PM"
  resto = resto
    .replace(/^(matr[ií]cula|matr?\.?|reg\.?|rg)\s*[:#.\-]?\s*/i, '')
    .split(/\s+-\s+/)[0]
    .trim();

  // Matrículas reais têm dígitos, ponto e hífen (ex: 121.687-2) — \w+ quebrava nisso
  const m = resto.match(/[0-9][0-9.\-\/]*/);
  return { nome, matricula: m ? m[0] : '' };
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


function normalizarTipoDefesa(tipo, advogadoNome = '') {
  const t = String(tipo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const adv = String(advogadoNome || '').trim();
  if (/particular|advogad|oab/.test(t)) return 'particular';
  if (/defensor/.test(t)) return 'defensoria';
  if (adv && /oab|advogad|representante\s+legal/i.test(adv) && !/defensor\s*p[uú]blic/i.test(adv)) {
    return 'particular';
  }
  if (adv && !/defensor/i.test(adv)) return 'particular';
  return 'defensoria';
}

function formatarNomeAdvogado(raw) {
  let s = String(raw || '').trim();
  if (!s) return '';
  const oab = s.match(/OAB\s*\/?\s*[A-Z]{2}\s*[\d.]+/i);
  let nome = s
    .replace(/\([^)]*\)/g, ' ')
    .replace(/,?\s*OAB\s*\/?\s*[A-Z]{2}\s*[\d.]+/ig, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[,;\-\s]+|[,;\-\s]+$/g, '')
    .trim();
  if (nome && oab) return `${nome}, ${oab[0].replace(/\s+/g, ' ').toUpperCase()}`;
  return s.replace(/\s+/g, ' ').trim();
}

function pareceAdvogadoOuDefensor(texto) {
  return /oab|advogad|representante\s+legal|defensor(?:ia|\s*p[uú]blic)?/i.test(String(texto || ''));
}

function aplicarDefesaNoReu(el, pessoa = {}) {
  if (!el) return 0;
  let n = 0;
  const sel = el.querySelector('.tipo-defesa');
  const advInput = el.querySelector('.nome-advogado');
  if (!sel) return 0;

  const tipo = normalizarTipoDefesa(pessoa.tipoDefesa, pessoa.advogado || pessoa.nomeAdvogado);
  const nomeAdv = formatarNomeAdvogado(pessoa.advogado || pessoa.nomeAdvogado || '');

  sel.value = tipo;
  sel.dispatchEvent(new Event('change', { bubbles: true }));
  n++;

  if (tipo === 'particular' && advInput) {
    advInput.style.display = 'block';
    if (nomeAdv && !advInput.value) {
      advInput.value = nomeAdv;
      n++;
    }
  } else if (advInput) {
    advInput.style.display = 'none';
    advInput.value = '';
  }
  return n;
}

function resgatarDefesaDeOutros(container, dados = {}) {
  let n = 0;
  const reusEls = [...(container.querySelectorAll('#reus-container .reu-item') || [])];
  if (!reusEls.length) return 0;

  const candidatos = [];

  if (Array.isArray(dados.outros)) {
    const restantes = [];
    dados.outros.forEach((o) => {
      const texto = `${o?.nome || ''} ${o?.motivo || ''}`.trim();
      if (pareceAdvogadoOuDefensor(texto)) candidatos.push(texto);
      else restantes.push(o);
    });
    dados.outros = restantes;
  }

  if (Array.isArray(dados.procuradorRequerido)) {
    dados.procuradorRequerido.forEach((p) => {
      const texto = p?.qualificacaoCompleta || p?.nome || '';
      if (pareceAdvogadoOuDefensor(texto)) candidatos.push(texto);
    });
  }

  candidatos.forEach((texto, i) => {
    const el = reusEls[Math.min(i, reusEls.length - 1)];
    if (!el) return;
    const advInput = el.querySelector('.nome-advogado');
    if (advInput?.value?.trim()) return;

    const isDefensor = /defensor(?:ia|\s*p[uú]blic)/i.test(texto) && !/oab/i.test(texto);
    n += aplicarDefesaNoReu(el, {
      tipoDefesa: isDefensor ? 'defensoria' : 'particular',
      advogado: isDefensor ? '' : texto,
    });
  });

  return n;
}

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
    if (config.tipoPessoa === 'Réu') n += aplicarDefesaNoReu(el, p);
  });
  return n;
}

function normalizarTipoPolicial(tipo) {
  const t = String(tipo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (TIPOS_POLICIAL.includes(t)) return t;
  if (/\bgm\b|guarda\s*municipal/.test(t)) return 'gm';
  if (/\bpp\b|presidio|penitenci|policial\s*penal|agente\s*penitenci/.test(t)) return 'pp';
  if (/\bprf\b|rodoviaria/.test(t)) return 'prf';
  if (/\bpf\b|federal/.test(t)) return 'pf';
  if (/\bpc\b|civil/.test(t)) return 'pc';
  if (/\bpm\b|militar/.test(t)) return 'pm';
  return '';
}

function linkAudienciaValido(valor) {
  const s = String(valor || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s.replace(/[)\].,;]+$/g, '').trim();
  return '';
}

function isPlaceholderLink(valor) {
  const s = String(valor || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!s) return true;
  return /^(nao se aplica|n\/a|na|nao informado|sem link|inexistente|-|—|–)$/i.test(s)
    || /nao se aplica|sem link|nao ha link|nao existe link/i.test(s);
}

/** Extrai a melhor URL de audiência do texto (ignora "não se aplica"). */
function extrairLinkAudienciaDoTexto(texto = '') {
  const t = String(texto || '');

  // Prioridade: link após "substituído pelo" / "link contingencial"
  const prioridade = [
    /substitu[ií]do pelo link(?: contingencial)?\s+(https?:\/\/\S+)/i,
    /link contingencial[^:\n]*:\s*(https?:\/\/\S+)/i,
    /link contingencial\s+(https?:\/\/\S+)/i,
    /(?:^|\n)\s*Link:\s*(https?:\/\/\S+)/i,
  ];
  for (const re of prioridade) {
    const m = t.match(re);
    const url = linkAudienciaValido(m?.[1]);
    if (url) return url;
  }

  // Todas as URLs de reunião — prefira a última (geralmente a redesignação)
  const todas = [...t.matchAll(/https?:\/\/(?:teams\.microsoft\.com|meet\.google\.com|zoom\.us)[^\s)\]>"']+/gi)]
    .map((m) => linkAudienciaValido(m[0]))
    .filter(Boolean);
  if (todas.length) return todas[todas.length - 1];

  return '';
}

function extrairAudienciaDoTexto(texto = '') {
  const t = String(texto || '');
  const data = (t.match(/(?:^|\n)\s*Data:\s*(\d{2}\/\d{2}\/\d{4})/i) || [])[1] || '';
  const horario = (t.match(/(?:^|\n)\s*Hor[aá]rio:\s*(\d{1,2}:\d{2})/i) || [])[1] || '';
  return {
    data,
    horario: horario ? (horario.length === 4 ? `0${horario}` : horario) : '',
    link: extrairLinkAudienciaDoTexto(t),
  };
}

function montarDataHoraAudiencia(aud = {}, textoOriginal = '', observacoes = []) {
  const fallback = extrairAudienciaDoTexto(textoOriginal);
  const data = String(aud.data || fallback.data || '').trim();
  let horario = String(aud.horario || fallback.horario || '').trim();
  let dataHora = String(aud.dataHora || aud.data_hora || '').trim();

  // Link da IA só vale se for URL real — nunca "não se aplica"
  let link = linkAudienciaValido(aud.link || aud.url || '');
  if (!link) link = fallback.link;
  if (!link && Array.isArray(observacoes)) {
    link = extrairLinkAudienciaDoTexto(observacoes.join('\n'));
  }
  if (!link) link = extrairLinkAudienciaDoTexto(textoOriginal);

  if (!dataHora && data && horario) {
    if (/^\d:\d{2}$/.test(horario)) horario = `0${horario}`;
    dataHora = `${data} ${horario}`;
  }
  if (!dataHora && data) dataHora = data;

  dataHora = dataHora
    .replace(/\s+às\s+/i, ' ')
    .replace(/\s+as\s+/i, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { dataHora, link };
}

function preencherCamposAudiencia(container, dados = {}, textoOriginal = '') {
  let n = 0;
  const aud = dados.audiencia || dados.dadosAudiencia || {};
  const { dataHora, link } = montarDataHoraAudiencia(
    aud,
    textoOriginal,
    dados.observacoesImportantes || []
  );

  const inputData = container.querySelector('#audiencia-data');
  const inputLink = container.querySelector('#audiencia-link');

  if (inputData && dataHora) {
    inputData.value = dataHora;
    n++;
  }
  if (inputLink) {
    // Nunca gravar placeholder; se não houver URL, deixa em branco
    if (link && !isPlaceholderLink(link)) {
      inputLink.value = link;
      n++;
    } else if (isPlaceholderLink(inputLink.value) || !String(inputLink.value || '').trim()) {
      inputLink.value = '';
    }
  }
  return n;
}

function resetarContadoresPessoas() {
  contadorTestemunhaMP = 0;
  contadorTestemunhaDefesa = 0;
  contadorReu = 0;
  contadorVitima = 0;
  contadorAssistente = 0;
  contadorPolicial = 0;
}

/** Limpa só os blocos dinâmicos para o autofill recriar IDs 1..N (Text Blaze). */
function limparContainersDinamicos(container) {
  [
    'assistente-acusacao-container',
    'vitimas-container',
    'testemunhas-mp-container',
    'policiais-container',
    'reus-container',
    'testemunhas-defesa-container',
  ].forEach((id) => {
    const el = container.querySelector(`#${id}`);
    if (el) el.innerHTML = '';
  });
  resetarContadoresPessoas();
}

function distribuirDadosNosCampos(container, dados = {}, textoOriginal = '') {
  // Garante #policial-1, #policial-matricula-1, .active:nth-child(1) etc. estáveis p/ Text Blaze
  limparContainersDinamicos(container);

  let k = 0;
  // IDs fixos do Text Blaze — nunca renomear #audiencia-data / #audiencia-link
  k += preencherCamposAudiencia(container, dados, textoOriginal);
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
      const sel = el.querySelector('select.tipo-policial, select');
      const nome = el.querySelector('input.nome, input[placeholder="Nome"]');
      const mat = el.querySelector('input.matricula, input[placeholder="Matrícula/RG"]');
      if (sel && pol?.tipo) {
        const tipoNorm = normalizarTipoPolicial(pol.tipo);
        if (tipoNorm) { sel.value = tipoNorm; k++; }
      }
      const parsed = separarNomeMatricula(qual);
      const nm = parsed.nome;
      const matricula = String(pol?.matricula || parsed.matricula || '').trim();
      if (nome && !nome.value && nm) { nome.value = nm; k++; }
      if (mat && !mat.value && matricula) { mat.value = matricula; k++; }
    });
  }

  // Resgate: advogado/defensor que a IA mandou em "outros"
  k += resgatarDefesaDeOutros(container, dados);
  return k;
}




/**
 * Criar relatório do processamento - CORRIGIDO COM QUEBRAS DE LINHA + MODELO
 */


function criarRelatorioProcessamento(dados, camposPreenchidos, nomeModelo='IA') {
  const t = new Date().toLocaleString();
  let r = `PROCESSAMENTO - ${t}\n\n`;
  const aud = dados?.audiencia || {};
  if (aud.data || aud.horario || aud.dataHora || aud.link) {
    r += `📅 AUDIÊNCIA:\n`;
    if (aud.dataHora) r += `• Data/Hora: ${aud.dataHora}\n`;
    else {
      if (aud.data) r += `• Data: ${aud.data}\n`;
      if (aud.horario) r += `• Horário: ${aud.horario}\n`;
    }
    const linkRel = linkAudienciaValido(aud.link);
    if (linkRel) r += `• Link: ${linkRel}\n`;
    r += '\n';
  }
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
      if (titulo === 'Réus') {
        const tipo = normalizarTipoDefesa(it.tipoDefesa, it.advogado || it.nomeAdvogado);
        if (tipo === 'particular') {
          const adv = formatarNomeAdvogado(it.advogado || it.nomeAdvogado || '');
          r += `   Defesa: Advogado Particular${adv ? ` — ${adv}` : ''}\n`;
        } else {
          r += `   Defesa: Defensoria Pública\n`;
        }
      }
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

    // Text Blaze: #policiais-container .active:nth-child(N) — active deve existir já no DOM
    element.classList.add('active');

    const removeBtn = element.querySelector('.remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => element.remove());
    }

    if (config.postAddHook) {
      config.postAddHook(element);
    }

    targetContainer.appendChild(element);
  }
}

// --- Funções de Criação ---

function criarLinhaAssistenteAcusacao() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100 active';
  
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
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100 active';
  
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
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100 active';
  
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
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100 active';

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
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100 active';
  linha.id = itemId;
  linha.setAttribute('data-index', currentIndex);
  
  linha.innerHTML = `
    <select class="form-select tipo-policial" style="width: auto; min-width: 100px;" id="${tipoId}" data-textblaze-policial-tipo="${currentIndex}">
      <option value="pm">PM</option>
      <option value="pc">PC</option>
      <option value="pf">PF</option>
      <option value="prf">PRF</option>
      <option value="gm">GM</option>
      <option value="pp">PP</option>
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
    reuContainer.className = 'reu-item mb-3 active';
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
      mostrarMensagem(document.body, 'Documento salvo com sucesso!', 'success');

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
    resetarContadoresPessoas();
    
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

  // desmonta ouvintes
  for (const {el, ev, fn} of _listeners) {
    try { el.removeEventListener(ev, fn); } catch {}
  }
  _listeners.length = 0;
  _audienciaBootstrapped = false;

  // encerra timers e flags
  try { clearInterval(_geminiTimer); } catch {}
  _geminiTimer = null;
  _geminiBusy = false;
  _busyByProvider.clear();

  // remove artefatos de UI
  document.getElementById('print-styles')?.remove();
  document.querySelector('.status-message')?.remove();
  document.querySelector('.main-content')?.classList.remove('audiencia-mode');
}

