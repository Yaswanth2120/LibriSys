const express = require('express');
const { getAllBooks, getBookById, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { verifyToken, verifyAdminLibrarian } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', verifyToken, verifyAdminLibrarian, addBook);
router.put('/:id', verifyToken, verifyAdminLibrarian, updateBook);
router.delete('/:id', verifyToken, verifyAdminLibrarian, deleteBook);

module.exports = router;
