// ═══ 2EZi LIFE — 3D world (Three.js + Ready Player Me avatar) ═══
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, clock;
let avatar = null, avatarGroup;
let spineBone = null, headBone = null;
let mood = 0;            // -1 slumped .. 0 neutral .. 1 happy
let jumpVel = 0, jumping = false;
let rain, auraPoints;
let skyCanvas, skyTexture;
let tierGroups = [];     // furniture per tier
let shopGroups = {};     // shop item id -> group
let dogTail = null;
let ambientLight, sunLight, lampLight, windowLight;
let currentTier = 1;
let mouseX = 0, mouseY = 0;

const M = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts });
const box = (w, h, d, color, opts) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(color, opts));

export function initScene(canvas) {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e14);
  scene.fog = new THREE.Fog(0x0a0e14, 14, 30);

  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 1.75, 5.4);
  camera.lookAt(0, 1.0, 0);

  clock = new THREE.Clock();

  buildLights();
  buildRoom();
  buildTierFurniture();
  buildShopItems();
  buildRain();
  buildAura();

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  resize();
  window.addEventListener('resize', resize);
  renderer.setAnimationLoop(tick);

  window.__DEBUG = { scene, get avatar() { return avatar; }, get avatarGroup() { return avatarGroup; }, get actions() { return actions; }, THREE };
}

function resize() {
  const parent = renderer.domElement.parentElement;
  const w = parent.clientWidth, h = parent.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/* ── lights ── */
function buildLights() {
  ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambientLight);

  sunLight = new THREE.DirectionalLight(0xffe9c9, 1.1);
  sunLight.position.set(3, 6, 4);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  scene.add(sunLight);

  windowLight = new THREE.RectAreaLight ? null : null; // RectArea needs extra lib; use point instead
  lampLight = new THREE.PointLight(0xffb066, 0.8, 8);
  lampLight.position.set(-2.2, 1.6, -1.5);
  scene.add(lampLight);
}

/* ── the room ── */
function buildRoom() {
  const floor = new THREE.Mesh(new THREE.BoxGeometry(9, 0.2, 7), M(0x2a2118, { roughness: 0.7 }));
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  scene.add(floor);

  const backWall = box(9, 4.2, 0.2, 0x1b2433);
  backWall.position.set(0, 2.1, -3.5);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const leftWall = box(0.2, 4.2, 7, 0x18202d);
  leftWall.position.set(-4.5, 2.1, 0);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // window in back wall — a glowing skyline plane
  skyCanvas = document.createElement('canvas');
  skyCanvas.width = 512; skyCanvas.height = 288;
  skyTexture = new THREE.CanvasTexture(skyCanvas);
  skyTexture.colorSpace = THREE.SRGBColorSpace;
  const windowPane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 2.0),
    new THREE.MeshBasicMaterial({ map: skyTexture })
  );
  windowPane.position.set(1.1, 2.1, -3.39);
  scene.add(windowPane);

  const frameMat = M(0x3a4a63);
  const frameTop = box(3.8, 0.1, 0.08, 0x3a4a63); frameTop.position.set(1.1, 3.15, -3.36);
  const frameBot = box(3.8, 0.1, 0.08, 0x3a4a63); frameBot.position.set(1.1, 1.05, -3.36);
  const frameL = box(0.1, 2.2, 0.08, 0x3a4a63); frameL.position.set(-0.75, 2.1, -3.36);
  const frameR = box(0.1, 2.2, 0.08, 0x3a4a63); frameR.position.set(2.95, 2.1, -3.36);
  const frameM = box(0.06, 2.0, 0.08, 0x3a4a63); frameM.position.set(1.1, 2.1, -3.36);
  scene.add(frameTop, frameBot, frameL, frameR, frameM);

  const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.04, 32), M(0x24485e, { roughness: 1 }));
  rug.position.set(0, 0.02, 0.4);
  rug.receiveShadow = true;
  scene.add(rug);

  // avatar anchor
  avatarGroup = new THREE.Group();
  avatarGroup.position.set(0, 0, 0.4);
  scene.add(avatarGroup);
}

