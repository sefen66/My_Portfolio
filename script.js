document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Theme toggle (persisted) ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('sefen-theme');
  if (savedTheme === 'light') root.classList.add('light');
  updateThemeIcon();

  themeBtn?.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem('sefen-theme', root.classList.contains('light') ? 'light' : 'dark');
    updateThemeIcon();
  });
  function updateThemeIcon(){
    const icon = themeBtn?.querySelector('i');
    if (!icon) return;
    icon.className = root.classList.contains('light') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }

  /* ---------- Device-language translation ---------- */
  const translateBtn = document.getElementById('translateToggle');
  const translateWidget = document.getElementById('google_translate_element');
  translateBtn?.addEventListener('click', () => {
    translateWidget?.classList.toggle('open');
    translateWidget?.setAttribute('aria-hidden', translateWidget.classList.contains('open') ? 'false' : 'true');
    const deviceLanguage = (navigator.language || 'en').split('-')[0];
    const languageSelect = translateWidget?.querySelector('select');
    if (languageSelect && [...languageSelect.options].some(option => option.value === deviceLanguage)) {
      languageSelect.value = deviceLanguage;
      languageSelect.dispatchEvent(new Event('change'));
    }
  });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navbar = document.getElementById('navbar');
  menuToggle?.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
  });
  navbar?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('open');
      menuToggle?.classList.remove('open');
    });
  });

  /* ---------- Typing effect ---------- */
  const typingEl = document.getElementById('typingText');
  const phrases = ['digital products', 'mobile apps', 'web experiences', 'useful solutions'];
  let phraseIndex = 0, charIndex = 0, deleting = false;

  function typeLoop(){
    if (!typingEl) return;
    const current = phrases[phraseIndex];
    typingEl.textContent = deleting ? current.slice(0, charIndex--) : current.slice(0, charIndex++);

    let delay = deleting ? 55 : 110;
    if (!deleting && charIndex === current.length + 1){ delay = 1400; deleting = true; }
    else if (deleting && charIndex < 0){ deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; charIndex = 0; delay = 300; }

    setTimeout(typeLoop, delay);
  }
  typeLoop();

  /* ---------- Scroll progress rail ---------- */
  const scrollFill = document.getElementById('scrollFill');
  function updateProgress(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (scrollFill) scrollFill.style.width = scrolled + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });

  /* ---------- Active nav link + topbar shadow ---------- */
  const sections = document.querySelectorAll('main .section, .hero');
  const navLinks = document.querySelectorAll('.nav-link');
  const topbar = document.querySelector('.topbar');

  function onScroll(){
    if (window.scrollY > 40) topbar.style.boxShadow = '0 8px 24px -18px rgba(0,0,0,.6)';
    else topbar.style.boxShadow = 'none';

    let currentId = '';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4){
        currentId = sec.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }
  document.addEventListener('scroll', onScroll, { passive: true });

  document.addEventListener('pointermove', event => {
    root.style.setProperty('--pointer-x', `${event.clientX}px`);
    root.style.setProperty('--pointer-y', `${event.clientY}px`);
  }, { passive: true });

  /* ---------- CSS phone motion ---------- */
  const phone3d = document.getElementById('phone3d');
  const heroVisual = document.querySelector('.hero-visual');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let phoneFramePending = false;
  function clamp(value, min, max){ return Math.min(max, Math.max(min, value)); }
  function updatePhone3D(pointerX = -1, pointerY = -1){
    if (!phone3d || !heroVisual || reduceMotion.matches) return;
    const rect = heroVisual.getBoundingClientRect();
    const offset = clamp((rect.top + rect.height / 2 - window.innerHeight / 2) / (window.innerHeight * .72), -1, 1);
    const inside = pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom;
    const tiltX = inside ? clamp((pointerY - (rect.top + rect.height / 2)) / rect.height * -8, -5, 5) : 0;
    const tiltY = inside ? clamp((pointerX - (rect.left + rect.width / 2)) / rect.width * 10, -6, 6) : 0;
    phone3d.style.setProperty('--phone-y', `${clamp(offset * -72, -72, 72).toFixed(1)}px`);
    phone3d.style.setProperty('--phone-scale', `${(1 + Math.abs(offset) * .08).toFixed(3)}`);
    phone3d.style.setProperty('--phone-rx', `${clamp(offset * 52 + tiltX, -56, 56).toFixed(1)}deg`);
    phone3d.style.setProperty('--phone-ry', `${(window.scrollY * .07 + offset * -22 + tiltY).toFixed(1)}deg`);
    phone3d.style.setProperty('--phone-rz', `${clamp(offset * 13, -13, 13).toFixed(1)}deg`);
  }
  function schedulePhone3D(x = -1, y = -1){
    if (phoneFramePending) return;
    phoneFramePending = true;
    requestAnimationFrame(() => { phoneFramePending = false; updatePhone3D(x, y); });
  }
  document.addEventListener('scroll', () => schedulePhone3D(), { passive: true });
  document.addEventListener('pointermove', event => schedulePhone3D(event.clientX, event.clientY), { passive: true });
  schedulePhone3D();

  /* ---------- Back to top ---------- */
  document.getElementById('toTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const subject = encodeURIComponent(`Project idea from ${formData.get('name')}`);
    const body = encodeURIComponent(`Name: ${formData.get('name')}\nEmail: ${formData.get('email')}\n\nProject details:\n${formData.get('message')}`);
    window.location.href = `mailto:sefenzkarya@gmail.com?subject=${subject}&body=${body}`;
  });

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealItems.forEach(item => revealObserver.observe(item));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.counter');
  function animateCounters(){
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const step = Math.max(1, Math.ceil(target / 80));
      const tick = () => {
        const current = +counter.innerText;
        if (current < target){
          counter.innerText = Math.min(current + step, target);
          requestAnimationFrame(() => setTimeout(tick, 16));
        } else {
          counter.innerText = target;
        }
      };
      tick();
    });
    const cups = document.getElementById('cupsCount');
    if (cups){
      let n = 0; const target = 100000; const step = target / 90;
      const tick = () => { n = Math.min(target, n + step); cups.textContent = Math.round(n).toLocaleString(); if (n < target) requestAnimationFrame(() => setTimeout(tick, 16)); };
      tick();
    }
  }
  const skillsSection = document.getElementById('skills');
  const aboutSection = document.getElementById('about');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){ animateCounters(); statsObserver.disconnect(); }
    });
  }, { threshold: 0.4 });
  if (aboutSection) statsObserver.observe(aboutSection);

  /* ---------- Skill meters fill ---------- */
  const meters = document.querySelectorAll('.meter');
  const meterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const el = entry.target;
        el.style.setProperty('--lvl', el.dataset.level);
        el.classList.add('filled');
        meterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  meters.forEach(m => meterObserver.observe(m));

  /* ---------- 3D phone screen slideshow ---------- */
  const slides = document.querySelectorAll('.app-slide');
  const dotsWrap = document.getElementById('phoneDots');
  let slideIndex = 0;

  if (slides.length && dotsWrap){
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => showSlide(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('span');

    function showSlide(i){
      slides[slideIndex].classList.remove('active');
      dots[slideIndex].classList.remove('active');
      slideIndex = i;
      slides[slideIndex].classList.add('active');
      dots[slideIndex].classList.add('active');
    }
    setInterval(() => showSlide((slideIndex + 1) % slides.length), 3200);
  }

  updateProgress();
  onScroll();
});

function googleTranslateElementInit(){
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'ar,en,fr,de,es,it,tr',
    autoDisplay: false
  }, 'google_translate_element');
}
