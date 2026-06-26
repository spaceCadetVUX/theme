/* ============================================
   LINNÉ — main.js
============================================ */

/* ---------- Navbar: transparent ↔ filled ---------- */
const navbar = document.getElementById('navbar');

function updateNav() {
  navbar.classList.toggle('filled', window.scrollY > 10);
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();




/* ---------- Mega menu ---------- */
(function () {
  const navbar      = document.getElementById('navbar');
  const menuBtn     = document.getElementById('menuBtn');
  const menuLabel   = document.getElementById('menuLabel');
  const megaWrap    = document.getElementById('megaWrap');
  const megaClose   = document.getElementById('megaClose');
  const megaOverlay = document.getElementById('megaOverlay');
  const cats        = document.querySelectorAll('.mega-cat');
  const imgs        = document.querySelectorAll('.mega-img');

  if (!menuBtn || !megaWrap) return;

  /* Stagger delay tự động theo số lượng danh mục */
  cats.forEach((cat, i) => {
    cat.style.setProperty('--stagger-delay', `${0.07 + i * 0.07}s`);
  });

  let open = false;
  let hoverLocked = false;
  let hoverTimer = null;

  function resetToFirst() {
    cats.forEach(c => c.classList.remove('active'));
    imgs.forEach(i => i.classList.remove('active'));
    if (cats[0]) { cats[0].classList.add('active'); }
    const firstImgId = cats[0] && cats[0].dataset.img;
    if (firstImgId) {
      const firstImg = document.getElementById(firstImgId);
      if (firstImg) firstImg.classList.add('active');
    }
  }

  function openMenu() {
    open = true;
    resetToFirst();
    megaWrap.classList.add('open');
    navbar.classList.add('menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuLabel.textContent = 'Fermer';
    /* Khoá hover trong 480ms — đợi panel animation xong */
    hoverLocked = true;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => { hoverLocked = false; }, 480);
  }

  function closeMenu() {
    open = false;
    hoverLocked = false;
    clearTimeout(hoverTimer);
    megaWrap.classList.remove('open');
    navbar.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuLabel.textContent = 'Menu';
    cats.forEach(c => c.classList.remove('sub-open'));
  }

  menuBtn.addEventListener('click',     () => open ? closeMenu() : openMenu());
  megaClose.addEventListener('click',   closeMenu);
  megaOverlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown',  e => { if (e.key === 'Escape' && open) closeMenu(); });

  /* Image crossfade: hover (desktop) + click (mobile touch) */
  function activateCat(cat) {
    if (hoverLocked) return;
    cats.forEach(c => c.classList.remove('active'));
    imgs.forEach(i => i.classList.remove('active'));
    cat.classList.add('active');
    const img = document.getElementById(cat.dataset.img);
    if (img) img.classList.add('active');
  }

  /* Chặn sub-link click bubble lên mega-cat */
  document.querySelectorAll('.mega-sub').forEach(sub => {
    sub.addEventListener('click', e => e.stopPropagation());
  });

  cats.forEach(cat => {
    cat.addEventListener('mouseenter', () => activateCat(cat));
    cat.addEventListener('click', (e) => {
      if (window.innerWidth <= 640) {
        /* Bỏ qua nếu click từ sub-link bubble lên */
        if (e.target.closest('.mega-cat-subs')) return;
        /* Bỏ qua ghost click trong thời gian animation mở menu */
        if (hoverLocked) return;
        const wasOpen = cat.classList.contains('sub-open');
        cats.forEach(c => c.classList.remove('sub-open'));
        if (!wasOpen) cat.classList.add('sub-open');
      } else {
        activateCat(cat);
      }
    });
  });
}());

/* ---------- Scroll-reveal: cat blocks + section dividers ---------- */
(function () {
  const blockObs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        blockObs.unobserve(e.target);
      }
    }),
    { threshold: 0.06 }
  );

  const dividerObs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        dividerObs.unobserve(e.target);
      }
    }),
    { threshold: 0, rootMargin: '0px 0px -20px 0px' }
  );

  document.querySelectorAll('.cat-block').forEach(el => blockObs.observe(el));
  document.querySelectorAll('.section-divider').forEach(el => dividerObs.observe(el));
}());
