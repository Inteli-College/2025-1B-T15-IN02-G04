const HierarchyModel = require("../models/hierarchyModel");
const UserModel = require("../models/userModel");
const TrailModel = require("../models/trailModel");

exports.listTeamMembers = async (req, res) => {
  try {
    const team = await HierarchyModel.getTeamMembers(req.userId);
    return res.json(team);
  } catch (err) {
    console.error("Erro em listTeamMembers:", err);
    return res.status(500).json({ error: "Erro ao listar membros da equipe" });
  }
};

exports.assignTrail = async (req, res) => {
  const { ptdId, trailId } = req.body;
  if (!ptdId || !trailId) {
    return res.status(400).json({ error: "ptdId e trailId são obrigatórios" });
  }

  try {
    await HierarchyModel.assignTrailToPTD(req.userId, ptdId, trailId);
    return res.json({ success: true });
  } catch (err) {
    console.error("Erro em assignTrail:", err);
    return res.status(500).json({ error: err.message || "Erro ao atribuir trilha" });
  }
};

exports.getTeamProgress = async (req, res) => {
  // TODO: Implementar cálculo de progresso por PTD
  return res.json({ todo: true });
};

exports.createPTD = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name e email são obrigatórios" });
  }
  try {
    // Cria usuário PTD com role 3
    // Aqui assumimos que UserModel possui método createUser; se não, é necessário implementar.
    const password = Math.random().toString(36).slice(-8); // senha temporária
    const username = email.split('@')[0];
    const newUser = await UserModel.createUser({ name, email, password, username });

    // Atribui role 3 ao novo usuário
    await UserModel.assignRoleToUser(newUser.id, 3);

    // Vincula novo PTD ao gestor na hierarchy
    await HierarchyModel.assignTrailToPTD(req.userId, newUser.id, null);

    return res.status(201).json({ success: true, userId: newUser.id });
  } catch (err) {
    console.error("Erro em createPTD:", err);
    if (err.message === 'EMAIL_DUPLICATE') {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    return res.status(500).json({ error: "Erro ao criar PTD" });
  }
}; 