// Configurações globais
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Variáveis do sistema
let pdfDocument = null;
let processedPages = [];
let stats = { totalPages: 0, processedPages: 0, startTime: null };
let openCVReady = false;

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    log('🚀 PDFFacil - Sistema inicializado');
    setupEventListeners();
    initializeOpenCV();
});

function setupEventListeners() {
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
}

function initializeOpenCV() {
    log('📦 Carregando OpenCV...');
    
    // Aguardar OpenCV estar disponível
    const checkOpenCV = () => {
        if (typeof cv !== 'undefined') {
            cv['onRuntimeInitialized'] = () => {
                openCVReady = true;
                log('✅ OpenCV carregado e pronto!');
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

    log('🔄 Iniciando processamento...');
    
    // Mostrar área de progresso
    document.getElementById('progressArea').style.display = 'block';
    document.getElementById('resultsArea').style.display = 'none';
    document.getElementById('processBtn').disabled = true;

    // Resetar dados
    processedPages = [];
    stats.processedPages = 0;
    stats.startTime = Date.now();

    try {
        // Processar cada página
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            await processPage(i);
            updateProgress(i, pdfDocument.numPages);
        }

        // Finalizar
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
        const scale = 2; // 144 DPI para boa qualidade
        const viewport = page.getViewport({ scale });

        // Canvas para renderizar a página
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Renderizar página no canvas
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Analisar qualidade da página
        const qualityScore = analyzePageQuality(canvas);
        
        // Aplicar pré-processamento baseado na qualidade
        const processedCanvas = applyPreprocessing(canvas, qualityScore, pageNum);

        // Armazenar resultado
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
        if (brightness < 128) totalTextPixels++; // Pixels que podem ser texto
        
        // Detectar bordas para medir nitidez
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
    
    // Calcular score de qualidade
    let qualityScore = 0.3;
    
    // Avaliar brilho
    if (avgBrightness > 60 && avgBrightness < 180) qualityScore += 0.2;
    
    // Avaliar nitidez
    if (sharpnessRatio > 0.015) qualityScore += 0.25;
    else if (sharpnessRatio > 0.008) qualityScore += 0.1;
    
    // Avaliar contraste
    if (contrastRatio > 0.3) qualityScore += 0.15;
    else if (contrastRatio > 0.15) qualityScore += 0.05;
    
    // Avaliar densidade de conteúdo (NOVO)
    if (textDensity > 0.15) qualityScore += 0.15;  // Página com bastante conteúdo
    else if (textDensity > 0.05) qualityScore += 0.1;   // Página com conteúdo médio
    else qualityScore -= 0.2;  // Página quase vazia (como página 17)
    
    // Penalizar extremos
    if (avgBrightness < 30 || avgBrightness > 220) qualityScore -= 0.2;
    
    return Math.min(0.95, Math.max(0.15, qualityScore));
}

function applyPreprocessing(canvas, qualityScore, pageNum) {
    if (qualityScore >= 0.8) {
        return applyLightProcessing(canvas);
    } else if (qualityScore >= 0.6) {
        return applyModerateProcessing(canvas);
    } else {
        log(`🔧 Página ${pageNum}: OpenCV - Processamento avançado aplicado (qualidade baixa)`);
        return applyHeavyProcessing(canvas);
    }
}

function applyLightProcessing(canvas) {
    const processedCanvas = document.createElement('canvas');
    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;
    const ctx = processedCanvas.getContext('2d');
    
    ctx.filter = 'contrast(110%) brightness(102%)';
    ctx.drawImage(canvas, 0, 0);
    
    return processedCanvas;
}

function applyModerateProcessing(canvas) {
    const processedCanvas = document.createElement('canvas');
    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;
    const ctx = processedCanvas.getContext('2d');
    
    ctx.filter = 'contrast(125%) brightness(105%) saturate(110%)';
    ctx.drawImage(canvas, 0, 0);
    
    return processedCanvas;
}

function applyHeavyProcessing(canvas) {
    if (openCVReady && typeof cv !== 'undefined') {
        return applyOpenCVProcessing(canvas);
    } else {
        log('⚠️ OpenCV não disponível - usando processamento básico avançado');
        return applyBasicHeavyProcessing(canvas);
    }
}

function applyOpenCVProcessing(canvas) {
    try {
        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        const blurred = new cv.Mat();
        const binary = new cv.Mat();
        
        // Pipeline OpenCV validado
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        // Usar configurações do CONFIG se disponível
        const medianBlurSize = (typeof CONFIG !== 'undefined') ? CONFIG.opencv.medianBlur : 3;
        const blockSize = (typeof CONFIG !== 'undefined') ? CONFIG.opencv.adaptiveThreshold.blockSize : 11;
        const cValue = (typeof CONFIG !== 'undefined') ? CONFIG.opencv.adaptiveThreshold.C : 2;
        
        cv.medianBlur(gray, blurred, medianBlurSize);
        cv.adaptiveThreshold(blurred, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, blockSize, cValue);
        
        const processedCanvas = document.createElement('canvas');
        processedCanvas.width = canvas.width;
        processedCanvas.height = canvas.height;
        cv.imshow(processedCanvas, binary);
        
        // Limpeza de memória
        src.delete();
        gray.delete();
        blurred.delete();
        binary.delete();
        
        log('✅ OpenCV: Processamento avançado concluído com sucesso');
        return processedCanvas;
        
    } catch (error) {
        log(`❌ Erro OpenCV: ${error.message} - Usando processamento básico`);
        return applyBasicHeavyProcessing(canvas);
    }
}

function applyBasicHeavyProcessing(canvas) {
    const processedCanvas = document.createElement('canvas');
    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;
    const ctx = processedCanvas.getContext('2d');
    
    ctx.filter = 'contrast(200%) brightness(110%) saturate(0%)';
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
    
    log(`🎉 Processamento concluído em ${duration}s`);
    log(`📊 ${stats.processedPages} páginas processadas`);
    
    // Estatísticas de qualidade - CORRIGIDO
    const qualityStats = processedPages.reduce((acc, page) => {
        if (page.quality >= 0.8) acc.high++;
        else if (page.quality >= 0.6) acc.medium++;
        else acc.low++;
        return acc;
    }, { high: 0, medium: 0, low: 0 });
    
    log(`📈 Qualidade detectada: ${qualityStats.high} alta, ${qualityStats.medium} média, ${qualityStats.low} baixa`);
    
    // Mostrar resultados
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
            
            // Usar configuração do CONFIG se disponível
            const jpegQuality = (typeof CONFIG !== 'undefined') ? CONFIG.output.jpegQuality : 0.92;
            const imgData = page.canvas.toDataURL('image/jpeg', jpegQuality);
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
        
        const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
        const filename = `PDF_Processado_${timestamp}.pdf`;
        
        pdf.save(filename);
        log(`✅ PDF salvo: ${filename}`);
        
    } catch (error) {
        log(`❌ Erro ao gerar PDF: ${error.message}`);
        alert('Erro ao gerar PDF final.');
    }
}

function reiniciar() {
    pdfDocument = null;
    processedPages = [];
    stats = { totalPages: 0, processedPages: 0, startTime: null };
    
    document.getElementById('fileInput').value = '';
    document.getElementById('processBtn').disabled = true;
    document.getElementById('progressArea').style.display = 'none';
    document.getElementById('resultsArea').style.display = 'none';
    document.getElementById('logContent').innerHTML = '';
    
    log('🔄 Sistema reiniciado');
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
