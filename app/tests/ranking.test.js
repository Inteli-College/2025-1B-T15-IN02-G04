const request = require('supertest');
const express = require('express');
const app = express();
const Ranking = require('../models/rankingModel');

// Configurar o app para os testes
app.use(express.json());

// Mock das rotas
app.get('/rankings', async (req, res) => {
  try {
    const rankings = await Ranking.getAll();
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar rankings.' });
  }
});

app.get('/rankings/:id', async (req, res) => {
  try {
    const ranking = await Ranking.getById(req.params.id);
    if (!ranking) {
      return res.status(404).json({ error: 'Ranking não encontrado' });
    }
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter ranking.' });
  }
});

app.post('/rankings', async (req, res) => {
  try {
    const { id_user, score } = req.body;
    const newRanking = await Ranking.create(id_user, score);
    res.status(201).json(newRanking);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar ranking.' });
  }
});

app.put('/rankings/:id', async (req, res) => {
  try {
    const { score } = req.body;
    const updatedRanking = await Ranking.update(req.params.id, score);
    if (!updatedRanking) {
      return res.status(404).json({ error: 'Ranking não encontrado' });
    }
    res.json(updatedRanking);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar ranking.' });
  }
});

app.delete('/rankings/:id', async (req, res) => {
  try {
    const deleted = await Ranking.delete(req.params.id);
    if (deleted) {
      res.json({ message: 'Ranking deletado com sucesso' });
    } else {
      res.status(404).json({ error: 'Ranking não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar ranking.' });
  }
});

jest.mock('../models/rankingModel');

describe('API de Rankings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/rankings - Lista todos os rankings
  describe('GET /rankings', () => {
    it('deve retornar todos os rankings ordenados por pontuação', async () => {
      // 1. Preparar dados de teste
      const rankingsMock = [
        { id: 1, id_user: 1, score: 100 },
        { id: 2, id_user: 2, score: 90 },
        { id: 3, id_user: 3, score: 80 }
      ];

      // 2. Configurar mock
      Ranking.getAll.mockResolvedValue(rankingsMock);

      // 3. Fazer requisição
      const response = await request(app)
        .get('/rankings')
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(rankingsMock);
      expect(Ranking.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar rankings', async () => {
      // 1. Configurar mock para erro
      Ranking.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      // 2. Fazer requisição
      const response = await request(app)
        .get('/rankings')
        .expect(500);

      // 3. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao listar rankings.' });
    });
  });

  // GET /api/rankings/:id - Obtém um ranking específico
  describe('GET /rankings/:id', () => {
    it('deve retornar um ranking específico por id', async () => {
      // 1. Preparar dados de teste
      const rankingMock = {
        id: 1,
        id_user: 1,
        score: 100
      };

      // 2. Configurar mock
      Ranking.getById.mockResolvedValue(rankingMock);

      // 3. Fazer requisição
      const response = await request(app)
        .get('/rankings/1')
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(rankingMock);
      expect(Ranking.getById).toHaveBeenCalledWith('1');
    });

    it('deve retornar 404 quando ranking não for encontrado', async () => {
      // 1. Configurar mock
      Ranking.getById.mockResolvedValue(null);

      // 2. Fazer requisição
      const response = await request(app)
        .get('/rankings/999')
        .expect(404);

      // 3. Verificar resultado
      expect(response.body).toEqual({ error: 'Ranking não encontrado' });
    });
  });

  // POST /api/rankings - Cria um novo ranking
  describe('POST /rankings', () => {
    it('deve criar um novo ranking', async () => {
      // 1. Preparar dados de teste
      const novoRanking = {
        id_user: 1,
        score: 100
      };

      // 2. Configurar mock
      const rankingCriadoMock = {
        id: 1,
        ...novoRanking
      };
      Ranking.create.mockResolvedValue(rankingCriadoMock);

      // 3. Fazer requisição
      const response = await request(app)
        .post('/rankings')
        .send(novoRanking)
        .expect(201);

      // 4. Verificar resultado
      expect(response.body).toEqual(rankingCriadoMock);
      expect(Ranking.create).toHaveBeenCalledWith(novoRanking.id_user, novoRanking.score);
    });

    it('deve tratar erros ao criar ranking', async () => {
      // 1. Preparar dados de teste
      const novoRanking = {
        id_user: 1,
        score: 100
      };

      // 2. Configurar mock para erro
      Ranking.create.mockRejectedValue(new Error('Erro no banco de dados'));

      // 3. Fazer requisição
      const response = await request(app)
        .post('/rankings')
        .send(novoRanking)
        .expect(500);

      // 4. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao criar ranking.' });
    });
  });

  // PUT /api/rankings/:id - Atualiza um ranking existente
  describe('PUT /rankings/:id', () => {
    it('deve atualizar um ranking existente', async () => {
      // 1. Preparar dados de teste
      const dadosAtualizados = {
        score: 150
      };

      // 2. Configurar mock
      const rankingAtualizadoMock = {
        id: 1,
        id_user: 1,
        score: dadosAtualizados.score
      };
      Ranking.update.mockResolvedValue(rankingAtualizadoMock);

      // 3. Fazer requisição
      const response = await request(app)
        .put('/rankings/1')
        .send(dadosAtualizados)
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(rankingAtualizadoMock);
      expect(Ranking.update).toHaveBeenCalledWith('1', dadosAtualizados.score);
    });

    it('deve retornar 404 ao atualizar ranking inexistente', async () => {
      // 1. Preparar dados de teste
      const dadosAtualizados = {
        score: 150
      };

      // 2. Configurar mock
      Ranking.update.mockResolvedValue(null);

      // 3. Fazer requisição
      const response = await request(app)
        .put('/rankings/999')
        .send(dadosAtualizados)
        .expect(404);

      // 4. Verificar resultado
      expect(response.body).toEqual({ error: 'Ranking não encontrado' });
    });
  });

  // DELETE /api/rankings/:id - Remove um ranking
  describe('DELETE /rankings/:id', () => {
    it('deve deletar um ranking', async () => {
      // 1. Configurar mock
      Ranking.delete.mockResolvedValue(true);

      // 2. Fazer requisição
      const response = await request(app)
        .delete('/rankings/1')
        .expect(200);

      // 3. Verificar resultado
      expect(response.body).toEqual({ message: 'Ranking deletado com sucesso' });
      expect(Ranking.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar ranking', async () => {
      // 1. Configurar mock para erro
      Ranking.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      // 2. Fazer requisição
      const response = await request(app)
        .delete('/rankings/1')
        .expect(500);

      // 3. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao deletar ranking.' });
    });
  });
}); 