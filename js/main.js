// === Space Intro & Page Transitions ===
function runSpaceIntro() {
  const overlay = document.createElement('div');
  overlay.id = 'space-intro';
  document.body.prepend(overlay);

  const canvas = document.createElement('canvas');
  overlay.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  // Stars
  const stars = Array.from({ length: 350 }, () => ({
    angle:     Math.random() * Math.PI * 2,
    speed:     Math.random() * 3 + 1,
    startDist: Math.random() * 60,
    width:     Math.random() * 2 + 0.4,
    hue:       Math.random() < 0.6 ? 230 + Math.random() * 40 : 270 + Math.random() * 30,
  }));

  // Shockwave rings
  const rings = [
    { delay: 0.1, color: 'rgba(80,80,255,0.6)' },
    { delay: 0.25, color: 'rgba(120,60,255,0.4)' },
    { delay: 0.4, color: 'rgba(59,59,245,0.25)' },
  ];

  const duration = 2200;
  const start    = performance.now();

  function draw(now) {
    const t      = Math.min((now - start) / duration, 1);
    const eased  = t * t * (3 - 2 * t);      // smooth
    const thrust = Math.pow(t, 2.5);          // acceleration curve for stars

    // Trail effect
    ctx.fillStyle = `rgba(0,0,0,${0.25 + thrust * 0.3})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Central glow — pulses then flares at end
    const glowSize  = 20 + thrust * 300;
    const glowAlpha = t < 0.7 ? t * 0.8 : (1 - t) * 2.6;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
    grd.addColorStop(0,   `rgba(180,160,255,${Math.max(glowAlpha, 0)})`);
    grd.addColorStop(0.3, `rgba(80,80,245,${Math.max(glowAlpha * 0.6, 0)})`);
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Shockwave rings
    rings.forEach(ring => {
      const rt = Math.max((t - ring.delay) / (1 - ring.delay), 0);
      if (rt <= 0) return;
      const radius = rt * maxDist * 1.4;
      const alpha  = (1 - rt) * 0.7;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = ring.color.replace(')', `,${alpha})`).replace('rgba(', 'rgba(');
      ctx.lineWidth   = 2.5 - rt * 2;
      ctx.stroke();
    });

    // Stars shooting outward
    stars.forEach(s => {
      const dist  = s.startDist + thrust * maxDist * 1.3 * s.speed / 2.5;
      const tail  = Math.max(thrust * 280 * s.speed, 2);
      const alpha = Math.min(t * 5, 1) * (1 - Math.max((dist - maxDist * 0.85) / (maxDist * 0.15), 0));
      if (alpha <= 0) return;
      const hueShift = s.hue + thrust * 40;
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${hueShift}, 90%, ${70 + thrust * 20}%, ${alpha})`;
      ctx.lineWidth   = s.width + thrust * 2.5;
      ctx.moveTo(cx + Math.cos(s.angle) * dist,          cy + Math.sin(s.angle) * dist);
      ctx.lineTo(cx + Math.cos(s.angle) * (dist + tail), cy + Math.sin(s.angle) * (dist + tail));
      ctx.stroke();
    });

    // White flash at peak
    if (t > 0.82) {
      const flashAlpha = Math.sin((t - 0.82) / 0.18 * Math.PI) * 0.85;
      ctx.fillStyle = `rgba(200,200,255,${flashAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (t < 1) {
      requestAnimationFrame(draw);
    } else {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 600);
    }
  }

  requestAnimationFrame(draw);
}

// Entry: run space intro on home page fresh load
const siteWrap = document.querySelector('.site-wrap');

const isHome = location.pathname === '/' || location.pathname.endsWith('/index.html') || location.pathname === '';
if (isHome) runSpaceIntro();

// Intercept internal link clicks for exit wipe
document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('http') || link.target === '_blank') return;

  e.preventDefault();

  const wipe = document.createElement('div');
  wipe.id = 'page-wipe';
  document.body.appendChild(wipe);

  setTimeout(() => { window.location.href = href; }, 420);
});

// Back to top button
const backToTop = document.createElement('button');
backToTop.className = 'back-to-top';
backToTop.innerHTML = '↑';
backToTop.setAttribute('aria-label', 'Back to top');
document.body.appendChild(backToTop);

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
});

// Scroll progress bar
const scrollBar = document.createElement('div');
scrollBar.className = 'scroll-progress';
document.body.appendChild(scrollBar);

window.addEventListener('scroll', () => {
  const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  scrollBar.style.setProperty('--progress', progress);
});

// Cursor glow
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
document.body.appendChild(cursorGlow);

let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
let tx = cx, ty = cy;

document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

(function moveCursor() {
  cx += (tx - cx) * 0.08;
  cy += (ty - cy) * 0.08;
  cursorGlow.style.left = cx + 'px';
  cursorGlow.style.top  = cy + 'px';
  requestAnimationFrame(moveCursor);
})();

// Particle network
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const PARTICLE_COUNT = 55;
  const MAX_DIST = 140;
  let particles = [];
  let mouse = { x: -999, y: -999 };

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * canvas.width;
      this.y  = init ? Math.random() * canvas.height : (Math.random() < 0.5 ? -4 : canvas.height + 4);
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.5 + 0.8;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(90, 90, 255, 0.75)';
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(80, 80, 245, ${(1 - dist / MAX_DIST) * 0.3})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
      // Lines to mouse
      const dx   = particles[i].x - mouse.x;
      const dy   = particles[i].y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MAX_DIST * 1.6) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(100, 100, 255, ${(1 - dist / (MAX_DIST * 1.6)) * 0.5})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }

  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = -999; mouse.y = -999;
  });

  window.addEventListener('resize', () => { resize(); particles.forEach(p => p.reset(true)); });

  init();
  animate();
}

// Scale iframes to fit portfolio preview tiles
function scaleIframes() {
  document.querySelectorAll('.portfolio-preview iframe').forEach(iframe => {
    const container = iframe.parentElement;
    const scale = container.offsetWidth / 1280;
    iframe.style.transform = `scale(${scale})`;
    iframe.style.height = (container.offsetHeight / scale) + 'px';
  });
}

scaleIframes();
window.addEventListener('resize', scaleIframes);

// Mobile nav toggle (mirrors PLP pattern)
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.classList.toggle('open', !isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  });
}

function closeMenu() {
  if (!navToggle) return;
  navToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

// 3D card tilt
function addTilt(selector, maxTilt = 8) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const x     = e.clientX - rect.left;
      const y     = e.clientY - rect.top;
      const rotX  = ((y - rect.height / 2) / rect.height) * -maxTilt;
      const rotY  = ((x - rect.width  / 2) / rect.width)  *  maxTilt;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      card.style.boxShadow = `0 20px 40px rgba(59, 59, 245, 0.15)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

addTilt('.service-card');
addTilt('.portfolio-card', 6);


// Magnetic buttons
function initMagneticButtons() {
  document.querySelectorAll('.button, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect   = btn.getBoundingClientRect();
      const dx     = e.clientX - (rect.left + rect.width  / 2);
      const dy     = e.clientY - (rect.top  + rect.height / 2);
      btn.style.transform  = `translate(${dx * 0.32}px, ${dy * 0.32}px)`;
      btn.style.transition = 'transform 0.15s ease';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform  = '';
      btn.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
    });
  });
}

