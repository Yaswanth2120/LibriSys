const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Get All Unread Notifications for the Logged-In User
router.get('/', verifyToken, getNotifications);

// ✅ Mark Notifications as Read
router.put('/read', verifyToken, markAsRead);

module.exports = router;
