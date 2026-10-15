(function () {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');

  // Solid nav background once the page scrolls past the top.
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu.
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  // Reveal sections and animate counters when they come into view.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll('.card, .why, .review, .dyno, .section__head');
  revealTargets.forEach((el) => el.classList.add('reveal'));

  const countUp = (el) => {
    const target = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
    const start = performance.now();
    const duration = 1400;
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.dataset.count) countUp(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealTargets.forEach((el) => io.observe(el));
    document.querySelectorAll('[data-count]').forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
    document.querySelectorAll('[data-count]').forEach(countUp);
  }

  // Booking form: validate, then hand off to the visitor's email client.
  // Swap this for a form service (Formspree, Netlify Forms, etc.) to receive submissions directly.
  const BOOKING_EMAIL = 'hello@smsportperformance.example';
  const form = document.getElementById('booking-form');
  const status = form.querySelector('.form__status');
  const dateInput = form.elements.date;
  dateInput.min = new Date().toISOString().split('T')[0];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      const bad = !field.checkValidity();
      field.classList.toggle('is-invalid', bad);
      if (bad && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      status.className = 'form__status is-err';
      status.textContent = 'Please fill in the highlighted fields.';
      firstInvalid.focus();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const body = [
      `Name: ${d.name}`,
      `Phone: ${d.phone}`,
      `Email: ${d.email || '-'}`,
      `Registration: ${d.reg.toUpperCase()}`,
      `Service: ${d.service}`,
      `Preferred date: ${d.date || 'Flexible'}`,
      '',
      d.message || '',
    ].join('\n');
    const subject = `Booking request: ${d.service} (${d.reg.toUpperCase()})`;
    window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.className = 'form__status is-ok';
    status.textContent = "Thanks! Your email app should open with your request ready to send.";
  });

  form.addEventListener('input', (e) => {
    if (e.target.classList.contains('is-invalid') && e.target.checkValidity()) e.target.classList.remove('is-invalid');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
