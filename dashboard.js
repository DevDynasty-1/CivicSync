const greetingEl = document.querySelector(".greeting");

if (greetingEl) {
    const hour = new Date().getHours();
    let greeting = "Good Morning";
    if (hour >= 12 && hour < 18) greeting = "Good Afternoon";
    if (hour >= 18) greeting = "Good Evening";
    greetingEl.textContent = `${greeting}, Thabo`;
}

const fixBtn = document.querySelector(".btn-alert-action");

if (fixBtn) {
    fixBtn.addEventListener("click", () => {
        window.location.href = "vault.html";
    });
}

const docItems = document.querySelectorAll(".doc-status-item");

function updateStats() {
    let verified = 0;
    let total = docItems.length;
    docItems.forEach(item => {
        const status = item.querySelector(".status-badge");
        if (status.classList.contains("badge-verified")) {
            verified++;
        }
    });
    const statValue = document.querySelector(".stat-card .stat-value");
    if (statValue) {
        statValue.textContent = `${verified} / ${total}`;
    }
}

updateStats();

const statusBadge = document.querySelector(".badge-progress");

function updateApplicationStatus() {
    let hasRejected = false;
    let allVerified = true;
    docItems.forEach(item => {
        const status = item.querySelector(".status-badge");
        if (status.classList.contains("badge-rejected")) {
            hasRejected = true;
        }
        if (!status.classList.contains("badge-verified")) {
            allVerified = false;
        }
    });
    if (statusBadge) {
        if (hasRejected) {
            statusBadge.textContent = "Action Required";
            statusBadge.classList.add("badge-warning");
        } else if (allVerified) {
            statusBadge.textContent = "Complete";
            statusBadge.classList.add("badge-success");
        } else {
            statusBadge.textContent = "In Progress";
        }
    }
}

updateApplicationStatus();

const bookingCard = document.querySelectorAll(".stat-card")[2];

function unlockBooking() {
    let allVerified = true;
    docItems.forEach(item => {
        const status = item.querySelector(".status-badge");
        if (!status.classList.contains("badge-verified")) {
            allVerified = false;
        }
    });
    if (bookingCard) {
        const bookingText = bookingCard.querySelector(".stat-value");
        if (allVerified) {
            bookingText.textContent = "Unlocked";
            bookingText.style.color = "green";
        } else {
            bookingText.textContent = "Locked";
            bookingText.style.color = "red";
        }
    }
}

unlockBooking();

docItems.forEach(item => {
    item.addEventListener("click", () => {
        window.location.href = "vault.html";
    });
});

document.querySelectorAll(".sidebar-nav a").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".sidebar-nav a").forEach(l => l.classList.remove("active"));
        link.classList.add("active");
    });
});

const cards = document.querySelectorAll(".stat-card");
cards.forEach((card, index) => {
    card.style.opacity = 0;
    card.style.transform = "translateY(20px)";
    setTimeout(() => {
        card.style.transition = "all 0.5s ease";
        card.style.opacity = 1;
        card.style.transform = "translateY(0)";
    }, index * 200);
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        const text = link.textContent.trim();
        if (text === "Contact" || href === "#contact") {
            e.preventDefault();
            window.location.href = "contact.html";
        } else if (text === "About" || href === "#about") {
            e.preventDefault();
            window.location.href = "about.html";
        }
    });
});