// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { getUserNotifications,markAsRead } = require('../controllers/notificationController');

router.get('/notifications/:userId', getUserNotifications);
router.put('/:notificationId/read', markAsRead); // PUT /api/notifications/:id/read


module.exports = router;
