jest.mock('../config/db');
jest.mock('bcrypt');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');

describe('UserModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verificarCredenciais', () => {
    it('deve retornar erro quando email não existir', async () => {
      // Arrange
      db.query.mockResolvedValue({ rows: [] });

      // Act
      const result = await UserModel.verificarCredenciais('a@a.com', '123');

      // Assert
      expect(result).toEqual({ error: 'Email não encontrado' });
    });

    it('deve retornar erro quando senha estiver incorreta', async () => {
      // Arrange
      const userInDB = { id: 1, email: 'a@a.com', password: 'hash' };
      db.query.mockResolvedValue({ rows: [userInDB] });
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await UserModel.verificarCredenciais('a@a.com', 'errada');

      // Assert
      expect(result).toEqual({ error: 'Senha incorreta' });
    });

    it('deve retornar usuário quando senha estiver correta', async () => {
      const userInDB = { id: 1, name: 'User', email: 'a@a.com', password: 'hash' };
      db.query.mockResolvedValue({ rows: [userInDB] });
      bcrypt.compare.mockResolvedValue(true);

      const result = await UserModel.verificarCredenciais('a@a.com', '123');

      expect(result).toEqual({ user: { id: 1, name: 'User', email: 'a@a.com', password: 'hash' } });
    });
  });

  describe('listarUsuariosPorScore', () => {
    it('deve retornar usuários ordenados por score com roles parseadas', async () => {
      // Arrange
      const rows = [
        { id: 1, name: 'A', score: 100, roles: ['admin'] },
        { id: 2, name: 'B', score: 80, roles: ['user'] }
      ];
      db.query.mockResolvedValue({ rows });

      // Act
      const result = await UserModel.listarUsuariosPorScore();

      // Assert
      expect(result).toEqual(rows);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar usuário por id', async () => {
      const row = { id: 5, name: 'Test', email: 't@t.com', score: 10 };
      db.query.mockResolvedValue({ rows: [row] });

      const result = await UserModel.buscarPorId(5);

      expect(result).toEqual(row);
      expect(db.query).toHaveBeenCalledWith('SELECT id, name, email, score FROM "user" WHERE id = $1', [5]);
    });
  });

  describe('buscarRolesPorUsuario', () => {
    it('deve retornar roles do usuário', async () => {
      const roles = [
        { id_role: 1, role_name: 'admin', description: 'Admin' },
        { id_role: 2, role_name: 'user', description: 'User' }
      ];
      db.query.mockResolvedValue({ rows: roles });

      const result = await UserModel.buscarRolesPorUsuario(1);

      expect(result).toEqual(roles);
      expect(db.query).toHaveBeenCalledTimes(1);
    });
  });
}); 