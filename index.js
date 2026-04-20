const EventBus = {
    events: {},
    on(event, handler) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(handler);
    },
    emit(event, data) {
        (this.events[event] || []).forEach(handler => handler(data));
    }
};

const Store = {
    state: {
        bookings: JSON.parse(localStorage.getItem("bookings")) || [],
        messages: JSON.parse(localStorage.getItem("messages")) || []
    },
    get(key) {
        return this.state[key];
    },
    set(key, value) {
        this.state[key] = value;
        localStorage.setItem(key, JSON.stringify(value));
        EventBus.emit("state:change", { key, value });
    },
    push(key, item) {
        const updated = [...this.state[key], item];
        this.set(key, updated);
    }
};

const BookingService = {
    create(data) {
        const booking = { id: Date.now(), ...data, status: "pending" };
        Store.push("bookings", booking);
        EventBus.emit("booking:created", booking);
        return booking;
    },
    all() {
        return Store.get("bookings");
    }
};

const MessageService = {
    create(text) {
        const msg = { id: Date.now(), text, time: new Date().toISOString() };
        Store.push("messages", msg);
        EventBus.emit("message:new", msg);
        return msg;
    },
    all() {
        return Store.get("messages");
    }
};

function Component(selector, renderFn) {
    return {
        el: document.querySelector(selector),
        render(data) {
            if (!this.el) return;
            this.el.innerHTML = renderFn(data);
        }
    };
}

const Greeting = Component(".hero-title", () => {
    const hour = new Date().getHours();
    let greeting = "Welcome";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    return `${greeting}, DevDynasty.`;
});

const DashboardChart = {
    render() {
        const ctx = document.getElementById("chart");
        if (!ctx || typeof Chart === "undefined") return;
        const bookings = Store.get("bookings").slice(-7).map((_, i) => i + 2);
        const messages = Store.get("messages").slice(-7).map((_, i) => i + 1);
        new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
                datasets: [
                    { label: "Bookings", data: bookings, borderColor: "#3b82f6" },
                    { label: "Messages", data: messages, borderColor: "#10b981" }
                ]
            }
        });
    }
};

const UIController = {
    initNavigation() {
        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", e => {
                const href = link.getAttribute("href");
                const text = link.textContent.trim();
                
                if (text === "Contact Us" || href === "#contact") {
                    e.preventDefault();
                    window.location.href = "contact.html";
                } else if (text === "About" || href === "#about") {
                    e.preventDefault();
                    window.location.href = "about.html";
                } else if (text === "Home" || href === "#home") {
                    e.preventDefault();
                    const target = document.querySelector("#hero, #home");
                    if (target) target.scrollIntoView({ behavior: "smooth" });
                } else {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: "smooth" });
                    }
                }
            });
        });
    },
    initButtons() {
        document.getElementById("btn-get-started")?.addEventListener("click", () => {
            window.location.href = "booking.html";
        });
        document.getElementById("btn-learn-more")?.addEventListener("click", () => {
            window.location.href = "about.html";
        });
        
        const uploadCard = document.querySelector('.step-card:nth-child(1)');
        if (uploadCard) {
            uploadCard.style.cursor = 'pointer';
            uploadCard.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = "upload.html";
            });
        }
        
        const bookCard = document.querySelector('.step-card:nth-child(2)');
        if (bookCard) {
            bookCard.style.cursor = 'pointer';
            bookCard.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = "booking.html";
            });
        }
    },
    initAnimations() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add("show");
            });
        }, { threshold: 0.2 });
        document.querySelectorAll("section, .step-card").forEach(el => {
            el.classList.add("hidden");
            observer.observe(el);
        });
    }
};

EventBus.on("state:change", () => { DashboardChart.render(); });
EventBus.on("booking:created", () => { DashboardChart.render(); });
EventBus.on("message:new", () => { DashboardChart.render(); });

function initCivicSyncFramework() {
    UIController.initNavigation();
    UIController.initButtons();
    UIController.initAnimations();
    Greeting.render();
    DashboardChart.render();
}

window.addEventListener("DOMContentLoaded", initCivicSyncFramework);