const ModuleModel = require('../models/moduleModel');

const ModuleController = {

  async getAllModules(req, res) {
    try {
      // Usa optional chaining para acessar `query` de forma segura quando o objeto `req` pode estar indefinido (por exemplo, em testes)
      const trail_id = req?.query?.trail_id;

      let modules;
      if (trail_id) {
        modules = await ModuleModel.getModulesByTrailId(trail_id);
      } else {
        modules = await ModuleModel.getAllModules();
      }
      
      return res.status(200).json(modules);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar módulos.' });
    }
  },

  async getModuleById(req, res) {
    try {
      const { id } = req.params;
      const module = await ModuleModel.getModuleById(id);
      if (!module) {
        return res.status(404).json({ error: 'Módulo não encontrado' });
      }
      return res.status(200).json(module);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter módulo.' });
    }
  },

  async createModule(req, res) {
    try {
      const newModule = await ModuleModel.createModule(req.body);
      return res.status(201).json(newModule);
      } catch (err) {
        console.error('Erro ao criar módulo:', err); 
        res.status(500).json({ error: 'Erro ao criar módulo.' });
      }
  },

    async updateModule(req, res) {
      try {
        const { name, description, id_trail } = req.body;
        const updatedModule = await ModuleModel.updateModule(req.params.id, name, description, id_trail);
        if (updatedModule) {
        res.status(200).json(updatedModule);
        } else {
        res.status(404).json({ error: 'Módulo não encontrado' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
   },

    async deleteModule(req, res) {
    try {
      const id = parseInt(req.params.id); 
      const moduleDelete = await ModuleModel.deleteModule(id);
      return res.status(200).json({ message: 'Módulo deletado com sucesso' });
    } catch (err) {
      console.error('Erro ao deletar módulo:', err);
      res.status(500).json({ error: 'Erro ao deletar módulo.' });
    }
  }
};

module.exports = ModuleController;