const { RankingModel, DashboardModel, HierarchyModel } = require('../models');

class RankingController {
  /**
   * Buscar ranking geral de PTDs - GET /api/ranking/ptd-general
   */
  static async getPTDGeneralRanking(req, res) {
    try {
      const userId = req.userId;
      const { limit = 5, includeUser = true } = req.query;
      
      // Verificar se usuário tem permissão para ver ranking
      if (!req.isPTD && !req.isGestor && !req.isAdmin) {
        return res.status(403).json({ error: 'Acesso negado ao ranking' });
      }
      
      const [generalRanking, userPosition] = await Promise.all([
        RankingModel.getPTDGeneralRanking(parseInt(limit)),
        includeUser === 'true' && req.isPTD 
          ? RankingModel.getPTDRankingPosition(userId)
          : Promise.resolve(null)
      ]);
      
      return res.status(200).json({
        success: true,
        data: {
          ranking: generalRanking,
          userPosition: userPosition,
          limit: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Erro ao buscar ranking geral de PTDs:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar ranking geral',
        details: error.message 
      });
    }
  }

  /**
   * Buscar posição específica no ranking - GET /api/ranking/ptd-position/:ptdId?
   */
  static async getPTDRankingPosition(req, res) {
    try {
      const userId = req.userId;
      const { ptdId } = req.params;
      
      // Determinar qual PTD consultar
      const targetPTDId = ptdId ? parseInt(ptdId) : userId;
      
      // Verificar permissões
      if (ptdId && parseInt(ptdId) !== userId) {
        // Se está consultando outro PTD, verificar se tem permissão
        if (req.isGestor) {
          const canManage = await HierarchyModel.canManagePTD(userId, targetPTDId);
          if (!canManage) {
            return res.status(403).json({ error: 'PTD não está na sua equipe' });
          }
        } else if (!req.isAdmin) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
      }
      
      const userPosition = await RankingModel.getPTDRankingPosition(targetPTDId);
      
      if (!userPosition) {
        return res.status(404).json({ error: 'PTD não encontrado no ranking' });
      }
      
      return res.status(200).json({
        success: true,
        data: userPosition
      });

    } catch (error) {
      console.error('Erro ao buscar posição no ranking:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar posição no ranking',
        details: error.message 
      });
    }
  }

  /**
   * Buscar ranking da equipe (para gestores) - GET /api/ranking/team
   */
  static async getTeamRanking(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Gestor
      if (!req.isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      const teamRanking = await RankingModel.getTeamRanking(userId);
      
      return res.status(200).json({
        success: true,
        data: {
          ranking: teamRanking,
          teamSize: teamRanking.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar ranking da equipe:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar ranking da equipe',
        details: error.message 
      });
    }
  }

  /**
   * Buscar ranking completo paginado - GET /api/ranking/complete
   */
  static async getCompleteRanking(req, res) {
    try {
      const userId = req.userId;
      const { page = 1, limit = 20 } = req.query;
      
      // Verificar se tem permissão (Admin ou Gestor)
      if (!req.isAdmin && !req.isGestor) {
        return res.status(403).json({ error: 'Acesso negado ao ranking completo' });
      }
      
      const rankingData = await RankingModel.getCompletePTDRanking(parseInt(page), parseInt(limit));
      
      return res.status(200).json({
        success: true,
        data: rankingData
      });

    } catch (error) {
      console.error('Erro ao buscar ranking completo:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar ranking completo',
        details: error.message 
      });
    }
  }

  /**
   * Buscar ranking por trilha específica - GET /api/ranking/trail/:trailId
   */
  static async getTrailRanking(req, res) {
    try {
      const userId = req.userId;
      const { trailId } = req.params;
      const { limit = 10 } = req.query;
      
      if (!trailId || isNaN(trailId)) {
        return res.status(400).json({ error: 'ID da trilha inválido' });
      }
      
      // Verificar se tem permissão
      if (!req.isAdmin && !req.isGestor && !req.isPTD) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const trailRanking = await RankingModel.getPTDRankingByTrail(parseInt(trailId), parseInt(limit));
      
      return res.status(200).json({
        success: true,
        data: {
          ranking: trailRanking,
          trailId: parseInt(trailId),
          limit: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Erro ao buscar ranking da trilha:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar ranking da trilha',
        details: error.message 
      });
    }
  }

  /**
   * Buscar estatísticas de ranking - GET /api/ranking/statistics
   */
  static async getRankingStatistics(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se tem permissão (Admin ou Gestor)
      if (!req.isAdmin && !req.isGestor) {
        return res.status(403).json({ error: 'Acesso negado às estatísticas' });
      }
      
      const statistics = await RankingModel.getRankingStatistics();
      
      return res.status(200).json({
        success: true,
        data: statistics
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas de ranking:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar estatísticas de ranking',
        details: error.message 
      });
    }
  }

