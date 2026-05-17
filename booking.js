// booking.js — CivicSync Booking System with Home Affairs Map + Email Confirmation

// ─── EMAILJS CONFIGURATION ──────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
// 1. Go to https://www.emailjs.com and create a free account
// 2. Add an Email Service (Gmail, Outlook, etc.) → copy the Service ID
// 3. Create an Email Template using the HTML in EMAIL_TEMPLATE_GUIDE below → copy Template ID
// 4. Go to Account → API Keys → copy your Public Key
// 5. Replace the three values below with yours
const EMAILJS_PUBLIC_KEY  = 'S4pNjrFIhMHDLkLtQ';   // e.g. 'user_xxxxxxxxxxxx'
const EMAILJS_SERVICE_ID  = 'service_0cj9vtz';   // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'template_l330ucs';  // e.g. 'template_xyz789'

// EMAIL_TEMPLATE_GUIDE — paste this HTML into your EmailJS template body:
// Template variables used: {{to_name}}, {{to_email}}, {{ref}}, {{office}},
// {{address}}, {{date}}, {{time}}, {{booked_at}}, {{qr_image}}
// Subject line: "CivicSync Booking Confirmed – {{ref}}"

emailjs.init(EMAILJS_PUBLIC_KEY);

// ─── HOME AFFAIRS OFFICES (South Africa) ──────────────────────────────────────
const HOME_AFFAIRS_OFFICES = [
  // Gauteng
  { id: 'sandton',        name: 'Sandton Home Affairs',                 address: 'Sandton City, Cnr Rivonia Rd & 5th St, Sandton',            lat: -26.1076, lng: 28.0567, province: 'Gauteng' },
  { id: 'randburg',       name: 'Randburg Home Affairs',                address: '120 Bram Fischer Dr, Ferndale, Randburg',                    lat: -26.0936, lng: 27.9964, province: 'Gauteng' },
  { id: 'jhb-central',   name: 'Johannesburg Central Home Affairs',     address: 'Harrison St, Johannesburg CBD',                             lat: -26.2041, lng: 28.0473, province: 'Gauteng' },
  { id: 'pretoria-cbd',  name: 'Pretoria Main Home Affairs',            address: '270 Pretorius St, Pretoria CBD',                             lat: -25.7461, lng: 28.1881, province: 'Gauteng' },
  { id: 'soshanguve',    name: 'Soshanguve Home Affairs',               address: 'Block H, Soshanguve, Pretoria',                             lat: -25.5221, lng: 28.0847, province: 'Gauteng' },
  { id: 'tembisa',       name: 'Tembisa Home Affairs',                  address: 'Tembisa Shopping Centre, Tembisa',                          lat: -25.9988, lng: 28.2289, province: 'Gauteng' },
  { id: 'soweto',        name: 'Soweto Home Affairs',                   address: 'Jabulani Mall, Soweto',                                     lat: -26.2648, lng: 27.8586, province: 'Gauteng' },
  { id: 'germiston',     name: 'Germiston Home Affairs',                address: '48 Joubert St, Germiston',                                  lat: -26.2224, lng: 28.1668, province: 'Gauteng' },
  { id: 'centurion',     name: 'Centurion Home Affairs',                address: 'Centurion Mall, Centurion',                                 lat: -25.8604, lng: 28.1887, province: 'Gauteng' },
  { id: 'roodepoort',    name: 'Roodepoort Home Affairs',               address: '52 Ontdekkers Rd, Roodepoort',                              lat: -26.1625, lng: 27.8695, province: 'Gauteng' },
  // Western Cape
  { id: 'cpt-cbd',       name: 'Cape Town Civic Centre Home Affairs',   address: '12 Hertzog Blvd, Cape Town CBD',                            lat: -33.9258, lng: 18.4232, province: 'Western Cape' },
  { id: 'bellville',     name: 'Bellville Home Affairs',                address: 'Bellville Civic Centre, Bellville',                         lat: -33.8997, lng: 18.6285, province: 'Western Cape' },
  { id: 'mitchells-plain', name: "Mitchell's Plain Home Affairs",       address: "Mitchell's Plain Town Centre",                              lat: -34.0417, lng: 18.6192, province: 'Western Cape' },
  { id: 'george',        name: 'George Home Affairs',                   address: '79 Market St, George',                                     lat: -33.9646, lng: 22.4609, province: 'Western Cape' },
  // KwaZulu-Natal
  { id: 'durban-cbd',    name: 'Durban Central Home Affairs',           address: '69 Monty Naicker St, Durban CBD',                           lat: -29.8579, lng: 31.0219, province: 'KwaZulu-Natal' },
  { id: 'umlazi',        name: 'Umlazi Home Affairs',                   address: 'Umlazi Mega City, Umlazi',                                  lat: -29.9755, lng: 30.8888, province: 'KwaZulu-Natal' },
  { id: 'pmb',           name: 'Pietermaritzburg Home Affairs',         address: '265 Church St, Pietermaritzburg',                           lat: -29.6006, lng: 30.3794, province: 'KwaZulu-Natal' },
  // Eastern Cape
  { id: 'pe-central',   name: 'Gqeberha (PE) Central Home Affairs',    address: '157 Govan Mbeki Ave, Gqeberha',                             lat: -33.9608, lng: 25.6022, province: 'Eastern Cape' },
  { id: 'east-london',  name: 'East London Home Affairs',               address: '3 St Lukes Rd, East London',                                lat: -32.9854, lng: 27.8961, province: 'Eastern Cape' },
  // Free State
  { id: 'bloem',        name: 'Bloemfontein Home Affairs',              address: 'Corner Charlotte Maxeke & St Andrews St, Bloemfontein',     lat: -29.1210, lng: 26.2071, province: 'Free State' },
  // Limpopo
  { id: 'polokwane',    name: 'Polokwane Home Affairs',                 address: '25 Rabe St, Polokwane',                                     lat: -23.9045, lng: 29.4689, province: 'Limpopo' },
  // Mpumalanga
  { id: 'nelspruit',   name: 'Mbombela (Nelspruit) Home Affairs',       address: '28 Bell St, Mbombela',                                      lat: -25.4753, lng: 30.9694, province: 'Mpumalanga' },
  // North West
  { id: 'rustenburg',  name: 'Rustenburg Home Affairs',                 address: '26 Fatima Bhayat St, Rustenburg',                           lat: -25.6675, lng: 27.2422, province: 'North West' },
  // Northern Cape
  { id: 'kimberley',   name: 'Kimberley Home Affairs',                  address: 'Du Toitspan Rd, Kimberley',                                 lat: -28.7282, lng: 24.7499, province: 'Northern Cape' },
];

