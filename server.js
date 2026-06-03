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

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Middleware to check if the user is a Supervisor/Admin
const verifySupervisor = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: "Invalid token" });
    
    if (user.user_metadata?.role !== 'supervisor') {
        return res.status(403).json({ error: "Access denied: Supervisors only" });
    }
    next(); 
};

// ─── REGISTRATION & AUTH ──────────────────────────────────────────────────────
const validateSAID = (id) => {
    if (!/^\d{13}$/.test(id)) return false;
    let total = 0;
    for (let i = 0; i < 12; i++) {
        let digit = parseInt(id[i], 10);
        if (i % 2 !== 0) { digit *= 2; if (digit > 9) digit -= 9; }
        total += digit;
    }
    const checkDigit = (10 - (total % 10)) % 10;
    return checkDigit === parseInt(id[12], 10);
};

app.post('/api/register', async (req, res) => {
    const { email, password, fullName, idNumber } = req.body;
    if (!validateSAID(idNumber)) return res.status(400).json({ error: "Invalid South African ID" });

    const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName, id_number: idNumber, role: 'citizen', account_status: 'active' } }
    });

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: "Registration successful", user: data.user });
});

// ─── EMAIL CONFIRMATION ───────────────────────────────────────────────────────
app.post('/api/send-confirmation', async (req, res) => {
    const { userEmail, userName, bookingRef, office, address, date, time, bookedAt, mapsLink, qrCodeBase64 } = req.body;
    try {
        await emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_TEMPLATE_ID,
            { to_email: userEmail, to_name: userName, ref: bookingRef, office, address, date, time, booked_at: bookedAt, maps_link: mapsLink, qr_image: qrCodeBase64 },
            { publicKey: process.env.EMAILJS_PUBLIC_KEY, privateKey: process.env.EMAILJS_PRIVATE_KEY }
        );
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('EmailJS error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// ─── BOOKINGS ENGINE ──────────────────────────────────────────────────────────
app.post('/api/bookings', async (req, res) => {
    const { reference, citizen_name, citizen_email, office, date, time } = req.body;
    
    const { error } = await supabase.from('bookings').insert([
        { reference, citizen_name, citizen_email, office, date, time, status: 'Confirmed' }
    ]);

    if (error) return res.status(500).json({ error: "Database error: Failed to save booking." });
    res.status(200).json({ message: "Booking securely saved." });
});

app.delete('/api/bookings/:ref', async (req, res) => {
    const bookingRef = req.params.ref;
    const { error } = await supabase.from('bookings').delete().eq('reference', bookingRef);
    
    if (error) return res.status(500).json({ error: 'Failed to cancel booking' });
    res.status(200).json({ message: `Booking ${bookingRef} cancelled.` });
});

app.get('/api/admin/bookings', verifySupervisor, async (req, res) => {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// ─── ADMIN CITIZEN MANAGEMENT ─────────────────────────────────────────────────
app.get('/api/admin/users', verifySupervisor, async (req, res) => {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.users);
});

app.delete('/api/admin/users/:id', verifySupervisor, async (req, res) => {
    const { error } = await supabase.auth.admin.deleteUser(req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Citizen deleted." });
});

app.patch('/api/admin/users/:id/suspend', verifySupervisor, async (req, res) => {
    const { error } = await supabase.auth.admin.updateUserById(req.params.id, { user_metadata: { account_status: 'suspended' } });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Citizen suspended." });
});

// Admin updating a user's details
app.patch('/api/admin/users/:id/update', verifySupervisor, async (req, res) => {
    const userId = req.params.id;
    const { newName, newIdNumber } = req.body;

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { full_name: newName, id_number: newIdNumber }
    });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Citizen information updated successfully." });
});

// ─── USER SELF-DELETION ROUTE ─────────────────────────────────────────────────
app.post('/api/user/delete', async (req, res) => {
    const { email } = req.body;

    // Find the user by email first
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers();
    if (searchError) return res.status(500).json({ error: "Failed to search users" });

    const userToDelete = users.users.find(u => u.email === email);
    if (!userToDelete) return res.status(404).json({ error: "User not found" });

    // Delete them from Supabase
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userToDelete.id);
    if (deleteError) return res.status(500).json({ error: "Failed to delete user" });

    res.status(200).json({ message: "Account deleted successfully" });
});

app.listen(PORT, () => console.log(`CivicSync backend active on port ${PORT}`));