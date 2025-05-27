const TestModel = require('../models/testModel');

const TestController = {

  async getAllTests(req, res) {
    try {
      const tests = await TestModel.getAllTests();
      return res.status(200).json(tests);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar testes.' });
    }
  },

  async getTestById(req, res) {
    try {
      const { id } = req.params;
      const test = await TestModel.getTestById(id);
      if (!test) {
        return res.status(404).json({ error: 'Teste não encontrado' });
      }
      return res.status(200).json(test);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter teste.' });
    }
  },

  async createTest(req, res) {
    try {
      const newTest = await TestModel.createTest(req.body);
      return res.status(201).json(newTest);
      } catch (err) {
        console.error('Erro ao criar teste:', err); 
        res.status(500).json({ error: 'Erro ao criar teste.' });
      }
  },

    async updateTest(req, res) {
      try {
        const { name, id_trail } = req.body;
        const updatedTest = await TestModel.updateTest(req.params.id, name, id_trail);
        if (updatedTest) {
        res.status(200).json(updatedTest);
        } else {
        res.status(404).json({ error: 'Teste não encontrado' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
   },

    async deleteTest(req, res) {
    try {
      const id = parseInt(req.params.id); 
      const TestDelete = await TestModel.deleteTest(id);
      return res.status(200).json({ message: 'Teste deletado com sucesso' });
    } catch (err) {
      console.error('Erro ao deletar teste:', err);
      res.status(500).json({ error: 'Erro ao deletar teste.' });
    }
  }
};

module.exports = TestController;