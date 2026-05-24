const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const emailjs  = require('@emailjs/nodejs');
const path     = require('path');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname)));

// ─── EMAIL ROUTE ──────────────────────────────────────────────────────────────
app.post('/api/send-confirmation', async (req, res) => {
    const { userEmail, userName, bookingRef, office, address, date, time, bookedAt, mapsLink, qrCodeBase64 } = req.body;

    try {
        await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            {
                to_email:  userEmail,
                to_name:   userName,
                ref:       bookingRef,
                office:    office,
                address:   address,
                date:      date,
                time:      time,
                booked_at: bookedAt,
                maps_link: mapsLink,
                qr_image:  qrCodeBase64,
            },
            {
                publicKey:  process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY,
            }
        );
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('EmailJS error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`CivicSync server running at http://localhost:${PORT}`);
});