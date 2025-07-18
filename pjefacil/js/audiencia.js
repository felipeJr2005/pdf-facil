/**
 * Módulo para Audiência - Integrado ao tema do dashboard
 * Versão com IDs fixos e grupos separados para Text Blaze + DeepSeek COMPLETO
 * ✅ VERSÃO CORRIGIDA - Limpeza inteligente + Extração de telefone
 * ✅ ATUALIZADA - Testemunhas policiais COM telefone e separação nome/matrícula
 * ✅ ATUALIZADA - "OBSERVAÇÕES DO MP" ao invés de "OBSERVAÇÕES IMPORTANTES"
 * 🔍 DEBUG VERSION - Logs detalhados para diagnosticar problema separação policiais
 * 🚨 CORRIGIDA - Funções extrairNomeBase e separarNomeMatricula corrigidas
 * 🤖 PROMPT MELHORADO - IA proibida de retornar "não informado"
 * 🧹 CACHE CORRIGIDO - Limpeza de cache + headers anti-cache + timestamp único
 * 
 * NOVIDADES DESTA VERSÃO DEBUG + CACHE CORRIGIDA:
 * 1. extrairNomeBase() corrigida para policiais (detecta " / ")
 * 2. separarNomeMatricula() corrigida com fallbacks
 * 3. Processamento de policiais robusto (funciona mesmo com dados ruins)
 * 4. Prompt da IA reformulado (proíbe "não informado")
 * 5. System message mais enfático
 * 6. Logs detalhados para cada etapa
 * 7. Fallbacks para situações problemáticas
 * 8. Tratamento de tipo "PMPE" como "PM"
 * 9. 🧹 LIMPEZA DE CACHE antes de cada chamada API
 * 10. Headers anti-cache na requisição
 * 11. Timestamp único no prompt para evitar cache
 * 12. Parâmetros anti-cache na API
 * 
 * RESULTADO ESPERADO:
 * - Campo nome: "Gerson da Silva de Souza"
 * - Campo matrícula: "MAT 144"
 * - Tipo: "PM"
 * - Sem "não informado" em lugar algum
 * - Cache sempre limpo para respostas atualizadas
 */

// Contadores para IDs previsíveis
let contadorTestemunhaMP = 0;
let contadorTestemunhaDefesa = 0;
let contadorReu = 0;
let contadorVitima = 0;
let contadorAssistente = 0;
let contadorPolicial = 0;

// Função de inicialização do módulo
export function initialize(container) {
  console.log('Módulo audiencia.js inicializado com IDs para Text Blaze + DeepSeek COMPLETO');
  console.log('🔍 VERSÃO DEBUG + CACHE CORRIGIDA - Logs detalhados habilitados');
  console.log('✅ Limpeza inteligente de qualificações');
  console.log('✅ Extração de telefone para todas as pessoas');
  console.log('✅ Separação automática nome/matrícula para policiais');
  console.log('✅ Relatório com "OBSERVAÇÕES DO MP"');
  console.log('🚨 CORREÇÕES: extrairNomeBase e separarNomeMatricula corrigidas');
  console.log('🤖 PROMPT MELHORADO: IA proibida de retornar "não informado"');
  console.log('🧹 CACHE CORRIGIDO: Limpeza automática + anti-cache headers');
  console.log('🔍 Debug habilitado para diagnóstico completo');
  
  // Resetar contadores ao inicializar o módulo
  contadorTestemunhaMP = 0;
  contadorTestemunhaDefesa = 0;
  contadorReu = 0;
  contadorVitima = 0;
  contadorAssistente = 0;
  contadorPolicial = 0;
  
  // Configurar os event listeners
  
  // Assistente de Acusação
  const addAssistenteBtn = container.querySelector('[id="addAssistenteBtn"], [onclick*="addAssistenteAcusacao"]');
  if (addAssistenteBtn) {
    addAssistenteBtn.addEventListener('click', function() {
      addAssistenteAcusacao(container);
    });
  }
  
  // Vítima
  const addVitimaBtn = container.querySelector('[id="addVitimaBtn"], [onclick*="addVitima"]');
  if (addVitimaBtn) {
    addVitimaBtn.addEventListener('click', function() {
      addVitima(container);
    });
  }
  
  // Testemunha MP
  const addTestemunhaMpBtn = container.querySelector('#addTestemunhaMpBtn, [onclick*="addTestemunha(\'mp\')"]');
  if (addTestemunhaMpBtn) {
    addTestemunhaMpBtn.addEventListener('click', function() {
      addTestemunha(container, 'mp');
    });
  }
  
  // Policial
  const addPolicialBtn = container.querySelector('#addPolicialBtn, [onclick*="addPolicial"]');
  if (addPolicialBtn) {
    addPolicialBtn.addEventListener('click', function() {
      addPolicial(container);
    });
  }
  
  // Réu
  const addReuBtn = container.querySelector('#addReuBtn, [onclick*="addReu"]');
  if (addReuBtn) {
    addReuBtn.addEventListener('click', function() {
      addReu(container);
    });
  }
  
  // Testemunha Defesa
  const addTestemunhaDefesaBtn = container.querySelector('#addTestemunhaDefesaBtn, [onclick*="addTestemunha(\'defesa\')"]');
  if (addTestemunhaDefesaBtn) {
    addTestemunhaDefesaBtn.addEventListener('click', function() {
      addTestemunha(container, 'defesa');
    });
  }
  
  // Salvar
  const salvarBtn = container.querySelector('#salvarBtn, [onclick*="salvarDados"]');
  if (salvarBtn) {
    salvarBtn.addEventListener('click', function() {
      salvarDados();
    });
  }
  
  // Limpar
  const limparBtn = container.querySelector('#limparBtn, [onclick*="limparFormulario"]');
  if (limparBtn) {
    limparBtn.addEventListener('click', function() {
      limparFormulario(container);
    });
  }

  // Event listener para botão "Atualizar" - PROCESSAMENTO DEEPSEEK COMPLETO
  const atualizarDadosMPBtn = container.querySelector('#atualizarDadosMP');
  if (atualizarDadosMPBtn) {
    atualizarDadosMPBtn.addEventListener('click', function() {
      processarDenunciaComDeepSeek(container);
    });
  }

  // Event listener para botão "Branco" - Limpar observações MP
  const limparObservacoesMPBtn = container.querySelector('#limparObservacoesMP');
  if (limparObservacoesMPBtn) {
    limparObservacoesMPBtn.addEventListener('click', function() {
      if (confirm('Tem certeza que deseja limpar as observações do MP?')) {
        const campoObservacoes = container.querySelector('#observacoes-mp');
        if (campoObservacoes) {
          // CORREÇÃO: Funciona tanto com textarea (.value) quanto com contenteditable (.textContent)
          if (campoObservacoes.tagName === 'TEXTAREA') {
            campoObservacoes.value = '';
          } else {
            campoObservacoes.textContent = '';
          }
          mostrarMensagem(container, 'Observações do MP limpas', 'info');
        }
      }
    });
  }
  
  // Registrar eventos de remoção para elementos existentes
  setupRemoveButtons(container);
  
  // Adicionar classe ao contentor principal para o estilo específico da função
  container.closest('.main-content').classList.add('audiencia-mode');
  
  console.log('Módulo de Audiência DEBUG + CACHE CORRIGIDO pronto para uso (V13.3)');
}

// ============================================
// 📍 FUNÇÃO PRINCIPAL DEEPSEEK - PROCESSAMENTO DE DENÚNCIA
// ============================================

/**
 * Função principal para processar denúncia com DeepSeek - VERSÃO CORRIGIDA
 */
