const pool = require('../config/db');

// ✅ Fetch All Unread Notifications for a User
exports.getNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching notifications:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ Mark All Notifications as Read for the User
exports.markAsRead = async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
            [req.user.id]
        );
        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        console.error('Error marking notifications as read:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ Add a New Notification (Used Internally in Backend)
exports.addNotification = async (user_id, message, type = 'general', role = null) => {
    try {
        await pool.query(
            'INSERT INTO notifications (user_id, message, type, role) VALUES ($1, $2, $3, $4)',
            [user_id, message, type, role]
        );
    } catch (err) {
        console.error('Error adding notification:', err.message);
    }
};
