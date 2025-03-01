const express = require('express');
const { requestBorrow, approveBorrow, getPendingRequests, returnBook } = require('../controllers/borrowController');
const { verifyToken, verifyAdminLibrarian } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, requestBorrow);
router.put('/approve/:id', verifyToken, verifyAdminLibrarian, approveBorrow);
router.get('/pending-requests', verifyToken, verifyAdminLibrarian, getPendingRequests);
router.put('/return/:id', verifyToken, returnBook);

module.exports = router;
