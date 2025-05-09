/**
 * Dashboard - Script principal
 * Gerencia o carregamento dinâmico de módulos e funcionalidades
 * Atualizado para funcionar com Bootstrap
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
            
            // Adicione aqui outros elementos que precisam ter bg-white removido
        } else {
            // No modo claro, garantimos que as classes originais estão presentes
            if (header) header.classList.add('bg-white');
            if (sidebar) sidebar.classList.add('bg-white');
            
            // Adicione aqui outros elementos que precisam ter bg-white adicionado
        }
        
        // Salva a preferência
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
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
            
            // Carrega o template HTML
            const templateResponse = await fetch(page.template);
            
            if (!templateResponse.ok) {
                throw new Error(`Não foi possível carregar o template: ${templateResponse.status}`);
            }
            
            // Renderiza o HTML
            const html = await templateResponse.text();
            contentContainer.innerHTML = html;
            
            // Limpa módulo anterior
            if (window.activeModule && typeof window.activeModule.cleanup === 'function') {
                window.activeModule.cleanup();
            }
            
            // Carrega e inicializa o módulo JavaScript
            try {
                const module = await import(`/${page.module}`);
                
                if (module && typeof module.initialize === 'function') {
                    module.initialize(contentContainer);
                    window.activeModule = module;
                } else {
                    console.warn(`Módulo ${page.module} não tem função de inicialização.`);
                }
            } catch (moduleError) {
                console.error(`Erro ao carregar o módulo JavaScript: ${moduleError}`);
            }
            
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
                        Ocorreu um erro ao carregar esta funcionalidade.
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
