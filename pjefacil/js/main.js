document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos
    const editor = document.getElementById('editor');
    const btnAudiencia = document.getElementById('btn-audiencia');
    const btnDespacho = document.getElementById('btn-despacho');
    const btnConsulta = document.getElementById('btn-consulta');
    const contentDisplay = document.getElementById('content-display');
    
    // URLs dos conteúdos (nesse momento, são placeholders)
    const conteudos = {
        audiencia: 'components/audiencia.html',
        despacho: 'components/despacho.html',
        consulta: 'components/consulta.html'
    };
    
    // Função para carregar conteúdo
    function carregarConteudo(url) {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                contentDisplay.innerHTML = html;
                // Inicializa os scripts do componente se necessário
                const scripts = contentDisplay.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    document.body.appendChild(newScript);
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
    
    btnConsulta.addEventListener('click', function() {
        setActiveButton(this);
        carregarConteudo(conteudos.consulta);
    });
    
    // Função para definir o botão ativo
    function setActiveButton(button) {
        // Remove a classe active de todos os botões
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Adiciona a classe active ao botão clicado
        button.classList.add('active');
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
                };
                reader.readAsDataURL(blob);
            }
        }

        if (!isImagePasted) {
            const plainText = clipboardData.getData("text/plain");
            document.execCommand("insertText", false, plainText);
        }
    });
});
