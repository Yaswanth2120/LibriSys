const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'librisys_db', // Hardcoded for now, to ensure it's correct
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

pool.connect((err) => {
    if (err) {
        console.error('❌ Database Connection Failed:', err.stack);
    } else {
        console.log('📦 Database Connected Successfully');
    }
});

module.exports = pool;
