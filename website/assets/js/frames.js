/* =========================================================
   SHADEO frame + icon renderer
   Draws every product as an SVG so the site works without photos.
   Swap for real product photos later by adding `images` to a product in data.js.
   ========================================================= */
(function () {
  'use strict';

  let uid = 0;

  function rrect(x, y, w, h, r) {
    return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
  }
  function circle(cx, cy, r) {
    return `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
  }

  // Each shape: lens paths, bridge path, optional top bar, temple stubs
  const SHAPES = {
    aviator: {
      lenses: ['M16 12 H52 Q54 30 42 40 Q30 47 21 36 Q14 26 16 12 Z', 'M104 12 H68 Q66 30 78 40 Q90 47 99 36 Q106 26 104 12 Z'],
      bridge: 'M52 16 Q60 12 68 16', bar: 'M18 10 H102', temples: 'M16 13 L4 12 M104 13 L116 12',
    },
    round: {
      lenses: [circle(33, 27, 17), circle(87, 27, 17)],
      bridge: 'M50 24 Q60 16 70 24', temples: 'M16 24 L4 21 M104 24 L116 21',
    },
    square: {
      lenses: [rrect(13, 10, 39, 34, 5), rrect(68, 10, 39, 34, 5)],
      bridge: 'M52 19 Q60 14 68 19', temples: 'M13 14 L3 12 M107 14 L117 12',
    },
    rectangle: {
      lenses: [rrect(11, 14, 41, 25, 4), rrect(68, 14, 41, 25, 4)],
      bridge: 'M52 21 Q60 16 68 21', temples: 'M11 17 L2 15 M109 17 L118 15',
    },
    browline: {
      lenses: [rrect(12, 15, 40, 27, 11), rrect(68, 15, 40, 27, 11)],
      bridge: 'M52 19 Q60 14 68 19', bar: 'M10 15 Q31 9 52 16 M68 16 Q89 9 110 15', temples: 'M11 16 L2 14 M109 16 L118 14',
    },
    'cat-eye': {
      lenses: ['M9 11 Q32 5 52 16 Q50 40 31 40 Q14 38 9 11 Z', 'M111 11 Q88 5 68 16 Q70 40 89 40 Q106 38 111 11 Z'],
      bridge: 'M52 19 Q60 15 68 19', temples: 'M9 12 L2 10 M111 12 L118 10',
    },
    oversized: {
      lenses: [rrect(5, 4, 49, 43, 15), rrect(66, 4, 49, 43, 15)],
      bridge: 'M54 17 Q60 13 66 17', temples: 'M5 12 L0 11 M115 12 L120 11',
    },
    shield: {
      lenses: ['M7 12 H113 Q115 30 103 39 Q83 47 66 31 H54 Q37 47 17 39 Q5 30 7 12 Z'],
      bridge: '', bar: 'M7 10 H113', temples: 'M7 13 L0 12 M113 13 L120 12',
    },
  };

  const STROKE = { metal: 2.4, acetate: 4.6, tr90: 3.6 };

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amt));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    const b = Math.max(0, Math.min(255, (n & 255) + amt));
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }

  /**
   * frame({ shape, frame, lens, material, clear, mirror, label })
   * frame/lens are hex colors. clear = optical (see-through) lens.
   */
  function frame(opts) {
    const s = SHAPES[opts.shape] || SHAPES.round;
    const id = `f${++uid}`;
    const sw = STROKE[opts.material] || 3;
    const frameColor = opts.frame || '#111111';
    const lens = opts.lens || '#2b2b2b';
    const clear = !!opts.clear;
    const top = clear ? '#ffffff' : lens;
    const bottom = clear ? '#ffffff' : (opts.gradient ? shade(lens, 110) : shade(lens, 30));
    const lensOpacity = clear ? 0.35 : 0.94;

    const defs = [
      `<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`,
    ];
    if (opts.mirror) {
      defs.push(`<linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(lens, 80)}"/><stop offset=".5" stop-color="${lens}"/><stop offset="1" stop-color="${shade(lens, -40)}"/></linearGradient>`);
    }
    const fill = opts.mirror ? `url(#${id}m)` : `url(#${id}g)`;

    let body = '';
    s.lenses.forEach((d, i) => {
      defs.push(`<clipPath id="${id}c${i}"><path d="${d}"/></clipPath>`);
      body += `<path d="${d}" fill="${fill}" fill-opacity="${lensOpacity}"/>`;
      // glossy highlight streak
      body += `<g clip-path="url(#${id}c${i})"><rect x="-20" y="-6" width="140" height="9" fill="#fff" fill-opacity="${clear ? 0.5 : 0.22}" transform="rotate(-24 60 26)"/><rect x="-20" y="8" width="140" height="3" fill="#fff" fill-opacity="${clear ? 0.35 : 0.12}" transform="rotate(-24 60 26)"/></g>`;
    });
    const stroke = `stroke="${frameColor}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    if (s.temples) body += `<path d="${s.temples}" ${stroke} stroke-width="${sw}"/>`;
    if (s.bar) body += `<path d="${s.bar}" ${stroke} stroke-width="${Math.max(1.8, sw * 0.6)}"/>`;
    s.lenses.forEach((d) => { body += `<path d="${d}" ${stroke} stroke-width="${sw}"/>`; });
    if (s.bridge) body += `<path d="${s.bridge}" ${stroke} stroke-width="${sw}"/>`;
    // tiny hinge dots for a premium touch
    if (opts.material === 'acetate') {
      body += `<circle cx="${s.lenses.length === 1 ? 12 : 15}" cy="15" r="1" fill="#d9c27a"/><circle cx="${s.lenses.length === 1 ? 108 : 105}" cy="15" r="1" fill="#d9c27a"/>`;
    }

    const label = opts.label ? ` role="img" aria-label="${opts.label}"` : ' aria-hidden="true"';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -2 128 56"${label}><defs>${defs.join('')}</defs>${body}</svg>`;
  }

  /** Simple line drawing of a shape (menus, carousel, quiz). */
  function outline(shape, color) {
    const s = SHAPES[shape] || SHAPES.round;
    const c = color || 'currentColor';
    let p = s.lenses.map((d) => `<path d="${d}"/>`).join('');
    if (s.bridge) p += `<path d="${s.bridge}"/>`;
    if (s.bar) p += `<path d="${s.bar}"/>`;
    if (s.temples) p += `<path d="${s.temples}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -2 128 56" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  }

  /** Accessories */
  function accessory(kind, color) {
    const c = color || '#111111';
    const a = '#F5A623';
    const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" aria-hidden="true">${inner}</svg>`;
    switch (kind) {
      case 'case':
        return wrap(`<rect x="10" y="20" width="100" height="44" rx="22" fill="${c}"/><path d="M10 42 H110" stroke="${shade(c, 40)}" stroke-width="2"/><rect x="10" y="20" width="100" height="22" rx="11" fill="${shade(c, 18)}"/><text x="60" y="36" text-anchor="middle" font-family="Archivo Black, Arial Black, sans-serif" font-size="11" fill="${a}">S</text>`);
      case 'cloth':
        return wrap(`<path d="M20 16 H96 L104 64 H28 Z" fill="${a}"/><path d="M20 16 L28 64" stroke="${shade(a, -40)}" stroke-width="2"/><path d="M34 30 Q50 22 66 30 T98 30" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/><text x="63" y="52" text-anchor="middle" font-family="Archivo Black, Arial Black, sans-serif" font-size="9" fill="#111">SHADEO</text>`);
      case 'kit':
        return wrap(`<rect x="22" y="26" width="26" height="44" rx="6" fill="${c}"/><rect x="28" y="14" width="14" height="14" rx="3" fill="${shade(c, 40)}"/><rect x="31" y="6" width="8" height="10" fill="${a}"/><rect x="26" y="40" width="18" height="14" rx="2" fill="${a}"/><path d="M58 30 H100 L106 66 H64 Z" fill="${a}"/><text x="83" y="52" text-anchor="middle" font-family="Archivo Black, Arial Black, sans-serif" font-size="8" fill="#111">SHADEO</text>`);
      case 'strap':
        return wrap(`<path d="M10 50 Q60 0 110 50" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="2" y="44" width="16" height="16" rx="4" fill="${a}"/><rect x="102" y="44" width="16" height="16" rx="4" fill="${a}"/>`);
      default:
        return wrap(`<rect x="20" y="20" width="80" height="40" rx="8" fill="${c}"/>`);
    }
  }

  /** Face outline for the face-shape guide and quiz */
  function face(kind) {
    const paths = {
      oval: 'M32 6 C50 6 56 22 56 40 C56 60 46 74 32 74 C18 74 8 60 8 40 C8 22 14 6 32 6 Z',
      round: 'M32 8 C50 8 58 22 58 40 C58 58 48 72 32 72 C16 72 6 58 6 40 C6 22 14 8 32 8 Z',
      square: 'M10 10 H54 Q58 10 58 14 V58 Q58 72 44 74 H20 Q6 72 6 58 V14 Q6 10 10 10 Z',
      heart: 'M8 14 Q8 6 18 6 H46 Q56 6 56 14 V30 Q56 52 32 74 Q8 52 8 30 Z',
      diamond: 'M32 4 Q42 10 52 36 Q46 62 32 76 Q18 62 12 36 Q22 10 32 4 Z',
      unsure: 'M32 6 C50 6 56 22 56 40 C56 60 46 74 32 74 C18 74 8 60 8 40 C8 22 14 6 32 6 Z',
    };
    const extra = kind === 'unsure' ? '<text x="32" y="48" text-anchor="middle" font-family="Archivo Black, Arial Black, sans-serif" font-size="22" fill="currentColor" stroke="none">?</text>' : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" aria-hidden="true"><path d="${paths[kind] || paths.oval}"/>${extra}</svg>`;
  }

  /** Line icons */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    bag: '<path d="M6 7h12l1.2 13.2a1 1 0 0 1-1 1.1H5.8a1 1 0 0 1-1-1.1L6 7z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/>',
    menu: '<line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="15" y2="17"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    return: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    sparkle: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    quiz: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    left: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    right: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    filter: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    ruler: '<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/>',
    laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/>',
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    coin: '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>',
  };

  function icon(name, extraClass) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extraClass ? ` class="${extraClass}"` : ''}>${ICONS[name] || ICONS.star}</svg>`;
  }

  window.ShadeoArt = { frame, outline, accessory, face, icon, shade };
})();