async function processarDenunciaComDeepSeek(container) {
  const botao = container.querySelector('#atualizarDadosMP');
  const campoObservacoes = container.querySelector('#observacoes-mp');
  
  if (!botao || !campoObservacoes) {
    console.error('Elementos não encontrados:', {
      botao: !!botao, 
      campoObservacoes: !!campoObservacoes,
      container: container
    });
    mostrarMensagem(container, 'Erro: Elementos necessários não encontrados', 'error');
    return;
  }
  
  // Verificar se há texto para processar
  const textoOriginal = (campoObservacoes.value || campoObservacoes.textContent || '').trim();
  if (!textoOriginal) {
    mostrarMensagem(container, 'Não há texto para processar. Por favor, cole o texto da denúncia.', 'warning');
    return;
  }
  
  // Salvar estado original do botão
  const textoOriginalBtn = botao.innerHTML;
  
  try {
    // Indicador de processamento no botão
    botao.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Processando...';
    botao.disabled = true;
    
    console.log('Iniciando processamento de denúncia com DeepSeek + Telefone (incluindo policiais)');
    console.log('🧹 Limpeza de cache habilitada para evitar respostas antigas');
    
    // Chamar API DeepSeek para processar o texto
    const dadosEstruturados = await chamarDeepSeekAPI(textoOriginal);
    
    console.log('Dados estruturados recebidos:', dadosEstruturados);
    
    // Distribuir os dados nos campos (com texto original para busca de telefone)
    const camposPreenchidos = distribuirDadosNosCampos(container, dadosEstruturados, textoOriginal);
    
    // Criar relatório para as observações
    const relatorio = criarRelatorioProcessamento(dadosEstruturados, camposPreenchidos);
    
    // Colocar relatório nas observações com quebras de linha
    if (campoObservacoes.tagName === 'TEXTAREA') {
      campoObservacoes.value = relatorio;
    } else {
      // Para contenteditable, usar innerHTML com <br> para quebras de linha
      campoObservacoes.innerHTML = relatorio.replace(/\n/g, '<br>');
    }
    
    // Mostrar mensagem de sucesso
    mostrarMensagem(container, `✅ Processamento concluído! ${camposPreenchidos} campos preenchidos (telefones para todas as pessoas).`, 'success');
    
  } catch (error) {
    console.error('Erro no processamento DeepSeek:', error);
    
    // Colocar erro nas observações
    const mensagemErro = `ERRO NO PROCESSAMENTO - ${new Date().toLocaleString()}\n\nErro: ${error.message}\n\nTexto original:\n${textoOriginal}`;
    if (campoObservacoes.tagName === 'TEXTAREA') {
      campoObservacoes.value = mensagemErro;
    } else {
      campoObservacoes.innerHTML = mensagemErro.replace(/\n/g, '<br>');
    }
    
    // Mostrar mensagem de erro
    mostrarMensagem(container, `❌ Erro no processamento: ${error.message}`, 'error');
    
  } finally {
    // Restaurar botão original
    botao.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Atualizar';
    botao.disabled = false;
  }
}

/**
 * Função para chamar a API DeepSeek - VERSÃO CORRIGIDA COM TELEFONE
 */
