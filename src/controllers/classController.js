const ClassModel = require('../models/classModel');

const ClassController = {

    async getClassesByModuleId(req, res) {
    try {           
        const { id_module } = req.params;
        const classes = await ClassModel.getClassesByModuleId(id_module);
        if (!classes) {
            return res.status(404).json({ error: 'Aulas não encontradas para este módulo' });
        }
        return res.status(200).json(classes);
        } catch (error) {
        console.error(error);       
        return res.status(500).json({ error: 'Erro ao obter aulas por módulo.' });    
        }
    },

  async getAllClasses(req, res) {
    try {
      const { id_module } = req.query;
      
      let classes;
      if (id_module) {
        classes = await ClassModel.getClassesByModuleId(id_module);
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
        console.error('Erro ao criar aula:', err); 
        res.status(500).json({ error: 'Erro ao criar aula.' });
      }
  },

    async updateClass(req, res) {
      try {
        const { name, description, id_module, class_order } = req.body;
        const updatedClass = await ClassModel.updateClass(req.params.id, name, description, id_module, class_order);
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