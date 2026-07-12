// ============================================
// Solra Labs — landing page interactions
// ============================================

document.getElementById('year').textContent = new Date().getFullYear();

// --- Mobile nav toggle ---
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');
navBurger.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  navBurger.setAttribute('aria-expanded', String(isOpen));
});
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
    navBurger.setAttribute('aria-expanded', 'false');
  });
});

// --- Scroll reveal ---
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// ============================================
// Contact form
// ============================================
// IMPORTANT: This form never talks to Gmail directly and never holds any
// credentials. It only POSTs to our own backend endpoint (/api/contact),
// which is the only place the Gmail app password / username exist
// (stored server-side in environment variables — see /server).
// ============================================

const CONTACT_API_ENDPOINT = '/api/contact';

const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const statusEl = document.getElementById('formStatus');

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = 'form-status' + (type ? ' ' + type : '');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setStatus('', '');

  const data = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    subject: form.subject.value,
    message: form.message.value.trim(),
    // honeypot — real users never fill this in
    company_website: form.company_website.value.trim(),
  };

  // Basic client-side validation
  if (!data.name || !data.email || !data.phone || !data.subject || !data.message) {
    setStatus('Please fill in every field before sending.', 'error');
    return;
  }
  if (!isValidEmail(data.email)) {
    setStatus('Please enter a valid email address.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-text').textContent = 'Sending…';

  try {
    const res = await fetch(CONTACT_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(result.error || 'Something went wrong. Please try again.');
    }

    setStatus("Thanks — we've received your message and will be in touch shortly.", 'success');
    form.reset();
  } catch (err) {
    setStatus(err.message || 'Something went wrong. Please try again in a moment.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Send message';
  }
});
