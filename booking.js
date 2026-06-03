// ─── EMAILJS CONFIGURATION ──────────────────────────────────────────────────────
const HOME_AFFAIRS_OFFICES = [
  // Gauteng
  { id: 'sandton',    name: 'Sandton Home Affairs',                address: 'Sandton City, Cnr Rivonia Rd & 5th St, Sandton',   lat: -26.1076, lng: 28.0567, province: 'Gauteng' },
  { id: 'randburg',   name: 'Randburg Home Affairs',               address: '120 Bram Fischer Dr, Ferndale, Randburg',          lat: -26.0936, lng: 27.9964, province: 'Gauteng' },
  { id: 'jhb-central',name: 'Johannesburg Central Home Affairs',   address: 'Harrison St, Johannesburg CBD',                    lat: -26.2041, lng: 28.0473, province: 'Gauteng' },
  { id: 'pretoria-cbd',name: 'Pretoria Main Home Affairs',         address: '270 Pretorius St, Pretoria CBD',                   lat: -25.7461, lng: 28.1881, province: 'Gauteng' },
  { id: 'soshanguve', name: 'Soshanguve Home Affairs',             address: 'Block H, Soshanguve, Pretoria',                    lat: -25.5221, lng: 28.0847, province: 'Gauteng' },
  { id: 'tembisa',    name: 'Tembisa Home Affairs',                address: 'Tembisa Shopping Centre, Tembisa',                 lat: -25.9988, lng: 28.2289, province: 'Gauteng' },
  { id: 'soweto',     name: 'Soweto Home Affairs',                 address: 'Jabulani Mall, Soweto',                            lat: -26.2648, lng: 27.8586, province: 'Gauteng' },
  { id: 'germiston',  name: 'Germiston Home Affairs',              address: '48 Joubert St, Germiston',                         lat: -26.2224, lng: 28.1668, province: 'Gauteng' },
  { id: 'centurion',  name: 'Centurion Home Affairs',              address: 'Centurion Mall, Centurion',                        lat: -25.8604, lng: 28.1887, province: 'Gauteng' },
  { id: 'roodepoort', name: 'Roodepoort Home Affairs',             address: '52 Ontdekkers Rd, Roodepoort',                     lat: -26.1625, lng: 27.8695, province: 'Gauteng' },
  // Western Cape
  { id: 'cpt-cbd',       name: 'Cape Town Civic Centre',           address: '12 Hertzog Blvd, Cape Town CBD',                   lat: -33.9258, lng: 18.4232, province: 'Western Cape' },
  { id: 'bellville',     name: 'Bellville Home Affairs',           address: 'Bellville Civic Centre, Bellville',                lat: -33.8997, lng: 18.6285, province: 'Western Cape' },
  { id: 'mitchells-plain',name: "Mitchell's Plain Home Affairs",   address: "Mitchell's Plain Town Centre",                     lat: -34.0417, lng: 18.6192, province: 'Western Cape' },
  { id: 'george',        name: 'George Home Affairs',              address: '79 Market St, George',                             lat: -33.9646, lng: 22.4609, province: 'Western Cape' },
  // KwaZulu-Natal
  { id: 'durban-cbd', name: 'Durban Central Home Affairs',         address: '69 Monty Naicker St, Durban CBD',                  lat: -29.8579, lng: 31.0219, province: 'KwaZulu-Natal' },
  { id: 'umlazi',     name: 'Umlazi Home Affairs',                 address: 'Umlazi Mega City, Umlazi',                         lat: -29.9755, lng: 30.8888, province: 'KwaZulu-Natal' },
  { id: 'pmb',        name: 'Pietermaritzburg Home Affairs',       address: '265 Church St, Pietermaritzburg',                  lat: -29.6006, lng: 30.3794, province: 'KwaZulu-Natal' },
  // Eastern Cape
  { id: 'pe-central',  name: 'Gqeberha (PE) Central Home Affairs', address: '157 Govan Mbeki Ave, Gqeberha',                    lat: -33.9608, lng: 25.6022, province: 'Eastern Cape' },
  { id: 'east-london', name: 'East London Home Affairs',           address: '3 St Lukes Rd, East London',                       lat: -32.9854, lng: 27.8961, province: 'Eastern Cape' },
  // Free State
  { id: 'bloem',       name: 'Bloemfontein Home Affairs',          address: 'Corner Charlotte Maxeke & St Andrews St, BFN',     lat: -29.1210, lng: 26.2071, province: 'Free State' },
  // Limpopo
  { id: 'polokwane',   name: 'Polokwane Home Affairs',             address: '25 Rabe St, Polokwane',                            lat: -23.9045, lng: 29.4689, province: 'Limpopo' },
  // Mpumalanga
  { id: 'nelspruit',   name: 'Mbombela (Nelspruit) Home Affairs',  address: '28 Bell St, Mbombela',                             lat: -25.4753, lng: 30.9694, province: 'Mpumalanga' },
  // North West
  { id: 'rustenburg',  name: 'Rustenburg Home Affairs',            address: '26 Fatima Bhayat St, Rustenburg',                  lat: -25.6675, lng: 27.2422, province: 'North West' },
  // Northern Cape
  { id: 'kimberley',   name: 'Kimberley Home Affairs',             address: 'Du Toitspan Rd, Kimberley',                        lat: -28.7282, lng: 24.7499, province: 'Northern Cape' },
];

