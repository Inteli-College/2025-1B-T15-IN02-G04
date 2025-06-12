const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

// Basic role routes
router.get('/roles', roleController.getAllRoles);
router.get('/roles/:id', roleController.getRoleById);
router.post('/roles', roleController.createRole);
router.put('/roles/:id', roleController.updateRole);
router.delete('/roles/:id', roleController.deleteRole);

// Role-User relationship routes
router.get('/roles/:id/users', roleController.getUsersByRole);
router.post('/roles/:id/users', roleController.assignUserToRole);
router.delete('/roles/:id/users/:userId', roleController.removeUserFromRole);

module.exports = router; 