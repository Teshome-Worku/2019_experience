/* ================================================================
   CONFIG — edit this section to personalize the experience.
   Nothing else in this file should need to change.
   ================================================================ */
const CONFIG = {
  herName: "",              // e.g. "Selam" — leave blank to keep it generic
  myName: "",                // e.g. "Nahom" — shown nowhere by default, kept for your reference
  herPhotos: ["./assets/her-photo-1.jpg", "./assets/her-photo-2.jpg", "./assets/her-photo-3.jpg"],
  myPhotos: ["./assets/my-photo-1.jpg", "./assets/my-photo-2.jpg"],
  musicPath: "",             // leave blank to use the built-in generative ambient score; set to e.g. "./assets/song.mp3" to use your own track instead
  newYearLineAmharic: "እንኳን ለ2019 ዓ.ም አደረሰሽ ❤️",
  hapticsEnabled: true        // tiny vibration on taps, where the device supports it
};

// Fill in her name on the opening line, if provided
if (CONFIG.herName) {
  const inline = document.getElementById("her-name-inline");
  if (inline) inline.textContent = CONFIG.herName;
}
if (CONFIG.musicPath) {
  const audioEl = document.getElementById("bg-audio");
  audioEl.src = CONFIG.musicPath;
}
const USE_CUSTOM_TRACK = !!CONFIG.musicPath;

/* ================================================================
   REDUCED MOTION / PERFORMANCE TIER
   ================================================================ */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSmallDevice = window.innerWidth < 480;
const isLowMemory = (navigator.deviceMemory && navigator.deviceMemory <= 4);
const LOW_POWER = isSmallDevice || isLowMemory;

function tap(ms = 10) {
  if (CONFIG.hapticsEnabled && "vibrate" in navigator) {
    try { navigator.vibrate(ms); } catch (e) {}
  }
}

/* ================================================================
   THREE.JS BACKGROUND SCENE
   ================================================================ */
const canvas = document.getElementById("scene-canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !LOW_POWER,
  alpha: true,
  powerPreference: "low-power"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOW_POWER ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 8);

// Lighting
const keyLight = new THREE.PointLight(0xd8b678, 2.2, 50);
keyLight.position.set(4, 4, 6);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0xa8462f, 1.1, 50);
rimLight.position.set(-5, -2, -4);
scene.add(rimLight);
scene.add(new THREE.AmbientLight(0x30303f, 1.1));

/* ---- Central object: faceted crystal ---- */
const crystalGeo = new THREE.IcosahedronGeometry(1.5, 0);
const crystalMat = new THREE.MeshPhysicalMaterial({
  color: 0xcfa25e,
  metalness: 0.3,
  roughness: 0.15,
  transmission: 0.55,
  thickness: 1.2,
  clearcoat: 0.6,
  ior: 1.4,
  emissive: 0x35240f,
  emissiveIntensity: 0.25
});
// Fallback for renderers without physical material transmission support is fine; MeshPhysicalMaterial works in r128.
const crystal = new THREE.Mesh(crystalGeo, crystalMat);
crystal.visible = false; // shown once we scroll into its scene
scene.add(crystal);

const crystalWire = new THREE.LineSegments(
  new THREE.EdgesGeometry(crystalGeo),
  new THREE.LineBasicMaterial({ color: 0xe8cd97, transparent: true, opacity: 0.35 })
);
crystal.add(crystalWire);

/* ---- Particle field ---- */
const PARTICLE_COUNT = LOW_POWER ? 220 : 650;
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 22;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
}
particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0xe8cd97,
  size: 0.045,
  transparent: true,
  opacity: 0.55,
  depthWrite: false
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

