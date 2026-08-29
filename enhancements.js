
/* ============================================================
   enhancements.js

   Purely ADDITIVE effects. Nothing here touches width/transform
   logic that script.js and style.css already own:

     - Skill bars: script.js already adds `.filled` + sets --lvl to
       animate the bar width. This file only (a) injects a small
       shine element that the new CSS keys off `.filled` to animate,
       and (b) counts the percentage number up in sync — it never
       sets width or the --lvl variable itself.

     - Hero portrait: style.css intentionally left this static
       (transform:none). This adds a real 3D tilt + a glare that
       follows the cursor, using inline styles (which naturally
       take priority) so nothing needs to be removed from style.css.

     - Project cards: style.css already handles the hover tilt and
       image zoom. This only adds a glowing animated border and a
       cursor-tracked shine on top — it never sets `transform`.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.addEventListener("DOMContentLoaded", function () {
    initSkillCounters();
    initPortraitTilt();
    initProjectShine();
  });

  /* ===========================================================
     Skill bars — percentage count-up, synced with the existing
     `.filled` fill animation (threshold matches script.js's own).
  =========================================================== */
  function initSkillCounters() {
    var meters = document.querySelectorAll(".meter[data-level]");
    if (!meters.length) return;

    meters.forEach(function (meter) {
      if (!meter.querySelector(".meter-shine")) {
        var shine = document.createElement("span");
        shine.className = "meter-shine";
        meter.appendChild(shine);
      }
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var meter = entry.target;
          var li = meter.closest("li");
          var pct = li ? li.querySelector(".meter-pct") : null;
          var target = parseFloat(meter.getAttribute("data-level")) || 0;
          if (pct) animateCount(pct, target, 1100);
          observer.unobserve(meter);
        });
      },
      { threshold: 0.5 }
    );

    meters.forEach(function (m) {
      observer.observe(m);
    });

    function animateCount(el, target, duration) {
      var start = performance.now();
      function step(now) {
        var p = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + "%";
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }

  /* ===========================================================
     Hero portrait — 3D tilt + cursor glare
  =========================================================== */
  function initPortraitTilt() {
    var card = document.querySelector(".portrait-card");
    if (!card) return;

    if (!card.querySelector(".portrait-glare")) {
      var glare = document.createElement("div");
      glare.className = "portrait-glare";
      card.appendChild(glare);
    }

    if (reduceMotion.matches) return; // keep it static, as intended

    card.classList.add("idle-float");

    card.addEventListener("pointermove", function (e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;

      var maxTilt = 10;
      var rx = (0.5 - py) * maxTilt;
      var ry = (px - 0.5) * maxTilt;

      card.style.transform =
        "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) scale(1.02)";
      card.style.setProperty("--px", px * 100 + "%");
      card.style.setProperty("--py", py * 100 + "%");
    });

    card.addEventListener("pointerenter", function () {
      card.classList.remove("idle-float");
      card.classList.add("is-hovering");
    });

    card.addEventListener("pointerleave", function () {
      card.classList.remove("is-hovering");
      card.style.transform = "";
      card.classList.add("idle-float");
    });
  }

  /* ===========================================================
     Project cards — glow border + cursor-tracked shine
     (never touches `transform`; the existing hover tilt in
     style.css keeps working exactly as before).
  =========================================================== */
  function initProjectShine() {
    var cards = document.querySelectorAll(".project-card");
    if (!cards.length) return;

    cards.forEach(function (card) {
      if (!card.querySelector(".project-shine")) {
        var shine = document.createElement("div");
        shine.className = "project-shine";
        card.appendChild(shine);
      }

      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        card.style.setProperty("--px", px * 100 + "%");
        card.style.setProperty("--py", py * 100 + "%");
      });

      card.addEventListener("pointerenter", function () {
        card.classList.add("is-hovering");
      });

      card.addEventListener("pointerleave", function () {
        card.classList.remove("is-hovering");
      });
    });
  }
})();
