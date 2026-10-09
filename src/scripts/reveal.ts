// Scroll reveals and off-screen pausing, shared by every section.
// - [data-reveal] gets .is-in the first time it scrolls into view (then stays).
// - .grid-drift gets .is-visible only while on screen, so its CSS loop
//   doesn't keep running for sections nobody is looking at.
// - .grid-bg gets .is-near (permanently) shortly before it scrolls into view, which
//   is when its background image is assigned and downloaded.
// Works with transforms too: panels sliding in sideways reveal as they arrive.

const reveal = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      reveal.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
);

const visibility = new IntersectionObserver((entries) => {
  for (const entry of entries) entry.target.classList.toggle('is-visible', entry.isIntersecting);
});

const near = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-near');
      near.unobserve(entry.target);
    }
  },
  { rootMargin: '600px 0px' },
);

document.querySelectorAll('[data-reveal]').forEach((el) => reveal.observe(el));
document.querySelectorAll('.grid-drift').forEach((el) => visibility.observe(el));
document.querySelectorAll('.grid-bg').forEach((el) => near.observe(el));
