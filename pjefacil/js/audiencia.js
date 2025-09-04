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

  // Event listener para botão "DeepSeek" - PROCESSAMENTO DEEPSEEK COMPLETO
  const processarDeepSeekBtn = container.querySelector('#processarDeepSeek');
  if (processarDeepSeekBtn) {
    processarDeepSeekBtn.addEventListener('click', function() {
      processarDenunciaComIA(container, 'deepseek');
    });
  }

  // Event listener para botão "Gemini" - PROCESSAMENTO GEMINI COMPLETO
  const processarGeminiBtn = container.querySelector('#processarGemini');
  if (processarGeminiBtn) {
    processarGeminiBtn.addEventListener('click', function() {
      processarDenunciaComIA(container, 'gemini');
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
  
  console.log('Módulo de Audiência pronto para uso');
}

// ============================================
// 🔍 FUNÇÃO PRINCIPAL DEEPSEEK - PROCESSAMENTO DE DENÚNCIA
// ============================================

/**
 * Função GENÉRICA para processar denúncia com qualquer IA - REFATORADA
 */
async function processarDenunciaComIA(container, modelo) {
  const botao = container.querySelector(`#processar${modelo === 'deepseek' ? 'DeepSeek' : 'Gemini'}`);
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
    
    const nomeModelo = modelo === 'deepseek' ? 'DeepSeek' : 'Gemini';
    console.log(`Iniciando processamento de denúncia com ${nomeModelo} + Telefone (exceto policiais)`);
    
    // Chamar API específica baseada no modelo
    const dadosEstruturados = modelo === 'deepseek' ? 
      await chamarDeepSeekAPI(textoOriginal) : 
      await chamarGeminiAPI(textoOriginal);
    
    console.log('Dados estruturados recebidos:', dadosEstruturados);
    
    // Distribuir os dados nos campos (com texto original para busca de telefone)
    const camposPreenchidos = distribuirDadosNosCampos(container, dadosEstruturados, textoOriginal);
    
    // Criar relatório para as observações
    const relatorio = criarRelatorioProcessamento(dadosEstruturados, camposPreenchidos, nomeModelo);
    
    // Colocar relatório nas observações com quebras de linha
    if (campoObservacoes.tagName === 'TEXTAREA') {
      campoObservacoes.value = relatorio;
    } else {
      // Para contenteditable, usar innerHTML com <br> para quebras de linha
      campoObservacoes.innerHTML = relatorio.replace(/\n/g, '<br>');
    }
    
    // Mostrar mensagem de sucesso
    mostrarMensagem(container, `✅ Processamento ${nomeModelo} concluído! ${camposPreenchidos} campos preenchidos (telefones para réus, vítimas e testemunhas gerais).`, 'success');
    
  } catch (error) {
    console.error(`Erro no processamento ${modelo}:`, error);
    
    // Colocar erro nas observações
    const mensagemErro = `ERRO NO PROCESSAMENTO - ${new Date().toLocaleString()}\n\nErro: ${error.message}\n\nTexto original:\n${textoOriginal}`;
    if (campoObservacoes.tagName === 'TEXTAREA') {
      campoObservacoes.value = mensagemErro;
    } else {
      campoObservacoes.innerHTML = mensagemErro.replace(/\n/g, '<br>');
    }
    
    // Mostrar mensagem de erro
    const nomeModelo = modelo === 'deepseek' ? 'DeepSeek' : 'Gemini';
    mostrarMensagem(container, `❌ Erro no processamento ${nomeModelo}: ${error.message}`, 'error');
    
  } finally {
    // Restaurar botão original com verificação de segurança
    if (botao) {
      const nomeModelo = modelo === 'deepseek' ? 'Ds' : 'Ge';
      botao.innerHTML = `Modelo ${nomeModelo}`;
      botao.disabled = false;
    }
  }
}

/**
 * Função para chamar a API Gemini - NOVA
 */
async function chamarGeminiAPI(textoCompleto) {
  let response = null;
  
  try {
    console.log('Chamando API Gemini...');
    
    // Chave da API Gemini
    const apiKey = "AIzaSyDm3k3ABMfK8qm73alwDK8GWgJhE368w-s";
    
    // Prompt IGUAL ao DeepSeek (reutilizando)
    const prompt = `Analise o texto da denúncia judicial abaixo e extraia os dados estruturados em formato JSON.

INSTRUÇÕES CRÍTICAS - QUALIFICAÇÃO COMPLETA + TELEFONE:

1. Para RÉUS: extraia nome, alcunha, CPF, mãe, nascimento e monte a qualificação COMPLETA
   Formato EXATO: "NOME COMPLETO, conhecido como 'ALCUNHA', CPF NUMERO, filho de NOME_MÃE, nascido em DD/MM/AAAA"
   
2. Para VÍTIMAS e TESTEMUNHAS: mesmo formato, mas pode ter menos informações
   
3. **TELEFONE OBRIGATÓRIO**: Busque SEMPRE telefones no texto para réus, vítimas e testemunhas gerais
   Formatos: (87) 99999-9999, 87 99999-9999, 8799999999, etc.
   Incluir na qualificação: "...nascido em DD/MM/AAAA, telefone (87) 99999-9999"
   ⚠️ EXCEÇÃO: Testemunhas policiais NÃO precisam de telefone, apenas nome e matrícula
   
4. Se alguma informação não existir, use "não informado" (será limpo depois)

5. Para TESTEMUNHAS POLICIAIS: "NOME COMPLETO / MATRÍCULA" (SEM telefone)

EXEMPLO DE EXTRAÇÃO COM TELEFONE:
Texto: "JOANDERSON DA SILVA GOMES, conhecido como 'JO', CPF 123.456.789-00, telefone (87) 98765-4321, filho de Maria Silva"

Deve retornar: "JOANDERSON DA SILVA GOMES, conhecido como 'JO', CPF 123.456.789-00, filho de Maria Silva, telefone (87) 98765-4321"

⚠️ IMPORTANTE: SEMPRE buscar telefones no texto para réus, vítimas e testemunhas gerais. 
Testemunhas policiais: apenas nome e matrícula, SEM telefone!

FORMATO DE SAÍDA OBRIGATÓRIO:
{
  "reus": [
    {
      "qualificacaoCompleta": "NOME COMPLETO MONTADO COM TODOS OS DADOS + TELEFONE",
      "endereco": "Endereço completo + situação prisional atual",
      "telefone": "(87) 99999-9999"
    }
  ],
  "vitimas": [
    {
      "qualificacaoCompleta": "NOME COMPLETO MONTADO + TELEFONE", 
      "endereco": "Endereço (buscar no rol de testemunhas)",
      "telefone": "(87) 99999-9999"
    }
  ],
  "testemunhasGerais": [
    {
      "qualificacaoCompleta": "NOME COMPLETO MONTADO + TELEFONE",
      "endereco": "Endereço se disponível",
      "telefone": "(87) 99999-9999"
    }
  ],
  "testemunhasPoliciais": [
    {
      "qualificacaoCompleta": "NOME COMPLETO / MATRÍCULA",
      "tipo": "PM|PC|PF|PRF",
      "lotacao": "Local de trabalho (ex: 4º BPM)"
    }
  ],
  "testemunhasDefesa": [],
  "procuradorRequerido": [],
  "outros": [
    {
      "nome": "Pessoa sem qualificação completa",
      "motivo": "Razão pela qual está em outros"
    }
  ],
  "observacoesImportantes": [
    "Situação prisional, histórico criminal, detalhes relevantes, telefones encontrados"
  ],
  "estatisticas": {
    "totalMencionados": 0,
    "totalQualificados": 0,
    "naoQualificados": 0,
    "telefonesEncontrados": 0
  }
}

TEXTO DA DENÚNCIA:
${textoCompleto}`;
    
    // Fazer a requisição para a API Gemini
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Você é um assistente jurídico especializado em extrair dados estruturados de denúncias judiciais. Monte a qualificação completa conforme instruído e busque telefones para réus, vítimas e testemunhas gerais (NÃO para testemunhas policiais). Retorne APENAS JSON válido, sem texto adicional ou formatação markdown.\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 2500
        }
      })
    });
    
    console.log('Response status:', response.status);
    
    // Verificar resposta
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Erro ${response.status}: Falha na API Gemini`);
    }
    
    // Extrair o resultado
    const data = await response.json();
    const resposta = data.candidates[0].content.parts[0].text;
    
    console.log('Resposta bruta da API Gemini:', resposta);
    
    // Limpar JSON removendo markdown (reutilizando lógica)
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
    console.error("Erro na API Gemini:", error);
    throw new Error(`Falha ao processar texto: ${error.message}`);
  } finally {
    // Cleanup: liberar referências se necessário
    response = null;
  }
}

/**
 * Função para chamar a API DeepSeek - VERSÃO CORRIGIDA COM TELEFONE
 */
async function chamarDeepSeekAPI(textoCompleto) {
  let response = null;
  
  try {
    console.log('Chamando API DeepSeek...');
    
    // Chave da API DeepSeek
    const apiKey = "sk-0a164d068ee643099f9d3fc508e4e612";
    
    // Prompt CORRIGIDO com instruções para TELEFONE
    const prompt = `Analise o texto da denúncia judicial abaixo e extraia os dados estruturados em formato JSON.

