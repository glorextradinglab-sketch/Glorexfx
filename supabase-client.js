/* ============================================================
   GLOREX — Supabase Client (shared)
   ────────────────────────────────────────────────────────────
   👉 استبدل القيمتين هون بالقيم اللي نسختها من Supabase Dashboard:
      Settings → API → Project URL  +  anon public key
============================================================ */

const SUPABASE_URL      = 'https://otrvhugznqtkdawyecou.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cnZodWd6bnF0a2Rhd3llY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NDk5OTcsImV4cCI6MjA5NTIyNTk5N30.xuF4wb2MroPph6i7vwMQjg7EacRuyE98Z4PgdFL2Kow';

/* ── Load Supabase JS SDK from CDN ── */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================================================
   AUTH HELPERS
============================================================ */

/* Sign up with email/password */
export async function signUp({ email, password, firstName, lastName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` },
      emailRedirectTo: `${location.origin}/dashboard.html`,
    },
  });
  return { data, error };
}

/* Sign in with email/password */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

/* Sign in with Google */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/dashboard.html` },
  });
  return { data, error };
}

/* Sign in with Apple */
export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: `${location.origin}/dashboard.html` },
  });
  return { data, error };
}

/* Sign out */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (!error) location.href = 'glorex_landing.html';
  return { error };
}

/* Get current user (null if not logged in) */
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/* Get current session */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/* Reset password (send email) */
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/reset-password.html`,
  });
  return { data, error };
}

/* Listen for auth state changes (call in pages that need real-time updates) */
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => callback(event, session));
}

/* Require authentication — redirect to signin if not logged in */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    location.href = 'signin.html';
    return null;
  }
  return session;
}

/* Translate Supabase error messages to Arabic */
export function translateError(error) {
  if (!error) return '';
  const msg = error.message || String(error);
  const map = {
    'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'User already registered': 'هذا البريد الإلكتروني مسجل مسبقاً',
    'Email not confirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً',
    'Password should be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'Unable to validate email address: invalid format': 'صيغة البريد الإلكتروني غير صحيحة',
    'For security purposes, you can only request this once every 60 seconds': 'لأسباب أمنية، يمكنك المحاولة مرة كل 60 ثانية',
    'Email rate limit exceeded': 'تم تجاوز حد إرسال الإيميلات، حاول لاحقاً',
  };
  return map[msg] || msg;
}
