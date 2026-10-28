/* Product page: gallery, colors, lens selector, prescription, add to cart */
Shadeo.onReady(() => {
  const { $, $$, byHandle, productArt, lensOptions, money, esc, badges, Cart, openCart, eta, waLink, params, icon, Art, CFG, PRODUCTS, renderGrid, isFrame } = Shadeo;
  const root = $('#product-root');
  const p = byHandle(params.get('p'));

  if (!p) {
    root.innerHTML = `<div class="notfound">${Art.outline('round')}<h1>Frame not found</h1><p class="muted">This product doesn't exist or was moved.</p><a class="btn" href="shop.html?c=all">Shop all frames</a></div>`;
    document.title = 'Not found – SHADEO';
    return;
  }

  const lenses = lensOptions(p);
  const state = {
    color: Math.max(0, Math.min(p.colors.length - 1, Number(params.get('color')) || 0)),
    lens: lenses.length ? lenses[0].id : 'none',
    rxMode: 'whatsapp',
    qty: 1,
    view: 0,
  };

  document.title = `${p.name} ${p.style} – SHADEO`;
  const meta = $('meta[name="description"]');
  if (meta) meta.content = `${p.tagline} ${money(p.price)}. Cash on Delivery across Bangladesh.`;
  const wa = $('.wa');
  if (wa) wa.href = waLink(`Hi SHADEO! I have a question about the ${p.name} ${p.style}.`);

  const VIEWS = isFrame(p)
    ? [{ bg: 'var(--white)' }, { bg: 'var(--amber-soft)' }, { bg: 'linear-gradient(160deg,#2B2D42,#5C4B6B 60%,#F2A65A)' }, { bg: 'var(--amber)' }]
    : [{ bg: 'var(--white)' }, { bg: 'var(--amber-soft)' }];

  const lensById = (id) => lenses.find((l) => l.id === id);
  const unitPrice = () => p.price + (lensById(state.lens) ? lensById(state.lens).price : 0);
  const sale = p.compare && p.compare > p.price;
  const soldOut = p.stock === 0;

  function galleryHTML() {
    return `
      <div class="gallery">
        <div class="gallery__main" id="gallery-main" style="background:${VIEWS[state.view].bg}" role="button" tabindex="0" aria-label="Zoom image">${productArt(p, state.color)}</div>
        <div class="gallery__thumbs">${VIEWS.map((v, i) => `<button type="button" class="thumb${i === state.view ? ' is-active' : ''}" style="background:${v.bg}" data-view="${i}" aria-label="View ${i + 1}">${productArt(p, state.color, false)}</button>`).join('')}</div>
      </div>`;
  }

  function lensHTML() {
    if (!lenses.length) return '';
    const rows = lenses.map((l) => `
      <label class="lens-opt">
        <input type="radio" name="lens" value="${l.id}"${l.id === state.lens ? ' checked' : ''}>
        <span><strong>${esc(l.name)}</strong><small>${esc(l.note)}</small></span>
        <span class="lens-opt__price">${l.price ? `+${money(l.price)}` : 'Included'}</span>
      </label>`).join('');
    return `
      <div class="opt" id="lens-section">
        <div class="opt__label">Choose your lenses <a class="link" href="prescription.html" style="letter-spacing:0;text-transform:none;font-weight:600">How it works</a></div>
        <fieldset class="lens-opts"><legend class="visually-hidden">Lens type</legend>${rows}</fieldset>
        <div class="rx" id="rx" hidden>
          <p style="font-weight:700;margin:0 0 8px;font-size:.92rem">How would you like to share your prescription?</p>
          <label class="rx__mode"><input type="radio" name="rxmode" value="whatsapp" checked><span>Send a photo of my prescription on WhatsApp after ordering</span></label>
          <label class="rx__mode"><input type="radio" name="rxmode" value="typed"><span>Type it in now</span></label>
          <div id="rx-fields" hidden>
            <table>
              <thead><tr><th scope="col">Eye</th><th scope="col">SPH</th><th scope="col">CYL</th><th scope="col">AXIS</th></tr></thead>
              <tbody>
                <tr><th scope="row">Right (OD)</th>
                  <td><input type="text" inputmode="decimal" id="rsph" placeholder="-1.25" pattern="[+\\-]?\\d{1,2}(\\.\\d{1,2})?" aria-label="Right SPH"></td>
                  <td><input type="text" inputmode="decimal" id="rcyl" placeholder="-0.50" pattern="[+\\-]?\\d{1,2}(\\.\\d{1,2})?" aria-label="Right CYL"></td>
                  <td><input type="number" id="raxis" placeholder="90" min="0" max="180" aria-label="Right AXIS"></td></tr>
                <tr><th scope="row">Left (OS)</th>
                  <td><input type="text" inputmode="decimal" id="lsph" placeholder="-1.00" pattern="[+\\-]?\\d{1,2}(\\.\\d{1,2})?" aria-label="Left SPH"></td>
                  <td><input type="text" inputmode="decimal" id="lcyl" placeholder="-0.25" pattern="[+\\-]?\\d{1,2}(\\.\\d{1,2})?" aria-label="Left CYL"></td>
                  <td><input type="number" id="laxis" placeholder="85" min="0" max="180" aria-label="Left AXIS"></td></tr>
              </tbody>
            </table>
            <label class="rx__pd">PD (pupillary distance) <input type="number" id="pd" placeholder="63" min="45" max="80"></label>
            <p class="rx__help">Don't know your PD? Choose "Send a photo on WhatsApp" and our optician will check everything before your lenses are made.</p>
          </div>
        </div>
      </div>`;
  }

  function specsHTML() {
    if (!p.size) return '';
    const [lw, br, tl, fw] = p.size;
    return `
      <div class="specs">
        <div class="specs__head"><h3>Frame size: ${esc(p.fit)}</h3><button type="button" class="link" id="open-size">Size guide</button></div>
        <ul class="specs__list" role="list">
          <li><strong>${lw} mm</strong><small>Lens</small></li>
          <li><strong>${br ? `${br} mm` : '—'}</strong><small>Bridge</small></li>
          <li><strong>${tl} mm</strong><small>Temple</small></li>
          <li><strong>${fw} mm</strong><small>Frame width</small></li>
        </ul>
        <p class="specs__meta">Material: ${p.material === 'tr90' ? 'TR90 (flexible)' : p.material[0].toUpperCase() + p.material.slice(1)} · Weight: ${p.weight} g</p>
      </div>`;
  }

  function render() {
    const c = p.colors[state.color];
    const lowStock = p.stock > 0 && p.stock <= CFG.lowStockAt;
    const needsRx = lensById(state.lens) && lensById(state.lens).rx;
    const typeCrumb = { Sunglasses: ['sunglasses', 'Sunglasses'], Eyeglasses: ['eyeglasses', 'Eyeglasses'], 'Blue Light Glasses': ['blue-light', 'Blue Light'], Accessories: ['accessories', 'Accessories'] }[p.type];

    root.innerHTML = `
      <nav class="breadcrumbs" aria-label="Breadcrumb" style="padding-top:18px"><a href="index.html">Home</a> / <a href="shop.html?c=${typeCrumb[0]}">${typeCrumb[1]}</a> / <span>${esc(p.name)}</span></nav>
      <div class="product">
        ${galleryHTML()}
        <div class="product__info">
          <div class="card__badges" style="position:static;margin-bottom:12px">${badges(p)}</div>
          <h1>${esc(p.name)} <span style="display:block;font-size:.5em;color:var(--muted)">${esc(p.style)}</span></h1>
          <p class="product__tagline">${esc(p.tagline)}</p>
          <div class="product__price">${money(p.price)}${sale ? `<s>${money(p.compare)}</s><span class="save">Save ${money(p.compare - p.price)}</span>` : ''}</div>
          <p class="product__installment">Pay on delivery, or with bKash, Nagad or card.</p>

          ${p.colors.length > 1 || isFrame(p) ? `
          <div class="opt">
            <div class="opt__label">Color <span>${esc(c.name)}</span></div>
            <div class="color-opts">${p.colors.map((col, i) => `<button type="button" class="color-opt" data-color="${i}" aria-pressed="${i === state.color}" aria-label="${esc(col.name)}"><span style="background:${col.frame};--lens:${col.clear ? '#e9eef3' : col.lens}"></span></button>`).join('')}</div>
          </div>` : ''}

          ${lensHTML()}

          <div class="buy">
            <div class="qty" aria-label="Quantity"><button type="button" data-step="-1" aria-label="Decrease quantity">−</button><span id="qty">${state.qty}</span><button type="button" data-step="1" aria-label="Increase quantity">+</button></div>
            <button class="btn" type="button" id="add-btn"${soldOut ? ' disabled' : ''}>${soldOut ? 'Sold out' : 'Add to cart'}</button>
          </div>
          <p class="total-line" id="total-line"></p>
          ${lowStock ? `<p class="stock">Hurry, only ${p.stock} left in stock</p>` : ''}

          <div class="delivery">
            <div>${icon('truck')}<span>Inside Dhaka: get it <strong id="eta-in"></strong></span></div>
            <div>${icon('clock')}<span>Outside Dhaka: get it <strong id="eta-out"></strong></span></div>
            <div>${icon('return')}<span>7-day easy returns · Cash on Delivery available</span></div>
          </div>

          <div class="trust-mini">
            <div>${icon('sun')}100% UV400</div>
            <div>${icon('shield')}6-month warranty</div>
            <div>${icon('gift')}Free case + cloth</div>
          </div>

          ${specsHTML()}

          <details class="accordion" open><summary>Description</summary><div class="accordion__body"><p>${esc(p.description)}</p><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div></details>
          ${p.size ? `<details class="accordion"><summary>Specifications</summary><div class="accordion__body"><ul>
            <li>Shape: ${esc(p.shape.replace('-', ' '))}</li><li>Fit: ${esc(p.fit)}</li>
            <li>Measurements: ${p.size[0]}□${p.size[1]}-${p.size[2]} (lens–bridge–temple), frame width ${p.size[3]} mm</li>
            <li>Lens protection: 100% UV400 (UVA + UVB)${p.tags.includes('polarized') ? ', polarized' : ''}</li>
            ${p.faces ? `<li>Best for face shapes: ${p.faces.join(', ')}</li>` : ''}</ul></div></details>` : ''}
          <details class="accordion"><summary>Shipping &amp; Returns</summary><div class="accordion__body"><ul>
            <li>Inside Dhaka: 1–2 working days (Tk ${CFG.shipping.inside})</li><li>Outside Dhaka: 2–4 working days (Tk ${CFG.shipping.outside})</li>
            <li>Prescription orders: 5–7 days</li><li><strong>Free delivery on orders over Tk ${CFG.freeShippingOver.toLocaleString('en-IN')}</strong></li>
            <li>Check your parcel before you pay with Cash on Delivery</li><li>7-day returns on unused frames. <a href="policies.html#returns">Full policy</a></li></ul></div></details>
          <details class="accordion"><summary>Care instructions</summary><div class="accordion__body"><ul>
            <li>Clean with the SHADEO cloth or lens spray, never tissues or your T-shirt.</li><li>Rinse with lukewarm water if lenses are sandy or salty.</li>
            <li>Use both hands to put frames on and take them off.</li><li>Store in the case; never leave glasses on a hot car dashboard.</li></ul></div></details>
        </div>
      </div>

      <div class="sticky-atc" id="sticky-atc" aria-hidden="true">
        <div class="sticky-atc__img">${productArt(p, state.color, false)}</div>
        <div class="sticky-atc__info"><strong>${esc(p.name)} ${esc(p.style)}</strong><span id="sticky-price">${money(unitPrice())}</span></div>
        <button class="btn btn--sm" type="button" id="sticky-btn"${soldOut ? ' disabled' : ''}>${soldOut ? 'Sold out' : lenses.length ? 'Choose lenses' : 'Add to cart'}</button>
      </div>`;

    const rx = $('#rx');
    if (rx) {
      rx.hidden = !needsRx;
      $$(`input[name="rxmode"]`).forEach((r) => { r.checked = r.value === state.rxMode; });
      $('#rx-fields').hidden = state.rxMode !== 'typed';
    }
    updateTotals();
    $('#eta-in').textContent = needsRx ? eta(CFG.deliveryDays.prescription) : eta(CFG.deliveryDays.inside);
    $('#eta-out').textContent = needsRx ? eta(CFG.deliveryDays.prescription) : eta(CFG.deliveryDays.outside);
    initSticky();
  }

  function updateTotals() {
    const l = lensById(state.lens);
    const line = $('#total-line');
    if (line) line.innerHTML = l && l.price ? `Frame ${money(p.price)} + lenses ${money(l.price)} = <strong>${money(unitPrice() * state.qty)}</strong>` : state.qty > 1 ? `Total: <strong>${money(unitPrice() * state.qty)}</strong>` : '';
    const sp = $('#sticky-price');
    if (sp) sp.textContent = money(unitPrice());
  }

  // Partial updates keep typed prescription values intact
  function refreshLensUI() {
    const l = lensById(state.lens);
    const needsRx = l && l.rx;
    $('#rx').hidden = !needsRx;
    $('#rx-fields').hidden = state.rxMode !== 'typed';
    $('#eta-in').textContent = needsRx ? eta(CFG.deliveryDays.prescription) : eta(CFG.deliveryDays.inside);
    $('#eta-out').textContent = needsRx ? eta(CFG.deliveryDays.prescription) : eta(CFG.deliveryDays.outside);
    updateTotals();
  }

  function readRx() {
    const l = lensById(state.lens);
    if (!l || !l.rx) return { ok: true, rx: null };
    if (state.rxMode === 'whatsapp') return { ok: true, rx: { mode: 'whatsapp' } };
    const v = (id) => $(`#${id}`).value.trim();
    const fields = ['rsph', 'rcyl', 'raxis', 'lsph', 'lcyl', 'laxis', 'pd'];
    const invalid = fields.find((id) => !$(`#${id}`).checkValidity());
    if (!v('rsph') || !v('lsph') || !v('pd') || invalid) {
      const target = $(`#${invalid || (!v('rsph') ? 'rsph' : !v('lsph') ? 'lsph' : 'pd')}`);
      target.focus();
      Shadeo.toast('Please enter SPH for both eyes and your PD (or choose WhatsApp).');
      return { ok: false };
    }
    return { ok: true, rx: { mode: 'typed', rsph: v('rsph'), rcyl: v('rcyl'), raxis: v('raxis'), lsph: v('lsph'), lcyl: v('lcyl'), laxis: v('laxis'), pd: v('pd') } };
  }

  function addToCart() {
    if (soldOut) return;
    const r = readRx();
    if (!r.ok) return;
    Cart.add({ handle: p.handle, color: p.colors[state.color].name, lens: state.lens, rx: r.rx, qty: state.qty });
    openCart();
  }

  let stickyObserver;
  function initSticky() {
    const bar = $('#sticky-atc');
    const btn = $('#add-btn');
    if (stickyObserver) stickyObserver.disconnect();
    stickyObserver = new IntersectionObserver(([entry]) => {
      const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', String(!show));
      document.body.classList.toggle('has-sticky', show);
    });
    stickyObserver.observe(btn);
  }

  root.addEventListener('click', (e) => {
    const col = e.target.closest('[data-color]');
    if (col) { state.color = Number(col.dataset.color); render(); return; }
    const view = e.target.closest('[data-view]');
    if (view) {
      state.view = Number(view.dataset.view);
      $('#gallery-main').style.background = VIEWS[state.view].bg;
      $$('.thumb').forEach((t) => t.classList.toggle('is-active', t === view));
      return;
    }
    if (e.target.closest('#gallery-main')) { $('#gallery-main').classList.toggle('is-zoomed'); return; }
    const step = e.target.closest('[data-step]');
    if (step) { state.qty = Math.max(1, Math.min(10, state.qty + Number(step.dataset.step))); $('#qty').textContent = state.qty; updateTotals(); return; }
    if (e.target.closest('#add-btn')) { addToCart(); return; }
    if (e.target.closest('#sticky-btn')) {
      if (lenses.length) $('#lens-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
      else addToCart();
      return;
    }
    if (e.target.closest('#open-size')) { $('#size-guide').showModal(); }
  });

  root.addEventListener('keydown', (e) => {
    if (e.target.id === 'gallery-main' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.classList.toggle('is-zoomed'); }
  });

  root.addEventListener('change', (e) => {
    if (e.target.name === 'lens') { state.lens = e.target.value; refreshLensUI(); }
    if (e.target.name === 'rxmode') { state.rxMode = e.target.value; refreshLensUI(); }
  });

  render();

  // Below-the-fold rows
  if (isFrame(p)) {
    const extras = PRODUCTS.filter((x) => x.type === 'Accessories');
    renderGrid($('#complete-grid'), extras);
    $('#complete-look').hidden = false;
  }
  const related = PRODUCTS.filter((x) => x.handle !== p.handle && x.type === p.type)
    .sort((a, b) => (b.shape === p.shape) - (a.shape === p.shape)).slice(0, 4);
  if (related.length) { renderGrid($('#related-grid'), related); $('#related').hidden = false; }
});