let userLat = null;
let userLng = null;
let selectedOffice = null;
let map = null;
let markers = {};
let userMarker = null;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const BOOKED_DATES = new Set(['2025-4-3','2025-4-9','2025-4-16','2025-4-22']);
const BOOKED_SLOTS = { '2025-4-7': new Set(['10:00 AM']), '2025-4-14': new Set(['10:00 AM','10:30 AM']) };
const ALL_SLOTS = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM'];
let currentYear  = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;
let selectedTime = null;

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

function getOfficesWithDistance() {
  return HOME_AFFAIRS_OFFICES.map(o => ({
    ...o,
    distKm: (userLat !== null) ? haversineKm(userLat, userLng, o.lat, o.lng) : null,
  })).sort((a, b) => {
    if (a.distKm === null) return 0;
    return a.distKm - b.distKm;
  });
}

function initMap() {
  map = L.map('ha-map', { zoomControl: true }).setView([-28.5, 25.5], 5);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  const defaultIcon = L.divIcon({
    html: `<div class="map-marker-icon">🏛️</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });

  HOME_AFFAIRS_OFFICES.forEach(office => {
    const marker = L.marker([office.lat, office.lng], { icon: defaultIcon })
      .addTo(map)
      .bindPopup(`
        <div class="popup-content">
          <strong>${office.name}</strong><br>
          <small>${office.address}</small><br>
          <small style="color:#94a3b8">${office.province}</small>
        </div>
      `);
    marker.on('click', () => selectOfficeFromMap(office));
    markers[office.id] = marker;
  });

  renderOfficeList();
}

function renderOfficeList() {
  const offices = getOfficesWithDistance();
  const query = document.getElementById('office-search').value.toLowerCase();
  const filtered = query ? offices.filter(o =>
    o.name.toLowerCase().includes(query) || o.address.toLowerCase().includes(query) || o.province.toLowerCase().includes(query)
  ) : offices;

  const list = document.getElementById('office-list');
  list.innerHTML = '';

  if (filtered.length === 0) {
    list.innerHTML = '<div class="office-list-empty">No offices found</div>';
    return;
  }

  filtered.forEach((office, i) => {
    const item = document.createElement('div');
    item.className = 'office-list-item' + (selectedOffice?.id === office.id ? ' active' : '');
    item.dataset.id = office.id;

    const distHtml = office.distKm !== null ? `<span class="list-distance">${formatDistance(office.distKm)}</span>` : '';
    const nearestBadge = (i === 0 && office.distKm !== null && userLat !== null) ? `<span class="nearest-badge">Nearest</span>` : '';

    item.innerHTML = `
      <div class="list-item-header"><span class="list-item-name">${office.name}</span>${nearestBadge}</div>
      <div class="list-item-sub"><span class="list-item-province">${office.province}</span>${distHtml}</div>
    `;

    item.addEventListener('click', () => selectOfficeFromList(office));
    list.appendChild(item);
  });
}

function selectOfficeFromMap(office) { selectedOffice = office; showSelectedOfficeCard(office); renderOfficeList(); }
function selectOfficeFromList(office) {
  selectedOffice = office;
  map.setView([office.lat, office.lng], 13, { animate: true });
  markers[office.id].openPopup();
  showSelectedOfficeCard(office);
  renderOfficeList();
}

function showSelectedOfficeCard(office) {
  const card = document.getElementById('selected-office-card');
  card.classList.remove('hidden');
  document.getElementById('card-name').textContent = office.name;
  document.getElementById('card-address').textContent = office.address;
  const distEl = document.getElementById('card-distance');
  distEl.textContent = userLat !== null ? `📍 ${formatDistance(haversineKm(userLat, userLng, office.lat, office.lng))}` : '📍 Enable location for distance';
}

document.getElementById('btn-locate-me').addEventListener('click', () => {
  const btn = document.getElementById('btn-locate-me');
  btn.textContent = 'Locating...';
  btn.disabled = true;

  if (!navigator.geolocation) return showToast('Geolocation is not supported.', 'error');

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat = pos.coords.latitude; userLng = pos.coords.longitude;
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.circleMarker([userLat, userLng], { radius: 10, fillColor: '#38bdf8', color: '#fff', weight: 3, fillOpacity: 0.9 }).addTo(map).bindPopup('📍 You are here');
      map.setView([userLat, userLng], 11, { animate: true });
      const nearest = getOfficesWithDistance()[0];
      renderOfficeList();
      btn.disabled = false; btn.innerHTML = `✓ Location Found`; btn.style.color = '#22c55e';
      showToast(`Location found! Nearest: ${nearest.name}`, 'success');
    },
    (err) => { showToast('Could not get location.', 'error'); btn.disabled = false; btn.textContent = 'Use My Location'; },
    { timeout: 10000 }
  );
});

document.getElementById('office-search').addEventListener('input', renderOfficeList);

document.getElementById('btn-select-office').addEventListener('click', () => {
  if (!selectedOffice) return;
  document.getElementById('location').value = selectedOffice.id;
  const step2 = document.getElementById('booking-step2');
  step2.classList.remove('hidden');
  step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast(`✓ ${selectedOffice.name} selected`, 'success');
  buildCalendar(currentYear, currentMonth);
  buildTimeSlots(null);
});

function buildCalendar(year, month) {
  const monthYearEl  = document.querySelector('.calendar-month-year');
  const datesGridEl  = document.querySelector('.calendar-dates-grid');
  monthYearEl.textContent = `${MONTHS[month]} ${year}`;
  datesGridEl.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('span');
    empty.classList.add('date', 'empty');
    datesGridEl.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.classList.add('date'); btn.textContent = d;
    const dateObj = new Date(year, month, d);
    const dateKey = `${year}-${month + 1}-${d}`;
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const isPast    = dateObj < today;
    const isBooked  = BOOKED_DATES.has(dateKey);

    if (isPast || isWeekend || isBooked) {
      btn.disabled = true; btn.style.opacity = '0.3'; btn.style.cursor = 'not-allowed';
    } else {
      btn.addEventListener('click', () => selectDate(year, month + 1, d, btn));
    }

    if (selectedDate && selectedDate.year === year && selectedDate.month === month + 1 && selectedDate.day === d) {
      btn.classList.add('selected');
    }
    datesGridEl.appendChild(btn);
  }
}

function selectDate(year, month, day, btn) {
  document.querySelectorAll('.date.selected').forEach(el => el.classList.remove('selected'));
  btn.classList.add('selected');
  selectedDate = { year, month, day };
  selectedTime = null;
  buildTimeSlots(`${year}-${month}-${day}`);
}

function buildTimeSlots(dateKey) {
  const timeSlotsEl = document.querySelector('.time-options');
  timeSlotsEl.innerHTML = '';
  const bookedForDay = (dateKey && BOOKED_SLOTS[dateKey]) || new Set();

  ALL_SLOTS.forEach(time => {
    const isSlotBooked = bookedForDay.has(time);
    const wrapper = document.createElement('div');
    wrapper.classList.add('time-slot');

    const id = 'slot-' + time.replace(/[: ]/g, '-');
    const radio = document.createElement('input');
    radio.type = 'radio'; radio.name = 'timeSlot'; radio.value = time; radio.id = id; radio.classList.add('visually-hidden');
    if (isSlotBooked) radio.disabled = true;

    const label = document.createElement('label');
    label.htmlFor = id; label.classList.add('time-slot-label'); label.textContent = time;
    if (isSlotBooked) {
      label.style.opacity = '0.35'; label.style.cursor = 'not-allowed'; label.title = 'Fully booked';
    } else {
      radio.addEventListener('change', () => { selectedTime = time; updateConfirmState(); });
    }

    wrapper.appendChild(radio); wrapper.appendChild(label);
    timeSlotsEl.appendChild(wrapper);
  });
}

document.querySelector('[aria-label="Previous Month"]').addEventListener('click', () => {
  currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } buildCalendar(currentYear, currentMonth);
});
document.querySelector('[aria-label="Next Month"]').addEventListener('click', () => {
  currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } buildCalendar(currentYear, currentMonth);
});

function updateConfirmState() {
  const locationOk = document.getElementById('location').value !== '';
  const nameOk     = document.getElementById('booking-name').value.trim() !== '';
  const emailOk    = document.getElementById('booking-email').value.trim() !== '';
  const ready = selectedDate && selectedTime && locationOk && nameOk && emailOk;
  const btn = document.getElementById('btn-confirm-booking');
  btn.disabled = !ready;
  btn.style.opacity = ready ? '1' : '0.5';
  btn.style.cursor  = ready ? 'pointer' : 'not-allowed';
}

document.getElementById('booking-name').addEventListener('input', updateConfirmState);
document.getElementById('booking-email').addEventListener('input', updateConfirmState);

// ─── THE NEW FULL-STACK SUBMISSION LOGIC ──────────────────────────────────────
document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const userName  = document.getElementById('booking-name').value.trim();
  const userEmail = document.getElementById('booking-email').value.trim();

  if (!selectedDate || !selectedTime || !selectedOffice) return showToast('Please select a date and time slot.', 'error');
  if (!userName || !userEmail) return showToast('Please enter your name and email address.', 'error');

  const bookingDetails = {
    name:     userName,
    email:    userEmail,
    office:   selectedOffice.name,
    address:  selectedOffice.address,
    date:     `${selectedDate.day} ${MONTHS[selectedDate.month - 1]} ${selectedDate.year}`,
    time:     selectedTime,
    ref:      generateRef(),
    bookedAt: new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short' }),
    distKm:   (userLat !== null) ? haversineKm(userLat, userLng, selectedOffice.lat, selectedOffice.lng) : null,
  };

  const btn = document.getElementById('btn-confirm-booking');
  btn.disabled = true;
  btn.textContent = 'Saving Booking to Database…';

  try {
      // 1. SAVE TO SUPABASE VIA BACKEND
      const dbResponse = await fetch('http://localhost:3000/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              reference: bookingDetails.ref,
              citizen_name: bookingDetails.name,
              citizen_email: bookingDetails.email,
              office: bookingDetails.office,
              date: bookingDetails.date,
              time: bookingDetails.time
          })
      });

      if (!dbResponse.ok) throw new Error("Failed to save to database");

      // 2. GENERATE QR CODE AND SEND EMAIL
      btn.textContent = 'Sending Confirmation Email…';
      const qrDataURL = await generateQRDataURL(bookingDetails);
      
      showToast(`Booking saved! Sending confirmation to ${userEmail}…`, 'success');
      showConfirmationModal(bookingDetails, qrDataURL);
      await sendConfirmationEmail(bookingDetails, qrDataURL);

  } catch (error) {
      console.error(error);
      showToast('Error saving booking. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = 'Confirm Booking';
  }
});

function generateQRDataURL(d) {
  return new Promise((resolve, reject) => {
    const qrPayload = `CivicSync Booking\nRef: ${d.ref}\nName: ${d.name}\nOffice: ${d.office}\nDate: ${d.date}\nTime: ${d.time}`;
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;background:white;padding:8px;';
    document.body.appendChild(container);

    try {
      new QRCode(container, { text: qrPayload, width: 280, height: 280, colorDark: '#0f172a', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
      setTimeout(() => {
        const canvas = container.querySelector('canvas');
        if (canvas) resolve(canvas.toDataURL('image/png'));
        else reject(new Error('QR canvas not found'));
        document.body.removeChild(container);
      }, 400);
    } catch (err) {
      if (document.body.contains(container)) document.body.removeChild(container);
      reject(err);
    }
  });
}

async function sendConfirmationEmail(d, qrDataURL) {
  try {
      const response = await fetch('http://localhost:3000/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userEmail:    d.email,
              userName:     d.name,
              bookingRef:   d.ref,
              office:       d.office,
              address:      d.address,
              date:         d.date,
              time:         d.time,
              bookedAt:     d.bookedAt,
              mapsLink:     `https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(d.address)}`,
              qrCodeBase64: qrDataURL || '',
          })
      });

      if (response.ok) showToast(`✓ Confirmation email sent to ${d.email}`, 'success');
      else showToast('Email delivery failed — check your server.', 'error');
  } catch (err) {
      console.error('Email error:', err);
      showToast('Could not reach the server to send email.', 'error');
  }
}

function showConfirmationModal(d, qrDataURL) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(6px);padding:16px;`;
  overlay.innerHTML = `
    <div style="background:#1e293b;border:1px solid rgba(56,189,248,0.22);border-radius:24px;padding:36px 32px;max-width:460px;width:100%;text-align:center;color:white;box-shadow:0 24px 64px rgba(0,0,0,0.6);">
      <h2 style="color:#38bdf8;margin:0 0 6px;font-size:1.45rem;">Booking Confirmed!</h2>
      <p style="color:#94a3b8;margin:0 0 22px;font-size:0.88rem;">Reference: <strong style="color:#fbbf24;">${d.ref}</strong></p>
      <div style="background:white;padding:14px;border-radius:14px;display:inline-block;margin-bottom:20px;">
        <img src="${qrDataURL}" width="164" height="164" alt="QR Code" />
      </div>
      <button id="cs-modal-done-btn" style="background:#38bdf8;color:#0f172a;border:none;padding:13px 32px;border-radius:12px;font-weight:700;cursor:pointer;width:100%;">Done</button>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('cs-modal-done-btn').addEventListener('click', () => window.location.href = 'dashboard.html');
}

function generateRef() { return 'CS-' + Math.random().toString(36).substring(2, 7).toUpperCase(); }

function showToast(message, type = 'success') {
  const existing = document.getElementById('cs-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'cs-toast'; toast.textContent = message;
  toast.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:${type === 'success' ? '#38bdf8' : '#f87171'};color:${type === 'success' ? '#0f172a' : '#fff'};padding:14px 28px;border-radius:12px;font-weight:600;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.3);transition:opacity 0.4s ease;`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 4000);
}

initMap();