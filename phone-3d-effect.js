/* ============================================================
   phone-3d-effect.js

   Keeps the ORIGINAL CSS phone mock-up (#phone3d, .phone-3d,
   .phone-screen, .app-slide, etc. — untouched, still controlled
   by style.css / script.js for slide-cycling and dots) but drives
   its outer transform every frame to feel like a real object
   flying and spinning in 3D space:

     1. Entrance: flies in from off-screen with a spin + fade.
     2. Idle: gentle float + slow spin + subtle mouse parallax tilt.
     3. Scroll: keeps spinning/rising as the visitor scrolls, with
        a "flick" tilt driven by scroll velocity (feels physical,
        not mechanical), then fades/shrinks away once the visitor
        has scrolled well past the hero section.

   Requires `.phone-flight { perspective: ...; }` and
   `#phone3d.phone-3d { transform-style: preserve-3d; }`
   (both added inline in index.html's <head>).
   ============================================================ */
(function () {
  "use strict";

  var phone = document.getElementById("phone3d");
  if (!phone) return;

  phone.style.transformStyle = "preserve-3d";
  phone.style.willChange = "transform, opacity";

  /* ---------------------------------------------------------
     Entrance
  --------------------------------------------------------- */
  var introStart = performance.now();
  var introDone = false;
  var INTRO_MS = 1600;

  /* ---------------------------------------------------------
     Scroll tracking (progress + velocity, for the "flick" tilt)
  --------------------------------------------------------- */
  var lastScrollY = window.scrollY;
  var velocity = 0;
  var scrollProgress = 0;

  function updateScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var y = window.scrollY;
    var dy = y - lastScrollY;
    lastScrollY = y;
    velocity += (dy - velocity) * 0.15; // smooth the raw delta
    scrollProgress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
  }
  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  /* ---------------------------------------------------------
     Mouse parallax
  --------------------------------------------------------- */
  var mouseX = 0, mouseY = 0;
  window.addEventListener(
    "pointermove",
    function (e) {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    },
    { passive: true }
  );

  /* ---------------------------------------------------------
     Main loop
  --------------------------------------------------------- */
  function animate() {
    requestAnimationFrame(animate);

    var now = performance.now();
    var t = now / 1000;

    var tx, ty, tz, rx, ry, rz, scale, opacity;

    if (!introDone) {
      var p = Math.min(1, (now - introStart) / INTRO_MS);
      var e = 1 - Math.pow(1 - p, 3); // ease-out cubic

      scale = 0.3 + 0.7 * e;
      tx = 260 * (1 - e);
      ty = 220 * (1 - e);
      tz = -520 * (1 - e);
      rx = 22 * (1 - e);
      ry = -230 * (1 - e);
      rz = 16 * (1 - e);
      opacity = e;

      if (p >= 1) introDone = true;
    } else {
      var floatY = Math.sin(t * 1.1) * 10;
      var idleRy = Math.sin(t * 0.35) * 10;
      var idleRx = Math.cos(t * 0.5) * 4;

      // scrolling "flicks" the phone like a physical object being spun
      var velTilt = Math.max(-18, Math.min(18, velocity * 1.6));

      ry = idleRy + scrollProgress * 360 * 1.4 + mouseX * 22;
      rx = idleRx - mouseY * 14 + velTilt * 0.5;
      rz = velTilt * 0.4;

      tx = mouseX * 18;
      ty = floatY - scrollProgress * 140;
      tz = Math.sin(scrollProgress * Math.PI * 2) * 40; // depth pulse

      // fade the hero phone away once scrolled well past the hero
      var heroFade = Math.max(0, 1 - scrollProgress * 3.2);
      scale = Math.max(0.001, heroFade);
      opacity = heroFade;

      velocity *= 0.9; // decay so it settles instead of jittering forever
    }

    phone.style.transform =
      "translate3d(" + tx + "px," + ty + "px," + tz + "px) " +
      "rotateX(" + rx + "deg) rotateY(" + ry + "deg) rotateZ(" + rz + "deg) " +
      "scale(" + scale + ")";
    phone.style.opacity = String(opacity);
  }

  requestAnimationFrame(animate);
})();
