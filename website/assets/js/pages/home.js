/* Homepage: shape cards, product rows and the lookbook grid */
Shadeo.onReady(() => {
  const { $, Art, PRODUCTS, renderGrid, photo, esc } = Shadeo;

  $('#shape-track').innerHTML = window.SHADEO_SHAPES.map((s) => `
    <li><a class="shape-card" href="shop.html?c=all&shape=${s.id}">
      <span class="shape-card__media">${Art.outline(s.id)}</span>
      <span class="shape-card__label">${s.label}</span>
    </a></li>`).join('');

  renderGrid($('#bestsellers'), PRODUCTS.filter((p) => p.tags.includes('bestseller')).slice(0, 4));
  renderGrid($('#new-arrivals'), PRODUCTS.filter((p) => p.tags.includes('new') && p.type !== 'Accessories').slice(0, 4));

  // Lookbook tiles link to the collection that matches each look
  const looks = [
    { img: 'people/women-palm.jpg', label: 'Cat eye season', href: 'shop.html?c=women&shape=cat-eye' },
    { img: 'people/men-striped.jpg', label: 'City classics', href: 'shop.html?c=men' },
    { img: 'people/kids-flower.jpg', label: 'Little sunshine', href: 'shop.html?c=kids' },
    { img: 'people/men-beard.jpg', label: 'Polarized', href: 'shop.html?c=polarized' },
    { img: 'people/women-smile.jpg', label: 'Statement whites', href: 'shop.html?c=women' },
  ];
  $('#look-grid').innerHTML = looks.map((l) => `<li><a class="look" href="${l.href}">
      ${photo(`assets/img/${l.img}`, l.label)}
      <span class="look__tag"><strong>${esc(l.label)}</strong><span>Shop</span></span>
    </a></li>`).join('');
});
