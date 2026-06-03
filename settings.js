// ─── SETTINGS.JS (SUPABASE + THEME INTEGRATED) ──────────────────────────────
const BACKEND_URL = ''; // Leave empty for automatic routing

// Get form elements
const saveBtn = document.querySelector('.btn-save');
const cancelBtn = document.querySelector('.btn-cancel');
const deleteBtn = document.querySelector('.btn-danger');
const themeToggle = document.querySelector('#theme-toggle');
const toggleSwitches = document.querySelectorAll('input[type="checkbox"]:not(#theme-toggle)');
const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
const selectDropdowns = document.querySelectorAll('select');
const infoBoxText = document.querySelector('.info-box-text');

const themeKey = 'civicsync_theme';

// Store original values to track changes
const originalValues = {
  inputs: {},
  toggles: {},
  selects: {}
};
let originalThemeToggleValue = false;

// ─── THEME LOGIC ───
const applyTheme = (useLight) => {
  document.body.classList.toggle('light-theme', useLight);
  document.body.classList.toggle('light-mode', useLight); // Support both class names
  localStorage.setItem(themeKey, useLight ? 'light' : 'dark');
};

const loadThemeFromStorage = () => {
  const savedTheme = localStorage.getItem(themeKey);
  const useLight = savedTheme === 'light';
  if (themeToggle) {
    themeToggle.checked = useLight;
  }
  applyTheme(useLight);
  originalThemeToggleValue = useLight;
};

// ─── SUPABASE LOAD LOGIC ───
document.addEventListener('DOMContentLoaded', async () => {
  loadThemeFromStorage();

  // Load User Data DIRECTLY from Supabase
  const { data: { session }, error } = await window.supabase.auth.getSession();
  
  if (error || !session) {
      if (infoBoxText) infoBoxText.textContent = 'Not logged in';
      window.location.href = '/login.html'; // Kick out if not logged in
      return;
  }

  const user = session.user;
  const currentName = user.user_metadata?.full_name || 'Citizen';
  const currentPhone = user.user_metadata?.phone || '';
  
  // Populate the UI
  if (infoBoxText) infoBoxText.textContent = `${currentName} (${user.email})`;
  if (textInputs[0]) textInputs[0].value = currentName;
  if (textInputs[1]) {
      textInputs[1].value = user.email;
      textInputs[1].disabled = true; // Security: Prevent changing email easily
  }
  if (textInputs[2]) textInputs[2].value = currentPhone;

  // Save original values on load
  textInputs.forEach((input, index) => originalValues.inputs[index] = input.value);
  toggleSwitches.forEach((toggle, index) => originalValues.toggles[index] = toggle.checked);
  selectDropdowns.forEach((select, index) => originalValues.selects[index] = select.value);
  
  trackChanges();
});

// ─── SAVE CHANGES ───
if (saveBtn) {
  saveBtn.addEventListener('click', async () => {
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    const newName = textInputs[0] ? textInputs[0].value.trim() : '';
    const newPhone = textInputs[2] ? textInputs[2].value.trim() : '';

    // Send update to Supabase
    const { data, error } = await window.supabase.auth.updateUser({
        data: { full_name: newName, phone: newPhone }
    });

    if (error) {
        alert('Failed to save settings: ' + error.message);
    } else {
        alert('Settings saved successfully!');
        if (infoBoxText) infoBoxText.textContent = `${newName} (${data.user.email})`;
        
        // Update original values so buttons grey out again
        textInputs.forEach((input, index) => originalValues.inputs[index] = input.value);
        if (themeToggle) {
            applyTheme(themeToggle.checked);
            originalThemeToggleValue = themeToggle.checked;
        }
    }
    
    saveBtn.textContent = 'Save Changes';
    saveBtn.disabled = false;
    trackChanges();
  });
}

// ─── CANCEL CHANGES ───
if (cancelBtn) {
  cancelBtn.addEventListener('click', () => {
    if (confirm('Discard all changes?')) {
      // Restore original values
      textInputs.forEach((input, index) => input.value = originalValues.inputs[index]);
      toggleSwitches.forEach((toggle, index) => toggle.checked = originalValues.toggles[index]);
      selectDropdowns.forEach((select, index) => select.value = originalValues.selects[index]);
      
      if (themeToggle) {
        themeToggle.checked = originalThemeToggleValue;
        applyTheme(themeToggle.checked);
      }
      
      trackChanges(); // Instantly grey out the buttons
    }
  });
}

// ─── DELETE ACCOUNT ───
if (deleteBtn) {
  deleteBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to completely delete your account? This action cannot be undone.')) return;
    
    const doubleConfirm = confirm('This is your final warning. Click OK to confirm deletion.');
    if (!doubleConfirm) return;

    // Get the active session token
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) return;

    deleteBtn.textContent = "Deleting...";

    try {
        // Tell our backend to delete this specific user
        const response = await fetch(`${BACKEND_URL}/api/user/delete-self`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (response.ok) {
            await window.supabase.auth.signOut(); // Log out from browser
            alert('Account permanently deleted.');
            window.location.href = '/register.html'; 
        } else {
            alert('Failed to delete account. Please try again.');
            deleteBtn.textContent = "Delete Account";
        }
    } catch (err) {
        alert('Server error.');
        deleteBtn.textContent = "Delete Account";
    }
  });
}

// ─── TRACK CHANGES FOR BUTTON STATE ───
const trackChanges = () => {
  let hasChanges = false;
  
  textInputs.forEach((input, index) => {
    if (input.value !== originalValues.inputs[index]) hasChanges = true;
  });
  
  toggleSwitches.forEach((toggle, index) => {
    if (toggle.checked !== originalValues.toggles[index]) hasChanges = true;
  });
  
  selectDropdowns.forEach((select, index) => {
    if (select.value !== originalValues.selects[index]) hasChanges = true;
  });

  if (themeToggle && themeToggle.checked !== originalThemeToggleValue) {
    hasChanges = true;
  }
  
  // Update button state
  if (saveBtn && cancelBtn) {
    if (hasChanges) {
      saveBtn.style.opacity = '1';
      saveBtn.style.pointerEvents = 'auto';
      cancelBtn.style.opacity = '1';
      cancelBtn.style.pointerEvents = 'auto';
    } else {
      saveBtn.style.opacity = '0.5';
      saveBtn.style.pointerEvents = 'none';
      cancelBtn.style.opacity = '0.5';
      cancelBtn.style.pointerEvents = 'none';
    }
  }
};

// Add change listeners
textInputs.forEach(input => input.addEventListener('input', trackChanges));
toggleSwitches.forEach(toggle => toggle.addEventListener('change', trackChanges));
selectDropdowns.forEach(select => select.addEventListener('change', trackChanges));

if (themeToggle) {
  themeToggle.addEventListener('change', () => {
    applyTheme(themeToggle.checked);
    trackChanges();
  });
}

// Initialize change tracking
trackChanges();