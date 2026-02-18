const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyPIN } = require('../middleware/auth');

router.post('/initialize-pin', authController.initializePIN);
router.post('/verify-pin', authController.verifyPIN);
router.get('/check-pin', authController.checkPINExists);
router.post('/change-pin', verifyPIN, authController.changePIN);

module.exports = router;
