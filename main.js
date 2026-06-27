/* ============================================
   LINNÉ — main.js
============================================ */

/* smoothCur: lerp'd scroll position — shared giữa các IIFE */
let smoothCur = 0;

/* ---------- Lerp Smooth Scroll ---------- */
(function () {
  /* Tắt trên thiết bị touch (iOS/Android có native momentum rồi) */
  if (window.matchMedia('(pointer: coarse)').matches) return;
  /* Tắt khi user yêu cầu giảm chuyển động */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const wrap = document.getElementById('smooth-wrap');
  if (!wrap) return;

  const LERP = 0.08; /* 8% mỗi frame ≈ 300ms để settle — điều chỉnh để thay đổi độ "nhớt" */
  let cur = 0;       /* vị trí hiển thị hiện tại */
  let tgt = 0;       /* scroll target thực */

  /* Cho html biết tổng chiều cao content → scrollbar đúng kích thước */
  function syncHeight() {
    document.documentElement.style.height = wrap.scrollHeight + 'px';
  }
  syncHeight();
  new ResizeObserver(syncHeight).observe(wrap);  /* cập nhật khi font/ảnh load xong */
  window.addEventListener('resize', syncHeight, { passive: true });

  /* Kích hoạt CSS rules (html.ls-active) — đặt sau syncHeight để đo trước khi layout đổi */
  document.documentElement.classList.add('ls-active');

  window.addEventListener('scroll', () => { tgt = window.scrollY; }, { passive: true });

  (function tick() {
    cur += (tgt - cur) * LERP;
    /* Snap khi gần tới đích — tránh rAF loop chạy vô tận với micro-delta */
    if (Math.abs(tgt - cur) < 0.05) cur = tgt;
    smoothCur = cur; /* expose ra module scope cho các IIFE khác đọc */
    wrap.style.transform = `translateY(${-cur}px)`;
    requestAnimationFrame(tick);
  }());
}());

