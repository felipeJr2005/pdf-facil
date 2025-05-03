document.addEventListener('DOMContentLoaded', function() {
    // Inicialização do editor
    const editor = document.getElementById('editor');
    const buttons = document.querySelectorAll('.toolbar button');
    const fontSizeSelect = document.getElementById('fontSize');
    
    // Limpando o texto inicial
    editor.addEventListener('focus', function() {
        if (editor.textContent === 'Digite seu texto aqui...') {
            editor.textContent = '';
        }
    });

    // Implementação dos botões da barra de ferramentas
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const command = this.id;
            
            switch(command) {
                case 'save':
                    saveContent();
                    break;
                case 'load':
                    loadContent();
                    break;
                case 'clear':
                    clearContent();
                    break;
                default:
                    document.execCommand(command, false, null);
            }
        });
    });

    // Implementação do seletor de tamanho de fonte
    fontSizeSelect.addEventListener('change', function() {
        document.execCommand('fontSize', false, this.value);
    });

    // Funções de salvar, carregar e limpar
    function saveContent() {
        localStorage.setItem('editorContent', editor.innerHTML);
        alert('Conteúdo salvo com sucesso!');
    }

    function loadContent() {
        const savedContent = localStorage.getItem('editorContent');
        if (savedContent) {
            editor.innerHTML = savedContent;
        } else {
            alert('Nenhum conteúdo salvo encontrado.');
        }
    }

    function clearContent() {
        if (confirm('Tem certeza que deseja limpar todo o conteúdo?')) {
            editor.innerHTML = '<p>Digite seu texto aqui...</p>';
        }
    }

    // Implementação dos botões de ação
    const btnCumprirAudiencia = document.getElementById('btn-cumprir-audiencia');
    const btnCartaGuia = document.getElementById('btn-carta-guia');
    const conteudoDinamico = document.getElementById('conteudo-dinamico');

    btnCumprirAudiencia.addEventListener('click', function() {
        conteudoDinamico.style.display = 'block';
        conteudoDinamico.innerHTML = '<h2>Cumprir Audiência</h2><p>O conteúdo do botão "Cumprir Audiência" será exibido aqui.</p>';
    });

    btnCartaGuia.addEventListener('click', function() {
        conteudoDinamico.style.display = 'block';
        conteudoDinamico.innerHTML = '<h2>Carta Guia</h2><p>O conteúdo do botão "Carta Guia" será exibido aqui.</p>';
    });
});
