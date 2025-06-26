const ClassModel = require('../models/classModel');
const ModuleModel = require('../models/moduleModel');

class ClassController {
  
  // 🧪 MÉTODO DE TESTE
  static async testBasic(req, res) {
    try {
      console.log('🧪 [TEST] Teste básico de aulas iniciado...');
      
      const testData = {
        status: 'API de aulas funcionando',
        timestamp: new Date().toISOString(),
        message: 'ClassController respondendo corretamente'
      };
      
      console.log('✅ [TEST] Teste de aulas OK');
      res.json(testData);
      
    } catch (error) {
      console.error('❌ [TEST] Erro no teste de aulas:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 📋 LISTAR TODAS AS AULAS
  static async getAllClasses(req, res) {
    try {
      console.log('🔍 [DEBUG] === INICIANDO getAllClasses ===');
      
      if (!ClassModel || !ClassModel.getAllClasses) {
        console.error('❌ [DEBUG] ClassModel.getAllClasses não encontrado');
        return res.status(500).json({ error: 'Método getAllClasses não encontrado' });
      }
      
      const classes = await ClassModel.getAllClasses();
      
      console.log('🔍 [DEBUG] Aulas encontradas:', classes ? classes.length : 0);
      console.log('✅ [DEBUG] Retornando resposta...');
      
      return res.status(200).json(classes || []);
      
    } catch (error) {
      console.error('💥 [DEBUG] Erro getAllClasses:', error.message);
      return res.status(500).json({ error: 'Erro ao listar aulas.' });
    }
  }

  // 🎯 BUSCAR AULAS POR MÓDULO
  static async getClassesByModuleId(req, res) {
    try {
      const { moduleId } = req.params;
      console.log('🔍 [DEBUG] === INICIANDO getClassesByModuleId ===');
      console.log('🔍 Module ID recebido:', moduleId);
      
      // Validar ID
      if (!moduleId || isNaN(moduleId)) {
        console.log('❌ [DEBUG] Module ID inválido');
        return res.status(400).json({ error: 'ID do módulo inválido' });
      }
      
      // Verificar se o módulo existe
      console.log('🔍 [DEBUG] Verificando se módulo existe...');
      
      if (!ModuleModel || !ModuleModel.getModuleById) {
        console.error('❌ [DEBUG] ModuleModel não encontrado');
        return res.status(500).json({ error: 'ModuleModel não encontrado' });
      }
      
      const module = await ModuleModel.getModuleById(moduleId);
      console.log('🔍 [DEBUG] Módulo encontrado:', module ? 'SIM' : 'NÃO');
      
      if (!module) {
        console.log('❌ [DEBUG] Módulo não existe para ID:', moduleId);
        return res.status(404).json({ error: 'Módulo não encontrado' });
      }
      
      console.log('✅ [DEBUG] Módulo OK:', module.name);
      
      // Buscar aulas do módulo
      console.log('🔍 [DEBUG] Buscando aulas do módulo...');
      
      if (!ClassModel || !ClassModel.getClassesByModuleId) {
        console.error('❌ [DEBUG] ClassModel.getClassesByModuleId não encontrado');
        return res.status(500).json({ error: 'Método de busca de aulas não encontrado' });
      }
      
      const classes = await ClassModel.getClassesByModuleId(moduleId);
      console.log('🔍 [DEBUG] Aulas encontradas:', classes ? classes.length : 0);
      
      if (classes && classes.length > 0) {
        console.log('🔍 [DEBUG] Primeira aula:', classes[0].name);
      }
      
      console.log('✅ [DEBUG] Retornando resposta final...');
      return res.status(200).json({
        module: module,
        classes: classes || []
      });
      
    } catch (error) {
      console.error('💥 [DEBUG] === ERRO getClassesByModuleId ===');
      console.error('💥 Mensagem:', error.message);
      console.error('💥 Stack:', error.stack);
      
      return res.status(500).json({ 
        error: 'Erro ao obter aulas do módulo',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 🔍 BUSCAR AULA POR ID
  static async getClassById(req, res) {
    try {
      const { id } = req.params;
      console.log('🔍 [DEBUG] Buscando aula ID:', id);
      
      const classItem = await ClassModel.getClassById(id);
      if (!classItem) {
        console.log('❌ [DEBUG] Aula não encontrada para ID:', id);
        return res.status(404).json({ error: 'Aula não encontrada' });
      }
      
      console.log('✅ [DEBUG] Aula encontrada:', classItem.name);
      return res.status(200).json(classItem);
    } catch (error) {
      console.error('💥 [DEBUG] Erro getClassById:', error.message);
      return res.status(500).json({ error: 'Erro ao obter aula.' });
    }
  }

  // 🔍 BUSCAR AULA POR NOME
  static async getClassByName(req, res) {
    try {
      const { name } = req.params;
      console.log('🔍 [DEBUG] Buscando aula nome:', name);
      
      const classItem = await ClassModel.getClassByName(name);
      if (!classItem) {
        console.log('❌ [DEBUG] Aula não encontrada para nome:', name);
        return res.status(404).json({ error: 'Aula não encontrada' });
      }
      
      console.log('✅ [DEBUG] Aula encontrada:', classItem.name);
      return res.status(200).json(classItem);
    } catch (error) {
      console.error('💥 [DEBUG] Erro getClassByName:', error.message);
      return res.status(500).json({ error: 'Erro ao obter aula.' });
    }
  }

  // ➕ CRIAR NOVA AULA
  static async createClass(req, res) {
    try {
      const { name, description, duration, video_url, module_id, order_position } = req.body;
      console.log('🔍 [DEBUG] Criando nova aula:', name);

      // Validações básicas
      if (!name || !module_id) {
        return res.status(400).json({ error: 'Nome e ID do módulo são obrigatórios.' });
      }

      // Verificar se o módulo existe
      const module = await ModuleModel.getModuleById(module_id);
      if (!module) {
        return res.status(404).json({ error: 'Módulo não encontrado' });
      }

      const newClass = await ClassModel.createClass({
        name,
        description,
        duration: duration || '30min',
        video_url,
        module_id,
        order_position: order_position || 1
      });
      
      console.log('✅ [DEBUG] Aula criada:', newClass.name);
      return res.status(201).json(newClass);
    } catch (error) {
      console.error('💥 [DEBUG] Erro ao criar aula:', error);
      res.status(500).json({ error: 'Erro ao criar aula' });
    }
  }

  // ✏️ ATUALIZAR AULA
  static async updateClass(req, res) {
    try {
      const { id } = req.params;
      const { name, description, duration, video_url, order_position } = req.body;
      
      console.log('🔍 [DEBUG] Atualizando aula ID:', id);
      
      const updatedClass = await ClassModel.updateClass(
        id, 
        name, 
        description, 
        duration, 
        video_url,
        order_position
      );
      
      if (updatedClass) {
        console.log('✅ [DEBUG] Aula atualizada:', updatedClass.name);
        res.status(200).json(updatedClass);
      } else {
        console.log('❌ [DEBUG] Aula não encontrada para atualização');
        res.status(404).json({ error: 'Aula não encontrada' });
      }
    } catch (error) {
      console.error('💥 [DEBUG] Erro ao atualizar aula:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 🗑️ DELETAR AULA
  static async deleteClass(req, res) {
    try {
      const id = parseInt(req.params.id);
      console.log('🔍 [DEBUG] Deletando aula ID:', id);
      
      const classDeleted = await ClassModel.deleteClass(id);
      if (classDeleted) {
        console.log('✅ [DEBUG] Aula deletada com sucesso');
        return res.status(200).json({ message: 'Aula deletada com sucesso' });
      } else {
        console.log('❌ [DEBUG] Aula não encontrada para deleção');
        return res.status(404).json({ error: 'Aula não encontrada' });
      }
    } catch (error) {
      console.error('💥 [DEBUG] Erro ao deletar aula:', error);
      res.status(500).json({ error: 'Erro ao deletar aula' });
    }
  }

  // 📊 LISTAR AULAS COM INFORMAÇÕES DO MÓDULO
  static async getClassesWithModuleInfo(req, res) {
    try {
      console.log('🔍 [DEBUG] Buscando aulas com info do módulo...');
      
      const classes = await ClassModel.getClassesWithModuleInfo();
      
      console.log('🔍 [DEBUG] Aulas com info encontradas:', classes ? classes.length : 0);
      return res.status(200).json(classes || []);
    } catch (error) {
      console.error('💥 [DEBUG] Erro getClassesWithModuleInfo:', error);
      return res.status(500).json({ error: 'Erro ao listar aulas com informações do módulo.' });
    }
  }
}
module.exports = ClassController;