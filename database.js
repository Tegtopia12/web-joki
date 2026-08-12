const path = require('path');
let db;

if (process.env.VERCEL) {
    // Mode Vercel Serverless (Tanpa memanggil sqlite3 sama sekali)
    db = {
        run: function(query, params, callback) {
            if (typeof callback === 'function') callback.call({ lastID: Date.now() }, null);
        },
        all: function(query, params, callback) {
            if (typeof callback === 'function') callback(null, []);
        },
        serialize: function(fn) { if (fn) fn(); }
    };
} else {
    // Mode Lokal (Termux / PC)
    try {
        const sqlite3 = require('sqlite3').verbose();
        const dbPath = path.resolve(__dirname, 'joki.db');
        db = new sqlite3.Database(dbPath);
        
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT, server_id TEXT, login_type TEXT,
                    account_login TEXT, paket TEXT, total_harga INTEGER,
                    status TEXT DEFAULT 'Pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
        });
    } catch (e) {
        console.error("SQLite3 gagal dimuat:", e.message);
    }
}

module.exports = db;