// ─── STATE ─────────────────────────────────────────────────────────────────────
let userLat = null;
let userLng = null;
let selectedOffice = null;
let map = null;
let markers = {};
let userMarker = null;
let filteredOffices = [...HOME_AFFAIRS_OFFICES];

// Calendar state
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const BOOKED_DATES = new Set(['2025-4-3','2025-4-9','2025-4-16','2025-4-22']);
const BOOKED_SLOTS = { '2025-4-7': new Set(['10:00 AM']), '2025-4-14': new Set(['10:00 AM','10:30 AM']) };
const ALL_SLOTS = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM'];
let currentYear  = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;
let selectedTime = null;

// ─── DISTANCE CALCULATION ───────────────────────────────────────────────────────
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

// ─── MAP INITIALIZATION ─────────────────────────────────────────────────────────
function initMap() {
  map = L.map('ha-map', { zoomControl: true }).setView([-28.5, 25.5], 5);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Custom marker icons
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

// ─── OFFICE LIST (SIDEBAR) ─────────────────────────────────────────────────────
function renderOfficeList() {
  const offices = getOfficesWithDistance();
  const query = document.getElementById('office-search').value.toLowerCase();
  const filtered = query ? offices.filter(o =>
    o.name.toLowerCase().includes(query) ||
    o.address.toLowerCase().includes(query) ||
    o.province.toLowerCase().includes(query)
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

    const distHtml = office.distKm !== null
      ? `<span class="list-distance">${formatDistance(office.distKm)}</span>`
      : '';
    const nearestBadge = (i === 0 && office.distKm !== null && userLat !== null)
      ? `<span class="nearest-badge">Nearest</span>`
      : '';

    item.innerHTML = `
      <div class="list-item-header">
        <span class="list-item-name">${office.name}</span>
        ${nearestBadge}
      </div>
      <div class="list-item-sub">
        <span class="list-item-province">${office.province}</span>
        ${distHtml}
      </div>
    `;

    item.addEventListener('click', () => selectOfficeFromList(office));
    list.appendChild(item);
  });
}

