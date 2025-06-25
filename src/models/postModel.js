const db = require("../config/db");

class PostModel {
  static async criarPost({ id_user, titulo, descricao, imagem }) {
    try {
      const result = await db.query(
        `INSERT INTO post (id_user, titulo, descricao, imagem)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id_user, titulo, descricao, imagem]
      );

      return result.rows[0];
    } catch (err) {
      console.error("Erro ao criar post:", err);
      throw new Error("Erro ao criar post");
    }
  }

  static async listarTodos() {
    try {
      const result = await db.query(
        `SELECT p.id_post, p.titulo, p.descricao, p.imagem, p.criado_em, u.name AS autor
         FROM post p
         JOIN "user" u ON p.id_user = u.id
         ORDER BY p.criado_em DESC`
      );

      return result.rows;
    } catch (err) {
      console.error("Erro ao listar posts:", err);
      throw new Error("Erro ao buscar posts");
    }
  }

  static async buscarPorId(id_post) {
    try {
      const result = await db.query(
        `SELECT p.id_post, p.titulo, p.descricao, p.imagem, p.criado_em, u.name AS autor
         FROM post p
         JOIN "user" u ON p.id_user = u.id
         WHERE p.id_post = $1`,
        [id_post]
      );

      return result.rows[0];
    } catch (err) {
      console.error("Erro ao buscar post por ID:", err);
      throw new Error("Erro ao buscar post");
    }
  }

  static async deletarPost(id_post) {
    try {
      await db.query(`DELETE FROM post WHERE id_post = $1`, [id_post]);

      return { message: "Post deletado com sucesso" };
    } catch (err) {
      console.error("Erro ao deletar post:", err);
      throw new Error("Erro ao deletar post");
    }
  }
}

module.exports = PostModel;
