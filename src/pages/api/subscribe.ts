// POST /api/subscribe: newsletter signup from the footer form.
// Runs as a Vercel serverless function (everything else on the site is static).
//
// Flow: parse JSON -> reject bots (honeypot) -> rate limit per IP -> validate
// with Zod -> insert into Supabase -> 200. The client only pushes the GTM
// form_submit event after it gets that 200.

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { insertSignup } from '../../lib/supabase';
import { isRateLimited } from '../../lib/rate-limit';

export const prerender = false;

const Signup = z.object({
  email: z.string().trim().toLowerCase().max(254).email('Please enter a valid email address.'),
  consent: z.literal('yes', {
    errorMap: () => ({ message: 'Please tick the box to agree to receive our emails.' }),
  }),
  // Honeypot: hidden from people, bots fill it in.
  company: z.string().max(0).optional().or(z.literal('')),
});

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: 'Invalid request.' });
  }

  // Bots that fill the hidden field get a fake success so they don't retry.
  if (payload && typeof payload === 'object' && 'company' in payload && payload.company) {
    return json(200, { ok: true });
  }

  if (isRateLimited(clientAddress)) {
    return json(429, { error: 'Too many attempts. Please try again in a minute.' });
  }

  const parsed = Signup.safeParse(payload);
  if (!parsed.success) {
    return json(400, { error: parsed.error.issues[0]?.message ?? 'Invalid request.' });
  }

  try {
    await insertSignup({
      email: parsed.data.email,
      userAgent: request.headers.get('user-agent'),
    });
    return json(200, { ok: true });
  } catch (error) {
    console.error('[subscribe] insert failed', error);
    return json(500, { error: 'Something went wrong on our side. Please try again.' });
  }
};

// Anything other than POST.
export const ALL: APIRoute = () => {
  const response = json(405, { error: 'Method not allowed.' });
  response.headers.set('Allow', 'POST');
  return response;
};
