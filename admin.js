function switchTab(tabName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active-section');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    document.getElementById(`${tabName}-tab`).classList.add('active-section');

    // Highlight clicked button
    event.currentTarget.classList.add('active');
}

const BACKEND_URL = 'http://localhost:3000';

// Function to fetch the JWT token for the logged-in admin
async function getAuthToken() {
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) {
        window.location.href = '/login.html'; // Kick out if not logged in
        return null;
    }
    return session.access_token;
}

// ─── CITIZENS TABLE ──────────────────────────────────────────────────────
async function loadCitizens() {
    const token = await getAuthToken();
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const users = await response.json();
        const tbody = document.getElementById('citizens-table-body');
        tbody.innerHTML = ''; 

        users.forEach(user => {
            const fullName = user.user_metadata?.full_name || 'No Name Provided';
            const idNumber = user.user_metadata?.id_number || 'N/A';
            const status = user.user_metadata?.account_status || 'active';
            
            const statusBadge = status === 'active' 
                ? `<span style="color:#4ade80;">Active</span>` 
                : `<span style="color:#f43f5e;">Suspended</span>`;

            tbody.innerHTML += `
                <tr>
                    <td>
                        <strong>${idNumber}</strong><br>
                        <small style="color:#94a3b8">${user.email}</small>
                    </td>
                    <td>${fullName}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button onclick="editUser('${user.id}', '${fullName}', '${idNumber}')" class="btn-action" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 8px; font-weight: bold;">Edit</button>
                        <button onclick="suspendUser('${user.id}')" class="btn-action btn-success" style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 8px; font-weight: bold;">Suspend</button>
                        <button onclick="deleteUser('${user.id}')" class="btn-action btn-danger" style="background: rgba(244, 63, 94, 0.2); color: #fb7185; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Failed to load citizens:", error);
    }
}

// ─── ACTION LOGIC ──────────────────────────────────────────────────────────
async function editUser(userId, currentName, currentId) {
    const newName = prompt("Edit Full Name:", currentName);
    if (newName === null) return; 

    const newIdNumber = prompt("Edit ID Number:", currentId);
    if (newIdNumber === null) return; 

    if (newName === currentName && newIdNumber === currentId) return;

    const token = await getAuthToken();
    const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/update`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ newName, newIdNumber })
    });

    if (response.ok) {
        alert("Citizen information successfully updated.");
        loadCitizens();
    } else {
        alert("Failed to update citizen.");
    }
}

async function deleteUser(userId) {
    if (!confirm("Are you sure you want to permanently delete this citizen?")) return;
    const token = await getAuthToken();
    const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        alert("User deleted successfully.");
        loadCitizens();
    }
}

async function suspendUser(userId) {
    if (!confirm("Suspend this account? They will no longer be able to book appointments.")) return;
    const token = await getAuthToken();
    const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) loadCitizens();
}

// ─── BOOKINGS TABLE ────────────────────────────────────────────────────────
async function loadBookings() {
    const token = await getAuthToken();
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const bookings = await response.json();
        const tbody = document.getElementById('bookings-table-body');
        tbody.innerHTML = ''; 

        bookings.forEach(booking => {
            const statusBadge = `<span style="color:#38bdf8; background:rgba(56,189,248,0.1); padding:4px 8px; border-radius:6px; font-size:0.75rem;">${booking.status}</span>`;

            tbody.innerHTML += `
                <tr>
                    <td><strong style="color:#fbbf24">${booking.reference}</strong></td>
                    <td>
                        <strong>${booking.citizen_name}</strong><br>
                        <small style="color:#94a3b8">${booking.office}</small>
                    </td>
                    <td>${booking.date} at ${booking.time}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button onclick="cancelBooking('${booking.reference}')" class="btn-action btn-danger" style="background: rgba(244, 63, 94, 0.2); color: #fb7185; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">Cancel</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Failed to load bookings:", error);
    }
}

async function cancelBooking(ref) {
    if (!confirm(`Are you sure you want to cancel booking ${ref}?`)) return;
    
    const token = await getAuthToken();
    const response = await fetch(`${BACKEND_URL}/api/bookings/${ref}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        alert("Booking cancelled successfully.");
        loadBookings();
    } else {
        alert("Failed to cancel the booking.");
    }
}

// ─── INITIALIZATION & THEME TOGGLE ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadCitizens();
    loadBookings(); 
});

// Light/Dark Mode Toggle Logic for Admin
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    // Check if user previously saved a theme preference
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        // Save preference so it remembers across pages
        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
    });
}