/**
 * Módulo para Audiência - Integrado ao tema do dashboard
 * Versão com IDs fixos e grupos separados para Text Blaze + DeepSeek API
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
  console.log('Módulo audiencia.js inicializado com IDs para Text Blaze + DeepSeek');
  
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

  // Event listener para botão "Atualizar" (processamento DeepSeek)
  const atualizarBtn = container.querySelector('#atualizarDadosMP');
  if (atualizarBtn) {
    atualizarBtn.addEventListener('click', function() {
      processarDenunciaComDeepSeek(container);
    });
  }

  // Event listener para botão "Branco" (limpar observações MP)
  const limparObservacoesMPBtn = container.querySelector('#limparObservacoesMP');
  if (limparObservacoesMPBtn) {
    limparObservacoesMPBtn.addEventListener('click', function() {
      limparObservacoesMP(container);
    });
  }
  
  // Registrar eventos de remoção para elementos existentes
  setupRemoveButtons(container);
  
  // Adicionar classe ao contentor principal para o estilo específico da função
  container.closest('.main-content').classList.add('audiencia-mode');
  
  console.log('Módulo de Audiência pronto para uso');
}

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

// ===== FUNÇÕES DEEPSEEK - BOTÃO ATUALIZAR =====

/**
 * Função principal para processar denúncia com DeepSeek
 */
async function processarDenunciaComDeepSeek(container) {
    const observacoesMp = container.querySelector('#observacoes-mp');
    
    if (!observacoesMp || !observacoesMp.value.trim()) {
        mostrarMensagem(container, 'warning', 'Campo "Observações do MP" está vazio. Insira o texto da denúncia primeiro.');
        return;
    }

    const textoDenuncia = observacoesMp.value.trim();
    
    // Verificar se há conteúdo suficiente
    if (textoDenuncia.length < 100) {
        mostrarMensagem(container, 'warning', 'Texto muito curto. Insira uma denúncia completa para processamento.');
        return;
    }

    // Mostrar spinner e bloquear botão
    const botaoOriginal = document.querySelector('#atualizarDadosMP');
    const textoOriginal = botaoOriginal.textContent;
    botaoOriginal.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Processando...';
    botaoOriginal.disabled = true;

    // Mostrar overlay de processamento
    const processingOverlay = document.getElementById('processingOverlay');
    const processingText = document.getElementById('processingText');
    
    if (processingOverlay && processingText) {
        processingOverlay.style.display = 'flex';
        processingText.textContent = 'Analisando denúncia com IA...';
    }

    try {
        // Chamar API DeepSeek
        const dadosEstruturados = await chamarDeepSeekAPI(textoDenuncia);
        
        // Processar e distribuir dados
        const relatorio = await distribuirDadosNoCampos(container, dadosEstruturados);
        
        // Atualizar campo "outros" com relatório
        atualizarCampoOutros(container, relatorio);
        
        // Sucesso
        mostrarMensagem(container, 'success', `Processamento concluído! ${relatorio.totalPreenchidos} campos preenchidos.`);
        
    } catch (error) {
        console.error('Erro no processamento DeepSeek:', error);
        
        // Registrar erro no campo "outros"
        atualizarCampoOutros(container, {
            errosAPI: 1,
            mensagemErro: error.message,
            totalProcessados: 0,
            totalPreenchidos: 0,
            naoQualificados: []
        });
        
        mostrarMensagem(container, 'error', `Erro no processamento: ${error.message}`);
    } finally {
        // Restaurar botão
        botaoOriginal.innerHTML = textoOriginal;
        botaoOriginal.disabled = false;
        
        // Ocultar overlay
        if (processingOverlay) {
            processingOverlay.style.display = 'none';
        }
    }
}

/**
 * Chamada para API DeepSeek
 */
