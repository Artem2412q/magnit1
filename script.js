(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const intro = $('#intro');
  const unlock = () => document.body.classList.remove('is-locked');
  let introFinished = false;

  const finishIntro = () => {
    if (introFinished) return;
    introFinished = true;

    if (!intro) {
      unlock();
      return;
    }

    intro.classList.add('intro--out');
    window.setTimeout(() => {
      intro.remove();
      unlock();
    }, reduceMotion ? 0 : 560);
  };

  if (intro) {
    intro.addEventListener('click', finishIntro, { once: true });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        finishIntro();
      }
    });

    window.setTimeout(finishIntro, reduceMotion ? 0 : 2100);
  } else {
    unlock();
  }

  const navToggle = $('.navToggle');
  const mobileMenu = $('#mobileMenu');

  const setMenuOpen = (open) => {
    if (!navToggle || !mobileMenu) return;

    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('is-locked', open);
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      setMenuOpen(!isOpen);
    });

    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) setMenuOpen(false);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) setMenuOpen(false);
    });
  }

  const header = $('#topbar');
  const headerH = () => (header ? header.getBoundingClientRect().height : 0);

  const smoothToId = (id) => {
    const target = document.getElementById(id);
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.scrollY - headerH() - 14;
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? 'auto' : 'smooth' });

    if (history.replaceState) {
      history.replaceState(null, '', `#${id}`);
    }
  };

  $$('[data-nav]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('#')) return;

      const id = href.slice(1);
      if (!id) return;

      e.preventDefault();
      setMenuOpen(false);
      smoothToId(id);
    });
  });

  const revealEls = $$('[data-reveal]');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      revealEls.forEach((el, index) => {
        el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
        io.observe(el);
      });
    }
  }

  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    let raf = 0;

    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;

      parallaxEls.forEach((el) => {
        const k = Number(el.getAttribute('data-parallax')) || 0;
        const r = el.getBoundingClientRect();
        const inView = r.bottom > 0 && r.top < vh;

        if (!inView) {
          el.style.transform = '';
          return;
        }

        const center = r.top + r.height / 2;
        const offset = (center - vh / 2) / (vh / 2);
        const ty = -offset * 18 * k * 6;
        el.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`;
      });
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    tick();
  }
})();
