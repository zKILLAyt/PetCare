const WHATSAPP_NUMBER = '5511999999999'; // Substitua pelo número real da PetCare.
const STORAGE_KEY = 'petcare-agendamentos';

const services = [
  { id: 'banho', category: 'estetica', icon: '🛁', title: 'Banho completo', description: 'Higiene cuidadosa, secagem, escovação e finalização.', price: 55, duration: '60 min', featured: true },
  { id: 'tosa', category: 'estetica', icon: '✂️', title: 'Tosa personalizada', description: 'Tosa higiênica ou completa respeitando o estilo e bem-estar.', price: 70, duration: '75 min' },
  { id: 'consulta', category: 'saude', icon: '🩺', title: 'Consulta veterinária', description: 'Avaliação clínica atenciosa e orientações para cada fase da vida.', price: 120, duration: '45 min', featured: true },
  { id: 'vacina', category: 'saude', icon: '💉', title: 'Vacinação', description: 'Proteção com aplicação segura e atualização da carteirinha.', price: 85, duration: '30 min' },
  { id: 'hotel', category: 'bem-estar', icon: '🏡', title: 'Hotel Pet', description: 'Hospedagem monitorada, confortável e cheia de atividades.', price: 95, duration: 'Diária' },
  { id: 'daycare', category: 'bem-estar', icon: '🎾', title: 'Day care', description: 'Um dia de brincadeiras, socialização e supervisão constante.', price: 65, duration: '8 horas' }
];

const times = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30', '18:00'];
const state = { step: 1, serviceId: '', time: '' };

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function renderServices(filter = 'todos') {
  const grid = $('#service-grid');
  const filtered = filter === 'todos' ? services : services.filter(service => service.category === filter);
  grid.innerHTML = filtered.map(service => `
    <article class="service-card reveal visible" data-category="${service.category}">
      <div class="service-top"><span class="service-icon">${service.icon}</span>${service.featured ? '<span class="popular-tag">Mais escolhido</span>' : ''}</div>
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      <div class="service-meta"><span>A partir de <strong>${money(service.price)}</strong></span><small>◷ ${service.duration}</small></div>
      <button type="button" data-book-service="${service.id}">Agendar este serviço <span>→</span></button>
    </article>`).join('');
}

function renderBookingServices() {
  $('#booking-services').innerHTML = services.map(service => `
    <label class="booking-service ${state.serviceId === service.id ? 'selected' : ''}">
      <input type="radio" name="service" value="${service.id}" ${state.serviceId === service.id ? 'checked' : ''} required>
      <span class="service-icon">${service.icon}</span>
      <span><strong>${service.title}</strong><small>${service.duration}</small></span>
      <b>${money(service.price)}</b>
    </label>`).join('');
}

function renderTimes() {
  $('#time-grid').innerHTML = times.map(time => `<label class="time-option"><input type="radio" name="time" value="${time}" ${state.time === time ? 'checked' : ''} required><span>${time}</span></label>`).join('');
}

function openBooking(serviceId = '') {
  if (serviceId) state.serviceId = serviceId;
  state.step = serviceId ? 2 : 1;
  renderBookingServices();
  updateBookingStep();
  const dialog = $('#booking-dialog');
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('modal-open');
}

function closeBooking() {
  $('#booking-dialog').close();
  document.body.classList.remove('modal-open');
}

function updateBookingStep() {
  $$('.booking-step').forEach(step => step.classList.toggle('active', Number(step.dataset.step) === state.step));
  $$('[data-progress]').forEach(item => {
    const step = Number(item.dataset.progress);
    item.classList.toggle('active', step === state.step);
    item.classList.toggle('done', step < state.step);
  });
  $('#prev-step').hidden = state.step === 1;
  $('#next-step').hidden = state.step === 4;
  $('#confirm-booking').hidden = state.step !== 4;
  if (state.step === 4) renderSummary();
}

function validateStep() {
  const activeStep = $(`.booking-step[data-step="${state.step}"]`);
  const fields = $$('input, select, textarea', activeStep);
  let valid = true;

  fields.forEach(field => {
    const error = field.closest('label')?.querySelector('.field-error');
    if (error) error.textContent = '';
    if (!field.checkValidity()) {
      valid = false;
      if (error) error.textContent = field.validity.valueMissing ? 'Este campo é obrigatório.' : 'Confira este valor.';
    }
  });

  if (state.step === 1) {
    const selected = $('input[name="service"]:checked');
    if (!selected) { showToast('Escolha um serviço para continuar.'); return false; }
    state.serviceId = selected.value;
  }

  if (state.step === 3) {
    const selectedTime = $('input[name="time"]:checked');
    if (!selectedTime) { showToast('Escolha um horário disponível.'); return false; }
    state.time = selectedTime.value;
  }

  if (!valid) fields.find(field => !field.checkValidity())?.focus();
  return valid;
}

