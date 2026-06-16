// Rounded favicon
(function () {
  const img = new Image();
  img.onload = () => {
    const size = 64;
    const r    = 14;
    const c    = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, size, size);
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel  = 'icon';
    link.href = c.toDataURL();
    document.head.appendChild(link);
  };
  img.src = 'Assets/Favicon.png';
})();

// Entry
const siteWrap = document.querySelector('.site-wrap');

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

// Clean up a stuck exit wipe if the page is restored from the
// back/forward cache (bfcache) instead of freshly loaded
window.addEventListener('pageshow', () => {
  document.getElementById('page-wipe')?.remove();
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
