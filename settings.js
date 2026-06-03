// settings.js — Settings Page

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

// Store original values
const originalValues = {
  inputs: {},
  toggles: {},
  selects: {}
};
let originalThemeToggleValue = false;

const applyTheme = (useLight) => {
  document.body.classList.toggle('light-theme', useLight);
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

// Load signed-in user data and populate form
document.addEventListener('DOMContentLoaded', () => {
  const userDataString = sessionStorage.getItem('civicsync_user');
  
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      // Populate form fields with user data
      if (textInputs[0]) textInputs[0].value = userData.name || '';
      if (textInputs[1]) textInputs[1].value = userData.email || '';
      if (textInputs[2]) textInputs[2].value = userData.phone || '';
      
      // Update "Logged in as" info box
      if (infoBoxText) {
        infoBoxText.textContent = `${userData.name || 'User'} (${userData.email || 'No email'})`;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  } else {
    // No user signed in - clear fields and show empty state
    if (infoBoxText) {
      infoBoxText.textContent = 'Not logged in';
    }
    // Clear all text inputs
    textInputs.forEach(input => {
      input.value = '';
    });
  }

  loadThemeFromStorage();
  
  // Save original values on load
  textInputs.forEach((input, index) => {
    originalValues.inputs[index] = input.value;
  });
  
  toggleSwitches.forEach((toggle, index) => {
    originalValues.toggles[index] = toggle.checked;
  });
  
  selectDropdowns.forEach((select, index) => {
    originalValues.selects[index] = select.value;
  });
});

// Save changes
if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    // Collect all form data
    const formData = {
      displayName: document.querySelector('input[type="text"]').value,
      email: document.querySelector('input[type="email"]').value,
      phone: document.querySelector('input[type="tel"]').value,
      twoFactor: toggleSwitches[0].checked,
      emailNotifications: toggleSwitches[1].checked,
      smsNotifications: toggleSwitches[2].checked,
      language: selectDropdowns[0].value,
      theme: themeToggle && themeToggle.checked ? 'light' : 'dark'
    };

    console.log('Saving settings:', formData);

    if (themeToggle) {
      applyTheme(themeToggle.checked);
      originalThemeToggleValue = themeToggle.checked;
    }

    alert('Settings saved successfully!');

    // Update original values
    textInputs.forEach((input, index) => {
      originalValues.inputs[index] = input.value;
    });

    toggleSwitches.forEach((toggle, index) => {
      originalValues.toggles[index] = toggle.checked;
    });

    selectDropdowns.forEach((select, index) => {
      originalValues.selects[index] = select.value;
    });
  });
}

// Cancel changes
if (cancelBtn) {
  cancelBtn.addEventListener('click', () => {
    if (confirm('Discard all changes?')) {
      // Restore original values
      textInputs.forEach((input, index) => {
        input.value = originalValues.inputs[index];
      });
      
      toggleSwitches.forEach((toggle, index) => {
        toggle.checked = originalValues.toggles[index];
      });

      if (themeToggle) {
        themeToggle.checked = originalThemeToggleValue;
        applyTheme(themeToggle.checked);
      }
      
      selectDropdowns.forEach((select, index) => {
        select.value = originalValues.selects[index];
      });
      
      alert('Changes discarded.');
    }
  });
}

// Delete account
if (deleteBtn) {
  deleteBtn.addEventListener('click', () => {
    const confirmDelete = confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.'
    );
    
    if (confirmDelete) {
      const doubleConfirm = confirm(
        'This is your final warning. Type your email to confirm deletion.'
      );
      
      if (doubleConfirm) {
        alert('Your account has been scheduled for deletion. You will receive a confirmation email.');
        // In a real app, this would send a request to the server
        window.location.href = 'index.html';
      }
    }
  });
}

// Track changes
const trackChanges = () => {
  let hasChanges = false;
  
  textInputs.forEach((input, index) => {
    if (input.value !== originalValues.inputs[index]) {
      hasChanges = true;
    }
  });
  
  toggleSwitches.forEach((toggle, index) => {
    if (toggle.checked !== originalValues.toggles[index]) {
      hasChanges = true;
    }
  });
  
  selectDropdowns.forEach((select, index) => {
    if (select.value !== originalValues.selects[index]) {
      hasChanges = true;
    }
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
textInputs.forEach(input => {
  input.addEventListener('change', trackChanges);
});

toggleSwitches.forEach(toggle => {
  toggle.addEventListener('change', trackChanges);
});

if (themeToggle) {
  themeToggle.addEventListener('change', () => {
    applyTheme(themeToggle.checked);
    trackChanges();
  });
}

selectDropdowns.forEach(select => {
  select.addEventListener('change', trackChanges);
});

// Initialize change tracking
trackChanges();