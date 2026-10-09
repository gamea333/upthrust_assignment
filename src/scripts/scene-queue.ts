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

/**
 * Background shader compile with a safety net: some browsers/drivers never
 * report completion, so after `ms` we carry on anyway (worst case the first
 * frame compiles synchronously, which is what happened before).
 */
export function compileWithTimeout(compile: () => Promise<unknown>, ms = 2000): Promise<unknown> {
  return Promise.race([compile(), new Promise((resolve) => setTimeout(resolve, ms))]);
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

let chain: Promise<unknown> = Promise.resolve();

/** Queue a setup task; it starts once earlier tasks finish and the page is quiet. */
export function enqueue(task: () => Promise<unknown>): Promise<unknown> {
  // The device check runs here, when the page is quiet, so a busy moment
  // can't make a fast device look slow.
  const run = chain.then(() => whenQuiet()).then(() => (prefersLightweight() ? undefined : task()));
  chain = run.catch(() => undefined);
  return run;
}

/** True when the device looks too weak to run the live 3D smoothly. */
export function prefersLightweight(): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return true;
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return true;
  // Anything else is judged by real frame times once the scene is running.
  return false;
}
