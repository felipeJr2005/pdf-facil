/**
 * DeepSeek direto (api.deepseek.com).
 * Mantém compatibilidade se window.chamarDeepSeekAPI existir (legado).
 */
export async function chamarDeepSeekAPI(textoCompleto) {
  if (typeof window.chamarDeepSeekAPI === 'function') {
    return window.chamarDeepSeekAPI(textoCompleto);
  }
  throw new Error(
    'DeepSeek nativo indisponível. Use Modelo DiP/DiF (DeepInfra) ou defina window.chamarDeepSeekAPI.'
  );
}
