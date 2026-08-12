/**
 * Pinecrest Haven Villa - Direct Booking & Rental Showcase Application Script
 */

// Global State
const state = {
  theme: localStorage.getItem('theme') || 'light',
  checkIn: null,
  checkOut: null,
  guests: 4,
  basePrice: 260,
  cleaningFee: 150,
  discountPercent: 0,
  discountCode: '',
  currentMonthOffset: 0,
  
  // Simulated Booked Dates (representing Airbnb iCal Sync)
  bookedDates: [
    '2026-08-15', '2026-08-16', '2026-08-17', '2026-08-18',
    '2026-08-28', '2026-08-29', '2026-08-30',
    '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07',
    '2026-09-18', '2026-09-19', '2026-09-20'
  ],

  // Gallery Photos
  gallery: [
    { id: 1, category: 'living', src: 'images/living.jpg', title: 'Mountain View Living Room', desc: 'Plush seating, stone fireplace & floor-to-ceiling panoramic glass windows.' },
    { id: 2, category: 'bedrooms', src: 'images/bedroom.jpg', title: 'Master Bedroom Suite', desc: 'King bed, organic cotton linens, sunset mountain view & private deck.' },
    { id: 3, category: 'kitchen', src: 'images/kitchen.jpg', title: 'Gourmet Chef Kitchen', desc: 'Waterfall marble island, professional La Marzocco espresso station & wine fridge.' },
    { id: 4, category: 'outdoor', src: 'images/patio.jpg', title: 'Sunset Outdoor Patio', desc: 'Heated fire pit lounge, alfresco dining table & string ambient lighting.' },
    { id: 5, category: 'outdoor', src: 'images/hero.jpg', title: 'Villa Exterior & Infinity Pool', desc: 'Modern architecture surrounded by serene mountain pine forests.' },
    { id: 6, category: 'nearby', src: 'images/attraction.jpg', title: 'Emerald Bay Beach & Trail', desc: 'Just 0.4 miles away — pristine swimming bay and scenic coastal hiking trail.' }
  ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeaderScroll();
  renderGallery('all');
  renderCalendar();
  initBookingCalculator();
  initAttractions();
  initLightbox();
});

// Theme Management
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.innerHTML = state.theme === 'dark' ? '☀️' : '🌙';
    toggleBtn.addEventListener('click', () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', state.theme);
      localStorage.setItem('theme', state.theme);
      toggleBtn.innerHTML = state.theme === 'dark' ? '☀️' : '🌙';
    });
  }
}

// Header Blur Effect on Scroll
function initHeaderScroll() {
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Photo Gallery Rendering & Filtering
function renderGallery(filter) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  
  const filtered = filter === 'all' 
    ? state.gallery 
    : state.gallery.filter(item => item.category === filter);
    
  grid.innerHTML = filtered.map(item => `
    <div class="gallery-item" onclick="openLightbox('${item.src}', '${item.title}', '${item.desc}')">
      <img src="${item.src}" alt="${item.title}" loading="lazy" />
      <div class="gallery-overlay">
        <div class="gallery-caption">
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
        </div>
      </div>
    </div>
  `).join('');
}

function filterGallery(category, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGallery(category);
}

// Lightbox Modal Handler
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const closeBtn = document.getElementById('lightboxClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

function openLightbox(src, title, desc) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  if (modal && img) {
    img.src = src;
    caption.innerHTML = `<h3>${title}</h3><p>${desc}</p>`;
    modal.classList.add('active');
  }
}

// Interactive Airbnb iCal Calendar Sync & Availability Engine
function renderCalendar() {
  const calendarEl = document.getElementById('calendarDays');
  const monthTitleEl = document.getElementById('calendarMonthTitle');
  if (!calendarEl) return;

  const baseDate = new Date(); // Aug 2026
  baseDate.setMonth(baseDate.getMonth() + state.currentMonthOffset);
  
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  
  const monthNames = ["August 2026", "September 2026", "October 2026", "November 2026"];
  monthTitleEl.innerText = `${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(baseDate)}`;

  // First day of month & total days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  let daysHTML = '';

  // Blank slots before first day
  for (let i = 0; i < firstDayIndex; i++) {
    daysHTML += `<div class="cal-day empty"></div>`;
  }

  // Render Days
  for (let day = 1; day <= totalDays; day++) {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const isBooked = state.bookedDates.includes(dateStr);
    const isCheckIn = state.checkIn === dateStr;
    const isCheckOut = state.checkOut === dateStr;
    const isInRange = state.checkIn && state.checkOut && dateStr > state.checkIn && dateStr < state.checkOut;

    let classNames = 'cal-day';
    if (isBooked) {
      classNames += ' booked';
    } else {
      classNames += ' available';
    }

    if (isCheckIn || isCheckOut) classNames += ' selected';
    if (isInRange) classNames += ' selected-range';

    daysHTML += `
      <div class="${classNames}" onclick="selectCalendarDate('${dateStr}', ${isBooked})">
        ${day}
      </div>
    `;
  }

  calendarEl.innerHTML = daysHTML;
}

