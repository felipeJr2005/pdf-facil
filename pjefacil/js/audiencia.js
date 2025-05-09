/**
 * Módulo para Audiência - Integrado ao tema do dashboard
 * Versão universal para funcionar em todos os ambientes
 */

// Função de inicialização do módulo
export function initialize(container) {
  console.log('[Audiência] Módulo inicializado');
  
  // Referência para depuração
  window.audienciaContainer = container;
  
  // Garantir que o container está definido
  if (!container) {
    console.error('[Audiência] Container não fornecido');
    return;
  }
  
  // ===== Event Listeners Principais =====
  
  // Assistente de Acusação
  const btnAssistente = container.querySelector('#addAssistenteBtn');
  if (btnAssistente) {
    console.log('[Audiência] Botão Assistente encontrado');
    btnAssistente.addEventListener('click', function() {
      console.log('[Audiência] Clique em Adicionar Assistente');
      adicionarAssistenteAcusacao(container);
    });
  } else {
    console.warn('[Audiência] Botão Assistente NÃO encontrado');
  }
  
  // Vítima
  const btnVitima = container.querySelector('#addVitimaBtn');
  if (btnVitima) {
    console.log('[Audiência] Botão Vítima encontrado');
    btnVitima.addEventListener('click', function() {
      console.log('[Audiência] Clique em Adicionar Vítima');
      adicionarVitima(container);
    });
  }
  
  // Testemunha MP
  const btnTestemunhaMP = container.querySelector('#addTestemunhaMpBtn');
  if (btnTestemunhaMP) {
    console.log('[Audiência] Botão Testemunha MP encontrado');
    btnTestemunhaMP.addEventListener('click', function() {
      console.log('[Audiência] Clique em Adicionar Testemunha MP');
      adicionarTestemunha(container, 'mp');
    });
  }
  
  // Policial
  const btnPolicial = container.querySelector('#addPolicialBtn');
  if (btnPolicial) {
    console.log('[Audiência] Botão Policial encontrado');
    btnPolicial.addEventListener('click', function() {
      console.log('[Audiência] Clique em Adicionar Policial');
      adicionarPolicial(container);
    });
  }
  
  // Réu
  const btnReu = container.querySelector('#addReuBtn');
  if (btnReu) {
    console.log('[Audiência] Botão Réu encontrado');
    btnReu.addEventListener('click', function() {
      console.log('[Audiência] Clique em Adicionar Réu');
      adicionarReu(container);
    });
  }
  
  // Testemunha Defesa
  const btnTestemunhaDefesa = container.querySelector('#addTestemunhaDefesaBtn');
  if (btnTestemunhaDefesa) {
    console.log('[Audiência] Botão Testemunha Defesa encontrado');
    btnTestemunhaDefesa.addEventListener('click', function() {
      console.log('[Audiência] Clique em Adicionar Testemunha Defesa');
      adicionarTestemunha(container, 'defesa');
    });
  }
  
  // Salvar
  const btnSalvar = container.querySelector('#salvarBtn');
  if (btnSalvar) {
    console.log('[Audiência] Botão Salvar encontrado');
    btnSalvar.addEventListener('click', function() {
      console.log('[Audiência] Clique em Salvar');
      salvarDados();
    });
  }
  
  // Limpar
  const btnLimpar = container.querySelector('#limparBtn');
  if (btnLimpar) {
    console.log('[Audiência] Botão Limpar encontrado');
    btnLimpar.addEventListener('click', function() {
      console.log('[Audiência] Clique em Limpar');
      limparFormulario(container);
    });
  }
  
  // Registrar eventos para botões de remoção existentes
  configurarBotoesRemover(container);
  
  // Adicionar classe ao contentor principal
  const mainContent = container.closest('.main-content');
  if (mainContent) {
    mainContent.classList.add('audiencia-mode');
  }
  
  console.log('[Audiência] Módulo pronto para uso');
}

// ===== FUNÇÕES AUXILIARES =====

