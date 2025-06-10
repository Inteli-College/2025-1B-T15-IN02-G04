const db = require('../config/database');

const VALID_ROLES = ['admin', 'instructor', 'student', 'mentor'];

// Get all roles
exports.getAllRoles = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM role ORDER BY role_name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM role WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new role - Disabled to prevent creation of new roles
exports.createRole = async (req, res) => {
    res.status(403).json({ 
        error: 'Creation of new roles is not allowed. Valid roles are: admin, instructor, student, mentor' 
    });
};

// Update role - Only allows updating description
exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        
        // Only allow updating description, not role_name
        const result = await db.query(
            'UPDATE role SET description = $1 WHERE id = $2 RETURNING *',
            [description, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete role - Disabled to prevent deletion of existing roles
exports.deleteRole = async (req, res) => {
    res.status(403).json({ 
        error: 'Deletion of roles is not allowed. Valid roles are: admin, instructor, student, mentor' 
    });
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT u.* FROM "user" u
            INNER JOIN role_user ru ON u.id = ru.id_user
            WHERE ru.id_role = $1`,
            [id]
        );
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Assign user to role
exports.assignUserToRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        // Verify if the role exists and is valid
        const roleCheck = await db.query('SELECT role_name FROM role WHERE id = $1', [id]);
        if (roleCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }

        const roleName = roleCheck.rows[0].role_name;
        if (!VALID_ROLES.includes(roleName)) {
            return res.status(400).json({ 
                error: 'Invalid role. Valid roles are: admin, instructor, student, mentor' 
            });
        }
        
        const result = await db.query(
            'INSERT INTO role_user (id_user, id_role) VALUES ($1, $2) RETURNING *',
            [userId, id]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'User already has this role' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

// Remove user from role
exports.removeUserFromRole = async (req, res) => {
    try {
        const { id, userId } = req.params;
        
        const result = await db.query(
            'DELETE FROM role_user WHERE id_user = $1 AND id_role = $2 RETURNING *',
            [userId, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User-role relationship not found' });
        }
        
        res.json({ message: 'User removed from role successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 