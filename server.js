const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database'); // Memanggil modul database.js

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Melayani file statis (HTML, CSS, JS, Gambar) dari folder 'public' dan folder utama (root)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// ==========================================
// API ENDPOINTS
// ==========================================

// Endpoint: Simpan Pesanan Baru
app.post('/api/order', (req, res) => {
    const { user_id, server_id, login_type, account_login, paket, total_harga } = req.body;

    if (!user_id || !login_type || !account_login || !paket || !total_harga) {
        return res.status(400).json({ 
            success: false, 
            message: 'Semua data formulir wajib diisi!' 
        });
    }

    const query = `
        INSERT INTO orders (user_id, server_id, login_type, account_login, paket, total_harga, status) 
        VALUES (?, ?, ?, ?, ?, ?, 'Pending')
    `;

    db.run(query, [user_id, server_id || '-', login_type, account_login, paket, total_harga], function (err) {
        if (err) {
            console.error('Gagal menyimpan pesanan:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Terjadi kesalahan pada database.' 
            });
        }

        res.json({
            success: true,
            message: 'Pesanan berhasil dibuat!',
            orderId: this.lastID
        });
    });
});

// Endpoint: Ambil Semua Pesanan (Untuk Admin)
app.get('/api/admin/orders', (req, res) => {
    const query = `
        SELECT id, user_id, server_id, login_type, account_login, paket, total_harga, status, created_at 
        FROM orders 
        ORDER BY id DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Gagal mengambil data pesanan:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: err.message 
            });
        }

        res.json({ 
            success: true, 
            data: rows 
        });
    });
});

// ==========================================
// ROUTE HALAMAN UTAMA (FRONTEND)
// ==========================================

// Menampilkan halaman index.html (mencoba dari folder public terlebih dahulu)
app.get('/', (req, res) => {
    const publicIndex = path.join(__dirname, 'public', 'index.html');
    const rootIndex = path.join(__dirname, 'index.html');

    const fs = require('fs');
    if (fs.existsSync(publicIndex)) {
        res.sendFile(publicIndex);
    } else {
        res.sendFile(rootIndex);
    }
});

// Catch-all route untuk mengarahkan request halaman ke index.html
app.get('*', (req, res) => {
    const publicIndex = path.join(__dirname, 'public', 'index.html');
    const rootIndex = path.join(__dirname, 'index.html');

    const fs = require('fs');
    if (fs.existsSync(publicIndex)) {
        res.sendFile(publicIndex);
    } else {
        res.sendFile(rootIndex);
    }
});

// Jalankan server lokal
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Export app untuk Vercel Serverless Function
module.exports = app;
