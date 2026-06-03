// verification.js — CivicSync Document Verification

// --- GUARD: redirect back if user didn't go through upload ---
const isVerified   = sessionStorage.getItem('civicsync_verified') === 'true';
const uploadCount  = parseInt(sessionStorage.getItem('civicsync_upload_count') || '0', 10);
const appType      = sessionStorage.getItem('civicsync_app_type');

// Read the proceed button
const proceedBtn   = document.getElementById('btn-proceed-bookings');
const successMsg   = document.querySelector('.success-message');
const statusItems  = document.querySelectorAll('.status-item');

// --- ANIMATE STATUS INDICATORS IN SEQUENCE ---
// Hide them first, then reveal one by one with a delay
statusItems.forEach(item => {
  item.style.opacity   = '0';
  item.style.transform = 'translateY(16px)';
  item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

if (successMsg) {
  successMsg.style.opacity   = '0';
  successMsg.style.transition = 'opacity 0.6s ease';
}

// Stagger the reveal after a short pause
window.addEventListener('load', () => {
  // Reveal status icons one by one
  statusItems.forEach((item, i) => {
    setTimeout(() => {
      item.style.opacity   = '1';
      item.style.transform = 'translateY(0)';
    }, 400 + i * 300);
  });

  // Reveal success message after all icons
  const msgDelay = 400 + statusItems.length * 300 + 200;
  setTimeout(() => {
    if (successMsg) successMsg.style.opacity = '1';
  }, msgDelay);

  // Show proceed button after everything
  setTimeout(() => {
    if (proceedBtn) {
      proceedBtn.style.opacity   = '1';
      proceedBtn.style.transform = 'translateY(0)';
    }
  }, msgDelay + 400);
});

// Start proceed button hidden
if (proceedBtn) {
  proceedBtn.style.opacity   = '0';
  proceedBtn.style.transform = 'translateY(10px)';
  proceedBtn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
}

// --- SHOW VERIFICATION SUMMARY if session data exists ---
const summarySection = document.querySelector('.verification-status-section');
if (summarySection && (appType || uploadCount > 0)) {
  const appLabels = {
    'first-id':       'First-time ID',
    'replace-id':     'ID Replacement',
    'new-passport':   'New Passport',
    'renew-passport': 'Passport Renewal',
    'birth-cert':     'Birth Certificate',
    'other':          'Other Application',
  };

  const summaryEl = document.createElement('div');
  summaryEl.style.cssText = `
    background: rgba(34,197,94,0.07);
    border: 1px solid rgba(34,197,94,0.25);
    border-radius: 14px;
    padding: 18px 24px;
    margin: 0 auto 32px;
    max-width: 480px;
    font-size: 0.9rem;
    color: #cbd5e1;
    line-height: 2;
    text-align: left;
  `;
  summaryEl.innerHTML = `
    <div style="font-weight:700; color:#22c55e; margin-bottom:6px;">Upload summary</div>
    ${appType ? `<div>Application type: <strong style="color:white">${appLabels[appType] || appType}</strong></div>` : ''}
    ${uploadCount ? `<div>Documents uploaded: <strong style="color:white">${uploadCount}</strong></div>` : ''}
    <div>Status: <strong style="color:#22c55e;">All uploaded ✓</strong></div>
  `;
  summarySection.insertBefore(summaryEl, summarySection.querySelector('.status-indicators'));
}

// --- PROCEED BUTTON ---
if (proceedBtn) {
  // Remove the inline onclick and handle it here cleanly
  proceedBtn.removeAttribute('onclick');
  proceedBtn.addEventListener('click', () => {
    // Check docs were actually verified
    if (!isVerified) {
      showToast('Please complete the upload step first.', 'error');
      setTimeout(() => { window.location.href = 'upload.html'; }, 1500);
      return;
    }

    proceedBtn.disabled     = true;
    proceedBtn.textContent  = 'Taking you to booking...';
    showToast('Great! Let\'s book your appointment.', 'success');

    setTimeout(() => {
      window.location.href = 'booking.html';
    }, 1200);
  });
}

// --- INJECT SHARED STYLES ---
const style = document.createElement('style');
style.textContent = `
  .status-item {
    cursor: default;
  }
  #cs-toast {
    position: fixed; bottom: 30px; left: 50%;
    transform: translateX(-50%);
    padding: 13px 26px; border-radius: 12px;
    font-weight: 600; font-size: 0.92rem;
    z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    transition: opacity 0.4s ease; white-space: nowrap;
  }
`;
document.head.appendChild(style);

// --- TOAST ---
function showToast(message, type = 'success') {
  const existing = document.getElementById('cs-toast');
  if (existing) existing.remove();

  const colors = {
    success: { bg: '#38bdf8', color: '#0f172a' },
    error:   { bg: '#f87171', color: '#fff'    },
  };
  const { bg, color } = colors[type] || colors.success;

  const toast = document.createElement('div');
  toast.id = 'cs-toast';
  toast.textContent = message;
  toast.style.cssText = `background:${bg}; color:${color};`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
