/* Collection page: category, filters, sorting, search */
Shadeo.onReady(() => {
  const { $, $$, PRODUCTS, renderGrid, params, esc } = Shadeo;
  const CATS = window.SHADEO_CATEGORIES;

  const cat = CATS[params.get('c')] ? params.get('c') : 'all';
  const q = (params.get('q') || '').trim();
  const state = {
    shape: params.get('shape') ? [params.get('shape')] : [],
    gender: [], lens: [], material: [], price: [], stock: [],
    sort: 'featured',
  };

  const GROUPS = [
    { key: 'shape', title: 'Shape', options: window.SHADEO_SHAPES.map((s) => [s.id, s.label]), test: (p, v) => p.shape === v },
    { key: 'gender', title: 'Gender', options: [['men', 'Men'], ['women', 'Women']], test: (p, v) => p.tags.includes(v) },
    { key: 'lens', title: 'Lens type', options: [['polarized', 'Polarized'], ['gradient', 'Gradient'], ['mirrored', 'Mirrored'], ['blue-light', 'Blue light'], ['lens-selector', 'Prescription-ready']], test: (p, v) => p.tags.includes(v) },
    { key: 'material', title: 'Frame material', options: [['metal', 'Metal'], ['acetate', 'Acetate'], ['tr90', 'TR90 (flexible)']], test: (p, v) => p.material === v },
    { key: 'price', title: 'Price', options: [['0-1999', 'Under Tk 2,000'], ['2000-2499', 'Tk 2,000 – 2,499'], ['2500-2999', 'Tk 2,500 – 2,999'], ['3000-99999', 'Tk 3,000+']], test: (p, v) => { const [a, b] = v.split('-').map(Number); return p.price >= a && p.price <= b; } },
    { key: 'stock', title: 'Availability', options: [['in', 'In stock']], test: (p) => p.stock > 0 },
  ];

  // Header copy
  const info = CATS[cat];
  const title = q ? `Results for "${q}"` : info.title;
  $('#shop-title').textContent = title;
  $('#crumb').textContent = title;
  $('#shop-desc').textContent = q ? 'Showing frames that match your search.' : info.desc;
  document.title = `${title} – SHADEO`;

  const chipCats = ['all', 'sunglasses', 'eyeglasses', 'blue-light', 'polarized', 'new', 'bestsellers', 'sale', 'accessories'];
  $('#cat-chips').innerHTML = chipCats.map((c) => `<a class="chip${c === cat && !q ? ' is-active' : ''}" href="shop.html?c=${c}">${CATS[c].title.replace('Shop All', 'All')}</a>`).join('');

  // Base set: category + search
  const terms = q.toLowerCase().replace(/shades?/g, 'sunglasses').split(/\s+/).filter(Boolean);
  const base = PRODUCTS.filter((p) => {
    if (info.test && !info.test(p)) return false;
    if (!terms.length) return true;
    const hay = [p.name, p.style, p.type, p.shape, p.material, p.tags.join(' '), p.colors.map((c) => c.name).join(' ')].join(' ').toLowerCase();
    return terms.every((t) => hay.includes(t));
  });

  const passes = (p, skipKey) => GROUPS.every((g) => g.key === skipKey || !state[g.key].length || state[g.key].some((v) => g.test(p, v)));

  function filtersHTML(prefix) {
    return GROUPS.map((g) => {
      const opts = g.options.map(([v, label]) => {
        const count = base.filter((p) => passes(p, g.key) && g.test(p, v)).length;
        if (!count && !state[g.key].includes(v)) return '';
        const id = `${prefix}-${g.key}-${v}`;
        return `<label class="check" for="${id}"><input type="checkbox" id="${id}" data-filter="${g.key}" value="${v}"${state[g.key].includes(v) ? ' checked' : ''}>${esc(label)}<small>${count}</small></label>`;
      }).join('');
      return opts ? `<div class="filter-group"><h3>${g.title}</h3>${opts}</div>` : '';
    }).join('') || '<p class="muted">No filters for this collection.</p>';
  }

  function sortList(list) {
    const l = [...list];
    if (state.sort === 'low') l.sort((a, b) => a.price - b.price);
    if (state.sort === 'high') l.sort((a, b) => b.price - a.price);
    if (state.sort === 'best') l.sort((a, b) => b.tags.includes('bestseller') - a.tags.includes('bestseller'));
    if (state.sort === 'new') l.sort((a, b) => b.tags.includes('new') - a.tags.includes('new'));
    return l;
  }

  function render() {
    const list = sortList(base.filter((p) => passes(p)));
    $('#count').textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}`;
    $('#show-results').textContent = `Show ${list.length} results`;
    $('#filters-desktop').innerHTML = filtersHTML('d');
    $('#filters-mobile').innerHTML = filtersHTML('m');

    const active = GROUPS.flatMap((g) => state[g.key].map((v) => ({ key: g.key, v, label: (g.options.find((o) => o[0] === v) || [v, v])[1] })));
    $('#active-filters').innerHTML = active.length
      ? active.map((a) => `<button type="button" class="chip" data-unfilter="${a.key}" data-value="${a.v}">${esc(a.label)}</button>`).join('') + '<button type="button" class="link" data-clear-filters>Clear all</button>'
      : '';

    const grid = $('#grid');
    if (list.length) {
      renderGrid(grid, list);
      grid.classList.toggle('grid--4', true);
    } else {
      grid.innerHTML = `<li style="grid-column:1/-1"><div class="empty-state"><h3>No frames match</h3><p class="muted">Try removing a filter, or browse everything.</p><a class="btn" href="shop.html?c=all">Shop all</a></div></li>`;
    }

    const url = new URL(location.href);
    url.searchParams.set('c', cat);
    if (state.shape.length === 1) url.searchParams.set('shape', state.shape[0]); else url.searchParams.delete('shape');
    history.replaceState(null, '', url);
  }

  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-filter]');
    if (input) {
      const arr = state[input.dataset.filter];
      const i = arr.indexOf(input.value);
      if (input.checked && i < 0) arr.push(input.value);
      if (!input.checked && i >= 0) arr.splice(i, 1);
      render();
      return;
    }
    if (e.target.id === 'sort') { state.sort = e.target.value; render(); }
  });

  document.addEventListener('click', (e) => {
    const un = e.target.closest('[data-unfilter]');
    if (un) { const arr = state[un.dataset.unfilter]; arr.splice(arr.indexOf(un.dataset.value), 1); render(); return; }
    if (e.target.closest('[data-clear-filters]')) { GROUPS.forEach((g) => { state[g.key] = []; }); render(); }
  });

  render();
});
