const db = require('../config/database');

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

// Create new role
exports.createRole = async (req, res) => {
    try {
        const { role_name, description } = req.body;
        
        const result = await db.query(
            'INSERT INTO role (role_name, description) VALUES ($1, $2) RETURNING *',
            [role_name, description]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Role name already exists' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

// Update role
exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_name, description } = req.body;
        
        const result = await db.query(
            'UPDATE role SET role_name = $1, description = $2 WHERE id = $3 RETURNING *',
            [role_name, description, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Role name already exists' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

// Delete role
exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM role WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }
        
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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