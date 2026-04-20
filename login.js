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

  // Simulate API call — replace with real fetch to your backend / Firebase
  const result = await fakeLogin(emailInput.value.trim(), pwInput.value);

  if (!result.success) {
    loginBtn.disabled  = false;
    loginBtn.textContent = 'Log In';

    // Shake both fields to indicate wrong credentials
    [emailInput, pwInput].forEach(input => {
      setError(input, input === emailInput ? emailError : pwError, '');
      input.classList.add('invalid');
    });
    emailError.textContent = '';
    pwError.textContent    = 'Incorrect email or password. Please try again.';

    showToast('Login failed. Check your credentials.', 'error');
    return;
  }

  // Persist session
  sessionStorage.setItem('civicsync_user', JSON.stringify(result.user));
  showToast(`Welcome back, ${result.user.name}!`, 'success');

  setTimeout(() => {
    // Redirect to dashboard or wherever the user was going
    const redirect = sessionStorage.getItem('civicsync_redirect') || 'application.html';
    sessionStorage.removeItem('civicsync_redirect');
    window.location.href = redirect;
  }, 1200);
});

// --- FAKE LOGIN (replace with real API call) ---
// To connect to backend: replace this with fetch('/api/login', { method:'POST', body: JSON.stringify({email, password}) })
async function fakeLogin(email, password) {
  await new Promise(resolve => setTimeout(resolve, 1400));

  // Demo: any valid-format email + password >= 6 chars succeeds
  // Remove this and use your real backend endpoint
  const name = email.split('@')[0].replace(/[._]/g, ' ');
  return {
    success: true,
    user: {
      name:  name.charAt(0).toUpperCase() + name.slice(1),
      email: email,
    }
  };
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
