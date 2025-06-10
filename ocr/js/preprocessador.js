// ========================================
// PDFFacil - Processador v2.2 - OTIMIZADO
// ========================================

console.log("🔥 PROCESSADOR V3.1 MEGA-OTIMIZADO CARREGADO!");

// Configurações globais
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Variáveis do sistema
let pdfDocument = null;
let processedPages = [];
let stats = { totalPages: 0, processedPages: 0, startTime: null, universalOptimized: 0 };
let openCVReady = false;

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    log('🚀 PDFFacil - Sistema UNIVERSAL SEGURO v3.1 inicializado');
    log('🔧 Aplicando APENAS otimizações seguras em TODAS as páginas');
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
                log('✅ OpenCV UNIVERSAL SEGURO v3.1 carregado e pronto!');
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

    log('🔄 Iniciando processamento UNIVERSAL SEGURO v3.1...');
    
    document.getElementById('progressArea').style.display = 'block';
    document.getElementById('resultsArea').style.display = 'none';
    document.getElementById('processBtn').disabled = true;

    processedPages = [];
    stats.processedPages = 0;
    stats.universalOptimized = 0;
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

        // Analisar qualidade da página (mantido para logs)
        const qualityScore = analyzePageQuality(canvas);
        
        // NOVA ESTRATÉGIA: Aplicar otimizações seguras em TODAS as páginas
        const processedCanvas = applyUniversalSafeOptimizations(canvas, qualityScore, pageNum);

        processedPages.push({
            pageNum,
            canvas: processedCanvas,
            quality: qualityScore
        });

        stats.processedPages++;
        stats.universalOptimized++;
        const processingTime = Date.now() - startTime;
        log(`✅ Página ${pageNum} otimizada em ${processingTime}ms (Qualidade: ${(qualityScore * 100).toFixed(1)}%)`);

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
// OTIMIZAÇÕES UNIVERSAIS SEGURAS
// ========================================

function applyUniversalSafeOptimizations(canvas, qualityScore, pageNum) {
    if (!openCVReady || typeof cv === 'undefined') {
        log(`⚠️ Página ${pageNum}: OpenCV indisponível - aplicando otimizações básicas`);
        return applyBasicSafeOptimizations(canvas);
    }
    
    try {
        log(`🔧 Página ${pageNum}: Aplicando otimizações UNIVERSAIS SEGURAS`);
        
        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        // TÉCNICA 1: UPSCALING 2x (SEMPRE SEGURO)
        const upscaled = new cv.Mat();
        cv.resize(gray, upscaled, new cv.Size(0, 0), 2.0, 2.0, cv.INTER_CUBIC);
        log(`📈 Página ${pageNum}: Upscaling 2x aplicado (melhora OCR)`);
        
        // TÉCNICA 2: AJUSTES SUTIS (CONTRASTE 105% + BRILHO +3)
        const adjusted = new cv.Mat();
        upscaled.convertTo(adjusted, -1, 1.05, 3); // Contraste 5% + brilho +3
        log(`🎨 Página ${pageNum}: Ajustes seguros aplicados (contraste +5%, brilho +3)`);
        
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
        adjusted.delete();
        final.delete();
        
        log(`✅ Página ${pageNum}: Otimizações UNIVERSAIS SEGURAS concluídas!`);
        return processedCanvas;
        
    } catch (error) {
        log(`❌ Página ${pageNum}: Erro OpenCV: ${error.message}`);
        return applyBasicSafeOptimizations(canvas);
    }
}

function applyBasicSafeOptimizations(canvas) {
    const processedCanvas = document.createElement('canvas');
    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;
    const ctx = processedCanvas.getContext('2d');
    
    // Aplicar apenas ajustes seguros via CSS
    ctx.filter = 'contrast(105%) brightness(103%)';
    ctx.drawImage(canvas, 0, 0);
    
    return processedCanvas;
}function applyBasicProcessing(canvas, level) {
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
    
    log(`🎉 Processamento UNIVERSAL SEGURO concluído em ${duration}s`);
    log(`📊 ${stats.processedPages} páginas processadas`);
    
    // Estatísticas simplificadas
    log(`📈 ═══ RELATÓRIO DE PROCESSAMENTO UNIVERSAL ═══`);
    log(`   └─ Páginas otimizadas com segurança: ${stats.universalOptimized}`);
    log(`   └─ Total de páginas melhoradas: ${stats.processedPages}`);
    
    document.getElementById('progressArea').style.display = 'none';
    document.getElementById('resultsArea').style.display = 'block';
}

async function baixarPDF() {
    if (processedPages.length === 0) {
        alert('Nenhuma página foi processada!');
        return;
    }

    log('📦 Gerando PDF otimizado universalmente...');
    
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
        const filename = `PDF_Universal_Seguro_${timestamp}.pdf`;
        
        pdf.save(filename);
        log(`✅ PDF universal seguro salvo: ${filename}`);
        
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