INSTRUÇÕES CRÍTICAS - QUALIFICAÇÃO COMPLETA + TELEFONE:

1. Para RÉUS: extraia nome, alcunha, CPF, mãe, nascimento e monte a qualificação COMPLETA
   Formato EXATO: "NOME COMPLETO, conhecido como 'ALCUNHA', CPF NUMERO, filho de NOME_MÃE, nascido em DD/MM/AAAA"
   
2. Para VÍTIMAS e TESTEMUNHAS: mesmo formato, mas pode ter menos informações
   
3. **TELEFONE OBRIGATÓRIO**: Busque SEMPRE telefones no texto para réus, vítimas e testemunhas gerais
   Formatos: (87) 99999-9999, 87 99999-9999, 8799999999, etc.
   Incluir na qualificação: "...nascido em DD/MM/AAAA, telefone (87) 99999-9999"
   ⚠️ EXCEÇÃO: Testemunhas policiais NÃO precisam de telefone, apenas nome e matrícula
   
4. Se alguma informação não existir, use "não informado" (será limpo depois)

5. Para TESTEMUNHAS POLICIAIS: "NOME COMPLETO / MATRÍCULA" (SEM telefone)

EXEMPLO DE EXTRAÇÃO COM TELEFONE:
Texto: "JOANDERSON DA SILVA GOMES, conhecido como 'JO', CPF 123.456.789-00, telefone (87) 98765-4321, filho de Maria Silva"

