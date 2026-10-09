// Newsletter signup: validate, POST to /api/subscribe, show success,
// then push form_submit to the GTM dataLayer (only after the server says OK).

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<'email' | 'consent', string>>;

function validate(form: HTMLFormElement): Errors {
  const data = new FormData(form);
  const email = String(data.get('email') ?? '').trim();
  const errors: Errors = {};

  if (!email) errors.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(email))
    errors.email = 'Please enter a valid email, like name@company.com.';
  if (!data.get('consent')) errors.consent = 'Please tick the box to agree to receive our emails.';

  return errors;
}

function showErrors(form: HTMLFormElement, errors: Errors) {
  for (const field of ['email', 'consent'] as const) {
    const input = form.elements.namedItem(field) as HTMLInputElement | null;
    const message = form.querySelector<HTMLElement>(`[data-error="${field}"]`);
    const text = errors[field];

    input?.setAttribute('aria-invalid', String(Boolean(text)));
    if (message) {
      message.textContent = text ?? '';
      message.hidden = !text;
    }
  }
}

export function initSignupForm(form: HTMLFormElement) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const status = form.querySelector<HTMLElement>('[data-status]');
  const success = form.querySelector<HTMLElement>('[data-success]');
  const emailInput = form.elements.namedItem('email') as HTMLInputElement | null;

  // Clear a field's error as soon as it's fixed.
  form.addEventListener('input', () => {
    if (form.querySelector('[aria-invalid="true"]')) showErrors(form, validate(form));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (status) status.textContent = '';

    const errors = validate(form);
    showErrors(form, errors);
    if (Object.keys(errors).length) {
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    if (button) button.disabled = true;
    if (status) status.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.');

      form.classList.add('is-done');
      if (status) status.textContent = '';
      if (success) {
        success.hidden = false;
        success.focus();
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'form_submit', form_id: 'newsletter_footer' });
    } catch (error) {
      if (status) {
        status.textContent =
          error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      }
    } finally {
      if (button) button.disabled = false;
    }
  });

  // CONTACT buttons link to #signup: move focus to the email field when they land here.
  document.querySelectorAll<HTMLAnchorElement>('a[href="#signup"]').forEach((link) =>
    link.addEventListener('click', () => {
      setTimeout(() => emailInput?.focus({ preventScroll: true }), 400);
    }),
  );
}