/* ---------- Hero Logo: shrink on scroll → nav-logo fade in ---------- */
(function () {
  const heroLogoWrap = document.querySelector('.hero-logo-wrap');
  const navLogo      = document.querySelector('.nav-logo');
  if (!heroLogoWrap || !navLogo) return;

  /* Nav logo ẩn lúc đầu — hero logo đang hiện */
  navLogo.style.transition = 'none'; /* tắt CSS transition, JS lo animation */
  navLogo.style.opacity    = '0';

  /* Khoảng scroll để hoàn thành transition: 0 → 40% viewport height */
  const FADE_END = window.innerHeight * 0.40;

  /* Expo-out: nhanh lúc đầu, chậm dần khi settle — feel luxury */
  function expoOut(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function update() {
    const t     = Math.min(1, Math.max(0, window.scrollY / FADE_END));
    const e     = expoOut(t);

    /* Effect B — Blur dissolve:
       opacity tan nhanh, scale thu nhẹ (1→0.93), blur tăng dần (0→12px) */
    heroLogoWrap.style.opacity   = Math.max(0, 1 - e * 1.7).toFixed(4);
    heroLogoWrap.style.transform = `scale(${(1 - e * 0.07).toFixed(4)})`;
    heroLogoWrap.style.filter    = `blur(${(e * 12).toFixed(2)}px)`;

    /* Nav logo fade in sau một chút — tránh overlap lộ liễu */
    navLogo.style.opacity = Math.min(1, Math.max(0, (e - 0.18) * 1.4)).toFixed(4);
  }

  window.addEventListener('scroll', update, { passive: true });
  update(); /* chạy ngay để set trạng thái ban đầu */

  /* Khôi phục transition cho nav logo sau khi JS đã set initial state */
  requestAnimationFrame(() => {
    navLogo.style.transition = '';
  });
}());

/* ---------- Hero Caption: sticky bottom-of-viewport → dock tại đáy hero ---------- */
(function () {
  /* Chỉ chạy khi lerp scroll active (desktop, pointer: fine) */
  if (!document.documentElement.classList.contains('ls-active')) return;

  const hero    = document.getElementById('hero');
  const caption = document.querySelector('.hero-caption');
  if (!hero || !caption) return;

  const MARGIN = 80; /* px từ bottom — đồng bộ với CSS bottom: 80px */

  (function tick() {
    const heroH    = hero.offsetHeight;       /* 130vh trong px */
    const captionH = caption.offsetHeight;

    /* Vị trí tự nhiên: đáy hero - 80px */
    const naturalTop = heroH - captionH - MARGIN;

    /* Vị trí sticky: đáy viewport - 80px, bù trừ theo lerp offset */
    /* Khi smoothCur = 0  → top = viewportH - captionH - 80  (đáy màn hình) */
    /* Khi smoothCur = 30vh → top = naturalTop               (vừa chạm đáy hero) */
    const stickyTop = window.innerHeight - captionH - MARGIN + smoothCur;

    /* Lấy giá trị nhỏ hơn: sticky kéo xuống nhưng không vượt quá đáy hero */
    caption.style.bottom = 'auto';
    caption.style.top    = Math.min(naturalTop, stickyTop) + 'px';

    requestAnimationFrame(tick);
  }());
}());

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

  if (!menuBtn || !megaWrap) return;

  let open = false;

  function openMenu() {
    open = true;
    megaWrap.classList.add('open');
    navbar.classList.add('menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuLabel.textContent = 'Fermer';
  }

  function closeMenu() {
    open = false;
    megaWrap.classList.remove('open');
    navbar.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuLabel.textContent = 'Menu';
    document.querySelectorAll('.mega-group.open').forEach(g => g.classList.remove('open'));
  }

  menuBtn.addEventListener('click',     () => open ? closeMenu() : openMenu());
  megaClose.addEventListener('click',   closeMenu);
  megaOverlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown',  e => { if (e.key === 'Escape' && open) closeMenu(); });

  /* Mobile accordion — group headers */
  document.querySelectorAll('.mega-group-hd').forEach(hd => {
    hd.addEventListener('click', () => {
      if (window.innerWidth > 768) return;
      const group = hd.closest('.mega-group');
      if (!group.querySelector('.mega-group-links')) return;
      const wasOpen = group.classList.contains('open');
      document.querySelectorAll('.mega-group.open').forEach(g => g.classList.remove('open'));
      if (!wasOpen) group.classList.add('open');
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
  const IMG_MIN = vw <= 640 ? 28 : vw <= 1024 ? 58 : 66;
  const IMG_MAX = vw <= 640 ? 48 : vw <= 1024 ? 94 : 114;

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
  document.querySelectorAll('.edit-grid, .feat-product, .shop-section, .dual-edit, .tiktok-section, .journal-section').forEach(el => blockObs.observe(el));
}());

/* ---------- TikTok carousel ---------- */
(function () {
  const section = document.getElementById('tiktokSection');
  if (!section) return;

  const SLIDES = [
    { img: 'https://elleandriley.com/cdn/shop/files/Slim_tee_Pale_Blue.jpg?v=1778216637&width=2160',       brand: 'LINNÉ', name: 'Áo linen cổ chữ V',   price: '660.000 ₫'   },
    { img: 'https://elleandriley.com/cdn/shop/files/Slim_Tee_BrownMelange2.jpg?v=1778217470&width=2160',  brand: 'LINNÉ', name: 'Áo blouse thắt nơ',    price: '720.000 ₫'   },
    { img: 'https://elleandriley.com/cdn/shop/files/Cashmere_Crew_Camel3.jpg?v=1779070696&width=2160',    brand: 'LINNÉ', name: 'Đầm linen cổ chữ V',   price: '1.290.000 ₫' },
    { img: 'https://elleandriley.com/cdn/shop/files/Slim_Tee_BrownMelange.jpg?v=1778217470&width=2160',   brand: 'LINNÉ', name: 'Áo crop linen',         price: '620.000 ₫'   },
    { img: 'https://elleandriley.com/cdn/shop/files/Slim_Tee_Birch.jpg?v=1778217589&width=2160',          brand: 'LINNÉ', name: 'Áo linen oversized',    price: '680.000 ₫'   },
  ];

  const N      = SLIDES.length;
  const CENTER = 2;   // index của DOM item trung tâm trong grid (0-based)
  let   cur    = 2;   // slide index đang active
  let   locked = false;

  const track = section.querySelector('.tiktok-track');
  const items = Array.from(section.querySelectorAll('.tiktok-item'));
  const dots  = Array.from(section.querySelectorAll('.tiktok-dot'));
  const card  = section.querySelector('.tiktok-product-card');
  const thumb = section.querySelector('.tiktok-product-thumb');
  const bEl   = section.querySelector('.tiktok-product-brand');
  const nEl   = section.querySelector('.tiktok-product-name');
  const pEl   = section.querySelector('.tiktok-product-price');

  /* Scale tương ứng với vị trí grid — không đổi suốt vòng đời */
  const SCALES = items.map((_, pos) => pos === CENTER ? 1 : 1.10);

  /* Cập nhật dots + product card (instant, không fade) */
  function syncBottom() {
    dots.forEach((d, i) => d.classList.toggle('tiktok-dot--active', i === cur));
    const s = SLIDES[cur];
    thumb.src       = s.img;
    thumb.alt       = s.name;
    bEl.textContent = s.brand;
    nEl.textContent = s.name;
    pEl.textContent = s.price;
  }

  /* Đồng bộ width của card với center column */
  function syncCardWidth() {
    if (window.innerWidth <= 640 || !card) return;
    card.style.width = items[CENTER].offsetWidth + 'px';
  }

  /* Init — set data-pos + src ngay (không animation) */
  function initData() {
    items.forEach((item, pos) => {
      const idx = ((cur - CENTER + pos) % N + N) % N;
      const s   = SLIDES[idx];
      item.dataset.pos = pos - CENTER;
      const img = item.querySelector('.tiktok-img');
      img.src = s.img;
      img.alt = s.name;
    });
    syncBottom();
  }

  /* Video auto-play — sẵn sàng khi thay <img> bằng <video class="tiktok-video"> */
  function syncVideoPlayback() {
    items.forEach(item => {
      const video = item.querySelector('.tiktok-video');
      if (!video) return;
      parseInt(item.dataset.pos, 10) === 0
        ? video.play().catch(() => {})
        : (video.pause(), (video.currentTime = 0));
    });
  }

  /* Auto-advance */
  let autoTimer = null;
  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(cur + 1), 5000);
  }
  function stopAuto() { clearInterval(autoTimer); }

  /* -------------------------------------------------------
     Navigate — translateX slide, không opacity, không blink
     dir +1 = forward (next), dir -1 = backward (prev)
  ------------------------------------------------------- */
  const OUT_MS = 220;  // tốc độ trượt ra
  const IN_MS  = 300;  // tốc độ trượt vào (hơi chậm hơn cho mượt)

  function goTo(rawIdx) {
    if (locked) return;
    const next = ((rawIdx % N) + N) % N;
    if (next === cur) return;

    const dir = rawIdx > cur ? 1 : -1;
    locked = true;

    // Phase 1: trượt TẤT CẢ ảnh ra ngoài theo hướng dir
    items.forEach((item, pos) => {
      const img = item.querySelector('.tiktok-img');
      img.style.transition = `transform ${OUT_MS}ms linear`;
      img.style.transform  = `scale(${SCALES[pos]}) translateX(${-dir * 105}%)`;
    });

    setTimeout(() => {
      // ảnh đang ngoài viewport — swap src không nhìn thấy
      cur = next;
      items.forEach((item, pos) => {
        const idx = ((cur - CENTER + pos) % N + N) % N;
        const s   = SLIDES[idx];
        const img = item.querySelector('.tiktok-img');
        img.src = s.img;
        img.alt = s.name;
        // đặt sẵn ở phía đối diện, không transition
        img.style.transition = 'none';
        img.style.transform  = `scale(${SCALES[pos]}) translateX(${dir * 105}%)`;
      });

      syncBottom();
      syncVideoPlayback();
      startAuto();

      // Phase 2: trượt vào từ phía đối diện
      requestAnimationFrame(() => requestAnimationFrame(() => {
        items.forEach((item, pos) => {
          const img = item.querySelector('.tiktok-img');
          img.style.transition = `transform ${IN_MS}ms linear`;
          img.style.transform  = `scale(${SCALES[pos]}) translateX(0)`;
        });

        // Dọn inline style — disable CSS transition TRƯỚC khi clear transform
        // để browser không trigger CSS 0.9s ease khi chuyển từ
        // "scale(X) translateX(0)" → "scale(X)" (nếu không sẽ bị dật ngược)
        setTimeout(() => {
          items.forEach(item => {
            const img = item.querySelector('.tiktok-img');
            img.style.transition = 'none'; // freeze: CSS transform áp dụng NGAY, không animate
            img.style.transform  = '';
            // Restore CSS transition sau 2 frame để hover effect hoạt động trở lại
            requestAnimationFrame(() => requestAnimationFrame(() => {
              img.style.transition = '';
            }));
          });
          locked = false;
        }, IN_MS + 20);
      }));
    }, OUT_MS + 8);
  }

  /* --- Events --- */

  /* Arrows */
  section.querySelector('.tiktok-arrow--prev').addEventListener('click', () => goTo(cur - 1));
  section.querySelector('.tiktok-arrow--next').addEventListener('click', () => goTo(cur + 1));

  /* Dots */
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  /* Click side item → navigate đến nó */
  items.forEach(item => {
    item.addEventListener('click', () => {
      const dp = parseInt(item.dataset.pos, 10);
      if (dp !== 0) goTo(cur + dp);
    });
  });

  /* Touch swipe */
  let tx = 0, ty = 0;
  track.addEventListener('touchstart', e => {
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      goTo(dx < 0 ? cur + 1 : cur - 1);
    }
  }, { passive: true });

  /* Mouse drag (desktop) */
  let dragStart = null;
  track.addEventListener('pointerdown', e => { dragStart = e.clientX; });
  track.addEventListener('pointerup', e => {
    if (dragStart === null) return;
    const dx = e.clientX - dragStart;
    dragStart = null;
    if (Math.abs(dx) > 55) goTo(dx < 0 ? cur + 1 : cur - 1);
  });
  track.addEventListener('pointerleave', () => { dragStart = null; });

  /* Keyboard */
  section.setAttribute('tabindex', '-1');
  section.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(cur - 1);
    if (e.key === 'ArrowRight') goTo(cur + 1);
  });

  /* Hover: pause auto-advance */
  section.addEventListener('mouseenter', stopAuto, { passive: true });
  section.addEventListener('mouseleave', startAuto, { passive: true });

  /* --- Init --- */
  initData();
  syncCardWidth();
  startAuto();
  window.addEventListener('resize', syncCardWidth, { passive: true });
}());

/* ---------- Shop tabs ---------- */
(function () {
  const tabs = document.querySelectorAll('.shop-tab');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}());
