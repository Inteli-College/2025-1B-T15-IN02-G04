const express = require("express");
const frontRoutes = require("./frontRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const trailRoutes = require("./trailRoutes");
const cardRoutes = require("./cardRoutes");
const pdfRoutes = require("./pdfRoutes");
const postRoutes = require("./postRoutes");
const moduleRoutes = require("./moduleRoutes");
const classRoutes = require("./classRoutes");
const dashboardRoutes = require("./dashboardRoutes");

const router = express.Router();

// Rotas de API
router.use("/api/posts", postRoutes);
router.use("/api/usuarios", userRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/trails", trailRoutes);
router.use("/api", cardRoutes);
router.use("/api", pdfRoutes);
router.use("/api/modules", moduleRoutes); 
router.use("/", frontRoutes);
router.use("/api/class", classRoutes); 
router.use("/", dashboardRoutes);

module.exports = router;