async function chamarDeepSeekAPI(textoDenuncia) {
    const prompt = `
Você é um assistente jurídico especializado em extrair dados de denúncias criminais.

INSTRUÇÕES:
1. Analise o texto da denúncia fornecido
2. Extraia APENAS informações explicitamente mencionadas
3. Organize os dados no formato JSON especificado
4. NÃO invente ou deduza informações não presentes no texto

FORMATO DE RESPOSTA (JSON):
{
  "reus": [
    {
      "nome": "Nome completo do réu",
      "filiacao": "Nome da mãe (se mencionado)",
      "endereco": "Endereço completo (se mencionado)"
    }
  ],
  "vitimas": [
    {
      "nome": "Nome da vítima",
      "endereco": "Endereço da vítima (se mencionado)"
    }
  ],
  "testemunhasNormais": [
    {
      "nome": "Nome da testemunha",
      "endereco": "Endereço (se mencionado)"
    }
  ],
  "testemunhasPoliciais": [
    {
      "nome": "Nome do policial",
      "tipo": "PM|PC|PF|PRF",
      "matricula": "Número da matrícula (se mencionado)"
    }
  ],
  "estatisticas": {
    "totalMencionados": 0,
    "totalQualificados": 0,
    "naoQualificados": ["Lista de nomes mencionados sem qualificação completa"]
  }
}

TEXTO DA DENÚNCIA:
${textoDenuncia}
`;

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-0a164d068ee643099f9d3fc508e4e612'
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "Você é um assistente jurídico que extrai dados estruturados de denúncias criminais. Responda APENAS com JSON válido."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Erro ${response.status}: Falha na API`);
        }

        const data = await response.json();
        const conteudoResposta = data.choices[0].message.content;
        
        // Tentar fazer parse do JSON
        try {
            return JSON.parse(conteudoResposta);
        } catch (parseError) {
            console.error('Erro ao fazer parse do JSON:', conteudoResposta);
            throw new Error('Resposta da IA não está em formato JSON válido');
        }
        
    } catch (error) {
        console.error('Erro na API DeepSeek:', error);
        throw new Error(`Falha ao processar texto: ${error.message}`);
    }
}

/**
 * Distribuir dados extraídos nos campos do formulário
 */
async function distribuirDadosNoCampos(container, dados) {
    let totalPreenchidos = 0;
    const relatorio = {
        totalProcessados: 0,
        totalPreenchidos: 0,
        reus: 0,
        vitimas: 0,
        testemunhasNormais: 0,
        testemunhasPoliciais: 0,
        naoQualificados: dados.estatisticas?.naoQualificados || [],
        errosAPI: 0
    };

    try {
        // Processar RÉUS
        if (dados.reus && Array.isArray(dados.reus)) {
            for (const reu of dados.reus) {
                if (reu.nome && reu.nome.trim()) {
                    const foiAdicionado = await adicionarReuSeVazio(container, reu);
                    if (foiAdicionado) {
                        relatorio.reus++;
                        totalPreenchidos++;
                    }
                    relatorio.totalProcessados++;
                }
            }
        }

        // Processar VÍTIMAS
        if (dados.vitimas && Array.isArray(dados.vitimas)) {
            for (const vitima of dados.vitimas) {
                if (vitima.nome && vitima.nome.trim()) {
                    const foiAdicionado = await adicionarVitimaSeVazio(container, vitima);
                    if (foiAdicionado) {
                        relatorio.vitimas++;
                        totalPreenchidos++;
                    }
                    relatorio.totalProcessados++;
                }
            }
        }

        // Processar TESTEMUNHAS NORMAIS
        if (dados.testemunhasNormais && Array.isArray(dados.testemunhasNormais)) {
            for (const testemunha of dados.testemunhasNormais) {
                if (testemunha.nome && testemunha.nome.trim()) {
                    const foiAdicionado = await adicionarTestemunhaMPSeVazio(container, testemunha);
                    if (foiAdicionado) {
                        relatorio.testemunhasNormais++;
                        totalPreenchidos++;
                    }
                    relatorio.totalProcessados++;
                }
            }
        }

        // Processar TESTEMUNHAS POLICIAIS
        if (dados.testemunhasPoliciais && Array.isArray(dados.testemunhasPoliciais)) {
            for (const policial of dados.testemunhasPoliciais) {
                if (policial.nome && policial.nome.trim()) {
                    const foiAdicionado = await adicionarPolicialSeVazio(container, policial);
                    if (foiAdicionado) {
                        relatorio.testemunhasPoliciais++;
                        totalPreenchidos++;
                    }
                    relatorio.totalProcessados++;
                }
            }
        }

        relatorio.totalPreenchidos = totalPreenchidos;
        return relatorio;

    } catch (error) {
        console.error('Erro ao distribuir dados:', error);
        relatorio.errosAPI = 1;
        relatorio.mensagemErro = error.message;
        return relatorio;
    }
}

/**
 * Funções auxiliares para adicionar elementos apenas se campos estiverem vazios
 */
async function adicionarReuSeVazio(container, dadosReu) {
    const reusContainer = container.querySelector('#reus-container');
    
    // Verificar se já existe algum réu cadastrado
    const reusExistentes = reusContainer.querySelectorAll('.reu-item');
    if (reusExistentes.length > 0) {
        // Verificar se há campos vazios nos réus existentes
        let temCampoVazio = false;
        reusExistentes.forEach(reu => {
            const nomeInput = reu.querySelector('.nome');
            if (!nomeInput.value.trim()) {
                temCampoVazio = true;
            }
        });
        
        // Se não há campos vazios, não adicionar
        if (!temCampoVazio) {
            return false;
        }
    }
    
    // Adicionar novo réu
    addReu(container);
    
    // Aguardar um pouco para o elemento ser criado
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Preencher o último réu adicionado
    const novosReus = reusContainer.querySelectorAll('.reu-item');
    const ultimoReu = novosReus[novosReus.length - 1];
    
    if (ultimoReu) {
        const nomeInput = ultimoReu.querySelector('.nome');
        const enderecoInput = ultimoReu.querySelector('.endereco');
        
        if (nomeInput && !nomeInput.value.trim()) {
            let nomeCompleto = dadosReu.nome;
            if (dadosReu.filiacao) {
                nomeCompleto += `, filho de ${dadosReu.filiacao}`;
            }
            nomeInput.value = nomeCompleto;
        }
        
        if (enderecoInput && !enderecoInput.value.trim() && dadosReu.endereco) {
            enderecoInput.value = dadosReu.endereco;
        }
        
        return true;
    }
    
    return false;
}

async function adicionarVitimaSeVazio(container, dadosVitima) {
    const vitimasContainer = container.querySelector('#vitimas-container');
    
    // Verificar se há vítimas com campos vazios
    const vitimasExistentes = vitimasContainer.querySelectorAll('.d-flex');
    let temCampoVazio = vitimasExistentes.length === 0;
    
    vitimasExistentes.forEach(vitima => {
        const nomeInput = vitima.querySelector('.nome');
        if (nomeInput && !nomeInput.value.trim()) {
            temCampoVazio = true;
        }
    });
    
    if (!temCampoVazio) {
        return false;
    }
    
    addVitima(container);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const novasVitimas = vitimasContainer.querySelectorAll('.d-flex');
    const ultimaVitima = novasVitimas[novasVitimas.length - 1];
    
    if (ultimaVitima) {
        const nomeInput = ultimaVitima.querySelector('.nome');
        const enderecoInput = ultimaVitima.querySelector('.endereco');
        
        if (nomeInput && !nomeInput.value.trim()) {
            nomeInput.value = dadosVitima.nome;
        }
        
        if (enderecoInput && !enderecoInput.value.trim() && dadosVitima.endereco) {
            enderecoInput.value = dadosVitima.endereco;
        }
        
        return true;
    }
    
    return false;
}

async function adicionarTestemunhaMPSeVazio(container, dadosTestemunha) {
    const testemunhasContainer = container.querySelector('#testemunhas-mp-container');
    
    // Verificar se há testemunhas com campos vazios
    const testemunhasExistentes = testemunhasContainer.querySelectorAll('.d-flex');
    let temCampoVazio = testemunhasExistentes.length === 0;
    
    testemunhasExistentes.forEach(testemunha => {
        const nomeInput = testemunha.querySelector('.nome');
        if (nomeInput && !nomeInput.value.trim()) {
            temCampoVazio = true;
        }
    });
    
    if (!temCampoVazio) {
        return false;
    }
    
    addTestemunha(container, 'mp');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const novasTestemunhas = testemunhasContainer.querySelectorAll('.d-flex');
    const ultimaTestemunha = novasTestemunhas[novasTestemunhas.length - 1];
    
    if (ultimaTestemunha) {
        const nomeInput = ultimaTestemunha.querySelector('.nome');
        const enderecoInput = ultimaTestemunha.querySelector('.endereco');
        
        if (nomeInput && !nomeInput.value.trim()) {
            nomeInput.value = dadosTestemunha.nome;
        }
        
        if (enderecoInput && !enderecoInput.value.trim() && dadosTestemunha.endereco) {
            enderecoInput.value = dadosTestemunha.endereco;
        }
        
        return true;
    }
    
    return false;
}

async function adicionarPolicialSeVazio(container, dadosPolicial) {
    const policiaisContainer = container.querySelector('#policiais-container');
    
    // Verificar se há policiais com campos vazios
    const policiaisExistentes = policiaisContainer.querySelectorAll('.d-flex');
    let temCampoVazio = policiaisExistentes.length === 0;
    
    policiaisExistentes.forEach(policial => {
        const nomeInput = policial.querySelector('.nome');
        if (nomeInput && !nomeInput.value.trim()) {
            temCampoVazio = true;
        }
    });
    
    if (!temCampoVazio) {
        return false;
    }
    
    addPolicial(container);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const novosPoliciais = policiaisContainer.querySelectorAll('.d-flex');
    const ultimoPolicial = novosPoliciais[novosPoliciais.length - 1];
    
    if (ultimoPolicial) {
        const tipoSelect = ultimoPolicial.querySelector('.tipo-policial');
        const nomeInput = ultimoPolicial.querySelector('.nome');
        const matriculaInput = ultimoPolicial.querySelector('.endereco'); // O campo "endereco" é usado para matrícula
        
        if (tipoSelect && dadosPolicial.tipo) {
            const tipoLower = dadosPolicial.tipo.toLowerCase();
            tipoSelect.value = tipoLower;
        }
        
        if (nomeInput && !nomeInput.value.trim()) {
            nomeInput.value = dadosPolicial.nome;
        }
        
        if (matriculaInput && !matriculaInput.value.trim() && dadosPolicial.matricula) {
            matriculaInput.value = dadosPolicial.matricula;
        }
        
        return true;
    }
    
    return false;
}

/**
 * Atualizar campo "outros" com relatório de processamento
 */
function atualizarCampoOutros(container, relatorio) {
    // Buscar ou criar um campo de "outros" 
    let outrosTextarea = container.querySelector('#outros-processamento');
    
    if (!outrosTextarea) {
        // Criar seção "outros" se não existir
        const observacoesMP = container.querySelector('#observacoes-mp');
        if (observacoesMP && observacoesMP.parentElement) {
            const outrosDiv = document.createElement('div');
            outrosDiv.className = 'mb-3';
            outrosDiv.innerHTML = `
                <label for="outros-processamento" class="form-label">Outros (Relatório de Processamento)</label>
                <textarea id="outros-processamento" class="form-control" rows="4" readonly style="background-color: #f8f9fa;"></textarea>
            `;
            
            observacoesMP.parentElement.appendChild(outrosDiv);
            outrosTextarea = container.querySelector('#outros-processamento');
        }
    }
    
    if (outrosTextarea) {
        let relatorioTexto = 'OUTROS\n';
        relatorioTexto += `Checklist: ${relatorio.totalProcessados || 0} pessoas mencionadas, `;
        relatorioTexto += `${relatorio.totalPreenchidos || 0} qualificadas, `;
        relatorioTexto += `${relatorio.naoQualificados?.length || 0} não qualificadas`;
        
        if (relatorio.errosAPI > 0) {
            relatorioTexto += `, ${relatorio.errosAPI} erros de API`;
        }
        
        relatorioTexto += '\n\n';
        
        // Detalhamento
        if (relatorio.reus > 0) relatorioTexto += `✓ ${relatorio.reus} réu(s) processado(s)\n`;
        if (relatorio.vitimas > 0) relatorioTexto += `✓ ${relatorio.vitimas} vítima(s) processada(s)\n`;
        if (relatorio.testemunhasNormais > 0) relatorioTexto += `✓ ${relatorio.testemunhasNormais} testemunha(s) processada(s)\n`;
        if (relatorio.testemunhasPoliciais > 0) relatorioTexto += `✓ ${relatorio.testemunhasPoliciais} policial(is) processado(s)\n`;
        
        // Não qualificados
        if (relatorio.naoQualificados && relatorio.naoQualificados.length > 0) {
            relatorioTexto += '\nNão qualificados:\n';
            relatorio.naoQualificados.forEach(nome => {
                relatorioTexto += `• ${nome}\n`;
            });
        }
        
        // Erros
        if (relatorio.mensagemErro) {
            relatorioTexto += `\nErro: ${relatorio.mensagemErro}\n`;
        }
        
        relatorioTexto += `\nProcessado em: ${new Date().toLocaleString()}`;
        
        outrosTextarea.value = relatorioTexto;
    }
}

/**
 * Função para limpar campo de observações do MP
 */
function limparObservacoesMP(container) {
    const observacoesMp = container.querySelector('#observacoes-mp');
    const outrosProcessamento = container.querySelector('#outros-processamento');
    
    if (observacoesMp && observacoesMp.value.trim()) {
        if (confirm('Tem certeza que deseja limpar as observações do MP?')) {
            observacoesMp.value = '';
            
            // Também limpar o campo "outros" se existir
            if (outrosProcessamento) {
                outrosProcessamento.value = '';
            }
            
            mostrarMensagem(container, 'info', 'Observações do MP limpas com sucesso.');
        }
    } else {
        // Se já estiver vazio, apenas feedback
        mostrarMensagem(container, 'info', 'Campo já está vazio.');
    }
}

// ===== FUNÇÕES ORIGINAIS =====

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
        const outrosProcessamento = container.querySelector('#outros-processamento');
        
        if (observacoesMp) observacoesMp.value = '';
        if (observacoesDefesa) observacoesDefesa.value = '';
        if (outrosProcessamento) outrosProcessamento.value = '';
        
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
    console.log('Limpando recursos do módulo audiencia.js');
    
    // Remover estilos de impressão se existirem
    document.getElementById('print-styles')?.remove();
    
    // Remover qualquer mensagem de status
    document.querySelector('.status-message')?.remove();
    
    // Remover classe específica do modo audiência
    document.querySelector('.main-content')?.classList.remove('audiencia-mode');
}