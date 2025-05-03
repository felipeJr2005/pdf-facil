document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos
    const editor = document.getElementById('editor');
    const editorPlaceholder = document.getElementById('editor-placeholder');
    const btnAudiencia = document.getElementById('btn-audiencia');
    const btnDespacho = document.getElementById('btn-despacho');
    const btnCartaGuia = document.getElementById('btn-carta-guia');
    const contentDisplay = document.getElementById('content-display');
    
    // URLs dos conteúdos
    const conteudos = {
        audiencia: 'audiencia.html',
        despacho: 'despacho.html',
        cartaGuia: 'carta-guia.html'
    };
    
    // Função para carregar conteúdo
    function carregarConteudo(url) {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                contentDisplay.innerHTML = html;
                
                // Inicializa os scripts do componente se necessário
                const scripts = Array.from(contentDisplay.querySelectorAll('script'));
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.body.appendChild(newScript);
                    script.remove(); // Remove o script original para evitar duplicação
                });
            })
            .catch(error => {
                contentDisplay.innerHTML = `<p>Erro ao carregar conteúdo: ${error.message}</p>`;
            });
    }
    
    // Event listeners para os botões
    btnAudiencia.addEventListener('click', function() {
        setActiveButton(this);
        carregarConteudo(conteudos.audiencia);
    });
    
    btnDespacho.addEventListener('click', function() {
        setActiveButton(this);
        carregarConteudo(conteudos.despacho);
    });
    
    btnCartaGuia.addEventListener('click', function() {
        setActiveButton(this);
        carregarConteudo(conteudos.cartaGuia);
    });
    
    // Função para definir o botão ativo
    function setActiveButton(button) {
        // Remove a classe active de todos os botões
        document.querySelectorAll('.btn-primary').forEach(btn => {
            btn.classList.remove('active');
        });
        // Adiciona a classe active ao botão clicado
        button.classList.add('active');
    }
    
    // Placeholder do editor
    editor.addEventListener('focus', function() {
        editorPlaceholder.style.display = 'none';
    });
    
    editor.addEventListener('blur', function() {
        if (editor.innerHTML.trim() === '') {
            editorPlaceholder.style.display = 'block';
        }
    });
    
    // Verificar se o editor já tem conteúdo ao carregar a página
    if (editor.innerHTML.trim() !== '') {
        editorPlaceholder.style.display = 'none';
    }
    
    // Manipulação de cola de texto e imagens
    editor.addEventListener('paste', function(event) {
        event.preventDefault();
        const clipboardData = event.clipboardData;
        const items = clipboardData.items;
        let isImagePasted = false;

        for (const item of items) {
            if (item.type.startsWith("image")) {
                isImagePasted = true;
                const blob = item.getAsFile();
                const reader = new FileReader();

                reader.onload = function(event) {
                    const img = document.createElement("img");
                    img.src = event.target.result;
                    img.style.maxWidth = '100%';

                    const selection = window.getSelection();
                    const range = selection.getRangeAt(0);
                    range.insertNode(img);
                    range.insertNode(document.createElement("br"));
                    
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Ocultar o placeholder quando houver conteúdo
                    editorPlaceholder.style.display = 'none';
                };
                reader.readAsDataURL(blob);
            }
        }

        if (!isImagePasted) {
            const plainText = clipboardData.getData("text/plain");
            document.execCommand("insertText", false, plainText);
            
            // Ocultar o placeholder quando houver conteúdo
            if (plainText.trim() !== '') {
                editorPlaceholder.style.display = 'none';
            }
        }
    });
});
