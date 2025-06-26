const db = require("../config/db");

class ComentarioModel {
  static async criarComentario({ id_post, id_user, comment_text }) {
    try {
      const result = await db.query(
        `INSERT INTO comment (id_post, id_user, comment_text)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [id_post, id_user, comment_text]
      );

      return result.rows[0];
    } catch (err) {
      console.error("Erro ao criar comentário:", err);
      throw new Error("Erro ao criar comentário");
    }
  }

  static async listarPorPost(id_post) {
    try {
      const result = await db.query(
        `SELECT c.id, c.comment_text, c.created_at, u.name AS autor
         FROM comment c
         JOIN "user" u ON c.id_user = u.id
         WHERE c.id_post = $1
         ORDER BY c.created_at ASC`,
        [id_post]
      );

      return result.rows;
    } catch (err) {
      console.error("Erro ao listar comentários:", err);
      throw new Error("Erro ao buscar comentários");
    }
  }

  static async deletarComentario(id_comentario) {
    try {
      await db.query(`DELETE FROM comment WHERE id = $1`, [id_comentario]);

      return { message: "Comentário deletado com sucesso" };
    } catch (err) {
      console.error("Erro ao deletar comentário:", err);
      throw new Error("Erro ao deletar comentário");
    }
  }
}

module.exports = ComentarioModel;