/* ---- Constellation nodes (used in the "future" scene) ---- */
const NODE_COUNT = 24;
const nodePositions = [];
const nodeGeo = new THREE.BufferGeometry();
const nodeArr = new Float32Array(NODE_COUNT * 3);
for (let i = 0; i < NODE_COUNT; i++) {
  const angle = (i / NODE_COUNT) * Math.PI * 2;
  const r = 2.4 + Math.random() * 1.2;
  const x = Math.cos(angle) * r + (Math.random() - 0.5);
  const y = Math.sin(angle) * r * 0.6 + (Math.random() - 0.5);
  const z = (Math.random() - 0.5) * 2;
  nodePositions.push(new THREE.Vector3(x, y, z));
  nodeArr[i * 3] = x;
  nodeArr[i * 3 + 1] = y;
  nodeArr[i * 3 + 2] = z;
}
nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodeArr, 3));
const nodeMat = new THREE.PointsMaterial({ color: 0xf4efe4, size: 0.07, transparent: true, opacity: 0 });
const constellationNodes = new THREE.Points(nodeGeo, nodeMat);
scene.add(constellationNodes);

// Lines connecting nearby nodes, drawn progressively
const lineMat = new THREE.LineBasicMaterial({ color: 0xcfa25e, transparent: true, opacity: 0 });
const linePairs = [];
for (let i = 0; i < NODE_COUNT; i++) {
  const next = nodePositions[(i + 1) % NODE_COUNT];
  linePairs.push(nodePositions[i], next);
}
const lineGeo = new THREE.BufferGeometry().setFromPoints(linePairs);
const constellationLines = new THREE.LineSegments(lineGeo, lineMat);
scene.add(constellationLines);

// Two converging points representing "two people choosing each other"
const dotGeo = new THREE.SphereGeometry(0.09, 12, 12);
const dotMatA = new THREE.MeshBasicMaterial({ color: 0xe8cd97, transparent: true, opacity: 0 });
const dotMatB = new THREE.MeshBasicMaterial({ color: 0xcfa25e, transparent: true, opacity: 0 });
const dotA = new THREE.Mesh(dotGeo, dotMatA);
const dotB = new THREE.Mesh(dotGeo, dotMatB);
dotA.position.set(-3, 0, 0.5);
dotB.position.set(3, 0, 0.5);
scene.add(dotA, dotB);

/* ================================================================
   RENDER LOOP
   ================================================================ */
let clock = new THREE.Clock();
let touchTiltX = 0, touchTiltY = 0;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  particles.rotation.y = t * 0.015;
  particles.rotation.x = t * 0.008;

  if (crystal.visible) {
    crystal.rotation.y = t * 0.35 + touchTiltY;
    crystal.rotation.x = Math.sin(t * 0.4) * 0.15 + touchTiltX;
  }

  constellationNodes.rotation.y = t * 0.05;
  constellationLines.rotation.y = t * 0.05;

  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Subtle touch/drag tilt on the crystal (mobile-friendly, no cursor dependence)
let dragging = false, lastX = 0, lastY = 0;
canvas.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
window.addEventListener("pointerup", () => dragging = false);
window.addEventListener("pointermove", (e) => {
  if (!dragging || !crystal.visible) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  touchTiltY += dx * 0.003;
  touchTiltX += dy * 0.003;
  lastX = e.clientX; lastY = e.clientY;
});

/* ================================================================
   PRELOADER
   ================================================================ */
const preloader = document.getElementById("preloader");
const preloaderFill = document.getElementById("preloader-fill");
const preloaderText = document.getElementById("preloader-text");

function preloadAssets() {
  return new Promise((resolve) => {
    const toLoad = [...CONFIG.herPhotos, ...CONFIG.myPhotos];
    let loaded = 0;
    const update = () => {
      loaded++;
      const pct = Math.round((loaded / toLoad.length) * 100);
      preloaderFill.style.width = pct + "%";
      if (loaded >= toLoad.length) {
        preloaderText.textContent = "Ready?";
        setTimeout(resolve, 500);
      }
    };
    toLoad.forEach((src) => {
      const img = new Image();
      img.onload = update;
      img.onerror = update;
      img.src = src;
    });
    // safety timeout so it never hangs
    setTimeout(resolve, 4000);
  });
}

