// application.js — CivicSync Triage Wizard

// Document checklist per application type
//still need to add API for document verification

const checklists = {
  'first-id': [
    'Original birth certificate (unabridged)',
    'Proof of address (not older than 3 months)',
    'One recent passport-sized photo',
    'Parent or guardian ID (if under 16)',
  ],
  'replace-id': [
    'Affidavit confirming loss or theft (from SAPS)',
    'Proof of address (not older than 3 months)',
    'One recent passport-sized photo',
  ],
  'new-passport': [
    'South African ID document or birth certificate',
    'Proof of address (not older than 3 months)',
    'Two recent passport-sized photos',
    'Completed DHA-73 form',
  ],
  'renew-passport': [
    'Current or expired South African passport',
    'South African ID document',
    'Two recent passport-sized photos',
    'Completed DHA-73 form',
  ],
  'birth-cert': [
    'Parent(s) ID document(s)',
    'Hospital birth record or clinic card',
    'Marriage certificate (if applicable)',
    'Completed DHA-24 form',
  ],
  'other': [
    'South African ID document',
    'Proof of address (not older than 3 months)',
    'Supporting documents relevant to your application',
    'Completed application form (collect at Home Affairs)',
  ],
};

const form = document.getElementById('app-type-form');
const radios = document.querySelectorAll('input[name="appType"]');
const continueBtn = document.querySelector('.btn-continue');

// Highlight selected card and update button state
radios.forEach(radio => {
  radio.addEventListener('change', () => {
    // Remove active class from all labels
    document.querySelectorAll('.card-label').forEach(label => {
      label.classList.remove('card-selected');
    });
    // Add to the chosen one
    radio.nextElementSibling.classList.add('card-selected');
    continueBtn.disabled = false;
    continueBtn.style.opacity = '1';
  });
});

// Disable continue button until a selection is made
continueBtn.disabled = true;
continueBtn.style.opacity = '0.5';
continueBtn.style.cursor = 'not-allowed';

// On form submit — save selection and checklist, redirect to document vault
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const selected = document.querySelector('input[name="appType"]:checked');
  if (!selected) {
    showToast('Please select an application type before continuing.', 'error');
    return;
  }

  const appType = selected.value;
  const checklist = checklists[appType];

  // Persist to sessionStorage so other pages can read it
  sessionStorage.setItem('civicsync_app_type', appType);
  sessionStorage.setItem('civicsync_checklist', JSON.stringify(checklist));

  showToast('Application type saved. Loading your checklist...', 'success');

  // Redirect after short delay so the user sees the toast
  setTimeout(() => {
    window.location.href = 'booking.html';
  }, 1200);
});

// Toast notification helper
function showToast(message, type = 'success') {
  // Remove any existing toast
  const existing = document.getElementById('cs-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cs-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#38bdf8' : '#f87171'};
    color: ${type === 'success' ? '#0f172a' : '#fff'};
    padding: 14px 28px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    z-index: 9999;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    transition: opacity 0.4s ease;
  `;
  document.body.appendChild(toast);

  // Fade out after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
