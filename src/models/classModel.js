const db = require('../config/db');

class ClassModel {
  static async getAllClasses() {
    try {
      const result = await db.query('SELECT * FROM class');
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar todas as aulas:", error);
      throw error;
    }
  }

  static async getClassById(id) {
    try {
      const result = await db.query('SELECT * FROM class WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar aula por ID:", error);
      throw error;
    }
  }

  static async getClassesByModuleId(id_module) {
    try {
      const result = await db.query('SELECT * FROM class WHERE id_module = $1', [id_module]);
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar aulas por módulo:", error);
      throw error;
    }
  }

  static async createClass(data) {
    try {
      const result = await db.query(
        'INSERT INTO class (name, description, id_module, class_order) VALUES ($1, $2, $3, $4) RETURNING *',
        [data.name, data.description, data.id_module, data.class_order]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar aula:", error);
      throw error;
    }
  }

  static async updateClass(id, name, description, id_module, class_order) {
    try {
      const result = await db.query(
        'UPDATE class SET name = $1, description = $2, id_module = $3, class_order = $4 WHERE id = $5 RETURNING *',
        [name, description, id_module,  class_order, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao atualizar aula:", error);
      throw error;
    }
  }

  static async deleteClass(id) {
    try {
      const result = await db.query('DELETE FROM class WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Erro ao deletar aula:", error);
      throw error;
    }
  }
}

module.exports = ClassModel;