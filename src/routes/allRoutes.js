const express = require("express");
const frontRoutes = require("./frontRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const trailRoutes = require("./trailRoutes");

const router = express.Router();

// Rotas de API
router.use("/api/usuarios", userRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/trails", trailRoutes);


// Rotas de Frontend
router.use("/", frontRoutes);

module.exports = router;
