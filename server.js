require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const emailjs = require('@emailjs/nodejs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname)));

// Initialize Supabase with the service role key (admin)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ─── EMAIL ROUTE ──────────────────────────────────────────────────────────────
app.post('/api/send-confirmation', async (req, res) => {
    const { userEmail, userName, bookingRef, office, address, date, time, bookedAt, mapsLink, qrCodeBase64 } = req.body;
    try {
        await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            {
                to_email: userEmail,
                to_name: userName,
                ref: bookingRef,
                office: office,
                address: address,
                date: date,
                time: time,
                booked_at: bookedAt,
                maps_link: mapsLink,
                qr_image: qrCodeBase64,
            },
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY,
            }
        );
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('EmailJS error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// The South African ID Luhn Check Algorithm
const validateSAID = (id) => {
    if (!/^\d{13}$/.test(id)) return false;
    let total = 0;
    for (let i = 0; i < 12; i++) {
        let digit = parseInt(id[i], 10);
        if (i % 2 !== 0) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        total += digit;
    }
    const checkDigit = (10 - (total % 10)) % 10;
    return checkDigit === parseInt(id[12], 10);
};

// Secure Registration Route (uses Supabase)
app.post('/api/register', async (req, res) => {
    const { email, password, fullName, idNumber } = req.body;
    if (!validateSAID(idNumber)) return res.status(400).json({ error: 'Invalid South African ID Number' });

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { full_name: fullName, id_number: idNumber, role: 'citizen' } },
        });
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: 'Registration successful', user: data.user });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});


