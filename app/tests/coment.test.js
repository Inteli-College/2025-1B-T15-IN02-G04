const request = require('supertest');
const express = require('express');
const app = express();
const ComentModel = require('../models/comentModel');

// Configurar o app para os testes
app.use(express.json());

// Mock das rotas
app.get('/coments', async (req, res) => {
  try {
    const coment = await ComentModel.getAllComents();
    res.json(coment);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar comentários.' });
  }
});

app.get('/coments/:id', async (req, res) => {
  try {
    const coment = await ComentModel.getComentById(req.params.id);
    if (!coment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    res.json(coment);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter comentário.' });
  }
});

app.post('/coments', async (req, res) => {
  try {
    const newComent = await ComentModel.createComent(req.body);
    res.status(201).json(newComent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar comentário.' });
  }
});

// Update the route handler
app.put('/coments/:id', async (req, res) => {
  try {
    const { content, user_id } = req.body;
    const updatedComent = await ComentModel.updateComent(req.params.id, content, user_id);
    if (updatedComent) {
      res.json(updatedComent);
    } else {
      res.status(404).json({ error: 'Comentário não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/coments/:id', async (req, res) => {
  try {
    const deleted = await ComentModel.deleteComent(req.params.id);
    if (deleted) {
      res.json({ message: 'Comentário deletado com sucesso' });
    } else {
      res.status(404).json({ error: 'Comentário não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar comentário.' });
  }
});

jest.mock('../models/comentModel');

describe('API de Comentários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/coments - Lista todos os comentários
  describe('GET /coments', () => {
    it('deve retornar todos os comentários', async () => {
      const comentariosMock = [
        { id: 1, id_user: 1, coment: "Muito legal sua visita" },
        { id: 2, id_user: 2, coment: "A visita da fazenda é bem bonita" }
      ];

      ComentModel.getAllComents.mockResolvedValue(comentariosMock);

      const response = await request(app)
        .get('/coments')
        .expect(200);

      expect(response.body).toEqual(comentariosMock);
      expect(ComentModel.getAllComents).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar comentários', async () => {
      ComentModel.getAllComents.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/coments')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar comentários.' });
    });
  });

  // GET /api/coments/:id - Obtém um comentário específica
  describe('GET /coments/:id', () => {
    it('deve retornar um comentário específico por id', async () => {
      const comentarioMock = { 
        id: 1, 
        content: 'Comentário Teste', 
        user_id: 1 
      };
      
      ComentModel.getComentById.mockResolvedValue(comentarioMock);

      const response = await request(app)
        .get('/coments/1')
        .expect(200);

      expect(response.body).toEqual(comentarioMock);
      expect(ComentModel.getComentById).toHaveBeenCalledWith('1');
    });
    
    it('deve retornar 404 quando o comentário não for encontrado', async () => {
      ComentModel.getComentById.mockResolvedValue(null);

      const response = await request(app)
        .get('/coments/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Comentário não encontrado' });
    });

    it('deve tratar erros ao buscar comentário por id', async () => {
      ComentModel.getComentById.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/coments/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao obter comentário.' });
    });
  });

  // POST /api/coments - Cria um novo comentário
  describe('POST /coments', () => {
    it('deve criar um novo comentário', async () => {
      const novoComentario = {
        id_user: 1,
        coment: "Muito legal sua visita"
      };

      const comentarioCriadoMock = {
        id: 1,
        ...novoComentario
      };

      ComentModel.createComent.mockResolvedValue(comentarioCriadoMock);

      const response = await request(app)
        .post('/coments')
        .send(novoComentario)
        .expect(201);

      expect(response.body).toEqual(comentarioCriadoMock);
      expect(ComentModel.createComent).toHaveBeenCalledWith(novoComentario);
    });

    it('deve tratar erros ao criar comentário', async () => {
      const novoComentario = {
        id_user: 1,
        coment: "Muito legal sua visita"
      };

      ComentModel.createComent.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/coments')
        .send(novoComentario)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar comentário.' });
    });
  });

  // PUT /api/coments/:id - Atualiza um comentário existente
  describe('PUT /coments/:id', () => {
    it('deve atualizar um comentário existente', async () => {
      const comentarioAtualizado = {
        content: 'Comentário Atualizado',
        user_id: 1
      };

      const comentarioAtualizadoMock = {
        id: 1,
        ...comentarioAtualizado,
        created_at: new Date().toISOString()
      };

      // Setup the mock to return the expected data
      ComentModel.updateComent.mockResolvedValue(comentarioAtualizadoMock);

      const response = await request(app)
        .put('/coments/1')
        .send(comentarioAtualizado)
        .expect(200);

      expect(response.body).toEqual(comentarioAtualizadoMock);
      expect(ComentModel.updateComent).toHaveBeenCalledWith(
        '1',
        comentarioAtualizado.content,
        comentarioAtualizado.user_id
      );
    });
    
    it('deve retornar 404 quando o comentário não existe', async () => {
      ComentModel.updateComent.mockResolvedValue(null);

      const response = await request(app)
        .put('/coments/999')
        .send({ content: 'Teste', user_id: 1 })
        .expect(404);

      expect(response.body).toEqual({ error: 'Comentário não encontrado' });
    });
  });

  // DELETE /api/coments/:id - Remove um comentário
  describe('DELETE /coments/:id', () => {
    it('deve deletar um comentário', async () => {
      ComentModel.deleteComent.mockResolvedValue(true);

      const response = await request(app)
        .delete('/coments/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Comentário deletado com sucesso' });
      expect(ComentModel.deleteComent).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar comentário', async () => {
      ComentModel.deleteComent.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/coments/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar comentário.' });
    });
  });
});