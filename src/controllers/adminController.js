const UserModel = require("../models/userModel");
const TrailModel = require("../models/trailModel");
const CardModel = require("../models/cardModel");

exports.createUser = async (req, res) => {
  const { name, email, role_id } = req.body;
  if (!name || !email || !role_id) {
    return res.status(400).json({ error: "name, email e role_id são obrigatórios" });
  }
  try {
    const password = Math.random().toString(36).slice(-8);
    const newUser = await UserModel.createUser({ name, email, password });
    await UserModel.assignRoleToUser(newUser.id, role_id);
    return res.status(201).json({ success: true, userId: newUser.id });
  } catch (err) {
    console.error("Erro em createUser:", err);
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    // TODO: Implementar analytics globais
    return res.json({ todo: true });
  } catch (err) {
    console.error("Erro em getAnalytics:", err);
    return res.status(500).json({ error: "Erro ao buscar analytics" });
  }
};

exports.getCardsRanking = async (req, res) => {
  try {
    // TODO: Implementar top/bottom cards
    return res.json({ todo: true });
  } catch (err) {
    console.error("Erro em getCardsRanking:", err);
    return res.status(500).json({ error: "Erro ao buscar ranking de cards" });
  }
};

exports.genericUpdate = async (req, res) => {
  // TODO: Implementar atualização genérica de entidades
  return res.json({ todo: true });
}; 