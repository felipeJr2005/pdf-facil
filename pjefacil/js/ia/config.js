/**
 * Configuração de chaves/modelos.
 * Prioridade: window.* → sessionStorage → fallback de teste (revogar após testes).
 * Nunca logar o valor completo da chave.
 */

const SS = {
  deepinfra: 'pjefacil.deepinfra.key',
  gemini: 'pjefacil.gemini.key',
  groq: 'pjefacil.groq.key',
};

/**
 * Chave DeepInfra NÃO fica no git (push protection).
 * No console da página de produção, uma vez por sessão:
 *   setPjeFacilKey('deepinfra', 'SUA_CHAVE')
 * ou: window.DEEPINFRA_API_KEY = 'SUA_CHAVE'
 */
function readKey(windowKey, storageKey, fallback = '') {
  try {
    const fromWindow = window[windowKey];
    if (fromWindow && String(fromWindow).trim()) return String(fromWindow).trim();
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

/** Persiste chave só na sessão do browser (não vai para disco/git). */
export function setSessionKey(provider, value) {
  const map = { deepinfra: SS.deepinfra, gemini: SS.gemini, groq: SS.groq };
  const key = map[provider];
  if (!key) throw new Error(`Provider inválido: ${provider}`);
  const v = String(value || '').trim();
  if (!v) {
    try { sessionStorage.removeItem(key); } catch {}
    return;
  }
  try { sessionStorage.setItem(key, v); } catch {}
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
