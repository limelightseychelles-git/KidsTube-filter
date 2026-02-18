const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { verifyPIN } = require('../middleware/auth');

// All routes require authentication
router.get('/', verifyPIN, historyController.getWatchHistory);
router.get('/stats', verifyPIN, historyController.getWatchStatistics);
router.delete('/clear', verifyPIN, historyController.clearAllHistory);
router.delete('/:id', verifyPIN, historyController.deleteHistoryEntry);

module.exports = router;