/* ── tier furniture: index 0..4, cumulative feel handled by visibility ── */
function buildTierFurniture() {
  // TIER 0 — Struggle Street: cardboard boxes, busted couch
  const t0 = new THREE.Group();
  const oldCouch = box(1.8, 0.55, 0.8, 0x4a3b2e); oldCouch.position.set(-2.6, 0.28, 0.6);
  const couchBack0 = box(1.8, 0.5, 0.2, 0x40332a); couchBack0.position.set(-2.6, 0.75, 0.25);
  const cbox1 = box(0.55, 0.5, 0.55, 0x8a6f4d); cbox1.position.set(3.0, 0.25, 1.4); cbox1.rotation.y = 0.4;
  const cbox2 = box(0.45, 0.4, 0.45, 0x94794f); cbox2.position.set(3.3, 0.7, 1.35); cbox2.rotation.y = -0.2;
  const cbox3 = box(0.5, 0.45, 0.5, 0x816844); cbox3.position.set(2.3, 0.22, 1.9);
  t0.add(oldCouch, couchBack0, cbox1, cbox2, cbox3);

  // TIER 1 — Getting There: decent couch, coffee table
  const t1 = new THREE.Group();
  const couch = box(1.9, 0.55, 0.85, 0x3d5a80); couch.position.set(-2.6, 0.28, 0.6);
  const couchBack = box(1.9, 0.55, 0.22, 0x35506f); couchBack.position.set(-2.6, 0.78, 0.22);
  const armL = box(0.22, 0.75, 0.85, 0x35506f); armL.position.set(-3.6, 0.38, 0.6);
  const armR = box(0.22, 0.75, 0.85, 0x35506f); armR.position.set(-1.6, 0.38, 0.6);
  const table = box(1.0, 0.08, 0.6, 0x6b4f35); table.position.set(-2.5, 0.42, 1.8);
  const tLegs = box(0.9, 0.34, 0.5, 0x53402c); tLegs.position.set(-2.5, 0.17, 1.8);
  t1.add(couch, couchBack, armL, armR, table, tLegs);

  // TIER 2 — On the Up: bookshelf, side table + lamp shade
  const t2 = new THREE.Group();
  const shelf = box(1.2, 2.2, 0.35, 0x5d4630); shelf.position.set(3.6, 1.1, -2.9);
  for (let i = 0; i < 4; i++) {
    const books = box(1.0, 0.28, 0.25, [0xc94f4f, 0x4fc9a0, 0xc9b44f, 0x4f6fc9][i]);
    books.position.set(3.6, 0.45 + i * 0.5, -2.85);
    t2.add(books);
  }
  const sideT = box(0.5, 0.5, 0.5, 0x6b4f35); sideT.position.set(-3.9, 0.25, -1.5);
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.7, 12), M(0x333)); lampBase.position.set(-3.9, 0.85, -1.5);
  const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.3, 16), M(0xffd9a0, { emissive: 0xff9d3f, emissiveIntensity: 0.6 })); lampShade.position.set(-3.9, 1.3, -1.5);
  t2.add(shelf, sideT, lampBase, lampShade);

  // TIER 3 — Thriving: gold trim art, chandelier bulb
  const t3 = new THREE.Group();
  const artFrame = box(1.15, 0.85, 0.06, 0xd4af37, { metalness: 0.7, roughness: 0.3 }); artFrame.position.set(-2.6, 2.3, -3.38);
  const artCanvasM = box(0.95, 0.65, 0.07, 0x1f6f8b, { emissive: 0x1f6f8b, emissiveIntensity: 0.25 }); artCanvasM.position.set(-2.6, 2.3, -3.37);
  const chand = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), M(0xfff2cc, { emissive: 0xffe08a, emissiveIntensity: 1.4 }));
  chand.position.set(0, 3.7, 0.2);
  const chandLight = new THREE.PointLight(0xffe4a8, 0.9, 10); chandLight.position.copy(chand.position);
  t3.add(artFrame, artCanvasM, chand, chandLight);

  // TIER 4 — Legend: gold floor trim + trophy podium
  const t4 = new THREE.Group();
  const trim = box(9, 0.06, 0.12, 0xd4af37, { metalness: 0.9, roughness: 0.2 }); trim.position.set(0, 0.03, -3.36);
  const podium = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.5, 24), M(0x2b2b3a, { metalness: 0.4 })); podium.position.set(3.4, 0.25, 0.2);
  const trophy = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), M(0xffd700, { metalness: 1, roughness: 0.15, emissive: 0xaa8800, emissiveIntensity: 0.4 })); trophy.position.set(3.4, 0.75, 0.2);
  t4.add(trim, podium, trophy);

  tierGroups = [t0, t1, t2, t3, t4];
  tierGroups.forEach((g) => {
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    g.visible = false;
    scene.add(g);
  });
}