preloadAssets().then(() => {
  preloader.classList.add("hidden");
});

/* ================================================================
   SCROLL-DRIVEN STORY (GSAP + ScrollTrigger)
   ================================================================ */
gsap.registerPlugin(ScrollTrigger);

// Generic fade-up reveal for tagged elements
document.querySelectorAll(".fade-el").forEach((el, i) => {
  ScrollTrigger.create({
    trigger: el,
    start: "top 82%",
    onEnter: () => el.classList.add("in-view"),
  });
});

// Photo frames
["her-frame", "my-frame"].forEach((id) => {
  const el = document.getElementById(id);
  ScrollTrigger.create({
    trigger: el,
    start: "top 78%",
    onEnter: () => el.classList.add("in-view"),
  });
});

// Object scene: reveal crystal, camera dolly, then show the OPEN button
const objectSection = document.getElementById("scene-object");
const objectLabel = document.getElementById("object-label");
const openBtn = document.getElementById("open-btn");

ScrollTrigger.create({
  trigger: objectSection,
  start: "top 70%",
  end: "bottom top",
  onEnter: () => {
    crystal.visible = true;
    gsap.fromTo(crystal.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1, duration: 1.4, ease: "back.out(1.4)" });
    gsap.to(camera.position, { z: 5.5, duration: 1.6, ease: "power2.out" });
    gsap.delayedCall(1.2, () => {
      objectLabel.textContent = "Something is waiting inside.";
      openBtn.hidden = false;
      gsap.fromTo(openBtn, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 });
    });
  },
  onLeaveBack: () => {
    gsap.to(camera.position, { z: 8, duration: 1 });
  }
});

let crystalOpened = false;
openBtn.addEventListener("click", () => {
  if (crystalOpened) return;
  crystalOpened = true;
  tap(18);

  gsap.to(crystalMat, { emissiveIntensity: 1.4, duration: 0.4, yoyo: true, repeat: 1 });
  gsap.to(crystal.scale, {
    x: 2.4, y: 2.4, z: 2.4, duration: 0.9, ease: "power3.in",
    onComplete: () => {
      gsap.to(crystal.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: "power2.in", onComplete: () => { crystal.visible = false; } });
      gsap.to(camera.position, { z: 4.5, duration: 0.6, yoyo: true, repeat: 1, ease: "power1.inOut" });
    }
  });
  objectLabel.textContent = "";
  openBtn.hidden = true;

  // scroll forward into the reveal
  const nextScene = document.getElementById("scene-her");
  gsap.delayedCall(0.7, () => {
    nextScene.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
});

// Constellation scene: fade nodes/lines/dots in as it enters, converge the two dots
const futureSection = document.getElementById("scene-future");
ScrollTrigger.create({
  trigger: futureSection,
  start: "top 65%",
  end: "bottom top",
  onEnter: () => {
    gsap.to(nodeMat, { opacity: 0.8, duration: 1.2 });
    gsap.to(lineMat, { opacity: 0.28, duration: 1.6, delay: 0.3 });
    gsap.to(dotMatA, { opacity: 1, duration: 0.8, delay: 0.6 });
    gsap.to(dotMatB, { opacity: 1, duration: 0.8, delay: 0.6 });
    gsap.to(dotA.position, { x: -0.4, duration: 2.2, delay: 1, ease: "power2.inOut" });
    gsap.to(dotB.position, { x: 0.4, duration: 2.2, delay: 1, ease: "power2.inOut" });
  },
  onLeave: () => {
    gsap.to([nodeMat, lineMat, dotMatA, dotMatB], { opacity: 0, duration: 0.8 });
  },
  onEnterBack: () => {
    gsap.to(nodeMat, { opacity: 0.8, duration: 0.8 });
    gsap.to(lineMat, { opacity: 0.28, duration: 0.8 });
  }
});

// Finale: warm gold "firework" particle burst
const finaleSection = document.getElementById("scene-finale");
let fired = false;
ScrollTrigger.create({
  trigger: finaleSection,
  start: "top 60%",
  onEnter: () => {
    if (fired) return;
    fired = true;
    burstParticles();
    fireMultipleBursts();
    document.querySelectorAll("#scene-finale .scene-content > *").forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, delay: i * 0.18, ease: "power2.out" });
    });
  }
});

