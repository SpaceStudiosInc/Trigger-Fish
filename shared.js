/* ── TRIGGERFISH · shared.js ── */
'use strict';

let TYPES = {};
let PRODUCTS = [];

// ── HELPERS ──
function typeLabel(t) { return TYPES[t]?.label || t; }

// ── NAV SCROLL ──
window.addEventListener('scroll', () => {
  document.getElementById('nav')?.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── EXPANDED CARD ──
let _imgs = [], _imgIdx = 0;
const isMobile = () => window.innerWidth <= 700;

function openXCard(p, imgs) {
  _imgs = imgs || []; _imgIdx = 0;

  if (isMobile()) {
    document.getElementById('xcardGallery').style.display = 'none';
    document.getElementById('xcardInfo').style.display   = 'none';
    document.getElementById('xcardMobile').style.display = 'flex';

    document.getElementById('xcardOvType').textContent  = typeLabel(p.type);
    document.getElementById('xcardOvName').textContent  = p.name;
    document.getElementById('xcardOvPrice').textContent = p.price;
    document.getElementById('xcardOvDesc').textContent  = p.desc;
    document.getElementById('xcardOvBuy').href          = p.url;

    const swiper = document.getElementById('xcardSwiper');
    swiper.innerHTML = '';
    (_imgs.length ? _imgs : ['']).forEach(src => {
      const slide = document.createElement('div');
      slide.className = 'xcard__swiper-slide';
      if (src) { const img = document.createElement('img'); img.src = src; img.alt = ''; slide.appendChild(img); }
      swiper.appendChild(slide);
    });

    const dotsEl = document.getElementById('xcardDots');
    dotsEl.innerHTML = '';
    if (_imgs.length > 1) {
      _imgs.forEach((_, i) => {
        const d = document.createElement('span');
        d.className = 'xcard__dot' + (i === 0 ? ' active' : '');
        dotsEl.appendChild(d);
      });
      dotsEl.style.display = 'flex';
      let t;
      swiper.addEventListener('scroll', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          _imgIdx = Math.round(swiper.scrollLeft / swiper.offsetWidth);
          dotsEl.querySelectorAll('.xcard__dot').forEach((d, i) => d.classList.toggle('active', i === _imgIdx));
        }, 50);
      }, { passive: true });
    } else { dotsEl.style.display = 'none'; }

  } else {
    document.getElementById('xcardGallery').style.display = '';
    document.getElementById('xcardInfo').style.display   = '';
    document.getElementById('xcardMobile').style.display = 'none';

    document.getElementById('xcardType').textContent  = typeLabel(p.type);
    document.getElementById('xcardName').textContent  = p.name;
    document.getElementById('xcardPrice').textContent = p.price;
    document.getElementById('xcardDesc').textContent  = p.desc;
    document.getElementById('xcardBuy').href          = p.url;
    setMainImg(0);

    const thumbsEl = document.getElementById('xcardThumbs');
    thumbsEl.innerHTML = '';
    if (_imgs.length > 1) {
      thumbsEl.style.display = 'flex';
      _imgs.forEach((src, i) => {
        const t = document.createElement('div');
        t.className = 'xcard__thumb' + (i === 0 ? ' active' : '');
        t.innerHTML = `<img src="${src}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'"/>`;
        t.addEventListener('click', e => { e.stopPropagation(); setMainImg(i); });
        thumbsEl.appendChild(t);
      });
    } else { thumbsEl.style.display = 'none'; }
  }

  document.getElementById('xcardBg').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function setMainImg(i) {
  _imgIdx = i;
  const el = document.getElementById('xcardMainImg');
  el.style.opacity = '0';
  setTimeout(() => { el.src = _imgs[i] || ''; el.style.opacity = '1'; }, 150);
  document.querySelectorAll('.xcard__thumb').forEach((t, j) => t.classList.toggle('active', j === i));
}

function closeXCard() {
  document.getElementById('xcardBg').classList.remove('open');
  document.body.style.overflow = '';
}

// ── GRID ──
function buildGrid(id, products) {
  const g = document.getElementById(id);
  if (!g) return;
  g.innerHTML = '';
  (products || []).forEach((p, i) => {
    const imgs = (p.imgs || []).filter(Boolean);
    const cover = imgs[0] || '';
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="card__img${!cover ? ' card__img--missing' : ''}">
        ${cover ? `<img src="${cover}" alt="${p.name}" loading="lazy" onerror="this.closest('.card__img').classList.add('card__img--missing');this.style.display='none'"/>` : ''}
        <div class="card__missing-msg">No image found.<br/><em>${p.id}/</em></div>
        <div class="card__hover-hint"><span>View Details</span></div>
        <span class="card__chip">${typeLabel(p.type)}</span>
        ${p.new ? `<span class="card__new-badge">New</span>` : ''}
      </div>
      <div class="card__info">
        <h3 class="card__name">${p.name}</h3>
        <div class="card__foot">
          <span class="card__price">${p.price}</span>
          <span class="card__cta">Tap to explore</span>
        </div>
      </div>`;
    card.addEventListener('click', () => openXCard(p, imgs));
    g.appendChild(card);
  });
}

// ── LOAD PRODUCTS ──
async function loadProducts() {
  try {
    const data = await fetch('products.json').then(r => r.json());
    TYPES    = data.types    || {};
    PRODUCTS = data.products || [];
  } catch(e) { console.error('Failed to load products.json', e); }
}

// ── INIT HAMBURGER ──
function initHamburger() {
  const btn    = document.getElementById('navHamburger');
  const drawer = document.getElementById('navDrawer');
  if (!btn || !drawer) return;

  const page = location.pathname.split('/').pop() || 'index.html';
  drawer.querySelectorAll('.nav__drawer-link').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  function openMenu() {
    btn.classList.add('open');
    drawer.classList.add('open');
    document.body.classList.add('menu-open');
  }
  function closeMenu() {
    btn.classList.remove('open');
    drawer.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  btn.addEventListener('click', () => {
    btn.classList.contains('open') ? closeMenu() : openMenu();
  });

  // close on link tap
  drawer.querySelectorAll('.nav__drawer-link').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // close on escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

// ── INIT (call after DOM ready) ──
function initShared() {
  // Nav active link (desktop)
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    a.classList.toggle('active',
      href === page ||
      (page === '' && href === 'index.html') ||
      (page === 'index.html' && href === 'index.html')
    );
  });

  // Hamburger
  initHamburger();

  // Expanded card bindings
  document.getElementById('xcardClose')?.addEventListener('click', e => { e.stopPropagation(); closeXCard(); });
  document.getElementById('xcardBg')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeXCard(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeXCard();
    if (!isMobile() && _imgs.length > 1) {
      if (e.key === 'ArrowRight') setMainImg((_imgIdx + 1) % _imgs.length);
      if (e.key === 'ArrowLeft')  setMainImg((_imgIdx - 1 + _imgs.length) % _imgs.length);
    }
  });

  let touchStartX = 0;
  document.getElementById('xcardMainImg')?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  document.getElementById('xcardMainImg')?.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40 && _imgs.length > 1)
      setMainImg(diff > 0 ? (_imgIdx + 1) % _imgs.length : (_imgIdx - 1 + _imgs.length) % _imgs.length);
  }, { passive: true });

  // Loading overlay (index page only)
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) { overlay.classList.add('fade-out'); setTimeout(() => overlay.remove(), 700); }
}