// Função para criar linha de assistente de acusação
function criarLinhaAssistenteAcusacao() {
  const linha = document.createElement('div');
  linha.className = 'linha';
  
  const timestamp = Date.now();
  const checkboxId = `intimado_${timestamp}`;
  
  linha.innerHTML = `
    <input type="text" placeholder="Nome do Assistente" class="nome">
    <input type="text" placeholder="OAB" class="oab">
    <div class="checkbox-container">
      <input type="checkbox" id="${checkboxId}" class="intimado">
      <label for="${checkboxId}">Intimado</label>
    </div>
    <button class="btn btn-danger remove-btn">×</button>
  `;
  
  return linha;
}

// Função para adicionar assistente de acusação
function adicionarAssistenteAcusacao(container) {
  console.log('[Audiência] Função adicionarAssistenteAcusacao chamada');
  
  // Encontrar o container
  const containerAssistente = container.querySelector('#assistente-acusacao-container');
  if (!containerAssistente) {
    console.error('[Audiência] Container assistente-acusacao-container não encontrado');
    mostrarMensagem(container, 'Erro ao encontrar container de assistente', 'error');
    return;
  }
  
  // Criar e adicionar a linha
  const linha = criarLinhaAssistenteAcusacao();
  
  // Adicionar listener ao botão remover
  const btnRemover = linha.querySelector('.remove-btn');
  if (btnRemover) {
    btnRemover.addEventListener('click', function() {
      console.log('[Audiência] Removendo assistente');
      linha.remove();
    });
  }
  
  // Adicionar ao DOM
  containerAssistente.appendChild(linha);
  
  // Efeito de animação
  setTimeout(function() {
    linha.classList.add('active');
  }, 10);
  
  console.log('[Audiência] Assistente adicionado com sucesso');
}

// Função para criar linha genérica
function criarLinha(tipo, extras = '') {
  const linha = document.createElement('div');
  linha.className = 'linha';
  
  const timestamp = Date.now();
  const checkboxId = `intimado_${timestamp}`;
  
  const baseHtml = `
    <input type="text" placeholder="Nome" class="nome">
    <input type="text" placeholder="Endereço" class="endereco">
    <div class="checkbox-container">
      <input type="checkbox" id="${checkboxId}" class="intimado">
      <label for="${checkboxId}">Intimado</label>
    </div>
    <button class="btn btn-danger remove-btn">×</button>
  `;
  
  linha.innerHTML = extras + baseHtml;
  return linha;
}

// Função para adicionar vítima
function adicionarVitima(container) {
  console.log('[Audiência] Função adicionarVitima chamada');
  
  const containerVitimas = container.querySelector('#vitimas-container');
  if (!containerVitimas) {
    console.error('[Audiência] Container vitimas-container não encontrado');
    mostrarMensagem(container, 'Erro ao encontrar container de vítimas', 'error');
    return;
  }
  
  const linha = criarLinha('vitima');
  
  const btnRemover = linha.querySelector('.remove-btn');
  if (btnRemover) {
    btnRemover.addEventListener('click', function() {
      linha.remove();
    });
  }
  
  containerVitimas.appendChild(linha);
  
  setTimeout(function() {
    linha.classList.add('active');
  }, 10);
  
  console.log('[Audiência] Vítima adicionada com sucesso');
}

// Função para adicionar testemunha
function adicionarTestemunha(container, tipo) {
  console.log(`[Audiência] Função adicionarTestemunha chamada para tipo: ${tipo}`);
  
  const containerTestemunhas = container.querySelector(`#testemunhas-${tipo}-container`);
  if (!containerTestemunhas) {
    console.error(`[Audiência] Container testemunhas-${tipo}-container não encontrado`);
    mostrarMensagem(container, `Erro ao encontrar container de testemunhas ${tipo}`, 'error');
    return;
  }
  
  const linha = criarLinha('testemunha');
  
  const btnRemover = linha.querySelector('.remove-btn');
  if (btnRemover) {
    btnRemover.addEventListener('click', function() {
      linha.remove();
    });
  }
  
  containerTestemunhas.appendChild(linha);
  
  setTimeout(function() {
    linha.classList.add('active');
  }, 10);
  
  console.log(`[Audiência] Testemunha ${tipo} adicionada com sucesso`);
}

