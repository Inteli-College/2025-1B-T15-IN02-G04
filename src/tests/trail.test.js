const request = require('supertest');
const express = require('express');
const app = express();
const TrailModel = require('../models/trailModel');

// Configurar o app para os testes
app.use(express.json());

// Mock das rotas
app.get('/trails', async (req, res) => {
  try {
    const trails = await TrailModel.getAllTrails();
    res.json(trails);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar trilhas.' });
  }
});

app.get('/trails/:id', async (req, res) => {
  try {
    const trail = await TrailModel.getTrailById(req.params.id);
    if (!trail) {
      return res.status(404).json({ error: 'Trilha não encontrada' });
    }
    res.json(trail);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter trilha.' });
  }
});

app.post('/trails', async (req, res) => {
  try {
    const newTrail = await TrailModel.createTrail(req.body);
    res.status(201).json(newTrail);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar trilha.' });
  }
});

app.put('/trails/:id', async (req, res) => {
  try {
    const updatedTrail = await TrailModel.updateTrail(
      req.params.id,
      req.body.name,
      req.body.description
    );
    if (!updatedTrail) {
      return res.status(404).json({ error: 'Trilha não encontrada' });
    }
    res.json(updatedTrail);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar trilha.' });
  }
});

app.delete('/trails/:id', async (req, res) => {
  try {
    const deleted = await TrailModel.deleteTrail(req.params.id);
    if (deleted) {
      res.json({ message: 'Trilha deletada com sucesso' });
    } else {
      res.status(404).json({ error: 'Trilha não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar trilha.' });
  }
});

jest.mock('../models/trailModel');
const db = require('../config/db');

describe('API de Trilhas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/trails - Lista todas as trilhas
  describe('GET /trails', () => {
    it('deve retornar todas as trilhas', async () => {
      // 1. Preparar dados de teste
      const trailsMock = [
        { id: 1, name: 'Trilha Teste 1', description: 'Descrição 1' },
        { id: 2, name: 'Trilha Teste 2', description: 'Descrição 2' }
      ];

      // 2. Configurar mock
      TrailModel.getAllTrails.mockResolvedValue(trailsMock);

      // 3. Fazer requisição
      const response = await request(app)
        .get('/trails')
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(trailsMock);
      expect(TrailModel.getAllTrails).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar trilhas', async () => {
      // 1. Configurar mock para erro
      TrailModel.getAllTrails.mockRejectedValue(new Error('Erro no banco de dados'));

      // 2. Fazer requisição
      const response = await request(app)
        .get('/trails')
        .expect(500);

      // 3. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao listar trilhas.' });
    });
  });

  // GET /api/trails/:id - Obtém uma trilha específica
  describe('GET /trails/:id', () => {
    it('deve retornar uma trilha específica por id', async () => {
      // 1. Preparar dados de teste
      const trailMock = {
        id: 1,
        name: 'Trilha Teste',
        description: 'Descrição Teste'
      };

      // 2. Configurar mock
      TrailModel.getTrailById.mockResolvedValue(trailMock);

      // 3. Fazer requisição
      const response = await request(app)
        .get('/trails/1')
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(trailMock);
      expect(TrailModel.getTrailById).toHaveBeenCalledWith('1');
    });

    it('deve retornar 404 quando trilha não for encontrada', async () => {
      // 1. Configurar mock
      TrailModel.getTrailById.mockResolvedValue(null);

      // 2. Fazer requisição
      const response = await request(app)
        .get('/trails/999')
        .expect(404);

      // 3. Verificar resultado
      expect(response.body).toEqual({ error: 'Trilha não encontrada' });
    });
  });

  // POST /api/trails - Cria uma nova trilha
  describe('POST /trails', () => {
    it('deve criar uma nova trilha', async () => {
      // 1. Preparar dados de teste
      const novaTrilha = {
        name: 'Nova Trilha',
        description: 'Descrição Nova Trilha'
      };

      // 2. Configurar mock
      const trilhaCriadaMock = {
        id: 1,
        ...novaTrilha
      };
      TrailModel.createTrail.mockResolvedValue(trilhaCriadaMock);

      // 3. Fazer requisição
      const response = await request(app)
        .post('/trails')
        .send(novaTrilha)
        .expect(201);

      // 4. Verificar resultado
      expect(response.body).toEqual(trilhaCriadaMock);
      expect(TrailModel.createTrail).toHaveBeenCalledWith(novaTrilha);
    });

    it('deve tratar erros ao criar trilha', async () => {
      // 1. Preparar dados de teste
      const novaTrilha = {
        name: 'Nova Trilha',
        description: 'Descrição Nova Trilha'
      };

      // 2. Configurar mock para erro
      TrailModel.createTrail.mockRejectedValue(new Error('Erro no banco de dados'));

      // 3. Fazer requisição
      const response = await request(app)
        .post('/trails')
        .send(novaTrilha)
        .expect(500);

      // 4. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao criar trilha.' });
    });
  });

  // PUT /api/trails/:id - Atualiza uma trilha existente
  describe('PUT /trails/:id', () => {
    it('deve atualizar uma trilha existente', async () => {
      // 1. Preparar dados de teste
      const dadosAtualizados = {
        name: 'Trilha Atualizada',
        description: 'Descrição Atualizada'
      };

      // 2. Configurar mock
      const trilhaAtualizadaMock = {
        id: 1,
        ...dadosAtualizados
      };
      TrailModel.updateTrail.mockResolvedValue(trilhaAtualizadaMock);

      // 3. Fazer requisição
      const response = await request(app)
        .put('/trails/1')
        .send(dadosAtualizados)
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(trilhaAtualizadaMock);
      expect(TrailModel.updateTrail).toHaveBeenCalledWith(
        '1',
        dadosAtualizados.name,
        dadosAtualizados.description
      );
    });

    it('deve retornar 404 ao atualizar trilha inexistente', async () => {
      // 1. Preparar dados de teste
      const dadosAtualizados = {
        name: 'Trilha Atualizada',
        description: 'Descrição Atualizada'
      };

      // 2. Configurar mock
      TrailModel.updateTrail.mockResolvedValue(null);

      // 3. Fazer requisição
      const response = await request(app)
        .put('/trails/999')
        .send(dadosAtualizados)
        .expect(404);

      // 4. Verificar resultado
      expect(response.body).toEqual({ error: 'Trilha não encontrada' });
    });
  });

  // DELETE /api/trails/:id - Remove uma trilha
  describe('DELETE /trails/:id', () => {
    it('deve deletar uma trilha', async () => {
      // 1. Configurar mock
      TrailModel.deleteTrail.mockResolvedValue(true);

      // 2. Fazer requisição
      const response = await request(app)
        .delete('/trails/1')
        .expect(200);

      // 3. Verificar resultado
      expect(response.body).toEqual({ message: 'Trilha deletada com sucesso' });
      expect(TrailModel.deleteTrail).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar trilha', async () => {
      // 1. Configurar mock para erro
      TrailModel.deleteTrail.mockRejectedValue(new Error('Erro no banco de dados'));

      // 2. Fazer requisição
      const response = await request(app)
        .delete('/trails/1')
        .expect(500);

      // 3. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao deletar trilha.' });
    });
  });
});

