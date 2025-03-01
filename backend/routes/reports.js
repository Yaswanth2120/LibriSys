const express = require('express');
const { getMostBorrowedBooks, getOverdueBooks, getFineReports, markFineAsPaid } = require('../controllers/reportController');
const { verifyToken, verifyAdminLibrarian } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/most-borrowed', verifyToken, verifyAdminLibrarian, getMostBorrowedBooks);
router.get('/overdue-books', verifyToken, verifyAdminLibrarian, getOverdueBooks);
router.get('/fine-reports', verifyToken, verifyAdminLibrarian, getFineReports);
router.post('/pay-fine/:borrow_id', verifyToken, verifyAdminLibrarian, markFineAsPaid);

module.exports = router;