/* ── shop items ── */
function buildShopItems() {
  const mk = (id, group) => {
    group.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
    group.visible = false;
    shopGroups[id] = group;
    scene.add(group);
  };

  // plant
  const plant = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.35, 12), M(0xb35a3c)); pot.position.y = 0.18;
  plant.add(pot);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), M(0x2e8b57));
    const a = (i / 6) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 0.16, 0.55 + (i % 2) * 0.16, Math.sin(a) * 0.16);
    leaf.scale.set(1, 1.6, 0.5);
    leaf.rotation.z = Math.cos(a) * 0.5;
    plant.add(leaf);
  }
  plant.position.set(2.2, 0, -2.8);
  mk('plant', plant);

  // designer lamp (arc floor lamp)
  const lamp = new THREE.Group();
  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.08, 16), M(0xd4af37, { metalness: 0.8, roughness: 0.3 })); base2.position.y = 0.04;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8), M(0xd4af37, { metalness: 0.8, roughness: 0.3 })); pole.position.y = 1.1;
  const shade2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), M(0xffffff, { emissive: 0xffd9a0, emissiveIntensity: 1.2 }));
  shade2.position.y = 2.2; shade2.rotation.x = Math.PI;
  const lampGlow = new THREE.PointLight(0xffd9a0, 0.7, 6); lampGlow.position.set(0, 2.0, 0);
  lamp.add(base2, pole, shade2, lampGlow);
  lamp.position.set(-1.2, 0, -2.6);
  mk('lamp', lamp);

  // wall art
  const art = new THREE.Group();
  const f2 = box(0.9, 1.2, 0.06, 0x222); f2.position.set(0, 0, 0);
  const c2 = box(0.74, 1.04, 0.07, 0xd4526e, { emissive: 0xd4526e, emissiveIntensity: 0.3 });
  art.add(f2, c2);
  art.position.set(-4.38, 2.2, 0.6);
  art.rotation.y = Math.PI / 2;
  mk('art', art);

  // TV
  const tv = new THREE.Group();
  const stand = box(1.6, 0.4, 0.4, 0x2b2b2b); stand.position.y = 0.2;
  const screen = box(1.7, 0.95, 0.06, 0x050505); screen.position.y = 1.0;
  const glow = box(1.6, 0.85, 0.02, 0x1f6f8b, { emissive: 0x2fa8d5, emissiveIntensity: 0.9 }); glow.position.set(0, 1.0, 0.04);
  tv.add(stand, screen, glow);
  tv.position.set(0.4, 0, -3.1);
  mk('tv', tv);

  // dog
  const dog = new THREE.Group();
  const bodyD = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.35, 8, 12), M(0xb08850)); bodyD.rotation.z = Math.PI / 2; bodyD.position.y = 0.3;
  const headD = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), M(0xb08850)); headD.position.set(0.34, 0.42, 0);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.1), M(0x8a6538)); snout.position.set(0.46, 0.38, 0);
  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 6), M(0x8a6538)); earL.position.set(0.3, 0.56, 0.08);
  const earR = earL.clone(); earR.position.z = -0.08;
  dogTail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.25, 6), M(0xb08850));
  dogTail.position.set(-0.3, 0.42, 0); dogTail.rotation.z = -0.8;
  const legs = [];
  for (const [x, z] of [[0.18, 0.09], [0.18, -0.09], [-0.18, 0.09], [-0.18, -0.09]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 6), M(0x9a7440));
    leg.position.set(x, 0.12, z);
    legs.push(leg);
  }
  dog.add(bodyD, headD, snout, earL, earR, dogTail, ...legs);
  dog.position.set(1.5, 0, 1.4);
  dog.rotation.y = -0.6;
  mk('dog', dog);

  // sports car (display piece by the window)
  const car = new THREE.Group();
  const chassis = box(2.0, 0.32, 0.85, 0xd12b3f, { metalness: 0.7, roughness: 0.25 }); chassis.position.y = 0.36;
  const cabin = box(1.0, 0.28, 0.75, 0x18202d, { metalness: 0.5, roughness: 0.2 }); cabin.position.set(-0.1, 0.65, 0);
  car.add(chassis, cabin);
  for (const [x, z] of [[0.68, 0.45], [0.68, -0.45], [-0.68, 0.45], [-0.68, -0.45]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16), M(0x111));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.2, z);
    car.add(wheel);
  }
  const carPodium = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.45, 0.12, 32), M(0x2b2b3a, { metalness: 0.5 }));
  carPodium.position.y = 0.06;
  car.add(carPodium);
  car.position.set(2.8, 0, -1.6);
  car.rotation.y = 0.5;
  mk('car', car);

  // Bite voucher + aura are not scene objects (aura handled separately)
  shopGroups['aura'] = null;
  shopGroups['bite'] = null;
}

