// ========================================
// PDFFacil - Processador v2.4 - OTIMIZADO
// ========================================

console.log("🔥 PROCESSADOR V3.0 MEGA-OTIMIZADO CARREGADO!");

// Configurações globais
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Variáveis do sistema
let pdfDocument = null;
let processedPages = [];
let stats = { totalPages: 0, processedPages: 0, startTime: null, nativeOptimized: 0, lightProcessed: 0, fullProcessed: 0 };
let openCVReady = false;

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    log('🚀 PDFFacil - Sistema MEGA-OTIMIZADO v3.0 inicializado');
    log('🆕 Usando DETECTOR INTELIGENTE + OTIMIZAÇÃO UNIVERSAL v3.0');
    setupEventListeners();
    initializeOpenCV();
});

function setupEventListeners() {
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
}

function initializeOpenCV() {
    log('📦 Carregando OpenCV...');
    
    const checkOpenCV = () => {
        if (typeof cv !== 'undefined') {
            cv['onRuntimeInitialized'] = () => {
                openCVReady = true;
                log('✅ OpenCV MEGA-OTIMIZADO v3.0 carregado e pronto!');
            };
        } else {
            setTimeout(checkOpenCV, 100);
        }
    };
    checkOpenCV();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        alert('Por favor, selecione um arquivo PDF válido.');
        return;
    }

    log(`📄 PDF selecionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    const fileReader = new FileReader();
    fileReader.onload = function() {
        loadPDF(new Uint8Array(this.result));
    };
    fileReader.readAsArrayBuffer(file);
}

async function loadPDF(pdfData) {
    try {
        pdfDocument = await pdfjsLib.getDocument(pdfData).promise;
        stats.totalPages = pdfDocument.numPages;
        
        log(`📊 PDF carregado: ${pdfDocument.numPages} páginas`);
        document.getElementById('processBtn').disabled = false;
        
    } catch (error) {
        log(`❌ Erro ao carregar PDF: ${error.message}`);
        alert('Erro ao carregar o PDF. Verifique se o arquivo não está corrompido.');
    }
}

async function processarPDF() {
    if (!pdfDocument) {
        alert('Primeiro selecione um PDF!');
        return;
    }

    log('🔄 Iniciando processamento MEGA-OTIMIZADO v3.0...');
    
    document.getElementById('progressArea').style.display = 'block';
    document.getElementById('resultsArea').style.display = 'none';
    document.getElementById('processBtn').disabled = true;

    processedPages = [];
    stats.processedPages = 0;
    stats.nativeOptimized = 0;
    stats.lightProcessed = 0;
    stats.fullProcessed = 0;
    stats.startTime = Date.now();

    try {
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            await processPage(i);
            updateProgress(i, pdfDocument.numPages);
        }

        finalizarProcessamento();

    } catch (error) {
        log(`❌ Erro durante processamento: ${error.message}`);
        alert('Erro durante o processamento. Verifique o console.');
    }

    document.getElementById('processBtn').disabled = false;
}

async function processPage(pageNum) {
    log(`📄 Processando página ${pageNum}...`);
    const startTime = Date.now();

    try {
        const page = await pdfDocument.getPage(pageNum);
        const scale = 2;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Analisar qualidade da página
        const qualityScore = analyzePageQuality(canvas);
        
        // NOVA FUNÇÃO: Processamento inteligente otimizado
        const processedCanvas = applyIntelligentOptimization(canvas, qualityScore, pageNum);

        processedPages.push({
            pageNum,
            canvas: processedCanvas,
            quality: qualityScore
        });

        stats.processedPages++;
        const processingTime = Date.now() - startTime;
        log(`✅ Página ${pageNum} processada em ${processingTime}ms (Qualidade: ${(qualityScore * 100).toFixed(1)}%)`);

    } catch (error) {
        log(`❌ Erro na página ${pageNum}: ${error.message}`);
    }
}

function analyzePageQuality(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let sumBrightness = 0;
    let edgePixels = 0;
    let darkPixels = 0;
    let lightPixels = 0;
    let totalTextPixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        sumBrightness += brightness;
        
        if (brightness < 85) darkPixels++;
        if (brightness > 170) lightPixels++;
        if (brightness < 128) totalTextPixels++;
        
        if (i > canvas.width * 4) {
            const prevR = data[i - canvas.width * 4];
            const prevG = data[i - canvas.width * 4 + 1];
            const prevB = data[i - canvas.width * 4 + 2];
            const prevBrightness = (prevR + prevG + prevB) / 3;
            
            if (Math.abs(brightness - prevBrightness) > 25) {
                edgePixels++;
            }
        }
    }
    
    const totalPixels = data.length / 4;
    const avgBrightness = sumBrightness / totalPixels;
    const sharpnessRatio = edgePixels / totalPixels;
    const contrastRatio = Math.abs(darkPixels - lightPixels) / totalPixels;
    const textDensity = totalTextPixels / totalPixels;
    
    let qualityScore = 0.3;
    
    if (avgBrightness > 60 && avgBrightness < 180) qualityScore += 0.2;
    if (sharpnessRatio > 0.015) qualityScore += 0.25;
    else if (sharpnessRatio > 0.008) qualityScore += 0.1;
    if (contrastRatio > 0.3) qualityScore += 0.15;
    else if (contrastRatio > 0.15) qualityScore += 0.05;
    if (textDensity > 0.15) qualityScore += 0.15;
    else if (textDensity > 0.05) qualityScore += 0.1;
    else qualityScore -= 0.2;
    
    if (avgBrightness < 30 || avgBrightness > 220) qualityScore -= 0.2;
    
    return Math.min(0.95, Math.max(0.15, qualityScore));
}

// ========================================
// DETECTOR INTELIGENTE CALIBRADO
// ========================================

function detectDocumentType(canvas, qualityScore) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Análise de características técnicas
    const textSharpness = detectTextSharpness(data, canvas.width, canvas.height);
    const colorVariation = detectColorVariation(data);
    
    // Detecção de padrões visuais específicos (CALIBRADOS)
    const hasPJePattern = detectPJePattern(canvas);
    const hasBNMPPattern = detectBNMPPattern(canvas);
    const hasEmailPattern = detectEmailPattern(canvas);
    
    return classifyDocumentType({
        textSharpness,
        colorVariation,
        hasPJePattern,
        hasBNMPPattern,
        hasEmailPattern,
        qualityScore
    });
}

function detectTextSharpness(data, width, height) {
    let sharpEdges = 0;
    let totalEdges = 0;
    
    for (let i = width * 4; i < data.length - width * 4; i += 4) {
        const current = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const above = (data[i - width * 4] + data[i - width * 4 + 1] + data[i - width * 4 + 2]) / 3;
        
        const gradient = Math.abs(current - above);
        
        if (gradient > 30) {
            totalEdges++;
            if (gradient > 100) {
                sharpEdges++;
            }
        }
    }
    
    return totalEdges > 0 ? sharpEdges / totalEdges : 0;
}

function detectColorVariation(data) {
    let colorVariations = 0;
    const sampleSize = Math.min(data.length, 10000);
    
    for (let i = 0; i < sampleSize; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const variation = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
        if (variation > 15) {
            colorVariations++;
        }
    }
    
    return colorVariations / (sampleSize / 16);
}

function detectPJePattern(canvas) {
    // CALIBRADO: Detector mais específico para PJe
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 600), Math.min(canvas.height, 300));
    
    let specificBluePixels = 0;
    let pjeHeaderPattern = 0;
    let structuredElements = 0;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        
        // MAIS ESPECÍFICO: Tom de azul muito específico do PJe
        if (b > 150 && b > r + 50 && b > g + 30 && r < 100 && g < 120) {
            specificBluePixels++;
        }
        
        // Detectar header estruturado do PJe
        if (b > 130 && r < 80 && g < 100) {
            pjeHeaderPattern++;
        }
        
        // Layout muito estruturado
        if (r > 240 && g > 240 && b > 240) {
            structuredElements++;
        }
    }
    
    // THRESHOLDS MAIS RESTRITIVOS
    const hasStrongBlueHeader = specificBluePixels > 500;
    const hasTypicalLayout = pjeHeaderPattern > 300 && structuredElements > 3000;
    
    return hasStrongBlueHeader && hasTypicalLayout;
}

function detectBNMPPattern(canvas) {
    // CALIBRADO: Detector mais específico para BNMP
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 500), Math.min(canvas.height, 400));
    
    let officialTextPattern = 0;
    let cleanWhiteBackground = 0;
    let formalStructure = 0;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        
        // Texto preto muito definido
        if (r < 30 && g < 30 && b < 30) {
            officialTextPattern++;
        }
        
        // Fundo branco muito limpo
        if (r > 250 && g > 250 && b > 250) {
            cleanWhiteBackground++;
        }
        
        // Estrutura formal (cinza claro para tabelas/borders)
        if (r > 200 && r < 240 && g > 200 && g < 240 && b > 200 && b < 240) {
            formalStructure++;
        }
    }
    
    // THRESHOLDS MAIS ESPECÍFICOS
    const hasOfficialFormat = officialTextPattern > 1000 && cleanWhiteBackground > 5000;
    const hasTypicalBNMPLayout = formalStructure > 200;
    
    return hasOfficialFormat && hasTypicalBNMPLayout;
}

function detectEmailPattern(canvas) {
    // CALIBRADO: Detector para emails/browser
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 700), Math.min(canvas.height, 200));
    
    let browserUIElements = 0;
    let emailInterface = 0;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        
        // Elementos típicos de interface (azul claro, cinza interface)
        if ((r > 220 && g > 230 && b > 250) || // Azul muito claro
            (r > 240 && g > 240 && b > 240 && r < 250)) { // Cinza interface
            browserUIElements++;
        }
        
        // Elementos de email (tons específicos de interface web)
        if (r > 200 && g > 210 && b > 230 && Math.abs(r-g) < 20) {
            emailInterface++;
        }
    }
    
    // THRESHOLD MAIS ESPECÍFICO
    return browserUIElements > 2000 && emailInterface > 500;
}

function classifyDocumentType(metrics) {
    const {
        textSharpness,
        colorVariation,
        hasPJePattern,
        hasBNMPPattern,
        hasEmailPattern,
        qualityScore
    } = metrics;
    
    // ========================================
    // NOVA LÓGICA: SEMPRE OTIMIZAR!
    // ========================================
    
    // 1. DOCUMENTOS NATIVOS (OTIMIZAÇÃO SUAVE)
    if (hasPJePattern) {
        return {
            type: 'PJE_NATIVE',
            shouldProcess: true,
            processingLevel: 'OPTIMIZED_NATIVE',
            confidence: 0.95,
            reason: 'PJe detectado - aplicar otimizações validadas'
        };
    }
    
    if (hasBNMPPattern) {
        return {
            type: 'BNMP_NATIVE',
            shouldProcess: true,
            processingLevel: 'OPTIMIZED_NATIVE',
            confidence: 0.90,
            reason: 'BNMP detectado - aplicar otimizações validadas'
        };
    }
    
    if (hasEmailPattern) {
        return {
            type: 'EMAIL_CONVERTED',
            shouldProcess: true,
            processingLevel: 'OPTIMIZED_NATIVE',
            confidence: 0.85,
            reason: 'Email detectado - aplicar otimizações validadas'
        };
    }
    
    // 2. DOCUMENTOS DE ALTA QUALIDADE (OTIMIZAÇÃO SUAVE)
    if (qualityScore > 0.7 && textSharpness > 0.8) {
        return {
            type: 'HIGH_QUALITY',
            shouldProcess: true,
            processingLevel: 'OPTIMIZED_NATIVE',
            confidence: 0.85,
            reason: 'Alta qualidade - aplicar otimizações suaves'
        };
    }
    
    // 3. QUALIDADE MÉDIA (PROCESSAMENTO MODERADO)
    if (qualityScore > 0.5 && qualityScore <= 0.7) {
        return {
            type: 'MEDIUM_QUALITY',
            shouldProcess: true,
            processingLevel: 'LIGHT',
            confidence: 0.80,
            reason: 'Qualidade média - processamento moderado'
        };
    }
    
    // 4. DOCUMENTOS DEGRADADOS (PROCESSAMENTO COMPLETO)
    if (qualityScore <= 0.5) {
        return {
            type: 'DEGRADED_SCAN',
            shouldProcess: true,
            processingLevel: 'FULL',
            confidence: 0.85,
            reason: 'Documento degradado - processamento completo'
        };
    }
    
    // 5. DEFAULT: OTIMIZAÇÃO SUAVE
    return {
        type: 'UNKNOWN',
        shouldProcess: true,
        processingLevel: 'OPTIMIZED_NATIVE',
        confidence: 0.60,
        reason: 'Tipo indefinido - aplicar otimizações básicas'
    };
}

// ========================================
// PROCESSAMENTO INTELIGENTE OTIMIZADO
// ========================================

function applyIntelligentOptimization(canvas, qualityScore, pageNum) {
    // 1. DETECTAR TIPO DE DOCUMENTO
    const documentType = detectDocumentType(canvas, qualityScore);
    
    log(`🔍 Página ${pageNum}: ${documentType.type} (${(documentType.confidence * 100).toFixed(1)}%)`);
    log(`📋 Página ${pageNum}: ${documentType.reason}`);
    
    // 2. APLICAR NÍVEL DE PROCESSAMENTO ADEQUADO
    let processedCanvas;
    
    switch (documentType.processingLevel) {
        case 'OPTIMIZED_NATIVE':
            log(`✨ Página ${pageNum}: OTIMIZAÇÕES VALIDADAS aplicadas`);
            processedCanvas = applyOptimizedNativeProcessing(canvas, pageNum);
            stats.nativeOptimized++;
            break;
            
        case 'LIGHT':
            log(`🔧 Página ${pageNum}: Processamento MODERADO aplicado`);
            processedCanvas = applyLightOpenCVProcessing(canvas, pageNum);
            stats.lightProcessed++;
            break;
            
        case 'FULL':
            log(`🔬 Página ${pageNum}: Processamento COMPLETO aplicado`);
            processedCanvas = applyFullOpenCVProcessing(canvas, pageNum);
            stats.fullProcessed++;
            break;
            
        default:
            log(`🔧 Página ${pageNum}: Processamento padrão aplicado`);
            processedCanvas = applyOptimizedNativeProcessing(canvas, pageNum);
            stats.nativeOptimized++;
    }
    
    return processedCanvas;
}

// ========================================
// NOVO: OTIMIZAÇÃO VALIDADA PARA NATIVOS
// ========================================

function applyOptimizedNativeProcessing(canvas, pageNum) {
    if (!openCVReady || typeof cv === 'undefined') {
        log(`⚠️ Página ${pageNum}: OpenCV indisponível - fallback para otimização básica`);
        return applyBasicOptimization(canvas);
    }
    
    try {
        log(`✨ Página ${pageNum}: Aplicando OTIMIZAÇÕES VALIDADAS`);
        
        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        // TÉCNICA 1: UPSCALING 2x (SEMPRE - melhora OCR)
        const upscaled = new cv.Mat();
        cv.resize(gray, upscaled, new cv.Size(0, 0), 2.0, 2.0, cv.INTER_CUBIC);
        log(`📈 Página ${pageNum}: Upscaling 2x aplicado (melhora OCR)`);
        
        // TÉCNICA 2: CLAHE MUITO SUAVE (realçar sem degradar)
        // Fallback: usar ajuste de contraste se CLAHE não disponível
        let enhanced;
        if (typeof cv.createCLAHE === 'function') {
            const clahe = cv.createCLAHE(1.2, new cv.Size(8, 8));
            enhanced = new cv.Mat();
            clahe.apply(upscaled, enhanced);
            log(`🌟 Página ${pageNum}: CLAHE suave aplicado (1.2)`);
        } else {
            enhanced = new cv.Mat();
            upscaled.convertTo(enhanced, -1, 1.2, 10); // Contraste 20% + brilho +10
            log(`🌟 Página ${pageNum}: Ajuste de contraste aplicado (fallback)`);
        }
        
        // TÉCNICA 3: AJUSTE SUTIL DE CONTRASTE (sem threshold agressivo)
        const adjusted = new cv.Mat();
        enhanced.convertTo(adjusted, -1, 1.1, 5); // Contraste 10% + brilho +5
        log(`🎨 Página ${pageNum}: Ajuste sutil de contraste aplicado`);
        
        // Redimensionar de volta ao tamanho original
        const final = new cv.Mat();
        cv.resize(adjusted, final, new cv.Size(canvas.width, canvas.height), 0, 0, cv.INTER_AREA);
        
        const processedCanvas = document.createElement('canvas');
        processedCanvas.width = canvas.width;
        processedCanvas.height = canvas.height;
        cv.imshow(processedCanvas, final);
        
        // Limpeza
        src.delete();
        gray.delete();
        upscaled.delete();
        enhanced.delete();
        adjusted.delete();
        final.delete();
        
        log(`✅ Página ${pageNum}: OTIMIZAÇÕES VALIDADAS concluídas!`);
        return processedCanvas;
        
    } catch (error) {
        log(`❌ Página ${pageNum}: Erro OpenCV: ${error.message}`);
        return applyBasicOptimization(canvas);
    }
}

function applyLightOpenCVProcessing(canvas, pageNum) {
    if (!openCVReady || typeof cv === 'undefined') {
        log(`⚠️ Página ${pageNum}: OpenCV indisponível - fallback para processamento básico`);
        return applyBasicProcessing(canvas, 'moderate');
    }
    
    try {
        log(`🔧 Página ${pageNum}: Aplicando OpenCV MODERADO`);
        
        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        // TÉCNICA 1: UPSCALING 2x
        const upscaled = new cv.Mat();
        cv.resize(gray, upscaled, new cv.Size(0, 0), 2.0, 2.0, cv.INTER_CUBIC);
        log(`📈 Página ${pageNum}: Upscaling 2x aplicado`);
        
        // TÉCNICA 2: CLAHE MODERADO
        // Fallback: usar ajuste de contraste se CLAHE não disponível
        let enhanced;
        if (typeof cv.createCLAHE === 'function') {
            const clahe = cv.createCLAHE(2.0, new cv.Size(8, 8));
            enhanced = new cv.Mat();
            clahe.apply(upscaled, enhanced);
            log(`🌟 Página ${pageNum}: CLAHE moderado aplicado`);
        } else {
            enhanced = new cv.Mat();
            upscaled.convertTo(enhanced, -1, 1.4, 15); // Contraste 40% + brilho +15
            log(`🌟 Página ${pageNum}: Ajuste moderado aplicado (fallback)`);
        }
        
        // TÉCNICA 3: THRESHOLD MODERADO
        const binary = new cv.Mat();
        cv.adaptiveThreshold(enhanced, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 19, 7);
        log(`🎯 Página ${pageNum}: Threshold moderado (19,7) aplicado`);
        
        // Redimensionar de volta
        const final = new cv.Mat();
        cv.resize(binary, final, new cv.Size(canvas.width, canvas.height), 0, 0, cv.INTER_AREA);
        
        const processedCanvas = document.createElement('canvas');
        processedCanvas.width = canvas.width;
        processedCanvas.height = canvas.height;
        cv.imshow(processedCanvas, final);
        
        // Limpeza
        src.delete();
        gray.delete();
        upscaled.delete();
        enhanced.delete();
        binary.delete();
        final.delete();
        
        log(`✅ Página ${pageNum}: OpenCV MODERADO concluído com sucesso!`);
        return processedCanvas;
        
    } catch (error) {
        log(`❌ Página ${pageNum}: Erro OpenCV: ${error.message}`);
        return applyBasicProcessing(canvas, 'moderate');
    }
}

function applyFullOpenCVProcessing(canvas, pageNum) {
    if (!openCVReady || typeof cv === 'undefined') {
        log(`⚠️ Página ${pageNum}: OpenCV indisponível - fallback para processamento avançado`);
        return applyBasicProcessing(canvas, 'heavy');
    }
    
    try {
        log(`🔬 Página ${pageNum}: Aplicando OpenCV COMPLETO`);
        
        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        // TÉCNICA 1: UPSCALING 3x AGRESSIVO
        const upscaled = new cv.Mat();
        cv.resize(gray, upscaled, new cv.Size(0, 0), 3.0, 3.0, cv.INTER_CUBIC);
        log(`📈 Página ${pageNum}: Upscaling 3x aplicado`);
        
        // TÉCNICA 2: CLAHE FORTE
        // Fallback: usar ajuste de contraste se CLAHE não disponível
        let enhanced;
        if (typeof cv.createCLAHE === 'function') {
            const clahe = cv.createCLAHE(3.0, new cv.Size(8, 8));
            enhanced = new cv.Mat();
            clahe.apply(upscaled, enhanced);
            log(`🌟 Página ${pageNum}: CLAHE forte aplicado`);
        } else {
            enhanced = new cv.Mat();
            upscaled.convertTo(enhanced, -1, 1.6, 20); // Contraste 60% + brilho +20
            log(`🌟 Página ${pageNum}: Ajuste forte aplicado (fallback)`);
        }
        
        // TÉCNICA 3: DENOISING
        const denoised = new cv.Mat();
        cv.medianBlur(enhanced, denoised, 3);
        log(`🧹 Página ${pageNum}: Denoising aplicado`);
        
        // TÉCNICA 4: THRESHOLD OTIMIZADO
        const binary = new cv.Mat();
        cv.adaptiveThreshold(denoised, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 15, 6);
        log(`🎯 Página ${pageNum}: Threshold forte (15,6) aplicado`);
        
        // Redimensionar de volta
        const final = new cv.Mat();
        cv.resize(binary, final, new cv.Size(canvas.width, canvas.height), 0, 0, cv.INTER_AREA);
        
        const processedCanvas = document.createElement('canvas');
        processedCanvas.width = canvas.width;
        processedCanvas.height = canvas.height;
        cv.imshow(processedCanvas, final);
        
        // Limpeza
        src.delete();
        gray.delete();
        upscaled.delete();
        enhanced.delete();
        denoised.delete();
        binary.delete();
        final.delete();
        
        log(`✅ Página ${pageNum}: OpenCV COMPLETO concluído com sucesso!`);
        return processedCanvas;
        
    } catch (error) {
        log(`❌ Página ${pageNum}: Erro OpenCV: ${error.message}`);
        return applyBasicProcessing(canvas, 'heavy');
    }
}

function applyBasicOptimization(canvas) {
    const processedCanvas = document.createElement('canvas');
    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;
    const ctx = processedCanvas.getContext('2d');
    
    // Otimizações básicas validadas
    ctx.filter = 'contrast(110%) brightness(102%) saturate(105%)';
    ctx.drawImage(canvas, 0, 0);
    
    return processedCanvas;
}

function applyBasicProcessing(canvas, level) {
    const processedCanvas = document.createElement('canvas');
    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;
    const ctx = processedCanvas.getContext('2d');
    
    if (level === 'moderate') {
        ctx.filter = 'contrast(125%) brightness(105%) saturate(110%)';
    } else {
        ctx.filter = 'contrast(200%) brightness(110%) saturate(0%)';
    }
    
    ctx.drawImage(canvas, 0, 0);
    return processedCanvas;
}

function updateProgress(current, total) {
    const percentage = (current / total) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = `Processando página ${current} de ${total} (${percentage.toFixed(1)}%)`;
}

function finalizarProcessamento() {
    const endTime = Date.now();
    const duration = ((endTime - stats.startTime) / 1000).toFixed(1);
    
    log(`🎉 Processamento OTIMIZADO concluído em ${duration}s`);
    log(`📊 ${stats.processedPages} páginas processadas`);
    
    // Estatísticas detalhadas de processamento
    log(`📈 ═══ RELATÓRIO DE PROCESSAMENTO OTIMIZADO ═══`);
    log(`   └─ Documentos NATIVOS otimizados: ${stats.nativeOptimized}`);
    log(`   └─ Processamento MODERADO aplicado: ${stats.lightProcessed}`);
    log(`   └─ Processamento COMPLETO aplicado: ${stats.fullProcessed}`);
    log(`   └─ Total de páginas melhoradas: ${stats.processedPages}`);
    
    document.getElementById('progressArea').style.display = 'none';
    document.getElementById('resultsArea').style.display = 'block';
}

async function baixarPDF() {
    if (processedPages.length === 0) {
        alert('Nenhuma página foi processada!');
        return;
    }

    log('📦 Gerando PDF otimizado...');
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        for (let i = 0; i < processedPages.length; i++) {
            if (i > 0) pdf.addPage();
            
            const page = processedPages[i];
            const jpegQuality = (typeof CONFIG !== 'undefined') ? CONFIG.output.jpegQuality : 0.92;
            const imgData = page.canvas.toDataURL('image/jpeg', jpegQuality);
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
        
        const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
        const filename = `PDF_Otimizado_${timestamp}.pdf`;
        
        pdf.save(filename);
        log(`✅ PDF otimizado salvo: ${filename}`);
        
    } catch (error) {
        log(`❌ Erro ao gerar PDF: ${error.message}`);
        alert('Erro ao gerar PDF final.');
    }
}

function reiniciar() {
    pdfDocument = null;
    processedPages = [];
    stats = { totalPages: 0, processedPages: 0, startTime: null, nativeOptimized: 0, lightProcessed: 0, fullProcessed: 0 };
    
    document.getElementById('fileInput').value = '';
    document.getElementById('processBtn').disabled = true;
    document.getElementById('progressArea').style.display = 'none';
    document.getElementById('resultsArea').style.display = 'none';
    document.getElementById('logContent').innerHTML = '';
    
    log('🔄 Sistema MEGA-OTIMIZADO v3.0 reiniciado');
}

function log(message) {
    const logContent = document.getElementById('logContent');
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.textContent = `[${timestamp}] ${message}`;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
    console.log(message);
}
