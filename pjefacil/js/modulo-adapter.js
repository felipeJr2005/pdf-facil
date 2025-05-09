/**
 * module-adapter.js
 * Adaptador para carregamento de módulos em ambientes restritos
 * 
 * Este script fornece um mecanismo alternativo para carregar módulos JavaScript
 * quando o import() dinâmico não está disponível ou é bloqueado pelo servidor.
 */

// Namespace global para módulos carregados
window.PjeModules = window.PjeModules || {};

/**
 * Carrega um módulo JavaScript usando uma abordagem compatível
 * Tenta usar import() primeiro, depois cai para carregamento via script tag
 * 
 * @param {string} modulePath - Caminho para o módulo a ser carregado
 * @return {Promise} - Promise que resolve para o módulo carregado
 */
export async function loadModule(modulePath) {
  console.log(`[ModuleAdapter] Carregando módulo: ${modulePath}`);
  
  // Se já temos o módulo em cache, retorne-o
  if (window.PjeModules[modulePath]) {
    console.log(`[ModuleAdapter] Módulo já carregado: ${modulePath}`);
    return window.PjeModules[modulePath];
  }
  
  // Tente primeiro usando import() dinâmico (método moderno)
  try {
    console.log(`[ModuleAdapter] Tentando carregar via import(): ${modulePath}`);
    const module = await import(modulePath);
    window.PjeModules[modulePath] = module;
    return module;
  } catch (importError) {
    console.warn(`[ModuleAdapter] Import falhou, tentando método alternativo: ${importError.message}`);
    
    // Se import() falhar, tente usando script tag (método compatível)
    return new Promise((resolve, reject) => {
      // Criar um identificador único para o módulo
      const moduleId = modulePath.replace(/[^\w]/g, '_');
      
      // Caminho absoluto normalizado
      const absolutePath = getNormalizedPath(modulePath);
      
      // Verificar se já existe um script tag para este módulo
      if (document.getElementById(`module-${moduleId}`)) {
        document.getElementById(`module-${moduleId}`).remove();
      }
      
      // Criar script tag
      const script = document.createElement('script');
      script.id = `module-${moduleId}`;
      script.src = absolutePath;
      script.type = 'text/javascript';
      
      // Definir handlers para carregamento e erro
      script.onload = function() {
        console.log(`[ModuleAdapter] Script carregado: ${modulePath}`);
        
        // Verificar se o módulo exportou suas funções para o namespace global
        if (window[moduleId + '_module']) {
          // Módulo exportou suas funções corretamente
          window.PjeModules[modulePath] = window[moduleId + '_module'];
          resolve(window[moduleId + '_module']);
        } else {
          // Tentativa de buscar funções do escopo global
          const fakeModule = {};
          
          // Funções que esperamos que o módulo exporte
          ['initialize', 'cleanup'].forEach(funcName => {
            if (typeof window[moduleId + '_' + funcName] === 'function') {
              fakeModule[funcName] = window[moduleId + '_' + funcName];
            }
          });
          
          if (Object.keys(fakeModule).length > 0) {
            window.PjeModules[modulePath] = fakeModule;
            resolve(fakeModule);
          } else {
            reject(new Error(`Módulo carregado, mas não exportou funções para ${moduleId}_module`));
          }
        }
      };
      
      script.onerror = function(e) {
        console.error(`[ModuleAdapter] Erro ao carregar script: ${modulePath}`, e);
        reject(new Error(`Erro ao carregar o script: ${e.message || 'Erro desconhecido'}`));
      };
      
      // Adicionar script ao documento
      document.head.appendChild(script);
    });
  }
}

/**
 * Obtém um caminho normalizado, garantindo que seja absoluto
 */
function getNormalizedPath(path) {
  // Se já for uma URL completa
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Se for caminho absoluto no servidor
  if (path.startsWith('/')) {
    return path;
  }
  
  // Se for caminho relativo
  if (path.startsWith('./')) {
    path = path.substring(2);
  }
  
  // Base path - tentar obter do URL atual
  const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
  return basePath + path;
}

/**
 * Uso simplificado do adaptador de módulos
 * 
 * @param {string} modulePath - Caminho para o módulo
 * @param {HTMLElement} container - Container para inicializar o módulo
 * @return {Promise} - Promise resolvendo para o módulo
 */
