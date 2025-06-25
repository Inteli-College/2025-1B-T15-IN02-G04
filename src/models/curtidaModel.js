const db = require("../config/db");

class CurtidaModel {
  static async curtirPost(id_user, id_post) {
    try {
      await db.query(
        `INSERT INTO post_likes (id_user, id_post)
         VALUES ($1, $2)
         ON CONFLICT (id_user, id_post) DO NOTHING`,
        [id_user, id_post]
      );

      return { message: "Post curtido com sucesso" };
    } catch (err) {
      console.error("Erro ao curtir post:", err);
      throw new Error("Erro ao curtir post");
    }
  }

  static async descurtirPost(id_user, id_post) {
    try {
      await db.query(
        `DELETE FROM post_likes
         WHERE id_user = $1 AND id_post = $2`,
        [id_user, id_post]
      );

      return { message: "Curtida removida com sucesso" };
    } catch (err) {
      console.error("Erro ao descurtir post:", err);
      throw new Error("Erro ao remover curtida");
    }
  }

  static async contarCurtidas(id_post) {
    try {
      const result = await db.query(
        `SELECT COUNT(*) AS total
         FROM post_likes
         WHERE id_post = $1`,
        [id_post]
      );

      return parseInt(result.rows[0].total);
    } catch (err) {
      console.error("Erro ao contar curtidas:", err);
      throw new Error("Erro ao contar curtidas");
    }
  }

  static async verificarSeUsuarioCurtiu(id_user, id_post) {
    try {
      const result = await db.query(
        `SELECT 1 FROM post_likes
         WHERE id_user = $1 AND id_post = $2`,
        [id_user, id_post]
      );

      return result.rowCount > 0;
    } catch (err) {
      console.error("Erro ao verificar curtida:", err);
      throw new Error("Erro ao verificar curtida");
    }
  }
}

module.exports = CurtidaModel;