Deve retornar: "JOANDERSON DA SILVA GOMES, conhecido como 'JO', CPF 123.456.789-00, filho de Maria Silva, telefone (87) 98765-4321"

⚠️ IMPORTANTE: SEMPRE buscar telefones no texto para réus, vítimas e testemunhas gerais. 
Testemunhas policiais: apenas nome e matrícula, SEM telefone!

FORMATO DE SAÍDA OBRIGATÓRIO:
{
  "reus": [
    {
      "qualificacaoCompleta": "NOME COMPLETO MONTADO COM TODOS OS DADOS + TELEFONE",
      "endereco": "Endereço completo + situação prisional atual",
      "telefone": "(87) 99999-9999"
    }
  ],
  "vitimas": [
    {
      "qualificacaoCompleta": "NOME COMPLETO MONTADO + TELEFONE", 
      "endereco": "Endereço (buscar no rol de testemunhas)",
      "telefone": "(87) 99999-9999"
    }
  ],
  "testemunhasGerais": [
    {
      "qualificacaoCompleta": "NOME COMPLETO MONTADO + TELEFONE",
      "endereco": "Endereço se disponível",
      "telefone": "(87) 99999-9999"
    }
  ],
  "testemunhasPoliciais": [
    {
      "qualificacaoCompleta": "NOME COMPLETO / MATRÍCULA",
      "tipo": "PM|PC|PF|PRF",
      "lotacao": "Local de trabalho (ex: 4º BPM)"
    }
  ],
  "testemunhasDefesa": [],
  "procuradorRequerido": [],
  "outros": [
    {
      "nome": "Pessoa sem qualificação completa",
      "motivo": "Razão pela qual está em outros"
    }
  ],
  "observacoesImportantes": [
    "Situação prisional, histórico criminal, detalhes relevantes, telefones encontrados"
  ],
  "estatisticas": {
    "totalMencionados": 0,
    "totalQualificados": 0,
    "naoQualificados": 0,
    "telefonesEncontrados": 0
  }
}

