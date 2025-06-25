jest.mock('../config/db');

// Mock do módulo puppeteer antes dos requires
jest.mock('puppeteer', () => ({
  launch: jest.fn()
}));

const {
  createBrowser,
  createPage,
  generatePDFFromHTML,
  generatePDFFromURL,
  testPuppeteer,
  defaultLaunchOptions,
  productionLaunchOptions,
  defaultPDFOptions
} = require('../config/puppeteer');

// Obter mock após jest.mock
const puppeteer = require('puppeteer');

// Utilidades de factory para mocks de browser/página
function getMockPage() {
  return {
    setViewport: jest.fn().mockResolvedValue(),
    setDefaultTimeout: jest.fn(),
    setDefaultNavigationTimeout: jest.fn(),
    setUserAgent: jest.fn().mockResolvedValue(),
    setContent: jest.fn().mockResolvedValue(),
    waitForTimeout: jest.fn().mockResolvedValue(),
    goto: jest.fn().mockResolvedValue(),
    pdf: jest.fn().mockResolvedValue(Buffer.from('PDF'))
  };
}

function getMockBrowser(page = getMockPage()) {
  return {
    newPage: jest.fn().mockResolvedValue(page),
    close: jest.fn().mockResolvedValue()
  };
}

describe('Config Puppeteer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NODE_ENV; // Garante ambiente default entre testes
  });

  describe('createBrowser', () => {
    it('deve criar browser usando defaultLaunchOptions em ambiente dev', async () => {
      // Arrange
      const browserMock = getMockBrowser();
      puppeteer.launch.mockResolvedValue(browserMock);

      // Act
      const browser = await createBrowser();

      // Assert
      expect(puppeteer.launch).toHaveBeenCalledWith(defaultLaunchOptions);
      expect(browser).toBe(browserMock);
    });

    it('deve criar browser usando productionLaunchOptions quando NODE_ENV=production', async () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const browserMock = getMockBrowser();
      puppeteer.launch.mockResolvedValue(browserMock);

      // Act
      await createBrowser();

      // Assert
      expect(puppeteer.launch).toHaveBeenCalledWith(productionLaunchOptions);
    });

    it('deve propagar erro quando puppeteer.launch falhar', async () => {
      // Arrange
      const error = new Error('fail');
      puppeteer.launch.mockRejectedValue(error);

      // Act / Assert
      await expect(createBrowser()).rejects.toThrow('Falha ao inicializar o gerador de PDF');
      expect(puppeteer.launch).toHaveBeenCalled();
    });
  });

  describe('createPage', () => {
    it('deve configurar página corretamente', async () => {
      // Arrange
      const pageMock = getMockPage();
      const browserMock = getMockBrowser(pageMock);
      puppeteer.launch.mockResolvedValue(browserMock);

      // Act
      const page = await createPage(browserMock);

      // Assert
      expect(browserMock.newPage).toHaveBeenCalledTimes(1);
      expect(pageMock.setViewport).toHaveBeenCalledWith({ width: 1200, height: 800, deviceScaleFactor: 1 });
      expect(pageMock.setUserAgent).toHaveBeenCalled();
      expect(page).toBe(pageMock);
    });
  });

  describe('generatePDFFromHTML', () => {
    it('deve gerar PDF e fechar browser', async () => {
      // Arrange
      const pageMock = getMockPage();
      const browserMock = getMockBrowser(pageMock);
      puppeteer.launch.mockResolvedValue(browserMock);
      const html = '<html><body>Test</body></html>';

      // Act
      const buffer = await generatePDFFromHTML(html, { format: 'Letter' });

      // Assert
      expect(buffer).toBeInstanceOf(Buffer);
      expect(pageMock.setContent).toHaveBeenCalledWith(html, expect.objectContaining({ waitUntil: expect.any(Array) }));
      expect(pageMock.pdf).toHaveBeenCalledWith({ ...defaultPDFOptions, format: 'Letter' });
      expect(browserMock.close).toHaveBeenCalled();
    });
  });

  describe('generatePDFFromURL', () => {
    it('deve gerar PDF a partir de URL', async () => {
      // Arrange
      const pageMock = getMockPage();
      const browserMock = getMockBrowser(pageMock);
      puppeteer.launch.mockResolvedValue(browserMock);
      const url = 'https://example.com';

      // Act
      const buffer = await generatePDFFromURL(url);

      // Assert
      expect(pageMock.goto).toHaveBeenCalledWith(url, expect.objectContaining({ timeout: 30000 }));
      expect(buffer).toBeInstanceOf(Buffer);
      expect(browserMock.close).toHaveBeenCalled();
    });
  });

  describe('testPuppeteer', () => {
    it('deve retornar objeto de sucesso quando PDF gerado', async () => {
      // Arrange
      const pageMock = getMockPage();
      const browserMock = getMockBrowser(pageMock);
      puppeteer.launch.mockResolvedValue(browserMock);

      // Act
      const result = await testPuppeteer();

      // Assert
      expect(result.success).toBe(true);
      expect(result.pdfSize).toBeGreaterThan(0);
      expect(result.message).toBe('Puppeteer está funcionando corretamente');
    });
  });
}); 