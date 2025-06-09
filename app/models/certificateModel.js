const db = require('../config/db');

class CertificateModel {
  static async getAllCertificates() {
    const result = await db.query('SELECT * FROM certificate');
    return result.rows;
  }

  static async getCertificateById(id) {
    const result = await db.query('SELECT * FROM certificate WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createCertificate(data) {
    const result = await db.query(
      'INSERT INTO certificate (name, description, date, id_user, id_trail) VALUES ($1, $2) RETURNING *',
      [data.name, data.description, data.date, data.id_user, data.id_trail]
    );
    return result.rows[0];
  }

  static async updateCertificate(id, name, description, date, id_user, id_trail) {
    const result = await db.query( 'UPDATE certificate SET name = $1, description = $2, date = $3, id_user = $4, id_trail = $5 WHERE id = $6 RETURNING *',
    [name, description, date, id_user, id_trail, id]
    );
    return result.rows[0];
  }

  static async deleteCertificate(id) {
    const result = await db.query('DELETE FROM certificate WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
  }
}

module.exports = CertificateModel;