TEXTO DA DENÚNCIA:
${textoCompleto}`;
    
    // Fazer a requisição para a API
    response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
            content: "Você é um assistente jurídico especializado em extrair dados estruturados de denúncias judiciais. Monte a qualificação completa conforme instruído e busque telefones para réus, vítimas e testemunhas gerais (NÃO para testemunhas policiais). Retorne APENAS JSON válido, sem texto adicional ou formatação markdown."
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
  } finally {
    // Cleanup: liberar referências se necessário
    response = null;
  }
}

// ============================================
// 🔍 FUNÇÕES CORRIGIDAS - LIMPEZA E TELEFONE
// ============================================

/**
 * Função para extrair telefones do texto original da denúncia
 * Busca vários formatos de telefone comuns
 */
function extrairTelefonesDaOrigemTexto(textoCompleto, nomePessoa) {
  if (!textoCompleto || !nomePessoa) return '';
  
  console.log('📞 Buscando telefone para:', nomePessoa);
  
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
 */
function limparQualificacaoInteligente(qualificacaoCompleta, textoOriginal = '', nomePessoa = '') {
  if (!qualificacaoCompleta || qualificacaoCompleta.trim() === '') {
    return '';
  }
  
  console.log('🔍 ENTRADA:', qualificacaoCompleta);
  
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
  
  // PASSO 3: Buscar telefone se temos texto original e nome
  let telefone = '';
  if (textoOriginal && nomePessoa) {
    telefone = extrairTelefonesDaOrigemTexto(textoOriginal, nomePessoa);
  }
  
  // PASSO 4: Adicionar telefone ao final se encontrado
  if (telefone) {
    qualificacaoLimpa += `, telefone ${telefone}`;
    console.log('📱 COM TELEFONE:', qualificacaoLimpa);
  }
  
  // PASSO 5: Validar se sobrou conteúdo útil
  // Se a qualificação ficou muito curta ou só tem "não informado", extrair nome base
  if (qualificacaoLimpa.length < 3 || qualificacaoLimpa.toLowerCase().includes('não informad')) {
    const nomeBase = extrairNomeBase(qualificacaoCompleta);
    console.log('🔍 USANDO NOME BASE:', nomeBase);
    
    // Se encontrou telefone, adicionar ao nome base
    if (telefone && nomeBase) {
      return `${nomeBase}, telefone ${telefone}`;
    }
    
    return nomeBase;
  }
  
  console.log('✅ RESULTADO FINAL:', qualificacaoLimpa);
  return qualificacaoLimpa;
}

/**
 * Extrair nome base da qualificação (função melhorada)
 */
function extrairNomeBase(qualificacaoCompleta) {
  if (!qualificacaoCompleta) return '';
  
  // Pega até a primeira vírgula (que geralmente é o nome completo)
  const partes = qualificacaoCompleta.split(',');
  let nomeBase = partes[0].trim();
  
  // Limpar possíveis sujeiras do nome
  nomeBase = nomeBase
    .replace(/^[^\w\s]+/, '')  // Remove caracteres especiais no início
    .replace(/[^\w\s]+$/, '')  // Remove caracteres especiais no final
    .trim();
  
  // Verifica se o nome tem pelo menos 3 caracteres e não é "não informado"
  if (nomeBase.length > 2 && !nomeBase.toLowerCase().includes('não informad')) {
    return nomeBase;
  }
  
  return '';
}

/**
 * Função para separar nome e matrícula de testemunhas policiais
 */
function separarNomeMatricula(qualificacaoCompleta) {
  if (!qualificacaoCompleta) return { nome: '', matricula: '' };
  
  // Exemplo: "SOLDADO JOÃO CARLOS PEREIRA / MATRÍCULA 123456"
  const partes = qualificacaoCompleta.split(' / ');
  
  if (partes.length >= 2) {
    const nome = partes[0].trim();
    const matriculaParte = partes[1].trim();
    
    // Extrair apenas os números da matrícula
    const matricula = matriculaParte.replace(/\D/g, ''); // Remove não-dígitos
    
    return {
      nome: nome,
      matricula: matricula
    };
  }
  
  // Se não conseguir separar, retorna tudo como nome
  return {
    nome: qualificacaoCompleta.trim(),
    matricula: ''
  };
}


/**
 * Helper para processar uma lista de pessoas (réus, vítimas, testemunhas) e preencher a UI.
 * @param {HTMLElement} container - O elemento container principal.
 * @param {Array} pessoas - A lista de objetos de pessoa para processar.
 * @param {string} textoOriginal - O texto original para contexto (ex: busca de telefone).
 * @param {object} config - Configuração para o processamento.
 * @param {string} config.tipoPessoa - O tipo de pessoa (ex: 'Réu', 'Vítima').
 * @param {string} config.logIcon - O ícone para o log.
 * @param {string} config.containerSelector - O seletor CSS para o container na UI.
 * @param {Function} config.addFuncao - A função para adicionar um novo elemento na UI.
 * @param {Array} [config.addFuncaoArgs] - Argumentos extras para a função de adicionar.
 * @returns {number} - O número de campos preenchidos.
 */
function processarPessoasUI(container, pessoas, textoOriginal, config) {
  if (!pessoas || pessoas.length === 0) {
    return 0;
  }

  let camposPreenchidosLocal = 0;
  console.log(`${config.logIcon} Processando ${config.tipoPessoa}(s):`, pessoas.length);

  pessoas.forEach((pessoa, index) => {
    try {
      console.log(`🔍 ${config.tipoPessoa} ${index + 1} original:`, pessoa.qualificacaoCompleta);

      const nomeBase = extrairNomeBase(pessoa.qualificacaoCompleta);
      const qualificacaoLimpa = limparQualificacaoInteligente(
        pessoa.qualificacaoCompleta,
        textoOriginal,
        nomeBase
      );

      if (qualificacaoLimpa && qualificacaoLimpa.length > 2) {
        // Chama a função 'add' específica para este tipo de pessoa
        config.addFuncao(container, ...(config.addFuncaoArgs || []));
        
        const ultimoElemento = container.querySelector(config.containerSelector).lastElementChild;

        if (ultimoElemento) {
          const nomeInput = ultimoElemento.querySelector('input[placeholder="Nome"]');
          const enderecoInput = ultimoElemento.querySelector('input[placeholder="Endereço"]');

          if (nomeInput && !nomeInput.value) {
            nomeInput.value = qualificacaoLimpa;
            camposPreenchidosLocal++;
            console.log(`✅ ${config.tipoPessoa} preenchido:`, qualificacaoLimpa);
          }

          if (enderecoInput && !enderecoInput.value && pessoa.endereco && pessoa.endereco.trim() !== '') {
            enderecoInput.value = pessoa.endereco;
            camposPreenchidosLocal++;
          }
        }
      } else {
        console.log(`❌ ${config.tipoPessoa} rejeitado - qualificação insuficiente:`, qualificacaoLimpa);
      }
    } catch (error) {
      console.error(`💥 Erro ao processar ${config.tipoPessoa} ${index + 1}:`, error);
    }
  });

  return camposPreenchidosLocal;
}


/**
 * FUNÇÃO REATORADA - Distribui dados nos campos da UI de forma mais limpa.
 */
function distribuirDadosNosCampos(container, dados, textoOriginal = '') {
  let camposPreenchidos = 0;
  
  try {
    console.log('🎯 Distribuindo dados recebidos da IA:', dados);
    
    // Processar réus
    camposPreenchidos += processarPessoasUI(container, dados.reus, textoOriginal, {
        tipoPessoa: 'Réu',
        logIcon: '👤',
        containerSelector: '#reus-container',
        addFuncao: addReu
    });

    // Processar vítimas
    camposPreenchidos += processarPessoasUI(container, dados.vitimas, textoOriginal, {
        tipoPessoa: 'Vítima',
        logIcon: '👥',
        containerSelector: '#vitimas-container',
        addFuncao: addVitima
    });

    // Processar testemunhas de acusação (gerais)
    camposPreenchidos += processarPessoasUI(container, dados.testemunhasGerais, textoOriginal, {
        tipoPessoa: 'Testemunha',
        logIcon: '👓',
        containerSelector: '#testemunhas-mp-container',
        addFuncao: addTestemunha,
        addFuncaoArgs: ['mp']
    });
    
    // Processar testemunhas policiais (lógica específica, mantida separada)
    if (dados.testemunhasPoliciais && dados.testemunhasPoliciais.length > 0) {
      console.log('👮 Processando testemunhas policiais:', dados.testemunhasPoliciais.length);
      dados.testemunhasPoliciais.forEach((policial) => {
        const nomeBase = extrairNomeBase(policial.qualificacaoCompleta);
        
        // Para policiais, não buscar telefone - apenas limpeza básica
        const qualificacaoLimpa = policial.qualificacaoCompleta
          .replace(/,\s*conhecid[oa]\s+como\s+['"]não\s+informad[oa]['"]?/gi, '')
          .replace(/,\s*CPF\s+não\s+informado/gi, '')
          .replace(/,\s*filh[oa]\s+de\s+não\s+informad[oa]/gi, '')
          .replace(/,\s*nascid[oa]\s+em\s+não\s+informad[oa]/gi, '')
          .replace(/,\s*,+/g, ',')
          .replace(/,\s*$/g, '')
          .replace(/^\s*,+/g, '')
          .trim();
        
        if (qualificacaoLimpa && qualificacaoLimpa.length > 2) {
          addPolicial(container);
          const ultimoPolicial = container.querySelector('#policiais-container').lastElementChild;
          
          if (ultimoPolicial) {
            const tipoSelect = ultimoPolicial.querySelector('select');
            const nomeInput = ultimoPolicial.querySelector('input[placeholder="Nome"]');
            const matriculaInput = ultimoPolicial.querySelector('input[placeholder="Matrícula/RG"]');
            
            if (tipoSelect && policial.tipo) {
              const tipoLower = policial.tipo.toLowerCase();
              if (['pm', 'pc', 'pf', 'prf'].includes(tipoLower)) {
                tipoSelect.value = tipoLower;
                camposPreenchidos++;
              }
            }
            
            // Separar nome e matrícula corretamente
            const { nome, matricula } = separarNomeMatricula(qualificacaoLimpa);
            
            if (nomeInput && !nomeInput.value && nome) {
              nomeInput.value = nome;
              camposPreenchidos++;
              console.log('✅ Policial nome preenchido:', nome);
            }
            
            if (matriculaInput && !matriculaInput.value && matricula) {
              matriculaInput.value = matricula;
              camposPreenchidos++;
              console.log('✅ Policial matrícula preenchida:', matricula);
            }
          }
        }
      });
    }
    
    console.log(`🎯 TOTAL de campos preenchidos: ${camposPreenchidos}`);
    
  } catch (error) {
    console.error('💥 Erro ao distribuir dados:', error);
  }
  
  return camposPreenchidos;
}

/**
 * Criar relatório do processamento - CORRIGIDO COM QUEBRAS DE LINHA + MODELO
 */
function criarRelatorioProcessamento(dados, camposPreenchidos, nomeModelo = 'IA') {
  const timestamp = new Date().toLocaleString();
  
  let relatorio = `PROCESSAMENTO - ${timestamp}\n\n`;
  
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
  
  // TESTEMUNHAS POLICIAIS - USANDO qualificacaoCompleta (sem telefone)
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
  
  // OBSERVAÇÕES IMPORTANTES
  if (dados.observacoesImportantes && dados.observacoesImportantes.length > 0) {
    relatorio += `📋 OBSERVAÇÕES IMPORTANTES:\n`;
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
// 🔍 FUNÇÕES DE UI (CRIAÇÃO E MANIPULAÇÃO DE ELEMENTOS)
// ============================================

/**
 * Função genérica para adicionar um elemento a um contêiner com animação e botão de remover.
 * @param {HTMLElement} container - O contêiner principal do módulo.
 * @param {object} config - Configurações.
 * @param {string} config.containerSelector - Seletor CSS do contêiner onde o elemento será adicionado.
 * @param {Function} config.createElementFn - Função que cria e retorna o novo HTMLElement.
 * @param {Function} [config.postAddHook] - Hook opcional para executar lógica adicional no elemento criado.
 */
function addElement(container, config) {
  const targetContainer = container.querySelector(config.containerSelector);
  if (targetContainer) {
    const element = config.createElementFn();
    
    const removeBtn = element.querySelector('.remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => element.remove());
    }

    if (config.postAddHook) {
      config.postAddHook(element);
    }

    targetContainer.appendChild(element);

    setTimeout(() => {
      element.classList.add('active');
    }, 10);
  }
}

// --- Funções de Criação ---

function criarLinhaAssistenteAcusacao() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  contadorAssistente++;
  const currentIndex = contadorAssistente;
  
  const assistenteId = `assistente-acusacao-${currentIndex}`;
  const nomeId = `assistente-nome-${currentIndex}`;
  const oabId = `assistente-oab-${currentIndex}`;
  const intimadoId = `assistente-intimado-${currentIndex}`;
  
  linha.setAttribute('data-index', currentIndex);
  linha.id = assistenteId;

  linha.innerHTML = `
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
  return linha;
}

