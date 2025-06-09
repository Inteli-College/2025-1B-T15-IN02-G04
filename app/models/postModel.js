const db = require('../config/db');

class PostModel {
  static async getAllPosts() {
    try {
      const result = await db.query('SELECT * FROM post ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar todos os posts:", error);
      throw error;
    }
  }

  static async getPostById(id) {
    try {
      const result = await db.query('SELECT * FROM post WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar post por ID:", error);
      throw error;
    }
  }

  static async createPost(data) {
    try {
      const result = await db.query(
        'INSERT INTO post (id_user, title, description, image) VALUES ($1, $2, $3, $4) RETURNING *',
        [data.id_user, data.title, data.description, data.image]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar post:", error);
      throw error;
    }
  }

  static async updatePost(id, data) {
    try {
      const result = await db.query(
        'UPDATE post SET title = $1, description = $2, image = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [data.title, data.description, data.image, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao atualizar post:", error);
      throw error;
    }
  }

  static async deletePost(id) {
    try {
      const result = await db.query('DELETE FROM post WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Erro ao deletar post:", error);
      throw error;
    }
  }
}

module.exports = PostModel;