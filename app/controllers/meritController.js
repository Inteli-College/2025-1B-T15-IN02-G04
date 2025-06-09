const MeritModel = require('../models/meritModel');

const MeritController = {

  async getAllMerits(req, res) {
    try {
      const merits = await MeritModel.getAllMerits();
      return res.status(200).json(merits);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar méritos.' });
    }
  },

  async getMeritById(req, res) {
    try {
      const { id } = req.params;
      const merit = await MeritModel.getMeritById(id);
      if (!merit) {
        return res.status(404).json({ error: 'Mérito não encontrado' });
      }
      return res.status(200).json(merit);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter mérito.' });
    }
  },

  async createMerit(req, res) {
    try {
      const newMerit = await MeritModel.createMerit(req.body);
      return res.status(201).json(newMerit);
      } catch (err) {
        console.error('Erro ao criar mérito:', err); 
        res.status(500).json({ error: 'Erro ao criar mérito' });
      }
  },

      async updateMerit(req, res) {
      try {
        const { name, description } = req.body;
        console.log("REQ.BODY:", req.body);          
        console.log("NAME:", name);                   
        console.log("DESCRIPTION:", description);      
        const updatedMerit = await MeritModel.updateMerit(req.params.id, name, description);
        if (updatedMerit) {
        res.status(200).json(updatedMerit);
        } else {
        res.status(404).json({ error: 'Mérito não encontrado' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
   },

    async deleteMerit(req, res) {
    try {
      const id = parseInt(req.params.id); 
      const meritDelete = await MeritModel.deleteMerit(id);
      return res.status(200).json({ message: 'Mérito deletado com sucesso' });
    } catch (err) {
      console.error('Erro ao deletar mérito:', err);
      res.status(500).json({ error: 'Erro ao deletar mérito' });
    }
  }
};

module.exports = MeritController;