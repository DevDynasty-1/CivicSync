// ─── SETTINGS.JS (CLEAN FRONTEND VERSION) ──────────────────────────────

const BACKEND_URL = 'http://localhost:3000';
const saveBtn = document.querySelector('.btn-save');
const deleteBtn = document.querySelector('.btn-danger');
const infoBoxText = document.querySelector('.info-box-text');
const nameInput = document.querySelector('input[type="text"]');
const emailInput = document.querySelector('input[type="email"]');
const phoneInput = document.querySelector('input[type="tel"]');

// 1. Load User Data on Page Open
document.addEventListener('DOMContentLoaded', () => {
    const userDataString = sessionStorage.getItem('civicsync_user');
    
    if (userDataString) {
        try {
            const user = JSON.parse(userDataString);
            
            // Check all possible places the name might be saved
            const displayName = user.full_name || user.name || (user.user_metadata && user.user_metadata.full_name) || 'Citizen';
            
            // Populate the UI
            if (infoBoxText) infoBoxText.textContent = `${displayName} (${user.email || 'No Email'})`;
            if (nameInput) nameInput.value = displayName;
            if (emailInput) emailInput.value = user.email || '';
            if (emailInput) emailInput.disabled = true; // Security: don't let them change email easily
            
        } catch(e) {
            console.error("Error parsing user data", e);
        }
    } else {
        if (infoBoxText) infoBoxText.textContent = 'Not logged in';
        window.location.href = '/login.html'; // Kick out if not logged in
    }
});

// 2. Save Changes (Update Name locally to feel fast)
if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        
        try {
            // Update the session storage immediately
            const userDataString = sessionStorage.getItem('civicsync_user');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                userData.full_name = nameInput ? nameInput.value : userData.full_name;
                userData.name = nameInput ? nameInput.value : userData.name;
                
                sessionStorage.setItem('civicsync_user', JSON.stringify(userData));

                if (infoBoxText) infoBoxText.textContent = `${userData.full_name || userData.name} (${userData.email})`;
                alert('Settings saved successfully!');
            }
        } catch(e) {
            console.error(e);
        } finally {
            saveBtn.textContent = originalText;
        }
    });
}

// 3. Delete Account
if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
        const confirmDelete = confirm('Are you sure you want to delete your account? This cannot be undone.');
        
        if (confirmDelete) {
            const doubleConfirm = confirm('This is your final warning. Click OK to confirm deletion.');
            if (!doubleConfirm) return;

            const userDataString = sessionStorage.getItem('civicsync_user');
            if (!userDataString) return;
            
            const userData = JSON.parse(userDataString);
            
            try {
                // Tell backend to delete this user securely
                const response = await fetch(`${BACKEND_URL}/api/user/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userData.email })
                });

                if (response.ok) {
                    alert('Account permanently deleted.');
                    sessionStorage.removeItem('civicsync_user'); // Clear session
                    window.location.href = '/register.html'; // Redirect to home
                } else {
                    const errData = await response.json();
                    alert(`Failed to delete account: ${errData.error || 'Server error'}`);
                }
            } catch (err) {
                alert('Could not reach the server to delete account.');
            }
        }
    });
}

// 4. Light/Dark Mode Toggle Logic for Settings
const themeToggleSwitch = document.getElementById('theme-toggle'); // Ensure your settings HTML has an element with id="theme-toggle"
if (themeToggleSwitch) {
    // Check local storage on load
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        if(themeToggleSwitch.type === 'checkbox') themeToggleSwitch.checked = true;
    }

    themeToggleSwitch.addEventListener('change', (e) => {
        if (e.target.checked || document.body.classList.contains('light-mode') === false) {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    });
}