function burstParticles() {
  gsap.to(particleMat, { opacity: 0.9, size: 0.06, duration: 1.5, ease: "power2.out" });
  gsap.to(particles.rotation, { z: "+=0.6", duration: 6, ease: "power1.out" });
}

/* ================================================================
   ENTER BUTTON — opening transition
   ================================================================ */
const enterBtn = document.getElementById("enter-btn");
const soundToggle = document.getElementById("sound-toggle");

enterBtn.addEventListener("click", () => {
  tap(12);
  gsap.to(camera.position, { y: -0.3, duration: 1, ease: "power2.out" });
  gsap.to(particleMat, { opacity: 0.75, duration: 1 });

  soundToggle.hidden = false;
  gsap.fromTo(soundToggle, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.4 });

  const discoverSection = document.getElementById("scene-discover");
  discoverSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
});

/* ================================================================
   SOUND TOGGLE
   ================================================================ */
const bgAudio = document.getElementById("bg-audio");
let audioPlaying = false;
soundToggle.addEventListener("click", () => {
  tap(8);
  if (audioPlaying) {
    if (USE_CUSTOM_TRACK) { bgAudio.pause(); } else { stopAmbientMusic(); }
    soundToggle.classList.remove("playing");
  } else {
    if (USE_CUSTOM_TRACK) { bgAudio.play().catch(() => {}); } else { startAmbientMusic(); }
    soundToggle.classList.add("playing");
  }
  audioPlaying = !audioPlaying;
});

/* ================================================================
   3D PHOTO CAROUSELS — draggable rings, one per gallery
   ================================================================ */
function initCarousel(wrapId, trackId, dotsId) {
  const wrap = document.getElementById(wrapId);
  const track = document.getElementById(trackId);
  if (!wrap || !track) return;
  const cards = Array.from(track.children);
  const count = cards.length;
  const dotsEl = document.getElementById(dotsId);
  const RADIUS = 190; // px depth of the ring, tuned to the card size
  const step = 360 / count;

  cards.forEach((card, i) => {
    card.style.transform = `rotateY(${i * step}deg) translateZ(${RADIUS}px)`;
    const dot = document.createElement("span");
    if (i === 0) dot.classList.add("active");
    dotsEl.appendChild(dot);
  });
  const dots = Array.from(dotsEl.children);

  let currentIndex = 0;
  let rotation = 0;
  let dragging = false;
  let startX = 0;
  let dragRotation = 0;

  function applyRotation(r, animated) {
    track.style.transition = animated ? "" : "none";
    track.classList.toggle("dragging", !animated);
    track.style.transform = `rotateY(${r}deg)`;
  }

  function goTo(index, animated = true) {
    currentIndex = ((index % count) + count) % count;
    rotation = -currentIndex * step;
    applyRotation(rotation, animated);
    dots.forEach((d, i) => d.classList.toggle("active", i === currentIndex));
  }

  function onStart(clientX) {
    dragging = true;
    startX = clientX;
    dragRotation = rotation;
    track.classList.add("dragging");
  }
  function onMove(clientX) {
    if (!dragging) return;
    const dx = clientX - startX;
    rotation = dragRotation + dx * 0.35;
    applyRotation(rotation, false);
  }
  function onEnd() {
    if (!dragging) return;
    dragging = false;
    const nearestIndex = Math.round(-rotation / step);
    tap(6);
    goTo(nearestIndex, true);
  }

  wrap.addEventListener("pointerdown", (e) => { onStart(e.clientX); wrap.setPointerCapture(e.pointerId); });
  wrap.addEventListener("pointermove", (e) => onMove(e.clientX));
  wrap.addEventListener("pointerup", onEnd);
  wrap.addEventListener("pointercancel", onEnd);
  wrap.addEventListener("pointerleave", () => { if (dragging) onEnd(); });

  // Gentle idle auto-rotation hint (pauses once the visitor has interacted)
  let hasInteracted = false;
  wrap.addEventListener("pointerdown", () => { hasInteracted = true; }, { once: true });
  if (!prefersReducedMotion && count > 1) {
    let idlePhase = 0;
    ScrollTrigger.create({
      trigger: wrap,
      start: "top 85%",
      onEnter: () => {
        const nudge = () => {
          if (hasInteracted || dragging) return;
          idlePhase += 1;
          applyRotation(rotation + (idlePhase % 2 === 0 ? 6 : -6), true);
          setTimeout(() => { if (!hasInteracted) applyRotation(rotation, true); }, 500);
        };
        setTimeout(nudge, 900);
      }
    });
  }

  goTo(0, false);
}

