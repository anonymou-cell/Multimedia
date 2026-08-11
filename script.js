(function () {
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorDot = document.getElementById('cursorDot');
  const bookPage = document.querySelector('.book-page');
  const pageOrder = [
    { id: 'home', url: 'index.html', label: 'Home' },
    { id: 'about', url: 'about.html', label: 'About' },
    { id: 'courses', url: 'courses.html', label: 'Courses' },
    { id: 'contact', url: 'contact.html', label: 'Contact' }
  ];
  const currentPageId = document.body.dataset.page;
  const currentPageIndex = pageOrder.findIndex((page) => page.id === currentPageId);

  function turnButton(direction, page) {
    const arrow = direction === 'previous'
      ? '<path d="M15 5l-7 7 7 7M8 12h11"/>'
      : '<path d="M9 5l7 7-7 7M5 12h11"/>';
    return `<button type="button" class="page-turn-button ${direction}" data-nav="${page.url}" data-turn="${direction}" aria-label="Turn to ${page.label} page">
      <span class="turn-copy"><small>${direction === 'previous' ? 'previous' : 'next'} page</small><strong>${page.label}</strong></span>
      <svg viewBox="0 0 24 24" aria-hidden="true">${arrow}</svg>
    </button>`;
  }

  if (bookPage) {
    const controls = document.createElement('nav');
    controls.className = 'page-turn-controls';
    controls.setAttribute('aria-label', 'Page turn controls');

    if (currentPageIndex >= 0) {
      const previous = pageOrder[currentPageIndex - 1];
      const next = pageOrder[currentPageIndex + 1];
      controls.innerHTML = `${previous ? turnButton('previous', previous) : '<span></span>'}
        <span class="page-number mono">${String(currentPageIndex + 1).padStart(2, '0')} / ${String(pageOrder.length).padStart(2, '0')}</span>
        ${next ? turnButton('next', next) : '<span></span>'}`;
    } else if (currentPageId === 'thankyou') {
      controls.innerHTML = `${turnButton('previous', pageOrder[3])}
        <span class="page-number mono">note received</span>
        ${turnButton('next', pageOrder[0])}`;
    }

    if (controls.innerHTML) document.body.appendChild(controls);

    try {
      const arrival = JSON.parse(sessionStorage.getItem('notebook-turn') || 'null');
      const currentFile = window.location.pathname.split('/').pop() || 'index.html';
      if (arrival && arrival.target === currentFile) {
        bookPage.classList.add(arrival.direction === 'previous' ? 'turn-in-previous' : 'turn-in-next');
        sessionStorage.removeItem('notebook-turn');
        const clearArrival = (event) => {
          if (event.target !== bookPage) return;
          bookPage.classList.remove('turn-in-previous', 'turn-in-next');
          bookPage.removeEventListener('animationend', clearArrival);
        };
        bookPage.addEventListener('animationend', clearArrival);
      }
    } catch (_) {
      // Navigation still works when storage is unavailable (for example, strict file privacy settings).
    }
  }

  if (hasFinePointer && cursorGlow && cursorDot) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('button, a, .mini-card, input, textarea').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('is-active'));
    });
  }

  let isTurning = false;

  function directionTo(url, requestedDirection) {
    if (requestedDirection) return requestedDirection;
    const targetFile = url.split('/').pop();
    const targetIndex = pageOrder.findIndex((page) => page.url === targetFile);
    if (currentPageId === 'thankyou') return targetFile === 'index.html' ? 'next' : 'previous';
    if (currentPageIndex < 0 || targetIndex < 0) return 'next';
    return targetIndex < currentPageIndex ? 'previous' : 'next';
  }

  function travelTo(url, direction) {
    if (isTurning) return;
    isTurning = true;

    if (!bookPage || reduceMotion) {
      window.location.href = url;
      return;
    }

    const turnDirection = directionTo(url, direction);
    const targetFile = url.split('/').pop();
    try {
      sessionStorage.setItem('notebook-turn', JSON.stringify({
        direction: turnDirection,
        target: targetFile
      }));
    } catch (_) { /* The exit turn remains useful without an arrival state. */ }

    document.body.classList.add('is-turning');
    bookPage.classList.add(turnDirection === 'previous' ? 'turn-out-previous' : 'turn-out-next');

    let navigated = false;
    const finish = () => {
      if (navigated) return;
      navigated = true;
      window.location.href = url;
    };
    const finishOnPageTurn = (event) => {
      if (event.target !== bookPage) return;
      bookPage.removeEventListener('animationend', finishOnPageTurn);
      finish();
    };
    bookPage.addEventListener('animationend', finishOnPageTurn);
    setTimeout(finish, 780);
  }

  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const url = el.getAttribute('data-nav');
      if (currentPageIndex >= 0 && pageOrder[currentPageIndex].url === url) return;
      travelTo(url, el.getAttribute('data-turn'));
    });
  });

  const particleField = document.querySelector('.hero-particles');
  if (particleField) {
    const total = 22;
    for (let i = 0; i < total; i++) {
      const speck = document.createElement('span');
      speck.style.left = Math.random() * 100 + '%';
      speck.style.bottom = -10 + Math.random() * 20 + 'px';
      speck.style.animationDuration = 9 + Math.random() * 10 + 's';
      speck.style.animationDelay = Math.random() * 10 + 's';
      speck.style.width = speck.style.height = 3 + Math.random() * 4 + 'px';
      particleField.appendChild(speck);
    }
  }

  const heroInner = document.querySelector('.hero-page');
  if (hasFinePointer && heroInner) {
    const doodles = heroInner.querySelectorAll('.doodle');
    heroInner.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      doodles.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.3;
        const dx = (e.clientX - cx) * speed * 0.05;
        const dy = (e.clientY - cy) * speed * 0.05;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    });
  }

  const typeTarget = document.getElementById('heroType');
  const typeLines = [
    'currently on: semester 2, week 6',
    'status: still debugging a database join',
    'next up: choosing a semester 4 elective'
  ];
  if (typeTarget) {
    let lineIndex = 0, charIndex = 0, deleting = false;
    function typeTick() {
      const current = typeLines[lineIndex];
      if (!deleting) {
        charIndex++;
        typeTarget.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) { deleting = true; setTimeout(typeTick, 1500); return; }
      } else {
        charIndex--;
        typeTarget.textContent = current.slice(0, charIndex);
        if (charIndex === 0) { deleting = false; lineIndex = (lineIndex + 1) % typeLines.length; }
      }
      setTimeout(typeTick, deleting ? 28 : 52);
    }
    typeTick();
  }

  const tabFlags = document.querySelectorAll('.tab-flag');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabFlags.forEach((flag) => {
    flag.addEventListener('click', () => {
      const target = flag.getAttribute('data-tab');
      tabFlags.forEach((f) => f.classList.toggle('is-active', f === flag));
      tabPanels.forEach((p) => p.classList.toggle('is-active', p.getAttribute('data-tab') === target));
    });
  });

  const courseData = {
    1: { title: 'Foundations', courses: ['Programming Fundamentals (C)', 'Discrete Mathematics', 'Digital Logic', 'Communication English', 'Computer Fundamentals & Applications'] },
    2: { title: 'Core building blocks', courses: ['Object-Oriented Programming (Java)', 'Data Structures & Algorithms', 'Database Management Systems', 'Statistics', 'Society & Technology'] },
    3: { title: 'Systems & the web', courses: ['Web Technology', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Numerical Methods'] },
    4: { title: 'Applied practice', courses: ['Mobile App Development', 'Systems Analysis & Design', 'Cloud Computing Fundamentals', 'Elective I', 'Minor Project'] }
  };

  const semDetail = document.getElementById('semDetail');
  if (semDetail) {
    const semTitle = document.getElementById('semDetailTitle');
    const semList = document.getElementById('semDetailList');

    function showSemester(semester) {
      const data = courseData[semester];
      if (!data) return;
      semTitle.textContent = 'Semester ' + semester + ' — ' + data.title;
      semList.innerHTML = '';
      data.courses.forEach((c) => {
        const li = document.createElement('li');
        li.textContent = c;
        semList.appendChild(li);
      });
      semDetail.classList.remove('is-open');
      void semDetail.offsetWidth; // reflow so the reveal transition replays on each change
      semDetail.classList.add('is-open');
      semDetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    document.querySelectorAll('.mini-card').forEach((card) => {
      const burstThenShow = () => {
        if (card.classList.contains('is-bursting')) return;
        card.classList.add('is-bursting');
        document.querySelectorAll('.mini-card').forEach((c) => c.classList.toggle('is-active', c === card));
        setTimeout(() => {
          showSemester(card.getAttribute('data-semester'));
          card.classList.remove('is-bursting');
        }, 550);
      };
      card.addEventListener('click', burstThenShow);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); burstThenShow(); }
      });
    });
  }

  const testimonials = [
    { quote: 'The labs actually run like a workplace — I broke a build in week four and a lecturer sat with me until it compiled.', who: 'Aayusha, BIT 3rd semester' },
    { quote: 'I picked Mid-Valley for the internship pipeline and it delivered — I was writing real tickets before graduation.', who: 'Rohan, BIT graduate' },
    { quote: 'Small batches meant every question got answered. No sitting in the back of a hall of two hundred.', who: 'Sneha, BIT 2nd semester' }
  ];
  const trackQuote = document.querySelector('.testimonial-track .quote');
  const trackWho = document.querySelector('.testimonial-track .who');
  const dotsWrap = document.querySelector('.carousel-dots');
  if (trackQuote && dotsWrap) {
    let tIndex = 0;
    testimonials.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => showTestimonial(i));
      dotsWrap.appendChild(dot);
    });
    function showTestimonial(i) {
      tIndex = (i + testimonials.length) % testimonials.length;
      trackQuote.textContent = testimonials[tIndex].quote;
      trackWho.textContent = testimonials[tIndex].who;
      dotsWrap.querySelectorAll('span').forEach((d, di) => d.classList.toggle('is-active', di === tIndex));
    }
    showTestimonial(0);
    document.querySelector('.carousel-arrow.prev')?.addEventListener('click', () => showTestimonial(tIndex - 1));
    document.querySelector('.carousel-arrow.next')?.addEventListener('click', () => showTestimonial(tIndex + 1));
    setInterval(() => showTestimonial(tIndex + 1), 6000);
  }

  const counterCells = document.querySelectorAll('.stat-cell strong[data-target]');
  counterCells.forEach((el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  const form = document.getElementById('contactForm');
  if (form) {
    const formSuccess = document.getElementById('formSuccess');

    function setFieldError(fieldId, message) {
      const group = document.getElementById(fieldId).closest('.field');
      const errorEl = document.getElementById('err-' + fieldId);
      if (message) { group.classList.add('invalid'); errorEl.textContent = message; }
      else { group.classList.remove('invalid'); errorEl.textContent = ''; }
    }

    function validateForm() {
      let valid = true;
      const fullName = document.getElementById('fullName').value.trim();
      if (fullName.length < 2) { setFieldError('fullName', 'Add your full name.'); valid = false; }
      else setFieldError('fullName', '');

      const email = document.getElementById('email').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('email', 'Add a valid email.'); valid = false; }
      else setFieldError('email', '');

      const phone = document.getElementById('phone').value.trim();
      if (!/^[0-9+\-\s]{7,15}$/.test(phone)) { setFieldError('phone', 'Add a valid phone number.'); valid = false; }
      else setFieldError('phone', '');

      const message = document.getElementById('message').value.trim();
      if (message.length < 10) { setFieldError('message', 'Write at least 10 characters.'); valid = false; }
      else setFieldError('message', '');

      return valid;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      formSuccess.classList.remove('show');
      if (validateForm()) {
        formSuccess.classList.add('show');
        setTimeout(() => {
          travelTo('thankyou.html', 'next');
        }, 700);
      } else {
        const firstInvalid = form.querySelector('.field.invalid input, .field.invalid textarea');
        if (firstInvalid) firstInvalid.focus();
      }
    });
    ['fullName', 'email', 'phone', 'message'].forEach((id) => {
      const field = document.getElementById(id);
      field.addEventListener('input', () => { if (field.closest('.field').classList.contains('invalid')) validateForm(); });
    });
  }
})();
