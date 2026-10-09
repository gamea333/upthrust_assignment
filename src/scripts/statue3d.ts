// Live 3D version of the hero statue (desktop with a mouse only).
//
// The pre-rendered statue image is the page's LCP element and always loads
// first. This module is only downloaded after the visitor's first mouse move,
// then draws the supplied statue GLB with the same material, lights and camera
// framing that produced the image, so the swap is seamless. From there it
// turns towards the cursor and its iridescent colours shift as it moves.
//
// Like the tube, the canvas follows the image's on-screen rectangle every frame
// (the image keeps its parallax and float animations), the image stays as the
// fallback, rendering pauses when the hero is off screen, and resolution drops
// on slow GPUs.

import {
  ACESFilmicToneMapping,
  Box3,
  Group,
  DirectionalLight,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { compileWithTimeout, markLowPower, whenQuiet } from './scene-queue';

type Options = {
  /** Positioned ancestor the canvas is placed in (the hero stage). */
  stage: HTMLElement;
  /** The statue <img>; its on-screen rectangle is where the model is drawn. */
  image: HTMLElement;
};

const FOV = 30; // same as the pre-render
const FILL = 0.98;
// The canvas is larger than the image so the statue can turn without its
// shoulders being clipped at the edges.
const PAD_X = 0.25;
const PAD_Y = 0.08;

export async function mountStatue3D({ stage, image }: Options) {
  // Step 1 — fetch and decode the model. Meshopt decoding runs in web workers,
  // off the main thread.
  MeshoptDecoder.useWorkers?.(2);
  const gltf = await new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .loadAsync('/models/statue.glb');
  await whenQuiet();

  // Step 2 — renderer, environment and lights (short GPU work), in an idle slot.
  const canvas = document.createElement('canvas');
  canvas.className = 'statue-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  // 1.5x is visually indistinguishable here and much cheaper than 2x.
  let pixelRatio = Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  // Don't ask the GPU "did that shader compile?" after every compile: that
  // forces the main thread to wait for the GPU (hundreds of ms of freeze) and
  // defeats background compilation. These shaders are fixed and known-good.
  renderer.debug.checkShaderErrors = false;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  // Lighting copied from the render that produced the fallback image.
  const key = new DirectionalLight(0xffffff, 0.6);
  key.position.set(-3, 4, 5);
  scene.add(key);
  for (const [color, x, y, z, intensity] of [
    [0xff2fb0, 4, 1, 2, 60],
    [0x22e0ff, -4, 2, 1, 60],
    [0xffd400, 0, -3, 3, 40],
    [0x6a5cff, 0, 4, -2, 50],
  ] as const) {
    const light = new PointLight(color, intensity, 0, 2);
    light.position.set(x, y, z);
    scene.add(light);
  }

  const material = new MeshPhysicalMaterial({
    color: 0x1b2a8a,
    metalness: 1,
    roughness: 0.28,
    iridescence: 1,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: [250, 800],
    envMapIntensity: 0.5,
  });

  const model: Object3D = gltf.scene;
  model.traverse((node) => {
    if ((node as Mesh).isMesh) (node as Mesh).material = material;
  });
  // Centre the model and measure it, exactly as the pre-render did. The pivot
  // sits at the statue's centre so it turns in place.
  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  model.position.sub(box.getCenter(new Vector3()));
  const pivot = new Group();
  pivot.add(model);
  scene.add(pivot);

  const camera = new PerspectiveCamera(FOV, 1, 0.01, 1000);
  const half = MathUtils.degToRad(FOV / 2);

  let cssW = 0;
  let cssH = 0;
  const layout = (rect: DOMRect, stageRect: DOMRect) => {
    const w = rect.width * (1 + PAD_X * 2);
    const h = rect.height * (1 + PAD_Y * 2);
    canvas.style.left = `${rect.left - stageRect.left - rect.width * PAD_X}px`;
    canvas.style.top = `${rect.top - stageRect.top - rect.height * PAD_Y}px`;
    if (Math.abs(w - cssW) > 0.5 || Math.abs(h - cssH) > 0.5) {
      cssW = w;
      cssH = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      renderer.setSize(w, h, false);

      // Frame the model for the *image* size (like the pre-render), then widen
      // the field of view so the padded canvas shows the same model size.
      const imageAspect = rect.width / rect.height;
      const distH = size.y / 2 / Math.tan(half) / FILL;
      const distW = size.x / 2 / Math.tan(half) / imageAspect / FILL;
      camera.position.set(0, 0, Math.max(distH, distW) + size.z / 2);
      camera.fov = MathUtils.radToDeg(2 * Math.atan(Math.tan(half) * (1 + PAD_Y * 2)));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  };

  // Step 3 — attach the (still invisible) canvas, then compile the shaders in
  // the background (no main-thread freeze where parallel compile is supported).
  stage.append(canvas);
  layout(image.getBoundingClientRect(), stage.getBoundingClientRect());
  await compileWithTimeout(() => renderer.compileAsync(scene, camera));
  await whenQuiet();

  // Cursor follow (eased).
  const turn = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    turn.tx = (e.clientX / window.innerWidth) * 2 - 1;
    turn.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  let raf = 0;
  let running = false;
  let visibility: IntersectionObserver | undefined;

  // Back to the image for good (weak GPU, lost context).
  const destroy = () => {
    cancelAnimationFrame(raf);
    running = false;
    visibility?.disconnect();
    window.removeEventListener('pointermove', onPointer);
    stage.classList.remove('has-3d');
    setTimeout(() => {
      canvas.remove();
      renderer.dispose();
      material.dispose();
    }, 700); // after the cross-fade back
  };

  // Adaptive quality: step the resolution down if frames are slow; if it is
  // still slow at 1x, this device is better off with the image.
  let lastFrame = 0;
  let slow = 0;
  let sampled = 0;
  // Quick check: skip the first frames (GPU warm-up), then if the typical frame
  // is slower than ~35 fps this device is better off with the images, so hand
  // back to the image and skip any other 3D scene too.
  const early: number[] = [];
  const adapt = (now: number) => {
    if (lastFrame && early.length < 40) {
      early.push(now - lastFrame);
      if (early.length === 40) {
        const settled = early.slice(10).sort((a, b) => a - b);
        if (settled[15] > 28) {
          markLowPower();
          destroy();
          return;
        }
      }
    }
    if (lastFrame) {
      sampled++;
      if (now - lastFrame > 22) slow++;
      if (sampled >= 60) {
        if (slow > 20) {
          if (pixelRatio > 1) {
            pixelRatio = Math.max(1, pixelRatio - 0.5);
            renderer.setPixelRatio(pixelRatio);
            cssW = 0; // force a resize at the new ratio
          } else {
            destroy();
          }
        }
        sampled = 0;
        slow = 0;
      }
    }
    lastFrame = now;
  };

  const start = performance.now();
  const render = () => {
    if (!running) return;
    raf = requestAnimationFrame(render);
    const now = performance.now();
    adapt(now);
    const rect = image.getBoundingClientRect();
    if (!rect.width) return;
    layout(rect, stage.getBoundingClientRect());

    const t = (now - start) / 1000;
    turn.x += (turn.tx - turn.x) * 0.06;
    turn.y += (turn.ty - turn.y) * 0.06;
    pivot.rotation.y = turn.x * 0.45 + Math.sin(t * 0.35) * 0.08;
    pivot.rotation.x = turn.y * 0.12;
    // Slowly shift the iridescent sheen.
    scene.environmentRotation.y = Math.sin(t * 0.12) * 0.9;
    material.iridescenceThicknessRange[1] = 800 + Math.sin(t * 0.8) * 150;

    renderer.render(scene, camera);
  };

  // Only render while the hero is on screen.
  visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) {
      running = true;
      lastFrame = 0;
      raf = requestAnimationFrame(render);
    } else if (!entry.isIntersecting && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  });
  visibility.observe(stage);

  // Swap once a real frame has been drawn.
  requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.add('has-3d')));

  canvas.addEventListener('webglcontextlost', destroy);
}