initCarousel("her-carousel", "her-track", "her-dots");
initCarousel("my-carousel", "my-track", "my-dots");

/* ================================================================
   SCROLL-TIED CAMERA PARALLAX (continuous, whole-page depth motion)
   ================================================================ */
if (!prefersReducedMotion) {
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: 1.2,
    onUpdate: (self) => {
      const p = self.progress; // 0 -> 1 across the whole journey
      camera.position.x = Math.sin(p * Math.PI * 2) * 0.35;
      camera.position.y = -0.3 + Math.sin(p * Math.PI * 4) * 0.15;
      particles.rotation.z = p * 1.2;
    }
  });
}

/* ================================================================
   DEVICE TILT PARALLAX (subtle gyroscope-driven depth on mobile)
   ================================================================ */
let gyroEnabled = false;
function enableGyroParallax() {
  if (gyroEnabled || prefersReducedMotion) return;
  gyroEnabled = true;
  window.addEventListener("deviceorientation", (e) => {
    if (e.beta === null || e.gamma === null) return;
    const gx = THREE.MathUtils.clamp(e.gamma, -25, 25) / 25; // left-right tilt
    const gy = THREE.MathUtils.clamp(e.beta - 45, -25, 25) / 25; // front-back tilt
    gsap.to(particles.position, { x: gx * 0.4, y: -gy * 0.3, duration: 0.8, ease: "power1.out" });
    if (crystal.visible) {
      gsap.to(crystal.rotation, { z: gx * 0.15, duration: 0.8, ease: "power1.out" });
    }
  });
}
// iOS requires an explicit permission gesture; other platforms can start immediately.
if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
  enterBtn.addEventListener("click", () => {
    DeviceOrientationEvent.requestPermission().then((res) => {
      if (res === "granted") enableGyroParallax();
    }).catch(() => {});
  }, { once: true });
} else if (typeof DeviceOrientationEvent !== "undefined") {
  enableGyroParallax();
}

/* ================================================================
   FINALE FIREWORKS — a real expanding 3D particle burst
   ================================================================ */
function createFireworkBurst() {
  const count = LOW_POWER ? 90 : 220;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const vel = [];
  for (let i = 0; i < count; i++) {
    pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const speed = 1.4 + Math.random() * 2.2;
    vel.push(new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * speed,
      Math.sin(phi) * Math.sin(theta) * speed,
      Math.cos(phi) * speed * 0.6
    ));
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: Math.random() > 0.5 ? 0xe8cd97 : 0xcfa25e,
    size: 0.06,
    transparent: true,
    opacity: 1,
    depthWrite: false
  });
  const burst = new THREE.Points(geo, mat);
  burst.position.set((Math.random() - 0.5) * 2, 0.5 + Math.random() * 1, -1);
  scene.add(burst);

  const startTime = clock.getElapsedTime();
  function step() {
    const elapsed = clock.getElapsedTime() - startTime;
    if (elapsed > 2.4) {
      scene.remove(burst);
      geo.dispose();
      mat.dispose();
      return;
    }
    const positions = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      positions[i * 3] += vel[i].x * 0.016;
      positions[i * 3 + 1] += (vel[i].y - elapsed * 1.1) * 0.016; // gentle gravity
      positions[i * 3 + 2] += vel[i].z * 0.016;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = Math.max(0, 1 - elapsed / 2.4);
    requestAnimationFrame(step);
  }
  step();
}

