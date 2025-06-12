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
const meritRoutes = require("./meritRoutes");
const certificateRoutes = require("./certificateRoutes");
const cardRoutes = require("./cardRoutes");
const comentRoutes = require("./comentRoutes");
const postRoutes = require("./postRoutes");
const likeRoutes = require("./likeRoutes");
const roleRoutes = require("./roleRoutes");
const hierarchyRoutes = require("./hierarchyRoutes");

// API routes
router.use("/api/auth", authRoutes);
router.use("/api", moduleRoutes);
router.use("/api", trailRoutes);
router.use("/api", classRoutes);
router.use("/api", questionRoutes);
router.use("/api", testRoutes);
router.use("/api", answerRoutes);
router.use("/api", rankingRoutes);
router.use("/api", postRoutes);
router.use("/api", likeRoutes);
router.use("/api", meritRoutes);
router.use("/api", certificateRoutes);
router.use("/api", cardRoutes);
router.use("/api", comentRoutes);
router.use("/api", roleRoutes);
router.use("/api", hierarchyRoutes);

// Frontend routes
router.use("/", frontendRoutes);

module.exports = router;
