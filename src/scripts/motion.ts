// Desktop motion: Lenis smooth scroll + GSAP ScrollTrigger, loaded on demand.
// Lenis moves the page from the same animation frame GSAP uses, so pinned
// sections update in sync with the scroll instead of lagging a frame behind.
// Mobile, tablet and reduced-motion users keep native scrolling and load none of this.

import type Lenis from 'lenis';

export const MOTION_QUERY = '(min-width: 64rem) and (prefers-reduced-motion: no-preference)';

type Motion = {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
  /** Current Lenis instance, or null when the native scroll is in charge. */
  getLenis: () => Lenis | null;
};

let loading: Promise<Motion> | undefined;

export function loadMotion(): Promise<Motion> {
  loading ??= (async () => {
    const [{ gsap }, { ScrollTrigger }, { default: LenisCtor }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('lenis'),
    ]);
    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    const start = () => {
      if (lenis) return;
      lenis = new LenisCtor({ anchors: true, autoRaf: false });
      lenis.on('scroll', ScrollTrigger.update);
    };
    const stop = () => {
      lenis?.destroy();
      lenis = null;
    };

    gsap.ticker.add((time) => lenis?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Hand scrolling back to the browser if the window shrinks or motion is turned off.
    const mq = window.matchMedia(MOTION_QUERY);
    if (mq.matches) start();
    mq.addEventListener('change', (e) => (e.matches ? start() : stop()));

    return { gsap, ScrollTrigger, getLenis: () => lenis };
  })();
  return loading;
}

/** Runs `setup` once motion is allowed (now, or later if the window grows). */
export function whenMotionAllowed(setup: (motion: Motion) => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  const run = () => loadMotion().then(setup);
  if (mq.matches) run();
  else mq.addEventListener('change', (e) => e.matches && run(), { once: true });
}