describe('TrailModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTrails', () => {
    it('deve retornar todas as trilhas', async () => {
      const mockRows = [
        { id: 1, name: 'Trilha 1', description: 'Desc 1' },
        { id: 2, name: 'Trilha 2', description: 'Desc 2' }
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await TrailModel.getAllTrails();
      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM trail');
    });

    it('deve lançar erro ao falhar', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      await expect(TrailModel.getAllTrails()).rejects.toThrow('DB error');
    });
  });

  describe('getTrailById', () => {
    it('deve retornar uma trilha por id', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1, name: 'Trilha', description: 'Desc' }] });
      const result = await TrailModel.getTrailById(1);
      expect(result).toEqual({ id: 1, name: 'Trilha', description: 'Desc' });
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM trail WHERE id = $1', [1]);
    });

    it('deve lançar erro ao falhar', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      await expect(TrailModel.getTrailById(1)).rejects.toThrow('DB error');
    });
  });

  describe('getTrailByName', () => {
    it('deve retornar uma trilha por nome', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1, name: 'Trilha', description: 'Desc' }] });
      const result = await TrailModel.getTrailByName('Trilha');
      expect(result).toEqual({ id: 1, name: 'Trilha', description: 'Desc' });
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM trail WHERE name = $1', ['Trilha']);
    });

    it('deve lançar erro ao falhar', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      await expect(TrailModel.getTrailByName('Trilha')).rejects.toThrow('DB error');
    });
  });

  describe('createTrail', () => {
    it('deve criar uma nova trilha', async () => {
      const data = { name: 'Nova', description: 'Desc Nova' };
      db.query.mockResolvedValue({ rows: [{ id: 1, ...data }] });
      const result = await TrailModel.createTrail(data);
      expect(result).toEqual({ id: 1, ...data });
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO trail (name, description) VALUES ($1, $2) RETURNING *',
        [data.name, data.description]
      );
    });

    it('deve lançar erro ao falhar', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      await expect(TrailModel.createTrail({ name: 'a', description: 'b' })).rejects.toThrow('DB error');
    });
  });

  describe('updateTrail', () => {
    it('deve atualizar uma trilha', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1, name: 'Atualizada', description: 'Nova Desc' }] });
      const result = await TrailModel.updateTrail(1, 'Atualizada', 'Nova Desc');
      expect(result).toEqual({ id: 1, name: 'Atualizada', description: 'Nova Desc' });
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE trail SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        ['Atualizada', 'Nova Desc', 1]
      );
    });

    it('deve lançar erro ao falhar', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      await expect(TrailModel.updateTrail(1, 'a', 'b')).rejects.toThrow('DB error');
    });
  });

  describe('deleteTrail', () => {
    it('deve deletar uma trilha', async () => {
      db.query.mockResolvedValue({ rowCount: 1 });
      const result = await TrailModel.deleteTrail(1);
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith('DELETE FROM trail WHERE id = $1 RETURNING *', [1]);
    });

    it('deve retornar false se não deletou', async () => {
      db.query.mockResolvedValue({ rowCount: 0 });
      const result = await TrailModel.deleteTrail(1);
      expect(result).toBe(false);
    });

    it('deve lançar erro ao falhar', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      await expect(TrailModel.deleteTrail(1)).rejects.toThrow('DB error');
    });
  });
});