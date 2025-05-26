const TrailModel = require('../models/trailModel');

const TrailController = {

  async getAllTrails(req, res) {
    try {
      const trails = await TrailModel.getAllTrails();
      return res.status(200).json(trails);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar trilhas.' });
    }
  },

  async getTrailById(req, res) {
    try {
      const { id } = req.params;
      const trail = await TrailModel.getTrailById(id);
      if (!trail) {
        return res.status(404).json({ error: 'Trilha não encontrada' });
      }
      return res.status(200).json(trail);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter trilha.' });
    }
  },

  async createTrail(req, res) {
    try {
      const newTrail = await TrailModel.createTrail(req.body);
      return res.status(201).json(newTrail);
      } catch (err) {
        console.error('Erro ao criar trilha:', err); 
        res.status(500).json({ error: 'Erro ao criar trilha' });
      }
  },

    async deleteTrail(req, res) {
    try {
      const id = parseInt(req.params.id); 
      const TrailDelete = await TrailModel.deleteTrail(id);
      return res.status(200).json({ message: 'Trilha deletada com sucesso' });
    } catch (err) {
      console.error('Erro ao deletar trilha:', err);
      res.status(500).json({ error: 'Erro ao deletar trilha' });
    }
  }
};

module.exports = TrailController;