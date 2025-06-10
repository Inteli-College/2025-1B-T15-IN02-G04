const db = require('../config/db');

// Get all hierarchies
exports.getAllHierarchies = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT h.*, 
                   ru1.id_user as user1_id, 
                   ru2.id_user as user2_id,
                   r1.role_name as role1_name,
                   r2.role_name as role2_name
            FROM hierarchy h
            INNER JOIN role_user ru1 ON h.id_role_user1 = ru1.id
            INNER JOIN role_user ru2 ON h.id_role_user2 = ru2.id
            INNER JOIN role r1 ON ru1.id_role = r1.id
            INNER JOIN role r2 ON ru2.id_role = r2.id
            ORDER BY h.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get hierarchy by ID
exports.getHierarchyById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT h.*, 
                   ru1.id_user as user1_id, 
                   ru2.id_user as user2_id,
                   r1.role_name as role1_name,
                   r2.role_name as role2_name
            FROM hierarchy h
            INNER JOIN role_user ru1 ON h.id_role_user1 = ru1.id
            INNER JOIN role_user ru2 ON h.id_role_user2 = ru2.id
            INNER JOIN role r1 ON ru1.id_role = r1.id
            INNER JOIN role r2 ON ru2.id_role = r2.id
            WHERE h.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Hierarchy not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new hierarchy
exports.createHierarchy = async (req, res) => {
    try {
        const { id_role_user1, id_role_user2, hierarchy_type } = req.body;
        
        const result = await db.query(
            'INSERT INTO hierarchy (id_role_user1, id_role_user2, hierarchy_type) VALUES ($1, $2, $3) RETURNING *',
            [id_role_user1, id_role_user2, hierarchy_type || 'mentor']
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update hierarchy
exports.updateHierarchy = async (req, res) => {
    try {
        const { id } = req.params;
        const { hierarchy_type } = req.body;
        
        const result = await db.query(
            'UPDATE hierarchy SET hierarchy_type = $1 WHERE id = $2 RETURNING *',
            [hierarchy_type, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Hierarchy not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete hierarchy
exports.deleteHierarchy = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM hierarchy WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Hierarchy not found' });
        }
        
        res.json({ message: 'Hierarchy deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get hierarchies by user
exports.getHierarchiesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(`
            SELECT h.*, 
                   ru1.id_user as user1_id, 
                   ru2.id_user as user2_id,
                   r1.role_name as role1_name,
                   r2.role_name as role2_name
            FROM hierarchy h
            INNER JOIN role_user ru1 ON h.id_role_user1 = ru1.id
            INNER JOIN role_user ru2 ON h.id_role_user2 = ru2.id
            INNER JOIN role r1 ON ru1.id_role = r1.id
            INNER JOIN role r2 ON ru2.id_role = r2.id
            WHERE ru1.id_user = $1 OR ru2.id_user = $1
            ORDER BY h.created_at DESC
        `, [userId]);
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get mentees by mentor
exports.getMenteesByMentor = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(`
            SELECT h.*, 
                   ru2.id_user as mentee_id,
                   r.role_name as mentee_role
            FROM hierarchy h
            INNER JOIN role_user ru1 ON h.id_role_user1 = ru1.id
            INNER JOIN role_user ru2 ON h.id_role_user2 = ru2.id
            INNER JOIN role r ON ru2.id_role = r.id
            WHERE ru1.id_user = $1 AND h.hierarchy_type = 'mentor'
            ORDER BY h.created_at DESC
        `, [userId]);
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get mentors by mentee
exports.getMentorsByMentee = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(`
            SELECT h.*, 
                   ru1.id_user as mentor_id,
                   r.role_name as mentor_role
            FROM hierarchy h
            INNER JOIN role_user ru1 ON h.id_role_user1 = ru1.id
            INNER JOIN role_user ru2 ON h.id_role_user2 = ru2.id
            INNER JOIN role r ON ru1.id_role = r.id
            WHERE ru2.id_user = $1 AND h.hierarchy_type = 'mentor'
            ORDER BY h.created_at DESC
        `, [userId]);
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 