// Magnetic buttons: [data-magnetic] elements lean towards the cursor while it's
// over them and spring back when it leaves. Desktop mouse only, motion allowed.

const allowed = window.matchMedia(
  '(min-width: 64rem) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
);
const STRENGTH = 0.3;

document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
  let frame = 0;

  el.addEventListener('pointermove', (e) => {
    if (!allowed.matches) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * STRENGTH;
      const y = (e.clientY - rect.top - rect.height / 2) * STRENGTH;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
  });

  el.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    el.style.transform = '';
  });
});
