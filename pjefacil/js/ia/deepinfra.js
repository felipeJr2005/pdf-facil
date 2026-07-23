import { DEEPINFRA, getDeepInfraKey } from './config.js';
import { chamarOpenAICompatible } from './openai-compatible.js';

async function chamarDeepInfra(textoCompleto, modelId, label) {
  const apiKey = getDeepInfraKey();
  if (!apiKey) {
    throw new Error('DEEPINFRA_API_KEY ausente. Defina window.DEEPINFRA_API_KEY ou setPjeFacilKey("deepinfra", "...").');
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