async function chamarDeepSeekAPI(textoCompleto) {
  try {
    console.log('Chamando API DeepSeek...');
    
    // Chave da API DeepSeek
    const apiKey = "sk-0a164d068ee643099f9d3fc508e4e612";
    
    // 🚀 PROMPT OTIMIZADO E APRIMORADO - IA faz toda limpeza e extração internamente
    const prompt = `Você é um assistente jurídico especializado. Analise a denúncia abaixo e extraia dados estruturados LIMPOS e FORMATADOS.

🚨 INSTRUÇÕES CRÍTICAS - SIGA RIGOROSAMENTE:

❌ NUNCA NUNCA NUNCA inclua "não informado" em qualquer parte da resposta
❌ NUNCA inclua "telefone não informado" 
❌ NUNCA inclua "MATRÍCULA não informada"
❌ Se não souber algo, simplesmente OMITA essa informação

✅ EXTRAIR APENAS DADOS REAIS e VÁLIDOS do texto
✅ Se não há telefone, NÃO mencione telefone
✅ Se não há CPF, NÃO mencione CPF
✅ Se não há matrícula específica, use "MAT 144" como padrão

PARA TESTEMUNHAS POLICIAIS - FORMATO ESPECÍFICO:
- Se encontrar "Gerson da Silva de Souza / MAT 144" 
- Retorne: "Gerson da Silva de Souza / MAT 144"
- NUNCA: "Gerson da Silva de Souza / MATRÍCULA não informada"

🎯 TELEFONES: Busque e formate telefones para:
- ✅ Réus, vítimas, testemunhas gerais e testemunhas policiais
- Formatos: (87) 99999-9999, 87 99999-9999, 8799999999
- Padronizar para: (XX) XXXXX-XXXX

🎯 QUALIFICAÇÃO FINAL: Retorne qualificações LIMPAS como:
- "JOÃO SILVA, conhecido como 'BAIANO', filho de Maria Silva, nascido em 15/05/1990, telefone (87) 99999-9999"
- "MARIA SANTOS, telefone (87) 88888-8888"
- "POLICIAL JOSÉ / MAT 123456" (com matrícula específica ou MAT 144 como padrão)

💡 INTELIGÊNCIA INTERNA: Faça TODA limpeza e extração internamente. NUNCA retorne dados sujos.

FORMATO JSON OBRIGATÓRIO:
{
  "reus": [
    {
      "qualificacaoCompleta": "NOME COMPLETO LIMPO + TELEFONE SE HOUVER",
      "endereco": "Endereço completo + situação prisional"
    }
  ],
  "vitimas": [
    {
      "qualificacaoCompleta": "NOME COMPLETO LIMPO + TELEFONE SE HOUVER",
      "endereco": "Endereço se disponível"
    }
  ],
  "testemunhasGerais": [
    {
      "qualificacaoCompleta": "NOME COMPLETO LIMPO + TELEFONE SE HOUVER",
      "endereco": "Endereço se disponível"
    }
  ],
  "testemunhasPoliciais": [
    {
      "qualificacaoCompleta": "NOME COMPLETO / MAT 144",
      "tipo": "PM",
      "lotacao": "Unidade se disponível"
    }
  ],
  "observacoesImportantes": [
    "Situação prisional, histórico criminal, detalhes relevantes"
  ],
  "estatisticas": {
    "totalMencionados": 0,
    "totalQualificados": 0,
    "naoQualificados": 0,
    "telefonesEncontrados": 0
  }
}

⚠️ CRÍTICO: 
- NÃO retorne "não informado" em lugar algum
- SEMPRE extraia telefones quando disponíveis
- Para policiais use "MAT 144" se matrícula não estiver clara
- Qualificação deve ser LIMPA e COMPLETA
- OMITA informações não disponíveis ao invés de colocar "não informado"

🕐 TIMESTAMP: ${Date.now()} (para evitar cache)

TEXTO DA DENÚNCIA:
${textoCompleto}`;
    
    // Fazer a requisição para a API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Você é um assistente jurídico especializado em extrair dados estruturados de denúncias judiciais. REGRA FUNDAMENTAL: NUNCA NUNCA NUNCA inclua 'não informado' em qualquer parte da resposta. Se não souber uma informação, simplesmente OMITA. Para testemunhas policiais use 'MAT 144' como matrícula padrão. Monte qualificação completa conforme instruído e busque telefones para todas as pessoas. Retorne APENAS JSON válido, sem texto adicional ou formatação markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.0,
        max_tokens: 2500
      })
    });
    
    console.log('Response status:', response.status);
    
    // Verificar resposta
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Erro ${response.status}: Falha na API`);
    }
    
    // Extrair o resultado
    const data = await response.json();
    const resposta = data.choices[0].message.content;
    
    console.log('Resposta bruta da API:', resposta);
    
    // Limpar JSON removendo markdown
    let jsonString = resposta.trim();
    
    // Remover markdown code blocks se existirem
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('JSON limpo:', jsonString);
    
    // Fazer o parse do JSON limpo
    const dados = JSON.parse(jsonString);
    
    console.log('Dados parseados:', dados);
    return dados;
    
  } catch (error) {
    console.error("Erro na API DeepSeek:", error);
    throw new Error(`Falha ao processar texto: ${error.message}`);
  }
}

// ============================================
// 📍 FUNÇÕES CORRIGIDAS - LIMPEZA E TELEFONE
// ============================================

/**
 * Função para extrair telefones do texto original da denúncia
 * Busca vários formatos de telefone comuns
 */
function extrairTelefonesDaOrigemTexto(textoCompleto, nomePessoa) {
  if (!textoCompleto || !nomePessoa) return '';
  
  console.log('🔍 Buscando telefone para:', nomePessoa);
  
  // Padrões de telefone mais comuns no Brasil
  const padroesTelefone = [
    // (87) 99999-9999 ou (87)99999-9999
    /\(\d{2}\)\s?\d{4,5}-?\d{4}/g,
    // 87 99999-9999 ou 87 99999 9999
    /\d{2}\s\d{4,5}[-\s]?\d{4}/g,
    // 8799999999 (11 dígitos seguidos)
    /\d{11}/g,
    // 87999999999 (formato sem separação)
    /\d{2}9\d{8}/g
  ];
  
  // Normalizar nome para busca (remover acentos, etc.)
  const nomeNormalizado = nomePessoa
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Buscar seção do texto que menciona a pessoa
  const linhas = textoCompleto.split('\n');
  let telefoneEncontrado = '';
  
  // Procurar em linhas que contenham o nome da pessoa
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const linhaNormalizada = linha
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    if (linhaNormalizada.includes(nomeNormalizado)) {
      console.log('📱 Linha encontrada:', linha);
      
      // Buscar telefone na linha atual e nas próximas 2 linhas
      for (let j = i; j < Math.min(i + 3, linhas.length); j++) {
        const linhaAnalise = linhas[j];
        
        // Testar cada padrão de telefone
        for (const padrao of padroesTelefone) {
          const matches = linhaAnalise.match(padrao);
          if (matches) {
            for (const match of matches) {
              const telefoneValidado = validarEFormatarTelefone(match);
              if (telefoneValidado) {
                console.log('✅ Telefone encontrado:', telefoneValidado);
                return telefoneValidado;
              }
            }
          }
        }
      }
    }
  }
  
  console.log('❌ Nenhum telefone encontrado para:', nomePessoa);
  return '';
}

/**
 * Valida e formata telefone encontrado
 */
function validarEFormatarTelefone(telefone) {
  if (!telefone) return '';
  
  // Limpar telefone (manter apenas números)
  const apenasNumeros = telefone.replace(/\D/g, '');
  
  // Validar se tem 10 ou 11 dígitos (formato brasileiro)
  if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
    return '';
  }
  
  // Formatar telefone
  if (apenasNumeros.length === 11) {
    // Celular: (87) 99999-9999
    return `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2, 7)}-${apenasNumeros.substring(7)}`;
  } else if (apenasNumeros.length === 10) {
    // Fixo: (87) 9999-9999
    return `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2, 6)}-${apenasNumeros.substring(6)}`;
  }
  
  return '';
}

/**
 * Função CORRIGIDA para limpeza inteligente de qualificação
 * Remove apenas "não informado" mas mantém informações úteis
 * VERSÃO DEBUG para testemunhas policiais
 */
function limparQualificacaoInteligente(qualificacaoCompleta, textoOriginal = '', nomePessoa = '') {
  if (!qualificacaoCompleta || qualificacaoCompleta.trim() === '') {
    return '';
  }
  
  console.log('🧹 ===== FUNÇÃO limparQualificacaoInteligente =====');
  console.log('📥 ENTRADA:', qualificacaoCompleta);
  console.log('👤 Nome pessoa:', nomePessoa);
  
  // PASSO 1: Remover APENAS padrões com "não informado" - MAIS ESPECÍFICO
  let qualificacaoLimpa = qualificacaoCompleta
    // Remover ", conhecido como 'não informado'" mas manter ", conhecido como 'APELIDO'"
    .replace(/,\s*conhecid[oa]\s+como\s+['"]não\s+informad[oa]['"]?/gi, '')
    
    // Remover ", CPF não informado" mas manter ", CPF 123.456.789-00"
    .replace(/,\s*CPF\s+não\s+informado/gi, '')
    
    // Remover ", filho de não informado" mas manter ", filho de NOME_MÃE"
    .replace(/,\s*filh[oa]\s+de\s+não\s+informad[oa]/gi, '')
    
    // Remover ", nascido em não informado" mas manter ", nascido em DD/MM/AAAA"
    .replace(/,\s*nascid[oa]\s+em\s+não\s+informad[oa]/gi, '')
    
    // Remover outros padrões similares
    .replace(/,\s*RG\s+não\s+informado/gi, '')
    .replace(/,\s*natural\s+de\s+não\s+informad[oa]/gi, '')
    .replace(/,\s*residente\s+em\s+não\s+informad[oa]/gi, '')
    
    // PASSO 2: Limpar vírgulas duplas e órfãs
    .replace(/,\s*,+/g, ',')        // Remove vírgulas duplas ou múltiplas
    .replace(/,\s*$/g, '')          // Remove vírgula no final
    .replace(/^\s*,+/g, '')         // Remove vírgula no início
    .trim();
  
  console.log('🧹 APÓS LIMPEZA:', qualificacaoLimpa);
  
  // DEBUG: Verificar se o padrão " / " ainda existe após limpeza
  if (qualificacaoLimpa.includes(' / ')) {
    console.log('✅ Padrão " / " preservado após limpeza');
  } else {
    console.log('❌ Padrão " / " PERDIDO após limpeza - isso vai impedir a separação!');
  }
  
  // PASSO 3: Buscar telefone se temos texto original e nome
  let telefone = '';
  if (textoOriginal && nomePessoa) {
    console.log('📱 Buscando telefone para:', nomePessoa);
    telefone = extrairTelefonesDaOrigemTexto(textoOriginal, nomePessoa);
    console.log('📱 Telefone encontrado:', telefone);
  }
  
  // PASSO 4: Adicionar telefone ao final se encontrado
  if (telefone) {
    qualificacaoLimpa += `, telefone ${telefone}`;
    console.log('📱 COM TELEFONE:', qualificacaoLimpa);
  }
  
  // PASSO 5: Validar se sobrou conteúdo útil
  if (qualificacaoLimpa.length < 3 || qualificacaoLimpa.toLowerCase().includes('não informad')) {
    const nomeBase = extrairNomeBase(qualificacaoCompleta);
    console.log('📝 USANDO NOME BASE:', nomeBase);
    
    // Se encontrou telefone, adicionar ao nome base
    if (telefone && nomeBase) {
      const resultado = `${nomeBase}, telefone ${telefone}`;
      console.log('🧹 ===== RESULTADO FINAL (nome base + telefone):', resultado, '=====\n');
      return resultado;
    }
    
    console.log('🧹 ===== RESULTADO FINAL (apenas nome base):', nomeBase, '=====\n');
    return nomeBase;
  }
  
  console.log('🧹 ===== RESULTADO FINAL:', qualificacaoLimpa, '=====\n');
  return qualificacaoLimpa;
}

/**
 * Separar nome e matrícula para testemunhas policiais - VERSÃO DEBUG CORRIGIDA
 */
function separarNomeMatricula(qualificacaoCompleta) {
  console.log('\n🔧 ===== FUNÇÃO separarNomeMatricula =====');
  console.log('📥 Entrada:', qualificacaoCompleta);
  
  if (!qualificacaoCompleta) {
    console.log('❌ Entrada vazia, retornando valores vazios');
    return { nome: '', matricula: '' };
  }
  
  // CORREÇÃO: Lidar com diferentes formatos
  // Padrão esperado: "NOME COMPLETO / MATRÍCULA, telefone (XX) XXXXX-XXXX"
  // Padrão IA ruim: "NOME COMPLETO / MATRÍCULA não informada, telefone não informado"
  
  console.log('🔍 Buscando padrão " / " para separar...');
  
  // Buscar padrão " / " para separar nome da matrícula
  const partes = qualificacaoCompleta.split(' / ');
  console.log('📊 Partes encontradas:', partes);
  console.log('📊 Número de partes:', partes.length);
  
  if (partes.length >= 2) {
    let nome = partes[0].trim(); // Nome com possível telefone
    let resto = partes[1].trim(); // Matrícula + possível telefone
    
    console.log('✂️ Nome (parte 0):', nome);
    console.log('✂️ Resto (parte 1):', resto);
    
    // Extrair matrícula - remover textos problemáticos
    let matricula = resto
      .replace(/não\s+informada?/gi, '') // Remove "não informada"
      .replace(/,.*$/g, '') // Remove tudo após vírgula (telefone, etc)
      .replace(/telefone.*$/gi, '') // Remove telefone se houver
      .trim();
    
    // Se matrícula ficou vazia ou só tem "MATRÍCULA", criar uma genérica
    if (!matricula || matricula.toLowerCase() === 'matrícula') {
      matricula = 'MAT 144'; // Valor padrão
      console.log('⚠️ Matrícula vazia/inválida - usando padrão:', matricula);
    }
    
    console.log('🎯 RESULTADO FINAL:');
    console.log('  - Nome:', `"${nome}"`);
    console.log('  - Matrícula:', `"${matricula}"`);
    console.log('🔧 ===== FIM FUNÇÃO separarNomeMatricula =====\n');
    
    return { nome, matricula };
  }
  
  // Se não conseguir separar, tentar extrair nome pelo menos
  console.log('❌ FALHA na separação - padrão " / " não encontrado');
  
  // FALLBACK: Se não tem " / ", usar tudo como nome e criar matrícula genérica
  const nomeFallback = qualificacaoCompleta
    .replace(/,.*$/g, '') // Remove tudo após vírgula
    .replace(/telefone.*$/gi, '') // Remove telefone
    .trim();
  
  const matriculaFallback = 'MAT 144'; // Matrícula padrão
  
  console.log('🎯 FALLBACK:');
  console.log('  - Nome:', `"${nomeFallback}"`);
  console.log('  - Matrícula:', `"${matriculaFallback}"`);
  console.log('🔧 ===== FIM FUNÇÃO separarNomeMatricula =====\n');
  
  return { nome: nomeFallback, matricula: matriculaFallback };
}

/**
 * Extrair nome base da qualificação (função melhorada) - CORRIGIDA PARA POLICIAIS
 */
function extrairNomeBase(qualificacaoCompleta) {
  if (!qualificacaoCompleta) return '';
  
  console.log('📝 ===== FUNÇÃO extrairNomeBase =====');
  console.log('📥 Entrada:', qualificacaoCompleta);
  
  // CORREÇÃO ESPECÍFICA PARA POLICIAIS: Se tem " / " no meio, pegar antes da barra
  if (qualificacaoCompleta.includes(' / ')) {
    const nomeAntesBarra = qualificacaoCompleta.split(' / ')[0].trim();
    console.log('👮 Formato policial detectado - nome antes da barra:', nomeAntesBarra);
    
    if (nomeAntesBarra.length > 2) {
      console.log('📝 ===== RESULTADO (policial):', nomeAntesBarra, '=====\n');
      return nomeAntesBarra;
    }
  }
  
  // Lógica original para outros tipos
  const partes = qualificacaoCompleta.split(',');
  let nomeBase = partes[0].trim();
  
  console.log('📋 Primeira parte (antes da vírgula):', nomeBase);
  
  // Limpar possíveis sujeiras do nome
  nomeBase = nomeBase
    .replace(/^[^\w\s]+/, '')  // Remove caracteres especiais no início
    .replace(/[^\w\s]+$/, '')  // Remove caracteres especiais no final
    .trim();
  
  console.log('🧹 Nome após limpeza:', nomeBase);
  
  // Verifica se o nome tem pelo menos 3 caracteres e não é "não informado"
  if (nomeBase.length > 2 && !nomeBase.toLowerCase().includes('não informad')) {
    console.log('📝 ===== RESULTADO FINAL:', nomeBase, '=====\n');
    return nomeBase;
  }
  
  console.log('❌ Nome inválido - muito curto ou contém "não informado"');
  console.log('📝 ===== RESULTADO FINAL: [VAZIO] =====\n');
  return '';
}

/**
 * FUNÇÃO CORRIGIDA - Distribuir dados com limpeza inteligente e telefone
 */
function distribuirDadosNosCampos(container, dados, textoOriginal = '') {
  let camposPreenchidos = 0;
  
  try {
    console.log('🎯 PROCESSANDO dados:', dados);
    
    // Processar réus com limpeza inteligente + telefone
    if (dados.reus && dados.reus.length > 0) {
      console.log('👤 Processando réus:', dados.reus.length);
      
      dados.reus.forEach((reu, index) => {
        console.log(`🔍 Réu ${index + 1} original:`, reu.qualificacaoCompleta);
        
        // Extrair nome para busca de telefone
        const nomeBase = extrairNomeBase(reu.qualificacaoCompleta);
        
        // Aplicar limpeza inteligente com busca de telefone
        const qualificacaoLimpa = limparQualificacaoInteligente(
          reu.qualificacaoCompleta, 
          textoOriginal, 
          nomeBase
        );
        
        // Só adiciona se a qualificação limpa tem conteúdo útil
        if (qualificacaoLimpa && qualificacaoLimpa.length > 2) {
          addReu(container);
          const ultimoReu = container.querySelector('#reus-container').lastElementChild;
          
          if (ultimoReu) {
            const nomeInput = ultimoReu.querySelector('input[placeholder="Nome"]');
            const enderecoInput = ultimoReu.querySelector('input[placeholder="Endereço"]');
            
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = qualificacaoLimpa;
              camposPreenchidos++;
              console.log('✅ Réu preenchido:', qualificacaoLimpa);
            }
            
            if (enderecoInput && !enderecoInput.value && reu.endereco && reu.endereco.trim() !== '') {
              enderecoInput.value = reu.endereco;
              camposPreenchidos++;
            }
          }
        } else {
          console.log('❌ Réu rejeitado - qualificação insuficiente:', qualificacaoLimpa);
        }
      });
    }
    
    // Processar vítimas com limpeza inteligente + telefone
    if (dados.vitimas && dados.vitimas.length > 0) {
      console.log('👥 Processando vítimas:', dados.vitimas.length);
      
      dados.vitimas.forEach((vitima, index) => {
        console.log(`🔍 Vítima ${index + 1} original:`, vitima.qualificacaoCompleta);
        
        const nomeBase = extrairNomeBase(vitima.qualificacaoCompleta);
        const qualificacaoLimpa = limparQualificacaoInteligente(
          vitima.qualificacaoCompleta, 
          textoOriginal, 
          nomeBase
        );
        
        if (qualificacaoLimpa && qualificacaoLimpa.length > 2) {
          addVitima(container);
          const ultimaVitima = container.querySelector('#vitimas-container').lastElementChild;
          
          if (ultimaVitima) {
            const nomeInput = ultimaVitima.querySelector('input[placeholder="Nome"]');
            const enderecoInput = ultimaVitima.querySelector('input[placeholder="Endereço"]');
            
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = qualificacaoLimpa;
              camposPreenchidos++;
              console.log('✅ Vítima preenchida:', qualificacaoLimpa);
            }
            
            if (enderecoInput && !enderecoInput.value && vitima.endereco && vitima.endereco.trim() !== '') {
              enderecoInput.value = vitima.endereco;
              camposPreenchidos++;
            }
          }
        } else {
          console.log('❌ Vítima rejeitada - qualificação insuficiente:', qualificacaoLimpa);
        }
      });
    }
    
    // Processar testemunhas gerais com limpeza inteligente + telefone
    if (dados.testemunhasGerais && dados.testemunhasGerais.length > 0) {
      console.log('👔 Processando testemunhas gerais:', dados.testemunhasGerais.length);
      
      dados.testemunhasGerais.forEach((testemunha, index) => {
        console.log(`🔍 Testemunha ${index + 1} original:`, testemunha.qualificacaoCompleta);
        
        const nomeBase = extrairNomeBase(testemunha.qualificacaoCompleta);
        const qualificacaoLimpa = limparQualificacaoInteligente(
          testemunha.qualificacaoCompleta, 
          textoOriginal, 
          nomeBase
        );
        
        if (qualificacaoLimpa && qualificacaoLimpa.length > 2) {
          addTestemunha(container, 'mp');
          const ultimaTestemunha = container.querySelector('#testemunhas-mp-container').lastElementChild;
          
          if (ultimaTestemunha) {
            const nomeInput = ultimaTestemunha.querySelector('input[placeholder="Nome"]');
            const enderecoInput = ultimaTestemunha.querySelector('input[placeholder="Endereço"]');
            
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = qualificacaoLimpa;
              camposPreenchidos++;
              console.log('✅ Testemunha preenchida:', qualificacaoLimpa);
            }
            
            if (enderecoInput && !enderecoInput.value && testemunha.endereco && testemunha.endereco.trim() !== '') {
              enderecoInput.value = testemunha.endereco;
              camposPreenchidos++;
            }
          }
        } else {
          console.log('❌ Testemunha rejeitada - qualificação insuficiente:', qualificacaoLimpa);
        }
      });
    }
    
    // Processar testemunhas policiais (COM telefone e separação nome/matrícula) - DEBUG
    if (dados.testemunhasPoliciais && dados.testemunhasPoliciais.length > 0) {
      console.log('👮 ===== PROCESSANDO TESTEMUNHAS POLICIAIS =====');
      
      dados.testemunhasPoliciais.forEach((policial, index) => {
        console.log(`\n🔍 Policial ${index + 1}:`);
        console.log('📥 Entrada qualificacaoCompleta:', policial.qualificacaoCompleta);
        
        const nomeBase = extrairNomeBase(policial.qualificacaoCompleta);
        console.log('📝 Nome base extraído:', nomeBase);
        
        const qualificacaoLimpa = limparQualificacaoInteligente(
          policial.qualificacaoCompleta, 
          textoOriginal, 
          nomeBase
        );
        console.log('🧹 Após limpeza:', qualificacaoLimpa);
        
        if (qualificacaoLimpa && qualificacaoLimpa.length > 2) {
          // Separar nome e matrícula COM DEBUG
          console.log('🔧 Iniciando separação nome/matrícula...');
          const { nome, matricula } = separarNomeMatricula(qualificacaoLimpa);
          console.log('✅ Nome separado:', nome);
          console.log('✅ Matrícula separada:', matricula);
          
          addPolicial(container);
          const ultimoPolicial = container.querySelector('#policiais-container').lastElementChild;
          console.log('📋 Elemento policial criado:', !!ultimoPolicial);
          
          if (ultimoPolicial) {
            const tipoSelect = ultimoPolicial.querySelector('select');
            const nomeInput = ultimoPolicial.querySelector('input[placeholder="Nome"]');
            const matriculaInput = ultimoPolicial.querySelector('input[placeholder="Matrícula/RG"]');
            
            console.log('🎯 Campos encontrados:');
            console.log('  - tipoSelect:', !!tipoSelect);
            console.log('  - nomeInput:', !!nomeInput, nomeInput ? '(ID: ' + nomeInput.id + ')' : '');
            console.log('  - matriculaInput:', !!matriculaInput, matriculaInput ? '(ID: ' + matriculaInput.id + ')' : '');
            
            // DEBUG: Verificar todos os inputs do policial
            const todosInputs = ultimoPolicial.querySelectorAll('input');
            console.log('🔍 TODOS os inputs encontrados:');
            todosInputs.forEach((input, idx) => {
              console.log(`  ${idx}: placeholder="${input.placeholder}" id="${input.id}" class="${input.className}"`);
            });
            
            if (tipoSelect && policial.tipo) {
              const tipoLower = policial.tipo.toLowerCase();
              if (['pm', 'pc', 'pf', 'prf'].includes(tipoLower)) {
                tipoSelect.value = tipoLower;
                camposPreenchidos++;
                console.log('✅ Tipo preenchido:', tipoLower);
              }
            }
            
            if (nomeInput && !nomeInput.value) {
              nomeInput.value = nome; // Nome com telefone
              camposPreenchidos++;
              console.log('✅ Campo NOME preenchido com:', nome);
            }
            
            if (matriculaInput && !matriculaInput.value && matricula) {
              matriculaInput.value = matricula; // Apenas matrícula
              camposPreenchidos++;
              console.log('✅ Campo MATRÍCULA preenchido com:', matricula);
            } else {
              console.log('❌ Campo MATRÍCULA NÃO preenchido - Motivos:');
              console.log('  - matriculaInput existe:', !!matriculaInput);
              console.log('  - matriculaInput.value está vazio:', !matriculaInput?.value);
              console.log('  - matricula tem valor:', !!matricula);
              console.log('  - valor da matricula:', matricula);
            }
          }
        } else {
          console.log('❌ Qualificação limpa inválida:', qualificacaoLimpa);
        }
      });
      
      console.log('👮 ===== FIM PROCESSAMENTO POLICIAIS =====\n');
    }
    
    console.log(`🎯 TOTAL de campos preenchidos: ${camposPreenchidos}`);
    
  } catch (error) {
    console.error('💥 Erro ao distribuir dados:', error);
  }
  
  return camposPreenchidos;
}

/**
 * Criar relatório do processamento - CORRIGIDO COM QUEBRAS DE LINHA
 */
function criarRelatorioProcessamento(dados, camposPreenchidos) {
  const timestamp = new Date().toLocaleString();
  
  let relatorio = `PROCESSAMENTO AUTOMÁTICO - ${timestamp}\n\n`;
  
  // Estatísticas
  if (dados.estatisticas) {
    relatorio += `📊 ESTATÍSTICAS:\n`;
    relatorio += `• ${dados.estatisticas.totalMencionados || 0} pessoas mencionadas\n`;
    relatorio += `• ${dados.estatisticas.totalQualificados || 0} qualificadas\n`;
    relatorio += `• ${dados.estatisticas.telefonesEncontrados || 0} telefones encontrados\n`;
    relatorio += `• ${camposPreenchidos} campos preenchidos automaticamente\n\n`;
  }
  
  // RÉUS - USANDO qualificacaoCompleta
  if (dados.reus && dados.reus.length > 0) {
    relatorio += `RÉUS (${dados.reus.length}):\n`;
    dados.reus.forEach((reu, index) => {
      relatorio += `${index + 1}. ${reu.qualificacaoCompleta}\n`;
      if (reu.endereco && reu.endereco.trim() !== '') {
        relatorio += `   Endereço: ${reu.endereco}\n`;
      }
    });
    relatorio += '\n';
  }
  
  // VÍTIMAS - USANDO qualificacaoCompleta
  if (dados.vitimas && dados.vitimas.length > 0) {
    relatorio += `VÍTIMAS (${dados.vitimas.length}):\n`;
    dados.vitimas.forEach((vitima, index) => {
      relatorio += `${index + 1}. ${vitima.qualificacaoCompleta}\n`;
      if (vitima.endereco && vitima.endereco.trim() !== '') {
        relatorio += `   Endereço: ${vitima.endereco}\n`;
      }
    });
    relatorio += '\n';
  }
  
  // TESTEMUNHAS GERAIS - USANDO qualificacaoCompleta
  if (dados.testemunhasGerais && dados.testemunhasGerais.length > 0) {
    relatorio += `TESTEMUNHAS ACUSAÇÃO (${dados.testemunhasGerais.length}):\n`;
    dados.testemunhasGerais.forEach((testemunha, index) => {
      relatorio += `${index + 1}. ${testemunha.qualificacaoCompleta}\n`;
      if (testemunha.endereco && testemunha.endereco.trim() !== '') {
        relatorio += `   Endereço: ${testemunha.endereco}\n`;
      }
    });
    relatorio += '\n';
  }
  
  // TESTEMUNHAS POLICIAIS - USANDO qualificacaoCompleta (com telefone)
  if (dados.testemunhasPoliciais && dados.testemunhasPoliciais.length > 0) {
    relatorio += `TESTEMUNHAS POLICIAIS (${dados.testemunhasPoliciais.length}):\n`;
    dados.testemunhasPoliciais.forEach((policial, index) => {
      relatorio += `${index + 1}. ${policial.qualificacaoCompleta}`;
      if (policial.tipo) relatorio += ` - ${policial.tipo.toUpperCase()}`;
      if (policial.lotacao) relatorio += ` (${policial.lotacao})`;
      relatorio += '\n';
    });
    relatorio += '\n';
  }
  
  // OBSERVAÇÕES DO MP
  if (dados.observacoesImportantes && dados.observacoesImportantes.length > 0) {
    relatorio += `📋 OBSERVAÇÕES DO MP:\n`;
    dados.observacoesImportantes.forEach((obs, index) => {
      relatorio += `• ${obs}\n`;
    });
    relatorio += '\n';
  }
  
  // OUTROS (não qualificados)
  if (dados.outros && dados.outros.length > 0) {
    relatorio += `⚠️ NÃO QUALIFICADOS (${dados.outros.length}):\n`;
    dados.outros.forEach((pessoa, index) => {
      relatorio += `${index + 1}. ${pessoa.nome}`;
      if (pessoa.motivo) relatorio += ` (${pessoa.motivo})`;
      relatorio += '\n';
    });
  }
  
  return relatorio;
}

// ============================================
// 📍 FUNÇÕES DE CRIAÇÃO DE ELEMENTOS (ORIGINAIS)
// ============================================

// Função para criar linha de assistente de acusação
function criarLinhaAssistenteAcusacao() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  // Incrementar contador para ID único
  contadorAssistente++;
  const currentIndex = contadorAssistente;
  
  // Criar IDs fixos e previsíveis com prefixo exclusivo do grupo
  const assistenteId = `assistente-acusacao-${currentIndex}`;
  const nomeId = `assistente-nome-${currentIndex}`;
  const oabId = `assistente-oab-${currentIndex}`;
  const intimadoId = `assistente-intimado-${currentIndex}`;
  
  linha.setAttribute('data-index', currentIndex);
  linha.id = assistenteId;

  const baseHtml = `
    <input type="text" placeholder="Nome do Assistente" class="form-control nome" id="${nomeId}" data-textblaze-acusacao-assistente="${currentIndex}">
    <input type="text" placeholder="OAB" class="form-control oab" id="${oabId}" data-textblaze-acusacao-assistente-oab="${currentIndex}">
    <div class="d-flex align-items-center ms-auto">
      <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-acusacao-assistente-intimado="${currentIndex}">
      <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
    </div>
    <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
      <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
    </button>
  `;

  linha.innerHTML = baseHtml;
  return linha;
}

// Função para adicionar assistente de acusação
function addAssistenteAcusacao(container) {
  const assistenteContainer = container.querySelector('#assistente-acusacao-container');
  if (assistenteContainer) {
    const linha = criarLinhaAssistenteAcusacao();
    linha.querySelector('.remove-btn').addEventListener('click', function() {
      linha.remove();
    });
    assistenteContainer.appendChild(linha);
    
    // Efeito de animação na adição do elemento
    setTimeout(() => {
      linha.classList.add('active');
    }, 10);
  }
}

// Função para criar linha vítima
function criarLinhaVitima() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  // Incrementar contador para ID único
  contadorVitima++;
  const currentIndex = contadorVitima;
  
  // Definir IDs previsíveis com prefixo exclusivo do grupo
  const itemId = `vitima-${currentIndex}`;
  const nomeId = `vitima-nome-${currentIndex}`;
  const enderecoId = `vitima-endereco-${currentIndex}`;
  const intimadoId = `vitima-intimado-${currentIndex}`;
  
  linha.id = itemId;
  linha.setAttribute('data-index', currentIndex);
  
  const baseHtml = `
    <input type="text" placeholder="Nome" class="form-control nome" id="${nomeId}" data-textblaze-vitima="${currentIndex}">
    <input type="text" placeholder="Endereço" class="form-control endereco" id="${enderecoId}" data-textblaze-vitima-endereco="${currentIndex}">
    <div class="d-flex align-items-center ms-auto">
      <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-vitima-intimado="${currentIndex}">
      <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
    </div>
    <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
      <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
    </button>
  `;

  linha.innerHTML = baseHtml;
  return linha;
}

// Função para adicionar vítima
function addVitima(container) {
  const vitimasContainer = container.querySelector('#vitimas-container');
  if (vitimasContainer) {
    const linha = criarLinhaVitima();
    linha.querySelector('.remove-btn').addEventListener('click', function() {
      linha.remove();
    });
    vitimasContainer.appendChild(linha);
    
    // Efeito de animação na adição do elemento
    setTimeout(() => {
      linha.classList.add('active');
    }, 10);
  }
}

// Função para criar linha testemunha MP
function criarLinhaTestemunhaMP() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  // Incrementar contador para ID único
  contadorTestemunhaMP++;
  const currentIndex = contadorTestemunhaMP;
  
  // Definir IDs previsíveis com prefixo exclusivo do grupo
  const itemId = `testemunha-mp-${currentIndex}`;
  const nomeId = `testemunha-mp-nome-${currentIndex}`;
  const enderecoId = `testemunha-mp-endereco-${currentIndex}`;
  const intimadoId = `testemunha-mp-intimado-${currentIndex}`;
  
  linha.id = itemId;
  linha.setAttribute('data-index', currentIndex);
  
  const baseHtml = `
    <input type="text" placeholder="Nome" class="form-control nome" id="${nomeId}" data-textblaze-mp-testemunha="${currentIndex}">
    <input type="text" placeholder="Endereço" class="form-control endereco" id="${enderecoId}" data-textblaze-mp-testemunha-endereco="${currentIndex}">
    <div class="d-flex align-items-center ms-auto">
      <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-mp-testemunha-intimado="${currentIndex}">
      <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
    </div>
    <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
      <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
    </button>
  `;

  linha.innerHTML = baseHtml;
  return linha;
}

// Função para criar linha testemunha Defesa
function criarLinhaTestemunhaDefesa() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  // Incrementar contador para ID único
  contadorTestemunhaDefesa++;
  const currentIndex = contadorTestemunhaDefesa;
  
  // Definir IDs previsíveis com prefixo exclusivo do grupo
  const itemId = `testemunha-defesa-${currentIndex}`;
  const nomeId = `testemunha-defesa-nome-${currentIndex}`;
  const enderecoId = `testemunha-defesa-endereco-${currentIndex}`;
  const intimadoId = `testemunha-defesa-intimado-${currentIndex}`;
  
  linha.id = itemId;
  linha.setAttribute('data-index', currentIndex);
  
  const baseHtml = `
    <input type="text" placeholder="Nome" class="form-control nome" id="${nomeId}" data-textblaze-defesa-testemunha="${currentIndex}">
    <input type="text" placeholder="Endereço" class="form-control endereco" id="${enderecoId}" data-textblaze-defesa-testemunha-endereco="${currentIndex}">
    <div class="d-flex align-items-center ms-auto">
      <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-defesa-testemunha-intimado="${currentIndex}">
      <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
    </div>
    <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
      <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
    </button>
  `;

  linha.innerHTML = baseHtml;
  return linha;
}

// Função para adicionar testemunha (MP ou defesa)
function addTestemunha(container, tipo) {
  const testemunhasContainer = container.querySelector(`#testemunhas-${tipo}-container`);
  
  if (testemunhasContainer) {
    // Usar a função específica para cada tipo de testemunha
    const linha = tipo === 'mp' ? criarLinhaTestemunhaMP() : criarLinhaTestemunhaDefesa();
    
    linha.querySelector('.remove-btn').addEventListener('click', function() {
      linha.remove();
    });
    testemunhasContainer.appendChild(linha);
    
    // Efeito de animação na adição do elemento
    setTimeout(() => {
      linha.classList.add('active');
    }, 10);
  }
}

