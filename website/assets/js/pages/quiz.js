/* Frame finder quiz: 5 questions → scored product recommendations */
Shadeo.onReady(() => {
  const { $, $$, Art, icon, PRODUCTS, renderGrid, esc } = Shadeo;
  const root = $('#quiz-root');

  const QUESTIONS = [
    {
      key: 'face', title: "What's your face shape?", cols: 3,
      options: [
        { v: 'oval', label: 'Oval', sub: 'Longer than wide', art: Art.face('oval') },
        { v: 'round', label: 'Round', sub: 'Soft, equal width & length', art: Art.face('round') },
        { v: 'square', label: 'Square', sub: 'Strong jaw, wide forehead', art: Art.face('square') },
        { v: 'heart', label: 'Heart', sub: 'Wide forehead, narrow chin', art: Art.face('heart') },
        { v: 'diamond', label: 'Diamond', sub: 'Wide cheekbones', art: Art.face('diamond') },
        { v: 'unsure', label: 'Not sure', sub: "We'll keep it flexible", art: Art.face('unsure') },
      ],
    },
    {
      key: 'use', title: 'What are they mainly for?',
      options: [
        { v: 'sun', label: 'Sun & style', sub: 'Everyday sunglasses', art: icon('sun') },
        { v: 'drive', label: 'Driving & outdoors', sub: 'Less glare', art: icon('target') },
        { v: 'screen', label: 'Screens', sub: 'Laptop & phone time', art: icon('laptop') },
        { v: 'rx', label: 'Prescription', sub: 'I need to see clearly', art: icon('eye') },
      ],
    },
    {
      key: 'style', title: 'Pick your vibe',
      options: [
        { v: 'classic', label: 'Classic', sub: 'Timeless, never wrong', art: Art.outline('aviator') },
        { v: 'bold', label: 'Bold', sub: 'Statement frames', art: Art.outline('oversized') },
        { v: 'minimal', label: 'Minimal', sub: 'Light & clean', art: Art.outline('round') },
        { v: 'sporty', label: 'Sporty', sub: 'Built to move', art: Art.outline('shield') },
      ],
    },
    {
      key: 'who', title: 'Who are you shopping for?',
      options: [
        { v: 'men', label: 'Men', sub: 'Men’s styles', art: icon('user') },
        { v: 'women', label: 'Women', sub: 'Women’s styles', art: icon('heart') },
        { v: 'any', label: 'Show me everything', sub: 'Unisex welcome', art: icon('sparkle') },
      ],
    },
    {
      key: 'budget', title: "What's your budget?",
      options: [
        { v: 2200, label: 'Under Tk 2,200', sub: 'Smart value', art: icon('coin') },
        { v: 2800, label: 'Up to Tk 2,800', sub: 'Most popular', art: icon('tag') },
        { v: 99999, label: 'No limit', sub: 'Show the best', art: icon('award') },
      ],
    },
  ];

  const FACE_SHAPES = {
    oval: ['aviator', 'oversized', 'square', 'cat-eye', 'round', 'shield'],
    round: ['square', 'rectangle', 'cat-eye'],
    square: ['round', 'aviator', 'oversized'],
    heart: ['aviator', 'round', 'cat-eye'],
    diamond: ['cat-eye', 'round', 'oversized'],
    unsure: [],
  };
  const STYLE_SHAPES = { classic: ['aviator', 'round', 'rectangle'], bold: ['oversized', 'cat-eye', 'square'], minimal: ['round', 'rectangle', 'aviator'], sporty: ['shield', 'aviator', 'square'] };

  const answers = {};
  let step = 0;

  function renderQuestion() {
    const q = QUESTIONS[step];
    root.innerHTML = `
      <div class="quiz__progress"><p>Question ${step + 1} of ${QUESTIONS.length}</p><div class="progress"><span style="width:${(step / QUESTIONS.length) * 100}%"></span></div></div>
      <h1>${q.title}</h1>
      <ul class="quiz__opts${q.cols === 3 ? ' quiz__opts--3' : ''}" role="list">
        ${q.options.map((o) => `<li><button type="button" class="quiz-opt${answers[q.key] === o.v ? ' is-selected' : ''}" data-answer="${o.v}">${o.art}<strong>${esc(o.label)}</strong><small>${esc(o.sub)}</small></button></li>`).join('')}
      </ul>
      <div class="quiz__nav">
        ${step > 0 ? '<button type="button" class="btn btn--outline btn--sm" data-back>Back</button>' : '<span></span>'}
        ${step === 0 ? '<a class="link" href="face-shapes.html">Not sure? Read the face shape guide</a>' : ''}
      </div>`;
    const first = $('.quiz-opt', root);
    if (first && step > 0) first.focus();
  }

  function score(p) {
    let s = 0;
    const faceShapes = FACE_SHAPES[answers.face] || [];
    if (faceShapes.includes(p.shape)) s += 4 - Math.min(3, faceShapes.indexOf(p.shape));
    if ((STYLE_SHAPES[answers.style] || []).includes(p.shape)) s += 3;
    if (answers.use === 'drive' && p.tags.includes('polarized')) s += 4;
    if (answers.use === 'screen' && p.tags.includes('blue-light')) s += 6;
    if (answers.use === 'rx' && p.tags.includes('lens-selector')) s += 6;
    if (answers.use === 'sun' && p.type === 'Sunglasses') s += 3;
    if (answers.style === 'sporty' && p.material === 'tr90') s += 1;
    if (answers.style === 'minimal' && p.material === 'metal') s += 1;
    if (answers.style === 'bold' && p.material === 'acetate') s += 1;
    if (p.tags.includes('bestseller')) s += 0.5;
    return s;
  }

  function renderResults() {
    const wantType = { sun: ['Sunglasses'], drive: ['Sunglasses'], screen: ['Blue Light Glasses', 'Eyeglasses'], rx: ['Eyeglasses', 'Blue Light Glasses', 'Sunglasses'] }[answers.use];
    let pool = PRODUCTS.filter((p) => p.type !== 'Accessories' && wantType.includes(p.type) && p.price <= answers.budget);
    if (answers.who !== 'any') pool = pool.filter((p) => p.tags.includes(answers.who));
    if (answers.use === 'rx') pool = pool.filter((p) => p.tags.includes('lens-selector'));
    if (pool.length < 2) pool = PRODUCTS.filter((p) => p.type !== 'Accessories' && wantType.includes(p.type)); // relax filters if too narrow
    const picks = pool.map((p) => ({ p, s: score(p) })).sort((a, b) => b.s - a.s).slice(0, 4).map((x) => x.p);

    const shapes = (FACE_SHAPES[answers.face] || []).slice(0, 3);
    const shapeNames = shapes.map((s) => (window.SHADEO_SHAPES.find((x) => x.id === s) || {}).label).filter(Boolean);

    root.innerHTML = `
      <div class="quiz__progress"><p>Your results</p><div class="progress is-done"><span style="width:100%"></span></div></div>
      <div style="text-align:center">
        <p class="eyebrow">We picked these for you</p>
        <h1>Your perfect frames</h1>
        <p class="muted">${shapeNames.length ? `For a ${answers.face} face, these shapes look great:` : 'These frames match your style and needs:'}</p>
        ${shapeNames.length ? `<div class="result-shapes">${shapes.map((s, i) => `<a class="chip" href="shop.html?c=all&shape=${s}">${shapeNames[i]}</a>`).join('')}</div>` : ''}
      </div>
      <ul class="grid grid--4" id="quiz-results" role="list" style="grid-template-columns:repeat(2,1fr)"></ul>
      <div style="text-align:center;margin-top:32px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button type="button" class="btn btn--outline" data-restart>Retake quiz</button>
        <a class="btn" href="shop.html?c=all">Shop all frames</a>
      </div>`;
    renderGrid($('#quiz-results'), picks);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  root.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-answer]');
    if (opt) {
      const q = QUESTIONS[step];
      const raw = opt.dataset.answer;
      answers[q.key] = q.key === 'budget' ? Number(raw) : raw;
      $$('.quiz-opt', root).forEach((b) => b.classList.toggle('is-selected', b === opt));
      setTimeout(() => { step++; step < QUESTIONS.length ? renderQuestion() : renderResults(); }, 180);
      return;
    }
    if (e.target.closest('[data-back]')) { step = Math.max(0, step - 1); renderQuestion(); return; }
    if (e.target.closest('[data-restart]')) { step = 0; Object.keys(answers).forEach((k) => delete answers[k]); renderQuestion(); }
  });

  renderQuestion();
});
