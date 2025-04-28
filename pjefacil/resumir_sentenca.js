// resumir_sentenca.js
// Módulo especializado em resumir sentenças judiciais
class ResumoSentenca {
    constructor() {
        // Padrões para identificação de seções importantes
        this.secoesPrincipais = [
            'cabeçalho',
            'qualificação do réu',
            'dispositivo',
            'pena aplicada',
            'decisão final'
        ];
        // Padrões de regex para identificar seções importantes
        this.padroesImportantes = {
            cabeçalho: [
                /Tribunal\s*de\s*Justiça/i,
                /Processo\s*n[º°]?\s*[\d./\-]+/i,
                /Comarca\s*de\s*[A-Za-zÀ-ÿ\s]+/i
            ],
            reu: [
                /Réu:\s*([^\n]+)/i,
                /Denunciado[:\s]*([^\n]+)/i
            ],
            dispositivo: [
                /Dispositivo[:]*\s*(.+?)(?=Pena:|$)/is,
                /Decisão[:]*\s*(.+?)(?=Pena:|$)/is
            ],
            pena: [
                /Pena:\s*(.+?)(?=Regime|$)/is,
                /Condenado\s*a\s*(.+?)(?=Regime|$)/is
            ],
            artigo: [
                /Art(?:igo)?\.?\s*(\d+[^\n,]+)/i,
                /Lei\s*n[º°]?\s*(\d+[^\n,]+)/i
            ]
        };
    }
    // Método principal para resumir sentença
    resumir(texto) {
        if (!texto || texto.trim() === '') {
            return '';
        }
        
        let resumo = '';
        // Extrair cabeçalho
        const cabeçalho = this.extrairSecao(texto, 'cabeçalho');
        if (cabeçalho) resumo += `${cabeçalho}\n\n`;
        // Extrair réu
        const reu = this.extrairSecao(texto, 'reu');
        if (reu) resumo += `${reu}\n\n`;
        // Extrair artigos
        const artigos = this.extrairSecao(texto, 'artigo');
        if (artigos) resumo += `Artigos: ${artigos}\n\n`;
        // Extrair dispositivo
        const dispositivo = this.extrairSecao(texto, 'dispositivo');
        if (dispositivo) resumo += `Dispositivo: ${dispositivo}\n\n`;
        // Extrair pena
        const pena = this.extrairSecao(texto, 'pena');
        if (pena) resumo += `Pena: ${pena}\n\n`;
        return resumo.trim();
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
            resumo.includes('Pena')
        ];
        return criterios.filter(Boolean).length >= 3;
    }
}

// Exportar para uso em navegador e módulos
if (typeof window !== 'undefined') {
    window.ResumoSentenca = ResumoSentenca;
}

export default ResumoSentenca;
