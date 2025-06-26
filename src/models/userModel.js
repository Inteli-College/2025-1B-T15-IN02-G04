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
        `SELECT u.id,
                u.name,
                u.score,
                COALESCE(array_agg(r.role_name) FILTER (WHERE r.role_name IS NOT NULL), '{}') AS roles
         FROM "user" u
         LEFT JOIN role_user ru ON ru.id_user = u.id
         LEFT JOIN role r ON r.id = ru.id_role
         GROUP BY u.id
         ORDER BY u.score DESC`
      );
      return result.rows.map((row) => {
        let rolesParsed = [];
        if (Array.isArray(row.roles)) {
          rolesParsed = row.roles;
        } else if (typeof row.roles === "string") {
          // Remove chaves { } e divide por vírgula
          rolesParsed = row.roles.replace(/^{|}$/g, "").split(",").filter(Boolean);
        }
        return { ...row, roles: rolesParsed };
      });
    } catch (err) {
      console.error("Erro ao listar usuários por score:", err);
      throw new Error("Erro ao buscar ranking de usuários");
    }
  }

  static async buscarPorId(id) {
    try {
      console.log('🔍 [DEBUG] Executando consulta buscarPorId para ID:', id);
      
      // Consulta corrigida - buscar apenas informações básicas do usuário
      const result = await db.query(
        'SELECT id, name, email, score FROM "user" WHERE id = $1',
        [id]
      );

      console.log('📊 [DEBUG] Resultado da consulta buscarPorId:', {
        rowCount: result.rows.length,
        firstRow: result.rows[0] || 'nenhum'
      });

      return result.rows[0];
    } catch (err) {
      console.error("❌ [DEBUG] Erro ao buscar usuário por ID:", err);
      throw new Error("Erro ao buscar usuário");
    }
  }

  static async buscarRolesPorUsuario(userId) {
    try {
      console.log('🔍 [DEBUG] Buscando roles para userId:', userId);
      
      const result = await db.query(`
        SELECT ru.id_role, r.role_name, r.description
        FROM role_user ru
        INNER JOIN role r ON ru.id_role = r.id
        WHERE ru.id_user = $1
        ORDER BY ru.id_role
      `, [userId]);

      console.log('📊 [DEBUG] Resultado buscarRolesPorUsuario:', {
        userId: userId,
        rowCount: result.rows.length,
        roles: result.rows
      });

      // Verificar especificamente se tem role_id = 1
      const hasAdminRole = result.rows.some(role => {
        console.log('🔍 [DEBUG] Verificando role_id:', role.id_role, 'tipo:', typeof role.id_role);
        return parseInt(role.id_role) === 1;
      });

      console.log('👑 [DEBUG] Tem role admin (id=1)?', hasAdminRole);

      return result.rows;
    } catch (err) {
      console.error("❌ [DEBUG] Erro ao buscar roles do usuário:", err);
      throw new Error("Erro ao buscar roles do usuário");
    }
  }

  static async createUser({ name, email, password, username }) {
    try {
      const hashed = await bcrypt.hash(password, 10);
      const uname = username || (email ? email.split('@')[0] : name.replace(/\s+/g,'').toLowerCase());
      const result = await db.query(
        'INSERT INTO "user" (name, email, username, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
        [name, email, uname, hashed]
      );
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        throw new Error('EMAIL_DUPLICATE');
      }
      console.error("Erro ao criar usuário:", err);
      throw new Error("Erro ao criar usuário");
    }
  }

  static async assignRoleToUser(userId, roleId) {
    try {
      await db.query(
        'INSERT INTO role_user (id_user, id_role) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, roleId]
      );
    } catch (err) {
      console.error("Erro ao atribuir role ao usuário:", err);
      throw new Error("Erro ao atribuir role ao usuário");
    }
  }

  static async deleteUser(userId) {
    try {
      await db.query('DELETE FROM "user" WHERE id = $1', [userId]);
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      throw new Error("Erro ao deletar usuário");
    }
  }
}

module.exports = UserModel;