function changeMonth(direction) {
  state.currentMonthOffset += direction;
  if (state.currentMonthOffset < 0) state.currentMonthOffset = 0;
  if (state.currentMonthOffset > 3) state.currentMonthOffset = 3;
  renderCalendar();
}

function selectCalendarDate(dateStr, isBooked) {
  if (isBooked) {
    alert(`This date (${dateStr}) is already reserved via Airbnb sync. Please choose open dates.`);
    return;
  }

  if (!state.checkIn || (state.checkIn && state.checkOut)) {
    state.checkIn = dateStr;
    state.checkOut = null;
    document.getElementById('inputCheckIn').value = dateStr;
    document.getElementById('inputCheckOut').value = '';
  } else if (state.checkIn && !state.checkOut) {
    if (dateStr <= state.checkIn) {
      state.checkIn = dateStr;
      document.getElementById('inputCheckIn').value = dateStr;
    } else {
      // Verify no booked dates in range
      const hasBookedInRange = state.bookedDates.some(b => b > state.checkIn && b < dateStr);
      if (hasBookedInRange) {
        alert('Your selected range includes dates already booked on Airbnb. Please choose an available window.');
        return;
      }
      state.checkOut = dateStr;
      document.getElementById('inputCheckOut').value = dateStr;
    }
  }
  
  renderCalendar();
  calculateBookingTotal();
}

// Booking Calculator Engine
function initBookingCalculator() {
  const checkInInput = document.getElementById('inputCheckIn');
  const checkOutInput = document.getElementById('inputCheckOut');
  const guestsInput = document.getElementById('inputGuests');

  if (checkInInput) {
    checkInInput.addEventListener('change', (e) => {
      state.checkIn = e.target.value;
      renderCalendar();
      calculateBookingTotal();
    });
  }

  if (checkOutInput) {
    checkOutInput.addEventListener('change', (e) => {
      state.checkOut = e.target.value;
      renderCalendar();
      calculateBookingTotal();
    });
  }

  if (guestsInput) {
    guestsInput.addEventListener('change', (e) => {
      state.guests = parseInt(e.target.value, 10);
      calculateBookingTotal();
    });
  }

  calculateBookingTotal();
}

function applyPromoCode() {
  const input = document.getElementById('promoInput');
  const message = document.getElementById('promoMessage');
  const code = input.value.trim().toUpperCase();

  if (code === 'FAMILY2026' || code === 'FAMILY') {
    state.discountPercent = 15;
    state.discountCode = code;
    message.style.color = '#10b981';
    message.innerText = '✓ Family Discount Applied: 15% OFF!';
  } else if (code === 'FRIENDS10' || code === 'FRIENDS') {
    state.discountPercent = 10;
    state.discountCode = code;
    message.style.color = '#10b981';
    message.innerText = '✓ Friends Discount Applied: 10% OFF!';
  } else if (code === 'REPEATGUEST') {
    state.discountPercent = 12;
    state.discountCode = code;
    message.style.color = '#10b981';
    message.innerText = '✓ Repeat Guest Discount: 12% OFF!';
  } else {
    state.discountPercent = 0;
    state.discountCode = '';
    message.style.color = '#ef4444';
    message.innerText = 'Invalid discount code. Try FAMILY2026 or FRIENDS10';
  }

  calculateBookingTotal();
}