// ─── SELECT OFFICE ──────────────────────────────────────────────────────────────
function selectOfficeFromMap(office) {
  selectedOffice = office;
  showSelectedOfficeCard(office);
  renderOfficeList(); // update active state
}

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
  if (userLat !== null) {
    const km = haversineKm(userLat, userLng, office.lat, office.lng);
    distEl.textContent = `📍 ${formatDistance(km)}`;
  } else {
    distEl.textContent = '📍 Enable location for distance';
  }
}

// ─── GEOLOCATION ───────────────────────────────────────────────────────────────
document.getElementById('btn-locate-me').addEventListener('click', () => {
  const btn = document.getElementById('btn-locate-me');
  btn.textContent = 'Locating...';
  btn.disabled = true;

  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'error');
    btn.disabled = false;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg> Use My Location`;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;

      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.circleMarker([userLat, userLng], {
        radius: 10,
        fillColor: '#38bdf8',
        color: '#fff',
        weight: 3,
        fillOpacity: 0.9
      }).addTo(map).bindPopup('📍 You are here');

      map.setView([userLat, userLng], 11, { animate: true });

      // Sort and show nearest
      const nearest = getOfficesWithDistance()[0];
      renderOfficeList();

      btn.disabled = false;
      btn.innerHTML = `✓ Location Found`;
      btn.style.background = 'rgba(34,197,94,0.15)';
      btn.style.borderColor = '#22c55e';
      btn.style.color = '#22c55e';

      showToast(`Location found! Nearest office: ${nearest.name} (${formatDistance(nearest.distKm)})`, 'success');
    },
    (err) => {
      showToast('Could not get your location. Please allow location access.', 'error');
      btn.disabled = false;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg> Use My Location`;
    },
    { timeout: 10000 }
  );
});

// ─── SEARCH ─────────────────────────────────────────────────────────────────────
document.getElementById('office-search').addEventListener('input', renderOfficeList);

// ─── SELECT OFFICE BUTTON ───────────────────────────────────────────────────────
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

// ─── DIRECTIONS ─────────────────────────────────────────────────────────────────
document.getElementById('btn-get-directions').addEventListener('click', () => {
  if (!selectedOffice) return;
  openDirectionsModal(selectedOffice);
});

function openDirectionsModal(office) {
  const modal = document.getElementById('directions-modal');
  modal.classList.remove('hidden');

  document.getElementById('directions-to-name').textContent = office.name + ' — ' + office.address;

  const distNote = document.getElementById('directions-distance-note');
  if (userLat !== null) {
    const km = haversineKm(userLat, userLng, office.lat, office.lng);
    distNote.textContent = `Approx. ${formatDistance(km)} from your current location`;
  } else {
    distNote.textContent = 'Enable location for distance estimate';
  }

  const destQuery = encodeURIComponent(`${office.lat},${office.lng}`);
  const destName  = encodeURIComponent(office.name);

  const origin = (userLat !== null) ? `${userLat},${userLng}` : '';
  const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';

  document.getElementById('dir-google').href =
    `https://www.google.com/maps/dir/${origin ? encodeURIComponent(origin) + '/' : ''}${destQuery}`;

  document.getElementById('dir-waze').href =
    `https://waze.com/ul?ll=${office.lat},${office.lng}&navigate=yes`;

  document.getElementById('dir-apple').href =
    `https://maps.apple.com/?daddr=${destQuery}&q=${destName}`;
}

document.getElementById('close-directions').addEventListener('click', () => {
  document.getElementById('directions-modal').classList.add('hidden');
});

document.getElementById('directions-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('directions-modal')) {
    document.getElementById('directions-modal').classList.add('hidden');
  }
});

// ─── CALENDAR ───────────────────────────────────────────────────────────────────
function buildCalendar(year, month) {
  const monthYearEl  = document.querySelector('.calendar-month-year');
  const datesGridEl  = document.querySelector('.calendar-dates-grid');
  monthYearEl.textContent = `${MONTHS[month]} ${year}`;
  datesGridEl.innerHTML = '';

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date(); today.setHours(0,0,0,0);

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('span');
    empty.classList.add('date', 'empty');
    datesGridEl.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const btn = document.createElement('button');
    btn.type = 'button';
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
      btn.style.cursor = 'not-allowed';
      if (isBooked) btn.title = 'Fully booked';
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
    radio.type = 'radio'; radio.name = 'timeSlot'; radio.value = time;
    radio.id = id; radio.classList.add('visually-hidden');
    if (isSlotBooked) radio.disabled = true;

    const label = document.createElement('label');
    label.htmlFor = id; label.classList.add('time-slot-label');
    label.textContent = time;
    if (isSlotBooked) {
      label.style.opacity = '0.35'; label.style.cursor = 'not-allowed';
      label.title = 'Fully booked';
    } else {
      radio.addEventListener('change', () => { selectedTime = time; updateConfirmState(); });
    }

    wrapper.appendChild(radio); wrapper.appendChild(label);
    timeSlotsEl.appendChild(wrapper);
  });
}

