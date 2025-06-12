const request = require('supertest');
const express = require('express');
const app = express();
const ClassModel = require('../models/classModel');

// Configurar o app para os testes
app.use(express.json());

// Mock das rotas
app.get('/classes', async (req, res) => {
  try {
    const classes = await ClassModel.getAllClasses();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar classes.' });
  }
});

app.get('/classes/:id', async (req, res) => {
  try {
    const classData = await ClassModel.getClassById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: 'Classe não encontrada' });
    }
    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter classe.' });
  }
});

app.get('/classes/module/:moduleId', async (req, res) => {
  try {
    const classes = await ClassModel.getClassesByModuleId(req.params.moduleId);
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar classes do módulo.' });
  }
});

app.post('/classes', async (req, res) => {
  try {
    const newClass = await ClassModel.createClass(req.body);
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar classe.' });
  }
});

app.put('/classes/:id', async (req, res) => {
  try {
    const updatedClass = await ClassModel.updateClass(
      req.params.id,
      req.body.name,
      req.body.description,
      req.body.id_module
    );
    if (!updatedClass) {
      return res.status(404).json({ error: 'Classe não encontrada' });
    }
    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar classe.' });
  }
});

app.delete('/classes/:id', async (req, res) => {
  try {
    const deleted = await ClassModel.deleteClass(req.params.id);
    if (deleted) {
      res.json({ message: 'Classe deletada com sucesso' });
    } else {
      res.status(404).json({ error: 'Classe não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar classe.' });
  }
});

jest.mock('../models/classModel');

describe('API de Classes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/classes - Lista todas as classes
  describe('GET /classes', () => {
    it('deve retornar todas as classes', async () => {
      // 1. Preparar dados de teste
      const classesMock = [
        { id: 1, name: 'Classe Teste 1', description: 'Descrição 1', id_module: 1 },
        { id: 2, name: 'Classe Teste 2', description: 'Descrição 2', id_module: 1 }
      ];

      // 2. Configurar mock
      ClassModel.getAllClasses.mockResolvedValue(classesMock);

      // 3. Fazer requisição
      const response = await request(app)
        .get('/classes')
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(classesMock);
      expect(ClassModel.getAllClasses).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar classes', async () => {
      // 1. Configurar mock para erro
      ClassModel.getAllClasses.mockRejectedValue(new Error('Erro no banco de dados'));

      // 2. Fazer requisição
      const response = await request(app)
        .get('/classes')
        .expect(500);

      // 3. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao listar classes.' });
    });
  });

  // GET /api/classes/:id - Obtém uma classe específica
  describe('GET /classes/:id', () => {
    it('deve retornar uma classe específica por id', async () => {
      // 1. Preparar dados de teste
      const classMock = {
        id: 1,
        name: 'Classe Teste',
        description: 'Descrição Teste',
        id_module: 1
      };

      // 2. Configurar mock
      ClassModel.getClassById.mockResolvedValue(classMock);

      // 3. Fazer requisição
      const response = await request(app)
        .get('/classes/1')
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(classMock);
      expect(ClassModel.getClassById).toHaveBeenCalledWith('1');
    });

    it('deve retornar 404 quando classe não for encontrada', async () => {
      // 1. Configurar mock
      ClassModel.getClassById.mockResolvedValue(null);

      // 2. Fazer requisição
      const response = await request(app)
        .get('/classes/999')
        .expect(404);

      // 3. Verificar resultado
      expect(response.body).toEqual({ error: 'Classe não encontrada' });
    });
  });

  // GET /api/classes/module/:moduleId - Lista classes por módulo
  describe('GET /classes/module/:moduleId', () => {
    it('deve retornar classes de um módulo específico', async () => {
      // 1. Preparar dados de teste
      const classesMock = [
        { id: 1, name: 'Classe 1', description: 'Descrição 1', id_module: 1 },
        { id: 2, name: 'Classe 2', description: 'Descrição 2', id_module: 1 }
      ];

      // 2. Configurar mock
      ClassModel.getClassesByModuleId.mockResolvedValue(classesMock);

      // 3. Fazer requisição
      const response = await request(app)
        .get('/classes/module/1')
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(classesMock);
      expect(ClassModel.getClassesByModuleId).toHaveBeenCalledWith('1');
    });
  });

  // POST /api/classes - Cria uma nova classe
  describe('POST /classes', () => {
    it('deve criar uma nova classe', async () => {
      // 1. Preparar dados de teste
      const novaClasse = {
        name: 'Nova Classe',
        description: 'Descrição Nova Classe',
        id_module: 1
      };

      // 2. Configurar mock
      const classeCriadaMock = {
        id: 1,
        ...novaClasse
      };
      ClassModel.createClass.mockResolvedValue(classeCriadaMock);

      // 3. Fazer requisição
      const response = await request(app)
        .post('/classes')
        .send(novaClasse)
        .expect(201);

      // 4. Verificar resultado
      expect(response.body).toEqual(classeCriadaMock);
      expect(ClassModel.createClass).toHaveBeenCalledWith(novaClasse);
    });

    it('deve tratar erros ao criar classe', async () => {
      // 1. Preparar dados de teste
      const novaClasse = {
        name: 'Nova Classe',
        description: 'Descrição Nova Classe',
        id_module: 1
      };

      // 2. Configurar mock para erro
      ClassModel.createClass.mockRejectedValue(new Error('Erro no banco de dados'));

      // 3. Fazer requisição
      const response = await request(app)
        .post('/classes')
        .send(novaClasse)
        .expect(500);

      // 4. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao criar classe.' });
    });
  });

  // PUT /api/classes/:id - Atualiza uma classe existente
  describe('PUT /classes/:id', () => {
    it('deve atualizar uma classe existente', async () => {
      // 1. Preparar dados de teste
      const dadosAtualizados = {
        name: 'Classe Atualizada',
        description: 'Descrição Atualizada',
        id_module: 2
      };

      // 2. Configurar mock
      const classeAtualizadaMock = {
        id: 1,
        ...dadosAtualizados
      };
      ClassModel.updateClass.mockResolvedValue(classeAtualizadaMock);

      // 3. Fazer requisição
      const response = await request(app)
        .put('/classes/1')
        .send(dadosAtualizados)
        .expect(200);

      // 4. Verificar resultado
      expect(response.body).toEqual(classeAtualizadaMock);
      expect(ClassModel.updateClass).toHaveBeenCalledWith(
        '1',
        dadosAtualizados.name,
        dadosAtualizados.description,
        dadosAtualizados.id_module
      );
    });

    it('deve retornar 404 ao atualizar classe inexistente', async () => {
      // 1. Preparar dados de teste
      const dadosAtualizados = {
        name: 'Classe Atualizada',
        description: 'Descrição Atualizada',
        id_module: 2
      };

      // 2. Configurar mock
      ClassModel.updateClass.mockResolvedValue(null);

      // 3. Fazer requisição
      const response = await request(app)
        .put('/classes/999')
        .send(dadosAtualizados)
        .expect(404);

      // 4. Verificar resultado
      expect(response.body).toEqual({ error: 'Classe não encontrada' });
    });
  });

  // DELETE /api/classes/:id - Remove uma classe
  describe('DELETE /classes/:id', () => {
    it('deve deletar uma classe', async () => {
      // 1. Configurar mock
      ClassModel.deleteClass.mockResolvedValue(true);

      // 2. Fazer requisição
      const response = await request(app)
        .delete('/classes/1')
        .expect(200);

      // 3. Verificar resultado
      expect(response.body).toEqual({ message: 'Classe deletada com sucesso' });
      expect(ClassModel.deleteClass).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar classe', async () => {
      // 1. Configurar mock para erro
      ClassModel.deleteClass.mockRejectedValue(new Error('Erro no banco de dados'));

      // 2. Fazer requisição
      const response = await request(app)
        .delete('/classes/1')
        .expect(500);

      // 3. Verificar mensagem de erro
      expect(response.body).toEqual({ error: 'Erro ao deletar classe.' });
    });
  });
}); 