const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const moduleRoutes = require("./moduleRoutes");
const trailRoutes = require("./trailRoutes");
const userRoutes = require("./userRoutes");
const frontendRoutes = require("./frontRoutes");
const classRoutes = require("./classRoutes");
const questionRoutes = require("./questionRoutes");
const testRoutes = require("./testRoutes");
const answerRoutes = require("./answerRoutes");
const rankingRoutes = require("./rankingRoutes");

// API routes
router.use("/api/auth", authRoutes);
router.use("/api", moduleRoutes);
router.use("/api", trailRoutes);
router.use("/api", classRoutes);
router.use("/api", questionRoutes);
router.use("/api", testRoutes);
router.use("/api", answerRoutes);
router.use("/api", rankingRoutes);

// Frontend routes
router.use("/", frontendRoutes);

module.exports = router;
