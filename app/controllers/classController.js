const ClassModel = require('../models/classModel');

const ClassController = {

  async getAllClasses(req, res) {
    try {
      const { module_id } = req.query;
      
      let classes;
      if (module_id) {
        classes = await ClassModel.getClassesByModuleId(module_id);
      } else {
        classes = await ClassModel.getAllClasses();
      }
      
      return res.status(200).json(classes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar aulas.' });
    }
  },

  async getClassById(req, res) {
    try {
      const { id } = req.params;
      const classes = await ClassModel.getClassById(id);
      if (!classes) {
        return res.status(404).json({ error: 'Aula não encontrada' });
      }
      return res.status(200).json(classes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter aula.' });
    }
  },

  async createClass(req, res) {
    try {
      const newClass = await ClassModel.createClass(req.body);
      return res.status(201).json(newClass);
      } catch (err) {
        console.error('Erro ao criar classe:', err); 
        res.status(500).json({ error: 'Erro ao criar classe.' });
      }
  },

    async updateClass(req, res) {
      try {
        const { name, description, id_module } = req.body;
        const updatedClass = await ClassModel.updateClass(req.params.id, name, description, id_module);
        if (updatedClass) {
        res.status(200).json(updatedClass);
        } else {
        res.status(404).json({ error: 'Aula não encontrada' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
   },

    async deleteClass(req, res) {
    try {
      const id = parseInt(req.params.id); 
      const classDelete = await ClassModel.deleteClass(id);
      return res.status(200).json({ message: 'Aula deletada com sucesso' });
    } catch (err) {
      console.error('Erro ao deletar aula:', err);
      res.status(500).json({ error: 'Erro ao deletar aula.' });
    }
  }
};

module.exports = ClassController;