// booking.js — CivicSync Booking Calendar

// --- CALENDAR ENGINE ---

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// Dates unavailable (fully booked) — key format: "YYYY-M-D"
const BOOKED_DATES = new Set([
  '2025-4-3', '2025-4-9', '2025-4-16', '2025-4-22',
]);

// Time slots booked per date — key: "YYYY-M-D", value: Set of booked times
const BOOKED_SLOTS = {
  '2025-4-7':  new Set(['10:00 AM']),
  '2025-4-14': new Set(['10:00 AM', '10:30 AM']),
};

let currentYear  = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-indexed
let selectedDate = null;
let selectedTime = null;

const monthYearEl   = document.querySelector('.calendar-month-year');
const datesGridEl   = document.querySelector('.calendar-dates-grid');
const daysHeaderEl  = document.querySelector('.calendar-days-header');
const prevBtn       = document.querySelector('[aria-label="Previous Month"]');
const nextBtn       = document.querySelector('[aria-label="Next Month"]');
const timeSlotsEl   = document.querySelector('.time-options');
const confirmBtn    = document.getElementById('btn-confirm-booking');
const bookingForm   = document.getElementById('booking-form');

// Build the calendar for a given month/year
function buildCalendar(year, month) {
  monthYearEl.textContent = `${MONTHS[month]} ${year}`;
  datesGridEl.innerHTML = '';

  const firstDay  = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today     = new Date();
  today.setHours(0,0,0,0);

  // Empty cells before the 1st
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('span');
    empty.classList.add('date', 'empty');
    datesGridEl.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const btn  = document.createElement('button');
    btn.type   = 'button';
    btn.classList.add('date');
    btn.textContent = d;

    const dateObj = new Date(year, month, d);
    const dateKey = `${year}-${month + 1}-${d}`;
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const isPast    = dateObj < today;
    const isBooked  = BOOKED_DATES.has(dateKey);

    if (isPast || isWeekend || isBooked) {
      btn.disabled = true;
      btn.style.opacity = '0.3';
      btn.style.cursor  = 'not-allowed';
      if (isBooked) btn.title = 'Fully booked';
    } else {
      btn.addEventListener('click', () => selectDate(year, month + 1, d, btn));
    }

    // Restore selection highlight if this date was already picked
    if (
      selectedDate &&
      selectedDate.year  === year &&
      selectedDate.month === month + 1 &&
      selectedDate.day   === d
    ) {
      btn.classList.add('selected');
    }

    datesGridEl.appendChild(btn);
  }
}

function selectDate(year, month, day, btn) {
  // Remove previous selection
  document.querySelectorAll('.date.selected').forEach(el => el.classList.remove('selected'));
  btn.classList.add('selected');

  selectedDate = { year, month, day };
  selectedTime = null;

  // Rebuild time slots for this date
  buildTimeSlots(`${year}-${month}-${day}`);
}

// --- TIME SLOTS ---

const ALL_SLOTS = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM'];

function buildTimeSlots(dateKey) {
  timeSlotsEl.innerHTML = '';
  const bookedForDay = BOOKED_SLOTS[dateKey] || new Set();

  ALL_SLOTS.forEach(time => {
    const isSlotBooked = bookedForDay.has(time);

    const wrapper = document.createElement('div');
    wrapper.classList.add('time-slot');

    const id    = 'slot-' + time.replace(/[: ]/g, '-');
    const radio = document.createElement('input');
    radio.type  = 'radio';
    radio.name  = 'timeSlot';
    radio.value = time;
    radio.id    = id;
    radio.classList.add('visually-hidden');
    if (isSlotBooked) radio.disabled = true;

    const label = document.createElement('label');
    label.htmlFor   = id;
    label.classList.add('time-slot-label');
    label.textContent = time;
    if (isSlotBooked) {
      label.style.opacity = '0.35';
      label.style.cursor  = 'not-allowed';
      label.title         = 'This slot is fully booked';
    } else {
      radio.addEventListener('change', () => {
        selectedTime = time;
        updateConfirmState();
      });
    }

    wrapper.appendChild(radio);
    wrapper.appendChild(label);
    timeSlotsEl.appendChild(wrapper);
  });
}

// --- NAVIGATION ---

prevBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  buildCalendar(currentYear, currentMonth);
});

nextBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  buildCalendar(currentYear, currentMonth);
});

// --- CONFIRM BUTTON STATE ---

function updateConfirmState() {
  const locationOk = document.getElementById('location').value !== '';
  const ready = selectedDate && selectedTime && locationOk;
  confirmBtn.disabled   = !ready;
  confirmBtn.style.opacity = ready ? '1' : '0.5';
  confirmBtn.style.cursor  = ready ? 'pointer' : 'not-allowed';
}

document.getElementById('location').addEventListener('change', updateConfirmState);

// Start with button disabled
confirmBtn.disabled = true;
confirmBtn.style.opacity = '0.5';
confirmBtn.style.cursor  = 'not-allowed';

// --- FORM SUBMISSION ---

bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const location = document.getElementById('location');
  const locationLabel = location.options[location.selectedIndex].text;

  if (!selectedDate || !selectedTime) {
    showToast('Please select a date and time slot before confirming.', 'error');
    return;
  }

  const bookingDetails = {
    location:  locationLabel,
    date:      `${selectedDate.day} ${MONTHS[selectedDate.month - 1]} ${selectedDate.year}`,
    time:      selectedTime,
    ref:       generateRef(),
    bookedAt:  new Date().toISOString(),
  };

  sessionStorage.setItem('civicsync_booking', JSON.stringify(bookingDetails));

  showToast(`Booking confirmed for ${bookingDetails.date} at ${bookingDetails.time}!`, 'success');

  // Redirect directly to the dashboard after booking
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1400);
});

// Generate a short reference number
function generateRef() {
  return 'CS-' + Math.random().toString(36).substring(2,7).toUpperCase();
}

// --- TOAST ---

function showToast(message, type = 'success') {
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
    white-space: nowrap;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// --- INIT ---
buildCalendar(currentYear, currentMonth);
buildTimeSlots(null);
