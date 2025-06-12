const db = require('../config/db');

class LikeModel {
  static async createLike(data) {
    try {
      const result = await db.query(
        'INSERT INTO "user_like" (id_user, id_post, liked) VALUES ($1, $2, true) RETURNING *',
        [data.id_user, data.id_post]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar like:", error);
      throw error;
    }
  }

  static async deleteLike(id) {
    try {
      const result = await db.query('DELETE FROM "user_like" WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao deletar like:", error);
      throw error;
    }
  }

  static async getLikesByPost(postId) {
    try {
      const result = await db.query(
        `SELECT ul.*, u.username 
         FROM "user_like" ul 
         JOIN "user" u ON ul.id_user = u.id 
         WHERE ul.id_post = $1`,
        [postId]
      );
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar likes do post:", error);
      throw error;
    }
  }

  static async getLikesByUser(userId) {
    try {
      const result = await db.query(
        `SELECT ul.*, p.title as post_title 
         FROM "user_like" ul 
         JOIN post p ON ul.id_post = p.id 
         WHERE ul.id_user = $1`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar likes do usuário:", error);
      throw error;
    }
  }

  static async getLikeCount(postId) {
    try {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM "user_like" WHERE id_post = $1',
        [postId]
      );
      return result.rows[0].count;
    } catch (error) {
      console.error("Erro ao contar likes:", error);
      throw error;
    }
  }

  static async toggleLike(userId, postId) {
    try {
      // Primeiro, verifica se já existe um like
      const existingLike = await db.query(
        'SELECT * FROM "user_like" WHERE id_user = $1 AND id_post = $2',
        [userId, postId]
      );

      if (existingLike.rows.length > 0) {
        // Se existe, deleta o like
        const deletedLike = await this.deleteLike(existingLike.rows[0].id);
        return { action: 'deleted', like: deletedLike };
      } else {
        // Se não existe, cria um novo like
        const newLike = await this.createLike({ id_user: userId, id_post: postId });
        return { action: 'created', like: newLike };
      }
    } catch (error) {
      console.error("Erro ao alternar like:", error);
      throw error;
    }
  }
}

module.exports = LikeModel; 