/** Extrai e faz parse de JSON a partir de resposta de LLM (com ou sem fence). */

export function parseJsonFromModelText(raw, providerLabel = 'IA') {
  let txt = String(raw ?? '').trim();
  if (!txt) throw new Error(`Resposta vazia da API ${providerLabel}`);

  if (/^```/m.test(txt)) {
    txt = txt.replace(/^```json?\s*/i, '').replace(/```$/m, '').trim();
  }

  const first = txt.indexOf('{');
  const last = txt.lastIndexOf('}');
  if (first !== -1 && last > first) {
    txt = txt.slice(first, last + 1);
  }

  try {
    return JSON.parse(txt);
  } catch {
    throw new Error(`Resposta não-JSON da API ${providerLabel}`);
  }
}
