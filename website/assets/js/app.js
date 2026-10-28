/* =========================================================
   SHADEO core: layout, cart, product cards, search, pop-ups.
   Loaded on every page after data.js and frames.js.
   ========================================================= */
(function () {
  'use strict';

  const CFG = window.SHADEO_CONFIG;
  const PRODUCTS = window.SHADEO_PRODUCTS;
  const LENSES = window.SHADEO_LENSES;
  const Art = window.ShadeoArt;
  const icon = Art.icon;

  /* ---------- Utilities ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const money = (n) => `Tk ${Math.round(n).toLocaleString('en-IN')}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked */ } },
  };
  const byHandle = (h) => PRODUCTS.find((p) => p.handle === h);
  const isFrame = (p) => p && p.type !== 'Accessories';
  const waLink = (msg) => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg || 'Hi SHADEO! I have a question.')}`;
  const params = new URLSearchParams(location.search);

  // Product photo as an <img>. Pass cls to style it, eager for above-the-fold images.
  function productArt(p, colorIndex = 0, label = true, cls = '', eager = false) {
    const c = p.colors[colorIndex] || p.colors[0];
    const alt = label ? `${p.name} ${p.style} in ${c.name}` : '';
    return `<img src="${p.image}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''} loading="${eager ? 'eager' : 'lazy'}" decoding="async" width="880" height="1100">`;
  }
  const photo = (src, alt, cls = '', eager = false) => `<img src="${src}" alt="${esc(alt || '')}"${cls ? ` class="${cls}"` : ''} loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;

  // Lens options shown for a product (blue-light frames already include the filter)
  function lensOptions(p) {
    if (!p.tags.includes('lens-selector')) return [];
    if (p.includedLens) {
      const included = LENSES.find((l) => l.id === p.includedLens);
      return [
        { ...included, price: 0, name: `${included.name} (included)` },
        ...LENSES.filter((l) => l.id === 'svbl').map((l) => ({ ...l, price: l.price - included.price })),
      ];
    }
    return LENSES;
  }

  /* ---------- Delivery dates (Friday is the weekend) ---------- */
  function addDays(start, days) {
    const d = new Date(start);
    let added = 0;
    while (added < days) { d.setDate(d.getDate() + 1); if (d.getDay() !== 5) added++; }
    return d;
  }
  const fmtDate = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  function eta(range) {
    const now = new Date();
    if (now.getHours() >= CFG.cutoffHour) now.setDate(now.getDate() + 1);
    const a = fmtDate(addDays(now, range[0]));
    const b = fmtDate(addDays(now, range[1]));
    return a === b ? a : `${a} – ${b}`;
  }

  /* ---------- Cart ---------- */
  const Cart = {
    items: store.get('shadeo_cart', []),
    save() { store.set('shadeo_cart', this.items); renderCart(); updateCount(); },
    add(item) {
      const key = [item.handle, item.color, item.lens, JSON.stringify(item.rx || '')].join('|');
      const found = this.items.find((i) => i.key === key);
      if (found) found.qty += item.qty; else this.items.push({ ...item, key });
      this.save();
    },
    setQty(key, qty) {
      const it = this.items.find((i) => i.key === key);
      if (!it) return;
      it.qty = Math.max(0, Math.min(10, qty));
      if (!it.qty) this.items = this.items.filter((i) => i.key !== key);
      this.save();
    },
    remove(key) { this.items = this.items.filter((i) => i.key !== key); this.save(); },
    clear() { this.items = []; this.save(); },
    count() { return this.items.reduce((s, i) => s + i.qty, 0); },
    lines() {
      return this.items.map((i) => {
        const p = byHandle(i.handle);
        if (!p) return null;
        const lens = lensOptions(p).find((l) => l.id === i.lens);
        const lensPrice = lens ? lens.price : 0;
        return { ...i, product: p, lensObj: lens, unit: p.price + lensPrice, lineTotal: (p.price + lensPrice) * i.qty };
      }).filter(Boolean);
    },
    /** Totals with the best available discount (bundle or code; they don't stack). */
    totals(code, area) {
      const lines = this.lines();
      const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
      const frameQty = lines.filter((l) => isFrame(l.product)).reduce((s, l) => s + l.qty, 0);
      const frameValue = lines.filter((l) => isFrame(l.product)).reduce((s, l) => s + l.product.price * l.qty, 0);
      const bundle = frameQty >= CFG.bundle.minFrames ? Math.round(frameValue * CFG.bundle.percent / 100) : 0;
      const codeInfo = code && CFG.codes[code];
      const codeAmt = codeInfo ? Math.round(subtotal * codeInfo.percent / 100) : 0;
      let discount = 0; let discountLabel = '';
      if (bundle >= codeAmt && bundle > 0) { discount = bundle; discountLabel = `Buy 2, get ${CFG.bundle.percent}% off frames`; }
      else if (codeAmt > 0) { discount = codeAmt; discountLabel = `${code} (${codeInfo.label})`; }
      const afterDiscount = subtotal - discount;
      const free = afterDiscount >= CFG.freeShippingOver;
      const shipping = !lines.length || free ? 0 : (area === 'outside' ? CFG.shipping.outside : area === 'inside' ? CFG.shipping.inside : null);
      return { lines, subtotal, discount, discountLabel, afterDiscount, free, shipping, total: afterDiscount + (shipping || 0), frameQty, codeValid: !!codeInfo, bundle, codeAmt };
    },
  };

  /* ---------- Product card ---------- */
  function badges(p) {
    let b = '';
    if (p.stock === 0) b += '<span class="badge badge--soldout">Sold out</span>';
    if (p.compare && p.compare > p.price) b += `<span class="badge badge--sale">-${Math.round((1 - p.price / p.compare) * 100)}%</span>`;
    if (p.tags.includes('new')) b += '<span class="badge badge--new">New</span>';
    if (p.tags.includes('bestseller')) b += '<span class="badge">Bestseller</span>';
    if (p.tags.includes('polarized')) b += '<span class="badge badge--polarized">Polarized</span>';
    return b;
  }

  function priceHTML(p) {
    if (p.compare && p.compare > p.price) return `<span class="price price--sale">${money(p.price)}<s>${money(p.compare)}</s></span>`;
    return `<span class="price">${money(p.price)}</span>`;
  }

  function card(p) {
    const url = `product.html?p=${p.handle}`;
    const needsOptions = p.tags.includes('lens-selector');
    return `
      <article class="card" data-handle="${p.handle}">
        <div class="card__media">
          <div class="card__badges">${badges(p)}</div>
          ${productArt(p, 0, true, 'card__img card__img--main')}
          ${p.stock === 0 ? '' : `<button type="button" class="card__quick" data-quick="${p.handle}" aria-label="${needsOptions ? 'Choose lenses for' : 'Add to cart:'} ${esc(p.name)}">${needsOptions ? 'Choose lenses' : 'Add to bag'}</button>`}
        </div>
        <div class="card__info">
          <a class="card__title" href="${url}">${esc(p.name)}</a>
          <span class="card__sub">${esc(p.style)} · ${esc(p.colors[0].name)}</span>
          <div class="card__row">${priceHTML(p)}</div>
        </div>
      </article>`;
  }

  function renderGrid(container, products) {
    container.innerHTML = products.map((p) => `<li>${card(p)}</li>`).join('');
  }

  // Quick add from a product card (frames with lens options go to the product page instead)
  document.addEventListener('click', (e) => {
    const quick = e.target.closest('[data-quick]');
    if (!quick) return;
    e.preventDefault();
    const p = byHandle(quick.dataset.quick);
    if (p.tags.includes('lens-selector')) { location.href = `product.html?p=${p.handle}`; return; }
    Cart.add({ handle: p.handle, color: p.colors[0].name, lens: 'none', rx: null, qty: 1 });
    openCart();
  });

  /* ---------- Layout: announcement, header, footer ---------- */
  const shapeLinks = (cat) => window.SHADEO_SHAPES.filter((s) => s.id !== 'shield')
    .map((s) => `<li><a href="shop.html?c=${cat}&shape=${s.id}">${Art.outline(s.id)}${s.label}</a></li>`).join('');

  const megaMenu = (cat, links, feature1, feature2) => `
    <div class="mega"><div class="mega__inner">
      <div><p class="mega__title">Shop</p><ul class="mega__links">${links}</ul></div>
      <div><p class="mega__title">By shape</p><ul class="mega__links mega__shapes">${shapeLinks(cat)}</ul></div>
      <a class="mega__feature" href="${feature1.href}">${photo(feature1.img, feature1.label)}<span>${feature1.label}</span></a>
      <a class="mega__feature" href="${feature2.href}">${photo(feature2.img, feature2.label)}<span>${feature2.label}</span></a>
    </div></div>`;

  function headerHTML() {
    const page = document.body.dataset.page;
    const cat = params.get('c');
    const cur = (c) => (page === 'shop' && cat === c ? ' aria-current="page"' : '');
    const IMG = 'assets/img/';
    return `
      <a class="skip-link" href="#main">Skip to content</a>
      <div class="announcement" role="region" aria-label="Announcements">
        <div class="announcement__item is-active"><a href="shop.html?c=all">Complimentary delivery on orders over Tk 3,000 · Cash on Delivery</a></div>
        <div class="announcement__item"><a href="shop.html?c=all">Buy 2 frames, get 15% off · Mix &amp; match</a></div>
        <div class="announcement__item"><a href="shop.html?c=kids">New: the Kids collection is here</a></div>
      </div>
      <header class="header" id="header">
        <div class="page-width header__inner">
          <div class="header__left">
            <button class="icon-btn menu-toggle" type="button" data-open="menu" aria-label="Open menu">${icon('menu')}</button>
            <nav class="nav" aria-label="Main">
              <ul class="nav__list">
                <li class="nav__item">
                  <a class="nav__link" href="shop.html?c=women"${cur('women')}>Women</a>
                  ${megaMenu('women', `
                    <li><a href="shop.html?c=women">All women</a></li>
                    <li><a href="shop.html?c=sunglasses">Sunglasses</a></li>
                    <li><a href="shop.html?c=eyeglasses">Eyeglasses</a></li>
                    <li><a href="shop.html?c=blue-light">Blue light</a></li>
                    <li><a href="shop.html?c=new">New arrivals</a></li>`,
                    { href: 'shop.html?c=women&shape=cat-eye', img: IMG + 'people/women-cat-eye.jpg', label: 'The cat eye edit' },
                    { href: 'shop.html?c=eyeglasses', img: IMG + 'people/women-eyeglasses.jpg', label: 'Optical frames' })}
                </li>
                <li class="nav__item">
                  <a class="nav__link" href="shop.html?c=men"${cur('men')}>Men</a>
                  ${megaMenu('men', `
                    <li><a href="shop.html?c=men">All men</a></li>
                    <li><a href="shop.html?c=polarized">Polarized</a></li>
                    <li><a href="shop.html?c=eyeglasses">Eyeglasses</a></li>
                    <li><a href="shop.html?c=bestsellers">Bestsellers</a></li>
                    <li><a href="shop.html?c=accessories">Accessories</a></li>`,
                    { href: 'shop.html?c=men&shape=aviator', img: IMG + 'people/men-beach.jpg', label: 'Aviators' },
                    { href: 'shop.html?c=men', img: IMG + 'people/men-jacket.jpg', label: 'Everyday classics' })}
                </li>
                <li class="nav__item"><a class="nav__link" href="shop.html?c=kids"${cur('kids')}>Kids</a></li>
                <li class="nav__item"><a class="nav__link" href="shop.html?c=eyeglasses"${cur('eyeglasses')}>Optical</a></li>
                <li class="nav__item"><a class="nav__link nav__link--sale" href="shop.html?c=sale"${cur('sale')}>Sale</a></li>
              </ul>
            </nav>
          </div>
          <a class="logo" href="index.html" aria-label="SHADEO home">SHADEO<small>EYEWEAR · DHAKA</small></a>
          <div class="header__icons">
            <button class="icon-btn" type="button" data-open="search" aria-label="Search">${icon('search')}</button>
            <a class="icon-btn" href="track-order.html" aria-label="Track order">${icon('box')}</a>
            <button class="icon-btn" type="button" data-open="cart" aria-label="Open bag">${icon('bag')}<span class="cart-count" hidden>0</span></button>
          </div>
        </div>
      </header>

      <div class="search" id="search" role="dialog" aria-modal="true" aria-label="Search">
        <div class="page-width">
          <div class="search__bar">
            ${icon('search')}
            <label class="visually-hidden" for="search-input">Search products</label>
            <input id="search-input" type="search" placeholder="Search frames…" autocomplete="off">
            <button class="icon-btn" type="button" data-close aria-label="Close search">${icon('close')}</button>
          </div>
          <div class="search__suggest">
            <a class="chip" href="shop.html?c=women">Women</a><a class="chip" href="shop.html?c=men">Men</a><a class="chip" href="shop.html?c=kids">Kids</a>
            <a class="chip" href="shop.html?c=polarized">Polarized</a><a class="chip" href="shop.html?c=all&shape=cat-eye">Cat eye</a><a class="chip" href="shop.html?c=blue-light">Blue light</a>
          </div>
          <ul class="search__results grid grid--4" id="search-results" role="list"></ul>
        </div>
      </div>

      <div class="overlay" id="overlay"></div>

      <aside class="drawer drawer--left" id="menu" aria-label="Menu" aria-hidden="true">
        <div class="drawer__head"><a class="logo" href="index.html" style="font-size:1.5rem">SHADEO</a><button class="icon-btn" type="button" data-close aria-label="Close menu">${icon('close')}</button></div>
        <div class="drawer__body">
          <div class="mobile-feature">
            <a href="shop.html?c=women">${photo(IMG + 'people/women-smile.jpg', 'Women')}<span>Women</span></a>
            <a href="shop.html?c=men">${photo(IMG + 'people/men-jacket.jpg', 'Men')}<span>Men</span></a>
            <a href="shop.html?c=kids">${photo(IMG + 'people/kids-girl-green.jpg', 'Kids')}<span>Kids</span></a>
          </div>
          <ul class="mobile-nav">
            <li><details><summary>Sunglasses</summary><ul>
              <li><a href="shop.html?c=sunglasses">All sunglasses</a></li><li><a href="shop.html?c=polarized">Polarized</a></li>
              <li><a href="shop.html?c=new">New arrivals</a></li><li><a href="shop.html?c=bestsellers">Bestsellers</a></li>
            </ul></details></li>
            <li><details><summary>Optical</summary><ul>
              <li><a href="shop.html?c=eyeglasses">All eyeglasses</a></li><li><a href="shop.html?c=blue-light">Blue light</a></li>
              <li><a href="shop.html?c=prescription">Prescription ready</a></li><li><a href="prescription.html">How prescription works</a></li>
            </ul></details></li>
            <li><details><summary>Shop by shape</summary><ul>${window.SHADEO_SHAPES.map((s) => `<li><a href="shop.html?c=all&shape=${s.id}">${s.label}</a></li>`).join('')}</ul></details></li>
            <li><a href="shop.html?c=accessories">Accessories</a></li>
            <li><a class="mobile-nav__sale" href="shop.html?c=sale">Sale</a></li>
          </ul>
          <div class="mobile-extra" style="margin-top:24px">
            <a href="quiz.html">Find your frame</a>
            <a href="face-shapes.html">Face shape guide</a>
            <a href="track-order.html">Track my order</a>
            <a href="faq.html">Help &amp; FAQ</a>
            <a href="contact.html">Contact us</a>
          </div>
        </div>
      </aside>

      <aside class="drawer drawer--right" id="cart" aria-label="Shopping bag" aria-hidden="true">
        <div class="drawer__head"><h2>Your bag <span id="cart-head-count"></span></h2><button class="icon-btn" type="button" data-close aria-label="Close bag">${icon('close')}</button></div>
        <div class="drawer__body" id="cart-body"></div>
        <div class="drawer__foot" id="cart-foot"></div>
      </aside>

      <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  }

  function footerHTML() {
    const year = new Date().getFullYear();
    return `
      <footer class="footer">
        <div class="page-width">
          <div class="footer__grid">
            <div class="footer__brand">
              <a class="logo" href="index.html" style="padding-left:0">SHADEO</a>
              <p>Premium sunglasses and eyeglasses for women, men and kids, at honest prices. Designed in Dhaka. Worn everywhere.</p>
              <div class="socials">
                <a href="${CFG.instagram}" target="_blank" rel="noopener" aria-label="Instagram">IG</a>
                <a href="${CFG.facebook}" target="_blank" rel="noopener" aria-label="Facebook">FB</a>
                <a href="${CFG.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">TT</a>
              </div>
            </div>
            <div><h3>Shop</h3><ul>
              <li><a href="shop.html?c=women">Women</a></li><li><a href="shop.html?c=men">Men</a></li>
              <li><a href="shop.html?c=kids">Kids</a></li><li><a href="shop.html?c=eyeglasses">Optical</a></li>
              <li><a href="shop.html?c=accessories">Accessories</a></li><li><a href="shop.html?c=sale">Sale</a></li></ul></div>
            <div><h3>Help</h3><ul>
              <li><a href="policies.html#shipping">Delivery</a></li><li><a href="policies.html#returns">Returns &amp; exchanges</a></li>
              <li><a href="policies.html#warranty">Warranty</a></li><li><a href="faq.html">FAQ</a></li>
              <li><a href="track-order.html">Track order</a></li><li><a href="contact.html">Contact us</a></li></ul></div>
            <div><h3>SHADEO</h3><ul>
              <li><a href="about.html">Our story</a></li><li><a href="prescription.html">Prescription</a></li>
              <li><a href="face-shapes.html">Face shape guide</a></li><li><a href="quiz.html">Frame quiz</a></li>
              <li><a href="blog.html">Journal</a></li></ul></div>
            <div class="footer__news">
              <h3>The SHADEO letter</h3>
              <p>New collections, private sales and style notes. Plus 10% off your first order.</p>
              <form class="inline-form" data-signup>
                <label class="visually-hidden" for="footer-email">Email or phone</label>
                <input id="footer-email" type="text" placeholder="Email or phone" required>
                <button class="btn" type="submit">Join</button>
              </form>
              <p class="form-success" hidden></p>
            </div>
          </div>
          <div class="footer__bottom">
            <span>© ${year} SHADEO · <a href="policies.html#privacy">Privacy</a> · <a href="policies.html#terms">Terms</a> · Photography: <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span>
            <div class="pay-icons" aria-label="Payment methods"><span>Cash on Delivery</span><span>bKash</span><span>Nagad</span></div>
          </div>
        </div>
      </footer>
      <a class="wa" href="${waLink('')}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">${icon('chat')}<span>Chat with us</span></a>
      <dialog class="modal modal--wide" id="welcome-popup" aria-labelledby="popup-title">
        <div class="popup">
          <div class="popup__visual">${photo('assets/img/people/women-palm.jpg', '', '', true)}</div>
          <div class="popup__content">
            <button class="modal__close" type="button" data-dialog-close aria-label="Close">×</button>
            <p class="eyebrow">Welcome to SHADEO</p>
            <h2 id="popup-title">10% off your first pair</h2>
            <p class="muted">Join the SHADEO letter for new collections and private sales.</p>
            <form data-signup>
              <label class="visually-hidden" for="popup-email">Email or phone</label>
              <input id="popup-email" type="text" placeholder="Email or phone number" required>
              <button class="btn btn--block" type="submit">Unlock 10% off</button>
            </form>
            <p class="form-success" hidden></p>
            <small>One-time use. No spam, unsubscribe anytime.</small>
          </div>
        </div>
      </dialog>`;
  }

  /* ---------- Drawers ---------- */
  let lastFocus = null;
  function openPanel(id) {
    closePanels();
    const el = document.getElementById(id);
    if (!el) return;
    lastFocus = document.activeElement;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    if (id !== 'search') $('#overlay').classList.add('is-open');
    document.body.classList.add('no-scroll');
    const focusTarget = id === 'search' ? $('#search-input') : $('button, a, input', el);
    setTimeout(() => focusTarget && focusTarget.focus(), 60);
  }
  function closePanels() {
    $$('.drawer.is-open, .search.is-open').forEach((el) => { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); });
    const ov = $('#overlay');
    if (ov) ov.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }
  function openCart() { renderCart(); openPanel('cart'); }

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) { e.preventDefault(); opener.dataset.open === 'cart' ? openCart() : openPanel(opener.dataset.open); return; }
    if (e.target.closest('[data-close]') || e.target.id === 'overlay') { closePanels(); return; }
    const dclose = e.target.closest('[data-dialog-close]');
    if (dclose) { dclose.closest('dialog').close(); return; }
    if (e.target.matches('dialog.modal')) e.target.close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanels(); });

  /* ---------- Cart drawer render ---------- */
  function updateCount() {
    const n = Cart.count();
    $$('.cart-count').forEach((el) => { el.textContent = n; el.hidden = n === 0; });
    const head = $('#cart-head-count');
    if (head) head.textContent = n ? `(${n})` : '';
  }

  function lineMeta(l) {
    const parts = [];
    if (l.product.colors.length > 1 || isFrame(l.product)) parts.push(esc(l.color));
    if (l.lensObj && l.lensObj.id !== 'none') parts.push(`Lens: ${esc(l.lensObj.name)}${l.lensObj.price ? ` (+${money(l.lensObj.price)})` : ''}`);
    if (l.rx) parts.push(l.rx.mode === 'whatsapp' ? 'Prescription: via WhatsApp' : `Rx: R ${esc(l.rx.rsph)} / L ${esc(l.rx.lsph)} · PD ${esc(l.rx.pd)}`);
    return parts.join('<br>');
  }

  function renderCart() {
    const body = $('#cart-body');
    const foot = $('#cart-foot');
    if (!body) return;
    const t = Cart.totals(null, null);
    if (!t.lines.length) {
      body.innerHTML = `<div class="cart-empty">${Art.outline('round')}<h3>Your bag is empty</h3><p class="muted">Let's find you something beautiful.</p><a class="btn" href="shop.html?c=bestsellers">Shop bestsellers</a></div>`;
      foot.innerHTML = '';
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    const remaining = CFG.freeShippingOver - t.afterDiscount;
    const pct = Math.min(100, Math.round((t.afterDiscount / CFG.freeShippingOver) * 100));
    const ship = `<div class="ship-bar"><p>${remaining > 0 ? `You're <strong>${money(remaining)}</strong> away from <strong>FREE delivery</strong>` : "Nice! You've unlocked <strong>FREE delivery</strong>"}</p><div class="progress${remaining <= 0 ? ' is-done' : ''}" role="progressbar" aria-label="Progress to free delivery" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div></div>`;
    const hint = t.frameQty === 1 ? `<div class="bundle-hint">${icon('tag')}<span>Add 1 more frame and get <strong>${CFG.bundle.percent}% off</strong> both.</span></div>` : '';
    const items = t.lines.map((l) => `
      <li class="cart-item">
        <a class="cart-item__img" href="product.html?p=${l.handle}">${productArt(l.product, Math.max(0, l.product.colors.findIndex((c) => c.name === l.color)), false)}</a>
        <div>
          <a class="cart-item__title" href="product.html?p=${l.handle}">${esc(l.product.name)} <span class="muted" style="font-family:var(--font-body);text-transform:none;font-size:.78rem">${esc(l.product.style)}</span></a>
          <div class="cart-item__meta">${lineMeta(l)}</div>
          <div class="qty" aria-label="Quantity"><button type="button" data-qty="-1" data-key="${esc(l.key)}" aria-label="Decrease quantity">−</button><span>${l.qty}</span><button type="button" data-qty="1" data-key="${esc(l.key)}" aria-label="Increase quantity">+</button></div>
        </div>
        <div><div class="cart-item__price">${money(l.lineTotal)}</div><button type="button" class="remove" data-remove="${esc(l.key)}">Remove</button></div>
      </li>`).join('');
    const up = byHandle(CFG.upsellHandle);
    const upsell = up && !t.lines.some((l) => l.handle === up.handle)
      ? `<div class="upsell"><p class="upsell__head">Complete your order</p><div class="upsell__item"><div class="upsell__img">${productArt(up, 0, false)}</div><div class="upsell__info"><strong>${esc(up.name)}</strong>${money(up.price)}</div><button type="button" class="btn btn--sm btn--outline" data-upsell="${up.handle}">Add</button></div></div>`
      : '';
    body.innerHTML = ship + hint + `<ul class="cart-items" role="list">${items}</ul>` + upsell;
    foot.innerHTML = `
      <div class="totals">
        <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
        ${t.discount ? `<div class="discount"><span>${esc(t.discountLabel)}</span><span>−${money(t.discount)}</span></div>` : ''}
        <div><span>Delivery</span><span>${t.free ? 'FREE' : 'Calculated at checkout'}</span></div>
        <div class="grand"><span>Total</span><span>${money(t.afterDiscount)}</span></div>
      </div>
      <a class="btn btn--block" href="checkout.html">Checkout · ${money(t.afterDiscount)}</a>
      <p class="cart-note">Cash on Delivery · bKash · Nagad · Cards</p>`;
  }

  document.addEventListener('click', (e) => {
    const q = e.target.closest('[data-qty]');
    if (q) { const it = Cart.items.find((i) => i.key === q.dataset.key); if (it) Cart.setQty(it.key, it.qty + Number(q.dataset.qty)); return; }
    const r = e.target.closest('[data-remove]');
    if (r) { Cart.remove(r.dataset.remove); return; }
    const u = e.target.closest('[data-upsell]');
    if (u) { const p = byHandle(u.dataset.upsell); Cart.add({ handle: p.handle, color: p.colors[0].name, lens: 'none', rx: null, qty: 1 }); toast(`${p.name} added`); }
  });

  /* ---------- Search ---------- */
  function searchProducts(q) {
    const terms = q.toLowerCase().replace(/shades?/g, 'sunglasses').replace(/chash?ma|chosma/g, 'eyeglasses').replace(/computer/g, 'blue').split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return PRODUCTS.filter((p) => {
      const hay = [p.name, p.style, p.type, p.shape, p.material, p.tags.join(' '), p.colors.map((c) => c.name).join(' ')].join(' ').toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }
  document.addEventListener('input', (e) => {
    if (e.target.id !== 'search-input') return;
    const q = e.target.value.trim();
    const res = $('#search-results');
    if (!q) { res.innerHTML = ''; return; }
    const found = searchProducts(q).slice(0, 8);
    res.innerHTML = found.length ? found.map((p) => `<li>${card(p)}</li>`).join('') : `<li style="grid-column:1/-1" class="muted">No frames match "${esc(q)}". Try "aviator", "polarized" or "blue light".</li>`;
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.id === 'search-input' && e.key === 'Enter' && e.target.value.trim()) location.href = `shop.html?c=all&q=${encodeURIComponent(e.target.value.trim())}`;
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  /* ---------- Signup forms + welcome pop-up ---------- */
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-signup]');
    if (!form) return;
    e.preventDefault();
    const value = $('input', form).value.trim();
    const subs = store.get('shadeo_subscribers', []);
    subs.push({ value, at: new Date().toISOString() });
    store.set('shadeo_subscribers', subs);
    store.set('shadeo_popup_done', true);
    const ok = form.parentElement.querySelector('.form-success');
    form.hidden = true;
    if (ok) { ok.hidden = false; ok.innerHTML = 'You\'re in! Use this code at checkout:<br><span class="code">WELCOME10</span>'; }
  });

  function maybePopup() {
    const dlg = $('#welcome-popup');
    if (!dlg || store.get('shadeo_popup_done', false) || document.body.dataset.page === 'checkout') return;
    const show = () => {
      if (store.get('shadeo_popup_done', false) || document.querySelector('dialog[open]')) return;
      store.set('shadeo_popup_done', true);
      if (dlg.showModal) dlg.showModal();
    };
    setTimeout(show, 9000);
  }

  /* ---------- Announcement rotation + hide header on scroll ---------- */
  function initChrome() {
    const items = $$('.announcement__item');
    let i = 0;
    if (items.length > 1) setInterval(() => { items[i].classList.remove('is-active'); i = (i + 1) % items.length; items[i].classList.add('is-active'); }, 4500);

    const header = $('#header');
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-hidden', y > lastY && y > 300 && !document.body.classList.contains('no-scroll'));
      lastY = y;
    }, { passive: true });
  }

  // Carousel arrows (any page)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-scroll]');
    if (!btn) return;
    const track = document.getElementById(btn.getAttribute('aria-controls'));
    if (track) track.scrollBy({ left: (btn.dataset.scroll === 'prev' ? -1 : 1) * track.clientWidth * 0.8, behavior: 'smooth' });
  });

  /* ---------- Boot ---------- */
  function boot() {
    const h = $('#site-header');
    const f = $('#site-footer');
    if (h) h.outerHTML = headerHTML();
    if (f) f.outerHTML = footerHTML();
    updateCount();
    renderCart();
    initChrome();
    maybePopup();
    // Fill any [data-icon] placeholders in page HTML
    $$('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
    $$('[data-outline]').forEach((el) => { el.innerHTML = Art.outline(el.dataset.outline); });
    $$('[data-face]').forEach((el) => { el.innerHTML = Art.face(el.dataset.face); });
    $$('[data-wa]').forEach((el) => { el.href = waLink(el.dataset.wa); });
    $$('[data-cfg]').forEach((el) => { el.textContent = CFG[el.dataset.cfg]; });
    window.Shadeo.ready = true;
    readyQueue.splice(0).forEach((fn) => fn());
    initReveal();
  }

  // Sections marked .reveal fade up gently as they scroll into view
  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
  }

  // Page scripts call Shadeo.onReady(fn) to run after the header/footer exist
  const readyQueue = [];
  function onReady(fn) { if (window.Shadeo.ready) fn(); else readyQueue.push(fn); }

  window.Shadeo = { $, $$, money, esc, store, byHandle, isFrame, productArt, photo, lensOptions, card, renderGrid, priceHTML, badges, Cart, openCart, toast, eta, waLink, params, icon, Art, CFG, PRODUCTS, LENSES, onReady, ready: false };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