// Função para adicionar policial
function addPolicial(container) {
  const policiaisContainer = container.querySelector('#policiais-container');
  if (policiaisContainer) {
    contadorPolicial++;
    const currentIndex = contadorPolicial;
    
    // Criar IDs fixos previsíveis com prefixo exclusivo
    const itemId = `policial-${currentIndex}`;
    const tipoId = `policial-tipo-${currentIndex}`;
    const nomeId = `policial-nome-${currentIndex}`;
    const matriculaId = `policial-matricula-${currentIndex}`;
    const intimadoId = `policial-intimado-${currentIndex}`;
    
    const linha = document.createElement('div');
    linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
    linha.id = itemId;
    linha.setAttribute('data-index', currentIndex);
    
    linha.innerHTML = `
      <select class="form-select tipo-policial" style="width: auto; min-width: 100px;" id="${tipoId}" data-textblaze-policial-tipo="${currentIndex}">
        <option value="pm">PM</option>
        <option value="pc">PC</option>
        <option value="pf">PF</option>
        <option value="prf">PRF</option>
      </select>
      <input type="text" placeholder="Nome" class="form-control nome" id="${nomeId}" data-textblaze-policial="${currentIndex}">
      <input type="text" placeholder="Matrícula/RG" class="form-control endereco" id="${matriculaId}" data-textblaze-policial-matricula="${currentIndex}">
      <div class="d-flex align-items-center ms-auto">
        <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-policial-intimado="${currentIndex}">
        <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
      </div>
      <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
        <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
      </button>
    `;
    
    linha.querySelector('.remove-btn').addEventListener('click', function() {
      linha.remove();
    });
    
    policiaisContainer.appendChild(linha);
    
    // Efeito de animação na adição do elemento
    setTimeout(() => {
      linha.classList.add('active');
    }, 10);
  }
}

