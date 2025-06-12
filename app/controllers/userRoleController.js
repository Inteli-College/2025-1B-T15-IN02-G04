const db = require('../config/db');

const UserRoleController = {
  // Assign role to user during registration
  async assignRoleToUser(req, res) {
    try {
      const { userId, roleName } = req.body;
      
      const result = await db.query(
        'SELECT assign_role_to_user($1, $2) as success',
        [userId, roleName]
      );
      
      if (result.rows[0].success) {
        res.status(200).json({ 
          message: `Role ${roleName} assigned successfully to user ${userId}`,
          success: true 
        });
      } else {
        res.status(400).json({ 
          message: 'Role assignment failed - may already exist',
          success: false 
        });
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get user profile with role information
  async getUserProfile(req, res) {
    try {
      const { userId } = req.params;
      
      const userResult = await db.query(`
        SELECT 
          u.id, u.first_name, u.last_name, u.email, u.username, 
          u.avatar, u.birth_date, u.created_at,
          ARRAY_AGG(r.role_name) as roles,
          ARRAY_AGG(r.description) as role_descriptions
        FROM "user" u
        LEFT JOIN role_user ru ON u.id = ru.id_user
        LEFT JOIN role r ON ru.id_role = r.id
        WHERE u.id = $1
        GROUP BY u.id, u.first_name, u.last_name, u.email, u.username, 
                 u.avatar, u.birth_date, u.created_at
      `, [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = userResult.rows[0];
      
      // Get user progress if PTD
      if (user.roles.includes('PTD')) {
        const progressResult = await db.query(`
          SELECT 
            t.id as trail_id,
            t.name as trail_name,
            tu.percentage as progress,
            tu.started_at,
            tu.completed_at
          FROM trail_user tu
          JOIN trail t ON tu.id_trail = t.id
          WHERE tu.id_user = $1
          ORDER BY tu.started_at DESC
        `, [userId]);
        
        user.progress = progressResult.rows;
      }
      
      // Get managed PTDs if Manager
      if (user.roles.includes('Gerente')) {
        const managedResult = await db.query(`
          SELECT 
            ptd_id, ptd_first_name, ptd_last_name, 
            ptd_email, ptd_username
          FROM v_manager_ptd_relationships
          WHERE manager_id = $1
        `, [userId]);
        
        user.managedPTDs = managedResult.rows;
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all PTDs for manager assignment
  async getAvailablePTDs(req, res) {
    try {
      const { managerId } = req.params;
      
      const result = await db.query(`
        SELECT 
          u.id, u.first_name, u.last_name, u.email, u.username,
          CASE 
            WHEN EXISTS(
              SELECT 1 FROM v_manager_ptd_relationships 
              WHERE ptd_id = u.id AND manager_id = $1
            ) THEN true
            ELSE false
          END as is_managed
        FROM "user" u
        JOIN role_user ru ON u.id = ru.id_user
        JOIN role r ON ru.id_role = r.id
        WHERE r.role_name = 'PTD'
        ORDER BY u.first_name, u.last_name
      `, [managerId]);
      
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error getting available PTDs:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create hierarchy relationship (Manager -> PTD)
  async createHierarchyRelationship(req, res) {
    try {
      const { managerId, ptdId } = req.body;
      
      const result = await db.query(
        'SELECT create_hierarchy_relationship($1, $2) as success',
        [managerId, ptdId]
      );
      
      if (result.rows[0].success) {
        res.status(200).json({ 
          message: 'Hierarchy relationship created successfully',
          success: true 
        });
      } else {
        res.status(400).json({ 
          message: 'Hierarchy relationship already exists',
          success: false 
        });
      }
    } catch (error) {
      console.error('Error creating hierarchy:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Remove hierarchy relationship
  async removeHierarchyRelationship(req, res) {
    try {
      const { managerId, ptdId } = req.body;
      
      const result = await db.query(`
        DELETE FROM hierarchy h
        USING role_user ru1, role_user ru2, role r1, role r2
        WHERE h.id_role_user1 = ru1.id 
        AND h.id_role_user2 = ru2.id
        AND ru1.id_role = r1.id 
        AND ru2.id_role = r2.id
        AND ru1.id_user = $1 
        AND ru2.id_user = $2
        AND r1.role_name = 'Gerente' 
        AND r2.role_name = 'PTD'
        RETURNING h.id
      `, [managerId, ptdId]);
      
      if (result.rows.length > 0) {
        res.status(200).json({ 
          message: 'Hierarchy relationship removed successfully',
          success: true 
        });
      } else {
        res.status(404).json({ 
          message: 'Hierarchy relationship not found',
          success: false 
        });
      }
    } catch (error) {
      console.error('Error removing hierarchy:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Search PTDs by name for manager
  async searchPTDs(req, res) {
    try {
      const { searchTerm } = req.query;
      const { managerId } = req.params;
      
      const result = await db.query(`
        SELECT 
          u.id, u.first_name, u.last_name, u.email, u.username,
          CASE 
            WHEN EXISTS(
              SELECT 1 FROM v_manager_ptd_relationships 
              WHERE ptd_id = u.id AND manager_id = $2
            ) THEN true
            ELSE false
          END as is_managed
        FROM "user" u
        JOIN role_user ru ON u.id = ru.id_user
        JOIN role r ON ru.id_role = r.id
        WHERE r.role_name = 'PTD'
        AND (
          LOWER(u.first_name) LIKE LOWER($1) OR
          LOWER(u.last_name) LIKE LOWER($1) OR
          LOWER(u.email) LIKE LOWER($1) OR
          LOWER(u.username) LIKE LOWER($1) OR
          LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER($1)
        )
        ORDER BY u.first_name, u.last_name
        LIMIT 20
      `, [`%${searchTerm}%`, managerId]);
      
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error searching PTDs:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get manager's team analytics
  async getTeamAnalytics(req, res) {
    try {
      const { managerId } = req.params;
      
      const analyticsResult = await db.query(`
        SELECT 
          COUNT(ptd_id) as total_ptds,
          COUNT(CASE WHEN tu.percentage = 100 THEN 1 END) as completed_trails,
          COUNT(CASE WHEN tu.percentage > 0 AND tu.percentage < 100 THEN 1 END) as in_progress_trails,
          AVG(tu.percentage) as avg_progress,
          COUNT(CASE WHEN tu.started_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_activity
        FROM v_manager_ptd_relationships vmpr
        LEFT JOIN trail_user tu ON vmpr.ptd_id = tu.id_user
        WHERE vmpr.manager_id = $1
      `, [managerId]);
      
      const topPerformersResult = await db.query(`
        SELECT 
          vmpr.ptd_id,
          vmpr.ptd_first_name,
          vmpr.ptd_last_name,
          AVG(tu.percentage) as avg_progress,
          COUNT(CASE WHEN tu.percentage = 100 THEN 1 END) as completed_count
        FROM v_manager_ptd_relationships vmpr
        LEFT JOIN trail_user tu ON vmpr.ptd_id = tu.id_user
        WHERE vmpr.manager_id = $1
        GROUP BY vmpr.ptd_id, vmpr.ptd_first_name, vmpr.ptd_last_name
        HAVING AVG(tu.percentage) IS NOT NULL
        ORDER BY avg_progress DESC, completed_count DESC
        LIMIT 5
      `, [managerId]);
      
      res.status(200).json({
        analytics: analyticsResult.rows[0],
        topPerformers: topPerformersResult.rows
      });
    } catch (error) {
      console.error('Error getting team analytics:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Assign trail to PTD (Manager function)
  async assignTrailToPTD(req, res) {
    try {
      const { managerId, ptdId, trailId } = req.body;
      
      // Verify manager has authority over PTD
      const verifyResult = await db.query(`
        SELECT 1 FROM v_manager_ptd_relationships
        WHERE manager_id = $1 AND ptd_id = $2
      `, [managerId, ptdId]);
      
      if (verifyResult.rows.length === 0) {
        return res.status(403).json({ 
          error: 'Manager does not have authority over this PTD' 
        });
      }
      
      // Assign trail to PTD
      const assignResult = await db.query(`
        INSERT INTO trail_user (id_user, id_trail, percentage, started_at)
        VALUES ($1, $2, 0, CURRENT_TIMESTAMP)
        ON CONFLICT (id_user, id_trail) DO UPDATE SET
          started_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [ptdId, trailId]);
      
      res.status(200).json({
        message: 'Trail assigned successfully',
        assignment: assignResult.rows[0]
      });
    } catch (error) {
      console.error('Error assigning trail:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get user dashboard data based on role
  async getUserDashboard(req, res) {
    try {
      const { userId } = req.params;
      
      // Get user roles
      const rolesResult = await db.query(`
        SELECT r.role_name FROM role r
        JOIN role_user ru ON r.id = ru.id_role
        WHERE ru.id_user = $1
      `, [userId]);
      
      const roles = rolesResult.rows.map(row => row.role_name);
      const dashboardData = { roles };
      
      // PTD Dashboard Data
      if (roles.includes('PTD')) {
        const ptdData = await db.query(`
          SELECT 
            COUNT(DISTINCT tu.id_trail) as enrolled_trails,
            COUNT(CASE WHEN tu.percentage = 100 THEN 1 END) as completed_trails,
            COUNT(CASE WHEN tu.percentage > 0 AND tu.percentage < 100 THEN 1 END) as in_progress_trails,
            AVG(tu.percentage) as avg_progress
          FROM trail_user tu
          WHERE tu.id_user = $1
        `, [userId]);
        
        const recentTrailsResult = await db.query(`
          SELECT 
            t.id, t.name, t.description,
            tu.percentage, tu.started_at, tu.completed_at
          FROM trail_user tu
          JOIN trail t ON tu.id_trail = t.id
          WHERE tu.id_user = $1
          ORDER BY tu.started_at DESC
          LIMIT 5
        `, [userId]);
        
        dashboardData.ptd = {
          stats: ptdData.rows[0],
          recentTrails: recentTrailsResult.rows
        };
      }
      
      // Manager Dashboard Data
      if (roles.includes('Gerente')) {
        const managerData = await this.getTeamAnalytics({ params: { managerId: userId } }, { status: () => ({ json: (data) => data }) });
        dashboardData.manager = managerData;
      }
      
      // Admin Dashboard Data
      if (roles.includes('Administrador')) {
        const adminData = await db.query(`
          SELECT 
            (SELECT COUNT(*) FROM "user") as total_users,
            (SELECT COUNT(*) FROM trail) as total_trails,
            (SELECT COUNT(*) FROM post) as total_posts,
            (SELECT COUNT(*) FROM trail_user WHERE started_at >= CURRENT_DATE - INTERVAL '30 days') as new_enrollments
        `);
        
        dashboardData.admin = {
          stats: adminData.rows[0]
        };
      }
      
      res.status(200).json(dashboardData);
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = UserRoleController;