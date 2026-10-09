// Server-only Supabase access. Uses the secret (service role) key, which bypasses
// Row Level Security; the table has RLS on with no policies, so the public
// (anon/publishable) key can't read or write it at all.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from 'astro:env/server';

let client: SupabaseClient | undefined;

function supabase() {
  client ??= createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

const UNIQUE_VIOLATION = '23505';

export async function insertSignup({
  email,
  userAgent,
}: {
  email: string;
  userAgent: string | null;
}) {
  const { error } = await supabase()
    .from('newsletter_signups')
    .insert({
      email,
      consent: true,
      source: 'newsletter_footer',
      user_agent: userAgent?.slice(0, 300) ?? null,
    });

  // Signing up twice isn't an error for the visitor (and telling them would
  // reveal who's on the list), so a duplicate email counts as success.
  if (error && error.code !== UNIQUE_VIOLATION) throw error;
}
