const STORAGE_KEYS = {
    messages: "civicsync_messages",
    bookings: "civicsync_bookings",
    user: "civicsync_user"
};

function showToast(message, type = "error") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getUser() {
    let user = localStorage.getItem(STORAGE_KEYS.user);
    if (!user) {
        user = "Thabo";
        localStorage.setItem(STORAGE_KEYS.user, user);
    }
    return user;
}

function showInlineError(input, message) {
    const parent = input.parentElement;
    let error = parent.querySelector(".inline-error");
    if (!error) {
        error = document.createElement("small");
        error.className = "inline-error";
        parent.appendChild(error);
    }
    error.textContent = message;
    error.style.color = "red";
    error.style.fontSize = "12px";
    input.style.border = "2px solid red";
}

function removeInlineError(input) {
    const parent = input.parentElement;
    const error = parent.querySelector(".inline-error");
    if (error) error.remove();
    input.style.border = "";
}

function showStrengthMessage(input, strength, color) {
    const parent = input.parentElement;
    let msg = parent.querySelector(".strength-text");
    if (!msg) {
        msg = document.createElement("small");
        msg.className = "strength-text";
        parent.appendChild(msg);
    }
    msg.textContent = `Strength: ${strength}`;
    msg.style.color = color;
    msg.style.fontSize = "12px";
}

function removeStrengthMessage(input) {
    const parent = input.parentElement;
    const msg = parent.querySelector(".strength-text");
    if (msg) msg.remove();
}

function initDarkMode() {
    const toggleBtn = document.querySelector('#darkModeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => document.body.classList.toggle('dark-mode'));
    }
}

function initClock() {
    const clock = document.querySelector('#clock');
    if (!clock) return;
    function updateClock() {
        clock.textContent = new Date().toLocaleTimeString();
    }
    updateClock();
    setInterval(updateClock, 1000);
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function initBookingModule() {
    const bookingForm = document.querySelector('#bookingForm');
    if (!bookingForm) return;
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.querySelector('#name').value.trim();
        const date = document.querySelector('#date').value;
        const service = document.querySelector('#service').value;
        if (!name || !date || !service) {
            showToast('Please fill all fields');
            return;
        }
        const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings)) || [];
        bookings.push({ name, date, service, status: "Pending" });
        localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
        showToast('Booking Confirmed!', 'success');
        bookingForm.reset();
    });
}

function validateNameField(nameInput) {
    const value = nameInput.value.trim();
    if (value.length < 3) {
        showInlineError(nameInput, "Name must be at least 3 characters");
        return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
        showInlineError(nameInput, "Use letters only");
        return false;
    }
    removeInlineError(nameInput);
    nameInput.style.border = "2px solid green";
    return true;
}

function validateEmailField(emailInput) {
    const value = emailInput.value.trim();
    const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!isValidFormat && value.length > 0) {
        showInlineError(emailInput, "Enter a valid email address");
        emailInput.style.border = "2px solid red";
        return false;
    }
    removeInlineError(emailInput);
    updateEmailStrength(emailInput);
    return isValidFormat;
}

function updateEmailStrength(emailInput) {
    const value = emailInput.value.trim().toLowerCase();
    if (value.length === 0) {
        removeStrengthMessage(emailInput);
        emailInput.style.border = "";
        return;
    }
    const hasBasicFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const hasNumber = /\d/.test(value);
    const isCoza = value.endsWith(".co.za");
    let strength = "";
    let color = "";
    let isStrong = false;
    if (!hasBasicFormat) {
        strength = "Weak";
        color = "red";
    } else if (hasBasicFormat && !hasNumber && !isCoza) {
        strength = "Medium";
        color = "orange";
    } else if (hasBasicFormat && (isCoza || hasNumber)) {
        isStrong = true;
        color = "green";
    } else {
        strength = "Medium";
        color = "orange";
    }
    emailInput.style.border = `2px solid ${color}`;
    if (isStrong) {
        removeStrengthMessage(emailInput);
    } else {
        showStrengthMessage(emailInput, strength, color);
    }
}

function validateMessageField(messageInput) {
    const value = messageInput.value.trim();
    if (value.length === 0) {
        showInlineError(messageInput, "Message cannot be empty");
        return false;
    }
    removeInlineError(messageInput);
    messageInput.style.border = "2px solid green";
    return true;
}

function initMap() {
    const mapWrapper = document.querySelector('.map-wrapper');
    if (!mapWrapper) return;
    // Create iframe dynamically
    const iframe = document.createElement('iframe');
    iframe.className = 'map-iframe';
    iframe.setAttribute('src', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.856184268121!2d28.047296!3d-26.195246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e950c1b1e2c1d2b%3A0x2c1f8b2c1f8b2c1f!2s123%20Main%20St%2C%20Johannesburg%2C%202001!5e0!3m2!1sen!2sza!4v1617181920212!5m2!1sen!2sza');
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', '400');
    iframe.style.border = '0';
    iframe.style.borderRadius = '12px';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    mapWrapper.innerHTML = ''; 
    mapWrapper.appendChild(iframe);
}

function initContactModule() {
    const form = document.getElementById("contact-form");
    const nameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    
    if (!form) return;
    
    if (nameInput) {
        nameInput.addEventListener("input", () => validateNameField(nameInput));
    }
    if (emailInput) {
        emailInput.addEventListener("input", () => validateEmailField(emailInput));
    }
    if (messageInput) {
        messageInput.addEventListener("input", () => validateMessageField(messageInput));
    }
    
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const isNameValid = nameInput ? validateNameField(nameInput) : true;
        const isEmailValid = emailInput ? validateEmailField(emailInput) : true;
        const isMessageValid = messageInput ? validateMessageField(messageInput) : true;
        if (!isNameValid || !isEmailValid || !isMessageValid) {
            alert("Please fix the errors in the form");
            return;
        }
        const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.messages)) || [];
        messages.push({
            name: nameInput?.value,
            email: emailInput?.value,
            message: messageInput?.value
        });
        localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
        alert("Message Sent!");
        form.reset();
        if (nameInput) {
            removeInlineError(nameInput);
            nameInput.style.border = "";
        }
        if (emailInput) {
            removeInlineError(emailInput);
            removeStrengthMessage(emailInput);
            emailInput.style.border = "";
        }
        if (messageInput) {
            removeInlineError(messageInput);
            messageInput.style.border = "";
        }
    });
}

function loadDashboard() {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings)) || [];
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.messages)) || [];
    const greeting = document.querySelector('.greeting');
    if (greeting) {
        const hour = new Date().getHours();
        let text = "Good Morning";
        if (hour >= 12 && hour < 18) text = "Good Afternoon";
        if (hour >= 18) text = "Good Evening";
        greeting.textContent = `${text}, ${getUser()}`;
    }
    const bookingEl = document.querySelector('#totalBookings');
    const messageEl = document.querySelector('#totalMessages');
    if (bookingEl) bookingEl.textContent = bookings.length;
    if (messageEl) messageEl.textContent = messages.length;
    const latestMsg = document.querySelector('#latestMessage');
    if (latestMsg && messages.length > 0) {
        latestMsg.textContent = messages[messages.length - 1].message;
    }
    const progressBar = document.querySelector('#progressBar');
    if (progressBar) {
        const progress = bookings.length > 0 ? 100 : 25;
        progressBar.style.width = progress + "%";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initBookingModule();
    initContactModule();
    initDarkMode();
    initClock();
    initSmoothScroll();
    initMap();   
    loadDashboard();
});