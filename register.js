// 1. Initialize Supabase (Using 'var' to prevent Live Server crashes)
var supabaseUrl = 'https://aislfdgqbwtvgilkxavw.supabase.co';
var supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpc2xmZGdxYnd0dmdpbGt4YXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjkzNzYsImV4cCI6MjA5NDYwNTM3Nn0.trBKClg6Yrvcp6xKlwxLIpsxWiLAky7Gpe1PoQg4F6U';
var supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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
function validateSAID(id) {
  if (!/^\d{13}$/.test(id)) return { valid: false, msg: 'ID number must be exactly 13 digits.' };

  const year  = parseInt(id.substring(0, 2), 10);
  const month = parseInt(id.substring(2, 4), 10);
  const day   = parseInt(id.substring(4, 6), 10);
  if (month < 1 || month > 12) return { valid: false, msg: 'ID number contains an invalid month.' };
  if (day   < 1 || day   > 31) return { valid: false, msg: 'ID number contains an invalid day.' };

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

  const fullYear = year >= 0 && year <= 25 ? 2000 + year : 1900 + year;
  const gender   = parseInt(id.substring(6, 10), 10) >= 5000 ? 'Male' : 'Female';
  return { valid: true, msg: `Valid SA ID — Born ${day}/${month}/${fullYear}, ${gender}` };
}

// --- FIELD VALIDATORS ---
function validateName() {
  const val = nameInput.value.trim();
  if (!val || val.length < 2) {
    setError(nameInput, nameError, 'Name must be at least 2 characters.');
    return false;
  }
  setValid(nameInput, nameError);
  return true;
}

function validateEmail() {
  const val = emailInput.value.trim();
  const re  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val || !re.test(val)) {
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
  if (!val || val.length < 8 || score < 2) {
    setError(pwInput, pwError, 'Password must be at least 8 chars with uppercase/numbers.');
    return false;
  }
  setValid(pwInput, pwError);
  return true;
}

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

nameInput.addEventListener('blur',  validateName);
emailInput.addEventListener('blur', validateEmail);
idInput.addEventListener('blur',    validateID);
pwInput.addEventListener('blur',    validatePassword);

// --- SUPABASE FORM SUBMIT ---
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // This stops the 405 error!

  const ok = [validateName(), validateEmail(), validateID(), validatePassword()].every(Boolean);
  if (!ok) return;

  submitBtn.disabled     = true;
  submitBtn.innerHTML    = '<span class="btn-spinner"></span> Creating account...';

  // Create user in Supabase
  const { data, error } = await supabase.auth.signUp({
      email: emailInput.value.trim(),
      password: pwInput.value,
      options: {
          data: { 
              role: 'user', 
              full_name: nameInput.value.trim(),
              id_number: idInput.value.trim()
          }
      }
  });

  if (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
      showToast(error.message, 'error');
      return;
  }

  // Save minimal session data for the dashboard
  sessionStorage.setItem('civicsync_user', JSON.stringify({
    name:  nameInput.value.trim(),
    email: emailInput.value.trim(),
    id:    idInput.value.trim(),
  }));

  showToast('Account created! Redirecting to your application...', 'success');

  setTimeout(() => {
    window.location.href = 'application.html';
  }, 1400);
});

googleBtn.addEventListener('click', () => {
  showToast('Google sign-up coming soon.', 'info');
});

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
  toast.style.cssText = `background:${bg}; color:${color}; position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); padding: 13px 26px; border-radius: 12px; font-weight: 600; z-index: 9999;`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}