function calculateBookingTotal() {
  const nightsCountEl = document.getElementById('nightsCount');
  const baseTotalEl = document.getElementById('baseTotal');
  const discountRow = document.getElementById('discountRow');
  const discountAmountEl = document.getElementById('discountAmount');
  const airbnbSavingsEl = document.getElementById('airbnbSavings');
  const grandTotalEl = document.getElementById('grandTotal');

  if (!state.checkIn || !state.checkOut) {
    if (nightsCountEl) nightsCountEl.innerText = '0 nights';
    if (baseTotalEl) baseTotalEl.innerText = '$0';
    if (grandTotalEl) grandTotalEl.innerText = '$0';
    if (airbnbSavingsEl) airbnbSavingsEl.innerText = 'Save ~$0 in Airbnb guest fees!';
    return;
  }

  const d1 = new Date(state.checkIn);
  const d2 = new Date(state.checkOut);
  const diffTime = Math.abs(d2 - d1);
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (nights <= 0) return;

  const baseTotal = nights * state.basePrice;
  const discountAmount = Math.round(baseTotal * (state.discountPercent / 100));
  const cleaningFee = state.cleaningFee;
  const grandTotal = (baseTotal - discountAmount) + cleaningFee;
  
  // Calculate how much guest saves vs Airbnb (Airbnb adds ~14% service fee to total)
  const airbnbEstimatedFee = Math.round((baseTotal + cleaningFee) * 0.14);

  if (nightsCountEl) nightsCountEl.innerText = `${nights} night${nights > 1 ? 's' : ''} × $${state.basePrice}`;
  if (baseTotalEl) baseTotalEl.innerText = `$${baseTotal}`;
  
  if (discountRow) {
    if (state.discountPercent > 0) {
      discountRow.style.display = 'flex';
      discountAmountEl.innerText = `-$${discountAmount} (${state.discountPercent}%)`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (grandTotalEl) grandTotalEl.innerText = `$${grandTotal}`;
  if (airbnbSavingsEl) airbnbSavingsEl.innerText = `🎉 You save ~$${airbnbEstimatedFee + discountAmount} by booking direct!`;
}

// Booking Request Handler
function handleBookingSubmit(e) {
  e.preventDefault();
  
  if (!state.checkIn || !state.checkOut) {
    alert('Please select your Check-in and Check-out dates first.');
    return;
  }

  const name = document.getElementById('guestName').value;
  const email = document.getElementById('guestEmail').value;
  const phone = document.getElementById('guestPhone').value;
  const notes = document.getElementById('guestNotes').value;

  const d1 = new Date(state.checkIn);
  const d2 = new Date(state.checkOut);
  const nights = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
  const baseTotal = nights * state.basePrice;
  const discountAmount = Math.round(baseTotal * (state.discountPercent / 100));
  const total = (baseTotal - discountAmount) + state.cleaningFee;

  // Open Direct Inquiry Confirmation Modal
  const modal = document.getElementById('confirmationModal');
  const details = document.getElementById('inquiryDetails');

  const textMessage = `Hello Pinecrest Haven! I'd like to book a direct stay:
Dates: ${state.checkIn} to ${state.checkOut} (${nights} nights)
Guests: ${state.guests}
Name: ${name}
Email: ${email}
Phone: ${phone}
Promo Code: ${state.discountCode || 'None'}
Est. Total: $${total}
Notes: ${notes}`;

  details.innerHTML = `
    <div style="text-align: left; background: var(--bg-secondary); padding: 1.25rem; border-radius: 12px; margin: 1rem 0;">
      <p><strong>Guest Name:</strong> ${name}</p>
      <p><strong>Dates:</strong> ${state.checkIn} to ${state.checkOut} (${nights} nights)</p>
      <p><strong>Guests:</strong> ${state.guests} Guests</p>
      <p><strong>Calculated Total:</strong> $${total} USD</p>
    </div>
    <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
      <a href="https://wa.me/15550192837?text=${encodeURIComponent(textMessage)}" target="_blank" class="whatsapp-btn">
        💬 Send via WhatsApp
      </a>
      <button onclick="closeConfirmationModal()" class="btn-secondary">Done</button>
    </div>
  `;

  modal.classList.add('active');
}

function closeConfirmationModal() {
  document.getElementById('confirmationModal').classList.remove('active');
}

// iCal Setup Modal Handler
function openICalGuideModal() {
  document.getElementById('icalGuideModal').classList.add('active');
}

function closeICalGuideModal() {
  document.getElementById('icalGuideModal').classList.remove('active');
}

// Client Proposal Modal Handler (Eric)
function openProposalModal() {
  const modal = document.getElementById('proposalModal');
  if (modal) modal.classList.add('active');
}

function closeProposalModal() {
  const modal = document.getElementById('proposalModal');
  if (modal) modal.classList.remove('active');
}

// Attractions Map Pin Interaction
function initAttractions() {
  // Can expand with interactive map pin toggles
}
