<<<<<<< HEAD
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
=======
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase with the ADMIN key
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Middleware to check if the user is a Supervisor
const verifySupervisor = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) return res.status(401).json({ error: "Invalid token" });
    
    // Check the custom role metadata we set during registration
    if (user.user_metadata?.role !== 'supervisor') {
        return res.status(403).json({ error: "Access denied: Supervisors only" });
    }
    
    next(); // User is a supervisor, allow them through
};

// Protected Admin Route
app.get('/api/admin/dashboard', verifySupervisor, async (req, res) => {
    // Because the middleware passed, we know a supervisor is asking for this data
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ users: data.users, message: "Welcome to the Admin Dashboard" });
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

// Secure Registration Route
app.post('/api/register', async (req, res) => {
    const { email, password, fullName, idNumber } = req.body;

    // 1. Run the strict server-side validation
    if (!validateSAID(idNumber)) {
        return res.status(400).json({ error: "Invalid South African ID Number" });
    }

    // 2. If valid, process the registration with Supabase
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: fullName,
                id_number: idNumber,
                role: 'citizen' // Default role
            }
        }
    });

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: "Registration successful", user: data.user });
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
>>>>>>> a2f345e6a75495b650157428d047f81e0de2a156
