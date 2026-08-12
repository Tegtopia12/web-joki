const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'joki.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Gagal membuka database:', err.message);
    } else {
        console.log('Terhubung ke database SQLite.');
    }
});

// Membuat tabel orders jika belum ada
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            server_id TEXT NOT NULL,
            login_type TEXT NOT NULL,
            account_login TEXT NOT NULL,
            account_password TEXT NOT NULL,
            paket TEXT NOT NULL,
            total_harga INTEGER NOT NULL,
            status TEXT DEFAULT 'PENDING',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;