/* ── rain (Struggle Street weather) ── */
function buildRain() {
  const N = 500;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = Math.random() * 6;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  rain = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x5577aa, size: 0.03, transparent: true, opacity: 0.6 }));
  rain.visible = false;
  scene.add(rain);
}

/* ── golden aura cosmetic ── */
function buildAura() {
  const N = 120;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.6 + Math.random() * 0.25;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * 1.9;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  auraPoints = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffd700, size: 0.045, transparent: true, opacity: 0.9 }));
  auraPoints.visible = false;
  scene.add(auraPoints);
}

/* ── avatar (rigged GLB with animation clips) ── */
let mixer = null;
let actions = {};        // clip name -> AnimationAction
let idleAction = null;
let emoteTimeout = null;

export function loadAvatar(url, color) {
  return new Promise((resolve) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (avatar) avatarGroup.remove(avatar);
        avatar = gltf.scene;
        spineBone = null; headBone = null;
        avatar.traverse((o) => {
          if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; }
          if (o.isBone) {
            if (o.name === 'Spine1' || o.name === 'Spine') spineBone = spineBone || o;
            if (o.name === 'Head') headBone = o;
          }
          // colour customisation — tint the primary material (RobotExpressive names it "Main")
          if (color && o.isMesh) {
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m) => { if (m.name === 'Main') m.color.set(color); });
          }
        });

        // normalise size + facing: scale the character to ~1.7 units tall.
        // Bounding boxes lie for morph-target models, so bundled assets use known heights.
        const KNOWN_HEIGHTS = { 'robot.glb': 4.6, 'soldier.glb': 1.8 };
        const key = Object.keys(KNOWN_HEIGHTS).find((k) => url.includes(k));
        let height = key ? KNOWN_HEIGHTS[key] : 0;
        if (!height) {
          const bounds = new THREE.Box3().setFromObject(avatar);
          height = bounds.max.y - bounds.min.y;
        }
        if (height > 0.1) avatar.scale.setScalar(1.7 / height);
        if (url.includes('soldier')) avatar.rotation.y = Math.PI;

        // animations
        mixer = null; actions = {}; idleAction = null;
        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(avatar);
          for (const clip of gltf.animations) {
            actions[clip.name] = mixer.clipAction(clip);
          }
          idleAction = actions['Idle'] || actions[gltf.animations[0].name];
          idleAction.play();
        }

        avatarGroup.add(avatar);
        resolve(true);
      },
      undefined,
      () => {
        // asset missing — fall back to a simple mannequin so the demo never breaks
        if (!avatar) buildFallbackMannequin();
        resolve(false);
      }
    );
  });
}