function criarLinhaVitima() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  contadorVitima++;
  const currentIndex = contadorVitima;
  
  const itemId = `vitima-${currentIndex}`;
  const nomeId = `vitima-nome-${currentIndex}`;
  const enderecoId = `vitima-endereco-${currentIndex}`;
  const intimadoId = `vitima-intimado-${currentIndex}`;
  
  linha.id = itemId;
  linha.setAttribute('data-index', currentIndex);
  
  linha.innerHTML = `
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
  return linha;
}

function criarLinhaTestemunhaMP() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';
  
  contadorTestemunhaMP++;
  const currentIndex = contadorTestemunhaMP;
  
  const itemId = `testemunha-mp-${currentIndex}`;
  const nomeId = `testemunha-mp-nome-${currentIndex}`;
  const enderecoId = `testemunha-mp-endereco-${currentIndex}`;
  const intimadoId = `testemunha-mp-intimado-${currentIndex}`;
  
  linha.id = itemId;
  linha.setAttribute('data-index', currentIndex);
  
  linha.innerHTML = `
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
  return linha;
}

function criarLinhaTestemunhaDefesa() {
  const linha = document.createElement('div');
  linha.className = 'd-flex align-items-center gap-2 mb-2 w-100';

  contadorTestemunhaDefesa++;
  const currentIndex = contadorTestemunhaDefesa;
  
  const itemId = `testemunha-defesa-${currentIndex}`;
  const nomeId = `testemunha-defesa-nome-${currentIndex}`;
  const enderecoId = `testemunha-defesa-endereco-${currentIndex}`;
  const intimadoId = `testemunha-defesa-intimado-${currentIndex}`;
  
  linha.id = itemId;
  linha.setAttribute('data-index', currentIndex);
  
  linha.innerHTML = `
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
  return linha;
}

function criarLinhaPolicial() {
  contadorPolicial++;
  const currentIndex = contadorPolicial;
  
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
    <input type="text" placeholder="Matrícula/RG" class="form-control matricula" id="${matriculaId}" data-textblaze-policial-matricula="${currentIndex}">
    <div class="d-flex align-items-center ms-auto">
      <input type="checkbox" id="${intimadoId}" class="form-check-input intimado" data-textblaze-policial-intimado="${currentIndex}">
      <label class="form-check-label ms-1" for="${intimadoId}">Intimado</label>
    </div>
    <button class="btn btn-danger btn-sm p-0 rounded lh-1 d-flex align-items-center justify-content-center remove-btn" aria-label="Remover">
      <span class="d-block" style="width: 24px; height: 24px; line-height: 24px;">×</span>
    </button>
  `;
  return linha;
}

