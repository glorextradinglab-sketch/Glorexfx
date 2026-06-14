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

/* ============================================================
   SUBSCRIPTION TIER HELPERS
============================================================ */

/* Tier hierarchy: free < basic < premium */
const TIER_LEVEL = { free: 0, basic: 1, premium: 2 };

/* Get current user's subscription tier (default: free) */
export async function getSubscriptionTier() {
  const session = await getSession();
  if (!session) return null; // not logged in

  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_expires_at')
    .eq('id', session.user.id)
    .single();

  if (error || !data) return 'free';

  // تحقق من انتهاء الاشتراك
  if (data.subscription_expires_at && new Date(data.subscription_expires_at) < new Date()) {
    return 'free'; // اشتراك منتهي → معاملة كـ free
  }

  return data.subscription_tier || 'free';
}

/* Check if user has access to a specific tier or higher */
export async function hasAccess(requiredTier) {
  const userTier = await getSubscriptionTier();
  if (!userTier) return false;
  return TIER_LEVEL[userTier] >= TIER_LEVEL[requiredTier];
}

/* Require a specific tier — show paywall modal if not enough */
export async function requireTier(requiredTier, options = {}) {
  const session = await requireAuth();
  if (!session) return false;

  const access = await hasAccess(requiredTier);
  if (access) return true;

  // ما عنده صلاحية → اعرض الـ Paywall
  showPaywall(requiredTier, options);
  return false;
}

/* Paywall Modal — يوديه لصفحة الباقات يختار */
function showPaywall(requiredTier, options = {}) {
  document.getElementById('paywallModal')?.remove();
  const featureName = options.feature || 'هذه الميزة';

  const modal = document.createElement('div');
  modal.id = 'paywallModal';
  modal.innerHTML = `
    <style>
      #paywallModal{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(10px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:pwfade .3s ease}
      @keyframes pwfade{from{opacity:0}to{opacity:1}}
      .pw-card{background:linear-gradient(160deg,#161106,#0d0a04);border:1px solid rgba(212,160,23,.3);border-radius:20px;padding:2.5rem 2rem;max-width:420px;width:100%;text-align:center;position:relative;box-shadow:0 30px 80px rgba(212,160,23,.15);animation:pwslide .4s ease}
      @keyframes pwslide{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
      .pw-close{position:absolute;top:1rem;left:1rem;background:rgba(255,255,255,.06);color:#ccc;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;font-size:1rem;transition:all .3s}
      .pw-close:hover{background:rgba(255,255,255,.12);color:#fff}
      .pw-icon{width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,rgba(212,160,23,.2),rgba(160,120,16,.08));border:2px solid rgba(212,160,23,.4);display:flex;align-items:center;justify-content:center;font-size:2.3rem;margin:0 auto 1.5rem;color:#F0C030;box-shadow:0 0 60px rgba(212,160,23,.2)}
      .pw-h{font-family:'Space Grotesk','IBM Plex Sans Arabic',sans-serif;font-size:1.6rem;font-weight:700;margin-bottom:.6rem;color:#fff}
      .pw-h em{font-style:normal;background:linear-gradient(135deg,#F0C030,#A07810);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
      .pw-sub{color:#bbb;font-size:.95rem;line-height:1.8;margin-bottom:1.8rem}
      .pw-btn{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:1rem;border-radius:11px;font-weight:700;font-size:.98rem;text-decoration:none;transition:all .3s;cursor:pointer;border:none;font-family:inherit}
      .pw-btn-primary{background:linear-gradient(135deg,#F0C030,#D4A017);color:#000;box-shadow:0 8px 24px rgba(212,160,23,.3);margin-bottom:.6rem}
      .pw-btn-primary:hover{transform:translateY(-1px);box-shadow:0 12px 30px rgba(212,160,23,.45)}
      .pw-btn-ghost{background:transparent;color:#999;font-weight:500;font-size:.85rem;padding:.6rem}
      .pw-btn-ghost:hover{color:#fff}
    </style>
    <div class="pw-card">
      <button class="pw-close" onclick="document.getElementById('paywallModal').remove()"><i class="fas fa-times"></i></button>
      <div class="pw-icon"><i class="fas fa-crown"></i></div>
      <h2 class="pw-h">${featureName} <em>للمشتركين</em></h2>
      <p class="pw-sub">اختر الباقة المناسبة لك وافتح كل الميزات الاحترافية</p>
      <a href="subscribe.html" class="pw-btn pw-btn-primary">
        شوف الباقات <i class="fas fa-arrow-left"></i>
      </a>
      <button class="pw-btn pw-btn-ghost" onclick="document.getElementById('paywallModal').remove()">
        لاحقاً
      </button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target.id === 'paywallModal') modal.remove();
  });
}

/* Show paywall manually (for buttons/cards) */
export function showFeaturePaywall(requiredTier, featureName) {
  showPaywall(requiredTier, { feature: featureName });
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
