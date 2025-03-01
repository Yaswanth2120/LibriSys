const pool = require('../config/db');

// ✅ 1. Get All Books (Public)
exports.getAllBooks = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM books');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ 2. Get a Single Book by ID (Public)
exports.getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ 3. Add a New Book (Admins & Librarians Only)
exports.addBook = async (req, res) => {
    try {
        const { title, author, isbn } = req.body;
        const result = await pool.query(
            'INSERT INTO books (title, author, isbn) VALUES ($1, $2, $3) RETURNING *',
            [title, author, isbn]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ 4. Update a Book (Admins & Librarians Only)
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, available } = req.body;
        const result = await pool.query(
            'UPDATE books SET title = $1, author = $2, isbn = $3, available = $4 WHERE id = $5 RETURNING *',
            [title, author, isbn, available, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ 5. Delete a Book (Admins & Librarians Only)
exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};