  /**
   * Buscar usuários próximos no ranking - GET /api/ranking/nearby
   */
  static async getNearbyRankingUsers(req, res) {
    try {
      const userId = req.userId;
      const { targetUserId, range = 2 } = req.query;
      
      // Determinar usuário alvo
      const targetId = targetUserId ? parseInt(targetUserId) : userId;
      
      // Verificar permissões se consultando outro usuário
      if (targetUserId && parseInt(targetUserId) !== userId) {
        if (req.isGestor) {
          const canManage = await HierarchyModel.canManagePTD(userId, targetId);
          if (!canManage) {
            return res.status(403).json({ error: 'Usuário não está na sua equipe' });
          }
        } else if (!req.isAdmin) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
      }
      
      const nearbyUsers = await RankingModel.getNearbyRankingUsers(targetId, parseInt(range));
      
      return res.status(200).json({
        success: true,
        data: {
          users: nearbyUsers,
          targetUserId: targetId,
          range: parseInt(range)
        }
      });

    } catch (error) {
      console.error('Erro ao buscar usuários próximos:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar usuários próximos',
        details: error.message 
      });
    }
  }

  /**
   * Buscar comparativo de performance da equipe - GET /api/ranking/team-performance
   */
  static async getTeamPerformance(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Gestor
      if (!req.isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      const teamPerformance = await RankingModel.getTeamPerformanceComparison(userId);
      
      // Calcular estatísticas adicionais
      const stats = {
        totalMembers: teamPerformance.length,
        averageScore: teamPerformance.length > 0 
          ? Math.round(teamPerformance.reduce((sum, member) => sum + member.score, 0) / teamPerformance.length)
          : 0,
        totalActiveTrails: teamPerformance.reduce((sum, member) => sum + member.activeTrails, 0),
        totalCompletedTrails: teamPerformance.reduce((sum, member) => sum + member.completedTrails, 0),
        averageProgress: teamPerformance.length > 0 
          ? Math.round(teamPerformance.reduce((sum, member) => sum + member.avgProgress, 0) / teamPerformance.length)
          : 0
      };
      
      return res.status(200).json({
        success: true,
        data: {
          performance: teamPerformance,
          statistics: stats
        }
      });

    } catch (error) {
      console.error('Erro ao buscar performance da equipe:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar performance da equipe',
        details: error.message 
      });
    }
  }

  /**
   * Buscar evolução do score de um PTD - GET /api/ranking/score-evolution/:ptdId?
   */
  static async getScoreEvolution(req, res) {
    try {
      const userId = req.userId;
      const { ptdId } = req.params;
      const { days = 30 } = req.query;
      
      // Determinar PTD alvo
      const targetPTDId = ptdId ? parseInt(ptdId) : userId;
      
      // Verificar permissões
      if (ptdId && parseInt(ptdId) !== userId) {
        if (req.isGestor) {
          const canManage = await HierarchyModel.canManagePTD(userId, targetPTDId);
          if (!canManage) {
            return res.status(403).json({ error: 'PTD não está na sua equipe' });
          }
        } else if (!req.isAdmin) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
      }
      
      const evolution = await RankingModel.getPTDScoreEvolution(targetPTDId, parseInt(days));
      
      return res.status(200).json({
        success: true,
        data: {
          evolution,
          ptdId: targetPTDId,
          period: parseInt(days)
        }
      });

    } catch (error) {
      console.error('Erro ao buscar evolução do score:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar evolução do score',
        details: error.message 
      });
    }
  }

  /**
   * Atualizar score de um usuário (Admin apenas) - PUT /api/ranking/update-score/:userId
   */
  static async updateUserScore(req, res) {
    try {
      const userId = req.userId;
      const { userId: targetUserId } = req.params;
      const { newScore, reason } = req.body;
      
      // Verificar se é Admin
      if (!req.isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: apenas Admins podem atualizar scores' });
      }
      
      if (!targetUserId || isNaN(targetUserId)) {
        return res.status(400).json({ error: 'ID do usuário inválido' });
      }
      
      if (!newScore || isNaN(newScore)) {
        return res.status(400).json({ error: 'Novo score inválido' });
      }
      
      const score = parseInt(newScore);
      if (score < 0) {
        return res.status(400).json({ error: 'Score não pode ser negativo' });
      }
      
      // Verificar se o usuário existe
      const targetUser = await UserModel.buscarPorId(parseInt(targetUserId));
      if (!targetUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Atualizar score
      const updatedUser = await RankingModel.updateUserScore(parseInt(targetUserId), score);
      
      // Log da alteração
      console.log(`📊 [RANKING] Admin ${userId} atualizou score do usuário ${targetUserId} para ${score}. Motivo: ${reason || 'Não informado'}`);
      
      return res.status(200).json({
        success: true,
        message: 'Score atualizado com sucesso',
        data: {
          userId: updatedUser.id,
          userName: updatedUser.name,
          oldScore: targetUser.score,
          newScore: updatedUser.score,
          updatedBy: userId,
          reason: reason || null
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar score:', error);
      return res.status(500).json({ 
        error: 'Erro ao atualizar score',
        details: error.message 
      });
    }
  }

  /**
   * Recalcular rankings (Admin apenas) - POST /api/ranking/recalculate
   */
  static async recalculateRankings(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Admin
      if (!req.isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: apenas Admins podem recalcular rankings' });
      }
      
      // Este seria um processo mais complexo que atualizaria scores baseado em progresso
      // Por enquanto, apenas retornamos sucesso
      console.log(`🔄 [RANKING] Admin ${userId} solicitou recálculo de rankings`);
      
      // Aqui você poderia implementar lógica para:
      // 1. Recalcular scores baseado em progresso de trilhas
      // 2. Atualizar pontuações por atividades
      // 3. Aplicar bonificações ou penalidades
      
      return res.status(200).json({
        success: true,
        message: 'Recálculo de rankings iniciado',
        data: {
          initiatedBy: userId,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Erro ao recalcular rankings:', error);
      return res.status(500).json({ 
        error: 'Erro ao recalcular rankings',
        details: error.message 
      });
    }
  }

  /**
   * Buscar rankings consolidados para dashboard - GET /api/ranking/dashboard-data
   */
  static async getDashboardRankingData(req, res) {
    try {
      const userId = req.userId;
      
      let rankingData = {};
      
      // PTD: Ranking geral + posição própria
      if (req.isPTD) {
        const [generalRanking, userPosition, nearbyUsers] = await Promise.all([
          RankingModel.getPTDGeneralRanking(5),
          RankingModel.getPTDRankingPosition(userId),
          RankingModel.getNearbyRankingUsers(userId, 2)
        ]);
        
        rankingData = {
          type: 'ptd',
          generalRanking,
          userPosition,
          nearbyUsers
        };
      }
      
      // Gestor: Ranking da equipe + performance
      if (req.isGestor) {
        const [teamRanking, teamPerformance] = await Promise.all([
          RankingModel.getTeamRanking(userId),
          RankingModel.getTeamPerformanceComparison(userId)
        ]);
        
        rankingData = {
          type: 'gestor',
          teamRanking,
          teamPerformance
        };
      }
      
      // Admin: Estatísticas gerais
      if (req.isAdmin) {
        const [statistics, topPerformers] = await Promise.all([
          RankingModel.getRankingStatistics(),
          RankingModel.getPTDGeneralRanking(10)
        ]);
        
        rankingData = {
          type: 'admin',
          statistics,
          topPerformers
        };
      }
      
      return res.status(200).json({
        success: true,
        data: rankingData
      });

    } catch (error) {
      console.error('Erro ao buscar dados de ranking para dashboard:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar dados de ranking',
        details: error.message 
      });
    }
  }
}

module.exports = RankingController;