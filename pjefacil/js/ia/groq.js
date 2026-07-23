import { GROQ, getGroqKey } from './config.js';
import { chamarOpenAICompatible } from './openai-compatible.js';

export async function chamarGroqAPI(textoCompleto) {
  const apiKey = getGroqKey();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY ausente. Defina window.GROQ_API_KEY ou setPjeFacilKey("groq", "...").');
  }

  return chamarOpenAICompatible({
    url: GROQ.baseUrl,
    apiKey,
    model: GROQ.model(),
    textoCompleto,
    providerLabel: 'Groq',
    maxTokens: 2048,
  });
}
