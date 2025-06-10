// Configurações avançadas do sistema PDFFacil
const CONFIG = {
    // Qualidade de processamento (DPI)
    dpi: {
        low: 150,      // Para testes rápidos
        medium: 200,   // Padrão recomendado  
        high: 300      // Máxima qualidade
    },
    
    // Thresholds de qualidade
    quality: {
        high: 0.8,     // Acima disso = processamento leve
        medium: 0.6    // Abaixo disso = processamento pesado
    },
    
    // Configurações OpenCV
    opencv: {
        medianBlur: 3,
        adaptiveThreshold: {
            blockSize: 11,
            C: 2
        },
        clahe: {
            clipLimit: 2.0,
            tileSize: 8
        }
    },
    
    // Configurações de performance
    performance: {
        maxConcurrentPages: 1,  // Processar uma página por vez
        chunkSize: 5,           // Processar em blocos de 5 páginas
        memoryCleanupInterval: 10 // Limpar memória a cada 10 páginas
    },
    
    // Configurações de saída
    output: {
        jpegQuality: 0.92,      // Qualidade JPEG (0.1 a 1.0)
        pdfCompression: true,   // Comprimir PDF final
        includeMetadata: true   // Incluir metadados
    }
};

// Função para ajustar configurações
function updateConfig(newConfig) {
    Object.assign(CONFIG, newConfig);
    log('⚙️ Configurações atualizadas');
    console.log('Nova configuração:', CONFIG);
}

// Configurações específicas para tipos de documento
const DOCUMENT_PRESETS = {
    judicial: {
        dpi: CONFIG.dpi.medium,
        quality: { high: 0.75, medium: 0.55 },
        opencv: { medianBlur: 5, adaptiveThreshold: { blockSize: 15, C: 3 } }
    },
    
    scan_baixa: {
        dpi: CONFIG.dpi.high,
        quality: { high: 0.85, medium: 0.65 },
        opencv: { medianBlur: 7, adaptiveThreshold: { blockSize: 19, C: 4 } }
    },
    
    foto_celular: {
        dpi: CONFIG.dpi.high,
        quality: { high: 0.9, medium: 0.7 },
        opencv: { medianBlur: 9, adaptiveThreshold: { blockSize: 23, C: 5 } }
    }
};

// Aplicar preset específico
function applyPreset(presetName) {
    if (DOCUMENT_PRESETS[presetName]) {
        updateConfig(DOCUMENT_PRESETS[presetName]);
        log(`📋 Preset aplicado: ${presetName}`);
    } else {
        log(`❌ Preset '${presetName}' não encontrado`);
    }
}

// Aguardar OpenCV estar realmente pronto
function waitForOpenCV() {
    return new Promise((resolve) => {
        const checkCV = () => {
            if (window.openCVReady && typeof cv !== 'undefined') {
                console.log('🔬 OpenCV validado e funcional!');
                resolve(true);
            } else {
                setTimeout(checkCV, 100);
            }
        };
        checkCV();
    });
}
