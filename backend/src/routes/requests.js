const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { verifyPIN } = require('../middleware/auth');

// Kids can submit and view requests (no auth needed)
router.post('/submit', requestController.submitVideoRequest);
router.get('/my-requests', requestController.getMyVideoRequests);

// Parents need auth for these routes
router.get('/', verifyPIN, requestController.getVideoRequests);
router.put('/:id/approve', verifyPIN, requestController.approveVideoRequest);
router.put('/:id/reject', verifyPIN, requestController.rejectVideoRequest);
router.delete('/:id', verifyPIN, requestController.deleteVideoRequest);

module.exports = router;
