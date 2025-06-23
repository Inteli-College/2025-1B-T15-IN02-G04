const db = require('../config/db');

class CardModel {
  static async getAllCards() {
    const result = await db.query('SELECT * FROM card');
    return result.rows;
      } catch (error) {
      console.error('Erro ao buscar card:', error);
      throw error;
  }


  static async getCardById(id) {
    const result = await db.query('SELECT * FROM card WHERE id = $1', [id]);
    return result.rows[0];
        } catch (error) {
      console.error('Erro ao buscar card:', error);
      throw error;
  }

  static async getCardByTitle(title) {
    const result = await db.query('SELECT * FROM card WHERE title = $1', [title]);
    return result.rows[0];
        } catch (error) {
      console.error('Erro ao buscar card:', error);
      throw error;
  }

  static async createCard(data) {
    const result = await db.query(
      'INSERT INTO card (title, description, image) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.description]
    );
    return result.rows[0];
        } catch (error) {
      console.error('Erro ao criar card:', error);
      throw error;
  }

  static async updateCard(id, title, description, image) {
    const result = await db.query( 'UPDATE card SET title = $1, description = $2, image = $3 WHERE id = $4 RETURNING *',
    [title, description, image, id]
    );
    return result.rows[0];
        } catch (error) {
      console.error('Erro ao atualizar card:', error);
      throw error;
  }

  static async deleteCard(id) {
    const result = await db.query('DELETE FROM card WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
        } catch (error) {
      console.error('Erro ao deletar card:', error);
      throw error;
  }
}

module.exports = CardModel;