// Função para adicionar policial
function adicionarPolicial(container) {
  console.log('[Audiência] Função adicionarPolicial chamada');
  
  const containerPoliciais = container.querySelector('#policiais-container');
  if (!containerPoliciais) {
    console.error('[Audiência] Container policiais-container não encontrado');
    mostrarMensagem(container, 'Erro ao encontrar container de policiais', 'error');
    return;
  }
  
  const extras = `
    <select class="tipo-policial">
      <option value="pm">PM</option>
      <option value="pc">PC</option>
      <option value="pf">PF</option>
      <option value="prf">PRF</option>
    </select>
  `;
  
  const linha = criarLinha('policial', extras);
  linha.querySelector('.endereco').placeholder = 'Matrícula/RG';
  
  const btnRemover = linha.querySelector('.remove-btn');
  if (btnRemover) {
    btnRemover.addEventListener('click', function() {
      linha.remove();
    });
  }
  
  containerPoliciais.appendChild(linha);
  
  setTimeout(function() {
    linha.classList.add('active');
  }, 10);
  
  console.log('[Audiência] Policial adicionado com sucesso');
}

// Função para adicionar réu
function adicionarReu(container) {
  console.log('[Audiência] Função adicionarReu chamada');
  
  const containerReus = container.querySelector('#reus-container');
  if (!containerReus) {
    console.error('[Audiência] Container reus-container não encontrado');
    mostrarMensagem(container, 'Erro ao encontrar container de réus', 'error');
    return;
  }
  
  const reuContainer = document.createElement('div');
  reuContainer.className = 'reu-item';
  
  const timestamp = Date.now();
  const checkboxReuId = `intimado_reu_${timestamp}`;
  const checkboxAdvId = `intimado_adv_${timestamp}`;
  
  reuContainer.innerHTML = `
    <div class="linha">
      <input type="text" placeholder="Nome" class="nome">
      <input type="text" placeholder="Endereço" class="endereco">
      <div class="checkbox-container">
        <input type="checkbox" id="${checkboxReuId}" class="intimado">
        <label for="${checkboxReuId}">Intimado</label>
      </div>
      <button class="btn btn-danger remove-btn">×</button>
    </div>
    <div class="linha">
      <select class="tipo-defesa">
        <option value="defensoria" selected>Defensoria Pública</option>
        <option value="particular">Advogado Particular</option>
      </select>
      <input type="text" placeholder="Nome do Advogado" class="nome-advogado" style="display: none;">
      <div class="checkbox-container">
        <input type="checkbox" id="${checkboxAdvId}" class="intimado-advogado">
        <label for="${checkboxAdvId}">Intimado</label>
      </div>
    </div>
  `;
  
  // Event listener para botão de remover
  const btnRemover = reuContainer.querySelector('.remove-btn');
  if (btnRemover) {
    btnRemover.addEventListener('click', function() {
      reuContainer.remove();
    });
  }
  
  // Event listener para tipo de defesa
  const selectTipoDefesa = reuContainer.querySelector('.tipo-defesa');
  const inputNomeAdvogado = reuContainer.querySelector('.nome-advogado');
  
  if (selectTipoDefesa && inputNomeAdvogado) {
    selectTipoDefesa.addEventListener('change', function() {
      inputNomeAdvogado.style.display = this.value === 'particular' ? 'block' : 'none';
    });
  }
  
  containerReus.appendChild(reuContainer);
  
  setTimeout(function() {
    reuContainer.classList.add('active');
  }, 10);
  
  console.log('[Audiência] Réu adicionado com sucesso');
}

