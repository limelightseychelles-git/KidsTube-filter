const express = require('express');
const router = express.Router();
const apiSettingsController = require('../controllers/apiSettingsController');
const { verifyPIN } = require('../middleware/auth');

// All routes require authentication
router.get('/', verifyPIN, apiSettingsController.getAPIKeys);
router.post('/', verifyPIN, apiSettingsController.addAPIKey);
router.put('/:id', verifyPIN, apiSettingsController.toggleAPIKey);
router.delete('/:id', verifyPIN, apiSettingsController.deleteAPIKey);

module.exports = router;
