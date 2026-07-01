/* =============================================
   Script — Álbum de Estampas Bíblicas
   Timer | Carousel | FAQ | Sticky CTA | Hero Anim
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  initHeroAnimation();
  initTimer();
  initCarousel();
  initFAQ();
  initStickyCTA();
  initSmoothScroll();
});

/* =============================================
   1. HERO — Stamp Entrance Animation
   ============================================= */
function initHeroAnimation() {
  const stamps = document.querySelectorAll('.hero-stamp');
  if (!stamps.length) return;

  // Check for reduced-motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    stamps.forEach(s => {
      s.style.opacity = '1';
      s.style.transform = `rotate(var(--rot, 0deg))`;
    });
    return;
  }

  // Trigger animation after a small delay for paint
  requestAnimationFrame(() => {
    stamps.forEach(s => s.classList.add('animate-in'));
  });
}

/* =============================================
   2. COUNTDOWN TIMER — 15 minutes
   Uses localStorage for persistence across refreshes
   ============================================= */
function initTimer() {
  const minutesEl  = document.getElementById('timer-minutes');
  const secondsEl  = document.getElementById('timer-seconds');
  const expiredEl  = document.getElementById('timer-expired');
  const displayEl  = document.getElementById('timer-display');
  if (!minutesEl || !secondsEl) return;

  const DURATION_MS = 15 * 60 * 1000; // 15 minutes
  const STORAGE_KEY = 'album_timer_end';

  // Get or set end time
  let endTime = parseInt(localStorage.getItem(STORAGE_KEY), 10);

  if (!endTime || isNaN(endTime) || endTime <= Date.now()) {
    endTime = Date.now() + DURATION_MS;
    localStorage.setItem(STORAGE_KEY, endTime.toString());
  }

  function updateDisplay() {
    const remaining = endTime - Date.now();

    if (remaining <= 0) {
      // Timer expired — show message briefly, then restart
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';

      if (expiredEl) {
        expiredEl.classList.add('show');
        displayEl.style.display = 'none';
      }

      // Restart after 3 seconds
      setTimeout(() => {
        endTime = Date.now() + DURATION_MS;
        localStorage.setItem(STORAGE_KEY, endTime.toString());
        if (expiredEl) {
          expiredEl.classList.remove('show');
          displayEl.style.display = 'flex';
        }
      }, 3000);

      return;
    }

    const totalSeconds = Math.ceil(remaining / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    minutesEl.textContent = String(mins).padStart(2, '0');
    secondsEl.textContent = String(secs).padStart(2, '0');
  }

  updateDisplay();
  setInterval(updateDisplay, 1000);
}

/* =============================================
   3. CAROUSEL — Touch/Swipe + Arrows + Dots
   ============================================= */
function initCarousel() {
  const track   = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const dots   = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
  let current  = 0;
  const total  = slides.length;

  // Touch/drag state
  let isDragging = false;
  let startX     = 0;
  let currentX   = 0;
  let dragDelta  = 0;

  function goTo(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;

    // Update dots
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  // Arrow buttons
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      if (!isNaN(idx)) goTo(idx);
    });
  });

  // --- Touch events ---
  track.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    currentX = startX;
    track.classList.add('dragging');
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    dragDelta = currentX - startX;
    const offset = -(current * 100) + (dragDelta / track.offsetWidth) * 100;
    track.style.transform = `translateX(${offset}%)`;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');

    const threshold = track.offsetWidth * 0.2; // 20% of track width
    if (dragDelta < -threshold) {
      goTo(current + 1);
    } else if (dragDelta > threshold) {
      goTo(current - 1);
    } else {
      goTo(current); // snap back
    }
    dragDelta = 0;
  });

  // --- Mouse drag (desktop) ---
  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    currentX = startX;
    track.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX;
    dragDelta = currentX - startX;
    const offset = -(current * 100) + (dragDelta / track.offsetWidth) * 100;
    track.style.transform = `translateX(${offset}%)`;
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');

    const threshold = track.offsetWidth * 0.2;
    if (dragDelta < -threshold) {
      goTo(current + 1);
    } else if (dragDelta > threshold) {
      goTo(current - 1);
    } else {
      goTo(current);
    }
    dragDelta = 0;
  });

  // Keyboard support
  track.setAttribute('tabindex', '0');
  track.setAttribute('role', 'region');
  track.setAttribute('aria-label', 'Carrusel de estampas bíblicas');

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); e.preventDefault(); }
  });
}

/* =============================================
   4. FAQ ACCORDION
   ============================================= */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other items first
      items.forEach(other => {
        if (other !== item && other.classList.contains('active')) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question');
          const otherAns = other.querySelector('.faq-answer');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.style.maxHeight = '0';
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
      } else {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* =============================================
   5. STICKY CTA — Show after hero on mobile
   Uses IntersectionObserver for performance
   ============================================= */
function initStickyCTA() {
  const hero     = document.getElementById('hero');
  const stickyCta = document.getElementById('sticky-cta');
  if (!hero || !stickyCta) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        // Show sticky CTA when hero is NOT in view
        if (entry.isIntersecting) {
          stickyCta.classList.remove('visible');
          stickyCta.setAttribute('aria-hidden', 'true');
        } else {
          stickyCta.classList.add('visible');
          stickyCta.setAttribute('aria-hidden', 'false');
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(hero);
}

/* =============================================
   6. SMOOTH SCROLL — for CTA links
   ============================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
