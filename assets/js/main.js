/* DataMundi v4 — interações (Eleventy / vanilla JS)
   Portado dos componentes React da v3: nav, reveals, contagem, filtros, form e globo. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Nav: fundo ao rolar + menu mobile ── */
  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Botão hambúrguer (mobile)
    var toggle = nav.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      // Fecha o menu ao clicar num link
      nav.querySelectorAll(".nav-link").forEach(function (l) {
        l.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ── Reveal ao entrar na tela ── */
  function initReveal() {
    var els = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ── Contagem animada das estatísticas ── */
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    els.forEach(function (el) {
      var n = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suf = el.getAttribute("data-suffix") || "";
      if (reduced || !("IntersectionObserver" in window)) {
        el.textContent = n + suf;
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        var t0 = performance.now(), dur = 1100;
        var tick = function (t) {
          var p = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ── Filtros (notícias / publicações) ── */
  function initFiltros() {
    document.querySelectorAll("[data-filtro-grupo]").forEach(function (grupo) {
      var alvo = document.querySelector(grupo.getAttribute("data-filtro-grupo"));
      if (!alvo) return;
      var itens = alvo.querySelectorAll("[data-tag]");
      grupo.querySelectorAll(".filtro").forEach(function (btn) {
        btn.addEventListener("click", function () {
          grupo.querySelectorAll(".filtro").forEach(function (b) { b.classList.remove("on"); });
          btn.classList.add("on");
          var valor = btn.getAttribute("data-valor");
          itens.forEach(function (it) {
            it.style.display = (valor === "Todos" || it.getAttribute("data-tag") === valor) ? "" : "none";
          });
        });
      });
    });
  }

  /* ── Formulário do boletim (Netlify Forms) ── */
  function initForm() {
    var form = document.getElementById("boletim-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.querySelector("[name=email]");
      var err = form.querySelector(".err-msg");
      if (!email.value.includes("@")) {
        email.classList.add("err");
        if (err) err.style.display = "block";
        return;
      }
      email.classList.remove("err");
      if (err) err.style.display = "none";

      // Envia os dados ao Netlify Forms (armazenados no painel do Netlify;
      // notificações por e-mail são configuradas em Forms → Notifications).
      var dados = new URLSearchParams(new FormData(form)).toString();
      var mostrarSucesso = function () {
        form.style.display = "none";
        var ok = document.getElementById("form-ok");
        if (ok) ok.style.display = "block";
      };
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: dados,
      }).then(mostrarSucesso).catch(mostrarSucesso);
    });
  }

  /* ── Globo de dados (canvas, responsivo) ── */
  function initGlobe() {
    var canvas = document.getElementById("globe");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var maxSize = parseInt(canvas.getAttribute("data-size"), 10) || 560;
    var raf = null;

    function build() {
      if (raf) cancelAnimationFrame(raf);
      // tamanho responsivo: cabe no container, limitado ao data-size
      var parent = canvas.parentElement;
      var avail = parent ? parent.clientWidth : maxSize;
      var size = Math.max(220, Math.min(maxSize, avail || maxSize));

      canvas.style.width = size + "px";
      canvas.style.height = size + "px";
      canvas.style.display = "block";

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var R = size * 0.36;
      var cx = size / 2, cy = size / 2;

      var N = 620;
      var pts = [];
      var golden = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < N; i++) {
        var y = 1 - (i / (N - 1)) * 2;
        var r = Math.sqrt(1 - y * y);
        var th = golden * i;
        pts.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r });
      }

      function mkArc() {
        var a = pts[Math.floor(Math.random() * N)];
        var b = pts[Math.floor(Math.random() * N)];
        return { a: a, b: b, t: 0, speed: 0.004 + Math.random() * 0.005, life: 0 };
      }
      var arcs = [];
      for (var k = 0; k < 6; k++) { var arc = mkArc(); arc.t = -k * 0.3; arcs.push(arc); }

      var rot = 0;

      function project(p, rotY) {
        var cos = Math.cos(rotY), sin = Math.sin(rotY);
        var x = p.x * cos - p.z * sin;
        var z = p.x * sin + p.z * cos;
        var tilt = -0.35;
        var yy = p.y * Math.cos(tilt) - z * Math.sin(tilt);
        var z2 = p.y * Math.sin(tilt) + z * Math.cos(tilt);
        return { sx: cx + x * R, sy: cy + yy * R, z: z2 };
      }

      function slerpPoint(a, b, t) {
        var dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
        var om = Math.acos(dot) || 0.0001;
        var s = Math.sin(om);
        var k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
        var lift = 1 + 0.25 * Math.sin(Math.PI * t);
        return {
          x: (a.x * k1 + b.x * k2) * lift,
          y: (a.y * k1 + b.y * k2) * lift,
          z: (a.z * k1 + b.z * k2) * lift,
        };
      }

      function draw() {
        ctx.clearRect(0, 0, size, size);

        for (var j = 0; j < pts.length; j++) {
          var pr = project(pts[j], rot);
          var front = pr.z > 0;
          var alpha = front ? 0.28 + pr.z * 0.5 : 0.05;
          var rad = front ? 1.1 + pr.z * 0.9 : 0.8;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, rad, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(232,255,0," + alpha.toFixed(3) + ")";
          ctx.fill();
        }

        for (var m = 0; m < arcs.length; m++) {
          var ar = arcs[m];
          ar.t += ar.speed;
          if (ar.t > 1.6) { var na = mkArc(); ar.a = na.a; ar.b = na.b; ar.t = na.t; ar.speed = na.speed; }
          var head = Math.max(0, Math.min(1, ar.t));
          var tail = Math.max(0, ar.t - 0.35);
          if (head <= tail) continue;
          ctx.beginPath();
          var started = false;
          var steps = 36;
          for (var q = 0; q <= steps; q++) {
            var t = tail + (head - tail) * (q / steps);
            var prc = project(slerpPoint(ar.a, ar.b, t), rot);
            if (prc.z < -0.15) { started = false; continue; }
            if (!started) { ctx.moveTo(prc.sx, prc.sy); started = true; }
            else ctx.lineTo(prc.sx, prc.sy);
          }
          ctx.strokeStyle = "rgba(232,255,0,0.55)";
          ctx.lineWidth = 1.4;
          ctx.stroke();
          var hp = project(slerpPoint(ar.a, ar.b, head), rot);
          if (hp.z > -0.15) {
            ctx.beginPath();
            ctx.arc(hp.sx, hp.sy, 2.4, 0, Math.PI * 2);
            ctx.fillStyle = "#E8FF00";
            ctx.fill();
          }
        }

        rot += 0.0022;
        if (!reduced) raf = requestAnimationFrame(draw);
      }
      draw();
    }

    build();
    // Recalcula o tamanho quando a janela muda (com debounce)
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(build, 200);
    });
  }

  function init() {
    initNav();
    initReveal();
    initCounters();
    initFiltros();
    initForm();
    initGlobe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
