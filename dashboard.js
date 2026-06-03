// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────
function getUploadedDocuments() {
    const uploadedJson = sessionStorage.getItem('civicsync_uploaded_files');
    if (!uploadedJson) return [];
    try {
        const arr = JSON.parse(uploadedJson);
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

// ─── GREETING & USER NAME ────────────────────────────────────────────────────
const greetingEl = document.querySelector(".greeting");
const greetingSubtitle = document.querySelector(".greeting-subtitle");

if (greetingEl) {
    const hour = new Date().getHours();
    let greeting = "Good Morning";
    if (hour >= 12 && hour < 18) greeting = "Good Afternoon";
    if (hour >= 18) greeting = "Good Evening";

    // 1. Grab the saved user data from the browser memory
    const userDataString = sessionStorage.getItem('civicsync_user');
    let userName = 'User'; // Fallback name just in case

    // 2. If we found data, extract the name
    if (userDataString) {
        const userData = JSON.parse(userDataString);
        // Split the full name by spaces and grab the first part (First Name)
        if (userData.name) {
            userName = userData.name.split(' ')[0]; 
        }
    }

    // 3. Update the screen
    greetingEl.textContent = `${greeting}, ${userName}`;
}

// Update subtitle with submission status
function updateGreetingSubtitle() {
    if (greetingSubtitle) {
        const uploadedDocs = getUploadedDocuments();
        const TOTAL_REQUIRED = 4;
        const remaining = TOTAL_REQUIRED - uploadedDocs.length;
        
        if (uploadedDocs.length === 0) {
            greetingSubtitle.textContent = `Start your application - ${TOTAL_REQUIRED} documents needed.`;
        } else if (uploadedDocs.length === TOTAL_REQUIRED) {
            greetingSubtitle.textContent = "All documents submitted! Your application is complete.";
        } else {
            greetingSubtitle.textContent = `You have submitted ${uploadedDocs.length}/${TOTAL_REQUIRED} documents. ${remaining} more to go.`;
        }
    }
}

updateGreetingSubtitle();

// ─── ALERT BANNER ACTION BUTTON ────────────────────────────────────────────────
const fixBtn = document.querySelector(".btn-alert-action");

if (fixBtn) {
    fixBtn.addEventListener("click", () => {
        window.location.href = "vault.html";
    });
}

// Update alert banner visibility based on uploads
function updateAlertBanner() {
    const alertBanner = document.querySelector(".alert-banner");
    const uploadedDocs = getUploadedDocuments();
    
    if (uploadedDocs.length === 0 && alertBanner) {
        // Hide alert if no documents submitted yet
        alertBanner.style.display = "none";
    } else if (alertBanner) {
        alertBanner.style.display = "block";
    }
}

updateAlertBanner();

// ─── POPULATE DOCUMENT LIST FROM UPLOADS ──────────────────────────────────
function populateDocumentList() {
    const docStatusList = document.querySelector(".doc-status-list");
    if (!docStatusList) return;
    
    const uploadedDocs = getUploadedDocuments();
    const TOTAL_REQUIRED = 4;
    
    // Clear existing items
    docStatusList.innerHTML = '';
    
    if (uploadedDocs.length === 0) {
        // Show empty state message
        const emptyItem = document.createElement('li');
        emptyItem.className = 'doc-status-item empty-state';
        emptyItem.innerHTML = `<p style="text-align: center; color: #999;">0/${TOTAL_REQUIRED} documents uploaded</p>`;
        docStatusList.appendChild(emptyItem);
        return;
    }
    
    // Render each uploaded document with status "Uploaded"
    uploadedDocs.forEach(doc => {
        const li = document.createElement('li');
        li.className = 'doc-status-item';
        li.innerHTML = `
            <span class="doc-name">${doc.name || 'Document'}</span>
            <span class="status-badge badge-verified">Uploaded</span>
        `;
        docStatusList.appendChild(li);
    });
}

populateDocumentList();

// ─── GET CURRENT DOC ITEMS ────────────────────────────────────────────────────
let docItems = document.querySelectorAll(".doc-status-item:not(.empty-state)");

function updateStats() {
    const uploadedDocs = getUploadedDocuments();
    const TOTAL_REQUIRED = 4;
    const verified = uploadedDocs.length;
    
    const statValues = document.querySelectorAll(".stat-card .stat-value");
    if (statValues.length > 0) {
        statValues[0].textContent = `${verified} / ${TOTAL_REQUIRED}`;
    }
}

updateStats();

// ─── UPDATE APPLICATION STATUS ────────────────────────────────────────────────
const statusBadge = document.querySelector(".badge-progress");

function updateApplicationStatus() {
    const uploadedDocs = getUploadedDocuments();
    const TOTAL_REQUIRED = 4;
    
    if (statusBadge) {
        if (uploadedDocs.length === 0) {
            statusBadge.textContent = "Not Started";
            statusBadge.classList.remove("badge-progress", "badge-warning", "badge-success");
            statusBadge.classList.add("badge-pending");
        } else if (uploadedDocs.length < TOTAL_REQUIRED) {
            statusBadge.textContent = "In Progress";
            statusBadge.classList.remove("badge-warning", "badge-success", "badge-pending");
            statusBadge.classList.add("badge-progress");
        } else if (uploadedDocs.length === TOTAL_REQUIRED) {
            statusBadge.textContent = "Complete";
            statusBadge.classList.remove("badge-progress", "badge-warning", "badge-pending");
            statusBadge.classList.add("badge-success");
        }
    }
}

updateApplicationStatus();

// ─── BOOKING LOCK/UNLOCK ────────────────────────────────────────────────────
const bookingCard = document.querySelectorAll(".stat-card")[2];

function unlockBooking() {
    const uploadedDocs = getUploadedDocuments();
    const TOTAL_REQUIRED = 4;
    const allVerified = uploadedDocs.length === TOTAL_REQUIRED;
    
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

// ─── DOCUMENT ITEM CLICK HANDLER ──────────────────────────────────────────────
function attachDocumentListeners() {
    const docItems = document.querySelectorAll(".doc-status-item:not(.empty-state)");
    docItems.forEach(item => {
        item.addEventListener("click", () => {
            window.location.href = "vault.html";
        });
    });
}

attachDocumentListeners();

// ─── SIDEBAR NAVIGATION ────────────────────────────────────────────────────
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