function criarLinhaReu() {
    contadorReu++;
    const currentIndex = contadorReu;
    
    const reuContainer = document.createElement('div');
    reuContainer.className = 'reu-item mb-3';
    reuContainer.id = `reu-${currentIndex}`;
    reuContainer.setAttribute('data-index', currentIndex);
    
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
    return reuContainer;
}

// --- Funções de Adição (Refatoradas) ---

function addAssistenteAcusacao(container) {
  addElement(container, {
    containerSelector: '#assistente-acusacao-container',
    createElementFn: criarLinhaAssistenteAcusacao
  });
}

function addVitima(container) {
  addElement(container, {
    containerSelector: '#vitimas-container',
    createElementFn: criarLinhaVitima
  });
}

function addTestemunha(container, tipo) {
  addElement(container, {
    containerSelector: `#testemunhas-${tipo}-container`,
    createElementFn: tipo === 'mp' ? criarLinhaTestemunhaMP : criarLinhaTestemunhaDefesa
  });
}

function addPolicial(container) {
  addElement(container, {
    containerSelector: '#policiais-container',
    createElementFn: criarLinhaPolicial
  });
}

function addReu(container) {
  addElement(container, {
    containerSelector: '#reus-container',
    createElementFn: criarLinhaReu,
    postAddHook: (element) => {
      const tipoDefesaSelect = element.querySelector('.tipo-defesa');
      const nomeAdvogadoInput = element.querySelector('.nome-advogado');
      if (tipoDefesaSelect && nomeAdvogadoInput) {
        tipoDefesaSelect.addEventListener('change', function() {
          nomeAdvogadoInput.style.display = this.value === 'particular' ? 'block' : 'none';
        });
      }
    }
  });
}

// ============================================
// 🔍 FUNÇÕES AUXILIARES
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
    
    // Guardar referência do timeout para possível cleanup
    let timeoutId = setTimeout(() => {
      statusMessage.style.opacity = '0';
      statusMessage.style.transform = 'translateY(20px)';
      
      // Remover do DOM após a animação
      setTimeout(() => {
        if (statusMessage.parentNode) {
          statusMessage.parentNode.removeChild(statusMessage);
        }
      }, 300);
    }, 5000);
    
    // Permitir cleanup manual do timeout se necessário
    statusMessage._timeoutId = timeoutId;
  }
}

// Função de limpeza
export function cleanup() {
  console.log('Limpando recursos do módulo audiencia.js');
  
  // Remover estilos de impressão se existirem
  document.getElementById('print-styles')?.remove();
  
  // Remover qualquer mensagem de status
  document.querySelector('.status-message')?.remove();
  
  // Remover classe específica do modo audiência
  document.querySelector('.main-content')?.classList.remove('audiencia-mode');
}