export async function useModule(modulePath, container) {
  try {
    console.log(`[ModuleAdapter] Usando módulo: ${modulePath}`);
    const module = await loadModule(modulePath);
    
    if (module && typeof module.initialize === 'function') {
      console.log(`[ModuleAdapter] Inicializando módulo: ${modulePath}`);
      module.initialize(container);
      return module;
    } else {
      console.warn(`[ModuleAdapter] Módulo carregado mas não tem função initialize: ${modulePath}`);
      return module;
    }
  } catch (error) {
    console.error(`[ModuleAdapter] Erro ao usar módulo: ${modulePath}`, error);
    throw error;
  }
}

/**
 * Versão alternativa de audiencia.js para modo de compatibilidade
 * Este código será exportado para o namespace global quando o script for carregado
 */
window.audiencia_module = {
  // Função de inicialização
  initialize: function(container) {
    console.log('[Audiencia-Compat] Módulo inicializado no modo de compatibilidade');
    
    // Referência para depuração
    window.audienciaContainer = container;
    
    // Configurar event listeners
    this.configurarEventListeners(container);
    
    // Adicionar classe ao contentor principal
    const mainContent = container.closest('.main-content');
    if (mainContent) {
      mainContent.classList.add('audiencia-mode');
    }
    
    console.log('[Audiencia-Compat] Módulo pronto para uso');
  },
  
  // Configurar event listeners
  configurarEventListeners: function(container) {
    // Capturar todos os botões importantes
    const botoes = {
      addAssistenteBtn: container.querySelector('#addAssistenteBtn'),
      addVitimaBtn: container.querySelector('#addVitimaBtn'),
      addTestemunhaMpBtn: container.querySelector('#addTestemunhaMpBtn'),
      addPolicialBtn: container.querySelector('#addPolicialBtn'),
      addReuBtn: container.querySelector('#addReuBtn'),
      addTestemunhaDefesaBtn: container.querySelector('#addTestemunhaDefesaBtn'),
      salvarBtn: container.querySelector('#salvarBtn'),
      limparBtn: container.querySelector('#limparBtn')
    };
    
    // Configurar cada botão
    if (botoes.addAssistenteBtn) {
      botoes.addAssistenteBtn.addEventListener('click', () => this.adicionarAssistenteAcusacao(container));
    }
    
    if (botoes.addVitimaBtn) {
      botoes.addVitimaBtn.addEventListener('click', () => this.adicionarVitima(container));
    }
    
    if (botoes.addTestemunhaMpBtn) {
      botoes.addTestemunhaMpBtn.addEventListener('click', () => this.adicionarTestemunha(container, 'mp'));
    }
    
    if (botoes.addPolicialBtn) {
      botoes.addPolicialBtn.addEventListener('click', () => this.adicionarPolicial(container));
    }
    
    if (botoes.addReuBtn) {
      botoes.addReuBtn.addEventListener('click', () => this.adicionarReu(container));
    }
    
    if (botoes.addTestemunhaDefesaBtn) {
      botoes.addTestemunhaDefesaBtn.addEventListener('click', () => this.adicionarTestemunha(container, 'defesa'));
    }
    
    if (botoes.salvarBtn) {
      botoes.salvarBtn.addEventListener('click', () => this.salvarDados());
    }
    
    if (botoes.limparBtn) {
      botoes.limparBtn.addEventListener('click', () => this.limparFormulario(container));
    }
    
    // Configurar botões de remover
    this.configurarBotoesRemover(container);
  },
  
  // O restante das funções seguiria o mesmo padrão do audiencia.js universal
  // [Implementar restante das funções]
  
  // Função de limpeza
  cleanup: function() {
    console.log('[Audiencia-Compat] Limpando recursos');
    
    // Remover estilos de impressão se existirem
    document.getElementById('print-styles')?.remove();
    
    // Remover qualquer mensagem de status
    document.querySelector('.status-message')?.remove();
    
    // Remover classe específica do modo audiência
    document.querySelector('.main-content')?.classList.remove('audiencia-mode');
    
    // Limpar referência global
    window.audienciaContainer = null;
  }
};

// Expor funções individuais para compatibilidade
window.audiencia_initialize = window.audiencia_module.initialize.bind(window.audiencia_module);
window.audiencia_cleanup = window.audiencia_module.cleanup.bind(window.audiencia_module);