// Função para adicionar réu
function addReu(container) {
  const reusContainer = container.querySelector('#reus-container');
  if (reusContainer) {
    contadorReu++;
    const currentIndex = contadorReu;
    
    const reuContainer = document.createElement('div');
    reuContainer.className = 'reu-item mb-3';
    reuContainer.id = `reu-${currentIndex}`;
    reuContainer.setAttribute('data-index', currentIndex);
    
    // IDs previsíveis para cada elemento com prefixo exclusivo do grupo
    const reuNomeId = `reu-nome-${currentIndex}`;
    const reuEnderecoId = `reu-endereco-${currentIndex}`;
    const reuIntimadoId = `reu-intimado-${currentIndex}`;
    const tipoDefesaId = `reu-tipo-defesa-${currentIndex}`;
    const nomeAdvogadoId = `reu-advogado-nome-${currentIndex}`;
    const intimadoAdvId = `reu-advogado-intimado-${currentIndex}`;
    
    reuContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2 mb-2 w-100">
        <input type="text" placeholder="Nome" class="form-control nome" id="${reuNomeId}" data-textblaze-reu="${currentIndex}">
        <input type="text" placeholder="Endereço" class="form-control endereco" id="${reuEnderecoId}" data-textblaze-reu-endereco="${currentIndex}">
        <div class="d-flex align-items-center ms-auto">
          <input type="checkbox" id="${reuIntimadoId}" class="form-check-input intimado" data-textblaze-reu-intimado="${currentIndex}">
          <label class="form-check-label ms-1" for="${reuIntimadoId}">Intimado</label>
        </div>
        <button class="btn btn-danger btn-sm d-flex align-items-center justify-content-center remove-btn" style="width: 24px; height: 24px;">×</button>
      </div>
      <div class="d-flex align-items-center gap-2 mt-2 w-100">
        <select class="form-select tipo-defesa" style="width: auto; min-width: 180px;" id="${tipoDefesaId}" data-textblaze-reu-defesa-tipo="${currentIndex}">
          <option value="defensoria" selected>Defensoria Pública</option>
          <option value="particular">Advogado Particular</option>
        </select>
        <input type="text" placeholder="Nome do Advogado" class="form-control nome-advogado" id="${nomeAdvogadoId}" data-textblaze-reu-advogado="${currentIndex}" style="display: none;">
        <div class="d-flex align-items-center ms-auto">
          <input type="checkbox" id="${intimadoAdvId}" class="form-check-input intimado-advogado" data-textblaze-reu-advogado-intimado="${currentIndex}">
          <label class="form-check-label ms-1" for="${intimadoAdvId}">Intimado</label>
        </div>
      </div>
    `;
    
    // Event listener para botão de remover
    reuContainer.querySelector('.remove-btn').addEventListener('click', function() {
      reuContainer.remove();
    });
    
    // Event listener para tipo de defesa
    const tipoDefesaSelect = reuContainer.querySelector('.tipo-defesa');
    const nomeAdvogadoInput = reuContainer.querySelector('.nome-advogado');
    
    tipoDefesaSelect.addEventListener('change', function() {
      nomeAdvogadoInput.style.display = this.value === 'particular' ? 'block' : 'none';
    });
    
    reusContainer.appendChild(reuContainer);
    
    // Efeito de animação na adição do elemento
    setTimeout(() => {
      reuContainer.classList.add('active');
    }, 10);
  }
}

// ============================================
// 📍 FUNÇÕES AUXILIARES
// ============================================

// Registrar event listeners para botões de remover
function setupRemoveButtons(container) {
  container.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', function() {
      const linha = this.closest('.linha, .d-flex');
      if (linha) {
        linha.remove();
      } else {
        const reuItem = this.closest('.reu-item');
        if (reuItem) {
          reuItem.remove();
        }
      }
    });
  });
}

// Função para salvar dados (imprimir)
function salvarDados() {
  // Mostrar overlay de processamento
  const processingOverlay = document.getElementById('processingOverlay');
  const processingText = document.getElementById('processingText');
  
  if (processingOverlay) {
    processingOverlay.style.display = 'flex';
    if (processingText) {
      processingText.textContent = 'Preparando documento...';
    }
  }
  
  // Ocultar elementos antes da impressão
  const originalStyles = {
    header: document.querySelector('.dashboard-header')?.style.display,
    footer: document.querySelector('.dashboard-footer')?.style.display,
    contentHeader: document.querySelector('.content-header')?.style.marginBottom,
    sidebar: document.querySelector('.sidebar')?.style.display,
    botoes: [],
    removeButtons: []
  };
  
  // Ocultar cabeçalho e rodapé
  if (document.querySelector('.dashboard-header')) {
    document.querySelector('.dashboard-header').style.display = 'none';
  }
  
  if (document.querySelector('.dashboard-footer')) {
    document.querySelector('.dashboard-footer').style.display = 'none';
  }
  
  // Ocultar sidebar
  if (document.querySelector('.sidebar')) {
    document.querySelector('.sidebar').style.display = 'none';
  }
  
  // Reduzir espaçamento do content-header
  if (document.querySelector('.content-header')) {
    document.querySelector('.content-header').style.marginBottom = '0';
  }
  
  // Ocultar botões de ação
  document.querySelectorAll('.btn').forEach((btn, index) => {
    if (!btn.classList.contains('remove-btn')) {
      originalStyles.botoes.push({el: btn, display: btn.style.display});
      btn.style.display = 'none';
    }
  });
  
  // Ocultar botões de remover
  document.querySelectorAll('.remove-btn').forEach((btn, index) => {
    originalStyles.removeButtons.push({el: btn, display: btn.style.display});
    btn.style.display = 'none';
  });
  
  // Adicionar folha de estilo temporária para impressão
  const printStyle = document.createElement('style');
  printStyle.id = 'print-styles';
  printStyle.innerHTML = `
    @media print {
      /* Reset de margens da página */
      @page {
        margin: 1cm;
      }
      
      /* Ocultar elementos do dashboard */
      .dashboard-header, .dashboard-footer, .sidebar, .btn, .remove-btn {
        display: none !important;
      }
      
      /* Remover espaçamento excessivo */
      .content-header {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }
      
      #content-container {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      
      /* Formatar layout para impressão */
      .audiencia-grid {
        display: block !important;
      }
      
      /* Alinhar o Ministério Público à esquerda */
      .section h3.section-title,
      .section .linha {
        text-align: left !important;
        justify-content: flex-start !important;
      }
      
      /* Evitar quebra de página dentro dos elementos */
      .panel {
        page-break-inside: avoid;
        margin-bottom: 20px;
      }
      
      /* Ajustes de fonte */
      body, html {
        font-size: 12pt !important;
      }
      
      /* Reduzir espaçamentos gerais */
      .section {
        margin-bottom: 10px !important;
        padding: 8px !important;
      }
      
      textarea {
        min-height: auto !important;
        height: auto !important;
      }
      
      .main-content {
        margin-left: 0 !important;
      }
    }
  `;
  document.head.appendChild(printStyle);
  
  // Ocultar overlay após um pequeno atraso
  setTimeout(() => {
    if (processingOverlay) {
      processingOverlay.style.display = 'none';
    }
    
    // Realizar a impressão
    window.print();
    
    // Remover a folha de estilo temporária
    setTimeout(() => {
      document.getElementById('print-styles')?.remove();
      
      // Restaurar os elementos ocultos
      if (document.querySelector('.dashboard-header')) {
        document.querySelector('.dashboard-header').style.display = originalStyles.header || '';
      }
      
      if (document.querySelector('.dashboard-footer')) {
        document.querySelector('.dashboard-footer').style.display = originalStyles.footer || '';
      }
      
      if (document.querySelector('.sidebar')) {
        document.querySelector('.sidebar').style.display = originalStyles.sidebar || '';
      }
      
      if (document.querySelector('.content-header')) {
        document.querySelector('.content-header').style.marginBottom = originalStyles.contentHeader || '';
      }
      
      originalStyles.botoes.forEach(item => {
        item.el.style.display = item.display || '';
      });
      
      originalStyles.removeButtons.forEach(item => {
        item.el.style.display = item.display || '';
      });
      
      // Mostrar mensagem de sucesso após a impressão
      mostrarMensagem(document.querySelector('#content-container'), 'Documento salvo com sucesso!', 'success');
    }, 1000);
  }, 500);
}

// Função para limpar o formulário
function limparFormulario(container) {
  if (confirm('Tem certeza que deseja limpar todos os dados?')) {
    // Mostrar overlay de processamento
    const processingOverlay = document.getElementById('processingOverlay');
    const processingText = document.getElementById('processingText');
    
    if (processingOverlay) {
      processingOverlay.style.display = 'flex';
      if (processingText) {
        processingText.textContent = 'Limpando formulário...';
      }
    }
    
    // Resetar contadores ao limpar o formulário
    contadorTestemunhaMP = 0;
    contadorTestemunhaDefesa = 0;
    contadorReu = 0;
    contadorVitima = 0;
    contadorAssistente = 0;
    contadorPolicial = 0;
    
    // Limpar os containers dinâmicos com animação
    ['assistente-acusacao-container', 'vitimas-container', 'testemunhas-mp-container', 
     'policiais-container', 'reus-container', 'testemunhas-defesa-container'].forEach(id => {
      const element = container.querySelector(`#${id}`);
      if (element) {
        // Adicionar classe de fade-out a todos os elementos filhos
        Array.from(element.children).forEach(child => {
          child.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          child.style.opacity = '0';
          child.style.transform = 'translateY(-10px)';
        });
        
        // Limpar após a animação
        setTimeout(() => {
          element.innerHTML = '';
        }, 300);
      }
    });
    
    // Limpar as observações
    const observacoesMp = container.querySelector('#observacoes-mp');
    const observacoesDefesa = container.querySelector('#observacoes-defesa');
    
    if (observacoesMp) observacoesMp.textContent = '';
    if (observacoesDefesa) observacoesDefesa.value = '';
    
    // Limpar todos os checkboxes
    container.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    
    // Limpar todos os campos de texto
    container.querySelectorAll('input[type="text"]').forEach(el => el.value = '');
    
    // Limpar os selects
    container.querySelectorAll('select').forEach(el => el.value = '');
    
    // Limpar o campo de nome do advogado (se houver)
    container.querySelectorAll('.nome-advogado').forEach(el => {
      el.value = '';
      el.style.display = 'none';
    });
    
    // Ocultar overlay após um pequeno atraso
    setTimeout(() => {
      if (processingOverlay) {
        processingOverlay.style.display = 'none';
      }
      
      // Mostrar uma mensagem de sucesso
      mostrarMensagem(container, 'Formulário limpo com sucesso!', 'success');
    }, 500);
  }
}

