const db = require('../config/db');

class ClassModel {
  static async getAllClasses() {
    try {
      const result = await db.query('SELECT * FROM class');
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar todas as classes:", error);
      throw error;
    }
  }

  static async getClassById(id) {
    try {
      const result = await db.query('SELECT * FROM class WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar classe por ID:", error);
      throw error;
    }
  }

  static async getClassesByModuleId(moduleId) {
    try {
      const result = await db.query('SELECT * FROM class WHERE id_module = $1', [moduleId]);
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar classes por módulo:", error);
      throw error;
    }
  }

  static async createClass(data) {
    try {
      const result = await db.query(
        'INSERT INTO class (name, description, id_module) VALUES ($1, $2, $3) RETURNING *',
        [data.name, data.description, data.id_module]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar classe:", error);
      throw error;
    }
  }

  static async updateClass(id, name, description, id_module) {
    try {
      const result = await db.query(
        'UPDATE class SET name = $1, description = $2, id_module = $3 WHERE id = $4 RETURNING *',
        [name, description, id_module, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao atualizar classe:", error);
      throw error;
    }
  }

  static async deleteClass(id) {
    try {
      const result = await db.query('DELETE FROM class WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Erro ao deletar classe:", error);
      throw error;
    }
  }
}

module.exports = ClassModel;