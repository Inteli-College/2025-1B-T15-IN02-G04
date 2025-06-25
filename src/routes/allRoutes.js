const express = require("express");
const frontRoutes = require("./frontRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const trailRoutes = require("./trailRoutes");
const cardRoutes = require("./cardRoutes");
const pdfRoutes = require("./pdfRoutes");
const dashboardRoutes = require("./dashboardRoutes"); // Nova importação

const router = express.Router();

// Rotas de API
router.use("/api/usuarios", userRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/trails", trailRoutes);
router.use("/api", cardRoutes);
router.use("/api", pdfRoutes);

// Rotas do Dashboard (incluindo APIs e páginas do dashboard)
router.use("/", dashboardRoutes);

// Rotas de Frontend
router.use("/", frontRoutes);

module.exports = router;