// Play a one-shot emote (Jump / ThumbsUp / Yes / No / Wave / Dance), then fade back to Idle
export function playEmote(name, holdMs = 0) {
  const action = actions[name];
  if (!action || !idleAction) return false;
  clearTimeout(emoteTimeout);
  idleAction.fadeOut(0.25);
  action.reset();
  action.setLoop(name === 'Dance' ? THREE.LoopRepeat : THREE.LoopOnce, name === 'Dance' ? Infinity : 1);
  action.clampWhenFinished = true;
  action.fadeIn(0.25).play();
  const dur = holdMs || (action.getClip().duration * 1000 + 150);
  emoteTimeout = setTimeout(() => {
    action.fadeOut(0.3);
    idleAction.reset().fadeIn(0.3).play();
  }, dur);
  return true;
}

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Character reaction to a transaction — the emotional heart of the game
export function react(kind, magnitude = 0) {
  if (kind === 'good') {
    if (magnitude >= 15 && actions['Dance']) return playEmote('Dance', 2600);
    if (!playEmote(pickOne(['ThumbsUp', 'Yes', 'Jump', 'Wave']))) celebrate();
  } else if (kind === 'bad') {
    if (!playEmote(magnitude <= -20 ? 'Death' : 'No', magnitude <= -20 ? 2200 : 0)) setMood(-1);
  }
}

function buildFallbackMannequin() {
  avatar = new THREE.Group();
  const bodyM = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.7, 8, 16), M(0x00d4b8));
  bodyM.position.y = 0.95;
  const headM = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), M(0xf0c8a0));
  headM.position.y = 1.62;
  avatar.add(bodyM, headM);
  avatar.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  avatarGroup.add(avatar);
}

export function celebrate() {
  if (!jumping) { jumping = true; jumpVel = 4.2; }
  mood = 1;
}
export function setMood(m) { mood = m; }   // -1 | 0 | 1

/* ── tier visuals ── */
export function setTier(tier, owned = []) {
  currentTier = tier;
  tierGroups.forEach((g, i) => {
    // furniture is progressive: tier 0 shows only t0; higher tiers show 1..tier and hide the junk
    g.visible = i === 0 ? tier === 0 : i <= tier && i > 0;
  });
  rain.visible = tier === 0;

  // lighting per tier
  const lightCfg = [
    { amb: 0.15, sun: 0.25, sunColor: 0x8899bb, bg: 0x07090d },
    { amb: 0.3,  sun: 0.7,  sunColor: 0xcfd8e8, bg: 0x0a0e14 },
    { amb: 0.45, sun: 1.1,  sunColor: 0xffe9c9, bg: 0x0d1320 },
    { amb: 0.55, sun: 1.3,  sunColor: 0xffe0a8, bg: 0x101728 },
    { amb: 0.6,  sun: 1.5,  sunColor: 0xffd98a, bg: 0x131b30 },
  ][tier];
  ambientLight.intensity = lightCfg.amb;
  sunLight.intensity = lightCfg.sun;
  sunLight.color.setHex(lightCfg.sunColor);
  scene.background.setHex(lightCfg.bg);
  scene.fog.color.setHex(lightCfg.bg);

  drawSkyline(tier);
  applyOwned(owned);
  mood = tier <= 0 ? -1 : tier >= 3 ? 1 : 0;
}

export function applyOwned(owned) {
  for (const [id, group] of Object.entries(shopGroups)) {
    if (group) group.visible = owned.includes(id);
  }
  auraPoints.visible = owned.includes('aura');
}

