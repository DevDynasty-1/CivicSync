// settings.js — Settings Page

// Get form elements
const saveBtn = document.querySelector('.btn-save');
const cancelBtn = document.querySelector('.btn-cancel');
const deleteBtn = document.querySelector('.btn-danger');
const toggleSwitches = document.querySelectorAll('input[type="checkbox"]');
const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
const selectDropdowns = document.querySelectorAll('select');

// Store original values
const originalValues = {
  inputs: {},
  toggles: {},
  selects: {}
};

// Save original values on load
document.addEventListener('DOMContentLoaded', () => {
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
      theme: selectDropdowns[1].value
    };
    
    console.log('Saving settings:', formData);
    
    // Show success message
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

selectDropdowns.forEach(select => {
  select.addEventListener('change', trackChanges);
});

// Initialize change tracking
trackChanges();