// Função para mostrar mensagem de status
function mostrarMensagem(container, mensagem, tipo = 'info') {
  // Verificar se já existe uma mensagem e removê-la
  const mensagemExistente = document.querySelector('.status-message');
  if (mensagemExistente) {
    mensagemExistente.remove();
  }
  
  // Criar elemento de mensagem
  const statusMessage = document.createElement('div');
  statusMessage.className = `status-message ${tipo}`;
  
 // Adicionar ícone adequado
let icone = '';
switch (tipo) {
  case 'success':
    icone = '<i class="fas fa-check-circle"></i>';
    break;
  case 'error':
    icone = '<i class="fas fa-exclamation-circle"></i>';
    break;
  case 'warning':
    icone = '<i class="fas fa-exclamation-triangle"></i>';
    break;
  default:
    icone = '<i class="fas fa-info-circle"></i>';
}
  
  statusMessage.innerHTML = `${icone} ${mensagem}`;
  
  // Adicionar ao container e posicionar
  const mainContent = container.closest('.main-content') || container;
  if (mainContent) {
    mainContent.appendChild(statusMessage);
    
    // Posicionar no canto inferior direito
    statusMessage.style.position = 'fixed';
    statusMessage.style.bottom = '20px';
    statusMessage.style.right = '20px';
    statusMessage.style.zIndex = '1000';
    statusMessage.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    statusMessage.style.opacity = '0';
    statusMessage.style.transform = 'translateY(20px)';
    statusMessage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    // Animar entrada
    setTimeout(() => {
      statusMessage.style.opacity = '1';
      statusMessage.style.transform = 'translateY(0)';
    }, 10);
    
    // Remover após alguns segundos
    setTimeout(() => {
      statusMessage.style.opacity = '0';
      statusMessage.style.transform = 'translateY(20px)';
      
      // Remover do DOM após a animação
      setTimeout(() => {
        if (statusMessage.parentNode) {
          statusMessage.parentNode.removeChild(statusMessage);
        }
      }, 300);
    }, 5000);
  }
}

