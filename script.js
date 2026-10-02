(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('site-header');
  var hero = document.getElementById('hero');

  // Nav: transparent with Ivory logo over the hero, solid Ivory after it.
  function updateHeader() {
    var heroBottom = hero.getBoundingClientRect().bottom;
    header.classList.toggle('is-over-hero', heroBottom > header.offsetHeight);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);

  initFlipCards();
  initTower();
  initRing();
  initDotProximity();
  initFlytrap();
  initExplorer();
  initSopLab();
  initCalculator();
  initQuotes();
  initAccordion();

  var reveals = document.querySelectorAll('[data-reveal]');
  var sections = document.querySelectorAll('.section');
  var diagram = document.querySelector('[data-diagram]');
  var grids = document.querySelectorAll('.dotgrid');

  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
    sections.forEach(function (el) { el.classList.add('is-in'); });
    if (diagram) diagram.classList.add('is-in');
    grids.forEach(function (g) { g.classList.add('is-in'); });
    return;
  }

  // Stagger siblings by 60ms, max 6 in a group.
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentNode.children, function (s) {
      return s.hasAttribute('data-reveal');
    });
    var i = Math.min(siblings.indexOf(el), 5);
    if (i > 0) el.style.transitionDelay = (i * 60) + 'ms';
  });

  // Dot grid: random fade-in order across 1,200ms total (900ms of delays + 300ms fade).
  grids.forEach(function (g) {
    var dots = g.querySelectorAll('.dots circle');
    for (var i = 0; i < dots.length; i++) {
      dots[i].style.transitionDelay = Math.round(Math.random() * 900) + 'ms';
    }
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  reveals.forEach(function (el) { io.observe(el); });
  if (diagram) io.observe(diagram);
  grids.forEach(function (g) { io.observe(g); });

  // Sections fade + rise as they enter (tall sections: trigger on first 10% of viewport).
  var sectionIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      sectionIO.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  sections.forEach(function (s) { sectionIO.observe(s); });

  // Clear stagger delays after reveal so later transitions are not delayed.
  document.addEventListener('transitionend', function (e) {
    if (e.target.hasAttribute && e.target.hasAttribute('data-reveal') && e.propertyName === 'opacity') {
      e.target.style.transitionDelay = '';
    }
  });

  /* ---------- Flip cards ---------- */
  function initFlipCards() {
    document.querySelectorAll('[data-flip]').forEach(function (card) {
      if (reduced && card.hasAttribute('data-flip-static-reduced')) { card.classList.add('flip-static'); return; }
      var btn = card.querySelector('.flip-btn');
      var front = card.querySelector('.flip-front');
      var back = card.querySelector('.flip-back');
      function set(flipped) {
        card.classList.toggle('is-flipped', flipped);
        btn.setAttribute('aria-expanded', flipped ? 'true' : 'false');
        front.setAttribute('aria-hidden', flipped ? 'true' : 'false');
        back.setAttribute('aria-hidden', flipped ? 'false' : 'true');
      }
      set(false);
      btn.addEventListener('click', function () {
        set(!card.classList.contains('is-flipped'));
      });
    });
  }

  /* ---------- Block tower toy (section 02) ---------- */
  function initTower() {
    var root = document.querySelector('[data-tower]');
    if (!root || reduced || !window.Matter) return; // static fallen pile stays visible

    var M = window.Matter;
    var W = 400, H = 440, FLOOR = 420, PED_TOP = 404;
    var canvas = root.querySelector('.tower-canvas');
    var ctx = canvas.getContext('2d');
    var status = root.querySelector('[data-tower-status]');
    var css = getComputedStyle(document.documentElement);
    var C = {
      prussian: css.getPropertyValue('--prussian').trim(),
      gunmetal: css.getPropertyValue('--gunmetal').trim(),
      ivory: css.getPropertyValue('--ivory').trim(),
      hair: css.getPropertyValue('--prussian-12').trim()
    };
    var FILLS = [C.prussian, C.gunmetal, C.ivory];
    var SIZES = [[84, 32], [64, 44], [48, 48], [76, 28], [56, 36], [40, 40], [92, 24]];

    var engine = M.Engine.create();
    engine.gravity.y = 1;
    var world = engine.world;
    var floor = M.Bodies.rectangle(W / 2, FLOOR + 20, W * 2, 40, { isStatic: true, friction: 0.9 });
    var pedestal = M.Bodies.rectangle(W / 2, PED_TOP + 8, 100, 16, { isStatic: true, friction: 1 });
    var wallL = M.Bodies.rectangle(-20, H / 2, 40, H * 2, { isStatic: true });
    var wallR = M.Bodies.rectangle(W + 20, H / 2, 40, H * 2, { isStatic: true });
    M.Composite.add(world, [floor, pedestal, wallL, wallR]);

    var blocks = [];
    var next = pickBlock(0);
    var ghostX = W / 2;
    var state = 'building'; // building | fallen
    var doomAt = 5 + Math.floor(Math.random() * 3); // the tower always falls by this height
    var t = 0, doomTime = 0, resetTimer = null;

    function pickBlock(i) {
      var s = SIZES[Math.floor(Math.random() * SIZES.length)];
      return { w: s[0], h: s[1], fill: FILLS[i % FILLS.length] };
    }

    function say(msg) { status.textContent = msg; }

    function drop(x) {
      if (state !== 'building') return;
      x = Math.max(next.w / 2 + 4, Math.min(W - next.w / 2 - 4, x));
      var b = M.Bodies.rectangle(x, 24, next.w, next.h, {
        friction: 0.7, frictionStatic: 0.9, restitution: 0.02, density: 0.002
      });
      b.render.fillStyle = next.fill;
      M.Composite.add(world, b);
      blocks.push(b);
      next = pickBlock(blocks.length);
      say('Blocks: ' + blocks.length + '.');
    }

    function reset() {
      clearTimeout(resetTimer);
      blocks.forEach(function (b) { M.Composite.remove(world, b); });
      blocks = [];
      state = 'building';
      doomAt = 5 + Math.floor(Math.random() * 3);
      doomTime = 0;
      engine.gravity.x = 0;
      say('New tower. Start building.');
    }

    function towerFell() {
      return blocks.some(function (b) {
        var settledLow = b.position.y > PED_TOP + 2 && b.speed < 3;
        return settledLow || Math.abs(b.angle) > 1.2;
      });
    }

    function step() {
      t += 1 / 60;
      var n = blocks.length;
      if (state === 'building' && n >= 2) {
        // Wobble grows with height; past the "doom" height it keeps growing until it topples.
        var amp = Math.min(0.012 * Math.pow(n - 1, 1.5), 0.25);
        if (n >= doomAt) { doomTime += 1 / 60; amp += doomTime * 0.06; }
        engine.gravity.x = amp * Math.sin(t * 2 * Math.PI / 1.7);
      } else {
        engine.gravity.x = 0;
      }
      M.Engine.update(engine, 1000 / 60);

      if (state === 'building' && n > 0 && towerFell()) {
        state = 'fallen';
        engine.gravity.x = 0;
        say('The tower fell. It resets in a moment.');
        resetTimer = setTimeout(reset, 2600);
      }
    }

    var dpr = 1, scale = 1;
    function resize() {
      var r = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      scale = r.width / W;
    }

    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = C.ivory;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);

      ctx.strokeStyle = C.hair; ctx.lineWidth = 1 / scale;
      ctx.beginPath(); ctx.moveTo(0, FLOOR + 0.5); ctx.lineTo(W, FLOOR + 0.5); ctx.stroke();
      ctx.fillStyle = C.prussian;
      ctx.fillRect(W / 2 - 50, PED_TOP, 100, 16);

      if (state === 'building') {
        var gx = Math.max(next.w / 2 + 4, Math.min(W - next.w / 2 - 4, ghostX));
        ctx.fillStyle = C.hair;
        ctx.fillRect(gx - next.w / 2, 24 - next.h / 2, next.w, next.h);
      }

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = C.prussian;
      blocks.forEach(function (b) {
        var v = b.vertices;
        ctx.beginPath();
        ctx.moveTo(v[0].x, v[0].y);
        for (var i = 1; i < v.length; i++) ctx.lineTo(v[i].x, v[i].y);
        ctx.closePath();
        ctx.fillStyle = b.render.fillStyle;
        ctx.fill();
        ctx.stroke();
      });
    }

    var running = false, raf = 0;
    function loop() {
      step(); draw();
      if (running) raf = requestAnimationFrame(loop);
    }
    function start() { if (!running) { running = true; resize(); raf = requestAnimationFrame(loop); } }
    function stop() { running = false; cancelAnimationFrame(raf); }

    function toLogicalX(e) {
      var r = canvas.getBoundingClientRect();
      return (e.clientX - r.left) / r.width * W;
    }
    canvas.addEventListener('pointermove', function (e) { ghostX = toLogicalX(e); });
    canvas.addEventListener('pointerdown', function (e) { ghostX = toLogicalX(e); });
    canvas.addEventListener('pointerleave', function () { ghostX = W / 2; });
    canvas.addEventListener('pointerup', function (e) {
      drop(toLogicalX(e));
      if (e.pointerType !== 'mouse') ghostX = W / 2;
    });

    root.querySelector('[data-tower-add]').addEventListener('click', function () {
      drop(W / 2 + (Math.random() * 24 - 12));
    });
    root.querySelector('[data-tower-reset]').addEventListener('click', reset);

    root.classList.add('is-live');
    window.addEventListener('resize', function () { if (running) resize(); });

    // Only simulate while the toy is on screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
      }).observe(root);
    } else {
      start();
    }
  }
  /* ---------- Section 03: the delegation ring ---------- */
  function initRing() {
    var root = document.querySelector('[data-ring]');
    if (!root || reduced) return; // the static three-column diagram stays

    var section = root.closest('section');
    var svg = root.querySelector('.ring-svg');
    var knob = root.querySelector('.ring-knob');
    var prog = root.querySelector('.ring-progress');
    var stations = root.querySelectorAll('.station');
    var labels = root.querySelectorAll('.station-label');
    var panel = root.querySelector('.ring-panel');
    var numEl = panel.querySelector('.ring-num');
    var titleEl = panel.querySelector('.ring-title');
    var textEl = panel.querySelector('.ring-text');
    var S2 = parseFloat(root.getAttribute('data-s2'));
    var C = 220, R = 176;

    // Copy comes from the static diagram, so it exists in one place only.
    var STAGES = Array.prototype.map.call(section.querySelectorAll('.stage'), function (li) {
      return { title: li.querySelector('h3').textContent, text: li.querySelector('.stage-body p').textContent };
    });

    var p = 0, stage = 0, dragging = false, lastRaw = 0, tweenRaf = 0;

    function stageOf(v) { return v >= 0.999 ? 3 : (v >= S2 - 0.001 ? 2 : 1); }

    function render() {
      var a = (-90 + 360 * p) * Math.PI / 180;
      knob.setAttribute('transform', 'translate(' + (C + R * Math.cos(a)).toFixed(2) + ' ' + (C + R * Math.sin(a)).toFixed(2) + ')');
      prog.setAttribute('stroke-dasharray', (p * 100).toFixed(2) + ' 100');
      var s = stageOf(p);
      stations.forEach(function (st) { st.classList.toggle('is-reached', +st.getAttribute('data-station') <= s); });
      labels.forEach(function (l) { l.classList.toggle('is-active', +l.getAttribute('data-label') === s); });
      knob.setAttribute('aria-valuenow', Math.round(p * 100));
      var between = s === 2 && p > S2 + 0.001;
      knob.setAttribute('aria-valuetext', between
        ? 'Between stage 2 and stage 3'
        : 'Stage ' + s + ' of 3: ' + STAGES[s - 1].title);
      if (s !== stage) setStage(s);
    }

    function setStage(s) {
      var first = stage === 0;
      stage = s;
      svg.classList.remove('is-closed');
      if (s === 3) { void svg.getBoundingClientRect(); svg.classList.add('is-closed'); }
      function swap() {
        numEl.textContent = s;
        titleEl.textContent = STAGES[s - 1].title;
        textEl.textContent = STAGES[s - 1].text;
        panel.classList.toggle('is-final', s === 3);
        panel.classList.remove('is-fading');
      }
      if (first) { swap(); return; }
      panel.classList.add('is-fading');
      setTimeout(function () { if (stage === s) swap(); }, 180);
    }

    // Forward movement past stage 2 is heavy: the dot follows at a third of the speed.
    function move(d) {
      if (d > 0) {
        if (p < S2) {
          var room = S2 - p;
          if (d <= room) { p += d; d = 0; } else { p = S2; d -= room; }
        }
        if (d > 0) p += d / 3;
      } else {
        p += d;
      }
      p = Math.max(0, Math.min(1, p));
      render();
    }

    function cancelTween() { cancelAnimationFrame(tweenRaf); }
    function tweenTo(target, dur) {
      cancelTween();
      var from = p, t0 = performance.now();
      (function frame(now) {
        var k = Math.min(1, Math.max(0, (now - t0) / dur));
        var e = 1 - Math.pow(1 - k, 3);
        p = k === 1 ? target : from + (target - from) * e;
        render();
        if (k < 1) tweenRaf = requestAnimationFrame(frame);
      })(t0);
    }

    function rawAt(e) {
      var m = svg.getScreenCTM();
      var pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      var loc = pt.matrixTransform(m.inverse());
      var ang = Math.atan2(loc.y - C, loc.x - C) * 180 / Math.PI;
      return ((((ang + 90) / 360) % 1) + 1) % 1;
    }

    knob.addEventListener('pointerdown', function (e) {
      cancelTween();
      dragging = true;
      knob.setPointerCapture(e.pointerId);
      knob.classList.add('is-dragging');
      lastRaw = rawAt(e);
      e.preventDefault();
    });
    knob.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var raw = rawAt(e);
      var d = raw - lastRaw;
      if (d > 0.5) d -= 1;
      if (d < -0.5) d += 1;
      lastRaw = raw;
      move(d);
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      knob.classList.remove('is-dragging');
      if (p > S2 && p < 1) {
        var f = (p - S2) / (1 - S2);
        if (f >= 0.85) tweenTo(1, 260);   // made it: snap in, the ring closes
        else tweenTo(S2, 520);            // released early: spring back to stage 2
      } else if (p > 0 && p < S2) {
        tweenTo(p < S2 / 2 ? 0 : S2, 300);
      }
    }
    knob.addEventListener('pointerup', release);
    knob.addEventListener('pointercancel', release);
    // touch-action is ignored on SVG shapes, so stop the page from panning when a touch starts on the dot.
    knob.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });

    // Keyboard: a slider. Stage 1 → 2 takes 3 presses; stage 2 → 3 takes 7.
    knob.addEventListener('keydown', function (e) {
      var k = e.key;
      var fwd = k === 'ArrowRight' || k === 'ArrowUp' || k === 'PageUp';
      var back = k === 'ArrowLeft' || k === 'ArrowDown' || k === 'PageDown';
      if (!fwd && !back && k !== 'Home') return;
      e.preventDefault();
      cancelTween();
      if (k === 'Home') {
        p = 0;
      } else if (fwd) {
        if (p < S2 - 0.001) p = Math.min(S2, p + S2 / 3);
        else {
          p = Math.min(1, p + (1 - S2) / 8);
          if ((p - S2) / (1 - S2) >= 0.85) p = 1;
        }
      } else {
        if (p > S2 + 0.001) p = S2;
        else p = Math.max(0, p - S2 / 3);
      }
      render();
    });

    section.classList.add('ring-live');
    render();
  }

  /* ---------- Section 05: dots brighten near the pointer ---------- */
  function initDotProximity() {
    document.querySelectorAll('.dotgrid').forEach(function (svg) {
      var cols = svg.classList.contains('dotgrid-wide') ? 40 : 25;
      var rows = 1000 / cols;
      var cells = {};
      svg.querySelectorAll('.dots circle').forEach(function (c) {
        var col = (+c.getAttribute('cx') - 6) / 12, row = (+c.getAttribute('cy') - 6) / 12;
        cells[row * cols + col] = c;
      });
      var lit = [], raf = 0, last = null;

      function clear() {
        lit.forEach(function (c) { c.style.fill = ''; c.style.fillOpacity = ''; c.setAttribute('r', '2.5'); });
        lit = [];
      }
      function update() {
        raf = 0;
        var m = svg.getScreenCTM();
        if (!m || !last) return;
        var pt = svg.createSVGPoint();
        pt.x = last.x; pt.y = last.y;
        var loc = pt.matrixTransform(m.inverse());
        var radius = 60 / m.a; // 60 screen px in SVG units
        clear();
        var c0 = Math.max(0, Math.floor((loc.x - 6 - radius) / 12)), c1 = Math.min(cols - 1, Math.ceil((loc.x - 6 + radius) / 12));
        var r0 = Math.max(0, Math.floor((loc.y - 6 - radius) / 12)), r1 = Math.min(rows - 1, Math.ceil((loc.y - 6 + radius) / 12));
        for (var r = r0; r <= r1; r++) {
          for (var col = c0; col <= c1; col++) {
            var c = cells[r * cols + col];
            if (!c) continue;
            var d = Math.hypot(6 + col * 12 - loc.x, 6 + r * 12 - loc.y);
            if (d >= radius) continue;
            var k = 1 - d / radius;
            c.style.fill = 'var(--ivory)';
            c.style.fillOpacity = (0.2 + 0.6 * k).toFixed(2);
            c.setAttribute('r', (2.5 + 1.2 * k).toFixed(2));
            lit.push(c);
          }
        }
      }
      function onMove(e) {
        last = { x: e.clientX, y: e.clientY };
        if (!raf) raf = requestAnimationFrame(update);
      }
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerdown', onMove);
      ['pointerleave', 'pointercancel'].forEach(function (t) {
        svg.addEventListener(t, function () { last = null; clear(); });
      });
      svg.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') { last = null; clear(); } });
    });
  }

  /* ---------- Section 05: the flytrap ---------- */
  function initFlytrap() {
    var root = document.querySelector('[data-flytrap]');
    if (!root) return;
    var btn = root.querySelector('[data-flytrap-open]');
    var card = root.querySelector('[data-flytrap-card]');
    var bench = document.querySelector('[data-bench]');
    var fly = root.querySelector('.ft-fly');
    var lobeL = root.querySelector('.ft-lobe-l');
    var lobeR = root.querySelector('.ft-lobe-r');
    var wings = root.querySelectorAll('.ft-wing');

    btn.addEventListener('click', function () {
      if (card.classList.contains('is-open')) return;
      card.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      card.focus({ preventScroll: true }); // keep keyboard users on the revealed text
      btn.classList.remove('is-shown');
      btn.hidden = true;
      // The benchmark paragraph only appears once the card is out.
      setTimeout(function () { bench.classList.add('is-shown'); }, reduced ? 0 : 450);
      if (!reduced && fly.animate) release();
    });

    // After "Open the flytrap": the jaws open slowly and the fly leaves across the screen.
    function release() {
      var OPEN_DEG = 38;
      var ease = { duration: 900, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'forwards' };
      var oL = lobeL.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-' + OPEN_DEG + 'deg)' }], ease);
      var oR = lobeR.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + OPEN_DEG + 'deg)' }], ease);

      // Distance to just past the right edge of the viewport, in SVG units.
      var svgEl = root.querySelector('.flytrap-svg');
      var m = svgEl.getScreenCTM();
      var scale = m ? m.a : 1;
      var startX = m ? m.e + 160 * scale : 0;
      var dx = Math.max(400, (window.innerWidth + 60 - startX) / scale);
      var path = [
        [0, 0, 1, 0], [0, -46, 1, 0.16], [16, -84, 1, 0.3], [-8, -112, 1, 0.42],
        [dx * 0.3, -150, 1, 0.6], [dx * 0.7, -190, 1, 0.82], [dx, -230, 0, 1]
      ].map(function (p) { return { transform: 'translate(' + p[0].toFixed(1) + 'px,' + p[1] + 'px)', opacity: p[2], offset: p[3] }; });
      var out = fly.animate(path, { duration: 2800, delay: 450, easing: 'ease-in-out', fill: 'forwards' });
      var flaps = [];
      wings.forEach(function (w) {
        flaps.push(w.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.3)' }],
          { duration: 70, delay: 450, iterations: Math.round(2800 / 70), direction: 'alternate' }));
      });
      out.onfinish = function () {
        root.classList.add('ft-released'); // resting state: jaws open, fly gone
        [oL, oR, out].concat(flaps).forEach(function (a) { a.cancel(); });
      };
    }
    function showButton() { btn.classList.add('is-shown'); }

    if (reduced || !fly.animate || !('IntersectionObserver' in window)) {
      // No animation possible: show the final, closed scene (overrides the CSS start pose).
      root.classList.add('ft-done');
      showButton();
      return;
    }

    // Start pose (jaws open, fly off to the side) is set in CSS from the first paint,
    // so the scene sits paused on its first frame until it is scrolled into view.
    var OPEN = 38;

    var LAND_X = 160, LAND_Y = 126, frames = [], N = 40;
    for (var i = 0; i <= N; i++) {
      var t = i / N, ang = (200 + t * 520) * Math.PI / 180;
      var x = 160 + 112 * Math.cos(ang) * (1 - 0.4 * t);
      var y = 62 + 38 * Math.sin(ang) * (1 - 0.3 * t);
      frames.push({ transform: 'translate(' + (x - LAND_X).toFixed(1) + 'px,' + (y - LAND_Y).toFixed(1) + 'px)', offset: t * 0.74 });
    }
    frames.push({ transform: 'translate(0px,-58px)', offset: 0.86 });
    frames.push({ transform: 'translate(0px,0px)', offset: 1 });

    var played = false;
    function play() {
      if (played) return; // plays once; scrolling away and back does not replay it
      played = true;
      var flight = fly.animate(frames, { duration: 2700, easing: 'linear', fill: 'forwards' });
      var flaps = [];
      wings.forEach(function (w) {
        flaps.push(w.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.3)' }],
          { duration: 70, iterations: Math.round(2700 / 70), direction: 'alternate' }));
      });
      flight.onfinish = function () {
        root.classList.add('ft-landed'); // fly rests at its final spot once the flight animation is removed
        flight.cancel();
        flaps.forEach(function (f) { f.cancel(); });
        var snap = { duration: 260, easing: 'cubic-bezier(0.55, 0, 0.9, 0.45)', fill: 'forwards' };
        var aL = lobeL.animate([{ transform: 'rotate(-' + OPEN + 'deg)' }, { transform: 'rotate(2deg)', offset: 0.8 }, { transform: 'rotate(0deg)' }], snap);
        var aR = lobeR.animate([{ transform: 'rotate(' + OPEN + 'deg)' }, { transform: 'rotate(-2deg)', offset: 0.8 }, { transform: 'rotate(0deg)' }], snap);
        aL.onfinish = function () {
          root.classList.add('ft-done'); // closed jaws become the resting state
          aL.cancel();
          aR.cancel();
          setTimeout(showButton, 250); // the button only appears once everything has played
        };
      };
    }
    // isIntersecting is true for any overlap, so also require 60% of the scene to be visible.
    var ftIO = new IntersectionObserver(function (entries) {
      var en = entries[0];
      if (en.isIntersecting && en.intersectionRatio >= 0.6) { ftIO.disconnect(); play(); }
    }, { threshold: 0.6 });
    ftIO.observe(root.querySelector('.flytrap-svg'));
  }
  /* ---------- Shared: accessible tab list (manual activation) ---------- */
  // Arrow keys / Home / End move focus between tabs; Enter, Space or a click selects.
  function initTablist(list, onSelect) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(i) {
      tabs.forEach(function (t, j) {
        t.setAttribute('aria-selected', j === i ? 'true' : 'false');
        t.tabIndex = j === i ? 0 : -1;
      });
      onSelect(i, tabs[i]);
    }
    // Stacked layout (list above panel): bring the newly shown panel into view.
    function reveal(panel) {
      if (window.matchMedia('(max-width: 1023px)').matches) {
        panel.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
      }
    }
    select.reveal = reveal;
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') n = 0;
        else if (k === 'End') n = tabs.length - 1;
        if (n === null) return;
        e.preventDefault();
        tabs.forEach(function (t2, j) { t2.tabIndex = j === n ? 0 : -1; });
        tabs[n].focus();
      });
    });
    return select;
  }

  /* ---------- Section 05: HIRE explorer ---------- */
  function initExplorer() {
    var root = document.querySelector('[data-explorer]');
    if (!root) return;
    var section = root.closest('section');
    var kicker = root.querySelector('[data-panel-kicker]');
    var title = root.querySelector('[data-panel-title]');
    var text = root.querySelector('[data-panel-text]');
    var panel = root.querySelector('[role="tabpanel"]');

    // Copy is read from the ordered list, so it lives in one place.
    var items = Array.prototype.map.call(section.querySelectorAll('.steps li p'), function (p) {
      var lead = p.querySelector('strong').textContent;
      return { title: lead.replace(/:\s*$/, ''), text: p.textContent.slice(lead.length).trim() };
    });

    var revealPanel = function (p) { selectTab.reveal(p); };
    var selectTab = initTablist(root.querySelector('[role="tablist"]'), function (i, tab) {
      var it = items[i];
      kicker.textContent = 'STEP ' + (i + 1) + ' OF 7';
      title.textContent = it.title;
      text.textContent = it.text;
      panel.setAttribute('aria-labelledby', tab.id);
      revealPanel(panel);
    });
  }

  /* ---------- Section 08: SOP Lab ---------- */
  function initSopLab() {
    var lab = document.querySelector('[data-sop]');
    if (lab) {
      var panels = lab.querySelectorAll('[role="tabpanel"]');
      var show = function (i) { panels.forEach(function (p, j) { p.hidden = j !== i; }); };
      show(0);
      var selectSop = initTablist(lab.querySelector('[role="tablist"]'), function (i) { show(i); selectSop.reveal(panels[i]); });
    }

    var gen = document.querySelector('[data-sop-gen]');
    if (!gen) return;
    var input = gen.querySelector('#sop-task');
    var hint = gen.querySelector('[data-sop-hint]');
    var result = gen.querySelector('[data-sop-result]');
    var STEPS = [
      ['Gather the context', 'Collect the documents, inputs and past examples; confirm access.'],
      ['Do the work', 'Draft the first version to the agreed standard.'],
      ['Review and hand over', 'Check against the standard; send a short summary with next steps.']
    ];
    var TRIGGER = 'When the task is requested or comes due';
    var FREQ = 'As needed';
    var LABEL = 'Starter template, edit it for your business.';

    function el(tag, cls, txt) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (txt != null) n.textContent = txt;
      return n;
    }
    function block(name, body) {
      var b = el('div', 'sop-block');
      b.appendChild(el('p', 'sop-block-title', name));
      if (typeof body === 'string') b.appendChild(el('p', null, body)); else b.appendChild(body);
      return b;
    }

    function generate() {
      var task = input.value.replace(/\s+/g, ' ').trim().slice(0, 120);
      if (!task) { hint.textContent = 'Type a task first.'; input.focus(); return; }
      hint.textContent = '';
      var objective = 'Complete “' + task + '” reliably and on time, with no founder micro-management.';

      result.textContent = '';
      result.appendChild(el('p', 'panel-kicker', LABEL));
      result.appendChild(el('h3', 'panel-title', task));
      result.appendChild(block('Trigger', TRIGGER));
      result.appendChild(block('Frequency', FREQ));
      result.appendChild(block('Objective', objective));
      var ol = el('ol', 'sop-steps');
      STEPS.forEach(function (s) {
        var li = el('li');
        li.appendChild(el('span', 'sop-step-title', s[0]));
        li.appendChild(el('span', 'sop-step-text', s[1]));
        ol.appendChild(li);
      });
      result.appendChild(block('Execution protocol', ol));

      var actions = el('div', 'sop-result-actions');
      var copyBtn = el('button', 'btn-ghost', 'Copy SOP (Markdown)');
      copyBtn.type = 'button';
      var status = el('span', 'sop-copy-status');
      status.setAttribute('aria-live', 'polite');
      actions.appendChild(copyBtn);
      actions.appendChild(status);
      result.appendChild(actions);

      var md = '# ' + task + '\n\n' +
        '**Trigger:** ' + TRIGGER + '  \n' +
        '**Frequency:** ' + FREQ + '  \n' +
        '**Objective:** ' + objective + '\n\n' +
        '## Execution protocol\n\n' +
        STEPS.map(function (s, i) { return (i + 1) + '. **' + s[0] + '.** ' + s[1]; }).join('\n') +
        '\n\n_' + LABEL + '_\n';
      copyBtn.addEventListener('click', function () { copyText(md, status); });

      result.hidden = false;
      result.focus({ preventScroll: true });
      result.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    }

    function copyText(md, status) {
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = md;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        status.textContent = ok ? 'Copied.' : 'Could not copy. Select the text instead.';
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(md).then(function () { status.textContent = 'Copied.'; }, fallback);
      } else {
        fallback();
      }
    }

    gen.querySelector('[data-sop-generate]').addEventListener('click', generate);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); generate(); } });
  }

  /* ---------- Section 07: calculator ---------- */
  function initCalculator() {
    var root = document.querySelector('[data-calc]');
    if (!root) return;
    var rateIn = root.querySelector('#calc-rate');
    var hoursIn = root.querySelector('#calc-hours');
    var costIn = root.querySelector('#calc-cost');
    var empty = root.querySelector('[data-cost-empty]');
    var costOut = root.querySelector('[data-cost-out]');
    var bars = root.querySelectorAll('.bar');
    var BAR_MAX = 35 * 0.35;

    function usd(n) {
      var s = '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
      return n < 0 ? '−' + s : s;
    }
    function int(n) { return Math.round(n).toLocaleString('en-US'); }
    function out(key) { return root.querySelector('[data-out="' + key + '"]'); }

    // Numbers count smoothly to their new value (instant under reduced motion).
    var shown = {}, rafs = {};
    function setNum(key, value, fmt) {
      var node = out(key);
      if (!node) return;
      var from = key in shown ? shown[key] : value;
      shown[key] = value;
      cancelAnimationFrame(rafs[key]);
      if (reduced || from === value) { node.textContent = fmt(value); return; }
      var t0 = performance.now(), dur = 350;
      (function frame(now) {
        var k = Math.min(1, Math.max(0, (now - t0) / dur));
        var e = 1 - Math.pow(1 - k, 3);
        node.textContent = fmt(from + (value - from) * e);
        if (k < 1) rafs[key] = requestAnimationFrame(frame);
      })(t0);
    }

    function update() {
      var rate = +rateIn.value, hrs = +hoursIn.value;
      var week = rate * hrs, year = week * 52;
      setNum('rate', rate, usd);
      setNum('hours', hrs, int);
      setNum('week', week, usd);
      setNum('year', year, usd);
      setNum('yearHours', hrs * 52, int);
      rateIn.setAttribute('aria-valuetext', usd(rate) + ' per hour');
      hoursIn.setAttribute('aria-valuetext', hrs + ' hours a week');
      bars.forEach(function (b) {
        var h = hrs * parseFloat(b.getAttribute('data-share'));
        b.querySelector('[data-bar-val]').textContent = h.toFixed(1) + ' hrs';
        b.querySelector('.bar-fill').style.width = (h / BAR_MAX * 100).toFixed(1) + '%';
      });
      out('cta').textContent = 'Reclaim my ' + hrs + ' hours / week';

      var monthly = parseFloat(costIn.value);
      if (!costIn.value.trim() || !isFinite(monthly) || monthly <= 0) {
        empty.hidden = false;
        costOut.hidden = true;
        return;
      }
      var annual = monthly * 12;
      empty.hidden = true;
      costOut.hidden = false;
      setNum('annualCost', annual, usd);
      setNum('net', year - annual, usd);
      setNum('multiple', year / annual, function (n) { return n.toFixed(1) + 'x'; });
      setNum('payback', annual / (year / 365), function (n) { return Math.round(n).toLocaleString('en-US') + ' days'; });
    }

    [rateIn, hoursIn, costIn].forEach(function (i) { i.addEventListener('input', update); });
    update();
  }

  /* ---------- Section 10: founder quotes as tabs ---------- */
  function initQuotes() {
    var root = document.querySelector('[data-quotes]');
    if (!root) return;
    var panels = root.querySelectorAll('[role="tabpanel"]');
    function show(i) { panels.forEach(function (p, j) { p.hidden = j !== i; }); }
    show(0);
    initTablist(root.querySelector('[role="tablist"]'), function (i) { show(i); });
  }

  /* ---------- Section 12: questions accordion ---------- */
  // Any number of rows can be open. Without JS every answer stays visible.
  function initAccordion() {
    document.querySelectorAll('[data-accordion] .acc-btn').forEach(function (b) {
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.hidden = !open;
      });
    });
  }
})();
