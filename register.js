// register.js — CivicSync Register Page

const form      = document.getElementById('register-form');
const nameInput = document.getElementById('fullName');
const emailInput= document.getElementById('email');
const idInput   = document.getElementById('idNumber');
const pwInput   = document.getElementById('password');
const submitBtn = document.getElementById('btn-create-account');
const googleBtn = document.getElementById('btn-google-signup');

// --- INJECT error message elements under each field ---
function addErrorEl(input) {
  const el = document.createElement('span');
  el.classList.add('field-error');
  el.setAttribute('aria-live', 'polite');
  input.parentElement.appendChild(el);
  return el;
}

const nameError  = addErrorEl(nameInput);
const emailError = addErrorEl(emailInput);
const idError    = addErrorEl(idInput);
const pwError    = addErrorEl(pwInput);

// --- PASSWORD STRENGTH METER ---
const strengthMeter = document.createElement('div');
strengthMeter.classList.add('strength-meter');
const strengthBar   = document.createElement('div');
strengthBar.classList.add('strength-meter-bar');
strengthMeter.appendChild(strengthBar);

const strengthLabel = document.createElement('div');
strengthLabel.classList.add('strength-label');

pwInput.parentElement.insertBefore(strengthMeter, pwError);
pwInput.parentElement.insertBefore(strengthLabel, pwError);

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)                      score++;
  if (/[A-Z]/.test(pw))                   score++;
  if (/[0-9]/.test(pw))                   score++;
  if (/[^A-Za-z0-9]/.test(pw))            score++;
  return score;
}

const strengthLevels = [
  { label: '',          color: 'transparent', width: '0%'   },
  { label: 'Weak',      color: '#f87171',     width: '25%'  },
  { label: 'Fair',      color: '#fbbf24',     width: '50%'  },
  { label: 'Good',      color: '#38bdf8',     width: '75%'  },
  { label: 'Strong',    color: '#4ade80',     width: '100%' },
];

pwInput.addEventListener('input', () => {
  const score = getStrength(pwInput.value);
  const level = strengthLevels[score];
  strengthBar.style.width      = level.width;
  strengthBar.style.background = level.color;
  strengthLabel.textContent    = pwInput.value ? `Password strength: ${level.label}` : '';
  strengthLabel.style.color    = level.color;
});

// --- SOUTH AFRICAN ID VALIDATION ---
// SA ID: 13 digits — YYMMDD SSSS C A Z
function validateSAID(id) {
  if (!/^\d{13}$/.test(id)) return { valid: false, msg: 'ID number must be exactly 13 digits.' };

  // Date portion
  const year  = parseInt(id.substring(0, 2), 10);
  const month = parseInt(id.substring(2, 4), 10);
  const day   = parseInt(id.substring(4, 6), 10);
  if (month < 1 || month > 12) return { valid: false, msg: 'ID number contains an invalid month.' };
  if (day   < 1 || day   > 31) return { valid: false, msg: 'ID number contains an invalid day.' };

  // Luhn checksum
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
  if (checkDigit !== parseInt(id[12], 10)) return { valid: false, msg: 'ID number is not valid. Please double-check.' };

  // Derive DOB and gender for feedback
  const fullYear = year >= 0 && year <= 25 ? 2000 + year : 1900 + year;
  const gender   = parseInt(id.substring(6, 10), 10) >= 5000 ? 'Male' : 'Female';
  return { valid: true, msg: `Valid SA ID — Born ${day}/${month}/${fullYear}, ${gender}` };
}

// --- FIELD VALIDATORS ---
function validateName() {
  const val = nameInput.value.trim();
  if (!val) {
    setError(nameInput, nameError, 'Full name is required.');
    return false;
  }
  if (val.length < 2) {
    setError(nameInput, nameError, 'Name must be at least 2 characters.');
    return false;
  }
  setValid(nameInput, nameError);
  return true;
}

function validateEmail() {
  const val = emailInput.value.trim();
  const re  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val) {
    setError(emailInput, emailError, 'Email address is required.');
    return false;
  }
  if (!re.test(val)) {
    setError(emailInput, emailError, 'Please enter a valid email address.');
    return false;
  }
  setValid(emailInput, emailError);
  return true;
}

function validateID() {
  const val    = idInput.value.trim();
  const result = validateSAID(val);
  if (!result.valid) {
    setError(idInput, idError, result.msg);
    return false;
  }
  setValid(idInput, idError, result.msg);
  return true;
}

function validatePassword() {
  const val   = pwInput.value;
  const score = getStrength(val);
  if (!val) {
    setError(pwInput, pwError, 'Password is required.');
    return false;
  }
  if (val.length < 8) {
    setError(pwInput, pwError, 'Password must be at least 8 characters.');
    return false;
  }
  if (score < 2) {
    setError(pwInput, pwError, 'Password is too weak. Add uppercase letters or numbers.');
    return false;
  }
  setValid(pwInput, pwError);
  return true;
}

// --- STATE HELPERS ---
function setError(input, errorEl, msg) {
  input.classList.remove('valid');
  input.classList.add('invalid');
  errorEl.textContent = msg;
}

function setValid(input, errorEl, msg = '') {
  input.classList.remove('invalid');
  input.classList.add('valid');
  errorEl.textContent = msg;
  errorEl.style.color = msg ? '#4ade80' : '';
}

// Live validation on blur
nameInput.addEventListener('blur',  validateName);
emailInput.addEventListener('blur', validateEmail);
idInput.addEventListener('blur',    validateID);
pwInput.addEventListener('blur',    validatePassword);

// --- FORM SUBMIT ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const ok = [validateName(), validateEmail(), validateID(), validatePassword()].every(Boolean);
  if (!ok) return;

  // Show loading state
  submitBtn.disabled     = true;
  submitBtn.innerHTML    = '<span class="btn-spinner"></span> Creating account...';

  // Simulate API call (replace with real fetch to your backend)
  await fakeApiCall(1500);

  // Save minimal session data
  sessionStorage.setItem('civicsync_user', JSON.stringify({
    name:  nameInput.value.trim(),
    email: emailInput.value.trim(),
    id:    idInput.value.trim(),
  }));

  showToast('Account created! Redirecting...', 'success');

  setTimeout(() => {
    window.location.href = 'application.html';
  }, 1400);
});

// --- GOOGLE SIGN-UP (placeholder) ---
googleBtn.addEventListener('click', () => {
  showToast('Google sign-up coming soon — connect Firebase Auth for this.', 'info');
});

// --- FAKE API (remove when backend is ready) ---
function fakeApiCall(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- TOAST ---
function showToast(message, type = 'success') {
  const existing = document.getElementById('cs-toast');
  if (existing) existing.remove();

  const colors = {
    success: { bg: '#38bdf8', color: '#0f172a' },
    error:   { bg: '#f87171', color: '#fff'    },
    info:    { bg: '#fbbf24', color: '#0f172a' },
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