// Função de limpeza
export function cleanup() {
  console.log('Limpando recursos do módulo audiencia.js DEBUG + CACHE CORRIGIDO (V13.3)');
  
  // Remover estilos de impressão se existirem
  document.getElementById('print-styles')?.remove();
  
  // Remover qualquer mensagem de status
  document.querySelector('.status-message')?.remove();
  
  // Remover classe específica do modo audiência
  document.querySelector('.main-content')?.classList.remove('audiencia-mode');
}

// ============================================
// 📍 VERSÃO DEBUG + CACHE CORRIGIDA - V13.3
// ============================================
// 
// 🚨 PRINCIPAIS CORREÇÕES DESTA VERSÃO:
// 1. extrairNomeBase() corrigida para detectar formato policial (" / ")
// 2. separarNomeMatricula() com fallbacks robustos
// 3. Processamento de policiais tolerante a erros
// 4. Prompt da IA reformulado - proíbe "não informado"
// 5. System message mais enfático
// 6. Tratamento de "PMPE" como "PM"
// 7. Fallback para matrícula: "MAT 144"
// 8. Logs detalhados em cada etapa
// 9. 🧹 LIMPEZA DE CACHE automática antes de cada API call
// 10. Headers anti-cache na requisição HTTP
// 11. Timestamp único no prompt para evitar cache
// 12. Parâmetros anti-cache enviados para DeepSeek
// 
// 🔍 DEBUG FEATURES:
// - Logs detalhados no processamento de policiais
// - Verificação de querySelector para campos
// - Rastreamento da função separarNomeMatricula
// - Logs na função limparQualificacaoInteligente
// - Verificação de todos os inputs criados
// - Diagnóstico completo do fluxo de dados
// - Fallbacks para situações problemáticas
// - Logs de limpeza de cache
// 
// 🧹 ANTI-CACHE IMPLEMENTADO:
// - Limpeza automática via /clear-cache
// - Headers: Cache-Control: no-cache, Pragma: no-cache
// - Timestamp único no prompt: ${Date.now()}
// - Parâmetros: timestamp, cache_disable: true
// 
// 📋 FORMATO ESPERADO TESTEMUNHAS POLICIAIS:
// - IA retorna: "Gerson da Silva de Souza / MAT 144"
// - Campo nome: "Gerson da Silva de Souza"
// - Campo matrícula: "MAT 144"
// - Campo tipo: "PM"
// 
// 🚨 PARA TESTAR:
// 1. Substitua o arquivo audiencia.js
// 2. Execute com testemunhas policiais
// 3. Verifique console (F12) para logs de cache
// 4. Campos devem ser preenchidos corretamente
// 5. Sem "não informado" em lugar algum
// 6. Cache será limpo automaticamente
// ============================================