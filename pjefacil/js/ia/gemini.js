import { GEMINI_MODELS, getGeminiKey } from './config.js';
import { SYSTEM_DENUNCIA, buildPromptDenuncia } from './prompt-denuncia.js';
import { parseJsonFromModelText } from './parse-json.js';

export async function chamarGeminiAPI(textoCompleto) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('G_API_KEY ausente. Defina window.G_API_KEY ou sessionStorage via setPjeFacilKey("gemini", "...").');

  const prompt = `${SYSTEM_DENUNCIA}\n\n${buildPromptDenuncia(textoCompleto)}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.0, maxOutputTokens: 4096 },
  };

  for (const modelo of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${encodeURIComponent(apiKey)}`;
    console.log(`🧪 Tentando Gemini: ${modelo}`);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (resp.ok) {
        const data = await resp.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        console.log(`✅ Sucesso com Gemini: ${modelo}`);
        return parseJsonFromModelText(raw, 'Gemini');
      }

      if (resp.status === 429) {
        console.warn(`⚠️ Quota excedida para ${modelo}, tentando próximo...`);
        continue;
      }

      const err = await resp.json().catch(() => ({}));
      console.error(`❌ Erro ${resp.status} no modelo ${modelo}:`, err.error?.message);
    } catch (networkError) {
      console.error(`🌐 Erro de rede com ${modelo}:`, networkError.message);
    }
  }

  throw new Error('Todos os modelos Gemini falharam. Verifique quota/chave ou tente em 1 minuto.');
}