document.querySelector('[aria-label="Previous Month"]').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  buildCalendar(currentYear, currentMonth);
});
document.querySelector('[aria-label="Next Month"]').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  buildCalendar(currentYear, currentMonth);
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

// Also update confirm state when name/email change
document.getElementById('booking-name').addEventListener('input', updateConfirmState);
document.getElementById('booking-email').addEventListener('input', updateConfirmState);

// ─── FORM SUBMISSION ────────────────────────────────────────────────────────────
document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const userName  = document.getElementById('booking-name').value.trim();
  const userEmail = document.getElementById('booking-email').value.trim();

  if (!selectedDate || !selectedTime || !selectedOffice) {
    showToast('Please select a date and time slot before confirming.', 'error');
    return;
  }
  if (!userName || !userEmail) {
    showToast('Please enter your name and email address.', 'error');
    return;
  }

  const bookingDetails = {
    name:     userName,
    email:    userEmail,
    office:   selectedOffice.name,
    address:  selectedOffice.address,
    lat:      selectedOffice.lat,
    lng:      selectedOffice.lng,
    date:     `${selectedDate.day} ${MONTHS[selectedDate.month - 1]} ${selectedDate.year}`,
    time:     selectedTime,
    ref:      generateRef(),
    bookedAt: new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short' }),
    distKm:   (userLat !== null) ? haversineKm(userLat, userLng, selectedOffice.lat, selectedOffice.lng) : null,
  };

  sessionStorage.setItem('civicsync_booking', JSON.stringify(bookingDetails));

  // Disable button while processing
  const btn = document.getElementById('btn-confirm-booking');
  btn.disabled = true;
  btn.textContent = 'Sending confirmation…';

  // Generate QR code as data URL, then show modal and send email
  generateQRDataURL(bookingDetails).then(async (qrDataURL) => {
    showToast(`Booking confirmed! Sending confirmation to ${userEmail}…`, 'success');
    showConfirmationModal(bookingDetails, qrDataURL);
    await sendConfirmationEmail(bookingDetails, qrDataURL);
  }).catch(() => {
    showToast('Booking confirmed! (Email could not be sent — check your EmailJS config)', 'error');
    showConfirmationModal(bookingDetails, null);
  });
});

