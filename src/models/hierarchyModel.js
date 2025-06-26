const db = require("../config/db");

class HierarchyModel {
  /**
   * Retorna lista de PTDs (usuários com profile PTD) de um Gestor.
   * @param {number} gestorId - id do usuário Gestor
   */
  static async getTeamMembers(gestorId) {
    const query = `
      SELECT u.id, u.name, u.email, u.score
      FROM hierarchy h
      JOIN role_user ru_gestor ON ru_gestor.id = h.id_role_user1
      JOIN role_user ru_ptd   ON ru_ptd.id   = h.id_role_user2
      JOIN "user" u          ON u.id        = ru_ptd.id_user
      WHERE ru_gestor.id_user = $1
    `;
    try {
      const result = await db.query(query, [gestorId]);
      return result.rows;
    } catch (err) {
      console.error("Erro em getTeamMembers:", err);
      throw new Error("Erro ao buscar membros da equipe");
    }
  }

  /**
   * Retorna o id da relação hierarchy entre Gestor e PTD, se existir.
   */
  static async getHierarchyId(gestorId, ptdId) {
    const query = `
      SELECT h.id
      FROM hierarchy h
      JOIN role_user ru_gestor ON ru_gestor.id = h.id_role_user1
      JOIN role_user ru_ptd   ON ru_ptd.id   = h.id_role_user2
      WHERE ru_gestor.id_user = $1 AND ru_ptd.id_user = $2
      LIMIT 1`;
    try {
      const result = await db.query(query, [gestorId, ptdId]);
      return result.rows[0]?.id || null;
    } catch (err) {
      console.error("Erro em getHierarchyId:", err);
      throw new Error("Erro ao verificar hierarchy");
    }
  }

  /**
   * Atribui uma trilha a um PTD. Cria a relação hierarchy se inexistente.
   */
  static async assignTrailToPTD(gestorId, ptdId, trailId) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // Garante que existe hierarchy
      const hierarchyId = await this._ensureHierarchy(client, gestorId, ptdId);

      // Insere na hierarchy_trail se não existir
      const insertTrail = `
        INSERT INTO hierarchy_trail (id_hierarchy, id_trail)
        VALUES ($1, $2)
        ON CONFLICT (id_hierarchy, id_trail) DO NOTHING`;
      await client.query(insertTrail, [hierarchyId, trailId]);

      await client.query("COMMIT");
      return { hierarchyId };
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Erro em assignTrailToPTD:", err);
      throw new Error("Erro ao atribuir trilha ao PTD");
    } finally {
      client.release();
    }
  }

  /**
   * Remove associação de trilha para um PTD.
   */
  static async removeTrailFromPTD(gestorId, ptdId, trailId) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const hierarchyId = await this.getHierarchyId(gestorId, ptdId);
      if (!hierarchyId) {
        throw new Error("Relação gestor-PTD não encontrada");
      }
      const del = `DELETE FROM hierarchy_trail WHERE id_hierarchy = $1 AND id_trail = $2`;
      await client.query(del, [hierarchyId, trailId]);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Erro em removeTrailFromPTD:", err);
      throw new Error("Erro ao remover trilha do PTD");
    } finally {
      client.release();
    }
  }

  /**
   * Retorna as trilhas atribuídas a um PTD.
   */
  static async getTrailsByPTD(ptdId) {
    const query = `
      SELECT t.*
      FROM hierarchy_trail ht
      JOIN hierarchy h ON h.id = ht.id_hierarchy
      JOIN role_user ru_ptd ON ru_ptd.id = h.id_role_user2
      JOIN trail t ON t.id = ht.id_trail
      WHERE ru_ptd.id_user = $1`;
    try {
      const result = await db.query(query, [ptdId]);
      return result.rows;
    } catch (err) {
      console.error("Erro em getTrailsByPTD:", err);
      throw new Error("Erro ao buscar trilhas do PTD");
    }
  }

  /**
   * Garante existência de hierarchy e retorna seu id.
   * @private
   */
  static async _ensureHierarchy(client, gestorId, ptdId) {
    const select = `
      SELECT h.id
      FROM hierarchy h
      JOIN role_user ru_gestor ON ru_gestor.id = h.id_role_user1
      JOIN role_user ru_ptd   ON ru_ptd.id   = h.id_role_user2
      WHERE ru_gestor.id_user = $1 AND ru_ptd.id_user = $2
      LIMIT 1`;
    const { rows } = await client.query(select, [gestorId, ptdId]);
    if (rows[0]) return rows[0].id;

    // Caso não exista, precisamos das ids de role_user
    const roleUserQuery = `SELECT id FROM role_user WHERE id_user = $1 AND id_role = $2 LIMIT 1`;
    const { rows: gestorRU } = await client.query(roleUserQuery, [gestorId, 2]);
    const { rows: ptdRU }    = await client.query(roleUserQuery, [ptdId,   3]);

    if (!gestorRU[0] || !ptdRU[0]) {
      throw new Error("IDs de role_user não encontrados para Gestor/PTD");
    }

    const insertHierarchy = `
      INSERT INTO hierarchy (id_role_user1, id_role_user2)
      VALUES ($1, $2) RETURNING id`;
    const { rows: inserted } = await client.query(insertHierarchy, [gestorRU[0].id, ptdRU[0].id]);
    return inserted[0].id;
  }
}

module.exports = HierarchyModel; 