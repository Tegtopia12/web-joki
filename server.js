const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

