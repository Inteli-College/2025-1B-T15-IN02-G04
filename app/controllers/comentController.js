const ComentModel = require('../models/comentModel');

const ComentController = {

  async getAllComents(req, res) {
    try {
      const coments = await ComentModel.getAllComents();
      return res.status(200).json(coments);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar comentários.' });
    }
  },

  async getComentById(req, res) {
    try {
      const { id } = req.params;
      const coment = await ComentModel.getComentById(id);
      if (!coment) {
        return res.status(404).json({ error: 'Comentário não encontrado' });
      }
      return res.status(200).json(coment);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter comentário.' });
    }
  },

  async createComent(req, res) {
    try {
      const newComent = await ComentModel.createComent(req.body);
      return res.status(201).json(newComent);
      } catch (err) {
        console.error('Erro ao criar comentário:', err); 
        res.status(500).json({ error: 'Erro ao criar comentário' });
      }
  },

      async updateComent(req, res) {
      try {
        const { user_id, coment } = req.body;
        console.log("REQ.BODY:", req.body);          
        console.log("USER_ID:", user_id);                   
        console.log("COMENT:", coment);      
        const updatedComent = await ComentModel.updateComent(req.params.id, user_id, coment);
        if (updatedComent) {
        res.status(200).json(updatedComent);
        } else {
        res.status(404).json({ error: 'Comentário não encontrado' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
   },

    async deleteComent(req, res) {
    try {
      const id = parseInt(req.params.id); 
      const comentDelete = await ComentModel.deleteComent(id);
      return res.status(200).json({ message: 'Comentário deletado com sucesso' });
    } catch (err) {
      console.error('Erro ao deletar comentário:', err);
      res.status(500).json({ error: 'Erro ao deletar comentário' });
    }
  }
};

module.exports = ComentController;