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


/* ---------- Category scroll: arrows + progress bar ---------- */
document.querySelectorAll('.cat-products-row').forEach(row => {
  const track    = row.querySelector('.cat-scroll-track');
  const bar      = row.querySelector('.cat-scroll-bar');
  const prevBtn  = row.querySelector('.js-prev');
  const nextBtn  = row.querySelector('.js-next');

  if (!track) return;

  const STEP = 270; // px per arrow click (~1 card + gap)

  /* Progress bar */
  function updateBar() {
    if (!bar) return;
    const max = track.scrollWidth - track.clientWidth;
    const pct = max > 0 ? (track.scrollLeft / max) * 100 : 0;
    bar.style.width = pct + '%';
  }

  track.addEventListener('scroll', updateBar, { passive: true });
  updateBar(); // initialise

  /* Arrow buttons */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -STEP, behavior: 'smooth' });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: STEP, behavior: 'smooth' });
    });
  }
});
