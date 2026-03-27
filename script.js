/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    // stagger siblings
    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
    const idx = siblings.indexOf(el);
    setTimeout(() => el.classList.add('visible'), idx * 90);
    io.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ─────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['rgba(200,169,110,', 'rgba(212,168,160,', 'rgba(240,221,216,'];

  class Dot {
    constructor() { this.init(true); }
    init(scatter) {
      this.x  = Math.random() * canvas.width;
      this.y  = scatter ? Math.random() * canvas.height : canvas.height + 10;
      this.r  = Math.random() * 1.6 + 0.3;
      this.vy = -(Math.random() * 0.35 + 0.08);
      this.vx = (Math.random() - 0.5) * 0.15;
      this.life = 0;
      this.maxLife = Math.random() * 280 + 180;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    tick() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -6) this.init(false);
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.45;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + alpha + ')';
      ctx.fill();
    }
  }

  const dots = Array.from({ length: 55 }, () => new Dot());

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach(d => { d.tick(); d.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ─────────────────────────────────────────
   DAY COUNTER  —  start date: 13 July 2016
───────────────────────────────────────── */
(function initCounter() {
  const start   = new Date(2016, 6, 13); // month is 0-indexed
  const today   = new Date();
  const target  = Math.floor((today - start) / 86400000);
  const el      = document.getElementById('dayCounter');
  if (!el) return;

  let current = 0;
  const duration = 2200; // ms
  const fps = 60;
  const steps = duration / (1000 / fps);
  const increment = target / steps;

  const counterObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    counterObs.disconnect();

    function tick() {
      current += increment;
      if (current >= target) {
        el.textContent = target.toLocaleString();
        return;
      }
      el.textContent = Math.floor(current).toLocaleString();
      requestAnimationFrame(tick);
    }
    tick();
  }, { threshold: 0.5 });

  counterObs.observe(el);
})();

/* ─────────────────────────────────────────
   HERO PARALLAX (subtle)
───────────────────────────────────────── */
(function initParallax() {
  const content = document.querySelector('.hero-content');
  const photo   = document.querySelector('.hero-photo-wrap');
  if (!content || !photo) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        content.style.transform = `translateY(${y * 0.1}px)`;
        photo.style.transform   = `translateY(${y * 0.06}px)`;
      }
      ticking = false;
    });
  }, { passive: true });
})();

/* ─────────────────────────────────────────
   FINAL REVEAL BUTTON
───────────────────────────────────────── */
(function initReveal() {
  const btn = document.getElementById('revealBtn');
  const msg = document.getElementById('finalMessage');
  if (!btn || !msg) return;

  btn.addEventListener('click', () => {
    btn.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    btn.style.opacity    = '0';
    btn.style.transform  = 'translateY(-12px)';
    btn.style.pointerEvents = 'none';

    setTimeout(() => {
      btn.style.display = 'none';
      msg.classList.add('open');
    }, 420);
  });
})();

/* ─────────────────────────────────────────
   MUSIC — autoplay muted, unmute on click
───────────────────────────────────────── */
(function initMusic() {
  const btn   = document.getElementById('musicBtn');
  const label = btn?.querySelector('.music-label');
  const icon  = btn?.querySelector('.music-icon');
  if (!btn) return;

  const audio = new Audio('music/Xopun.mp3');
  audio.loop   = true;
  audio.volume = 0.7;

  // --- autoplay muted (bypasses browser block) ---
  audio.muted = true;
  audio.play().catch(() => {
    // autoplay blocked entirely — wait for first click
    audio.muted = false;
  });

  // update button to show it's playing (muted)
  label.textContent = 'Tap for Sound';
  btn.classList.add('playing');

  let muted = true;

  btn.addEventListener('click', () => {
    if (muted) {
      // first click: unmute
      audio.muted = false;
      muted = false;
      label.textContent = 'Playing…';
      btn.title = 'Pause song';
    } else if (!audio.paused) {
      // pause
      audio.pause();
      label.textContent = 'Our Song';
      btn.classList.remove('playing');
      btn.title = 'Play song';
    } else {
      // resume
      audio.play();
      label.textContent = 'Playing…';
      btn.classList.add('playing');
      btn.title = 'Pause song';
    }
  });

  // if autoplay was blocked, start on first user interaction anywhere
  function startOnInteraction() {
    audio.muted = false;
    audio.play().then(() => {
      muted = false;
      label.textContent = 'Playing…';
      btn.classList.add('playing');
    }).catch(() => {});
    document.removeEventListener('click', startOnInteraction);
    document.removeEventListener('touchstart', startOnInteraction);
  }
  document.addEventListener('click', startOnInteraction, { once: true });
  document.addEventListener('touchstart', startOnInteraction, { once: true });
})();
