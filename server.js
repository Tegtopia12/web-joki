const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Melayani file statis dari public dan root
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Data sementara di memori Vercel
let orders = [];

// Endpoint: Simpan Pesanan Baru
app.post('/api/order', (req, res) => {
    const { user_id, server_id, login_type, account_login, paket, total_harga } = req.body;

    if (!user_id || !login_type || !account_login || !paket || !total_harga) {
        return res.status(400).json({ 
            success: false, 
            message: 'Semua data wajib diisi!' 
        });
    }

    const newOrder = {
        id: Date.now(),
        user_id,
        server_id: server_id || '-',
        login_type,
        account_login,
        paket,
        total_harga,
        status: 'Pending',
        created_at: new Date().toISOString()
    };

    orders.push(newOrder);

    res.json({
        success: true,
        message: 'Pesanan berhasil dibuat!',
        orderId: newOrder.id
    });
});

// Endpoint: Ambil Pesanan untuk Admin
app.get('/api/admin/orders', (req, res) => {
    res.json({ 
        success: true, 
        data: orders 
    });
});

// Route Frontend untuk menampilkan HTML
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
