(() => {
  'use strict';

  const SITE = window.SITE || {};
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const session = {
    get(key) { try { return window.sessionStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { window.sessionStorage.setItem(key, value); } catch (e) { /* storage blocked */ } },
  };

  const selectText = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const copyToClipboard = (text) => (
    navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(text)
      : Promise.reject(new Error('Clipboard unavailable'))
  );

  /* ---------- Business details from assets/config.js ---------- */

  const digits = (value) => String(value || '').replace(/\D/g, '');
  const phoneDigits = digits(SITE.phone);
  let phoneIntl = '';
  if (phoneDigits.startsWith('44')) phoneIntl = `+${phoneDigits}`;
  else if (phoneDigits.startsWith('0')) phoneIntl = `+44${phoneDigits.slice(1)}`;
  else if (phoneDigits) phoneIntl = `+${phoneDigits}`;

  const waNumber = digits(SITE.whatsapp);
  const address = SITE.address || {};
  const addressLine = [address.street, address.town, address.postcode].filter(Boolean).join(', ');
  const socials = Object.entries(SITE.socials || {})
    .filter(([key, url]) => /^[a-z]+$/.test(key) && /^https?:\/\//.test(url || ''));
  const isPlaceholder = phoneDigits === '07000000000';

  const waLink = (text) => (waNumber ? `https://wa.me/${waNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}` : '');
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([SITE.name, addressLine].filter(Boolean).join(', '))}`;

  const values = {
    name: SITE.name,
    phone: SITE.phone,
    email: SITE.email,
    address: addressLine,
    whatsapp: waNumber,
  };

  $$('[data-site]').forEach((el) => {
    const value = values[el.dataset.site];
    if (value) el.textContent = value;
  });
  $$('[data-site-if]').forEach((el) => { el.hidden = !values[el.dataset.siteIf]; });
  $$('[data-site-tel]').forEach((a) => { if (phoneIntl) a.href = `tel:${phoneIntl}`; });
  $$('[data-site-mail]').forEach((a) => { if (SITE.email) a.href = `mailto:${SITE.email}`; });
  $$('[data-site-wa]').forEach((a) => { if (waNumber) a.href = waLink(a.dataset.siteWa); });
  $$('[data-site-maps]').forEach((a) => { a.href = mapsLink; });

  const SOCIAL_NAMES = { instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook', youtube: 'YouTube' };
  $$('[data-socials]').forEach((list) => {
    if (!socials.length) return;
    socials.forEach(([key, url]) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', SOCIAL_NAMES[key] || key);
      link.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-${key}"></use></svg>`;
      item.appendChild(link);
      list.appendChild(item);
    });
    list.hidden = false;
  });

  /* ---------- Opening hours, worked out on UK time ---------- */

  const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const DAY_NAMES = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
  const DAY_SHORT = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

  const parseHours = (value) => {
    const match = /^\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*$/.exec(value || '');
    return match ? { open: Number(match[1]) * 60 + Number(match[2]), close: Number(match[3]) * 60 + Number(match[4]) } : null;
  };
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const suffix = h >= 12 && h < 24 ? 'pm' : 'am';
    return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}${suffix}`;
  };
  const formatRange = (range) => (range ? `${formatTime(range.open)} – ${formatTime(range.close)}` : 'Closed');

  const londonParts = (options) => Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hourCycle: 'h23', ...options })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value]),
  );

  const hours = Object.fromEntries(DAYS.map((day) => [day, parseHours((SITE.hours || {})[day])]));

  if (DAYS.some((day) => hours[day])) {
    const nowParts = londonParts({ weekday: 'short', hour: '2-digit', minute: '2-digit' });
    const today = (nowParts.weekday || '').toLowerCase().slice(0, 3);
    const nowMinutes = Number(nowParts.hour) * 60 + Number(nowParts.minute);

    $$('[data-hours]').forEach((tbody) => {
      tbody.textContent = '';
      DAYS.forEach((day) => {
        const row = document.createElement('tr');
        if (day === today) row.className = 'is-today';
        const name = document.createElement('th');
        name.scope = 'row';
        name.textContent = DAY_NAMES[day];
        const time = document.createElement('td');
        time.textContent = formatRange(hours[day]);
        row.append(name, time);
        tbody.appendChild(row);
      });
    });

    // Footer summary groups days with the same hours, e.g. "Mon–Fri 9am – 5:30pm".
    const groups = [];
    DAYS.forEach((day) => {
      const text = formatRange(hours[day]);
      const last = groups[groups.length - 1];
      if (last && last.text === text) last.end = day;
      else groups.push({ start: day, end: day, text });
    });
    $$('[data-hours-summary]').forEach((list) => {
      list.textContent = '';
      groups.forEach((group) => {
        const item = document.createElement('li');
        const days = group.start === group.end ? DAY_SHORT[group.start] : `${DAY_SHORT[group.start]}–${DAY_SHORT[group.end]}`;
        item.textContent = `${days} ${group.text}`;
        list.appendChild(item);
      });
    });

    const status = $('#open-status');
    if (status && DAYS.includes(today)) {
      const todayHours = hours[today];
      const isOpen = Boolean(todayHours && nowMinutes >= todayHours.open && nowMinutes < todayHours.close);
      let text = 'Closed';
      if (isOpen) {
        text = `Open now · until ${formatTime(todayHours.close)}`;
      } else {
        const start = DAYS.indexOf(today);
        for (let offset = 0; offset < 8; offset += 1) {
          const day = DAYS[(start + offset) % 7];
          const range = hours[day];
          if (!range || (offset === 0 && nowMinutes >= range.open)) continue;
          const when = offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : DAY_SHORT[day];
          text = `Closed · opens ${when} ${formatTime(range.open)}`;
          break;
        }
      }
      status.textContent = text;
      status.classList.add(isOpen ? 'is-open' : 'is-closed');
      status.hidden = false;
    }
  }

  /* ---------- Google business details (only once real details are in) ---------- */

  if (!isPlaceholder) {
    try {
      const pad = (n) => String(n).padStart(2, '0');
      const clock = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
      const data = {
        '@context': 'https://schema.org',
        '@type': 'AutoRepair',
        name: SITE.name,
        url: SITE.url,
        image: SITE.url ? new URL('og-image.jpg', SITE.url).href : undefined,
        logo: SITE.url ? new URL('apple-touch-icon.png', SITE.url).href : undefined,
        telephone: phoneIntl || undefined,
        email: SITE.email || undefined,
        address: addressLine ? {
          '@type': 'PostalAddress',
          streetAddress: address.street,
          addressLocality: address.town,
          postalCode: address.postcode,
          addressCountry: 'GB',
        } : undefined,
        openingHoursSpecification: DAYS.filter((day) => hours[day]).map((day) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: DAY_NAMES[day],
          opens: clock(hours[day].open),
          closes: clock(hours[day].close),
        })),
        sameAs: socials.length ? socials.map(([, url]) => url) : undefined,
      };
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    } catch (e) { /* a malformed url in config.js shouldn't break the page */ }
  }

  /* ---------- Header ---------- */

  const header = $('.nav');
  const updateHeaderHeight = () => root.style.setProperty('--header-h', `${header.offsetHeight}px`);

  const notice = $('#notice');
  if (notice && isPlaceholder && session.get('smsp-notice-hidden') !== '1') {
    notice.hidden = false;
    $('#notice-close').addEventListener('click', () => {
      notice.hidden = true;
      session.set('smsp-notice-hidden', '1');
      updateHeaderHeight();
    });
  }

  updateHeaderHeight();
  if ('ResizeObserver' in window) new ResizeObserver(updateHeaderHeight).observe(header);
  else window.addEventListener('resize', updateHeaderHeight);

  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Underline the menu link for the section on screen.
  const navLinks = $$('.nav__links a');
  if ('IntersectionObserver' in window) {
    const linkFor = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.removeAttribute('aria-current'));
        const link = linkFor.get(entry.target.id);
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('main > section[id]').forEach((section) => spy.observe(section));
  }

  // Mobile menu
  const menu = $('#menu');
  const toggle = $('.nav__toggle');
  const outside = [$('#main'), $('.footer'), $('.actionbar')].filter(Boolean);
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.inert = !open;
    outside.forEach((el) => { el.inert = open; });
  };
  menu.inert = true;
  toggle.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    setMenu(open);
    if (open) {
      const first = $('a', menu);
      if (first) first.focus({ preventScroll: true });
    }
  });
  menu.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });

  /* ---------- Livery pattern: shards in the drift car's colours ---------- */

  const styles = getComputedStyle(root);
  const token = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  const LIVERY = [
    [token('--red', '#e3141b'), 5],
    [token('--red-deep', '#a80d12'), 3],
    [token('--ink', '#0c0a0a'), 4],
    [token('--steel', '#1c1718'), 2.5],
    [token('--steel-2', '#2a2324'), 2],
    [token('--muted', '#b5aaa8'), 0.35],
  ];
  const liveryWeight = LIVERY.reduce((sum, [, weight]) => sum + weight, 0);

  const seededRandom = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const drawLivery = (canvas) => {
    const { width, height } = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!width || !height || !ctx) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const random = seededRandom(Number(canvas.dataset.seed) || 7);
    const pick = () => {
      let roll = random() * liveryWeight;
      for (const [colour, weight] of LIVERY) {
        roll -= weight;
        if (roll <= 0) return colour;
      }
      return LIVERY[0][0];
    };

    const cell = Math.max(22, Math.min(84, height / 1.5));
    const lean = cell * 0.55; // each row leans right, like the shards in the logo
    const rows = Math.ceil(height / cell) + 2;
    const firstCol = -rows - 2;
    const lastCol = Math.ceil(width / cell) + 3;
    const grid = [];
    for (let r = 0; r <= rows; r += 1) {
      const row = [];
      for (let c = firstCol; c <= lastCol; c += 1) {
        row.push([
          c * cell + r * lean + (random() - 0.5) * cell * 0.75,
          (r - 1) * cell + (random() - 0.5) * cell * 0.6,
        ]);
      }
      grid.push(row);
    }

    ctx.fillStyle = LIVERY[2][0];
    ctx.fillRect(0, 0, width, height);
    const triangle = (a, b, c) => {
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.closePath();
      ctx.fillStyle = pick();
      ctx.fill();
    };
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < grid[r].length - 1; c += 1) {
        const a = grid[r][c];
        const b = grid[r][c + 1];
        const d = grid[r + 1][c];
        const e = grid[r + 1][c + 1];
        if (random() > 0.5) { triangle(a, b, e); triangle(a, e, d); } else { triangle(a, b, d); triangle(b, e, d); }
      }
    }
  };

  const liveryCanvases = $$('[data-livery]');
  const drawAllLivery = () => liveryCanvases.forEach(drawLivery);
  drawAllLivery();
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    window.requestAnimationFrame(drawAllLivery);
  });

  // Ticker: repeat the list so the loop never shows a gap.
  $$('[data-ticker]').forEach((track) => {
    const group = track.firstElementChild;
    if (!group) return;
    for (let i = 0; i < 3; i += 1) {
      const copy = group.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    }
    if (!reduceMotion) track.classList.add('is-running');
  });

  // Service cards: a red glow follows the pointer.
  $$('.service').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });

  /* ---------- Workshop video: nothing downloads until Play is pressed ---------- */

  $$('[data-video]').forEach((button) => {
    button.addEventListener('click', () => {
      const wrap = button.closest('[data-video-wrap]');
      const base = button.dataset.video;
      const poster = $('img', button);
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      if (poster) video.poster = poster.currentSrc || poster.src;
      // MP4 plays almost everywhere; WebM covers browsers without H.264.
      const sources = [
        [`${base}.mp4`, 'video/mp4; codecs="avc1.640028, mp4a.40.2"'],
        [`${base}.webm`, 'video/webm; codecs="vp9, opus"'],
      ].map(([src, type]) => {
        const source = document.createElement('source');
        source.src = src;
        source.type = type;
        video.appendChild(source);
        return source;
      });
      sources[sources.length - 1].addEventListener('error', () => {
        const message = document.createElement('p');
        message.className = 'video__error';
        message.textContent = "The video couldn't play here. ";
        const link = document.createElement('a');
        link.href = `${base}.mp4`;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Open it in a new tab';
        message.appendChild(link);
        wrap.appendChild(message);
      }, { once: true });
      wrap.classList.add('is-playing');
      button.replaceWith(video);
      video.focus();
      const playing = video.play();
      if (playing && playing.catch) playing.catch(() => { /* controls stay visible to start it manually */ });
    });
  });

  /* ---------- Photo viewer ---------- */

  const dialog = $('#lightbox');
  const galleryButtons = $$('[data-lightbox]');
  if (dialog && galleryButtons.length && typeof dialog.showModal === 'function') {
    const image = $('#lightbox-img');
    const caption = $('#lightbox-cap');
    const counter = $('#lightbox-count');
    const photos = galleryButtons.map((button) => ({
      src: button.dataset.full,
      alt: ($('img', button) || {}).alt || '',
      caption: button.dataset.caption || '',
    }));
    let index = 0;
    let opener = null;
    let swiped = false;
    let startX = null;

    const show = (next) => {
      index = (next + photos.length) % photos.length;
      const photo = photos[index];
      image.src = photo.src;
      image.alt = photo.alt;
      caption.textContent = photo.caption;
      counter.textContent = `${index + 1} / ${photos.length}`;
      [index + 1, index - 1].forEach((n) => {
        const preload = new Image();
        preload.src = photos[(n + photos.length) % photos.length].src;
      });
    };

    galleryButtons.forEach((button, i) => button.addEventListener('click', () => {
      opener = button;
      show(i);
      dialog.showModal();
    }));
    $('.lightbox__prev', dialog).addEventListener('click', () => show(index - 1));
    $('.lightbox__next', dialog).addEventListener('click', () => show(index + 1));
    $('.lightbox__close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') show(index + 1);
      else if (event.key === 'ArrowLeft') show(index - 1);
    });
    dialog.addEventListener('pointerdown', (event) => { startX = event.clientX; swiped = false; });
    dialog.addEventListener('pointerup', (event) => {
      if (startX === null) return;
      const distance = event.clientX - startX;
      startX = null;
      if (Math.abs(distance) > 50) {
        swiped = true;
        show(index + (distance < 0 ? 1 : -1));
      }
    });
    dialog.addEventListener('click', (event) => {
      if (swiped) { swiped = false; return; }
      if (event.target === dialog || event.target.classList.contains('lightbox__figure')) dialog.close();
    });
    dialog.addEventListener('close', () => { if (opener) opener.focus(); });
  }

  /* ---------- Contact copy buttons ---------- */

  $$('[data-copy]').forEach((button) => {
    const label = $('span', button);
    const original = label ? label.textContent : '';
    let timer = null;
    const flash = (text) => {
      button.classList.add('is-done');
      if (label) label.textContent = text;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.classList.remove('is-done');
        if (label) label.textContent = original;
      }, 2000);
    };
    button.addEventListener('click', () => {
      copyToClipboard(values[button.dataset.copy] || '')
        .then(() => flash('Copied'))
        .catch(() => {
          const target = $('.contact__value', button.parentElement);
          if (target) selectText(target);
          flash('Selected');
        });
    });
  });

  /* ---------- Job card ---------- */

  const form = $('#jobcard');
  if (form) {
    const body = $('#jc-body', form);
    const ready = $('#jc-ready', form);
    const preview = $('#jc-preview', form);
    const copyStatus = $('#copy-status', form);
    const workBoxes = $$('input[name="work"]', form);
    const workError = $('#work-error', form);
    const dateInput = $('#date', form);

    const stamp = londonParts({ year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const jobNo = `SMSP-${stamp.month}${stamp.day}-${stamp.hour}${stamp.minute}`;
    $('#job-no', form).textContent = jobNo;
    $('#job-date', form).textContent = `${stamp.day}/${stamp.month}/${stamp.year}`;
    dateInput.min = `${stamp.year}-${stamp.month}-${stamp.day}`;

    const fields = {
      reg: { el: $('#reg', form), error: $('#reg-error', form), check: (v) => v.replace(/\s/g, '').length >= 2 },
      name: { el: $('#name', form), error: $('#name-error', form), check: (v) => v.trim().length >= 2 },
      phone: { el: $('#phone', form), error: $('#phone-error', form), check: (v) => digits(v).length >= 10 },
      email: { el: $('#email', form), error: $('#email-error', form), check: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    };
    const setFieldState = (field, ok) => {
      field.el.classList.toggle('is-invalid', !ok);
      if (ok) field.el.removeAttribute('aria-invalid');
      else field.el.setAttribute('aria-invalid', 'true');
      field.error.hidden = ok;
    };

    fields.reg.el.addEventListener('input', () => {
      const el = fields.reg.el;
      const caret = el.selectionStart;
      el.value = el.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
      if (caret !== null) el.setSelectionRange(caret, caret);
    });
    Object.values(fields).forEach((field) => {
      field.el.addEventListener('input', () => {
        if (field.el.classList.contains('is-invalid')) setFieldState(field, field.check(field.el.value));
      });
    });
    workBoxes.forEach((box) => box.addEventListener('change', () => {
      if (workBoxes.some((b) => b.checked)) workError.hidden = true;
    }));

    const showForm = () => {
      ready.hidden = true;
      body.hidden = false;
    };

    // "Book a service" style links tick the matching box on the job card.
    $$('[data-service]').forEach((link) => link.addEventListener('click', () => {
      const box = workBoxes.find((b) => b.value === link.dataset.service);
      if (box) {
        box.checked = true;
        workError.hidden = true;
      }
      if (!ready.hidden) showForm();
    }));

    const formatDate = (iso) => {
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    let cardText = '';

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let firstProblem = null;

      const anyWork = workBoxes.some((b) => b.checked);
      workError.hidden = anyWork;
      if (!anyWork) firstProblem = workBoxes[0];

      ['reg', 'name', 'phone', 'email'].forEach((key) => {
        const field = fields[key];
        const ok = field.check(field.el.value);
        if (key === 'phone') {
          field.error.textContent = field.el.value.trim()
            ? 'Check the phone number. It looks too short.'
            : 'Add a phone number so we can call you back.';
        }
        setFieldState(field, ok);
        if (!ok && !firstProblem) firstProblem = field.el;
      });

      if (firstProblem) {
        firstProblem.focus();
        return;
      }

      const work = workBoxes.filter((b) => b.checked).map((b) => b.value);
      const reg = fields.reg.el.value.trim().replace(/\s+/g, ' ');
      const car = $('#car', form).value.trim();
      const details = $('#details', form).value.trim();
      const lines = [
        `JOB CARD ${jobNo}`,
        '',
        `Work: ${work.join(', ')}`,
        `Car: ${reg}${car ? ` (${car})` : ''}`,
      ];
      if (dateInput.value) lines.push(`Preferred date: ${formatDate(dateInput.value)}`);
      if (details) lines.push(`Details: ${details}`);
      lines.push('', `Name: ${fields.name.el.value.trim()}`, `Phone: ${fields.phone.el.value.trim()}`);
      if (fields.email.el.value.trim()) lines.push(`Email: ${fields.email.el.value.trim()}`);
      cardText = lines.join('\n');

      preview.textContent = cardText;
      if (waNumber) $('#send-wa', form).href = waLink(cardText.replace(/^JOB CARD (.+)$/m, '*JOB CARD $1*'));
      const subject = `Job card ${jobNo}: ${work.join(', ')} (${reg})`;
      $('#send-mail', form).href = `mailto:${SITE.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(cardText)}`;
      copyStatus.textContent = '';

      body.hidden = true;
      ready.hidden = false;
      ready.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });

    $('#edit-card', form).addEventListener('click', () => {
      showForm();
      (workBoxes.find((b) => b.checked) || workBoxes[0]).focus();
    });

    $('#copy-card', form).addEventListener('click', () => {
      copyToClipboard(cardText)
        .then(() => { copyStatus.textContent = 'Copied. Paste it into a message to us.'; })
        .catch(() => {
          selectText(preview);
          copyStatus.textContent = 'Text selected. Press Ctrl+C (Cmd+C on a Mac) to copy it.';
        });
    });
  }

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
