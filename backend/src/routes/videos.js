const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

router.get('/search', videoController.searchVideos);
router.get('/latest', videoController.getLatestVideos);
router.get('/details/:videoId', videoController.getVideoDetails);
router.post('/request', videoController.requestVideo);

module.exports = router;
