const db = require('../config/db');

class ClassModel {
  // 📋 BUSCAR TODAS AS AULAS
  static async getAllClasses() {
    try {
      const result = await db.query('SELECT * FROM class ORDER BY module_id, order_position');
      return result.rows;
    } catch (error) {
      console.error('💥 Erro ao buscar aulas:', error);
      throw error;
    }
  }

  // 🔍 BUSCAR AULA POR ID
  static async getClassById(id) {
    try {
      const result = await db.query('SELECT * FROM class WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('💥 Erro ao buscar aula por ID:', error);
      throw error;
    }
  }


  // 🎯 BUSCAR AULAS POR MÓDULO
  static async getClassesByModuleId(moduleId) {
    try {
      const result = await db.query(
        'SELECT * FROM class WHERE module_id = $1 ORDER BY order_position', 
        [moduleId]
      );
      return result.rows;
    } catch (error) {
      console.error('💥 Erro ao buscar aulas do módulo:', error);
      throw error;
    }
  }

  // 🔍 BUSCAR AULA POR NOME
  static async getClassByName(name) {
    try {
      const result = await db.query('SELECT * FROM class WHERE name = $1', [name]);
      return result.rows[0];
    } catch (error) {
      console.error('💥 Erro ao buscar aula por nome:', error);
      throw error;
    }
  }

  // ➕ CRIAR NOVA AULA
  static async createClass(data) {
    try {
      const result = await db.query(
        'INSERT INTO class (name, description, duration, video_url, module_id, order_position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [data.name, data.description, data.duration, data.video_url, data.module_id, data.order_position]
      );
      return result.rows[0];
    } catch (error) {
      console.error('💥 Erro ao criar aula:', error);
      throw error;
    }
  }

  // ✏️ ATUALIZAR AULA
  static async updateClass(id, name, description, duration, video_url, order_position) {
    try {
      const result = await db.query(
        'UPDATE class SET name = $1, description = $2, duration = $3, video_url = $4, order_position = $5 WHERE id = $6 RETURNING *',
        [name, description, duration, video_url, order_position, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('💥 Erro ao atualizar aula:', error);
      throw error;
    }
  }

  // 🗑️ DELETAR AULA
  static async deleteClass(id) {
    try {
      const result = await db.query('DELETE FROM class WHERE id = $1 RETURNING *', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('💥 Erro ao deletar aula:', error);
      throw error;
    }
  }

  // 📊 BUSCAR AULAS COM INFORMAÇÕES DO MÓDULO
  static async getClassesWithModuleInfo() {
    try {
      const result = await db.query(`
        SELECT 
          c.*,
          m.name as module_name,
          m.description as module_description,
          m.trail_id,
          t.name as trail_name
        FROM class c
        LEFT JOIN module m ON c.module_id = m.id
        LEFT JOIN trail t ON m.trail_id = t.id
        ORDER BY c.module_id, c.order_position
      `);
      return result.rows;
    } catch (error) {
      console.error('💥 Erro ao buscar aulas com informações do módulo:', error);
      throw error;
    }
  }

  // 🔢 CONTAR AULAS POR MÓDULO
  static async getClassCountByModule(moduleId) {
    try {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM class WHERE module_id = $1', 
        [moduleId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('💥 Erro ao contar aulas do módulo:', error);
      throw error;
    }
  }

  // 📈 BUSCAR PRÓXIMA POSIÇÃO DISPONÍVEL
  static async getNextOrderPosition(moduleId) {
    try {
      const result = await db.query(
        'SELECT COALESCE(MAX(order_position), 0) + 1 as next_position FROM class WHERE module_id = $1', 
        [moduleId]
      );
      return result.rows[0].next_position;
    } catch (error) {
      console.error('💥 Erro ao buscar próxima posição:', error);
      throw error;
    }
  }

  // 🎯 BUSCAR PRIMEIRA AULA DO MÓDULO
  static async getFirstClassByModule(moduleId) {
    try {
      const result = await db.query(
        'SELECT * FROM class WHERE module_id = $1 ORDER BY order_position LIMIT 1', 
        [moduleId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('💥 Erro ao buscar primeira aula:', error);
      throw error;
    }
  }

  // 🎯 BUSCAR ÚLTIMA AULA DO MÓDULO
  static async getLastClassByModule(moduleId) {
    try {
      const result = await db.query(
        'SELECT * FROM class WHERE module_id = $1 ORDER BY order_position DESC LIMIT 1', 
        [moduleId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('💥 Erro ao buscar última aula:', error);
      throw error;
    }
  }

  // ↗️ BUSCAR PRÓXIMA AULA
  static async getNextClass(moduleId, currentOrderPosition) {
    try {
      const result = await db.query(
        'SELECT * FROM class WHERE module_id = $1 AND order_position > $2 ORDER BY order_position LIMIT 1', 
        [moduleId, currentOrderPosition]
      );
      return result.rows[0];
    } catch (error) {
      console.error('💥 Erro ao buscar próxima aula:', error);
      throw error;
    }
  }

  // ↖️ BUSCAR AULA ANTERIOR
  static async getPreviousClass(moduleId, currentOrderPosition) {
    try {
      const result = await db.query(
        'SELECT * FROM class WHERE module_id = $1 AND order_position < $2 ORDER BY order_position DESC LIMIT 1', 
        [moduleId, currentOrderPosition]
      );
      return result.rows[0];
    } catch (error) {
      console.error('💥 Erro ao buscar aula anterior:', error);
      throw error;
    }
  }
}

module.exports = ClassModel;