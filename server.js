const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Melayani file statis (CSS, JS, Gambar) dari folder public
app.use(express.static(path.join(process.cwd(), 'public')));

let orders = [];

// Endpoint API Order
app.post('/api/order', (req, res) => {
    const { user_id, server_id, login_type, account_login, paket, total_harga } = req.body;

    if (!user_id || !login_type || !account_login || !paket || !total_harga) {
        return res.status(400).json({ success: false, message: 'Semua data wajib diisi!' });
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
    res.json({ success: true, message: 'Pesanan berhasil dibuat!', orderId: newOrder.id });
});

// Endpoint API Admin
app.get('/api/admin/orders', (req, res) => {
    res.json({ success: true, data: orders });
});

// Route Catch-all untuk Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
