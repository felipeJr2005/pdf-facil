// resumir_sentenca.js
// Módulo especializado em resumir sentenças judiciais
class ResumoSentenca {
    constructor() {
        // Padrões de regex para identificar seções importantes
        this.padroesImportantes = {
            processo: [
                /Processo\s*n[º°]?\s*([\d./\-]+)/i,
                /Autos\s*n[º°]?\s*([\d./\-]+)/i,
                /Número\s*dos\s*Autos:\s*([\d./\-]+)/i
            ],
            inquerito: [
                /Inquérito(?:\s*Policial)?(?:\s*n[º°]?\s*|\s*:)?\s*([\d\/]+)/i,
                /Inquérito:\s*([\d\/]+)/i,
                /IPL\s*(?:n[º°]?)?\s*([\d\/]+)/i
            ],
            orgaoJudiciario: [
                /Órgão\s*Judiciário:\s*([^\n]+)/i,
                /Vara(?:\s*Criminal)?[:\s]*([^\n]+)/i,
                /Comarca\s*de\s*([A-Za-zÀ-ÿ\s-]+)/i
            ],
            cabeçalho: [
                /Tribunal\s*de\s*Justiça/i,
                /Comarca\s*de\s*[A-Za-zÀ-ÿ\s]+/i
            ],
            reu: [
                /Réu:\s*([^\n]+)/i,
                /Nome:\s*([^\n]+)/i,
                /Denunciado[:\s]*([^\n]+)/i,
                /Acusado[:\s]*([^\n]+)/i,
                /SENTENCIADO[:\s]*([^\n]+)/i,
                /AUTOR\s*DO\s*FATO[:\s]*([^\n]+)/i
            ],
            dispositivo: [
                /Dispositivo[:]*\s*(.+?)(?=Pena:|$)/is,
                /Decisão[:]*\s*(.+?)(?=Pena:|$)/is,
                /JULGO\s+(PROCEDENTE|PARCIALMENTE PROCEDENTE|IMPROCEDENTE)\s+/i,
                /Sentença:\s*([^\n]+)/i
            ],
            pena: [
                /Pena:\s*(.+?)(?=Regime|$)/is,
                /Condenado\s*a\s*(.+?)(?=Regime|$)/is,
                /(\d+)\s+(ano|anos|mês|meses|dia|dias)\s+(?:e\s+(\d+)\s+(mês|meses|dia|dias))?/i
            ],
            artigo: [
                /Art(?:igo)?\.?\s*(\d+[^\n,]+)/i,
                /Lei\s*n[º°]?\s*(\d+[^\n,]+)/i,
                /CP,\s*art(?:igo)?\.?\s*(\d+[^\n,]+)/i,
                /Infração\s*Imputada:\s*([^\n]+)/i
            ],
            regime: [
                /Regime:\s*([A-Za-zÀ-ÿ\s-]+)/i,
                /regime\s*(fechado|semi[\s-]?aberto|aberto)/i
            ],
            dataPrisao: [
                /Data\s*da\s*Prisão:\s*([\d\/]+)/i,
                /Foi\s*preso\s*em\s*([\d\/]+)/i
            ],
            dataSoltura: [
                /Data\s*da\s*Soltura:\s*([\d\/]+)/i,
                /Foi\s*solto\s*em\s*([\d\/]+)/i
            ],
            datas: [
                /Data\s*d[aeo]\s*([^:]+):\s*([\d\/]+)/gi,
                /Data\s*([^:]+):\s*([\d\/]+)/gi
            ]
        };
    }

    // Método para extrair seções específicas
    extrairSecao(texto, secao) {
        const padroes = this.padroesImportantes[secao];
        
        for (const padrao of padroes) {
            const match = texto.match(padrao);
            if (match) {
                // Retorna o primeiro grupo de captura ou toda a correspondência
                return match[1] || match[0];
            }
        }
        
        return null;
    }

    // Método principal para resumir sentença
    resumir(texto) {
        if (!texto || texto.trim() === '') {
            return '';
        }
        
        let resumo = '';
        
        // Extrair processo
        const processo = this.extrairSecao(texto, 'processo');
        if (processo) resumo += `Processo: ${processo}\n\n`;
        
        // Extrair cabeçalho
        const cabeçalho = this.extrairSecao(texto, 'cabeçalho');
        if (cabeçalho) resumo += `${cabeçalho}\n\n`;
        
        // Extrair réu
        const reu = this.extrairSecao(texto, 'reu');
        if (reu) resumo += `Réu: ${reu}\n\n`;
        
        // Extrair artigos
        const artigos = this.extrairSecao(texto, 'artigo');
        if (artigos) resumo += `Artigos: ${artigos}\n\n`;
        
        // Extrair dispositivo
        const dispositivo = this.extrairSecao(texto, 'dispositivo');
        if (dispositivo) resumo += `Dispositivo: ${dispositivo}\n\n`;
        
        // Extrair pena
        const pena = this.extrairSecao(texto, 'pena');
        if (pena) resumo += `Pena: ${pena}\n\n`;
        
        // Extrair datas importantes
        const datasMatch = [...texto.matchAll(this.padroesImportantes.datas)];
        if (datasMatch && datasMatch.length > 0) {
            for (const match of datasMatch) {
                if (match[1] && match[2]) {
                    resumo += `Data ${match[1].trim()}: ${match[2].trim()}\n`;
                }
            }
        }
        
        return resumo.trim();
    }

    // Método para validar se o resumo é válido
    validarResumo(resumo) {
        if (!resumo || resumo.trim() === '') {
            return false;
        }
        
        // Critérios mínimos para um resumo válido
        const criterios = [
            resumo.includes('Processo'),
            resumo.includes('Réu'),
            resumo.includes('Artigos'),
            resumo.includes('Dispositivo'),
            resumo.includes('Pena'),
            resumo.includes('Data')
        ];
        
        return criterios.filter(Boolean).length >= 3;
    }
}

// Exportar para uso em navegador e módulos
if (typeof window !== 'undefined') {
    window.ResumoSentenca = ResumoSentenca;
}

export default ResumoSentenca;
