/* =========================================================
   SHADEO custom scripts
   Loaded from layout/theme.liquid with defer (see 01-THEME-SETUP.md).
   Everything uses delegated listeners so it keeps working after
   Dawn re-renders the cart drawer or product info.
   ========================================================= */
(function () {
  'use strict';

  const cartAddUrl = (window.Shopify && window.Shopify.routes ? window.Shopify.routes.root : '/') + 'cart/add.js';

  async function addToCart(body) {
    const res = await fetch(cartAddUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.status) throw new Error(data.description || data.message || 'Could not add to cart');
    return data;
  }

  /* ---------- Carousel arrows ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-shadeo-scroll]');
    if (!btn) return;
    const track = document.getElementById(btn.getAttribute('aria-controls'));
    if (!track) return;
    const dir = btn.dataset.shadeoScroll === 'prev' ? -1 : 1;
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: 'smooth' });
  });

  /* ---------- Dialogs (size guide) ---------- */
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-shadeo-open]');
    if (opener) {
      const dialog = document.getElementById(opener.dataset.shadeoOpen);
      if (dialog && dialog.showModal) dialog.showModal();
      return;
    }
    const closer = e.target.closest('[data-shadeo-close]');
    if (closer) {
      closer.closest('dialog').close();
      return;
    }
    // Click on the dark backdrop closes the dialog
    if (e.target.matches('dialog.shadeo-dialog')) e.target.close();
  });

  /* ---------- Lens selector ---------- */
  function updateLens(root) {
    const lens = root.querySelector('input[name="properties[Lens]"]:checked');
    const needsRx = !!lens && lens.dataset.rx === 'true';
    const rx = root.querySelector('[data-shadeo-rx]');
    if (!rx) return;

    rx.hidden = !needsRx;
    rx.querySelectorAll('input[name="properties[Prescription]"]').forEach((input) => {
      input.disabled = !needsRx;
    });

    const mode = rx.querySelector('input[name="properties[Prescription]"]:checked');
    const typing = needsRx && !!mode && mode.value === 'Entered below';
    rx.querySelector('[data-shadeo-rx-fields]').hidden = !typing;
    rx.querySelectorAll('[data-shadeo-rx-field]').forEach((input) => {
      // Disabled inputs are not sent with the form, so unused Rx fields stay off the order
      input.disabled = !typing;
      input.required = typing && input.dataset.required === 'true';
    });
  }

  document.addEventListener('change', (e) => {
    const root = e.target.closest('[data-shadeo-lens]');
    if (root) updateLens(root);
  });

  // When a paid lens is chosen, add the matching "lens-upgrade" variant first,
  // then let Dawn's own product form add the frame and open the cart drawer.
  document.addEventListener(
    'submit',
    async (e) => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement) || !form.id) return;
      if (form.dataset.shadeoLensAdded === '1') return;

      const root = document.querySelector(`[data-shadeo-lens][data-form="${form.id}"]`);
      const lens = root && root.querySelector('input[name="properties[Lens]"]:checked');
      if (!lens || !lens.dataset.variantId) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      const quantity = parseInt(new FormData(form).get('quantity'), 10) || 1;
      try {
        await addToCart({
          items: [{ id: Number(lens.dataset.variantId), quantity, properties: { 'For frame': root.dataset.productTitle } }],
        });
      } catch (err) {
        alert(`Sorry, we couldn't add your lenses: ${err.message}`);
        return;
      }

      form.dataset.shadeoLensAdded = '1';
      form.requestSubmit(e.submitter || undefined);
      delete form.dataset.shadeoLensAdded;
    },
    true
  );

  /* ---------- Delivery estimate ---------- */
  // Bangladesh weekend is Friday, so Fridays are skipped as delivery days.
  function addDeliveryDays(start, days) {
    const date = new Date(start);
    let added = 0;
    while (added < days) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 5) added++;
    }
    return date;
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function renderDelivery(root) {
    const now = new Date();
    const cutoff = parseInt(root.dataset.cutoffHour, 10) || 15;
    if (now.getHours() >= cutoff) now.setDate(now.getDate() + 1);

    root.querySelectorAll('[data-shadeo-eta]').forEach((el) => {
      const [min, max] = el.dataset.shadeoEta.split('-').map(Number);
      const from = formatDate(addDeliveryDays(now, min));
      const to = formatDate(addDeliveryDays(now, max || min));
      el.textContent = from === to ? from : `${from} – ${to}`;
    });
  }

  /* ---------- Low-stock badge ---------- */
  function renderStock(root, variantId) {
    const badge = root.querySelector('[data-shadeo-stock]');
    const dataEl = root.querySelector('[data-shadeo-stock-data]');
    if (!badge || !dataEl) return;
    const stock = JSON.parse(dataEl.textContent);
    const threshold = parseInt(root.dataset.lowStock, 10) || 5;
    const qty = stock[String(variantId)];
    const show = typeof qty === 'number' && qty > 0 && qty <= threshold;
    badge.hidden = !show;
    if (show) badge.textContent = `Hurry – only ${qty} left in stock`;
  }

  // Dawn fires a bubbling "change" on input[name="id"] whenever the variant changes
  document.addEventListener('change', (e) => {
    if (e.target.name !== 'id' || !e.target.form) return;
    const root = document.querySelector(`[data-shadeo-delivery][data-form="${e.target.form.id}"]`);
    if (root) renderStock(root, e.target.value);
  });

  /* ---------- Sticky mobile add to cart ---------- */
  function initStickyAtc(bar) {
    const form = document.getElementById(bar.dataset.form);
    const mainBtn = form && form.querySelector('[type="submit"][name="add"]');
    if (!mainBtn) return;
    const stickyBtn = bar.querySelector('[data-shadeo-sticky-btn]');
    const priceEl = bar.querySelector('[data-shadeo-sticky-price]');
    const priceSource = document.getElementById(bar.dataset.priceSource);

    new IntersectionObserver(([entry]) => {
      bar.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
    }).observe(mainBtn);

    stickyBtn.addEventListener('click', () => {
      // If the product has a lens selector, send the shopper there first instead of adding blindly
      const lensRoot = document.querySelector(`[data-shadeo-lens][data-form="${form.id}"]`);
      if (lensRoot) {
        lensRoot.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        mainBtn.click();
      }
    });

    // Keep price and sold-out state in sync with the main product form
    const sync = () => {
      stickyBtn.disabled = mainBtn.disabled;
      stickyBtn.textContent = mainBtn.disabled ? mainBtn.textContent.trim() : bar.dataset.label;
      if (priceSource && priceEl) {
        const onSale = priceSource.querySelector('.price--on-sale');
        const current = onSale
          ? priceSource.querySelector('.price__sale .price-item--sale')
          : priceSource.querySelector('.price__regular .price-item--regular');
        if (current) priceEl.textContent = current.textContent.trim();
      }
    };
    new MutationObserver(sync).observe(mainBtn, { attributes: true, childList: true, subtree: true });
    if (priceSource) new MutationObserver(sync).observe(priceSource, { childList: true, subtree: true, attributes: true });
    sync();
  }

  /* ---------- Cart drawer upsell ---------- */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-shadeo-upsell-add]');
    if (!btn) return;
    e.preventDefault();
    btn.setAttribute('aria-busy', 'true');

    const drawer = document.querySelector('cart-drawer');
    const body = { items: [{ id: Number(btn.dataset.variantId), quantity: 1 }] };
    if (drawer && typeof drawer.getSectionsToRender === 'function') {
      body.sections = drawer.getSectionsToRender().map((section) => section.id);
      body.sections_url = window.location.pathname;
    }

    try {
      const data = await addToCart(body);
      if (drawer && typeof drawer.renderContents === 'function' && data.sections) {
        drawer.renderContents({ id: btn.dataset.variantId, sections: data.sections });
      } else {
        window.location.reload();
      }
    } catch (err) {
      btn.removeAttribute('aria-busy');
      alert(err.message);
    }
  });

  /* ---------- Init ---------- */
  function init() {
    document.querySelectorAll('[data-shadeo-lens]').forEach(updateLens);
    document.querySelectorAll('[data-shadeo-delivery]').forEach((root) => {
      renderDelivery(root);
      const form = document.getElementById(root.dataset.form);
      const idInput = form && form.querySelector('input[name="id"]');
      if (idInput) renderStock(root, idInput.value);
    });
    document.querySelectorAll('[data-shadeo-sticky-atc]').forEach(initStickyAtc);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
