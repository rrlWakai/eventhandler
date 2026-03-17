/**
 * CCS Week 2026 — script.js
 * All interactivity, animations, and validation logic.
 */

/* ============================================================
   1. LUCIDE ICONS — Initialize after DOM load
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  initNavbar();
  initSmoothScroll();
  initMobileMenu();
  initScrollReveal();
  initGalleryLightbox();
  initRegistrationForm();
});

/* ============================================================
   2. NAVBAR — Scroll effect
============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load
}

/* Highlight active nav link based on scroll position */
function updateActiveNavLink() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.navbar__link[data-nav]');
  const scrollY = window.scrollY + 100;

  let current = '';

  sections.forEach(section => {
    if (section.offsetTop <= scrollY) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href && href === `#${current}`) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   3. SMOOTH SCROLL — All [data-nav] anchor links
============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[data-nav], a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Close mobile menu if open
      closeMobileMenu();

      const navbarHeight = document.getElementById('navbar')?.offsetHeight || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   4. MOBILE MENU
============================================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  if (!navMenu) return;

  navMenu.classList.remove('open');
  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';
}

/* ============================================================
   5. SCROLL REVEAL — Intersection Observer
============================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger children within the same parent
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, Number(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  // Add stagger delays for sibling reveal elements
  const groups = {};
  elements.forEach(el => {
    const parent = el.parentElement;
    const key = parent ? parent.className : 'root';
    if (!groups[key]) groups[key] = [];
    groups[key].push(el);
  });

  Object.values(groups).forEach(group => {
    if (group.length > 1) {
      group.forEach((el, i) => {
        el.dataset.delay = i * 80;
      });
    }
  });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   6. GALLERY LIGHTBOX
============================================================ */
function initGalleryLightbox() {
  const gallery     = document.getElementById('gallery');
  const lightbox    = document.getElementById('lightbox');
  const backdrop    = document.getElementById('lightboxBackdrop');
  const closeBtn    = document.getElementById('lightboxClose');
  const imgWrap     = document.getElementById('lightboxImgWrap');
  const titleEl     = document.getElementById('lightboxTitle');
  const captionEl   = document.getElementById('lightboxCaption');

  if (!gallery || !lightbox) return;

  // Gallery item click → open lightbox
  gallery.querySelectorAll('.gallery__item').forEach(item => {
    // Make items keyboard-accessible
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View ${item.dataset.title}`);

    const open = () => openLightbox(item);

    item.addEventListener('click', open);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  // Close triggers
  closeBtn?.addEventListener('click', closeLightbox);
  backdrop?.addEventListener('click', closeLightbox);

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) {
      closeLightbox();
    }
  });

  /* -- Open -- */
  function openLightbox(item) {
    const title   = item.dataset.title   || '';
    const caption = item.dataset.caption || '';

    // Clone the placeholder visuals
    const sourcePlaceholder = item.querySelector('.gallery__placeholder');
    if (imgWrap && sourcePlaceholder) {
      imgWrap.innerHTML = '';
      const clone = sourcePlaceholder.cloneNode(true);
      clone.classList.add('lightbox__img-placeholder');
      imgWrap.appendChild(clone);

      // Re-run lucide on cloned icons
      if (typeof lucide !== 'undefined') {
        lucide.createIcons({ nodes: [imgWrap] });
      }
    }

    if (titleEl)   titleEl.textContent   = title;
    if (captionEl) captionEl.textContent = caption;

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    setTimeout(() => closeBtn?.focus(), 50);
  }

  /* -- Close -- */
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
}

/* ============================================================
   7. REGISTRATION FORM — Validation & Submission
============================================================ */
function initRegistrationForm() {
  const form       = document.getElementById('regForm');
  const formCard   = document.getElementById('formCard');
  const formSuccess= document.getElementById('formSuccess');
  const resetBtn   = document.getElementById('resetFormBtn');
  const submitBtn  = document.getElementById('submitBtn');

  if (!form) return;

  // Real-time validation on blur
  const fields = ['fullName', 'email', 'courseYear', 'eventSelect'];
  fields.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('blur', () => validateField(id));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) validateField(id);
      });
    }
  });

  // Checkbox real-time
  const agreeCheckbox = document.getElementById('agreeTerms');
  agreeCheckbox?.addEventListener('change', () => validateField('agreeTerms'));

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const valid = validateAll();
    if (!valid) return;

    // Simulate async submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
      Submitting…
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      showSuccess();
    }, 1400);
  });

  // Reset
  resetBtn?.addEventListener('click', () => {
    form.reset();
    clearAllErrors();
    formSuccess.hidden = true;
    form.hidden = false;
    form.querySelector('.form-input')?.focus();
  });

  /* -- Field Validators -- */
  function validateField(id) {
    switch (id) {
      case 'fullName':    return validateFullName();
      case 'email':       return validateEmail();
      case 'courseYear':  return validateSelect('courseYear',  'courseYearError',  'Please select your course and year.');
      case 'eventSelect': return validateSelect('eventSelect', 'eventSelectError', 'Please select an event to join.');
      case 'agreeTerms':  return validateCheckbox();
      default: return true;
    }
  }

  function validateAll() {
    const r1 = validateFullName();
    const r2 = validateEmail();
    const r3 = validateSelect('courseYear',  'courseYearError',  'Please select your course and year.');
    const r4 = validateSelect('eventSelect', 'eventSelectError', 'Please select an event to join.');
    const r5 = validateCheckbox();
    return r1 && r2 && r3 && r4 && r5;
  }

  function validateFullName() {
    const input = document.getElementById('fullName');
    const error = document.getElementById('fullNameError');
    const value = input.value.trim();

    if (!value) {
      setError(input, error, 'Full name is required.');
      return false;
    }
    if (value.length < 3) {
      setError(input, error, 'Name must be at least 3 characters.');
      return false;
    }
    if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(value)) {
      setError(input, error, 'Name may only contain letters, spaces, and hyphens.');
      return false;
    }
    clearError(input, error);
    return true;
  }

  function validateEmail() {
    const input = document.getElementById('email');
    const error = document.getElementById('emailError');
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
      setError(input, error, 'Email address is required.');
      return false;
    }
    if (!emailRegex.test(value)) {
      setError(input, error, 'Please enter a valid email address.');
      return false;
    }
    clearError(input, error);
    return true;
  }

  function validateSelect(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (!input.value) {
      setError(input, error, msg);
      return false;
    }
    clearError(input, error);
    return true;
  }

  function validateCheckbox() {
    const input = document.getElementById('agreeTerms');
    const error = document.getElementById('agreeTermsError');
    if (!input.checked) {
      error.textContent = 'You must agree to the event guidelines to continue.';
      return false;
    }
    error.textContent = '';
    return true;
  }

  /* -- Error Helpers -- */
  function setError(input, errorEl, message) {
    input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(input, errorEl) {
    input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  }

  function clearAllErrors() {
    document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  }

  /* -- Show Success -- */
  function showSuccess() {
    form.hidden = true;
    formSuccess.hidden = false;

    // Re-initialize Lucide on dynamically shown elements
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Scroll form card into view
    formCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* ============================================================
   8. MISC — Spin animation for submit button
============================================================ */
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  .spin-icon {
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinStyle);