/**
 * Configuração de chaves/modelos.
 * Prioridade: window.* → localStorage → sessionStorage.
 * Nunca commitada no git (push protection).
 */

const SS = {
  deepinfra: 'pjefacil.deepinfra.key',
  gemini: 'pjefacil.gemini.key',
  groq: 'pjefacil.groq.key',
};

function readKey(windowKey, storageKey, fallback = '') {
  try {
    const fromWindow = window[windowKey];
    if (fromWindow && String(fromWindow).trim()) return String(fromWindow).trim();
  } catch {}
  try {
    const fromLs = localStorage.getItem(storageKey);
    if (fromLs && fromLs.trim()) return fromLs.trim();
  } catch {}
  try {
    const fromSs = sessionStorage.getItem(storageKey);
    if (fromSs && fromSs.trim()) return fromSs.trim();
  } catch {}
  return String(fallback || '').trim();
}

export function maskSecret(value) {
  const s = String(value || '');
  if (s.length <= 8) return '****';
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

export function getDeepInfraKey() {
  return readKey('DEEPINFRA_API_KEY', SS.deepinfra, '');
}

export function getGeminiKey() {
  return readKey('G_API_KEY', SS.gemini, '');
}

export function getGroqKey() {
  return readKey('GROQ_API_KEY', SS.groq, '');
}

/** Persiste no navegador (localStorage). Não vai para o git. */
export function setSessionKey(provider, value) {
  const map = { deepinfra: SS.deepinfra, gemini: SS.gemini, groq: SS.groq };
  const key = map[provider];
  if (!key) throw new Error(`Provider inválido: ${provider}`);
  const v = String(value || '').trim();
  if (!v) {
    try { localStorage.removeItem(key); } catch {}
    try { sessionStorage.removeItem(key); } catch {}
    return;
  }
  try { localStorage.setItem(key, v); } catch {}
  try { sessionStorage.setItem(key, v); } catch {}
}

/**
 * Garante chave DeepInfra: se ausente, pede no prompt do browser.
 * @returns {string} chave ou string vazia se cancelado
 */
export function ensureDeepInfraKey() {
  let key = getDeepInfraKey();
  if (key) return key;

  const pasted = window.prompt(
    'Chave DeepInfra ausente neste navegador.\n\nCole a API key (fica só neste PC/navegador, não no GitHub):'
  );
  if (!pasted || !String(pasted).trim()) return '';

  key = String(pasted).trim();
  setSessionKey('deepinfra', key);
  return key;
}

export const DEEPINFRA = {
  baseUrl: 'https://api.deepinfra.com/v1/openai/chat/completions',
  models: {
    pro: 'deepseek-ai/DeepSeek-V4-Pro',
    flash: 'deepseek-ai/DeepSeek-V4-Flash',
  },
};

export const GROQ = {
  baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
  model: () => (window.GROQ_MODEL || 'llama-3.1-8b-instant').trim(),
};

export const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash-lite',
];

if (typeof window !== 'undefined') {
  window.setPjeFacilKey = setSessionKey;
}
