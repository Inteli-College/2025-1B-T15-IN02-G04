const request = require('supertest');
const express = require('express');
const app = express();
const CertificateModel = require('../models/certificateModel');

// Configurar o app para os testes
app.use(express.json());

// Mock das rotas
app.get('/certificates', async (req, res) => {
  try {
    const certificates = await CertificateModel.getAllCertificates();
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar certificados.' });
  }
});

app.get('/certificates/:id', async (req, res) => {
  try {
    const certificate = await CertificateModel.getCertificateById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificado não encontrado' });
    }
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter certificado.' });
  }
});

app.post('/certificates', async (req, res) => {
  try {
    const newCertificate = await CertificateModel.createCertificate(req.body);
    res.status(201).json(newCertificate);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar certificado.' });
  }
});

app.put('/certificates/:id', async (req, res) => {
  try {
    const { name, description, date, id_user, id_trail } = req.body;
    const updatedCertificate = await CertificateModel.updateCertificate(
      req.params.id,
      name,
      description,
      date,
      id_user,
      id_trail
    );
    if (!updatedCertificate) {
      return res.status(404).json({ error: 'Certificado não encontrado' });
    }
    res.json(updatedCertificate);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar certificado.' });
  }
});

app.delete('/certificates/:id', async (req, res) => {
  try {
    const deleted = await CertificateModel.deleteCertificate(req.params.id);
    if (deleted) {
      res.json({ message: 'Certificado deletado com sucesso' });
    } else {
      res.status(404).json({ error: 'Certificado não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar certificado.' });
  }
});

jest.mock('../models/certificateModel');

describe('API de Certificados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/certificates - Lista todos os certificados
  describe('GET /certificates', () => {
    it('deve retornar todos os certificados', async () => {
      // 1. Preparar dados de teste
      const certificatesMock = [
        {
          id: 1,
          name: 'Certificado 1',
          description: 'Descrição 1',
          date: '2024-03-20',
          id_user: 1,
          id_trail: 1
        },
        {
          id: 2,
          name: 'Certificado 2',
          description: 'Descrição 2',
          date: '2024-03-21',
          id_user: 2,
          id_trail: 2
        }
      ];

      // 2. Configurar mock
      CertificateModel.getAllCertificates.mockResolvedValue(certificatesMock);

      // 3. Fazer requisição
      const response = await request(app)
        .get('/certificates')
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(certificatesMock);
      expect(CertificateModel.getAllCertificates).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar certificados', async () => {
      // 1. Configurar mock para erro
      CertificateModel.getAllCertificates.mockRejectedValue(new Error('Erro no banco de dados'));

      // 2. Fazer requisição
      const response = await request(app)
        .get('/certificates')
        .expect(500);

      // 3. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao listar certificados.' });
    });
  });

  // GET /api/certificates/:id - Obtém um certificado específico
  describe('GET /certificates/:id', () => {
    it('deve retornar um certificado específico por id', async () => {
      // 1. Preparar dados de teste
      const certificateMock = {
        id: 1,
        name: 'Certificado 1',
        description: 'Descrição 1',
        date: '2024-03-20',
        id_user: 1,
        id_trail: 1
      };

      // 2. Configurar mock
      CertificateModel.getCertificateById.mockResolvedValue(certificateMock);

      // 3. Fazer requisição
      const response = await request(app)
        .get('/certificates/1')
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(certificateMock);
      expect(CertificateModel.getCertificateById).toHaveBeenCalledWith('1');
    });

    it('deve retornar 404 quando certificado não for encontrado', async () => {
      // 1. Configurar mock
      CertificateModel.getCertificateById.mockResolvedValue(null);

      // 2. Fazer requisição
      const response = await request(app)
        .get('/certificates/999')
        .expect(404);

      // 3. Verificar resultado
      expect(response.body).toEqual({ error: 'Certificado não encontrado' });
    });
  });

  // POST /api/certificates - Cria um novo certificado
  describe('POST /certificates', () => {
    it('deve criar um novo certificado', async () => {
      // 1. Preparar dados de teste
      const novoCertificado = {
        name: 'Novo Certificado',
        description: 'Nova Descrição',
        date: '2024-03-22',
        id_user: 1,
        id_trail: 1
      };

      // 2. Configurar mock
      const certificadoCriadoMock = {
        id: 1,
        ...novoCertificado
      };
      CertificateModel.createCertificate.mockResolvedValue(certificadoCriadoMock);

      // 3. Fazer requisição
      const response = await request(app)
        .post('/certificates')
        .send(novoCertificado)
        .expect(201);

      // 4. Verificar resultado
      expect(response.body).toEqual(certificadoCriadoMock);
      expect(CertificateModel.createCertificate).toHaveBeenCalledWith(novoCertificado);
    });

    it('deve tratar erros ao criar certificado', async () => {
      // 1. Preparar dados de teste
      const novoCertificado = {
        name: 'Novo Certificado',
        description: 'Nova Descrição',
        date: '2024-03-22',
        id_user: 1,
        id_trail: 1
      };

      // 2. Configurar mock para erro
      CertificateModel.createCertificate.mockRejectedValue(new Error('Erro no banco de dados'));

      // 3. Fazer requisição
      const response = await request(app)
        .post('/certificates')
        .send(novoCertificado)
        .expect(500);

      // 4. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao criar certificado.' });
    });
  });

  // PUT /api/certificates/:id - Atualiza um certificado existente
  describe('PUT /certificates/:id', () => {
    it('deve atualizar um certificado existente', async () => {
      // 1. Preparar dados de teste
      const dadosAtualizados = {
        name: 'Certificado Atualizado',
        description: 'Descrição Atualizada',
        date: '2024-03-23',
        id_user: 1,
        id_trail: 1
      };

      // 2. Configurar mock
      const certificadoAtualizadoMock = {
        id: 1,
        ...dadosAtualizados
      };
      CertificateModel.updateCertificate.mockResolvedValue(certificadoAtualizadoMock);

      // 3. Fazer requisição
      const response = await request(app)
        .put('/certificates/1')
        .send(dadosAtualizados)
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(certificadoAtualizadoMock);
      expect(CertificateModel.updateCertificate).toHaveBeenCalledWith(
        '1',
        dadosAtualizados.name,
        dadosAtualizados.description,
        dadosAtualizados.date,
        dadosAtualizados.id_user,
        dadosAtualizados.id_trail
      );
    });

    it('deve retornar 404 ao atualizar certificado inexistente', async () => {
      // 1. Preparar dados de teste
      const dadosAtualizados = {
        name: 'Certificado Atualizado',
        description: 'Descrição Atualizada',
        date: '2024-03-23',
        id_user: 1,
        id_trail: 1
      };

      // 2. Configurar mock
      CertificateModel.updateCertificate.mockResolvedValue(null);

      // 3. Fazer requisição
      const response = await request(app)
        .put('/certificates/999')
        .send(dadosAtualizados)
        .expect(404);

      // 4. Verificar resultado
      expect(response.body).toEqual({ error: 'Certificado não encontrado' });
    });
  });

  // DELETE /api/certificates/:id - Remove um certificado
  describe('DELETE /certificates/:id', () => {
    it('deve deletar um certificado', async () => {
      // 1. Configurar mock
      CertificateModel.deleteCertificate.mockResolvedValue(true);

      // 2. Fazer requisição
      const response = await request(app)
        .delete('/certificates/1')
        .expect(200);

      // 3. Verificar resultado
      expect(response.body).toEqual({ message: 'Certificado deletado com sucesso' });
      expect(CertificateModel.deleteCertificate).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar certificado', async () => {
      // 1. Configurar mock para erro
      CertificateModel.deleteCertificate.mockRejectedValue(new Error('Erro no banco de dados'));

      // 2. Fazer requisição
      const response = await request(app)
        .delete('/certificates/1')
        .expect(500);

      // 3. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao deletar certificado.' });
    });
  });
}); 