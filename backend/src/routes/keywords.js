const express = require('express');
const router = express.Router();
const keywordController = require('../controllers/keywordController');
const { verifyPIN } = require('../middleware/auth');

// All routes require authentication
router.get('/', verifyPIN, keywordController.getBlockedKeywords);
router.post('/', verifyPIN, keywordController.addBlockedKeyword);
router.post('/bulk', verifyPIN, keywordController.bulkAddKeywords);
router.delete('/:id', verifyPIN, keywordController.removeBlockedKeyword);

module.exports = router;