function getFormData() {
  return Object.fromEntries(new FormData($('#booking-form')).entries());
}

function renderSummary() {
  const data = getFormData();
  const service = services.find(item => item.id === state.serviceId);
  const date = new Date(`${data.date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  $('#booking-summary').innerHTML = `
    <div class="summary-highlight"><span class="service-icon">${service.icon}</span><div><small>Serviço</small><strong>${service.title}</strong><span>${service.duration}</span></div><b>${money(service.price)}</b></div>
    <dl>
      <div><dt>Responsável</dt><dd>${data.ownerName}</dd></div>
      <div><dt>Pet</dt><dd>${data.petName} · ${data.petType} · ${data.petSize}</dd></div>
      <div><dt>Quando</dt><dd>${date}, às ${state.time}</dd></div>
      ${data.notes ? `<div><dt>Observações</dt><dd>${data.notes}</dd></div>` : ''}
    </dl>`;
}

function saveBooking(booking) {
  const bookings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function buildWhatsAppMessage(booking) {
  return `Olá, PetCare! Gostaria de confirmar um agendamento.\n\n🐾 *Pet:* ${booking.petName} (${booking.petType}, porte ${booking.petSize})\n🛁 *Serviço:* ${booking.service.title}\n📅 *Data:* ${booking.date}\n⏰ *Horário:* ${booking.time}\n👤 *Responsável:* ${booking.ownerName}\n📱 *Telefone:* ${booking.phone}${booking.notes ? `\n📝 *Observações:* ${booking.notes}` : ''}\n\nValor estimado: ${money(booking.service.price)}`;
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function setupReveal() {
  if (!('IntersectionObserver' in window)) return $$('.reveal').forEach(item => item.classList.add('visible'));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  $$('.reveal').forEach(item => observer.observe(item));
}

renderServices();
renderBookingServices();
renderTimes();
setupReveal();
$('#current-year').textContent = new Date().getFullYear();

const today = new Date();
today.setDate(today.getDate() + 1);
$('#booking-date').min = today.toISOString().split('T')[0];

$$('[data-open-booking]').forEach(button => button.addEventListener('click', () => openBooking()));
$$('[data-close-booking]').forEach(button => button.addEventListener('click', closeBooking));

$('#service-grid').addEventListener('click', event => {
  const button = event.target.closest('[data-book-service]');
  if (button) openBooking(button.dataset.bookService);
});

$('.service-filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  $$('.filter-button').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', item === button); });
  renderServices(button.dataset.filter);
});

$('#booking-services').addEventListener('change', event => {
  if (event.target.name === 'service') { state.serviceId = event.target.value; renderBookingServices(); }
});

$('#time-grid').addEventListener('change', event => {
  if (event.target.name === 'time') state.time = event.target.value;
});

$('#next-step').addEventListener('click', () => {
  if (!validateStep()) return;
  state.step += 1;
  updateBookingStep();
});

$('#prev-step').addEventListener('click', () => { state.step -= 1; updateBookingStep(); });

$('#booking-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!validateStep()) { $('#form-status').textContent = 'Confirme os dados e aceite os termos para continuar.'; return; }
  const data = getFormData();
  const service = services.find(item => item.id === state.serviceId);
  const booking = { ...data, id: Date.now(), service, time: state.time, createdAt: new Date().toISOString() };
  saveBooking(booking);
  $('#form-status').textContent = 'Agendamento salvo! Abrindo a confirmação no WhatsApp…';
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(booking))}`;
  setTimeout(() => {
    window.open(url, '_blank', 'noopener');
    closeBooking();
    showToast('Agendamento salvo com sucesso!');
    $('#booking-form').reset();
    state.step = 1; state.serviceId = ''; state.time = '';
    renderBookingServices(); renderTimes(); updateBookingStep();
  }, 500);
});

const menuToggle = $('.menu-toggle');
menuToggle.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', open);
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});

$$('.nav-links a').forEach(link => link.addEventListener('click', () => {
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

$('#booking-dialog').addEventListener('click', event => {
  if (event.target === $('#booking-dialog')) closeBooking();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('#booking-dialog').open) closeBooking();
});
