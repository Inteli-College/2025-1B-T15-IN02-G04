const { HierarchyModel, DashboardModel, UserModel } = require('../models');
const bcrypt = require('bcrypt');
const db = require('../config/db');

class ModalController {
  /**
   * Modal: Adicionar PTD à equipe (PE - PTDs na Equipe)
   * POST /api/modals/add-ptd-to-team
   */
  static async addPTDToTeamModal(req, res) {
    try {
      const userId = req.userId;
      const { ptdId } = req.body;
      
      // Verificar se é Gestor
      if (!req.isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      if (!ptdId || isNaN(ptdId)) {
        return res.status(400).json({ 
          error: 'ID do PTD inválido',
          field: 'ptdId'
        });
      }
      
      // Verificar se o PTD existe e tem role adequado
      const ptdUser = await UserModel.buscarPorId(parseInt(ptdId));
      if (!ptdUser) {
        return res.status(404).json({ error: 'PTD não encontrado' });
      }
      
      const isPTD = await DashboardModel.hasRole(parseInt(ptdId), 3);
      if (!isPTD) {
        return res.status(400).json({ error: 'Usuário selecionado não é um PTD' });
      }
      
      // Verificar se já está na equipe
      const canManage = await HierarchyModel.canManagePTD(userId, parseInt(ptdId));
      if (canManage) {
        return res.status(409).json({ error: 'PTD já está na sua equipe' });
      }
      
      // Adicionar à equipe
      const relationship = await HierarchyModel.addPTDToTeam(userId, parseInt(ptdId));
      
      return res.status(201).json({
        success: true,
        message: 'PTD adicionado à equipe com sucesso',
        data: {
          relationshipId: relationship.id,
          ptdData: {
            id: ptdUser.id,
            name: ptdUser.name,
            email: ptdUser.email
          }
        }
      });

    } catch (error) {
      console.error('Erro no modal de adicionar PTD:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  /**
   * Modal: Atribuir trilha a PTD (ATTR - Atribuir Trilha)
   * POST /api/modals/assign-trail-to-ptd
   */
  static async assignTrailModal(req, res) {
    try {
      const userId = req.userId;
      const { ptdId, trailId, permissions } = req.body;
      
      // Verificar se é Gestor
      if (!req.isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      // Validações
      if (!ptdId || isNaN(ptdId)) {
        return res.status(400).json({ 
          error: 'PTD é obrigatório',
          field: 'ptdId'
        });
      }
      
      if (!trailId || isNaN(trailId)) {
        return res.status(400).json({ 
          error: 'Trilha é obrigatória',
          field: 'trailId'
        });
      }
      
      // Verificar se o PTD está na equipe
      const canManage = await HierarchyModel.canManagePTD(userId, parseInt(ptdId));
      if (!canManage) {
        return res.status(403).json({ 
          error: 'PTD selecionado não está na sua equipe' 
        });
      }
      
      // Verificar se a trilha existe
      const trailExists = await db.query('SELECT id, name FROM trail WHERE id = $1', [parseInt(trailId)]);
      if (trailExists.rows.length === 0) {
        return res.status(404).json({ error: 'Trilha não encontrada' });
      }
      
      // Verificar se já foi atribuída
      const existingAssignment = await db.query(`
        SELECT ht.id
        FROM hierarchy_trail ht
        JOIN hierarchy h ON ht.id_hierarchy = h.id
        JOIN role_user ru1 ON h.id_role_user1 = ru1.id
        JOIN role_user ru2 ON h.id_role_user2 = ru2.id
        WHERE ru1.id_user = $1 AND ru2.id_user = $2 AND ht.id_trail = $3
      `, [userId, parseInt(ptdId), parseInt(trailId)]);
      
      if (existingAssignment.rows.length > 0) {
        return res.status(409).json({ 
          error: 'Esta trilha já foi atribuída a este PTD' 
        });
      }
      
      // Atribuir trilha
      const assignment = await HierarchyModel.assignTrailToPTD(
        userId, 
        parseInt(ptdId), 
        parseInt(trailId), 
        permissions || null
      );
      
      // Buscar dados para resposta
      const ptdData = await UserModel.buscarPorId(parseInt(ptdId));
      const trailData = trailExists.rows[0];
      
      return res.status(201).json({
        success: true,
        message: 'Trilha atribuída com sucesso',
        data: {
          assignmentId: assignment.id,
          ptd: {
            id: ptdData.id,
            name: ptdData.name
          },
          trail: {
            id: trailData.id,
            name: trailData.name
          },
          permissions: permissions
        }
      });

    } catch (error) {
      console.error('Erro no modal de atribuir trilha:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  /**
   * Modal: Criar PTD (CPTD - Criar PTD)
   * POST /api/modals/create-ptd
   */
  static async createPTDModal(req, res) {
    try {
      const userId = req.userId;
      const { name, email, username, password } = req.body;
      
      // Verificar se é Gestor
      if (!req.isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      // Validações detalhadas
      const validationErrors = [];
      
      if (!name || name.trim().length < 2) {
        validationErrors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres' });
      }
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        validationErrors.push({ field: 'email', message: 'Email deve ter formato válido' });
      }
      
      if (!username || username.trim().length < 3) {
        validationErrors.push({ field: 'username', message: 'Username deve ter pelo menos 3 caracteres' });
      }
      
      if (!password || password.length < 6) {
        validationErrors.push({ field: 'password', message: 'Senha deve ter pelo menos 6 caracteres' });
      }
      
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          validationErrors
        });
      }
      
      // Verificar duplicatas
      const existingUser = await db.query(`
        SELECT 
          CASE WHEN email = $1 THEN 'email'
               WHEN username = $2 THEN 'username'
          END as duplicate_field
        FROM "user" 
        WHERE email = $1 OR username = $2
        LIMIT 1
      `, [email.trim(), username.trim()]);
      
      if (existingUser.rows.length > 0) {
        const field = existingUser.rows[0].duplicate_field;
        return res.status(409).json({ 
          error: `${field === 'email' ? 'Email' : 'Username'} já está em uso`,
          field
        });
      }
      
      // Iniciar transação
      await db.query('BEGIN');
      
      try {
        // Criptografar senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Criar usuário
        const userResult = await db.query(
          'INSERT INTO "user" (name, email, username, password, score) VALUES ($1, $2, $3, $4, 0) RETURNING id',
          [name.trim(), email.trim(), username.trim(), hashedPassword]
        );
        
        const newUserId = userResult.rows[0].id;
        
        // Atribuir role PTD (id_role = 3)
        await db.query(
          'INSERT INTO role_user (id_user, id_role) VALUES ($1, 3)',
          [newUserId]
        );
        
        // Adicionar automaticamente à equipe do gestor
        await HierarchyModel.addPTDToTeam(userId, newUserId);
        
        await db.query('COMMIT');
        
        return res.status(201).json({
          success: true,
          message: 'PTD criado e adicionado à equipe com sucesso',
          data: {
            id: newUserId,
            name: name.trim(),
            email: email.trim(),
            username: username.trim(),
            role: 'PTD'
          }
        });
        
      } catch (dbError) {
        await db.query('ROLLBACK');
        throw dbError;
      }

    } catch (error) {
      console.error('Erro no modal de criar PTD:', error);
      
      // Tratamento específico de erros de banco
      if (error.code === '23505') { // Unique violation
        const field = error.constraint.includes('email') ? 'email' : 'username';
        return res.status(409).json({ 
          error: `${field === 'email' ? 'Email' : 'Username'} já está em uso`,
          field
        });
      }
      
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  /**
   * Modal: Criar Gestor/Admin (CRGA - Criar Gestor/Admin)
   * POST /api/modals/create-gestor-admin
   */
  static async createGestorAdminModal(req, res) {
    try {
      const userId = req.userId;
      const { name, email, username, password, id_role } = req.body;
      
      // Verificar se é Admin
      if (!req.isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      // Validações detalhadas
      const validationErrors = [];
      
      if (!name || name.trim().length < 2) {
        validationErrors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres' });
      }
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        validationErrors.push({ field: 'email', message: 'Email deve ter formato válido' });
      }
      
      if (!username || username.trim().length < 3) {
        validationErrors.push({ field: 'username', message: 'Username deve ter pelo menos 3 caracteres' });
      }
      
      if (!password || password.length < 8) {
        validationErrors.push({ field: 'password', message: 'Senha deve ter pelo menos 8 caracteres' });
      }
      
      if (!id_role || ![1, 2].includes(parseInt(id_role))) {
        validationErrors.push({ field: 'id_role', message: 'Selecione um cargo válido' });
      }
      
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          validationErrors
        });
      }
      
      // Verificar duplicatas
      const existingUser = await db.query(`
        SELECT 
          CASE WHEN email = $1 THEN 'email'
               WHEN username = $2 THEN 'username'
          END as duplicate_field
        FROM "user" 
        WHERE email = $1 OR username = $2
        LIMIT 1
      `, [email.trim(), username.trim()]);
      
      if (existingUser.rows.length > 0) {
        const field = existingUser.rows[0].duplicate_field;
        return res.status(409).json({ 
          error: `${field === 'email' ? 'Email' : 'Username'} já está em uso`,
          field
        });
      }
      
      // Iniciar transação
      await db.query('BEGIN');
      
      try {
        // Criptografar senha (maior segurança para admins/gestores)
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Criar usuário
        const userResult = await db.query(
          'INSERT INTO "user" (name, email, username, password, score) VALUES ($1, $2, $3, $4, 0) RETURNING id',
          [name.trim(), email.trim(), username.trim(), hashedPassword]
        );
        
        const newUserId = userResult.rows[0].id;
        
        // Atribuir role
        await db.query(
          'INSERT INTO role_user (id_user, id_role) VALUES ($1, $2)',
          [newUserId, parseInt(id_role)]
        );
        
        await db.query('COMMIT');
        
        const roleNames = { 1: 'Admin', 2: 'Gestor' };
        const roleName = roleNames[parseInt(id_role)];
        
        return res.status(201).json({
          success: true,
          message: `${roleName} criado com sucesso`,
          data: {
            id: newUserId,
            name: name.trim(),
            email: email.trim(),
            username: username.trim(),
            role: roleName
          }
        });
        
      } catch (dbError) {
        await db.query('ROLLBACK');
        throw dbError;
      }

    } catch (error) {
      console.error('Erro no modal de criar Gestor/Admin:', error);
      
      // Tratamento específico de erros de banco
      if (error.code === '23505') { // Unique violation
        const field = error.constraint.includes('email') ? 'email' : 'username';
        return res.status(409).json({ 
          error: `${field === 'email' ? 'Email' : 'Username'} já está em uso`,
          field
        });
      }
      
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  /**
   * Buscar dados para modal de adicionar PTD
   * GET /api/modals/add-ptd-data
   */
  static async getAddPTDModalData(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Gestor
      if (!req.isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      const availablePTDs = await HierarchyModel.getAvailablePTDs(userId);
      
      return res.status(200).json({
        success: true,
        data: {
          availablePTDs,
          totalAvailable: availablePTDs.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar dados do modal:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  /**
   * Buscar dados para modal de atribuir trilha
   * GET /api/modals/assign-trail-data
   */
  static async getAssignTrailModalData(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Gestor
      if (!req.isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      const [teamMembers, availableTrails] = await Promise.all([
        HierarchyModel.getTeamMembers(userId),
        HierarchyModel.getAvailableTrailsForAssignment()
      ]);
      
      return res.status(200).json({
        success: true,
        data: {
          teamMembers,
          availableTrails,
          totalMembers: teamMembers.length,
          totalTrails: availableTrails.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar dados do modal:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  /**
   * Filtrar PTDs disponíveis por busca
   * GET /api/modals/search-available-ptds
   */
  static async searchAvailablePTDs(req, res) {
    try {
      const userId = req.userId;
      const { search = '' } = req.query;
      
      // Verificar se é Gestor
      if (!req.isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      let availablePTDs = await HierarchyModel.getAvailablePTDs(userId);
      
      // Filtrar por busca se fornecida
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        availablePTDs = availablePTDs.filter(ptd => 
          ptd.ptdName.toLowerCase().includes(searchLower) ||
          ptd.ptdEmail.toLowerCase().includes(searchLower)
        );
      }
      
      return res.status(200).json({
        success: true,
        data: availablePTDs,
        searchTerm: search,
        totalResults: availablePTDs.length
      });

    } catch (error) {
      console.error('Erro ao buscar PTDs disponíveis:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  /**
   * Validar dados antes de abrir modal
   * POST /api/modals/validate-data
   */
  static async validateModalData(req, res) {
    try {
      const { modalType, data } = req.body;
      
      const validationResults = {};
      
      switch (modalType) {
        case 'create-ptd':
          validationResults.email = await ModalController.validateEmailUnique(data.email);
          validationResults.username = await ModalController.validateUsernameUnique(data.username);
          break;
          
        case 'create-gestor-admin':
          validationResults.email = await ModalController.validateEmailUnique(data.email);
          validationResults.username = await ModalController.validateUsernameUnique(data.username);
          break;
          
        case 'assign-trail':
          validationResults.assignment = await ModalController.validateTrailAssignment(
            req.userId, data.ptdId, data.trailId
          );
          break;
          
        default:
          return res.status(400).json({ error: 'Tipo de modal inválido' });
      }
      
      return res.status(200).json({
        success: true,
        validationResults
      });

    } catch (error) {
      console.error('Erro na validação de dados do modal:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  /**
   * Métodos auxiliares de validação
   */
  static async validateEmailUnique(email) {
    if (!email) return { valid: false, message: 'Email é obrigatório' };
    
    try {
      const result = await db.query('SELECT id FROM "user" WHERE email = $1', [email]);
      return { 
        valid: result.rows.length === 0, 
        message: result.rows.length > 0 ? 'Email já está em uso' : 'Email disponível'
      };
    } catch (error) {
      return { valid: false, message: 'Erro ao validar email' };
    }
  }

  static async validateUsernameUnique(username) {
    if (!username) return { valid: false, message: 'Username é obrigatório' };
    
    try {
      const result = await db.query('SELECT id FROM "user" WHERE username = $1', [username]);
      return { 
        valid: result.rows.length === 0, 
        message: result.rows.length > 0 ? 'Username já está em uso' : 'Username disponível'
      };
    } catch (error) {
      return { valid: false, message: 'Erro ao validar username' };
    }
  }

  static async validateTrailAssignment(gestorId, ptdId, trailId) {
    try {
      // Verificar se PTD está na equipe
      const canManage = await HierarchyModel.canManagePTD(gestorId, ptdId);
      if (!canManage) {
        return { valid: false, message: 'PTD não está na sua equipe' };
      }
      
      // Verificar se trilha já foi atribuída
      const existing = await db.query(`
        SELECT ht.id
        FROM hierarchy_trail ht
        JOIN hierarchy h ON ht.id_hierarchy = h.id
        JOIN role_user ru1 ON h.id_role_user1 = ru1.id
        JOIN role_user ru2 ON h.id_role_user2 = ru2.id
        WHERE ru1.id_user = $1 AND ru2.id_user = $2 AND ht.id_trail = $3
      `, [gestorId, ptdId, trailId]);
      
      return { 
        valid: existing.rows.length === 0, 
        message: existing.rows.length > 0 ? 'Trilha já foi atribuída a este PTD' : 'Atribuição válida'
      };
    } catch (error) {
      return { valid: false, message: 'Erro ao validar atribuição' };
    }
  }
}

module.exports = ModalController;