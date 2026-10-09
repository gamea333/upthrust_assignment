// Live 3D version of the orange tube in the services section (desktop only).
//
// The pre-rendered tube image stays in the page as the fallback and as the
// layout reference: every frame we read where that image currently is (GSAP
// moves it with the horizontal scroll) and draw the real GLB model in exactly
// that spot, so the 3D tube lines up with the panels just like the image did.
//
// On top of that:
// - it "draws itself": a clipping plane hides the tube to the right of a tip
//   that sits ~88% across the screen, so it grows as you scroll;
// - the reflections move: the environment map rotates with scroll progress;
// - it tilts slightly towards the cursor and sways gently when idle.
//
// This file (three.js + the model) is only downloaded on desktop, after the
// visitor scrolls towards the section, so it never affects page-load metrics.

import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  Plane,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  Box3,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

type Options = {
  section: HTMLElement;
  /** The fallback <img>; its on-screen rectangle is where the model is drawn. */
  image: HTMLElement;
  /** 0..1 progress of the horizontal scroll. */
  getProgress: () => number;
  /** Hook into the same frame loop as GSAP/Lenis so tube and panels never drift. */
  addTicker: (fn: () => void) => void;
  removeTicker: (fn: () => void) => void;
};

const FOV = 15; // narrow lens: close to the original render's perspective
const PITCH = MathUtils.degToRad(80); // same angle as the pre-rendered image
const FILL = 0.98; // the image render left a 1% margin each side
const TIP = 0.88; // the tube is drawn up to 88% of the screen width

export async function mountTube3D({
  section,
  image,
  getProgress,
  addTicker,
  removeTicker,
}: Options) {
  const canvas = document.createElement('canvas');
  canvas.className = 'tube-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  // Start sharp; step down if the GPU can't keep up (see adaptQuality below).
  let pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.localClippingEnabled = true;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const key = new DirectionalLight(0xffffff, 2);
  key.position.set(-3, 4, 5);
  scene.add(key);

  const camera = new PerspectiveCamera(FOV, 1, 1, 100000);

  // Draw-on: keep everything left of the tip (three clips where n·p + c < 0).
  const clip = new Plane(new Vector3(-1, 0, 0), 0);
  const material = new MeshPhysicalMaterial({
    color: 0xff4a12,
    metalness: 0.85,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.4,
    clippingPlanes: [clip],
  });

  const gltf = await new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .loadAsync('/models/tube.glb');
  const model: Object3D = gltf.scene;
  model.traverse((node) => {
    if ((node as Mesh).isMesh) (node as Mesh).material = material;
  });
  model.rotation.x = PITCH;

  // Measure the model once at scale 1 so we can fit it to the image width.
  model.updateMatrixWorld(true);
  const box = new Box3().setFromObject(model);
  const baseWidth = box.max.x - box.min.x;
  const baseCenter = box.getCenter(new Vector3());

  // Pivot sits at the screen centre, so tilting rotates the visible part of the
  // tube in place rather than swinging it around the middle of the whole track.
  const pivot = new Group();
  const holder = new Group();
  holder.add(model);
  pivot.add(holder);
  scene.add(pivot);

  // Above the (opaque) grid background, below the panels.
  const grid = section.querySelector('[data-grid]');
  if (grid) grid.after(canvas);
  else section.prepend(canvas);

  let width = 0;
  let height = 0;
  const resize = () => {
    width = section.clientWidth;
    height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // 1 world unit = 1 CSS pixel on the z = 0 plane.
    camera.position.set(0, 0, height / 2 / Math.tan(MathUtils.degToRad(FOV / 2)));
    camera.near = camera.position.z / 20;
    camera.far = camera.position.z * 20;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  // Pointer tilt (eased towards the target every frame).
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    tilt.tx = (e.clientX / window.innerWidth) * 2 - 1;
    tilt.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  section.addEventListener('pointermove', onPointer);
  section.addEventListener('pointerleave', () => ((tilt.tx = 0), (tilt.ty = 0)));

  let tip = 0; // eased, in CSS px from the left edge (starts hidden, grows in)
  const start = performance.now();

  // Adaptive quality: if frames average slower than ~45 fps for a second,
  // render at a lower resolution (down to 1x). Keeps weak laptops smooth.
  let lastFrame = 0;
  let slowFrames = 0;
  let sampled = 0;
  const adaptQuality = (now: number) => {
    if (lastFrame) {
      sampled++;
      if (now - lastFrame > 22) slowFrames++;
      if (sampled >= 60) {
        if (slowFrames > 20 && pixelRatio > 1) {
          pixelRatio = Math.max(1, pixelRatio - 0.5);
          renderer.setPixelRatio(pixelRatio);
          renderer.setSize(width, height, false);
        }
        sampled = 0;
        slowFrames = 0;
      }
    }
    lastFrame = now;
  };

  const render = () => {
    adaptQuality(performance.now());
    const sectionRect = section.getBoundingClientRect();
    const rect = image.getBoundingClientRect();
    if (!rect.width) return;
    const t = (performance.now() - start) / 1000;

    // Canvas covers the section's first screen; work in its coordinates.
    const left = rect.left - sectionRect.left;
    const top = rect.top - sectionRect.top;

    const scale = (rect.width * FILL) / baseWidth;
    holder.scale.setScalar(scale);
    holder.position.set(
      left + rect.width / 2 - width / 2 - baseCenter.x * scale,
      -(top + rect.height / 2 - height / 2) - baseCenter.y * scale + Math.sin(t * 0.6) * 6,
      -baseCenter.z * scale,
    );

    tilt.x += (tilt.tx - tilt.x) * 0.05;
    tilt.y += (tilt.ty - tilt.y) * 0.05;
    pivot.rotation.set(tilt.y * 0.05, tilt.x * 0.08, Math.sin(t * 0.4) * 0.006);

    // Reflections slide along the chrome as the panels move.
    scene.environmentRotation.y = getProgress() * Math.PI * 0.9 + t * 0.03;

    tip += (width * TIP - tip) * 0.04;
    clip.constant = tip - width / 2;

    renderer.render(scene, camera);
  };

  // Only render while the section is on screen.
  let running = false;
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) {
      running = true;
      addTicker(render);
    } else if (!entry.isIntersecting && running) {
      running = false;
      lastFrame = 0;
      removeTicker(render);
    }
  });
  visibility.observe(section);

  // First frame drawn: swap the image for the canvas.
  render();
  section.classList.add('has-3d');

  canvas.addEventListener('webglcontextlost', () => {
    // GPU reset or driver issue: go back to the image for good.
    removeTicker(render);
    visibility.disconnect();
    section.classList.remove('has-3d');
    canvas.remove();
  });

  return () => {
    removeTicker(render);
    visibility.disconnect();
    window.removeEventListener('resize', resize);
    section.removeEventListener('pointermove', onPointer);
    section.classList.remove('has-3d');
    canvas.remove();
    renderer.dispose();
    material.dispose();
  };
}
