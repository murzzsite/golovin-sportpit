(() => {
  // ===== CONFIG =====
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/KHNG2VVM8A';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== HEADER =====
  const header = $('#header');
  const burger = $('#burger');
  const nav = $('#nav');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    const menuOpen = nav.classList.contains('is-open');
    header.classList.toggle('is-hidden', y > lastY && y > 400 && !menuOpen);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const closeMenu = () => {
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
    header.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
  };
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(a => a.addEventListener('click', closeMenu));

  // ===== SMOOTH ANCHORS =====
  const goTo = target => {
    const top = target.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const t = $(href);
      if (!t) return;
      e.preventDefault();
      goTo(t);
    });
  });

  // ===== BARBELL RENDER =====
  // order: from the centre outwards
  const buildBar = (el, plates, fresh = 0) => {
    const mk = (cls, i, extra = '') => `<span class="${cls}${extra}" style="--i:${i}"></span>`;
    const side = (list, skip) => list.map((p, i) => mk('plate plate--' + p, i + 1, i >= skip ? ' plate--new' : '')).join('');
    const skip = fresh ? plates.length - fresh : plates.length;
    const l = `<div class="bar__side bar__side--l">${mk('bar__collar', 0)}${side(plates, skip)}<span class="bar__end"></span></div>`;
    const r = `<div class="bar__side bar__side--r">${mk('bar__collar', 0)}${side(plates, skip)}<span class="bar__end"></span></div>`;
    el.innerHTML = l + '<div class="bar__shaft"></div>' + r;
  };

  // ===== HERO =====
  const hero = $('.hero');
  const heroBar = $('#heroBar');
  buildBar(heroBar, heroBar.dataset.plates.split(','));
  $$('.hero__title .ln').forEach((ln, i) => ln.style.setProperty('--n', i));
  const startHero = () => {
    hero.classList.add('is-on');
    heroBar.classList.add('is-on');
  };
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(startHero));
  } else {
    startHero();
  }

  // hero bar drifts on scroll
  if (!reduced) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 700);
        heroBar.style.translate = `${y * -0.06}px ${y * 0.03}px`;
        ticking = false;
      });
    }, { passive: true });
  }

  // ===== SPLIT HEADINGS INTO WORDS =====
  $$('.hd').forEach(h => {
    const text = h.textContent.trim().replace(/\s+/g, ' ');
    h.setAttribute('aria-label', text);
    h.innerHTML = text.split(' ').map((w, i) => `<span class="w" aria-hidden="true" style="--k:${i}"><span>${w}</span></span>`).join(' ');
  });

  // ===== REVEAL OBSERVER =====
  const revealTargets = [
    ...$$('.hd'),
    ...$$('.wipe'),
    ...$$('.protocol'),
    ...$$('.stg'),
  ];
  $('.rows').classList.add('stg');
  $('.price-cols').classList.add('stg');
  $$('.stg').forEach(s => { if (!revealTargets.includes(s)) revealTargets.push(s); });
  $$('.stg').forEach(s => $$(':scope > *', s).forEach((c, i) => c.style.setProperty('--k', i)));
  $$('.protocol__row').forEach((r, i) => r.style.setProperty('--k', i));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach(el => io.observe(el));

  // ===== GOALS =====
  const goals = [
    {
      t: 'Тестостерон и энергия',
      lead: 'Чаще всего с этим приходят мужчины: сил стало меньше, восстановление затянулось, мотивация просела.',
      list: ['Разберём режим, питание и тренировки: часто причина там.', 'Подберу добавки и витамины под вашу задачу, без лишнего.', 'Если вопрос выходит за рамки добавок, прямо скажу, когда нужны анализы и врач.']
    },
    {
      t: 'Масса и сила',
      lead: 'Для тех, кто хочет прибавить в весе и в рабочих весах, а не просто «качаться».',
      list: ['Посчитаем, сколько и чего вам не хватает в рационе.', 'Подберу базу: белок, креатин, аминокислоты, без десятка банок «про запас».', 'Составлю порядок приёма под ваш график тренировок.']
    },
    {
      t: 'Похудение и рельеф',
      lead: 'Убрать лишнее и сохранить мышцы, а не потерять их вместе с жиром.',
      list: ['Разберём текущее питание и где именно «утекают» калории.', 'Подберу добавки, которые помогают держать дефицит, без обещаний чудес.', 'Объясню, как не сорваться и что делать, когда вес встал.']
    },
    {
      t: 'Нервная система и сон',
      lead: 'Тяжёлые тренировки выматывают не только мышцы. Если сон плохой, а тонус упал, результата не будет.',
      list: ['Посмотрим на нагрузку, сон и стресс вместе.', 'Подберу поддержку для восстановления нервной системы.', 'Скажу, что стоит поменять в режиме до любых добавок.']
    },
    {
      t: 'Суставы, связки, травмы',
      lead: 'Для тех, кто восстанавливается после нагрузок и травм или хочет беречь суставы в тяжёлых тренировках.',
      list: ['Подберу поддерживающие добавки на период восстановления.', 'Объясню, как совмещать приём с тренировками и когда сбавить вес.', 'Если травма свежая, сначала врач. Тут я не заменяю медицину.']
    },
    {
      t: 'Кожа, ногти, волосы',
      lead: 'У женщин запросы те же, что и у мужчин, плюс отдельный подбор для красоты и тонуса.',
      list: ['Разберём питание и то, чего организму не хватает.', 'Подберу комплексы для кожи, ногтей и волос.', 'Совмещу с вашими тренировочными или похудательными целями.']
    },
    {
      t: 'Подготовка к соревнованиям',
      lead: 'Моя основа: я готовлю спортсменов к выступлениям на помосте.',
      list: ['Распишу питание и добавки по этапам подготовки.', 'Учту ваш вес, категорию и график тренировок.', 'Подберу то, что поддерживает восстановление между тяжёлыми циклами.']
    }
  ];
  const tabs = $$('.goal-tab');
  const gpInner = $('.goal-panel__inner');
  const gpTitle = $('#gp-title');
  const gpLead = $('#gp-lead');
  const gpList = $('#gp-list');
  const gpCta = $('#gp-cta');
  const panel = $('#panel');
  const selectTab = (i, focus) => {
    const g = goals[i];
    tabs.forEach((t, k) => {
      const on = k === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', 'tab-' + i);
    gpTitle.textContent = g.t;
    gpLead.textContent = g.lead;
    gpList.innerHTML = g.list.map(x => `<li>${x}</li>`).join('');
    gpCta.dataset.goal = g.t;
    gpInner.classList.remove('is-swap');
    void gpInner.offsetWidth;
    gpInner.classList.add('is-swap');
    if (focus) tabs[i].focus();
    if (window.matchMedia('(max-width: 900px)').matches) tabs[i].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    t.addEventListener('keydown', e => {
      const k = e.key;
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(k)) return;
      e.preventDefault();
      let n = i;
      if (k === 'ArrowDown' || k === 'ArrowRight') n = (i + 1) % tabs.length;
      if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      if (k === 'Home') n = 0;
      if (k === 'End') n = tabs.length - 1;
      selectTab(n, true);
    });
  });

  // ===== PREFILL FORM FROM CTAs =====
  const goalSelect = $('#f-goal');
  const commentField = $('#f-comment');
  let orderNote = '';
  $$('[data-goal]').forEach(a => {
    a.addEventListener('click', () => {
      const g = a.dataset.goal;
      if ([...goalSelect.options].some(o => o.value === g || o.text === g)) goalSelect.value = g;
      orderNote = a.id === 'calcCta' ? `Хочу заказ примерно на ${fmt(calcValue())} ₽.` : '';
    });
  });

  // ===== CALC =====
  const box = $('#calcBox');
  const calcBar = $('#calcBar');
  const range = $('#calcRange');
  const sumEl = $('#calcSum');
  const msgEl = $('#calcMsg');
  const DENOMS = [['red', 10000], ['blue', 5000], ['yellow', 2000], ['green', 1000]];
  const LIMIT = 30000;
  let shownSum = 0;
  let prevPlates = [];
  let wasLocked = false;
  let tween = 0;

  const platesFor = s => {
    const out = [];
    let rest = s;
    DENOMS.forEach(([name, v]) => { while (rest >= v) { out.push(name); rest -= v; } });
    return out;
  };
  const calcValue = () => Number(range.value);
  const setSum = to => {
    cancelAnimationFrame(tween);
    const from = shownSum, t0 = performance.now(), dur = reduced ? 1 : 380;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur);
      shownSum = from + (to - from) * (1 - Math.pow(1 - p, 3));
      sumEl.textContent = fmt(shownSum) + ' ₽';
      if (p < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
  };
  const renderCalc = (animate = true) => {
    const s = calcValue();
    const plates = platesFor(s);
    const grown = plates.length > prevPlates.length;
    buildBar(calcBar, plates, animate && grown ? plates.length - prevPlates.length : 0);
    calcBar.classList.add('is-on');
    calcBar.style.animation = 'none';
    prevPlates = plates;
    setSum(s);
    range.style.setProperty('--p', (s / Number(range.max)) * 100 + '%');
    const locked = s >= LIMIT;
    box.classList.toggle('is-locked', locked);
    if (s === 0) msgEl.textContent = 'Двигайте ползунок, чтобы загрузить гриф.';
    else if (!locked) msgEl.textContent = `Ещё ${fmt(LIMIT - s)} ₽ — и консультация с доставкой бесплатно.`;
    else msgEl.textContent = 'Гриф закрыт: консультация и доставка бесплатны.';
    if (locked && !wasLocked && animate && !reduced) {
      calcBar.style.animation = 'whip 1s var(--ease)';
    }
    wasLocked = locked;
  };
  range.addEventListener('input', () => renderCalc(true));
  $$('.chip').forEach(c => c.addEventListener('click', () => { range.value = c.dataset.v; renderCalc(true); }));
  renderCalc(false);

  // ===== STEPS PROGRESS =====
  const steps = $('#steps');
  const stepEls = $$('.step', steps);
  const updateSteps = () => {
    const r = steps.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.max(0, Math.min(1, (vh * 0.62 - r.top) / r.height));
    steps.style.setProperty('--p', p.toFixed(3));
    const line = r.top + p * r.height;
    stepEls.forEach(s => s.classList.toggle('is-lit', s.getBoundingClientRect().top + 14 <= line + 2));
  };
  window.addEventListener('scroll', updateSteps, { passive: true });
  window.addEventListener('resize', updateSteps);
  updateSteps();

  // ===== FAQ =====
  $$('.qa').forEach(qa => {
    const btn = $('button', qa);
    btn.addEventListener('click', () => {
      const open = !qa.classList.contains('is-open');
      qa.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  // ===== MAGNETIC BUTTONS =====
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    $$('.btn--lg, .header__cta').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.28;
        b.style.transform = `translate(${x}px, ${y}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  // ===== FORM → CLOUDFLARE WORKER → TELEGRAM =====
  const form = $('#leadForm');
  const hint = $('#formHint');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button[type="submit"]', form);
    const label = $('span', btn);
    const orig = label.textContent;
    const fd = new FormData(form);
    const data = {};
    fd.forEach((v, k) => { data[k] = typeof v === 'string' ? v.trim() : v; });
    if (data._gotcha) return;

    const nameF = $('#f-name'), phoneF = $('#f-phone');
    nameF.classList.toggle('is-error', !data.name);
    phoneF.classList.toggle('is-error', !data.phone);
    if (!data.name || !data.phone) {
      hint.className = 'form__hint is-err';
      hint.textContent = 'Заполните имя и контакт, чтобы я мог с вами связаться.';
      return;
    }

    const parts = [`Цель: ${data.goal}.`];
    if (orderNote) parts.push(orderNote);
    if (data.comment) parts.push(data.comment);
    const payload = { name: data.name, phone: data.phone, comment: parts.join(' ') };

    btn.disabled = true;
    label.textContent = 'Отправляем...';
    hint.className = 'form__hint';
    hint.textContent = '';
    try {
      const resp = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      label.textContent = 'Заявка отправлена';
      hint.className = 'form__hint is-ok';
      hint.textContent = 'Принял. Свяжусь с вами и задам пару вопросов по цели.';
      form.reset();
      orderNote = '';
    } catch (err) {
      console.error(err);
      label.textContent = 'Не отправилось';
      hint.className = 'form__hint is-err';
      hint.textContent = 'Не получилось отправить. Попробуйте ещё раз или напишите во ВКонтакте.';
    } finally {
      setTimeout(() => { label.textContent = orig; btn.disabled = false; }, 3500);
    }
  });
})();
