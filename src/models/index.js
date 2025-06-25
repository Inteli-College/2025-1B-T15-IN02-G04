// Models consolidados para o dashboard modular
// Arquivo de índice para facilitar importações

const DashboardModel = require('./dashboardModel');
const TrailProgressModel = require('./trailProgressModel');
const HierarchyModel = require('./hierarchyModel');
const RankingModel = require('./rankingModel');
const AnalyticsModel = require('./analyticsModel');

// Também incluir models já existentes
const UserModel = require('./userModel');
const CardModel = require('./cardModel');
const TrailModel = require('./trailModel');

module.exports = {
  // Novos models para o dashboard
  DashboardModel,
  TrailProgressModel,
  HierarchyModel,
  RankingModel,
  AnalyticsModel,
  
  // Models existentes
  UserModel,
  CardModel,
  TrailModel
};