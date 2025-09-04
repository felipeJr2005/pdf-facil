PROMPT SIMPLIFICADO - CRIAÇÃO DE ARTEFATOS GRANDES POR ESTOURO NATURAL
OBJETIVO
Criar artefatos grandes transferindo código linha por linha até o estouro natural de memória, focando em validação precisa de continuação sobre qualquer tentativa de balanceamento.
FILOSOFIA CENTRAL
Deixe o Claude escrever até estourar naturalmente, então valide e continue com precisão cirúrgica.
REGRA FUNDAMENTAL DE REPLICAÇÃO
JAMAIS adicione qualquer comentário, header, validação ou observação no código do artefato.
PROIBIÇÕES ABSOLUTAS:

❌ // ARTEFATO UPDATE n
❌ /* Continuação da linha X */
❌ Qualquer comentário sobre divisão/continuação
❌ Headers, separadores ou numeração
❌ Texto que não esteja no arquivo original

OBRIGATORIEDADE:

✅ REPLICAÇÃO IDÊNTICA: Cada linha = linha exata do original
✅ ZERO ADIÇÕES: Nenhum caractere extra no código

ESTRATÉGIA DE CONTINUAÇÃO POR ESTOURO
PROCESSO NATURAL:

ESCREVER LIVRE: Continue transferindo linha por linha sem limite pré-definido
ESTOURO NATURAL: Quando Claude atingir limite de memória, pare automaticamente
VALIDAÇÃO CRÍTICA: Identifique EXATAMENTE onde parou
CONTINUAÇÃO PRECISA: Retome da linha seguinte sem repetir

VALIDAÇÃO DE CONTINUAÇÃO (CRÍTICA):
Após cada estouro, OBRIGATORIAMENTE verificar:

☐ Última linha completa: Qual foi a última linha 100% transferida?
☐ Linha quebrada: Existe linha incompleta que precisa ser refeita?
☐ Próxima linha: Qual linha deve iniciar a continuação?
☐ Integridade: A continuação não repetirá nem pulará linhas?

MECANISMO DE CONTINUAÇÃO PRECISA
QUANDO CONTINUAR:

Identifique a última linha COMPLETA do update anterior
NEVER repita linhas já transferidas
Inicie EXATAMENTE na próxima linha do arquivo original
Continue até próximo estouro natural

EXEMPLO DE CONTINUAÇÃO:
❌ ERRADO:
Update anterior terminou em: "function validarTelefone(tel"
Próximo update começa: "function validarTelefone(telefone) {"

✅ CORRETO:  
Update anterior terminou em: "function validarTelefone(telefone) {"
Próximo update começa: "  if (!telefone) return '';"
VALIDAÇÃO FINAL DO ARTEFATO
VERIFICAÇÕES OBRIGATÓRIAS:

Primeira linha = primeira linha do original
Última linha = última linha do original
Total de linhas = total original (EXATO)
ZERO adições no código
Todas as linhas em sequência correta

COMUNICAÇÃO:
APENAS POR CHAT (nunca no código):
"Artefato completo | Total: N linhas | Replicação 100% idêntica"
REGRAS DE OURO SIMPLIFICADAS

ESCREVA ATÉ ESTOURAR - Sem limites artificiais
VALIDE COM PRECISÃO - Identifique exato ponto de parada
CONTINUE SEM GAPS - Próxima linha exata, sem repetir
REPLIQUE PERFEITO - Zero adições, modificações ou comentários
VALIDE EXTERNAMENTE - Usuário confirma por contagem total

PROCESSO RESUMIDO

TRANSFERIR linha por linha sem limite pré-definido
ESTOURAR naturalmente quando atingir limite de memória
VALIDAR exatamente onde parou
CONTINUAR da próxima linha sem repetir
COMUNICAR apenas por chat, nunca no código
VERIFICAR total final = total original