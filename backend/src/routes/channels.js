const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const { verifyPIN } = require('../middleware/auth');

// All routes require authentication
router.get('/', verifyPIN, channelController.getApprovedChannels);
router.post('/', verifyPIN, channelController.addApprovedChannel);
router.delete('/:id', verifyPIN, channelController.removeApprovedChannel);
router.get('/search', verifyPIN, channelController.searchChannels);

module.exports = router;
