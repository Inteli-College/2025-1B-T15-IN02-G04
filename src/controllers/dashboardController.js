const UserModel = require("../models/userModel");
const TrailModel = require("../models/trailModel"); // presumindo existir
const HierarchyModel = require("../models/hierarchyModel");

// Helpers (stubs) ----------------------------------------------------------------
async function getAdminData() {
  // TODO: implementar métricas globais (analytics, cards favoritos etc.)
  return {
    analytics: {},
    cardsRanking: [],
  };
}

async function getGestorData(userId) {
  // TODO: implementar coleta de dados específicos do gestor
  // Equipe, ranking interno, progresso etc.
  const team = await HierarchyModel.getTeamMembers(userId);
  return { team };
}

async function getPTDData(userId) {
  // TODO: implementar coleta de dados do PTD
  // Progresso pessoal, trilhas atribuídas etc.
  const trails = await HierarchyModel.getTrailsByPTD(userId);
  return { trails };
}

async function gatherDashboardData(roleId, userId) {
  switch (roleId) {
    case 1:
      return await getAdminData(userId);
    case 2:
      return await getGestorData(userId);
    case 3:
      return await getPTDData(userId);
    default:
      return {};
  }
}

exports.getDashboard = async (req, res) => {
  try {
    const roleId = req.user?.role_id || req.roleId || req.userRoleId || null;
    // Caso roleId não esteja no req, buscar a partir do banco
    let finalRoleId = roleId;
    if (!finalRoleId) {
      const roles = await UserModel.buscarRolesPorUsuario(req.userId);
      finalRoleId = parseInt(roles[0]?.id_role, 10);
    }

    // Permite que Admin visualize painéis de Gestor/PTD e Gestor visualize PTD via query view
    let viewRoleId = finalRoleId; // valor padrão
    const viewParam = (req.query.view || "").toLowerCase();
    if (finalRoleId === 1) {
      if (viewParam === "gestor") viewRoleId = 2;
      else if (viewParam === "ptd") viewRoleId = 3;
    } else if (finalRoleId === 2 && viewParam === "ptd") {
      viewRoleId = 3;
    }

    const data = await gatherDashboardData(viewRoleId, req.userId);

    if (req.accepts("html")) {
      return res.render("layout/main", {
        pageTitle: "Dashboard",
        content: "../pages/dashboard",
        pageCSS: null,
        roleId: finalRoleId, // role real do usuário
        viewRoleId,         // painel que será exibido
        data,
        userId: req.userId,
      });
    }
    return res.json(data);
  } catch (err) {
    console.error("Erro em getDashboard:", err);
    return res.status(500).json({ error: "Erro ao carregar dashboard" });
  }
}; 