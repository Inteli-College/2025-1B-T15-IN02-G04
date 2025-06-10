const db = require('../config/db');

class LikeModel {
  static async createLike(data) {
    try {
      const result = await db.query(
        'INSERT INTO "user_like" (id_user, id_post, liked) VALUES ($1, $2, $3) RETURNING *',
        [data.id_user, data.id_post, data.liked]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar like:", error);
      throw error;
    }
  }

  static async deleteLike(id) {
    try {
      const result = await db.query('DELETE FROM "user_like" WHERE id = $1', [id]);
      return result.rowCount > 0;
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
         WHERE ul.id_post = $1 AND ul.liked = true`,
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
        `SELECT ul.*, p.tittle as post_title 
         FROM "user_like" ul 
         JOIN post p ON ul.id_post = p.id 
         WHERE ul.id_user = $1 AND ul.liked = true`,
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
        'SELECT COUNT(*) as count FROM "user_like" WHERE id_post = $1 AND liked = true',
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
      // Verifica se já existe um like
      const existingLike = await db.query(
        'SELECT * FROM "user_like" WHERE id_user = $1 AND id_post = $2',
        [userId, postId]
      );

      if (existingLike.rows.length > 0) {
        // Se existe, inverte o estado do like
        const result = await db.query(
          'UPDATE "user_like" SET liked = NOT liked WHERE id_user = $1 AND id_post = $2 RETURNING *',
          [userId, postId]
        );
        return result.rows[0];
      } else {
        // Se não existe, cria um novo like
        const result = await db.query(
          'INSERT INTO "user_like" (id_user, id_post, liked) VALUES ($1, $2, true) RETURNING *',
          [userId, postId]
        );
        return result.rows[0];
      }
    } catch (error) {
      console.error("Erro ao alternar like:", error);
      throw error;
    }
  }
}

module.exports = LikeModel; 