function fireMultipleBursts() {
  const bursts = LOW_POWER ? 2 : 4;
  for (let i = 0; i < bursts; i++) {
    setTimeout(createFireworkBurst, i * 450);
  }
}

/* ================================================================
   GENERATIVE AMBIENT SCORE — original, royalty-free, built in Tone.js
   No external track needed. Kicks in only when she taps the sound
   toggle; never autoplays. If CONFIG.musicPath is set, that file is
   used instead (see SOUND TOGGLE section below).
   ================================================================ */
let ambientReady = false;
let padLoop, arpLoop, droneOsc;
let padSynth, arpSynth, reverb, filter, chorus;

// A warm, slightly bittersweet progression — Am9 · Fmaj9 · Cmaj7 · G(add9)
const CHORDS = [
  ["A3", "C4", "E4", "G4", "B4"],
  ["F3", "A3", "C4", "E4", "G4"],
  ["C3", "E3", "G3", "B3", "D4"],
  ["G3", "B3", "D4", "F#4", "A4"]
];
const ARP_SCALE = ["A4", "C5", "E5", "G5", "B5", "E4", "G4", "B4", "D5"];

function buildAmbientEngine() {
  if (ambientReady) return;
  ambientReady = true;

  reverb = new Tone.Reverb({ decay: 9, wet: 0.55, preDelay: 0.05 }).toDestination();
  filter = new Tone.Filter({ frequency: 2200, type: "lowpass", rolloff: -12 }).connect(reverb);
  chorus = new Tone.Chorus({ frequency: 0.3, delayTime: 4, depth: 0.4, wet: 0.25 }).connect(filter);

  padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 3, decay: 2, sustain: 0.65, release: 6 }
  }).connect(chorus);
  padSynth.volume.value = -16;

  arpSynth = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.6, sustain: 0.1, release: 1.4 }
  }).connect(reverb);
  arpSynth.volume.value = -22;

  droneOsc = new Tone.Oscillator({ frequency: 55, type: "sine" }).connect(filter);
  droneOsc.volume.value = -30;

  let chordIndex = 0;
  padLoop = new Tone.Loop((time) => {
    padSynth.triggerAttackRelease(CHORDS[chordIndex % CHORDS.length], "6n", time);
    chordIndex++;
  }, "6m");

  arpLoop = new Tone.Loop((time) => {
    if (Math.random() > 0.55) {
      const note = ARP_SCALE[Math.floor(Math.random() * ARP_SCALE.length)];
      arpSynth.triggerAttackRelease(note, "4n", time, 0.35 + Math.random() * 0.3);
    }
  }, "2n");

  Tone.Transport.bpm.value = 54;
}

function startAmbientMusic() {
  Tone.start().then(() => {
    buildAmbientEngine();
    padSynth.triggerAttackRelease(CHORDS[0], "4n");
    Tone.Transport.start();
    padLoop.start(0);
    arpLoop.start("2n");
    droneOsc.start();
    gsap.to(droneOsc.volume, { value: -30, duration: 3 });
  });
}

function stopAmbientMusic() {
  if (!ambientReady) return;
  padLoop.stop();
  arpLoop.stop();
  Tone.Transport.stop();
  if (droneOsc.state === "started") droneOsc.stop("+1");
  padSynth.releaseAll();
}

/* ================================================================
   INITIAL FADE-IN FOR OPENING SCENE
   ================================================================ */
window.addEventListener("load", () => {
  document.querySelectorAll("#scene-open .fade-el").forEach((el, i) => {
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, delay: 0.3 + i * 0.15, ease: "power2.out" });
  });
});
