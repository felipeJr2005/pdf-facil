/**
 * Módulo principal para o Resumidor Jurídico
 */
const NotasModule = (function() {
    // Referências para elementos da página
    let prompt, sentenca, temperatura, resultado, statusDiv, cacheStatsDiv, textoStatsDiv;
    
    /**
     * Inicializa o módulo e configura eventos
     */
    function init() {
        // Capturar referências aos elementos
        prompt = document.getElementById('prompt');
        sentenca = document.getElementById('sentenca');
        temperatura = document.getElementById('temperatura');
        resultado = document.getElementById('resultado');
        statusDiv = document.getElementById('status');
        cacheStatsDiv = document.getElementById('cache-stats');
        textoStatsDiv = document.getElementById('texto-stats');
        
        // Inicializar estatísticas do texto
        atualizarEstatisticasTexto();
        
        // Configurar handler para input no textarea
        sentenca.addEventListener('input', atualizarEstatisticasTexto);
        
        // Configurar botões para diferentes funções
        document.getElementById('btn-audiencia').addEventListener('click', abrirAudiencia);
        document.getElementById('btn-carta-guia').addEventListener('click', abrirCartaGuia);
        
        // Carregar dinamicamente os módulos necessários
        carregarModulos();
    }
    
    /**
     * Carrega módulos adicionais conforme necessário
     */
    function carregarModulos() {
        // Carregar módulos via script
        const carregarScript = (src) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve(); // Script já carregado
                    return;
                }
                
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`));
                document.head.appendChild(script);
            });
        };
        
        // Carregar os módulos necessários
        Promise.all([
            carregarScript('js/audiencia.js'),
            carregarScript('js/carta-guia.js')
        ]).catch(erro => {
            console.error('Erro ao carregar módulos:', erro);
        });
    }
    
    /**
     * Atualiza as estatísticas do texto
     */
    function atualizarEstatisticasTexto() {
        const texto = sentenca.value;
        UtilModule.atualizarEstatisticasTexto(texto, 'texto-stats');
    }
    
    /**
     * Limpa e otimiza o texto da sentença
     */
    function limparTextoSentenca() {
        const texto = sentenca.value;
        
        if (!texto.trim()) {
            UtilModule.mostrarNotificacao('Não há texto para limpar!', 'error');
            return;
        }
        
        // Obter estatísticas antes da limpeza
        const caracteresAntes = texto.length;
        const palavrasAntes = texto.split(/\s+/).filter(word => word.length > 0).length;
        
        // Limpar o texto
        const textoLimpo = UtilModule.limparTexto(texto);
        
        // Atualizar o texto no textarea
        sentenca.value = textoLimpo;
        
        // Obter estatísticas após a limpeza
        const caracteresDepois = textoLimpo.length;
        const palavrasDepois = textoLimpo.split(/\s+/).filter(word => word.length > 0).length;
        
        // Calcular redução
        const reducaoCaracteres = caracteresAntes - caracteresDepois;
        const percentualReducao = ((reducaoCaracteres / caracteresAntes) * 100).toFixed(1);
        
        // Atualizar estatísticas de texto
        atualizarEstatisticasTexto();
        
        // Mostrar resumo da limpeza
        statusDiv.innerHTML = `<span class="success">✅ Texto otimizado! Redução de ${reducaoCaracteres} caracteres (${percentualReducao}%)</span>`;
    }
    
    /**
     * Processa a sentença para extração de dados
     */
    async function processarSentenca() {
        const promptText = prompt.value.trim();
        const sentencaText = sentenca.value.trim();
        const temperaturaValue = parseFloat(temperatura.value);
        
        if (!sentencaText) {
            statusDiv.innerHTML = '<span class="error">⚠️ Por favor, insira a sentença judicial</span>';
            return;
        }

        // Verifica cache
        const cacheKey = `${UtilModule.hashTexto(promptText)}-${UtilModule.hashTexto(sentencaText)}-${temperaturaValue}`;
        if (UtilModule.cache.has(cacheKey)) {
            resultado.innerHTML = UtilModule.cache.get(cacheKey).resposta;
            statusDiv.innerHTML = '<span class="success">✔ Resposta recuperada do cache local</span>';
            return;
        }

        statusDiv.innerHTML = '<span class="loading">⌛ Processando documento...</span>';
        resultado.innerHTML = '';
        cacheStatsDiv.innerHTML = '';
        
        try {
            // 🔥 Substitua pela sua chave API
            const apiKey = "sk-0a164d068ee643099f9d3fc508e4e612";
            
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
                            content: "Você é um assistente jurídico especializado em extrair dados de sentenças judiciais."
                        },
                        {
                            role: "user",
                            content: `${promptText}\n\nTEXTO DA SENTENÇA:\n${sentencaText}`
                        }
                    ],
                    temperature: temperaturaValue,
                    max_tokens: 2000
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error?.message || `Erro ${response.status}`);
            }

            const resposta = data.choices[0].message.content;
            
            // Armazena no cache
            UtilModule.cache.set(cacheKey, {
                resposta: resposta,
                timestamp: Date.now()
            });

            resultado.innerHTML = resposta;
            statusDiv.innerHTML = '<span class="success">✅ Dados extraídos com sucesso</span>';
            
            // Mostra estatísticas de cache da API
            if (data.usage?.prompt_cache_hit_tokens > 0) {
                const percentual = (data.usage.prompt_cache_hit_tokens / 
                                 (data.usage.prompt_cache_hit_tokens + data.usage.prompt_cache_miss_tokens) * 100).toFixed(1);
                cacheStatsDiv.innerHTML = `<span class="cache-hit">✔ ${percentual}% dos tokens vieram do cache da DeepSeek (economia de custos)</span>`;
            } else {
                cacheStatsDiv.innerHTML = '<span class="cache-miss">✖ Nenhum cache hit na DeepSeek API</span>';
            }
            
        } catch (error) {
            console.error("Erro:", error);
            statusDiv.innerHTML = `<span class="error">❌ Erro: ${error.message}</span>`;
        }
    }
    
    /**
     * Abre a interface de Audiência em um modal
     */
    function abrirAudiencia() {
        UtilModule.carregarEmModal('audiencia.html', 'Cumprir Audiência');
    }
    
    /**
     * Abre a interface de Carta Guia em um modal
     */
    function abrirCartaGuia() {
        UtilModule.carregarEmModal('carta-guia.html', 'Carta Guia');
    }
    
    // Interface pública do módulo
    return {
        init: init,
        processarSentenca: processarSentenca,
        limparTextoSentenca: limparTextoSentenca
    };
})();

// Expor a função para uso global
window.processarSentenca = NotasModule.processarSentenca;
window.limparTextoSentenca = NotasModule.limparTextoSentenca;
