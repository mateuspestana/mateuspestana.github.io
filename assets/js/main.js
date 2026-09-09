/* Matheus C. Pestana - CV terminal/dashboard
   JavaScript vanilla. GSAP + ScrollTrigger + Lenis são opcionais (via CDN):
   se não carregarem, a página degrada para estático sem quebrar. */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;
  var body = document.body;

  /* -------------------------------------------------- boot */
  (function boot() {
    var el = document.getElementById("boot");
    if (!el) return;
    var log = el.querySelector(".boot-log");
    var skip = el.querySelector("[data-skip-boot]");
    var done = false;

    function finish() {
      if (done) return;
      done = true;
      body.setAttribute("data-boot", "done");
      body.style.overflow = "";
      try { sessionStorage.setItem("mp-booted", "1"); } catch (e) {}
      var cmd = document.querySelector(".p-cmd[data-type]");
      if (cmd && !reduce) typewrite(cmd);
    }

    var seen = false;
    try { seen = sessionStorage.getItem("mp-booted") === "1"; } catch (e) {}
    if (reduce || seen || location.search.indexOf("noboot") > -1) { finish(); return; }

    setTimeout(finish, 6000); // trava de segurança: nunca deixa o overlay preso
    skip.addEventListener("click", finish);
    window.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { finish(); window.removeEventListener("keydown", onKey); }
    });

    var lines = [
      { t: "matheus@pestana boot loader v2026.1", c: "ok" },
      { t: "carregando perfil ...................... ok", c: "ok" },
      { t: "  cientista político ................... ok", c: "ok" },
      { t: "  cientista de dados ................... ok", c: "ok" },
      { t: "  professor @ FGV Comunicação .......... ok", c: "ok" },
      { t: "montando ~/pesquisa ~/trajetoria ~/ensino", c: "ok" },
      { t: "pronto.", c: "" },
      { t: "$ ./matheus --start", c: "" }
    ];
    var i = 0, buf = "";
    (function step() {
      if (done) return;
      if (i >= lines.length) { setTimeout(finish, 380); return; }
      var ln = lines[i++];
      buf += (ln.c ? '<span class="ok">' + ln.t + "</span>" : ln.t) + "\n";
      log.innerHTML = buf + '<span class="boot-cursor"></span>';
      setTimeout(step, 190 + Math.random() * 130);
    })();
  })();

  /* -------------------------------------------------- typewriter */
  function typewrite(node) {
    var full = node.getAttribute("data-type") || node.textContent;
    node.textContent = "";
    node.classList.add("typing");
    var n = 0;
    (function tick() {
      node.textContent = full.slice(0, ++n);
      if (n < full.length) setTimeout(tick, 55 + Math.random() * 45);
      else node.classList.remove("typing");
    })();
  }
  if (reduce) {
    var c0 = document.querySelector(".p-cmd[data-type]");
    if (c0) c0.textContent = c0.getAttribute("data-type");
  }

  /* -------------------------------------------------- reveal on scroll */
  var revealTargets = [];
  document.querySelectorAll(".section > *").forEach(function (n) { revealTargets.push(n); });
  document.querySelectorAll(".tl-item, .card, .kpi, .courses li").forEach(function (n) { revealTargets.push(n); });

  if (reduce || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (n) { n.classList.add("in"); });
  } else {
    revealTargets.forEach(function (n) { n.classList.add("reveal"); });
    var revIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); revIO.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealTargets.forEach(function (n) { revIO.observe(n); });
  }

  /* -------------------------------------------------- count-up */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    if (reduce || isNaN(target)) { el.textContent = prefix + target; return; }
    var dur = 1100, start = performance.now();
    (function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + target;
    })(start);
  }
  observeOnce(".kpi-num", countUp, 0.6);

  /* -------------------------------------------------- heatmap stagger */
  observeOnce(".heatmap-grid", function (grid) {
    var cells = grid.querySelectorAll(".hm-cell");
    cells.forEach(function (cell, idx) {
      if (reduce) return;
      cell.style.opacity = "0";
      cell.style.transform = "scale(.55)";
      setTimeout(function () {
        cell.style.opacity = "1";
        cell.style.transform = "none";
      }, idx * 55);
    });
  }, 0.4);

  /* -------------------------------------------------- scramble headings */
  var GLYPHS = "abcdefghijklmnopqrstuvwxyz-_/#$>~01".split("");
  function scramble(el) {
    if (reduce) return;
    var final = el.textContent, len = final.length, frame = 0;
    var id = setInterval(function () {
      var out = "";
      for (var k = 0; k < len; k++) {
        if (final[k] === " ") { out += " "; continue; }
        out += (k < frame) ? final[k] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      frame += 1 / 2;
      if (frame >= len) { clearInterval(id); el.textContent = final; }
    }, 28);
  }
  observeOnce(".cmd-h[data-scramble]", scramble, 0.7);

  /* -------------------------------------------------- magnetic */
  if (!reduce && !isTouch) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var raf = null, tx = 0, ty = 0;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        ty = (e.clientY - (r.top + r.height / 2)) * 0.4;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      el.addEventListener("pointerleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      function apply() {
        raf = null;
        el.style.setProperty("--mgx", tx.toFixed(2) + "px");
        el.style.setProperty("--mgy", ty.toFixed(2) + "px");
      }
    });
  }

  /* -------------------------------------------------- hero spotlight */
  if (!reduce && !isTouch) {
    var hero = document.getElementById("hero");
    if (hero) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        hero.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    }
  }

  /* -------------------------------------------------- active nav */
  if ("IntersectionObserver" in window) {
    var navLinks = {};
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      navLinks[a.getAttribute("href").slice(1)] = a;
    });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = navLinks[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove("active"); });
          a.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { navIO.observe(s); });
  }

  /* -------------------------------------------------- prompt command line */
  var form = document.querySelector("[data-echo]");
  if (form) {
    var input = form.querySelector("input");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim().toLowerCase();
      if (!v) return;
      if (v.indexOf("mail") === 0) { location.href = "mailto:matheus.pestana@fgv.br"; }
      else if (v.indexOf("cv") === 0) { location.href = "/assets/cv.pdf"; }
      else if (v.indexOf("github") === 0) { window.open("https://github.com/mateuspestana", "_blank", "noopener"); }
      else if (v.indexOf("crt") === 0) { toggleCRT(); }
      else if (v === "help" || v === "?") { input.value = "cmds: mail  cv  github  crt"; return; }
      else { input.value = v + ": command not found"; return; }
      input.value = "";
    });
  }

  /* -------------------------------------------------- CRT toggle */
  function toggleCRT(force) {
    var off = (force === "off") || (force === undefined && !body.classList.contains("crt-off"));
    body.classList.toggle("crt-off", off);
    try { localStorage.setItem("mp-crt", off ? "off" : "on"); } catch (e) {}
    if (crtBtn) crtBtn.textContent = "crt: " + (off ? "off" : "on");
  }
  try { if (localStorage.getItem("mp-crt") === "off") body.classList.add("crt-off"); } catch (e) {}
  var crtBtn = null;
  var foot = document.querySelector(".site-foot");
  if (foot) {
    crtBtn = document.createElement("button");
    crtBtn.type = "button";
    crtBtn.className = "crt-toggle";
    crtBtn.textContent = "crt: " + (body.classList.contains("crt-off") ? "off" : "on");
    crtBtn.style.cssText = "background:none;border:1px solid var(--border);color:var(--dim);font:inherit;font-size:.78rem;padding:.2rem .55rem;cursor:pointer";
    crtBtn.addEventListener("click", function () { toggleCRT(); });
    foot.insertBefore(crtBtn, foot.firstChild);
  }

  /* -------------------------------------------------- research graph */
  var canvas = document.querySelector("canvas.graph");
  var gp = reduce ? 1 : 0; // reveal progress 0..1
  if (canvas) initGraph(canvas);

  function initGraph(cv) {
    var ctx = cv.getContext("2d");
    // 9 nós externos numa elipse + 1 nó central (metodologia), que aparece por último
    var labels = [
      "autoritarismo\neleitoral", "Rússia", "comportamento\nlegislativo",
      "religião\ne política", "estudos visuais\nem redes sociais", "segurança\npública",
      "IA e\nregulação", "NLP", "knowledge\ngraphs",
      "metodologia quant.\ne estatística"
    ];
    var OUT = 9;                 // nós externos: índices 0..8
    var N = labels.length;       // 10 (o índice 9 é o hub central)
    var nodes = labels.map(function (t, k) {
      if (k === OUT) return { t: t, bx: 0.5, by: 0.5, ph: 0, hub: true };
      var ang = (k / OUT) * Math.PI * 2 - Math.PI / 2;
      return { t: t, bx: 0.5 + Math.cos(ang) * 0.33, by: 0.5 + Math.sin(ang) * 0.34, ph: Math.random() * 6.28 };
    });
    var edges = [
      [1, 0], [0, 2], [2, 3], [3, 4], [4, 7], [4, 5], [5, 6], [6, 7], [7, 8], [8, 0]
    ];
    for (var h9 = 0; h9 < OUT; h9++) edges.push([9, h9]); // hub liga a todos
    var t0 = performance.now();

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = cv.clientWidth, hh = cv.clientHeight || w * (380 / 900);
      cv.width = w * dpr; cv.height = hh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", debounce(function () { resize(); draw(); }, 150));
    resize();

    function draw() {
      var w = cv.clientWidth, H = cv.clientHeight || w * (380 / 900);
      var now = performance.now(), t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, H);
      var vis = Math.max(2, gp * (N + 0.8));
      var pad = 10;

      var pos = nodes.map(function (n, k) {
        var amp = n.hub ? 0 : 4;
        var fx = reduce ? 0 : Math.sin(t * 0.6 + n.ph) * amp;
        var fy = reduce ? 0 : Math.cos(t * 0.5 + n.ph) * amp;
        return { x: n.bx * w + fx, y: n.by * H + fy, on: k < vis };
      });

      ctx.lineWidth = 1;
      edges.forEach(function (e) {
        if (!pos[e[0]].on || !pos[e[1]].on) return;
        ctx.strokeStyle = (e[0] === 9 || e[1] === 9) ? "rgba(94,240,138,0.13)" : "rgba(94,240,138,0.24)";
        ctx.beginPath();
        ctx.moveTo(pos[e[0]].x, pos[e[0]].y);
        ctx.lineTo(pos[e[1]].x, pos[e[1]].y);
        ctx.stroke();
      });

      ctx.font = "10.5px 'IBM Plex Mono', monospace";
      ctx.textBaseline = "middle";
      pos.forEach(function (p, k) {
        if (!p.on) return;
        var n = nodes[k];
        var appear = Math.min(1, vis - k);
        ctx.globalAlpha = appear;
        ctx.fillStyle = "#5EF08A";
        ctx.beginPath();
        ctx.arc(p.x, p.y, n.hub ? 7 : 4.5, 0, 6.2832);
        ctx.fill();

        // posiciona o rótulo para não sair da área
        var lines = n.t.split("\n");
        var align = "center", lx = p.x;
        if (!n.hub && p.x < w * 0.2) { align = "left"; lx = p.x + 8; }
        else if (!n.hub && p.x > w * 0.8) { align = "right"; lx = p.x - 8; }
        else { lx = Math.max(pad + 46, Math.min(w - pad - 46, p.x)); }
        ctx.textAlign = align;
        var below = n.hub || p.y < H * 0.55;
        var y0 = below ? p.y + (n.hub ? 16 : 14) : p.y - 14 - (lines.length - 1) * 12;
        ctx.fillStyle = n.hub ? "#E6EFE8" : "#C8D2CC";
        lines.forEach(function (line, li) { ctx.fillText(line, lx, y0 + li * 12); });
        ctx.globalAlpha = 1;
      });
    }

    if (reduce) { draw(); return; }

    // roda o loop de desenho apenas enquanto a seção está visível
    var running = false, rafId = null;
    function loop() { draw(); rafId = requestAnimationFrame(loop); }
    function start() { if (!running) { running = true; loop(); } }
    function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
      }, { threshold: 0.01 }).observe(cv);
    } else {
      start();
    }
  }

  /* -------------------------------------------------- GSAP + Lenis */
  window.addEventListener("load", function () {
    if (reduce) return;
    var gsap = window.gsap, ST = window.ScrollTrigger, Lenis = window.Lenis;
    var lenis = null;

    if (Lenis) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      if (gsap) {
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } else {
        requestAnimationFrame(function raf(tm) { lenis.raf(tm); requestAnimationFrame(raf); });
      }
    }

    if (gsap && ST) {
      gsap.registerPlugin(ST);
      if (lenis) lenis.on("scroll", ST.update);

      var holder = document.querySelector("#pesquisa .graph-holder");
      if (holder && window.innerWidth > 720) {
        // sem pin: o grafo se monta conforme a seção passa pela viewport
        ST.create({
          trigger: holder,
          start: "top 85%",
          end: "bottom 55%",
          scrub: true,
          onUpdate: function (self) { gp = self.progress; },
          onLeave: function () { gp = 1; },
          onLeaveBack: function () { gp = 0; }
        });
      } else {
        gp = 1;
      }
    } else {
      gp = 1; // sem GSAP: mostra o grafo completo
    }
  });

  /* -------------------------------------------------- helpers */
  function observeOnce(sel, fn, threshold) {
    var els = document.querySelectorAll(sel);
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { fn(en.target); io.unobserve(en.target); }
      });
    }, { threshold: threshold || 0.3 });
    els.forEach(function (el) { io.observe(el); });
  }
  function debounce(fn, ms) {
    var t; return function () { clearTimeout(t); var a = arguments, c = this; t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }
})();
