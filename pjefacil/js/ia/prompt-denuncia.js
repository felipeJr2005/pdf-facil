/** Prompt/schema único para extração de denúncia (todos os provedores). */

export const TIPOS_POLICIAL = ['pm', 'pc', 'pf', 'prf', 'gm', 'pp'];

export const SYSTEM_DENUNCIA =
  'Você extrai dados estruturados de denúncias judiciais e retorna SOMENTE JSON válido, sem markdown.';

export function buildPromptDenuncia(textoCompleto) {
  return `Analise o texto judicial/resumo de audiência abaixo e retorne APENAS JSON válido no formato:

{
  "audiencia": {
    "data": "DD/MM/AAAA",
    "horario": "HH:MM",
    "dataHora": "DD/MM/AAAA HH:MM",
    "link": "https://..."
  },
  "reus": [{
    "qualificacaoCompleta": "...",
    "endereco": "",
    "telefone": "",
    "tipoDefesa": "defensoria|particular",
    "advogado": ""
  }],
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
- AUDIÊNCIA (obrigatório quando houver no texto):
  - Extrair Data e Horário → preencher "data", "horario" e "dataHora" no formato "DD/MM/AAAA HH:MM" (ex: "03/09/2026 09:00").
  - Extrair Link (Teams/Meet/Zoom/URL) → campo "link" completo, sem truncar.
- Montar "qualificacaoCompleta" (nome, alcunha, CPF, mãe, nascimento).
- Adicionar telefone quando houver (réus, vítimas, testemunhas gerais). Policiais: sem telefone.
- Policiais: quem tiver Mat./matrícula/PM/PC/PF/PRF/GM/PP → testemunhasPoliciais, com qualificacaoCompleta "NOME / Mat. XXX" e "matricula".
- Testemunhas civis → testemunhasGerais.
- tipo policial: PM|PC|PF|PRF|GM|PP.
- DEFESA DO RÉU:
  - Defensor Público / Defensoria → tipoDefesa="defensoria", advogado="".
  - Advogado / OAB / Representação legal → tipoDefesa="particular", advogado="NOME, OAB/UF 00.000".
  - NÃO coloque advogado/defensor em "outros".
- Se faltar dado, usar "não informado".
- Responda SOMENTE com JSON.

TEXTO:
${textoCompleto}`;
}
