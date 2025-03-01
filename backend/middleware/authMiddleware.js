const jwt = require('jsonwebtoken');
require('dotenv').config();

// ✅ Middleware to Verify JWT Token
exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// ✅ Middleware to Restrict Access to Admins & Librarians
exports.verifyAdminLibrarian = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
        return res.status(403).json({ error: 'Forbidden: Only Admins or Librarians can perform this action' });
    }
    next();
};
