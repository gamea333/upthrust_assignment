// Runs the 3D setups (statue, tube) one after another, and only while the
// visitor isn't scrolling, so their heavy work never overlaps each other or
// lands in the middle of a scroll.

/** Resolves the next time the main thread is idle (or after `timeout` ms). */
export const idle = (timeout = 1500) =>
  new Promise<void>((resolve) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => resolve(), { timeout });
    else setTimeout(resolve, 200);
  });

// Last time the visitor scrolled (wheel, touch, keys or scrollbar).
let lastActivity = 0;
const markActive = () => (lastActivity = performance.now());
for (const type of ['wheel', 'touchmove', 'keydown', 'scroll'] as const) {
  window.addEventListener(type, markActive, { passive: true, capture: true });
}

/** Resolves once the page has been still for `ms` and the main thread is idle. */
export async function whenQuiet(ms = 700): Promise<void> {
  for (;;) {
    const wait = lastActivity + ms - performance.now();
    if (wait <= 0) break;
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  await idle();
}

// Set when a 3D scene proved too slow on this device; later scenes are skipped.
let lowPower = false;
export const markLowPower = () => (lowPower = true);

let chain: Promise<unknown> = Promise.resolve();

/** Queue a setup task; it starts once earlier tasks finish and the page is quiet. */
export function enqueue(task: () => Promise<unknown>): Promise<unknown> {
  // The device check runs here, when the page is quiet, so a busy moment
  // can't make a fast device look slow.
  const run = chain.then(() => whenQuiet()).then(() => (prefersLightweight() ? undefined : task()));
  chain = run.catch(() => undefined);
  return run;
}

/**
 * Tiny CPU speed test (~8 ms on a typical laptop). A device more than about 3x
 * slower would stutter while preparing the 3D, so it keeps the images instead.
 */
let cpuSlow: boolean | undefined;
function cpuTooSlow(): boolean {
  if (cpuSlow !== undefined) return cpuSlow;
  const run = () => {
    const start = performance.now();
    let x = 0;
    for (let i = 0; i < 1e5; i++) x += Math.sqrt(i) * Math.sin(i);
    return x > 0 ? performance.now() - start : Infinity;
  };
  cpuSlow = Math.min(run(), run(), run()) > 22;
  return cpuSlow;
}

/** True when the device looks too weak to run the live 3D smoothly. */
export function prefersLightweight(): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (lowPower || nav.connection?.saveData) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return true;
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return true;
  return cpuTooSlow();
}
