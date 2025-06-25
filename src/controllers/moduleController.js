const ModuleModel = require('../models/moduleModel');

class ModuleController {
  static async getAllModules(req, res) {
    try {
      const modules = await ModuleModel.getAllModules();
      return res.status(200).json(modules);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar módulos.' });
    }
  }

  static async getModuleById(req, res) {
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
  }

  static async getModuleByName(req, res) {
    try {
      const { name } = req.params;
      const module = await ModuleModel.getModuleByName(name);
      if (!module) {
        return res.status(404).json({ error: 'Módulo não encontrado' });
      }
      return res.status(200).json(module);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter módulo.' });
    }
  }

  static async createModule(req, res) {
    try {
      const newModule = await ModuleModel.createModule(req.body);
      return res.status(201).json(newModule);
    } catch (err) {
      console.error('Erro ao criar módulo:', err);
      res.status(500).json({ error: 'Erro ao criar módulo' });
    }
  }

  static async updateModule(req, res) {
    try {
      const { name, description, id_trail } = req.body;
      console.log("REQ.BODY:", req.body);
      console.log("NAME:", name);
      console.log("DESCRIPTION:", description);
      console.log("ID_TRILHA:", id_trail);
      const updatedModule = await ModuleModel.updateModule(req.params.id, name, description, id_trail);
      if (updatedModule) {
        res.status(200).json(updatedModule);
      } else {
        res.status(404).json({ error: 'Module não encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteModule(req, res) {
    try {
      const id = parseInt(req.params.id);
      const moduleDeleted = await ModuleModel.deleteModule(id);
      if (moduleDeleted) {
        return res.status(200).json({ message: 'Módulo deletado com sucesso' });
      } else {
        return res.status(404).json({ error: 'Módulo não encontrado' });
      }
    } catch (err) {
      console.error('Erro ao deletar módulo:', err);
      res.status(500).json({ error: 'Erro ao deletar módulo' });
    }
  }
}

module.exports = ModuleController;