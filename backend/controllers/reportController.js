const pool = require('../config/db');

// ✅ 1. Get Most Borrowed Books (Admins Only)
exports.getMostBorrowedBooks = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT books.title, COUNT(borrow_records.id) AS borrow_count
            FROM borrow_records
            JOIN books ON borrow_records.book_id = books.id
            WHERE borrow_records.status = 'approved'
            GROUP BY books.title
            ORDER BY borrow_count DESC
            LIMIT 5;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ 2. Get Overdue Books (Admins Only)
exports.getOverdueBooks = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT borrow_records.id, users.name AS student_name, books.title AS book_title, borrow_records.borrow_date, borrow_records.return_date
            FROM borrow_records
            JOIN users ON borrow_records.user_id = users.id
            JOIN books ON borrow_records.book_id = books.id
            WHERE borrow_records.status = 'approved' AND borrow_records.return_date IS NULL
            AND borrow_records.borrow_date < NOW() - INTERVAL '14 days'
            ORDER BY borrow_records.borrow_date ASC;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ 3. Get Fine Reports (Admins Only)
exports.getFineReports = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT users.name AS student_name, SUM(borrow_records.fine) AS total_fine
            FROM borrow_records
            JOIN users ON borrow_records.user_id = users.id
            WHERE borrow_records.fine > 0
            GROUP BY users.name
            ORDER BY total_fine DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ 4. Admin Marks Fine as Paid
exports.markFineAsPaid = async (req, res) => {
    try {
        const { borrow_id } = req.params;

        // Ensure borrow record exists and has a fine
        const borrowCheck = await pool.query('SELECT fine FROM borrow_records WHERE id = $1', [borrow_id]);
        if (borrowCheck.rows.length === 0) return res.status(404).json({ error: 'Borrow record not found' });

        const fineAmount = borrowCheck.rows[0].fine;
        if (fineAmount <= 0) return res.status(400).json({ error: 'No fine to pay' });

        // Mark fine as paid and reset fine to 0
        await pool.query('UPDATE borrow_records SET fine = 0 WHERE id = $1', [borrow_id]);

        res.json({ message: 'Fine marked as paid successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};
