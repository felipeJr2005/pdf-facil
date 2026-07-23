import { parseJsonFromModelText } from './parse-json.js';
import { SYSTEM_DENUNCIA, buildPromptDenuncia } from './prompt-denuncia.js';
import { maskSecret } from './config.js';

/**
 * Chamada genérica a endpoints OpenAI-compatible (Groq, DeepInfra, etc.).
 */
export async function chamarOpenAICompatible({
  url,
  apiKey,
  model,
  textoCompleto,
  providerLabel,
  maxTokens = 4096,
  extraBody = {},
}) {
  if (!apiKey) throw new Error(`Chave ausente para ${providerLabel}`);

  const body = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_DENUNCIA },
      { role: 'user', content: buildPromptDenuncia(textoCompleto) },
    ],
    temperature: 0.0,
    max_tokens: maxTokens,
    ...extraBody,
  };

  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (resp.ok) {
      const data = await resp.json();
      const raw = data?.choices?.[0]?.message?.content ?? '';
      return parseJsonFromModelText(raw, providerLabel);
    }

    if (resp.status === 429 || resp.status >= 500) {
      const ra = resp.headers.get('Retry-After');
      const waitMs = ra ? Number(ra) * 1000 : 1000 * (2 ** tentativa);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    const err = await resp.json().catch(() => ({}));
    const msg = err.error?.message || err.message || `Erro ${resp.status}`;
    // não vazar chave em mensagens
    throw new Error(
      `${providerLabel}: ${msg} (auth ${maskSecret(apiKey)})`
    );
  }

  throw new Error(`Limite temporário excedido na API ${providerLabel}. Tente novamente depois.`);
}