initMagneticButtons();

// Fade-up scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Counting animation for stat cards
function countUp(el) {
  const raw      = el.textContent.trim();
  const num      = parseInt(raw);
  const suffix   = raw.replace(num, '');
  if (isNaN(num)) return;
  const duration = 3000;
  const start    = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * num) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      countUp(entry.target.querySelector('.num'));
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.stat-card').forEach(card => statObserver.observe(card));

// Contact form — Web3Forms
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const formStatus = document.getElementById('formStatus');

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    formStatus.textContent = '';

    const data = new FormData(contactForm);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: '0dd140ec-c62e-432c-99e2-2db85685e1dc',
          subject: 'Launch Pilot Digital — New Enquiry',
          from_name: data.get('firstName') + ' ' + data.get('lastName'),
          email: data.get('email'),
          replyto: data.get('email'),
          phone: data.get('phone') || 'Not provided',
          service: data.get('service') || 'Not specified',
          message: data.get('message'),
        }),
      });

      const result = await res.json();
      if (result.success) {
        window.location.href = 'thankyou.html';
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch {
      btn.textContent = 'Send Message →';
      formStatus.style.color = '#e05555';
      formStatus.textContent = 'Something went wrong — please email hello@launchpilotdigital.com.au directly.';
    } finally {
      btn.disabled = false;
    }
  });
}
