// Newsletter signup: validate, POST to /api/subscribe, show success, and report
// the funnel to Google Tag Manager's dataLayer:
//   form_start  – first interaction with the form (once per page view)
//   form_error  – validation or server error (with the reason)
//   form_submit – successful submission, only after the server says OK

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

const FORM_ID = 'newsletter_footer';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Field = 'email' | 'consent';
type Errors = Partial<Record<Field, string>>;

function track(event: string, extra: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, form_id: FORM_ID, ...extra });
}

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

/** Show or clear the message for the given fields (default: both). */
function showErrors(form: HTMLFormElement, errors: Errors, fields: Field[] = ['email', 'consent']) {
  for (const field of fields) {
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

/** Short shake on a field that failed validation (skipped for reduced motion via CSS). */
function shake(form: HTMLFormElement, field: Field) {
  const wrapper = form.querySelector<HTMLElement>(`[data-field="${field}"]`);
  if (!wrapper) return;
  wrapper.classList.remove('is-shaking');
  void wrapper.offsetWidth; // restart the animation
  wrapper.classList.add('is-shaking');
}

export function initSignupForm(form: HTMLFormElement) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const label = form.querySelector<HTMLElement>('[data-label]');
  const status = form.querySelector<HTMLElement>('[data-status]');
  const success = form.querySelector<HTMLElement>('[data-success]');
  const emailInput = form.elements.namedItem('email') as HTMLInputElement | null;
  const emailField = form.querySelector<HTMLElement>('[data-field="email"]');
  const buttonText = label?.textContent ?? 'Submit';

  // form_start: the first time someone starts filling the form in.
  let started = false;
  const onStart = () => {
    if (started) return;
    started = true;
    track('form_start');
  };
  form.addEventListener('input', onStart);
  form.addEventListener('change', onStart);

  // Live feedback: tick when the email looks valid; clear errors once fixed.
  form.addEventListener('input', () => {
    const errors = validate(form);
    emailField?.classList.toggle('is-valid', !errors.email);
    if (form.querySelector('[aria-invalid="true"]')) showErrors(form, errors);
  });

  // Check the email as soon as the visitor leaves the field (not only on submit),
  // but don't nag about an empty field they simply tabbed past.
  emailInput?.addEventListener('blur', () => {
    if (!emailInput.value.trim()) return;
    showErrors(form, validate(form), ['email']);
  });

  const setLoading = (loading: boolean) => {
    if (!button) return;
    button.disabled = loading;
    button.setAttribute('aria-busy', String(loading));
    if (label) label.textContent = loading ? 'Sending…' : buttonText;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (status) status.textContent = '';

    const errors = validate(form);
    showErrors(form, errors);
    const invalid = Object.keys(errors) as Field[];
    if (invalid.length) {
      invalid.forEach((field) => shake(form, field));
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      track('form_error', { error_type: 'validation', error_fields: invalid.join(',') });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        track('form_error', { error_type: 'server', status_code: response.status });
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }

      form.classList.add('is-done');
      if (success) {
        success.hidden = false;
        success.focus();
      }
      track('form_submit');
    } catch (error) {
      if (error instanceof TypeError) track('form_error', { error_type: 'network' });
      if (status) {
        status.textContent =
          error instanceof Error && !(error instanceof TypeError)
            ? error.message
            : 'Something went wrong. Please check your connection and try again.';
      }
    } finally {
      setLoading(false);
    }
  });

  // CONTACT buttons link to #signup: move focus to the email field when they land here.
  document.querySelectorAll<HTMLAnchorElement>('a[href$="#signup"]').forEach((link) =>
    link.addEventListener('click', () => {
      setTimeout(() => emailInput?.focus({ preventScroll: true }), 400);
    }),
  );
}
