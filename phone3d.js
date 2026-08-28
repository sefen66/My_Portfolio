/* ============================================================
   phone3d.js
   Real 3D iPhone (GLTF/GLB) that flies into the hero section,
   floats, reacts to the mouse, and spins/moves creatively as
   the visitor scrolls the page. The phone's "screen" shows the
   same project cards the old CSS mock-up used to show.

   Requires (loaded before this file, as plain <script> tags):
     - three.min.js   (r134)
     - GLTFLoader.js  (r134 examples build)

   Expects in the HTML:
     <div class="phone-flight" id="phoneFlight">
       <canvas id="phone3dCanvas"></canvas>
       <div class="phone3d-loading" id="phone3dLoading"><span></span></div>
     </div>

   Model file expected at: ./iphone17_low_poly.glb (same folder as this script)
   ============================================================ */
(function () {
  "use strict";

  var container = document.getElementById("phoneFlight");
  var canvas = document.getElementById("phone3dCanvas");
  var loadingEl = document.getElementById("phone3dLoading");

  if (!container || !canvas || typeof THREE === "undefined") {
    return; // fail silently, rest of the site still works
  }

  /* ---------------------------------------------------------
     Basic three.js setup
  --------------------------------------------------------- */
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x14152a, 1.15));

  var keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  var rimLight = new THREE.DirectionalLight(0x7c5cff, 1.3);
  rimLight.position.set(-4, -2, -3);
  scene.add(rimLight);

  var fillLight = new THREE.DirectionalLight(0x00e5c7, 0.6);
  fillLight.position.set(-2, 3, 2);
  scene.add(fillLight);

  // Everything (model + screen overlay) lives inside this group so we
  // can move/rotate/scale the whole phone as one rigid object.
  var phoneGroup = new THREE.Group();
  scene.add(phoneGroup);

  var modelReady = false;
  var screenCtx = null;
  var screenTexture = null;

  /* ---------------------------------------------------------
     Load the real 3D iPhone model
  --------------------------------------------------------- */
  var loader = new THREE.GLTFLoader();
  loader.load(
    "./iphone17_low_poly.glb",
    function (gltf) {
      var model = gltf.scene;

      // Normalise: center the model and scale it to a known height,
      // regardless of how the source .glb was exported.
      var box = new THREE.Box3().setFromObject(model);
      var size = new THREE.Vector3();
      var center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      model.position.sub(center);

      var targetHeight = 3.4;
      var scale = size.y > 0 ? targetHeight / size.y : 1;
      model.scale.setScalar(scale);

      phoneGroup.add(model);

      // A thin glowing "screen" plane glued to the front of the phone,
      // showing the project cards. It moves and rotates together with
      // the model because it's parented to the same group.
      var screenWidth = size.x * scale * 0.8;
      var screenHeight = size.y * scale * 0.92;
      var screenDepth = size.z * scale * 0.5 + 0.03;

      var screenCanvas = document.createElement("canvas");
      screenCanvas.width = 420;
      screenCanvas.height = 900;
      screenCtx = screenCanvas.getContext("2d");
      screenTexture = new THREE.CanvasTexture(screenCanvas);
      screenTexture.colorSpace = THREE.SRGBColorSpace || undefined;

      var screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight);
      var screenMat = new THREE.MeshBasicMaterial({
        map: screenTexture,
        transparent: true,
      });
      var screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 0, screenDepth);
      phoneGroup.add(screenMesh);

      drawScreen();
      modelReady = true;
      introStart = performance.now();

      if (loadingEl) loadingEl.classList.add("hidden");
    },
    undefined,
    function (err) {
      console.warn("[phone3d] could not load iphone17_low_poly.glb", err);
      if (loadingEl) loadingEl.classList.add("hidden");
    }
  );

  /* ---------------------------------------------------------
     Screen content — mirrors the projects shown in the old
     CSS-only phone mock-up (celmouse / CleverType / sefen.dev)
  --------------------------------------------------------- */
  var apps = [
    { icon: "\uD83D\uDDB1\uFE0F", name: "celmouse", chips: ["Bluetooth", "Connected"], bars: [0.72, 0.45] },
    { icon: "\u2328\uFE0F", name: "CleverType", chips: ["AI Suggest", "Fast"], bars: [0.85, 0.6] },
    { icon: "</>", name: "sefen.dev", chips: ["Live", "v2.0"], bars: [0.93, 0.78] },
  ];
  var appIndex = 0;

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawScreen() {
    if (!screenCtx) return;
    var ctx = screenCtx;
    var w = 420, h = 900;
    var app = apps[appIndex];

    ctx.clearRect(0, 0, w, h);

    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#12142090");
    grad.addColorStop(1, "#05070d90");
    ctx.fillStyle = grad;
    roundRect(ctx, 0, 0, w, h, 46);
    ctx.fill();

    // little top dots (status bar hint)
    ctx.fillStyle = "rgba(255,255,255,.28)";
    [56, 86, 116].forEach(function (x) {
      ctx.beginPath();
      ctx.arc(x, 46, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // app card
    ctx.fillStyle = "rgba(255,255,255,.07)";
    roundRect(ctx, 28, 120, w - 56, 210, 24);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "72px sans-serif";
    ctx.fillText(app.icon, w / 2, 250);

    ctx.font = "600 32px 'Space Grotesk', sans-serif";
    ctx.fillText(app.name, w / 2, 305);

    // chips
    var cx = 28, cy = 356;
    ctx.textAlign = "left";
    app.chips.forEach(function (label) {
      ctx.font = "22px 'Inter', sans-serif";
      var tw = ctx.measureText(label).width + 40;
      ctx.fillStyle = "rgba(124,92,255,.28)";
      roundRect(ctx, cx, cy, tw, 46, 23);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, cx + 20, cy + 30);
      cx += tw + 14;
    });

    // progress bars
    app.bars.forEach(function (v, i) {
      var y = 430 + i * 60;
      ctx.fillStyle = "rgba(255,255,255,.12)";
      roundRect(ctx, 28, y, w - 56, 18, 9);
      ctx.fill();
      ctx.fillStyle = "#00e5c7";
      roundRect(ctx, 28, y, (w - 56) * v, 18, 9);
      ctx.fill();
    });

    // caption
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.font = "20px 'Inter', sans-serif";
    ctx.fillText("sefen.dev · portfolio", 28, h - 40);

    if (screenTexture) screenTexture.needsUpdate = true;
  }

  setInterval(function () {
    appIndex = (appIndex + 1) % apps.length;
    drawScreen();
  }, 3200);

  /* ---------------------------------------------------------
     Resize handling
  --------------------------------------------------------- */
  function resize() {
    var rect = container.getBoundingClientRect();
    var w = rect.width || 320;
    var h = rect.height || w * 1.7;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

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
     Scroll progress (0 -> 1 across the whole page)
  --------------------------------------------------------- */
  var scrollProgress = 0;
  function updateScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  /* ---------------------------------------------------------
     Main animation loop
     - Entrance: the phone flies in from off-screen, spinning,
       the first time the model finishes loading.
     - Idle: gentle float + slow rotation + mouse parallax tilt.
     - Scroll: the phone keeps spinning and drifting up as the
       visitor scrolls, then fades/shrinks away once they scroll
       well past the hero section (so it doesn't overlap content).
  --------------------------------------------------------- */
  var introStart = null;
  var introDone = false;
  var INTRO_DURATION = 1500;

  function animate() {
    requestAnimationFrame(animate);

    if (!modelReady) {
      renderer.render(scene, camera);
      return;
    }

    var now = performance.now();
    var t = now / 1000;

    var scale, posX, posY, posZ, rotX, rotY, rotZ;

    if (!introDone) {
      var p = introStart ? Math.min(1, (now - introStart) / INTRO_DURATION) : 0;
      var e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      scale = 0.35 + 0.65 * e;
      posX = 4 * (1 - e);
      posY = -3 * (1 - e);
      posZ = -6 * (1 - e);
      rotX = 0.6 * (1 - e);
      rotY = -1.5 * (1 - e);
      rotZ = 0.45 * (1 - e);
      if (p >= 1) introDone = true;
    } else {
      var floatY = Math.sin(t * 1.1) * 0.14;
      var idleTiltX = Math.sin(t * 0.7) * 0.05;
      var idleTiltZ = Math.cos(t * 0.5) * 0.03;

      // The phone keeps a slow constant spin plus extra spin tied to
      // scroll progress, so scrolling *feels* like it's turning the phone.
      var baseSpin = t * 0.18;
      var scrollSpin = scrollProgress * Math.PI * 2.6;

      rotY = -0.3 + baseSpin + scrollSpin + mouseX * 0.6;
      rotX = idleTiltX - mouseY * 0.35;
      rotZ = idleTiltZ;

      posX = mouseX * 0.3;
      posY = floatY - scrollProgress * 1.6;
      posZ = 0;

      // fade the whole hero phone out once the visitor has scrolled
      // well past the hero section, so it never overlaps other content
      var heroFade = Math.max(0, 1 - scrollProgress * 3.2);
      scale = Math.max(0.001, heroFade);
    }

    phoneGroup.visible = scale > 0.01;
    phoneGroup.scale.setScalar(scale);
    phoneGroup.position.set(posX, posY, posZ);
    phoneGroup.rotation.set(rotX, rotY, rotZ);

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
})();
