/**
 * diagnostico.js - Módulo de diagnóstico para PjeFacil
 * Ajuda a identificar problemas de ambiente e compatibilidade
 */

// Função de inicialização do diagnóstico
export function initialize(container) {
  console.log('🔍 [DIAGNÓSTICO] Iniciando...');
  
  // Criar interface de diagnóstico
  const diagnosticoUI = document.createElement('div');
  diagnosticoUI.className = 'diagnostico-container';
  diagnosticoUI.innerHTML = `
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-info-subtle">
        <h5 class="card-title text-info mb-0">
          <i class="fas fa-stethoscope me-2"></i> Diagnóstico de Sistema
        </h5>
      </div>
      <div class="card-body">
        <div class="alert alert-info">
          Esta ferramenta ajuda a diagnosticar problemas no PjeFacil.
          <br>Clique nos botões abaixo para testar diferentes aspectos do sistema.
        </div>
        
        <div class="row mb-3">
          <div class="col">
            <button id="diagnostico-info" class="btn btn-primary w-100">
              <i class="fas fa-info-circle me-2"></i> Informações do Ambiente
            </button>
          </div>
          <div class="col">
            <button id="diagnostico-dom" class="btn btn-primary w-100">
              <i class="fas fa-sitemap me-2"></i> Testar Seletores DOM
            </button>
          </div>
          <div class="col">
            <button id="diagnostico-modulos" class="btn btn-primary w-100">
              <i class="fas fa-cubes me-2"></i> Testar Carregamento de Módulos
            </button>
          </div>
        </div>
        
        <div id="diagnostico-resultado" class="border rounded p-3 bg-light">
          <p class="text-center text-muted mb-0">
            Os resultados aparecerão aqui quando você iniciar um diagnóstico.
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Adicionar à página
  container.appendChild(diagnosticoUI);
  
  // Configurar event listeners
  const btnInfo = diagnosticoUI.querySelector('#diagnostico-info');
  const btnDOM = diagnosticoUI.querySelector('#diagnostico-dom');
  const btnModulos = diagnosticoUI.querySelector('#diagnostico-modulos');
  const resultadoContainer = diagnosticoUI.querySelector('#diagnostico-resultado');
  
  if (btnInfo) {
    btnInfo.addEventListener('click', () => mostrarInfoAmbiente(resultadoContainer));
  }
  
  if (btnDOM) {
    btnDOM.addEventListener('click', () => testarSeletoresDOM(resultadoContainer, container));
  }
  
  if (btnModulos) {
    btnModulos.addEventListener('click', () => testarCarregamentoModulos(resultadoContainer));
  }
  
  console.log('🔍 [DIAGNÓSTICO] Módulo inicializado');
}

// Mostrar informações do ambiente
function mostrarInfoAmbiente(container) {
  console.log('🔍 [DIAGNÓSTICO] Exibindo informações do ambiente');
  
  // Detectar características do ambiente
  const info = {
    url: window.location.href,
    protocolo: window.location.protocol,
    host: window.location.host,
    pathname: window.location.pathname,
    userAgent: navigator.userAgent,
    resolucao: `${window.innerWidth}x${window.innerHeight}`,
    viewport: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
    cookies: navigator.cookieEnabled ? 'Habilitados' : 'Desabilitados',
    suportaModulosES6: typeof import === 'function' ? 'Sim' : 'Não',
    cors: window.location.protocol === 'https:' ? 'Restrito' : 'Potencialmente Permissivo',
    origemScript: getScriptOrigin('dashboard.js')
  };
  
  // Exibir informações
  let html = `
    <h5 class="border-bottom pb-2 mb-3">Informações do Ambiente</h5>
    <div class="row">
      <div class="col-md-6">
        <ul class="list-group mb-3">
          <li class="list-group-item d-flex justify-content-between">
            <strong>URL:</strong> <span class="text-break">${info.url}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <strong>Protocolo:</strong> <span>${info.protocolo}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <strong>Host:</strong> <span>${info.host}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <strong>Caminho:</strong> <span>${info.pathname}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <strong>Origem Scripts:</strong> <span>${info.origemScript || 'Não detectado'}</span>
          </li>
        </ul>
      </div>
      <div class="col-md-6">
        <ul class="list-group mb-3">
          <li class="list-group-item d-flex justify-content-between">
            <strong>User Agent:</strong> <span>Navegador Compatível</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <strong>Resolução:</strong> <span>${info.resolucao}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <strong>Suporte a ES6 Modules:</strong> <span>${info.suportaModulosES6}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <strong>Política CORS:</strong> <span>${info.cors}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <strong>Cookies:</strong> <span>${info.cookies}</span>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="alert ${info.suportaModulosES6 === 'Não' ? 'alert-danger' : 'alert-success'}">
      <strong>Compatibilidade de Módulos ES6:</strong> ${info.suportaModulosES6 === 'Não' ? 
      'Seu navegador não suporta módulos ES6, o que pode causar problemas de carregamento.' : 
      'Seu navegador suporta módulos ES6, compatível com o PjeFacil.'}
    </div>
    
    <div class="alert ${info.protocolo === 'https:' ? 'alert-success' : 'alert-warning'}">
      <strong>Segurança:</strong> ${info.protocolo === 'https:' ? 
      'Conexão segura (HTTPS), ideal para aplicações modernas.' : 
      'Conexão não-segura (HTTP), pode limitar funcionalidades em navegadores modernos.'}
    </div>
  `;
  
  container.innerHTML = html;
}

// Testar seletores DOM
function testarSeletoresDOM(container, pageContainer) {
  console.log('🔍 [DIAGNÓSTICO] Testando seletores DOM');
  
  // Testar seletores importantes
  const seletores = [
    { nome: '#addAssistenteBtn', descricao: 'Botão Assistente (Audiência)' },
    { nome: '#addVitimaBtn', descricao: 'Botão Vítima (Audiência)' },
    { nome: '#addTestemunhaMpBtn', descricao: 'Botão Testemunha MP (Audiência)' },
    { nome: '#salvarBtn', descricao: 'Botão Salvar (Audiência)' },
    { nome: '#limparBtn', descricao: 'Botão Limpar (Audiência)' },
    { nome: '#assistente-acusacao-container', descricao: 'Container Assistente' },
    { nome: '#vitimas-container', descricao: 'Container Vítimas' },
    { nome: '#testemunhas-mp-container', descricao: 'Container Testemunhas MP' },
    { nome: '.dashboard-header', descricao: 'Cabeçalho do Dashboard' },
    { nome: '.dashboard-footer', descricao: 'Rodapé do Dashboard' },
    { nome: '.sidebar', descricao: 'Barra Lateral' },
    { nome: '#content-container', descricao: 'Container de Conteúdo' }
  ];
  
  // Executar os testes
  const resultados = seletores.map(seletor => {
    const elemento = pageContainer.querySelector(seletor.nome) || document.querySelector(seletor.nome);
    return {
      nome: seletor.nome,
      descricao: seletor.descricao,
      encontrado: !!elemento,
      tipo: elemento ? elemento.tagName : 'N/A'
    };
  });
  
  // Contar resultados
  const encontrados = resultados.filter(r => r.encontrado).length;
  const total = resultados.length;
  
  // Exibir resultados
  let html = `
    <h5 class="border-bottom pb-2 mb-3">Resultados dos Seletores DOM</h5>
    
    <div class="progress mb-3" style="height: 25px;">
      <div class="progress-bar ${encontrados === total ? 'bg-success' : encontrados < total/2 ? 'bg-danger' : 'bg-warning'}" 
           role="progressbar" 
           style="width: ${(encontrados/total)*100}%;" 
           aria-valuenow="${encontrados}" 
           aria-valuemin="0" 
           aria-valuemax="${total}">
        ${encontrados}/${total} (${Math.round((encontrados/total)*100)}%)
      </div>
    </div>
    
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Seletor</th>
          <th>Descrição</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  resultados.forEach(r => {
    html += `
      <tr>
        <td><code>${r.nome}</code></td>
        <td>${r.descricao}</td>
        <td>
          <span class="badge ${r.encontrado ? 'bg-success' : 'bg-danger'}">
            ${r.encontrado ? `Encontrado (${r.tipo})` : 'Não encontrado'}
          </span>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
    
    <div class="alert ${encontrados === total ? 'alert-success' : 'alert-warning'}">
      <strong>Análise:</strong> ${encontrados === total ? 
      'Todos os seletores DOM foram encontrados. A estrutura da página está correta.' : 
      `${total - encontrados} seletores não foram encontrados. Isso pode indicar problemas na estrutura HTML ou no carregamento.`}
    </div>
  `;
  
  container.innerHTML = html;
}

// Testar carregamento de módulos
async function testarCarregamentoModulos(container) {
  console.log('🔍 [DIAGNÓSTICO] Testando carregamento de módulos');
  
  // Mostrar progresso
  container.innerHTML = `
    <div class="text-center p-4">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p>Testando carregamento de módulos...</p>
    </div>
  `;
  
  // Lista de módulos para testar
  const modulos = [
    { nome: './js/notas.js', descricao: 'Módulo de Notas' },
    { nome: './js/audiencia.js', descricao: 'Módulo de Audiência' },
    { nome: './js/funcao01.js', descricao: 'Módulo de Função 01' },
    { nome: './js/guia.js', descricao: 'Módulo de Carta Guia' }
  ];
  
  // Testar cada módulo
  const resultados = [];
  
  for (const modulo of modulos) {
    try {
      const tempoInicio = performance.now();
      const moduloCarregado = await import(modulo.nome).catch(e => {
        throw e;
      });
      const tempoFim = performance.now();
      
      resultados.push({
        nome: modulo.nome,
        descricao: modulo.descricao,
        sucesso: true,
        tempoMS: Math.round(tempoFim - tempoInicio),
        initialize: typeof moduloCarregado.initialize === 'function',
        cleanup: typeof moduloCarregado.cleanup === 'function',
        erro: null
      });
    } catch (error) {
      resultados.push({
        nome: modulo.nome,
        descricao: modulo.descricao,
        sucesso: false,
        tempoMS: 0,
        initialize: false,
        cleanup: false,
        erro: error.message
      });
    }
  }
  
  // Contar resultados
  const sucessos = resultados.filter(r => r.sucesso).length;
  const total = resultados.length;
  
  // Exibir resultados
  let html = `
    <h5 class="border-bottom pb-2 mb-3">Resultados de Carregamento de Módulos</h5>
    
    <div class="progress mb-3" style="height: 25px;">
      <div class="progress-bar ${sucessos === total ? 'bg-success' : sucessos < total/2 ? 'bg-danger' : 'bg-warning'}" 
           role="progressbar" 
           style="width: ${(sucessos/total)*100}%;" 
           aria-valuenow="${sucessos}" 
           aria-valuemin="0" 
           aria-valuemax="${total}">
        ${sucessos}/${total} (${Math.round((sucessos/total)*100)}%)
      </div>
    </div>
    
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Módulo</th>
          <th>Status</th>
          <th>Tempo</th>
          <th>Funções</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  resultados.forEach(r => {
    html += `
      <tr>
        <td>
          <code>${r.nome}</code>
          <div class="small text-muted">${r.descricao}</div>
        </td>
        <td>
          <span class="badge ${r.sucesso ? 'bg-success' : 'bg-danger'}">
            ${r.sucesso ? 'Sucesso' : 'Falha'}
          </span>
          ${r.erro ? `<div class="small text-danger mt-1">${r.erro}</div>` : ''}
        </td>
        <td>${r.sucesso ? `${r.tempoMS}ms` : '-'}</td>
        <td>
          ${r.sucesso ? `
            <span class="badge ${r.initialize ? 'bg-success' : 'bg-warning'} me-1">
              initialize: ${r.initialize ? 'Sim' : 'Não'}
            </span>
            <span class="badge ${r.cleanup ? 'bg-success' : 'bg-warning'}">
              cleanup: ${r.cleanup ? 'Sim' : 'Não'}
            </span>
          ` : '-'}
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
    
    <div class="alert ${sucessos === total ? 'alert-success' : 'alert-warning'}">
      <strong>Análise:</strong> ${sucessos === total ? 
      'Todos os módulos foram carregados com sucesso.' : 
      `${total - sucessos} módulos não puderam ser carregados. Isso pode indicar problemas no caminho dos arquivos ou CORS.`}
    </div>
    
    <div class="mt-3">
      <h6>Recomendações:</h6>
      <ul>
        ${sucessos < total ? `
          <li>Verifique se os arquivos existem nos caminhos especificados</li>
          <li>Verifique as configurações de CORS do servidor</li>
          <li>Considere usar caminhos absolutos em vez de relativos</li>
        ` : ''}
        <li>Use os logs do console para mais detalhes sobre erros específicos</li>
      </ul>
    </div>
  `;
  
  container.innerHTML = html;
}

// Função utilitária para obter a origem de um script
function getScriptOrigin(scriptName) {
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.src && script.src.includes(scriptName)) {
      try {
        const url = new URL(script.src);
        return url.origin;
      } catch (e) {
        return 'Origem inválida';
      }
    }
  }
  return null;
}

// Função de limpeza
export function cleanup() {
  console.log('🔍 [DIAGNÓSTICO] Limpando recursos');
  
  // Remover elementos criados, se necessário
  const diagnosticoContainer = document.querySelector('.diagnostico-container');
  if (diagnosticoContainer) {
    diagnosticoContainer.remove();
  }
}
