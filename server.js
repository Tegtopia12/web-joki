const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================================
// TOKEN DAN CHAT ID (SUDAH DIPERBAIKI SINTAKSNYA)
// ========================================================
const TELEGRAM_BOT_TOKEN = '8743786791:AAEf4OAfwe740KXJiWurn_hpIrImRpEq2Jw';
const TELEGRAM_CHAT_ID = '5914004650';
// ========================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Fungsi Kirim Notifikasi ke Telegram
async function sendTelegramNotification(order) {
    console.log('[TELEGRAM] Mengirim notifikasi untuk Order ID:', order.id);

    const textMessage = 
`🔔 *PESANAN JOKI BARU!*
===========================
🆔 *Order ID:* #${order.id}
🎮 *User ID:* ${order.userId} (${order.serverId})
🔑 *Tipe Login:* ${order.loginType}
📧 *Akun:* \`${order.accountLogin}\`
🔒 *Password:* \`${order.accountPassword}\`
📦 *Paket:* ${order.paket}
💰 *Total:* Rp ${order.totalHarga.toLocaleString('id-ID')}
===========================`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: textMessage,
                parse_mode: 'Markdown'
            })
        });

        const resData = await response.json();
        if (!resData.ok) {
            console.error('[TELEGRAM ERROR]:', resData.description);
        } else {
            console.log('[TELEGRAM SUCCESS] Notifikasi berhasil terkirim ke Telegram!');
        }
    } catch (err) {
        console.error('[TELEGRAM FETCH ERROR]:', err.message);
    }
}

app.post('/api/order', (req, res) => {
    const { userId, serverId, loginType, accountLogin, accountPassword, paket, totalHarga } = req.body;

    if (!userId || !serverId || !accountLogin || !accountPassword) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap!' });
    }

    const query = `
        INSERT INTO orders (user_id, server_id, login_type, account_login, account_password, paket, total_harga)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [userId, serverId, loginType, accountLogin, accountPassword, paket, totalHarga], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Gagal menyimpan pesanan.' });
        }

        const orderId = this.lastID;

        // Panggil fungsi kirim notifikasi Telegram
        sendTelegramNotification({
            id: orderId,
            userId,
            serverId,
            loginType,
            accountLogin,
            accountPassword,
            paket,
            totalHarga
        });

        res.json({
            success: true,
            orderId: orderId,
            message: 'Pesanan berhasil dibuat!'
        });
    });
});

app.get('/api/admin/orders', (req, res) => {
    db.all(`SELECT id, user_id, server_id, login_type, account_login, paket, total_harga, status, created_at FROM orders ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: rows });
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;