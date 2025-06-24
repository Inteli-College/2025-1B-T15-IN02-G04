const CardModel = require('../models/cardModel');

class PDFController {
  // Teste para verificar se Puppeteer está funcionando
  static async testPuppeteer(req, res) {
    console.log('🧪 Teste de Puppeteer solicitado');
    
    try {
      // Tentar carregar Puppeteer
      const puppeteer = require('puppeteer');
      console.log('✅ Puppeteer carregado');

      // Tentar criar browser
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
      
      console.log('✅ Browser criado');

      const page = await browser.newPage();
      
      // HTML de teste simples
      const testHTML = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Teste</title></head>
      <body><h1>Teste do Puppeteer</h1><p>Data: ${new Date().toLocaleString('pt-BR')}</p></body>
      </html>
      `;

      await page.setContent(testHTML);
      
      const pdfBuffer = await page.pdf({ format: 'A4' });

      await browser.close();
      
      console.log('✅ PDF de teste gerado:', pdfBuffer.length, 'bytes');

      res.status(200).json({
        success: true,
        message: 'Puppeteer está funcionando corretamente',
        pdfSize: pdfBuffer.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro no teste do Puppeteer:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro no Puppeteer',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Gerar PDF do card - VERSÃO CORRIGIDA SEM waitForTimeout
  static async generateCardPDF(req, res) {
    console.log('📄 Solicitação de PDF para card:', req.params.cardId);
    
    let browser;
    
    try {
      const { cardId } = req.params;
      
      // Validar cardId
      if (!cardId || isNaN(cardId)) {
        console.error('❌ ID do card inválido:', cardId);
        return res.status(400).json({ error: 'ID do card inválido' });
      }

      // Buscar card no banco
      console.log('🔍 Buscando card no banco...');
      const card = await CardModel.getCardById(cardId);
      
      if (!card) {
        console.error('❌ Card não encontrado:', cardId);
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      console.log('✅ Card encontrado:', { id: card.id, title: card.title.substring(0, 50) });

      // Tentar carregar Puppeteer
      let puppeteer;
      try {
        puppeteer = require('puppeteer');
        console.log('✅ Puppeteer carregado');
      } catch (error) {
        console.error('❌ Erro ao carregar Puppeteer:', error);
        return res.status(500).json({ 
          error: 'Puppeteer não disponível',
          details: error.message,
          suggestion: 'Use /download para arquivo texto'
        });
      }

      // Inicializar browser com configurações mínimas
      console.log('🚀 Iniciando browser...');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      const page = await browser.newPage();

      // Gerar HTML simples e compatível
      const htmlContent = PDFController.generateSimpleCardHTML(card);
      console.log('📝 HTML gerado');

      // Carregar HTML de forma simples
      console.log('🔄 Carregando HTML na página...');
      await page.setContent(htmlContent);

      // Gerar PDF imediatamente (sem waitForTimeout)
      console.log('📄 Gerando PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true
      });

      console.log('✅ PDF gerado com sucesso:', pdfBuffer.length, 'bytes');

      // Limpar recursos
      await browser.close();
      browser = null;

      // Preparar resposta
      const fileName = `card-${card.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}.pdf`;
      
      console.log('📤 Enviando PDF:', fileName);

      // Headers para PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Enviar PDF
      res.send(pdfBuffer);

    } catch (error) {
      console.error('❌ Erro ao gerar PDF (Puppeteer):', error);

      // Tentar fallback com PDFKit
      try {
        const { cardId } = req.params;
        const cardData = await CardModel.getCardById(cardId);

        if (cardData) {
          console.log('🔄 Gerando PDF simples via PDFKit...');
          const PDFDocument = require('pdfkit');
          const doc = new PDFDocument({ size: 'A4', margin: 50 });
          const buffers = [];
          doc.on('data', buffers.push.bind(buffers));
          doc.on('end', () => {
            const fallbackBuffer = Buffer.concat(buffers);
            PDFController.sendPDF(fallbackBuffer, cardData.title, res);
          });

          // Conteúdo do PDF
          doc.fontSize(20).fillColor('#10384F').text(cardData.title, { align: 'center' });
          doc.moveDown();
          doc.fontSize(12).fillColor('#555555').text(cardData.description || 'Sem descrição', { align: 'justify' });
          doc.moveDown(2);
          doc.fontSize(10).fillColor('#999999').text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'right' });

          doc.end();
          return; // Resposta enviada no on('end')
        }
      } catch (fallbackError) {
        console.error('❌ Fallback PDFKit falhou:', fallbackError);
      }

      // Limpar browser se ainda estiver aberto
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('❌ Erro ao fechar browser:', closeError);
        }
      }

      res.status(500).json({ 
        error: 'Erro interno ao gerar PDF',
        details: error.message,
        timestamp: new Date().toISOString(),
        suggestion: 'Tente novamente mais tarde'
      });
    }
  }

  // Gerar HTML SIMPLES e COMPATÍVEL (sem recursos avançados)
  static generateSimpleCardHTML(card) {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
    
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>${this.escapeHtml(card.title)}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
                margin: 0;
                padding: 30px;
            }

            .header {
                background: #10384F;
                color: white;
                padding: 20px;
                text-align: center;
                margin-bottom: 30px;
            }

            .logo {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .subtitle {
                font-size: 14px;
            }

            .content {
                background: #f8f9fa;
                padding: 25px;
                margin-bottom: 30px;
                border: 1px solid #ddd;
            }

            .title {
                font-size: 20px;
                font-weight: bold;
                color: #10384F;
                margin-bottom: 20px;
                text-align: center;
                border-bottom: 2px solid #89D329;
                padding-bottom: 10px;
            }

            .description {
                font-size: 14px;
                line-height: 1.7;
                color: #555;
                text-align: justify;
            }

            .metadata {
                background: #fff;
                padding: 15px;
                border: 1px solid #ddd;
                margin-bottom: 20px;
            }

            .metadata-item {
                margin-bottom: 8px;
                font-size: 12px;
                color: #666;
            }

            .footer {
                text-align: center;
                font-size: 11px;
                color: #999;
                border-top: 1px solid #ddd;
                padding-top: 15px;
            }

            .footer p {
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">aprendizAGRO</div>
            <div class="subtitle">Plataforma Educacional em Agronegócio</div>
        </div>

        <div class="content">
            <h1 class="title">${this.escapeHtml(card.title)}</h1>
            <div class="description">
                ${this.escapeHtml(card.description)}
            </div>
        </div>

        <div class="metadata">
            <div class="metadata-item">Data de geração: ${currentDate} às ${currentTime}</div>
            <div class="metadata-item">ID do Card: #${card.id}</div>
            <div class="metadata-item">Categoria: Educacional</div>
        </div>

        <div class="footer">
            <p><strong>AprendizAGRO</strong> - Transformando conhecimento em resultados no agronegócio</p>
            <p>Este documento foi gerado automaticamente pela plataforma AprendizAGRO</p>
            <p>© 2025 Bayer. Todos os direitos reservados.</p>
        </div>
    </body>
    </html>
    `;
  }

  // Método auxiliar para escapar HTML
  static escapeHtml(text) {
    if (!text) return '';
    
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  // Download de arquivo texto (fallback)
  static async generateSimpleCardPDF(req, res) {
    console.log('📝 Download de texto solicitado para card:', req.params.cardId);
    
    try {
      const { cardId } = req.params;
      
      if (!cardId || isNaN(cardId)) {
        return res.status(400).json({ error: 'ID do card inválido' });
      }

      const card = await CardModel.getCardById(cardId);
      if (!card) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      const content = `
APRENDIZAGRO - CARD EDUCACIONAL

${'='.repeat(60)}

Título: ${card.title}

Descrição:
${card.description}

${'='.repeat(60)}

Informações do Documento:
- ID do Card: #${card.id}
- Data de geração: ${new Date().toLocaleDateString('pt-BR')}
- Hora de geração: ${new Date().toLocaleTimeString('pt-BR')}

${'='.repeat(60)}

© 2025 AprendizAGRO
Plataforma Educacional em Agronegócio
Bayer - Todos os direitos reservados
      `.trim();

      const fileName = `card-${card.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}.txt`;
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', Buffer.byteLength(content, 'utf8'));
      
      res.send(content);

    } catch (error) {
      console.error('❌ Erro ao gerar arquivo texto:', error);
      res.status(500).json({ 
        error: 'Erro interno ao gerar arquivo texto',
        details: error.message 
      });
    }
  }

  // Função utilitária para enviar buffer PDF
  static sendPDF(buffer, title, res) {
    const fileName = `card-${title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }
}

module.exports = PDFController;