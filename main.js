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

/* ---------- Float: random inject + continuous drift ---------- */
(function () {
  const section = document.getElementById('floatSection');
  if (!section) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Pool 16 ảnh fashion/linen */
  const POOL = [
    'photo-1539109136881-3be0616acf4b',
    'photo-1558618666-fcd25c85cd64',
    'photo-1434389677669-e08b4cac3105',
    'photo-1469334031218-e382a71b716b',
    'photo-1512436991641-6745cdb1723f',
    'photo-1485230895905-ec40ba36b9bc',
    'photo-1564584217132-2271feaeb3c5',
    'photo-1551232864-3f0890e1776f',
    'photo-1583496661160-fb5218e41f8c',
    'photo-1509631179647-0177331693ae',
    'photo-1548036328-c9fa89d128fa',
    'photo-1553062407-98eeb64c6a62',
    'photo-1515886657613-9f3515b0c78f',
    'photo-1594938298603-c8148c4b4a9c',
    'photo-1490481651871-ab68de25d43d',
    'photo-1558769132-cb1aea458c5e',
  ];

  /* Grid responsive theo breakpoint */
  const vw = window.innerWidth;
  const COLS = vw <= 640 ? 3 : vw <= 1024 ? 4 : 6;
  const ROWS = vw <= 640 ? 6 : vw <= 1024 ? 7 : 8;
  const COUNT = COLS * ROWS;

  /* Size ảnh theo màn hình */
  const IMG_MIN = vw <= 640 ? 46 : vw <= 1024 ? 58 : 66;
  const IMG_MAX = vw <= 640 ? 78 : vw <= 1024 ? 94 : 114;

  const shuffled = POOL.slice().sort(() => Math.random() - 0.5);

  const frag    = document.createDocumentFragment();
  const topPcts = [];

  const cellW    = 88 / COLS;
  const topRange = 140;
  const cellH    = topRange / ROWS;

  for (let i = 0; i < COUNT; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);

    const el  = document.createElement('div');
    el.className = 'float-img';

    const w   = IMG_MIN + Math.random() * (IMG_MAX - IMG_MIN);
    const h   = w;
    const lft = col * cellW + Math.random() * (cellW - 8) + 2;
    const top = -20 + row * cellH + Math.random() * (cellH - 5) + 2;
    const spd = 0.06 + Math.random() * 0.18;

    topPcts.push(top);
    el.dataset.speed = spd.toFixed(3);
    el.dataset.rot   = '0';
    el.style.cssText =
      `width:${w|0}px;height:${h|0}px;` +
      `left:${lft.toFixed(1)}%;top:${top.toFixed(1)}%;` +
      `background-image:url('https://images.unsplash.com/${shuffled[i % shuffled.length]}?auto=format&fit=crop&w=300&q=75');`;

    frag.appendChild(el);
  }
  section.insertBefore(frag, section.firstChild);

  const imgs      = [...section.querySelectorAll('.float-img')];
  const pos       = imgs.map(() => 0);
  const mults     = imgs.map(img => Math.abs(parseFloat(img.dataset.speed)));
  const rots      = imgs.map(img => parseFloat(img.dataset.rot));
  const imgHeights = imgs.map(img => img.offsetHeight);

  /* Tính initial top px để tính wrap boundary */
  let sH        = section.offsetHeight;
  let initTops  = topPcts.map(pct => pct / 100 * sH);

  window.addEventListener('resize', () => {
    sH = section.offsetHeight;
    initTops = topPcts.map(pct => pct / 100 * sH);
  }, { passive: true });

  const BASE    = 0.3;
  let dir       = 1;
  let target    = BASE;
  let current   = 0;
  let lastY     = window.scrollY;
  let idleTimer = null;

  imgs.forEach((img, i) => {
    img.style.transform = `translateY(0px) rotate(${rots[i]}deg)`;
  });

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const d = y - lastY;
    if (Math.abs(d) > 0.5) {
      dir    = d > 0 ? -1 : 1;
      target = dir * (BASE + Math.abs(d) * 0.07);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { target = dir * BASE; }, 150);
    }
    lastY = y;
  }, { passive: true });

  const FADE = 0.18; /* zone fade = 18% đầu và cuối section */

  (function tick() {
    current += (target - current) * 0.05;

    imgs.forEach((img, i) => {
      pos[i] += current * mults[i] * 22;

      const absY  = initTops[i] + pos[i];
      const imgH  = imgHeights[i];
      const cycle = sH + imgH + 200;

      /* Seamless wrap khi ảnh ra ngoài (opacity=0 lúc này nên vô hình) */
      if (absY >  sH + imgH + 100) pos[i] -= cycle;
      if (absY < -imgH - 100)      pos[i] += cycle;

      /* Zone-based opacity + scale: mờ+nhỏ ở top/bottom, rõ+to ở center */
      const normY = (initTops[i] + pos[i] + imgH * 0.5) / sH;
      let alpha, scale;

      if (normY <= 0 || normY >= 1) {
        alpha = 0; scale = 0.8;
      } else if (normY < FADE) {
        const t = normY / FADE;
        alpha = t; scale = 0.8 + 0.2 * t;
      } else if (normY > 1 - FADE) {
        const t = (1 - normY) / FADE;
        alpha = t; scale = 0.8 + 0.2 * t;
      } else {
        alpha = 1; scale = 1;
      }

      img.style.opacity   = alpha.toFixed(3);
      img.style.transform = `translateY(${pos[i]}px) scale(${scale.toFixed(3)})`;
    });

    requestAnimationFrame(tick);
  }());
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
  document.querySelectorAll('.brand-stmt-body, .brand-stmt-cta').forEach(el => blockObs.observe(el));
}());
