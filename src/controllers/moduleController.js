const ModuleModel = require('../models/moduleModel');
const TrailModel = require('../models/trailModel');

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

  static async getModulesByTrailId(req, res) {
    try {
      const { trailId } = req.params;
      
      // Verificar se a trilha existe
      const trail = await TrailModel.getTrailById(trailId);
      if (!trail) {
        return res.status(404).json({ error: 'Trilha não encontrada' });
      }

      const modules = await ModuleModel.getModulesByTrailId(trailId);
      return res.status(200).json({
        trail: trail,
        modules: modules
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter módulos da trilha.' });
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
      const { name, description, duration, trail_id, order_position } = req.body;

      // Validações básicas
      if (!name || !trail_id) {
        return res.status(400).json({ error: 'Nome e ID da trilha são obrigatórios.' });
      }

      // Verificar se a trilha existe
      const trail = await TrailModel.getTrailById(trail_id);
      if (!trail) {
        return res.status(404).json({ error: 'Trilha não encontrada' });
      }

      const newModule = await ModuleModel.createModule({
        name,
        description,
        duration: duration || '1h 00min',
        trail_id,
        order_position: order_position || 1
      });
      
      return res.status(201).json(newModule);
    } catch (err) {
      console.error('Erro ao criar módulo:', err); 
      res.status(500).json({ error: 'Erro ao criar módulo' });
    }
  }

  static async updateModule(req, res) {
    try {
      const { id } = req.params;
      const { name, description, duration, order_position } = req.body;
      
      console.log("REQ.BODY:", req.body);
      console.log("MODULE ID:", id);
      
      const updatedModule = await ModuleModel.updateModule(
        id, 
        name, 
        description, 
        duration, 
        order_position
      );
      
      if (updatedModule) {
        res.status(200).json(updatedModule);
      } else {
        res.status(404).json({ error: 'Módulo não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);

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

  static async getModulesWithTrailInfo(req, res) {
    try {
      const modules = await ModuleModel.getModulesWithTrailInfo();
      return res.status(200).json(modules);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar módulos com informações da trilha.' });
    }
  }
}


module.exports = ModuleController;

