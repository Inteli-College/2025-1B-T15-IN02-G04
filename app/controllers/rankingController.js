const rankingModel = require('../models/rankingModel');

const getAllRankings = async (req, res) => {
    try {
        const rankings = await rankingModel.getAll();
        res.status(200).json(rankings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRankingById = async (req, res) => {
    try {
        const ranking = await rankingModel.getById(req.params.id);
        if (ranking) {
            res.status(200).json(ranking);
        } else {
            res.status(404).json({ error: 'Ranking não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createRanking = async (req, res) => {
    try {
        const { userId, score } = req.body;
        const newRanking = await rankingModel.create(userId, score);
        res.status(201).json(newRanking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateRanking = async (req, res) => {
    try {
        const { score } = req.body;
        const updatedRanking = await rankingModel.update(req.params.id, score);
        if (updatedRanking) {
            res.status(200).json(updatedRanking);
        } else {
            res.status(404).json({ error: 'Ranking não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteRanking = async (req, res) => {
    try {
        const deletedRanking = await rankingModel.delete(req.params.id);
        if (deletedRanking) {
            res.status(200).json(deletedRanking);
        } else {
            res.status(404).json({ error: 'Ranking não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllRankings,
    getRankingById,
    createRanking,
    updateRanking,
    deleteRanking
};