// Configurar botões de remover existentes
function configurarBotoesRemover(container) {
  const botoesRemover = container.querySelectorAll('.remove-btn');
  
  botoesRemover.forEach(botao => {
    botao.addEventListener('click', function() {
      const linha = this.closest('.linha');
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
  
  console.log(`[Audiência] ${botoesRemover.length} botões de remover configurados`);
}

// Função para salvar dados (imprimir)
function salvarDados() {
  console.log('[Audiência] Função salvarDados chamada');
  
  // Mostrar overlay de processamento
  const processingOverlay = document.getElementById('processingOverlay');
  const processingText = document.getElementById('processingText');
  
  if (processingOverlay) {
    processingOverlay.style.display = 'flex';
    if (processingText) {
      processingText.textContent = 'Preparando documento...';
    }
  }
  
  // Guardar estilos originais
  const originalStyles = {
    header: document.querySelector('.dashboard-header')?.style.display,
    footer: document.querySelector('.dashboard-footer')?.style.display,
    contentHeader: document.querySelector('.content-header')?.style.marginBottom,
    sidebar: document.querySelector('.sidebar')?.style.display,
    botoes: [],
    removeButtons: []
  };
  
  // Ocultar cabeçalho, rodapé e sidebar
  const elements = {
    header: document.querySelector('.dashboard-header'),
    footer: document.querySelector('.dashboard-footer'),
    sidebar: document.querySelector('.sidebar'),
    contentHeader: document.querySelector('.content-header')
  };
  
  if (elements.header) elements.header.style.display = 'none';
  if (elements.footer) elements.footer.style.display = 'none';
  if (elements.sidebar) elements.sidebar.style.display = 'none';
  if (elements.contentHeader) elements.contentHeader.style.marginBottom = '0';
  
  // Ocultar botões
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
      @page {
        margin: 1cm;
      }
      
      .dashboard-header, .dashboard-footer, .sidebar, .btn, .remove-btn {
        display: none !important;
      }
      
      .content-header {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }
      
      #content-container {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      
      .audiencia-grid {
        display: block !important;
      }
      
      .section h3.section-title,
      .section .linha {
        text-align: left !important;
        justify-content: flex-start !important;
      }
      
      .panel {
        page-break-inside: avoid;
        margin-bottom: 20px;
      }
      
      body, html {
        font-size: 12pt !important;
      }
      
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
      if (elements.header) elements.header.style.display = originalStyles.header || '';
      if (elements.footer) elements.footer.style.display = originalStyles.footer || '';
      if (elements.sidebar) elements.sidebar.style.display = originalStyles.sidebar || '';
      if (elements.contentHeader) elements.contentHeader.style.marginBottom = originalStyles.contentHeader || '';
      
      originalStyles.botoes.forEach(item => {
        item.el.style.display = item.display || '';
      });
      
      originalStyles.removeButtons.forEach(item => {
        item.el.style.display = item.display || '';
      });
      
      // Mostrar mensagem de sucesso após a impressão
      const container = document.querySelector('#content-container');
      if (container) {
        mostrarMensagem(container, 'Documento salvo com sucesso!', 'success');
      }
    }, 1000);
  }, 500);
}

// Função para limpar o formulário
function limparFormulario(container) {
  console.log('[Audiência] Função limparFormulario chamada');
  
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
    
    // Limpar os containers dinâmicos com animação
    const containersLimpar = [
      'assistente-acusacao-container', 
      'vitimas-container', 
      'testemunhas-mp-container', 
      'policiais-container', 
      'reus-container', 
      'testemunhas-defesa-container'
    ];
    
    containersLimpar.forEach(id => {
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
    
    if (observacoesMp) observacoesMp.value = '';
    if (observacoesDefesa) observacoesDefesa.value = '';
    
    // Limpar todos os checkboxes
    container.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    
    // Limpar todos os campos de texto
    container.querySelectorAll('input[type="text"]').forEach(el => el.value = '');
    
    // Limpar os selects
    container.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
    
    // Limpar o campo de nome do advogado
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
  console.log('[Audiência] Limpando recursos do módulo audiencia.js');
  
  // Remover estilos de impressão se existirem
  document.getElementById('print-styles')?.remove();
  
  // Remover qualquer mensagem de status
  document.querySelector('.status-message')?.remove();
  
  // Remover classe específica do modo audiência
  document.querySelector('.main-content')?.classList.remove('audiencia-mode');
  
  // Limpar referência global
  window.audienciaContainer = null;
}
