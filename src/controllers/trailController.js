const TrailModel = require('../models/trailModel');

class TrailController {
  static async getAllTrails(req, res) {
    try {
      const trails = await TrailModel.getAllTrails();
      return res.status(200).json(trails);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar trilhas.' });
    }
  }

  static async getTrailById(req, res) {
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
  }

  static async getTrailByName(req, res) {
    try {
      const { name } = req.params;
      const trail = await TrailModel.getTrailByName(name);
      if (!trail) {
        return res.status(404).json({ error: 'Trilha não encontrada' });
      }
      return res.status(200).json(trail);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter trilha.' });
    }
  }

  static async createTrail(req, res) {
    try {
      const newTrail = await TrailModel.createTrail(req.body);
      return res.status(201).json(newTrail);
    } catch (err) {
      console.error('Erro ao criar trilha:', err); 
      res.status(500).json({ error: 'Erro ao criar trilha' });
    }
  }

  static async updateTrail(req, res) {
    try {
      const { title, description, image } = req.body;
      console.log("REQ.BODY:", req.body);          
      console.log("TITLE:", title);                   
      console.log("DESCRIPTION:", description);      
      console.log("IMAGE:", image);
      const updatedTrail = await TrailModel.updateTrail(req.params.id, title, description, image);
      if (updatedTrail) {
        res.status(200).json(updatedTrail);
      } else {
        res.status(404).json({ error: 'Trilha não encontrada' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteTrail(req, res) {
    try {
      const id = parseInt(req.params.id);
      const trailDeleted = await TrailModel.deleteTrail(id);
      if (trailDeleted) {
        return res.status(200).json({ message: 'Trilha deletada com sucesso' });
      } else {
        return res.status(404).json({ error: 'Trilha não encontrada' });
      }
    } catch (err) {
      console.error('Erro ao deletar trilha:', err);
      res.status(500).json({ error: 'Erro ao deletar trilha' });
    }
  }
}

module.exports = TrailController;