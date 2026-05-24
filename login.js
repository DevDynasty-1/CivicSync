var supabaseUrl = 'https://aislfdgqbwtvgilkxavw.supabase.co';
var supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpc2xmZGdxYnd0dmdpbGt4YXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjkzNzYsImV4cCI6MjA5NDYwNTM3Nn0.trBKClg6Yrvcp6xKlwxLIpsxWiLAky7Gpe1PoQg4F6U';
var supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
// login.js — CivicSync Login Page

const form      = document.getElementById('login-form');
const emailInput= document.getElementById('email');
const pwInput   = document.getElementById('password');
const loginBtn  = document.getElementById('btn-login');

// --- INJECT error elements ---
function addErrorEl(input) {
  const el = document.createElement('span');
  el.classList.add('field-error');
  el.setAttribute('aria-live', 'polite');
  input.parentElement.appendChild(el);
  return el;
}

const emailError = addErrorEl(emailInput);
const pwError    = addErrorEl(pwInput);

// --- FIELD VALIDATORS ---
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

function validatePassword() {
  const val = pwInput.value;
  if (!val) {
    setError(pwInput, pwError, 'Password is required.');
    return false;
  }
  if (val.length < 6) {
    setError(pwInput, pwError, 'Password must be at least 6 characters.');
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

function setValid(input, errorEl) {
  input.classList.remove('invalid');
  input.classList.add('valid');
  errorEl.textContent = '';
}

// Live validation on blur
emailInput.addEventListener('blur', validateEmail);
pwInput.addEventListener('blur',   validatePassword);

// Clear error on re-type
emailInput.addEventListener('input', () => {
  if (emailInput.classList.contains('invalid')) validateEmail();
});
pwInput.addEventListener('input', () => {
  if (pwInput.classList.contains('invalid')) validatePassword();
});

// --- FORM SUBMIT ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const ok = [validateEmail(), validatePassword()].every(Boolean);
  if (!ok) return;

  // Loading state
  loginBtn.disabled   = true;
  loginBtn.innerHTML  = '<span class="btn-spinner"></span> Signing in...';

  // REAL SUPABASE API CALL
  const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: pwInput.value,
  });

  if (error) {
    loginBtn.disabled  = false;
    loginBtn.textContent = 'Log In';

    // Shake both fields to indicate wrong credentials
    [emailInput, pwInput].forEach(input => {
      setError(input, input === emailInput ? emailError : pwError, '');
      input.classList.add('invalid');
    });
    emailError.textContent = '';
    pwError.textContent    = error.message; // Shows actual Supabase error

    showToast('Login failed. Check your credentials.', 'error');
    return;
  }

  // Check role and persist session
  const userRole = data.user.user_metadata.role;
  const userName = data.user.user_metadata.full_name || 'User';
  
  sessionStorage.setItem('civicsync_user', JSON.stringify({ name: userName, role: userRole }));
  showToast(`Welcome back, ${userName}!`, 'success');

  setTimeout(() => {
    const redirect = sessionStorage.getItem('civicsync_redirect') || 'application.html';
    sessionStorage.removeItem('civicsync_redirect');
    window.location.href = redirect;
  }, 1200);
});



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
