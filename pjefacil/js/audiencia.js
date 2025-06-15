/**
 * Módulo para Audiência - Integrado ao tema do dashboard
 * Versão com IDs fixos e grupos separados para Text Blaze + Validação DeepSeek
 * TESTE A: Ajustado para contenteditable (igual guia.js)
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
  console.log('Módulo audiencia.js inicializado com IDs para Text Blaze - TESTE A: contenteditable');
  
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

  // Event listener para botão "Atualizar" - TESTE DE VALIDAÇÃO DEEPSEEK
  const atualizarDadosMPBtn = container.querySelector('#atualizarDadosMP');
  if (atualizarDadosMPBtn) {
    atualizarDadosMPBtn.addEventListener('click', function() {
      validarDeepSeekAudiencia(container);
    });
  }

  // Event listener para botão "Branco" - Limpar observações MP
  const limparObservacoesMPBtn = container.querySelector('#limparObservacoesMP');
  if (limparObservacoesMPBtn) {
    limparObservacoesMPBtn.addEventListener('click', function() {
      if (confirm('Tem certeza que deseja limpar as observações do MP?')) {
        const campoObservacoes = container.querySelector('#observacoes-mp');
        if (campoObservacoes) {
          // MUDANÇA: .textContent ao invés de .value
          campoObservacoes.textContent = '';
          mostrarMensagem(container, 'Observações do MP limpas', 'info');
        }
      }
    });
  }
  
  // Registrar eventos de remoção para elementos existentes
  setupRemoveButtons(container);
  
  // Adicionar classe ao contentor principal para o estilo específico da função
  container.closest('.main-content').classList.add('audiencia-mode');
  
  console.log('Módulo de Audiência pronto para uso - TESTE A: contenteditable');
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
    
    // Limpar as observações - MUDANÇA: .textContent ao invés de .value
    const observacoesMp = container.querySelector('#observacoes-mp');
    const observacoesDefesa = container.querySelector('#observacoes-defesa');
    
    if (observacoesMp) observacoesMp.textContent = ''; // MUDANÇA AQUI
    if (observacoesDefesa) observacoesDefesa.value = ''; // DEFESA continua textarea
    
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

// ============================================
// 📍 FUNÇÕES AUXILIARES DEEPSEEK - VALIDAÇÃO
// TESTE A: Ajustado para contenteditable
// ============================================

/**
 * Função de validação - pergunta que dia é hoje ao DeepSeek
 * MUDANÇA: usa .textContent ao invés de .value
 */
async function validarDeepSeekAudiencia(container) {
  const botao = container.querySelector('#atualizarDadosMP');
  const campoObservacoes = container.querySelector('#observacoes-mp');
  
  if (!botao || !campoObservacoes) {
    console.error('Elementos não encontrados');
    return;
  }
  
  // Salvar estado original do botão
  const textoOriginalBtn = botao.innerHTML;
  
  try {
    // Indicador de processamento no botão
    botao.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Testando...';
    botao.disabled = true;
    
    console.log('TESTE A: Iniciando validação DeepSeek - contenteditable');
    
    // Fazer requisição para DeepSeek
    const resposta = await chamarDeepSeekAudiencia("Que dia é hoje? Responda de forma simples e clara.");
    
    console.log('TESTE A: Resposta recebida:', resposta);
    
    // MUDANÇA PRINCIPAL: .textContent ao invés de .value
    campoObservacoes.textContent = `TESTE DEEPSEEK - TESTE A: contenteditable - ${new Date().toLocaleString()}\n\nResposta: ${resposta}`;
    
    // Mostrar mensagem de sucesso
    mostrarMensagem(container, '✅ TESTE A: DeepSeek funcionando com contenteditable!', 'success');
    
  } catch (error) {
    console.error('TESTE A: Erro no teste DeepSeek:', error);
    
    // MUDANÇA: .textContent ao invés de .value
    campoObservacoes.textContent = `ERRO NO TESTE DEEPSEEK - TESTE A: contenteditable - ${new Date().toLocaleString()}\n\nErro: ${error.message}`;
    
    // Mostrar mensagem de erro
    mostrarMensagem(container, `❌ TESTE A: Erro: ${error.message}`, 'error');
    
  } finally {
    // Restaurar botão original
    botao.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Atualizar';
    botao.disabled = false;
  }
}

/**
 * Função para chamar a API DeepSeek (baseada no guia.js)
 */
async function chamarDeepSeekAudiencia(pergunta) {
  try {
    console.log('TESTE A: Chamando API DeepSeek...');
    
    // Chave da API DeepSeek (mesma do guia.js)
    const apiKey = "sk-0a164d068ee643099f9d3fc508e4e612";
    
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
            content: "Você é um assistente prestativo que responde perguntas de forma simples e direta."
          },
          {
            role: "user",
            content: pergunta
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      })
    });
    
    console.log('TESTE A: Response status:', response.status);
    
    // Verificar resposta
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Erro ${response.status}: Falha na API`);
    }
    
    // Extrair o resultado
    const data = await response.json();
    
    console.log('TESTE A: Dados recebidos:', data);
    
    // Retornar o texto da resposta
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("TESTE A: Erro na API DeepSeek:", error);
    throw new Error(`Falha ao processar: ${error.message}`);
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
  console.log('Limpando recursos do módulo audiencia.js - TESTE A: contenteditable');
  
  // Remover estilos de impressão se existirem
  document.getElementById('print-styles')?.remove();
  
  // Remover qualquer mensagem de status
  document.querySelector('.status-message')?.remove();
  
  // Remover classe específica do modo audiência
  document.querySelector('.main-content')?.classList.remove('audiencia-mode');
}