// ─── QR CODE GENERATION ─────────────────────────────────────────────────────────
function generateQRDataURL(d) {
  return new Promise((resolve, reject) => {
    const qrPayload = [
      `CivicSync Booking`,
      `Ref: ${d.ref}`,
      `Name: ${d.name}`,
      `Office: ${d.office}`,
      `Address: ${d.address}`,
      `Date: ${d.date}`,
      `Time: ${d.time}`,
    ].join('\n');

    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;background:white;padding:8px;';
    document.body.appendChild(container);

    try {
      new QRCode(container, {
        text:         qrPayload,
        width:        280,
        height:       280,
        colorDark:    '#0f172a',
        colorLight:   '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });
      setTimeout(() => {
        const canvas = container.querySelector('canvas');
        if (canvas) {
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('QR canvas not found'));
        }
        document.body.removeChild(container);
      }, 400);
    } catch (err) {
      if (document.body.contains(container)) document.body.removeChild(container);
      reject(err);
    }
  });
}

// ─── SEND EMAIL VIA EMAILJS ──────────────────────────────────────────────────────
async function sendConfirmationEmail(d, qrDataURL) {
  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn('EmailJS not configured — skipping email send.');
    return;
  }
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_name:    d.name,
      to_email:   d.email,
      ref:        d.ref,
      office:     d.office,
      address:    d.address,
      date:       d.date,
      time:       d.time,
      booked_at:  d.bookedAt,
      qr_image:   qrDataURL || '',
      maps_link:  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.address)}`,
    });
    showToast(`✓ Confirmation email sent to ${d.email}`, 'success');
  } catch (err) {
    console.error('EmailJS error:', err);
    showToast('Booking saved! Email delivery failed — check your EmailJS configuration.', 'error');
  }
}

// ─── CONFIRMATION MODAL ─────────────────────────────────────────────────────────
function showConfirmationModal(d, qrDataURL) {
  const distLine = d.distKm !== null
    ? `<tr><td style="color:#94a3b8;padding:7px 0 7px;width:38%;">Distance</td><td style="font-weight:600;">${formatDistance(d.distKm)}</td></tr>`
    : '';

  const qrSection = qrDataURL
    ? `<div style="text-align:center;margin:24px 0 4px;">
         <p style="color:#64748b;font-size:0.75rem;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Scan at the office</p>
         <div style="display:inline-block;background:white;border-radius:14px;padding:14px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
           <img src="${qrDataURL}" width="164" height="164" alt="Booking QR Code" style="display:block;" />
         </div>
         <p style="color:#64748b;font-size:0.72rem;margin:10px 0 0;">Present this QR code when you arrive — staff will scan it at the counter</p>
       </div>`
    : `<p style="color:#f87171;font-size:0.82rem;text-align:center;margin:16px 0 0;">Configure EmailJS to enable QR codes</p>`;

  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(6px);padding:16px;`;
  overlay.innerHTML = `
    <div style="background:linear-gradient(160deg,#1e293b,#0f172a);border:1px solid rgba(56,189,248,0.22);border-radius:24px;padding:36px 32px;max-width:460px;width:100%;text-align:center;color:white;box-shadow:0 24px 64px rgba(0,0,0,0.6);max-height:92vh;overflow-y:auto;">
      <div style="width:56px;height:56px;background:rgba(56,189,248,0.12);border:2px solid rgba(56,189,248,0.35);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin:0 auto 18px;">✓</div>
      <h2 style="color:#38bdf8;margin:0 0 6px;font-size:1.45rem;">Booking Confirmed!</h2>
      <p style="color:#94a3b8;margin:0 0 22px;font-size:0.88rem;">Confirmation sent to <strong style="color:white;">${d.email}</strong></p>

      <table style="width:100%;border-collapse:collapse;text-align:left;font-size:0.87rem;">
        <tr style="border-bottom:1px solid rgba(255,255,255,0.07);">
          <td style="color:#94a3b8;padding:7px 0;width:38%;">Reference</td>
          <td><strong style="color:#fbbf24;font-size:1rem;letter-spacing:0.06em;">${d.ref}</strong></td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.07);">
          <td style="color:#94a3b8;padding:7px 0;">Name</td>
          <td style="font-weight:600;">${d.name}</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.07);">
          <td style="color:#94a3b8;padding:7px 0;">Office</td>
          <td style="font-weight:600;font-size:0.85rem;">${d.office}</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.07);">
          <td style="color:#94a3b8;padding:7px 0;">Address</td>
          <td style="font-size:0.8rem;color:#cbd5e1;">${d.address}</td>
        </tr>
        ${distLine}
        <tr style="border-bottom:1px solid rgba(255,255,255,0.07);">
          <td style="color:#94a3b8;padding:7px 0;">Date</td>
          <td style="font-weight:600;">${d.date}</td>
        </tr>
        <tr>
          <td style="color:#94a3b8;padding:7px 0;">Time</td>
          <td style="font-weight:600;">${d.time}</td>
        </tr>
      </table>

      ${qrSection}

      <p style="color:#475569;font-size:0.76rem;margin:20px 0 22px;line-height:1.6;">
        Bring this QR code (printed or on phone) + all required documents to your appointment. Arrive 10 minutes early.
      </p>
      <button id="cs-modal-done-btn" style="background:#38bdf8;color:#0f172a;border:none;padding:13px 32px;border-radius:12px;font-weight:700;font-size:0.95rem;cursor:pointer;width:100%;">Done</button>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('cs-modal-done-btn').addEventListener('click', () => overlay.remove());
}

// ─── HELPERS ────────────────────────────────────────────────────────────────────
function generateRef() {
  return 'CS-' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

function showToast(message, type = 'success') {
  const existing = document.getElementById('cs-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'cs-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
    background:${type === 'success' ? '#38bdf8' : '#f87171'};
    color:${type === 'success' ? '#0f172a' : '#fff'};
    padding:14px 28px;border-radius:12px;font-weight:600;font-size:0.95rem;
    z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.3);
    transition:opacity 0.4s ease;white-space:nowrap;max-width:90vw;text-align:center;
  `;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 4000);
}

// ─── INIT ────────────────────────────────────────────────────────────────────────
initMap();
