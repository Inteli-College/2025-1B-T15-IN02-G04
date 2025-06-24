const puppeteer = require('puppeteer');
const CardModel = require('../models/cardModel');

class PDFController {
  static async generateCardPDF(req, res) {
    let browser;
    
    try {
      const { cardId } = req.params;
      
      // Buscar dados do card
      const card = await CardModel.getCardById(cardId);
      if (!card) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      // Inicializar o Puppeteer
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();

      // Configurar viewport
      await page.setViewport({ width: 1200, height: 800 });

      // Criar HTML para o PDF
      const htmlContent = PDFController.generateCardHTML(card);

      // Carregar o HTML na página
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Gerar PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      });

      // Configurar headers para download
      const fileName = `card-${card.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Enviar o PDF
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ 
        error: 'Erro interno ao gerar PDF',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  static generateCardHTML(card) {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${card.title}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
            }

            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
            }

            .header {
                background: linear-gradient(135deg, #10384F 0%, #89D329 100%);
                color: white;
                padding: 30px;
                border-radius: 10px;
                margin-bottom: 30px;
                text-align: center;
            }

            .logo {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .header-subtitle {
                font-size: 14px;
                opacity: 0.9;
            }

            .card-content {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 30px;
                margin-bottom: 30px;
                border: 2px solid #e9ecef;
            }

            .card-title {
                font-size: 24px;
                font-weight: bold;
                color: #10384F;
                margin-bottom: 20px;
                text-align: center;
                border-bottom: 3px solid #89D329;
                padding-bottom: 15px;
            }

            .card-description {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                text-align: justify;
                margin-bottom: 20px;
            }

            .card-image {
                text-align: center;
                margin: 20px 0;
            }

            .card-image img {
                max-width: 100%;
                height: auto;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }

            .metadata {
                background: #fff;
                border-radius: 10px;
                padding: 20px;
                border: 1px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 15px;
            }

            .metadata-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #666;
            }

            .metadata-icon {
                width: 16px;
                height: 16px;
                fill: #89D329;
            }

            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #999;
                border-top: 1px solid #e9ecef;
                padding-top: 20px;
            }

            .qr-section {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
            }

            @media print {
                .container {
                    padding: 20px;
                }
                
                .header {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo">aprendizAGRO</div>
                <div class="header-subtitle">Plataforma Educacional em Agronegócio</div>
            </div>

            <!-- Card Content -->
            <div class="card-content">
                <h1 class="card-title">${card.title}</h1>
                
                ${card.image ? `
                <div class="card-image">
                    <img src="${card.image}" alt="${card.title}" onerror="this.style.display='none'">
                </div>
                ` : ''}
                
                <div class="card-description">
                    ${card.description}
                </div>
            </div>

            <!-- Metadata -->
            <div class="metadata">
                <div class="metadata-item">
                    <svg class="metadata-icon" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                    <span>Gerado em: ${currentDate}</span>
                </div>
                
                <div class="metadata-item">
                    <svg class="metadata-icon" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>ID do Card: #${card.id}</span>
                </div>
                
                <div class="metadata-item">
                    <svg class="metadata-icon" viewBox="0 0 24 24">
                        <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H19V1h-2v1H7V1H5v1H4.5C3.12 2 2 3.12 2 4.5v15C2 20.88 3.12 22 4.5 22h15c1.38 0 2.5-1.12 2.5-2.5v-15C22 3.12 20.88 2 19.5 2z"/>
                    </svg>
                    <span>Categoria: Educacional</span>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p><strong>AprendizAGRO</strong> - Transformando conhecimento em resultados no agronegócio</p>
                <p>Este documento foi gerado automaticamente pela plataforma AprendizAGRO</p>
                <p>© 2025 Bayer. Todos os direitos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Método alternativo usando template mais simples (para casos de erro)
  static async generateSimpleCardPDF(req, res) {
    try {
      const { cardId } = req.params;
      
      const card = await CardModel.getCardById(cardId);
      if (!card) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      // Simular um PDF simples usando texto
      const content = `
APRENDIZAGRO - CARD EDUCACIONAL

Título: ${card.title}

Descrição:
${card.description}

ID do Card: #${card.id}
Data de geração: ${new Date().toLocaleDateString('pt-BR')}

---
© 2025 AprendizAGRO - Plataforma Educacional em Agronegócio
      `;

      const fileName = `card-${card.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.txt`;
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      res.send(content);

    } catch (error) {
      console.error('Erro ao gerar arquivo simples:', error);
      res.status(500).json({ error: 'Erro ao gerar arquivo' });
    }
  }
}

module.exports = PDFController;