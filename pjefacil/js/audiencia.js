/**
 * Módulo para a funcionalidade de Cumprir Audiência
 */
const AudienciaModule = (function() {
    /**
     * Inicializa o módulo de audiência
     */
    function init() {
        // Verifica se o módulo está sendo carregado em contexto modal ou página própria
        const isModal = window.parent !== window && document.getElementById('modal-body');
        
        // Configurar listeners de eventos
        configurarEventos();
        
        console.log('Módulo de Audiência inicializado', isModal ? 'em modal' : 'em página própria');
    }
    
    /**
     * Configura os eventos da interface
     */
    function configurarEventos() {
        // Verificar se estamos em uma página que tem os elementos necessários
        const toggleBtn = document.getElementById('toggleForm');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function() {
                const formContent = document.querySelector('.form-content');
                const isVisible = formContent.classList.contains('visible');
                formContent.classList.toggle('visible');
                this.textContent = isVisible ? 'Cumprir Audiência' : 'Ocultar Formulário';
            });
        }
        
        // Configurar botões dinâmicos (podem ser gerados durante o uso)
        document.addEventListener('click', function(event) {
            const target = event.target;
            
            // Verificar se o clique foi em um botão de adicionar
            if (target.closest('.btn-add')) {
                const btnAdd = target.closest('.btn-add');
                
                // Determinar qual tipo de item adicionar com base no botão
                if (btnAdd.textContent.includes('Vítima')) {
                    addVitima();
                } else if (btnAdd.textContent.includes('Testemunha')) {
                    // Determinar o tipo (mp ou defesa) com base no container pai
                    const container = btnAdd.closest('.section');
                    const isMP = container.textContent.includes('Ministério Público') || 
                                container.querySelector('[id^="testemunhas-mp"]');
                    
                    addTestemunha(isMP ? 'mp' : 'defesa');
                } else if (btnAdd.textContent.includes('Policial')) {
                    addPolicial();
                } else if (btnAdd.textContent.includes('Réu')) {
                    addReu();
                }
            }
            
            // Verificar se o clique foi no botão de assistente de acusação
            if (target.closest('#btn-assistente-acusacao')) {
                addAssistenteAcusacao();
            }
        });
    }
    
    /**
     * Cria uma linha para assistente de acusação
     */
    function criarLinhaAssistenteAcusacao() {
        const linha = document.createElement('div');
        linha.className = 'linha';

        const baseHtml = `
            <input type="text" placeholder="Nome do Assistente" class="nome">
            <input type="text" placeholder="OAB" class="oab">
            <div class="checkbox-container">
                <input type="checkbox" id="intimado_${Date.now()}" class="intimado">
                <label for="intimado_${Date.now()}">Intimado</label>
            </div>
            <button class="btn btn-danger remove-btn" onclick="this.parentElement.remove()">×</button>
        `;

        linha.innerHTML = baseHtml;
        return linha;
    }

    /**
     * Adiciona um assistente de acusação
     */
    function addAssistenteAcusacao() {
        const container = document.getElementById('assistente-acusacao-container');
        container.appendChild(criarLinhaAssistenteAcusacao());
    }

    /**
     * Cria uma linha padrão para formulário
     */
    function criarLinha(tipo, extras = '') {
        const linha = document.createElement('div');
        linha.className = 'linha';

        const baseHtml = `
            <input type="text" placeholder="Nome" class="nome">
            <input type="text" placeholder="Endereço" class="endereco">
            <div class="checkbox-container">
                <input type="checkbox" id="intimado_${Date.now()}" class="intimado">
                <label for="intimado_${Date.now()}">Intimado</label>
            </div>
            <button class="btn btn-danger remove-btn" onclick="this.parentElement.remove()">×</button>
        `;

        linha.innerHTML = extras + baseHtml;
        return linha;
    }

    /**
     * Adiciona uma vítima
     */
    function addVitima() {
        const container = document.getElementById('vitimas-container');
        container.appendChild(criarLinha('vitima'));
    }

    /**
     * Adiciona uma testemunha
     */
    function addTestemunha(tipo) {
        const container = document.getElementById(`testemunhas-${tipo}-container`);
        container.appendChild(criarLinha('testemunha'));
    }

    /**
     * Adiciona um policial
     */
    function addPolicial() {
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
        document.getElementById('policiais-container').appendChild(linha);
    }

    /**
     * Adiciona um réu
     */
    function addReu() {
        const reuContainer = document.createElement('div');
        reuContainer.className = 'reu-item';
        reuContainer.innerHTML = `
            <div class="linha">
                <input type="text" placeholder="Nome" class="nome">
                <input type="text" placeholder="Endereço" class="endereco">
                <div class="checkbox-container">
                    <input type="checkbox" id="intimado_reu_${Date.now()}" class="intimado">
                    <label for="intimado_reu_${Date.now()}">Intimado</label>
                </div>
                <button class="btn btn-danger remove-btn" onclick="this.closest('.reu-item').remove()">×</button>
            </div>
            <div class="linha">
                <select class="tipo-defesa">
                    <option value="defensoria" selected>Defensoria Pública</option>
                    <option value="particular">Advogado Particular</option>
                </select>
                <input type="text" placeholder="Nome do Advogado" class="nome-advogado" style="display: none;">
                <div class="checkbox-container">
                    <input type="checkbox" id="intimado_adv_${Date.now()}" class="intimado-advogado">
                    <label for="intimado_adv_${Date.now()}">Intimado</label>
                </div>
            </div>
        `;

        const tipoDefesaSelect = reuContainer.querySelector('.tipo-defesa');
        const nomeAdvogadoInput = reuContainer.querySelector('.nome-advogado');
        
        tipoDefesaSelect.addEventListener('change', function() {
            nomeAdvogadoInput.style.display = this.value === 'particular' ? 'block' : 'none';
        });

        const container = document.getElementById('reus-container');
        container.appendChild(reuContainer);
    }

    /**
     * Salva os dados do formulário
     */
    function salvarDados() {
        // Em uma implementação real, aqui salvaria os dados em algum tipo de armazenamento
        window.print();
    }

    /**
     * Limpa todos os dados do formulário
     */
    function limparFormulario() {
        if (confirm('Tem certeza que deseja limpar todos os dados?')) {
            // Limpar os containers dinâmicos
            ['assistente-acusacao-container', 'vitimas-container', 'testemunhas-mp-container', 'policiais-container', 
             'reus-container', 'testemunhas-defesa-container'].forEach(id => {
                const container = document.getElementById(id);
                if (container) container.innerHTML = '';
            });

            // Limpar as observações
            const obsMP = document.getElementById('observacoes-mp');
            const obsDefesa = document.getElementById('observacoes-defesa');
            if (obsMP) obsMP.value = '';
            if (obsDefesa) obsDefesa.value = '';

            // Limpar todos os checkboxes
            document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);

            // Limpar todos os campos de texto
            document.querySelectorAll('input[type="text"]').forEach(el => el.value = '');

            // Limpar os selects
            document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);

            // Limpar o campo de nome do advogado (se houver)
            document.querySelectorAll('.nome-advogado').forEach(el => {
                el.value = '';
                el.style.display = 'none';
            });

            // Limpar o checkbox de intimado do MP
            const intimadoMP = document.getElementById('intimado_mp');
            if (intimadoMP) intimadoMP.checked = false;
        }
    }

    // Interface pública do módulo
    return {
        init: init,
        addAssistenteAcusacao: addAssistenteAcusacao,
        addVitima: addVitima,
        addTestemunha: addTestemunha,
        addPolicial: addPolicial,
        addReu: addReu,
        salvarDados: salvarDados,
        limparFormulario: limparFormulario
    };
})();

// Inicializar o módulo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    AudienciaModule.init();
});

// Expor funções globalmente para uso na interface
window.addAssistenteAcusacao = AudienciaModule.addAssistenteAcusacao;
window.addVitima = AudienciaModule.addVitima;
window.addTestemunha = AudienciaModule.addTestemunha;
window.addPolicial = AudienciaModule.addPolicial;
window.addReu = AudienciaModule.addReu;
window.salvarDados = AudienciaModule.salvarDados;
window.limparFormulario = AudienciaModule.limparFormulario;
