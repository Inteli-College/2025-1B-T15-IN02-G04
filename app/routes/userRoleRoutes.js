const express = require('express');
const router = express.Router();
const userRoleController = require('../controllers/userRoleController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check specific roles
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const db = require('../config/db');
      
      const result = await db.query(`
        SELECT r.role_name FROM role r
        JOIN role_user ru ON r.id = ru.id_role
        WHERE ru.id_user = $1
      `, [userId]);
      
      const userRoles = result.rows.map(row => row.role_name);
      const hasRole = roles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        return res.status(403).json({ 
          error: `Access denied. Required roles: ${roles.join(', ')}` 
        });
      }
      
      req.userRoles = userRoles;
      next();
    } catch (error) {
      console.error('Error checking roles:', error);
      res.status(500).json({ error: 'Error checking user permissions' });
    }
  };
};

// General user role management
router.post('/assign-role', authMiddleware, requireRole(['Administrador']), userRoleController.assignRoleToUser);
router.get('/profile/:userId', authMiddleware, userRoleController.getUserProfile);
router.get('/dashboard/:userId', authMiddleware, userRoleController.getUserDashboard);

// PTD specific routes
router.get('/ptd/available/:managerId', authMiddleware, requireRole(['Gerente']), userRoleController.getAvailablePTDs);
router.get('/ptd/search/:managerId', authMiddleware, requireRole(['Gerente']), userRoleController.searchPTDs);

// Manager specific routes
router.post('/hierarchy/create', authMiddleware, requireRole(['Gerente', 'Administrador']), userRoleController.createHierarchyRelationship);
router.delete('/hierarchy/remove', authMiddleware, requireRole(['Gerente', 'Administrador']), userRoleController.removeHierarchyRelationship);
router.get('/manager/analytics/:managerId', authMiddleware, requireRole(['Gerente', 'Administrador']), userRoleController.getTeamAnalytics);
router.post('/manager/assign-trail', authMiddleware, requireRole(['Gerente', 'Administrador']), userRoleController.assignTrailToPTD);

module.exports = router;