/* ── skyline canvas per tier ── */
function drawSkyline(tier) {
  const ctx = skyCanvas.getContext('2d');
  const w = skyCanvas.width, h = skyCanvas.height;
  const skies = [
    ['#2a3440', '#151b23'],           // rainy grey
    ['#3d5a80', '#1b2838'],           // dusk blue
    ['#ff9d5c', '#5c3d80'],           // sunset
    ['#ffd98a', '#7a4fb0'],           // golden hour
    ['#0d1b3d', '#3b1d5e'],           // neon night
  ][tier];
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, skies[0]);
  grad.addColorStop(1, skies[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // stars for legend tier
  if (tier === 4) {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 60; i++) ctx.fillRect(Math.random() * w, Math.random() * h * 0.5, 1.5, 1.5);
  }
  // buildings
  let x = 0;
  const seed = 12345;
  let s = seed;
  const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  while (x < w) {
    const bw = 25 + rand() * 45;
    const bh = 60 + rand() * (h * 0.55);
    ctx.fillStyle = tier === 4 ? '#141a2e' : '#0e131c';
    ctx.fillRect(x, h - bh, bw, bh);
    // lit windows — more lit at higher tiers
    const litChance = [0.1, 0.25, 0.4, 0.55, 0.8][tier];
    ctx.fillStyle = tier === 4 ? '#00e5ff' : '#ffd98a';
    for (let wy = h - bh + 8; wy < h - 8; wy += 12) {
      for (let wx = x + 5; wx < x + bw - 6; wx += 10) {
        if (rand() < litChance) ctx.fillRect(wx, wy, 4, 6);
      }
    }
    x += bw + 8;
  }
  // rain streaks on glass
  if (tier === 0) {
    ctx.strokeStyle = 'rgba(150,180,220,0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * w, ry = Math.random() * h;
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 14); ctx.stroke();
    }
  }
  skyTexture.needsUpdate = true;
}

/* ── render loop ── */
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // gentle camera parallax
  camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.04;
  camera.position.y += (1.75 - mouseY * 0.25 - camera.position.y) * 0.04;
  camera.lookAt(0, 1.0, 0);

  if (mixer) mixer.update(dt);

  if (avatar) {
    // breathing (only when there's no skeletal animation driving the model)
    avatarGroup.position.y = Math.max(0, avatarGroup.position.y);
    if (!jumping && !mixer) avatar.position.y = Math.sin(t * 1.8) * 0.012;

    // jump physics
    if (jumping) {
      avatarGroup.position.y += jumpVel * dt;
      jumpVel -= 12 * dt;
      if (avatarGroup.position.y <= 0) { avatarGroup.position.y = 0; jumping = false; }
    }

    // mood posture
    if (spineBone) {
      const target = mood < 0 ? 0.32 : mood > 0 ? -0.05 : 0.05;
      spineBone.rotation.x += (target - spineBone.rotation.x) * 0.06;
    }
    if (headBone) {
      const target = mood < 0 ? 0.35 : Math.sin(t * 0.6) * 0.06;
      headBone.rotation.x += (target - headBone.rotation.x) * 0.06;
    }
    // subtle sway (on the group so it never fights the model's facing rotation)
    avatarGroup.rotation.y = Math.sin(t * 0.5) * 0.06;
  }

  // rain fall
  if (rain.visible) {
    const p = rain.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let y = p.getY(i) - dt * 4;
      if (y < 0) y = 6;
      p.setY(i, y);
    }
    p.needsUpdate = true;
  }

  // aura swirl
  if (auraPoints.visible) {
    auraPoints.rotation.y = t * 0.8;
    auraPoints.position.copy(avatarGroup.position);
    auraPoints.position.z += 0.4 - 0.4; // anchored at avatar
    auraPoints.position.x = avatarGroup.position.x;
    auraPoints.position.z = avatarGroup.position.z;
  }

  // dog tail wag
  if (dogTail && shopGroups['dog'] && shopGroups['dog'].visible) {
    dogTail.rotation.x = Math.sin(t * 8) * 0.5;
  }

  renderer.render(scene, camera);
}
