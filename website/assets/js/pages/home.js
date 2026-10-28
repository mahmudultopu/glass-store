/* Homepage: hero art, shape carousel, product rows, shop-the-look */
Shadeo.onReady(() => {
  const { $, Art, PRODUCTS, renderGrid, byHandle, productArt, money, esc } = Shadeo;

  $('#hero-glasses').innerHTML = Art.frame({ shape: 'aviator', material: 'metal', frame: '#111111', lens: '#1d1d1d', gradient: true });
  $('#campaign-art').innerHTML = Art.frame({ shape: 'cat-eye', material: 'acetate', frame: '#0f0f0f', lens: '#3B2326', gradient: true });

  $('#shape-track').innerHTML = window.SHADEO_SHAPES.filter((s) => s.id !== 'rectangle').map((s) => `
    <li><a class="shape-card" href="shop.html?c=all&shape=${s.id}">
      <span class="shape-card__media">${Art.outline(s.id)}</span>
      <span class="shape-card__label">${s.label}</span>
    </a></li>`).join('');

  renderGrid($('#bestsellers'), PRODUCTS.filter((p) => p.tags.includes('bestseller')).slice(0, 4));
  renderGrid($('#new-arrivals'), PRODUCTS.filter((p) => p.tags.includes('new') && p.type !== 'Accessories').slice(0, 4));

  // Lifestyle tiles: illustrated "scenes" until real photos are added
  const looks = [
    { handle: 'kuakata-cat-eye', color: 1, label: 'Kuakata sunset', bg: 'linear-gradient(180deg,#FF9A5A 0%,#F5A623 45%,#2E5E7E 46%,#1E3F57 100%)' },
    { handle: 'gulshan-aviator-polarized', color: 0, label: 'Rooftop hour', bg: 'linear-gradient(160deg,#2B2D42 0%,#5C4B6B 55%,#F2A65A 100%)' },
    { handle: 'hatirjheel-oversized-square', color: 0, label: 'Night lights', bg: 'radial-gradient(circle at 30% 20%,#3A3F73 0%,#14162B 70%)' },
    { handle: 'sundarban-shield-sport', color: 0, label: 'Morning ride', bg: 'linear-gradient(180deg,#BFE3F2 0%,#8CC7A1 60%,#3F7D5A 100%)' },
  ];
  $('#look-grid').innerHTML = looks.map((l) => {
    const p = byHandle(l.handle);
    return `<li><a class="look" href="product.html?p=${p.handle}">
      <div class="look__scene" style="background:${l.bg}">${productArt(p, l.color, false)}</div>
      <span class="look__label">${esc(l.label)}</span>
      <span class="look__tag"><strong>${esc(p.name)} ${esc(p.style)}</strong><span>${money(p.price)}</span></span>
    </a></li>`;
  }).join('');
});
