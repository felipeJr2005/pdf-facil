/**
 * Dashboard - Script principal
 * Gerencia o carregamento dinâmico de módulos e funcionalidades
 * Atualizado para funcionar com caminhos absolutos e relativos
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const themeToggle = document.getElementById('theme-toggle');
    const contentContainer = document.getElementById('content-container');
    const pageTitle = document.getElementById('page-title');
    const pageDescription = document.getElementById('page-description');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const body = document.body;
    
    // Elementos que precisam ter as classes de bg ajustadas para o tema
    const header = document.querySelector('.dashboard-header');
    const sidebar = document.querySelector('.sidebar');
    
    // ===== DEFINIÇÃO DA BASE PATH E SISTEMA DE CARREGAMENTO =====
    
    // Esta BASE_PATH precisa apontar para o diretório onde estão os arquivos do seu projeto
    // Deve terminar com barra '/'
    const BASE_PATH = '/pjefacil/';
    
    // Registro de módulos já carregados para evitar carregar duas vezes
    window.loadedModules = window.loadedModules || {};
    
    // Contador para IDs únicos
    let scriptCounter = 0;
    
    // Log para diagnóstico
    console.log('Dashboard inicializado:');
    console.log('- URL atual:', window.location.href);
    console.log('- Caminho base configurado:', BASE_PATH);
    
    // Configurações das páginas
    const pages = {
        funcao01: {
            title: 'Função 01',
            description: 'Descrição da primeira função.',
            template: 'funcoes/funcao01-bootstrap.html',
            module: 'js/funcao01.js'
        },
        notas: {
            title: 'Notas',
            description: 'Editor de notas com suporte para texto e imagens.',
            template: 'funcoes/notas-bootstrap.html',
            module: 'js/notas.js'
        },
        Audiencia: {
            title: 'Audiência',
            description: 'Cumprir Audiencia.',
            template: 'funcoes/audiencia-bootstrap.html',
            module: 'js/audiencia.js'
        },
        Guia: {
            title: 'Carta Guia',
            description: 'Carta Guia Sentenciado.',
            template: 'funcoes/guia-bootstrap.html',
            module: 'js/guia.js'
        },
        funcao05: {
            title: 'Função 05',
            description: 'Descrição da quinta função.',
            template: 'funcoes/funcao05.html',
            module: 'js/funcao05.js'
        },
        funcao06: {
            title: 'Função 06',
            description: 'Descrição da sexta função.',
            template: 'funcoes/funcao06.html',
            module: 'js/funcao06.js'
        }
    };
    
    // Registro para módulos ativos
    window.activeModule = null;
    
    // ===== FUNÇÕES AUXILIARES =====
    
    /**
     * Gerencia o tema (claro/escuro)
     */
    function applyTheme(isDark) {
        // Aplica o tema ao HTML
        document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
        
        // Atualiza as classes de background para elementos específicos
        if (isDark) {
            // No modo escuro, removemos a classe bg-white para permitir que o tema escuro funcione
            if (header) header.classList.remove('bg-white');
            if (sidebar) sidebar.classList.remove('bg-white');
            
            // Substitui o logo por uma versão branca para o tema escuro
            const sidebarLogo = document.querySelector('.sidebar-logo');
            if (sidebarLogo) {
                sidebarLogo.style.filter = 'invert(1) brightness(0.8)';
            }
        } else {
            // No modo claro, garantimos que as classes originais estão presentes
            if (header) header.classList.add('bg-white');
            if (sidebar) sidebar.classList.add('bg-white');
            
            // Restaura o logo original para o tema claro
            const sidebarLogo = document.querySelector('.sidebar-logo');
            if (sidebarLogo) {
                sidebarLogo.style.filter = '';
            }
        }
        
        // Salva a preferência
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    
    /**
     * Constrói um caminho absoluto com base no caminho base definido
     */
    function buildPath(relativePath) {
        // Verificar se o caminho já começa com a base path
        if (relativePath.startsWith(BASE_PATH)) {
            return relativePath;
        }
        
        // Remove qualquer barra inicial do caminho relativo
        const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
        
        // Constrói o caminho absoluto
        return BASE_PATH + cleanPath;
    }
    
    /**
     * Carrega um script JavaScript de forma assíncrona
     * @param {string} url - URL do script a ser carregado
     * @returns {Promise} - Promise que resolve quando o script é carregado
     */
    function loadScript(url) {
        // Evitar carregar o mesmo script várias vezes
        if (window.loadedModules[url]) {
            console.log(`Script ${url} já foi carregado anteriormente`);
            return Promise.resolve(window.loadedModules[url]);
        }
        
        return new Promise((resolve, reject) => {
            const scriptId = `dynamic-script-${scriptCounter++}`;
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = url;
            script.async = true;
            
            // Evento para quando o script é carregado
            script.onload = () => {
                console.log(`Script ${url} carregado com sucesso`);
                resolve();
            };
            
            // Evento para erros de carregamento
            script.onerror = (error) => {
                console.error(`Erro ao carregar script ${url}:`, error);
                
                // Remover o script com erro
                document.head.removeChild(script);
                reject(new Error(`Falha ao carregar o script: ${url}`));
            };
            
            // Adicionar o script ao documento
            document.head.appendChild(script);
        });
    }
    
    /**
     * Carrega uma página pela identificação
     */
    async function loadPage(pageName) {
        const page = pages[pageName];
        
        if (!page) {
            console.error(`Página "${pageName}" não encontrada.`);
            return;
        }
        
        try {
            // Atualiza título e descrição
            pageTitle.textContent = page.title;
            pageDescription.textContent = page.description;
            
            // Exibe loader durante o carregamento
            contentContainer.innerHTML = `
                <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </div>
            `;
            
            // Constrói o caminho completo para o template
            const templatePath = buildPath(page.template);
            console.log(`Carregando template: ${templatePath}`);
            
            // Carrega o template HTML
            const templateResponse = await fetch(templatePath);
            
            if (!templateResponse.ok) {
                throw new Error(`Não foi possível carregar o template: ${templateResponse.status} - ${templateResponse.statusText}`);
            }
            
            // Renderiza o HTML
            const html = await templateResponse.text();
            contentContainer.innerHTML = html;
            
            // Limpa módulo anterior
            if (window.activeModule && typeof window.activeModule.cleanup === 'function') {
                window.activeModule.cleanup();
                window.activeModule = null;
            }
            
            // Constrói o caminho completo para o módulo JS
            const modulePath = buildPath(page.module);
            console.log(`Carregando módulo como script: ${modulePath}`);
            
            // SOLUÇÃO ALTERNATIVA: Usar uma abordagem baseada em JSONP
            // Adiciona um callback global que será chamado pelo script
            const callbackName = `onModuleLoaded_${Date.now().toString(36)}`;
            
            // Cria um elemento script com um callback que será executado quando o script for carregado
            window[callbackName] = function(moduleExports) {
                console.log(`Módulo ${page.module} carregado via callback`);
                
                if (moduleExports && typeof moduleExports.initialize === 'function') {
                    try {
                        moduleExports.initialize(contentContainer);
                        window.activeModule = moduleExports;
                    } catch (error) {
                        console.error(`Erro ao inicializar módulo:`, error);
                    }
                } else {
                    console.warn(`Módulo ${page.module} não tem função de inicialização.`);
                }
                
                // Limpa o callback global
                delete window[callbackName];
            };
            
            // Cria um wrapper para carregar cada módulo
            // Este script irá carregar o módulo correto e chamar o callback
            const wrapperScript = document.createElement('script');
            wrapperScript.textContent = `
                // Módulo para ${page.module}
                (function() {
                    // Objeto de exportação que será passado para o callback
                    const moduleExports = {};
                    
                    // Função de inicialização (será chamada com o container)
                    moduleExports.initialize = function(container) {
                        console.log('Módulo ${page.module} inicializado');
                        
                        // Os elementos do DOM estão no container
                        // Coloque aqui o código específico do módulo ${page.module}
                        
                        // Exemplo para o módulo de notas
                        if ('${page.module}'.includes('notas')) {
                            // Editor de Notas
                            const notasEditor = container.querySelector('#notas-editor');
                            const clearBtn = container.querySelector('#clearBtn');
                            const printBtn = container.querySelector('#printBtn');
                            const saveBtn = container.querySelector('#saveBtn');
                            
                            if (clearBtn) {
                                clearBtn.addEventListener('click', function() {
                                    if (notasEditor) notasEditor.innerHTML = '';
                                });
                            }
                            
                            if (printBtn) {
                                printBtn.addEventListener('click', function() {
                                    window.print();
                                });
                            }
                            
                            if (saveBtn) {
                                saveBtn.addEventListener('click', function() {
                                    const conteudo = notasEditor ? notasEditor.innerHTML : '';
                                    localStorage.setItem('notas-conteudo', conteudo);
                                    alert('Notas salvas com sucesso!');
                                });
                            }
                            
                            // Carregar conteúdo salvo
                            if (notasEditor) {
                                const conteudoSalvo = localStorage.getItem('notas-conteudo');
                                if (conteudoSalvo) {
                                    notasEditor.innerHTML = conteudoSalvo;
                                }
                            }
                        }
                        
                        // Exemplo para o módulo de audiência
                        if ('${page.module}'.includes('audiencia')) {
                            // Código do módulo de audiência...
                        }
                        
                        // Exemplo para o módulo funcao01
                        if ('${page.module}'.includes('funcao01')) {
                            // Código específico para funcao01
                            const dropZone = container.querySelector('#dropZone');
                            const fileInput = container.querySelector('#fileInput');
                            const actionButton = container.querySelector('#actionButton');
                            
                            if (dropZone && fileInput) {
                                dropZone.addEventListener('click', () => fileInput.click());
                                
                                if (fileInput) {
                                    fileInput.addEventListener('change', (e) => {
                                        const files = e.target.files;
                                        if (files.length > 0) {
                                            const fileInfoEl = container.querySelector('#fileInfo');
                                            const controlPanel = container.querySelector('#controlPanel');
                                            
                                            if (fileInfoEl) {
                                                let fileInfoHTML = '<div class="alert alert-success">Arquivos selecionados:</div><ul class="list-group">';
                                                
                                                for (let i = 0; i < files.length; i++) {
                                                    fileInfoHTML += \`
                                                        <li class="list-group-item">
                                                            <i class="fas fa-file me-2"></i>
                                                            \${files[i].name} (\${Math.round(files[i].size / 1024)} KB)
                                                        </li>
                                                    \`;
                                                }
                                                
                                                fileInfoHTML += '</ul>';
                                                fileInfoEl.innerHTML = fileInfoHTML;
                                            }
                                            
                                            if (controlPanel) {
                                                controlPanel.classList.remove('d-none');
                                            }
                                            
                                            if (actionButton) {
                                                actionButton.disabled = false;
                                            }
                                        }
                                    });
                                }
                            }
                            
                            if (actionButton) {
                                actionButton.addEventListener('click', () => {
                                    const overlay = document.getElementById('processingOverlay');
                                    const resultArea = container.querySelector('#resultArea');
                                    
                                    if (overlay) overlay.style.display = 'flex';
                                    
                                    setTimeout(() => {
                                        if (overlay) overlay.style.display = 'none';
                                        if (resultArea) resultArea.classList.remove('d-none');
                                    }, 1500);
                                });
                            }
                        }
                    };
                    
                    // Função de limpeza para quando mudamos de página
                    moduleExports.cleanup = function() {
                        console.log('Limpando recursos do módulo ${page.module}');
                        // Código de limpeza específico do módulo
                    };
                    
                    // Chama o callback com o módulo exportado
                    window["${callbackName}"](moduleExports);
                })();
            `;
            
            // Insere o script na página
            document.head.appendChild(wrapperScript);
            
            // Inicializa os tooltips do Bootstrap na nova página carregada
            if (typeof bootstrap !== 'undefined') {
                // Inicializa todos os tooltips
                const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                tooltips.map(function (tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl);
                });
                
                // Inicializa todos os popovers
                const popovers = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
                popovers.map(function (popoverTriggerEl) {
                    return new bootstrap.Popover(popoverTriggerEl);
                });
            }
            
            // Atualiza URL para navegação
            history.pushState({ page: pageName }, page.title, `#${pageName}`);
            
        } catch (error) {
            console.error(`Erro ao carregar a página ${pageName}:`, error);
            contentContainer.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>
                        <strong>Ocorreu um erro ao carregar esta funcionalidade.</strong>
                        <p>${error.message}</p>
                        <p>Caminho tentado: ${buildPath(page.template)}</p>
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * Verifica o tamanho da tela e ajusta a sidebar
     */
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            body.classList.add('sidebar-collapsed');
        } else {
            body.classList.remove('sidebar-collapsed');
        }
    }
    
    // ===== INICIALIZAÇÃO E EVENTOS =====
    
    // Toggle da sidebar
    sidebarToggle.addEventListener('click', function() {
        body.classList.toggle('sidebar-collapsed');
        body.classList.toggle('sidebar-open');
        
        // Gerencia overlay para dispositivos móveis
        if (body.classList.contains('sidebar-open')) {
            if (!document.querySelector('.sidebar-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                overlay.addEventListener('click', function() {
                    body.classList.remove('sidebar-open');
                    this.remove();
                });
                body.appendChild(overlay);
            }
        } else {
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.remove();
        }
    });
    
    // Toggle do tema (claro/escuro)
    themeToggle.addEventListener('change', function() {
        applyTheme(this.checked);
    });
    
    // Carrega tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        themeToggle.checked = true;
        applyTheme(true);
    } else {
        themeToggle.checked = false;
        applyTheme(false);
    }
    
    // Navegação entre páginas
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pageName = this.getAttribute('data-page');
            
            // Carrega a página
            loadPage(pageName);
            
            // Atualiza item ativo
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Fecha sidebar em dispositivos móveis
            if (window.innerWidth <= 768) {
                body.classList.remove('sidebar-open');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) overlay.remove();
            }
        });
    });
    
    // Navegação pelo histórico
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.page) {
            loadPage(event.state.page);
            
            // Atualiza item ativo
            sidebarItems.forEach(item => {
                if (item.getAttribute('data-page') === event.state.page) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    });
    
    // Inicialização responsiva
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Carrega página inicial ou da URL
    const hash = window.location.hash.substring(1);
    const initialPage = hash && pages[hash] ? hash : 'notas';
    
    // Carrega a página inicial
    loadPage(initialPage);
    
    // Marca o item correto como ativo
    sidebarItems.forEach(item => {
        if (item.getAttribute('data-page') === initialPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});
