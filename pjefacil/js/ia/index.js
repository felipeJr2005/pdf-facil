import { chamarDeepSeekAPI } from './deepseek.js';
import { chamarGeminiAPI } from './gemini.js';
import { chamarGroqAPI } from './groq.js';
import { chamarDeepInfraPro, chamarDeepInfraFlash } from './deepinfra.js';

/**
 * Registry dos provedores de IA para audiência.
 * audiencia.js só dispara por id — sem código de API embutido.
 */
export const IA_PROVIDERS = {
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek',
    shortLabel: 'Ds',
    buttonSelector: '#processarDeepSeek',
    call: chamarDeepSeekAPI,
    requires: () => typeof window.chamarDeepSeekAPI === 'function',
  },
  gemini: {
    id: 'gemini',
    label: 'Gemini',
    shortLabel: 'Ge',
    buttonSelector: '#processarGemini',
    call: chamarGeminiAPI,
  },
  groq: {
    id: 'groq',
    label: 'Groq',
    shortLabel: 'Gq',
    buttonSelector: '#processarGroq',
    call: chamarGroqAPI,
  },
  'deepinfra-pro': {
    id: 'deepinfra-pro',
    label: 'DeepInfra Pro',
    shortLabel: 'DiP',
    buttonSelector: '#processarDeepInfraPro',
    call: chamarDeepInfraPro,
  },
  'deepinfra-flash': {
    id: 'deepinfra-flash',
    label: 'DeepInfra Flash',
    shortLabel: 'DiF',
    buttonSelector: '#processarDeepInfraFlash',
    call: chamarDeepInfraFlash,
  },
};

export function getProvider(modelo) {
  const p = IA_PROVIDERS[modelo];
  if (!p) throw new Error(`Modelo não suportado: ${modelo}`);
  return p;
}

export { TIPOS_POLICIAL } from './prompt-denuncia.js';
export { setSessionKey, getDeepInfraKey, maskSecret, ensureDeepInfraKey } from './config.js';
