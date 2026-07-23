import { DEEPINFRA, ensureDeepInfraKey } from './config.js';
import { chamarOpenAICompatible } from './openai-compatible.js';

async function chamarDeepInfra(textoCompleto, modelId, label) {
  const apiKey = ensureDeepInfraKey();
  if (!apiKey) {
    throw new Error('DEEPINFRA_API_KEY ausente. Cole a chave quando solicitado ou use Atualizar → Chave Di…');
  }

  return chamarOpenAICompatible({
    url: DEEPINFRA.baseUrl,
    apiKey,
    model: modelId,
    textoCompleto,
    providerLabel: label,
    maxTokens: 4096,
  });
}

export async function chamarDeepInfraPro(textoCompleto) {
  return chamarDeepInfra(textoCompleto, DEEPINFRA.models.pro, 'DeepInfra Pro');
}

export async function chamarDeepInfraFlash(textoCompleto) {
  return chamarDeepInfra(textoCompleto, DEEPINFRA.models.flash, 'DeepInfra Flash');
}
