/* Checkout: delivery details, payment choice, discount code, order confirmation.
   There is no server, so the order is saved in this browser and the customer
   sends it to the shop on WhatsApp. On Shopify, the real checkout replaces this page. */
Shadeo.onReady(() => {
  const { $, $$, Cart, money, esc, store, productArt, icon, waLink, CFG, params, eta } = Shadeo;
  const root = $('#checkout-root');

  const orderId = params.get('order');
  if (orderId) { renderConfirmation(orderId); return; }

  if (!Cart.lines().length) {
    root.innerHTML = `<div class="confirm"><h1>Your cart is empty</h1><p class="muted">Add some frames first, then come back here.</p><a class="btn" href="shop.html?c=bestsellers">Shop bestsellers</a></div>`;
    return;
  }

  const state = { area: 'inside', pay: 'cod', code: store.get('shadeo_code', '') };

  root.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb" style="padding-top:18px"><a href="index.html">Home</a> / <a href="#" data-open="cart">Cart</a> / <span>Checkout</span></nav>
    <div class="checkout">
      <form class="form" id="checkout-form" novalidate>
        <h1 style="font-size:clamp(1.8rem,4vw,2.6rem);margin:0">Checkout</h1>

        <h2>Contact</h2>
        <div class="form-row form-row--2">
          <div class="field"><label for="phone">Mobile number *</label><input id="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="01XXXXXXXXX" required pattern="(\\+?88)?01[3-9]\\d{8}"><small>We'll call or WhatsApp to confirm your order.</small></div>
          <div class="field"><label for="email">Email (optional)</label><input id="email" type="email" autocomplete="email" placeholder="you@example.com"></div>
        </div>

        <h2>Delivery</h2>
        <div class="field"><label for="name">Full name *</label><input id="name" autocomplete="name" required></div>
        <div class="field"><label for="address">Full address *</label><input id="address" autocomplete="street-address" placeholder="House, road, area" required></div>
        <fieldset class="radio-cards">
          <legend class="visually-hidden">Delivery area</legend>
          <label class="radio-card"><input type="radio" name="area" value="inside" checked><div><strong>Inside Dhaka</strong><small>1–2 working days</small></div><b id="ship-inside"></b></label>
          <label class="radio-card"><input type="radio" name="area" value="outside"><div><strong>Outside Dhaka</strong><small>2–4 working days</small></div><b id="ship-outside"></b></label>
        </fieldset>
        <div class="field" id="district-field" hidden><label for="district">District *</label><input id="district" placeholder="e.g. Chattogram, Sylhet, Khulna"></div>
        <div class="field"><label for="note">Order note (optional)</label><textarea id="note" placeholder="Landmark, preferred delivery time…" style="min-height:80px"></textarea></div>

        <h2>Payment</h2>
        <fieldset class="radio-cards">
          <legend class="visually-hidden">Payment method</legend>
          <label class="radio-card"><input type="radio" name="pay" value="cod" checked><div><strong>Cash on Delivery</strong><small>Check your parcel, then pay the delivery person</small></div></label>
          <label class="radio-card"><input type="radio" name="pay" value="bkash"><div><strong>bKash</strong><small>Send money and enter the transaction ID</small></div></label>
          <label class="radio-card"><input type="radio" name="pay" value="nagad"><div><strong>Nagad</strong><small>Send money and enter the transaction ID</small></div></label>
        </fieldset>
        <div class="pay-info" id="mfs-info" hidden>
          <p style="margin:0 0 8px">Send <strong id="mfs-amount"></strong> to <strong>${esc(CFG.phone)}</strong> (Personal, <span id="mfs-name">bKash</span>), using "Send Money". Then enter the transaction ID below.</p>
          <div class="field"><label for="trx">Transaction ID *</label><input id="trx" placeholder="e.g. 9FT7K2LQ1M" style="text-transform:uppercase"></div>
        </div>

        <button class="btn btn--block" type="submit" id="place-btn" style="margin-top:8px"></button>
        <p class="cart-note">By placing your order you agree to our <a href="policies.html#terms">Terms</a> and <a href="policies.html#returns">Return Policy</a>.</p>
      </form>

      <aside class="summary" aria-label="Order summary">
        <h2 style="margin-top:0">Order summary</h2>
        <ul class="cart-items" id="summary-items" role="list"></ul>
        <div class="discount-row">
          <label class="visually-hidden" for="code">Discount code</label>
          <input id="code" placeholder="Discount code" value="${esc(state.code)}">
          <button class="btn btn--outline btn--sm" type="button" id="apply-code">Apply</button>
        </div>
        <p class="msg" id="code-msg"></p>
        <div class="totals" id="summary-totals"></div>
        <div class="trust-mini">
          <div>${icon('shield')}Check before you pay</div>
          <div>${icon('return')}7-day returns</div>
          <div>${icon('sun')}100% UV400</div>
        </div>
      </aside>
    </div>`;

  $('#ship-inside').textContent = money(CFG.shipping.inside);
  $('#ship-outside').textContent = money(CFG.shipping.outside);

  function renderSummary() {
    const t = Cart.totals(state.code, state.area);
    $('#summary-items').innerHTML = t.lines.map((l) => `
      <li class="cart-item">
        <div class="cart-item__img">${productArt(l.product, Math.max(0, l.product.colors.findIndex((c) => c.name === l.color)), false)}<b>${l.qty}</b></div>
        <div><span class="cart-item__title">${esc(l.product.name)}</span><div class="cart-item__meta">${esc(l.color)}${l.lensObj && l.lensObj.id !== 'none' ? `<br>${esc(l.lensObj.name)}` : ''}${l.rx ? `<br>Prescription: ${l.rx.mode === 'whatsapp' ? 'via WhatsApp' : 'entered'}` : ''}</div></div>
        <div class="cart-item__price">${money(l.lineTotal)}</div>
      </li>`).join('');
    $('#summary-totals').innerHTML = `
      <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
      ${t.discount ? `<div class="discount"><span>${esc(t.discountLabel)}</span><span>−${money(t.discount)}</span></div>` : ''}
      <div><span>Delivery (${state.area === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})</span><span>${t.free ? 'FREE' : money(t.shipping)}</span></div>
      <div class="grand"><span>Total</span><span>${money(t.total)}</span></div>`;
    $('#place-btn').textContent = `Place order · ${money(t.total)}`;
    $('#mfs-amount').textContent = money(t.total);
    $('#ship-inside').textContent = t.free ? 'FREE' : money(CFG.shipping.inside);
    $('#ship-outside').textContent = t.free ? 'FREE' : money(CFG.shipping.outside);
    return t;
  }

  function applyCode(showMsg) {
    const code = $('#code').value.trim().toUpperCase();
    const msg = $('#code-msg');
    if (!code) { state.code = ''; store.set('shadeo_code', ''); msg.textContent = ''; renderSummary(); return; }
    if (!CFG.codes[code]) { msg.className = 'msg msg--err'; msg.textContent = 'That code isn\'t valid.'; state.code = ''; renderSummary(); return; }
    state.code = code;
    store.set('shadeo_code', code);
    const t = renderSummary();
    if (showMsg) {
      msg.className = 'msg msg--ok';
      msg.textContent = t.bundle > t.codeAmt ? `Your Buy 2 discount is bigger, so we kept that one (codes don't combine).` : `${code} applied: ${CFG.codes[code].label}.`;
    }
  }

  root.addEventListener('click', (e) => { if (e.target.id === 'apply-code') applyCode(true); });
  root.addEventListener('change', (e) => {
    if (e.target.name === 'area') { state.area = e.target.value; $('#district-field').hidden = state.area !== 'outside'; renderSummary(); }
    if (e.target.name === 'pay') {
      state.pay = e.target.value;
      $('#mfs-info').hidden = state.pay === 'cod';
      $('#mfs-name').textContent = state.pay === 'nagad' ? 'Nagad' : 'bKash';
    }
  });

  $('#checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const required = ['phone', 'name', 'address'];
    if (state.area === 'outside') required.push('district');
    if (state.pay !== 'cod') required.push('trx');
    for (const id of required) {
      const el = $(`#${id}`);
      if (!el.value.trim() || !el.checkValidity()) {
        el.focus();
        Shadeo.toast(id === 'phone' ? 'Please enter a valid Bangladeshi mobile number.' : 'Please fill in all required fields.');
        return;
      }
    }
    const t = Cart.totals(state.code, state.area);
    const id = `SHD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const order = {
      id, createdAt: new Date().toISOString(),
      phone: $('#phone').value.trim(), email: $('#email').value.trim(), name: $('#name').value.trim(),
      address: $('#address').value.trim(), district: state.area === 'outside' ? $('#district').value.trim() : 'Dhaka',
      area: state.area, note: $('#note').value.trim(), pay: state.pay, trx: state.pay !== 'cod' ? $('#trx').value.trim().toUpperCase() : '',
      lines: t.lines.map((l) => ({ name: `${l.product.name} ${l.product.style}`, color: l.color, lens: l.lensObj && l.lensObj.id !== 'none' ? l.lensObj.name : '', rx: l.rx, qty: l.qty, total: l.lineTotal })),
      subtotal: t.subtotal, discount: t.discount, discountLabel: t.discountLabel, shipping: t.shipping, total: t.total,
      hasRx: t.lines.some((l) => l.rx),
    };
    const orders = store.get('shadeo_orders', []);
    orders.unshift(order);
    store.set('shadeo_orders', orders);
    store.set('shadeo_code', '');
    Cart.clear();
    form.reset();
    location.href = `checkout.html?order=${id}`;
  });

  renderSummary();
  if (state.code) applyCode(false);

  /* ---------- Confirmation ---------- */
  function renderConfirmation(id) {
    const order = store.get('shadeo_orders', []).find((o) => o.id === id);
    if (!order) {
      root.innerHTML = `<div class="confirm"><h1>Order not found</h1><p class="muted">We couldn't find that order in this browser.</p><a class="btn" href="track-order.html">Track an order</a></div>`;
      return;
    }
    const payLabel = { cod: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad' }[order.pay];
    const range = order.hasRx ? CFG.deliveryDays.prescription : CFG.deliveryDays[order.area];
    const msg = [
      `Hi SHADEO! I just placed order ${order.id}.`,
      ...order.lines.map((l) => `• ${l.qty} × ${l.name} (${l.color})${l.lens ? ` + ${l.lens}` : ''}${l.rx ? (l.rx.mode === 'whatsapp' ? ' [prescription photo to follow]' : ` [Rx R ${l.rx.rsph}/${l.rx.rcyl || 0}x${l.rx.raxis || 0}, L ${l.rx.lsph}/${l.rx.lcyl || 0}x${l.rx.laxis || 0}, PD ${l.rx.pd}]`) : ''}`),
      `Total: ${money(order.total)} (${payLabel}${order.trx ? `, TrxID ${order.trx}` : ''})`,
      `Name: ${order.name}`, `Phone: ${order.phone}`, `Address: ${order.address}, ${order.district}`,
      order.note ? `Note: ${order.note}` : '',
    ].filter(Boolean).join('\n');

    root.innerHTML = `
      <div class="confirm">
        <div class="confirm__icon">${icon('check')}</div>
        <p class="eyebrow">Order ${esc(order.id)}</p>
        <h1 style="font-size:clamp(2rem,5vw,3.2rem)">Thank you, ${esc(order.name.split(' ')[0])}!</h1>
        <p class="muted">One last step: send your order to us on WhatsApp so our team can confirm it right away.</p>
        <a class="btn btn--accent" href="${waLink(msg)}" target="_blank" rel="noopener">${icon('chat')} Confirm on WhatsApp</a>
        <div class="confirm__box">
          <p><strong>Estimated delivery:</strong> ${eta(range)}</p>
          <p><strong>Payment:</strong> ${payLabel}${order.trx ? ` · TrxID ${esc(order.trx)}` : ''}</p>
          <p><strong>Deliver to:</strong> ${esc(order.name)}, ${esc(order.address)}, ${esc(order.district)} · ${esc(order.phone)}</p>
          <ul class="cart-items" role="list">${order.lines.map((l) => `<li class="cart-item" style="grid-template-columns:1fr auto"><div><strong>${l.qty} × ${esc(l.name)}</strong><div class="cart-item__meta">${esc(l.color)}${l.lens ? ` · ${esc(l.lens)}` : ''}</div></div><div class="cart-item__price">${money(l.total)}</div></li>`).join('')}</ul>
          <div class="totals" style="margin-top:12px">
            ${order.discount ? `<div class="discount"><span>${esc(order.discountLabel)}</span><span>−${money(order.discount)}</span></div>` : ''}
            <div><span>Delivery</span><span>${order.shipping ? money(order.shipping) : 'FREE'}</span></div>
            <div class="grand"><span>Total</span><span>${money(order.total)}</span></div>
          </div>
          ${order.hasRx && order.lines.some((l) => l.rx && l.rx.mode === 'whatsapp') ? '<p class="callout" style="margin-bottom:0">Remember to send a clear photo of your prescription on WhatsApp. Our optician checks it before your lenses are made.</p>' : ''}
        </div>
        <ol class="timeline" style="text-align:left">
          <li class="is-done"><div><strong>Order placed</strong><span>${new Date(order.createdAt).toLocaleString('en-GB')}</span></div></li>
          <li><div><strong>Confirmed by SHADEO</strong><span>We'll call or WhatsApp you within 2 hours (10 AM – 10 PM)</span></div></li>
          <li><div><strong>Shipped</strong><span>You'll get an SMS with your tracking link</span></div></li>
          <li><div><strong>Delivered</strong><span>Check your parcel, then pay if COD</span></div></li>
        </ol>
        <a class="btn btn--outline" href="shop.html?c=all">Continue shopping</a>
      </div>`;
  }
});
