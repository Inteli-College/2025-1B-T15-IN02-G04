const puppeteer = require('puppeteer');

// Configurações padrão do Puppeteer
const defaultLaunchOptions = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu',
    '--disable-features=VizDisplayCompositor',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows'
  ]
};

// Configurações para produção (ex: Docker, Heroku)
const productionLaunchOptions = {
  ...defaultLaunchOptions,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  args: [
    ...defaultLaunchOptions.args,
    '--memory-pressure-off',
    '--max_old_space_size=4096'
  ]
};

// Configurações padrão para PDF
const defaultPDFOptions = {
  format: 'A4',
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm'
  },
  printBackground: true,
  preferCSSPageSize: true
};

/**
 * Cria uma instância do browser com configurações otimizadas
 */
async function createBrowser() {
  const isProduction = process.env.NODE_ENV === 'production';
  const launchOptions = isProduction ? productionLaunchOptions : defaultLaunchOptions;
  
  try {
    const browser = await puppeteer.launch(launchOptions);
    return browser;
  } catch (error) {
    console.error('Erro ao inicializar Puppeteer:', error);
    throw new Error('Falha ao inicializar o gerador de PDF');
  }
}

/**
 * Cria uma página com configurações otimizadas
 */
async function createPage(browser) {
  const page = await browser.newPage();
  
  // Configurar viewport
  await page.setViewport({ 
    width: 1200, 
    height: 800,
    deviceScaleFactor: 1
  });
  
  // Configurar timeouts
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);
  
  // Configurar user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  return page;
}

/**
 * Gera PDF a partir de HTML com configurações otimizadas
 */
async function generatePDFFromHTML(htmlContent, options = {}) {
  let browser;
  
  try {
    browser = await createBrowser();
    const page = await createPage(browser);
    
    // Carregar HTML
    await page.setContent(htmlContent, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000 
    });
    
    // Aguardar um pouco mais para garantir que tudo foi renderizado
    await page.waitForTimeout(1000);
    
    // Configurar opções do PDF
    const pdfOptions = {
      ...defaultPDFOptions,
      ...options
    };
    
    // Gerar PDF
    const pdfBuffer = await page.pdf(pdfOptions);
    
    return pdfBuffer;
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Gera PDF a partir de URL
 */
async function generatePDFFromURL(url, options = {}) {
  let browser;
  
  try {
    browser = await createBrowser();
    const page = await createPage(browser);
    
    // Navegar para a URL
    await page.goto(url, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000 
    });
    
    // Configurar opções do PDF
    const pdfOptions = {
      ...defaultPDFOptions,
      ...options
    };
    
    // Gerar PDF
    const pdfBuffer = await page.pdf(pdfOptions);
    
    return pdfBuffer;
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Verifica se o Puppeteer está funcionando corretamente
 */
async function testPuppeteer() {
  let browser;
  
  try {
    browser = await createBrowser();
    const page = await createPage(browser);
    
    await page.setContent('<html><body><h1>Teste</h1></body></html>');
    const pdfBuffer = await page.pdf({ format: 'A4' });
    
    return {
      success: true,
      pdfSize: pdfBuffer.length,
      message: 'Puppeteer está funcionando corretamente'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Erro ao testar Puppeteer'
    };
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = {
  createBrowser,
  createPage,
  generatePDFFromHTML,
  generatePDFFromURL,
  testPuppeteer,
  defaultLaunchOptions,
  productionLaunchOptions,
  defaultPDFOptions
};