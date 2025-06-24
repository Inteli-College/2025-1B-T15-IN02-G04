const db = require("../config/db");
const bcrypt = require("bcrypt");

class UserModel {
  static async verificarCredenciais(email, senha) {
    try {
      const result = await db.query('SELECT * FROM "user" WHERE email = $1', 
        [email]);
      const usuario = result.rows[0];

      if (!usuario) {
        console.log(`Tentativa de login: Email não encontrado - ${email}`);
        return { error: "Email não encontrado" };
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.password);

      if (senhaCorreta) {
        console.log(`Login bem-sucedido para: ${email}`);
        const { hash_senha, ...usuarioSemSenha } = usuario;
        return { user: usuarioSemSenha };
      } else {
        console.log(`Senha incorreta para - ${email}`);
        return { error: "Senha incorreta" };
      }
    } catch (err) {
      console.error("Erro ao verificar credenciais:", err);
      throw new Error("Erro no serviço de autenticação");
    }
  }

  static async listarUsuariosPorScore() {
    try {
      const result = await db.query(
        'SELECT nome, score FROM "user" ORDER BY score DESC'
      );
      return result.rows;
    } catch (err) {
      console.error("Erro ao listar usuários por score:", err);
      throw new Error("Erro ao buscar ranking de usuários");
    }
  }

  static async buscarPorId(id) {
    try {
      const result = await db.query(
        'SELECT "user".id, "user".first_name, "user".last_name, "user".email, "user".score, r.role_name FROM "user", role r, role_user ru WHERE "user".id = $1 AND "user".id = ru.id_user AND r.id = ru.id_role',
        [id]
      );

      return result.rows[0];
    } catch (err) {
      console.error("Erro ao buscar usuário por ID:", err);
      throw new Error("Erro ao buscar usuário");
    }
  }
}

module.exports = UserModel;
