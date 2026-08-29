/* ============================================================
   creative-effects.js

   Three independent, self-contained effects. None of them touch
   script.js or style.css — they only add new classes/elements and
   read the data-* attributes that already exist in index.html.

   1) Skills section: bars fill with a staggered cascade + a light
      "shine" sweep the moment they scroll into view, and the
      percentage number counts up in sync.

   2) Hero portrait: real 3D tilt that follows the mouse, with a
      soft glare that tracks the cursor, and a gentle idle float
      when the mouse isn't over it.

   3) Project cards: the same 3D tilt + cursor-tracked shine, plus
      an animated glowing border and an image zoom on hover, with
      a staggered reveal using the existing data-project-index.
   ============================================================ */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initSkillBars();
    initPortraitTilt();
    initProjectCards();
  });

  /* ===========================================================
     1) SKILL BARS
  =========================================================== */
  function initSkillBars() {
    var panels = document.querySelectorAll(".skill-panel");
    if (!panels.length) return;

    panels.forEach(function (panel) {
      var meters = panel.querySelectorAll(".meter[data-level]");
      meters.forEach(function (meter) {
        // Build the fill element once.
        if (!meter.querySelector(".meter-fill")) {
          var fill = document.createElement("span");
          fill.className = "meter-fill";
          meter.appendChild(fill);
        }
      });
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animatePanel(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    panels.forEach(function (panel) {
      observer.observe(panel);
    });

    function animatePanel(panel) {
      var items = panel.querySelectorAll("li");
      items.forEach(function (li, i) {
        var meter = li.querySelector(".meter[data-level]");
        var pctLabel = li.querySelector(".meter-pct");
        if (!meter) return;
        var target = parseFloat(meter.getAttribute("data-level")) || 0;
        var fill = meter.querySelector(".meter-fill");
        var delay = i * 140;

        setTimeout(function () {
          fill.classList.add("is-filling");
          // Next frame so the transition actually animates from 0.
          requestAnimationFrame(function () {
            fill.style.width = target + "%";
          });

          if (pctLabel) animateCount(pctLabel, target, 1300);

          setTimeout(function () {
            fill.classList.remove("is-filling");
            fill.classList.add("is-done");
          }, 1350);
        }, delay);
      });
    }

    function animateCount(el, target, duration) {
      var start = performance.now();
      function step(now) {
        var p = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        var value = Math.round(target * eased);
        el.textContent = value + "%";
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }

  /* ===========================================================
     2) HERO PORTRAIT — 3D tilt + cursor glare
  =========================================================== */
  function initPortraitTilt() {
    var card = document.querySelector(".portrait-card");
    if (!card) return;

    if (!card.querySelector(".portrait-glare")) {
      var glare = document.createElement("div");
      glare.className = "portrait-glare";
      card.appendChild(glare);
    }

    card.classList.add("idle-float");

    card.addEventListener("pointermove", function (e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width; // 0..1
      var py = (e.clientY - rect.top) / rect.height; // 0..1

      var maxTilt = 10; // degrees
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
     3) PROJECT CARDS — 3D tilt, cursor shine, staggered reveal
  =========================================================== */
  function initProjectCards() {
    var cards = document.querySelectorAll(".project-card");
    if (!cards.length) return;

    cards.forEach(function (card) {
      if (!card.querySelector(".project-shine")) {
        var shine = document.createElement("div");
        shine.className = "project-shine";
        card.appendChild(shine);
      }

      // Stagger the existing reveal-on-scroll animation using the
      // project's own index, so the cards cascade in rather than
      // appearing all at once.
      var idx = parseInt(card.getAttribute("data-project-index"), 10) || 0;
      card.style.transitionDelay = idx * 120 + "ms";

      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;

        var maxTilt = 7;
        var rx = (0.5 - py) * maxTilt;
        var ry = (px - 0.5) * maxTilt;

        card.style.transform =
          "perspective(800px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
        card.style.setProperty("--px", px * 100 + "%");
        card.style.setProperty("--py", py * 100 + "%");
      });

      card.addEventListener("pointerenter", function () {
        card.classList.add("is-hovering");
      });

      card.addEventListener("pointerleave", function () {
        card.classList.remove("is-hovering");
        card.style.transform = "";
      });
    });
  }
})();
