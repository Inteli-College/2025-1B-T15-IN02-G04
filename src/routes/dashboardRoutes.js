const router = require("express").Router();
const dash = require("../controllers/dashboardController");
const team = require("../controllers/teamController");
const admin = require("../controllers/adminController");
const authMW = require("../middlewares/authMiddleware");

// Todas rotas exigem usuário autenticado
router.use(authMW.ensureAuth);

// Dashboard geral
router.get("/dashboard", dash.getDashboard);

// Rotas Gestor
router.get("/team", authMW.onlyGestor, team.listTeamMembers);
router.post("/team/assignTrail", authMW.onlyGestor, team.assignTrail);
router.get("/team/progress", authMW.onlyGestor, team.getTeamProgress);
router.post("/team/createPTD", authMW.onlyGestor, team.createPTD);

// Rotas Admin
router.post("/admin/createUser", authMW.onlyAdmin, admin.createUser);
router.get("/admin/analytics", authMW.onlyAdmin, admin.getAnalytics);
router.get("/admin/cards/favorited", authMW.onlyAdmin, admin.getCardsRanking);
router.put("/admin/entities/:type/:id", authMW.onlyAdmin, admin.genericUpdate);
router.delete("/admin/users/:id", authMW.onlyAdmin, admin.deleteUser);

module.exports = router; 