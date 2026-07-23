/** Prompt/schema único para extração de denúncia (todos os provedores). */

export const TIPOS_POLICIAL = ['pm', 'pc', 'pf', 'prf', 'gm', 'pp'];

export const SYSTEM_DENUNCIA =
  'Você extrai dados estruturados de denúncias judiciais e retorna SOMENTE JSON válido, sem markdown.';

export function buildPromptDenuncia(textoCompleto) {
  return `Analise o texto da denúncia judicial abaixo e retorne APENAS JSON válido no formato:

{
  "reus": [{"qualificacaoCompleta": "...", "endereco": "", "telefone": ""}],
  "vitimas": [{"qualificacaoCompleta": "...", "endereco": "", "telefone": ""}],
  "testemunhasGerais": [{"qualificacaoCompleta": "...", "endereco": "", "telefone": ""}],
  "testemunhasPoliciais": [{"qualificacaoCompleta": "NOME COMPLETO / Mat. 000.000-0", "matricula": "000.000-0", "tipo": "PM|PC|PF|PRF|GM|PP", "lotacao": ""}],
  "testemunhasDefesa": [],
  "procuradorRequerido": [],
  "outros": [{"nome": "", "motivo": ""}],
  "observacoesImportantes": [],
  "estatisticas": {"totalMencionados": 0, "totalQualificados": 0, "naoQualificados": 0, "telefonesEncontrados": 0}
}

Regras:
- Montar "qualificacaoCompleta" (nome, alcunha, CPF, mãe, nascimento).
- Adicionar telefone quando houver (réus, vítimas, testemunhas gerais). Policiais: sem telefone.
- Policiais: qualificacaoCompleta no formato "NOME COMPLETO / Mat. 000.000-0" E preencher "matricula" só com o número (ex: "121.687-2", "9807306").
- tipo policial: PM (militar), PC (civil), PF (federal), PRF (rodoviária), GM (guarda municipal), PP (policial de presídio / penal).
- Se faltar dado, usar "não informado".
- Responda SOMENTE com JSON.

TEXTO:
${textoCompleto}`;
}
