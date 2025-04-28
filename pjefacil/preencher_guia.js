// preencher_guia.js
// Módulo para processamento e preenchimento automático de formulário jurídico

class PreencherGuia {
    constructor() {
        this.camposMapeados = {
            'Processo': 'numeroProcesso',
            'Réu': 'nomeReu',
            'Artigos': 'artigo',
            'Pena': 'tempoPena',
            'Dispositivo': 'decisao'
        };

        // Mapeamento para campos específicos
        this.mapeamentoCampos = {
            'dataInfracao': [
                /data\s*(?:da)?\s*(?:infração|delito)/i,
                /ocorrência\s*(?:do)?\s*crime/i
            ],
            'dataRecebimentoDenuncia': [
                /recebimento\s*(?:da)?\s*den[úu]ncia/i,
                /data\s*da\s*den[úu]ncia/i
            ],
            'dataPublicacaoSentenca': [
                /data\s*(?:da)?\s*publica[çc][aã]o\s*(?:da)?\s*senten[çc]a/i
            ],
            'lei': [
                /(?:Lei|Código)\s*(?:Penal)?/i
            ]
        };

        // Padrões para detecção de regime prisional
        this.regimesPrisionais = {
            'fechado': ['regime fechado', 'prisão em regime fechado'],
            'semiaberto': ['regime semiaberto', 'prisão em regime semiaberto'],
            'aberto': ['regime aberto', 'prisão em regime aberto']
        };

        // Padrões para checkbox
        this.checkboxPatterns = {
            'crimeTentado': ['crime tentado', 'tentativa de crime'],
            'violenciaDomestica': ['violência doméstica', 'lei maria da penha'],
            'resultadoMorte': ['resultado morte', 'seguido de morte'],
            'violenciaGraveAmeaca': ['violência grave ameaça', 'grave ameaça'],
            'reincidenteComum': ['reincidente comum', 'reincidência'],
            'reincidenteEspecifico': ['reincidente específico'],
            'comandoOrganizacao': ['comando organização criminosa', 'organização criminosa']
        };
    }

    // Método principal para processar resumo e preencher formulário
    processarResumo(textoResumo) {
        if (!textoResumo || textoResumo.trim() === '') {
            alert('O texto do resumo está vazio.');
            return;
        }
        
        // Validar o resumo
        let resumoValidado = textoResumo;
        
        // Importar ResumoSentenca de forma dinâmica se não estiver disponível
        if (typeof ResumoSentenca !== 'undefined') {
            const resumidor = new ResumoSentenca();
            if (!resumidor.validarResumo(textoResumo)) {
                resumoValidado = resumidor.resumir(textoResumo);
            }
        }

        // Campos a serem preenchidos
        const camposPreenchidos = [];

        // Preencher campos mapeados
        Object.entries(this.camposMapeados).forEach(([padrao, campoId]) => {
            const campo = document.getElementById(campoId);
            if (campo) {
                const regex = new RegExp(`${padrao}:\\s*(.+)`, 'i');
                const match = resumoValidado.match(regex);
                
                if (match) {
                    campo.value = match[1].trim();
                    camposPreenchidos.push(campo);
                }
            }
        });

        // Preencher campos por padrões flexíveis
        Object.entries(this.mapeamentoCampos).forEach(([campoId, padroes]) => {
            const campo = document.getElementById(campoId);
            if (campo) {
                padroes.some(padrao => {
                    const regex = new RegExp(`${padrao}[:\\s]*([\\d/]+)`, 'i');
                    const match = resumoValidado.match(regex);
                    
                    if (match) {
                        campo.value = match[1].trim();
                        camposPreenchidos.push(campo);
                        return true;
                    }
                    return false;
                });
            }
        });

        // Preencher checkboxes
        Object.entries(this.checkboxPatterns).forEach(([checkboxId, padroes]) => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                const encontrado = padroes.some(padrao => 
                    resumoValidado.toLowerCase().includes(padrao.toLowerCase())
                );
                
                if (encontrado) {
                    checkbox.checked = true;
                    camposPreenchidos.push(checkbox);
                }
            }
        });

        // Detectar regime prisional
        const campoRegime = document.getElementById('regimePrisional');
        if (campoRegime) {
            Object.entries(this.regimesPrisionais).some(([valor, padroes]) => {
                const encontrado = padroes.some(padrao => 
                    resumoValidado.toLowerCase().includes(padrao.toLowerCase())
                );
                
                if (encontrado) {
                    campoRegime.value = valor;
                    camposPreenchidos.push(campoRegime);
                    return true;
                }
                return false;
            });
        }

        // Destacar campos preenchidos
        this.destacarCamposPreenchidos(camposPreenchidos);

        // Log de depuração
        console.log('Campos preenchidos:', camposPreenchidos.map(c => c.id));

        // Notificação de preenchimento
        this.notificarPreenchimento(camposPreenchidos.length);
    }

    // Método para destacar campos preenchidos
    destacarCamposPreenchidos(campos) {
        // Adicionar estilo CSS se não existir
        if (!document.getElementById('campo-preenchido-estilo')) {
            const estilo = document.createElement('style');
            estilo.id = 'campo-preenchido-estilo';
            estilo.textContent = `
                .campo-preenchido-auto {
                    background-color: #e8f5e9 !important;
                    border-color: #4CAF50 !important;
                    transition: background-color 0.3s ease;
                }
            `;
            document.head.appendChild(estilo);
        }

        campos.forEach(campo => {
            campo.classList.add('campo-preenchido-auto');
            
            // Evento para remover destaque quando editado
            const removeDestaque = () => campo.classList.remove('campo-preenchido-auto');
            
            if (campo.type === 'checkbox') {
                campo.addEventListener('change', removeDestaque, {once: true});
            } else {
                campo.addEventListener('input', removeDestaque, {once: true});
            }
        });
    }

    // Método para notificar preenchimento
    notificarPreenchimento(quantidadeCampos) {
        // Remover toast existente, se houver
        const toastExistente = document.getElementById('toast-notificacao');
        if (toastExistente) {
            document.body.removeChild(toastExistente);
        }

        const toast = document.createElement('div');
        toast.id = 'toast-notificacao';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = '#4CAF50';
        toast.style.color = 'white';
        toast.style.padding = '15px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        toast.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        toast.textContent = `Preenchimento automático concluído. ${quantidadeCampos} campos atualizados.`;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    }

    // Método de inicialização
    iniciar() {
        const botaoPreenchimento = document.getElementById('preencherAutomatico');
        if (botaoPreenchimento) {
            botaoPreenchimento.addEventListener('click', () => {
                const resumoField = document.getElementById('resumo');
                const resumoTexto = resumoField.innerText || resumoField.textContent;

                if (!resumoTexto.trim()) {
                    alert('O campo de resumo está vazio. Preencha o resumo primeiro.');
                    return;
                }

                this.processarResumo(resumoTexto);
            });
        }
    }
}

// Exportar e inicializar globalmente
if (typeof window !== 'undefined') {
    window.PreencherGuia = PreencherGuia;
    
    document.addEventListener('DOMContentLoaded', () => {
        const preencherGuia = new PreencherGuia();
        window.preencherGuia = preencherGuia;
        preencherGuia.iniciar();
    });
}

export default PreencherGuia;
