/* ============================================================
   GLOREX — Shared User Dropdown Menu
   استعمل: import { setupUserMenu } from './user-menu.js?v=20260611';
   ثم: await setupUserMenu(user);  // بعد ما تجيب user من session
============================================================ */

import { supabase } from './supabase-client.js?v=20260610';

const STYLES = `
.user-menu{position:relative}
.user-menu .user-avatar{cursor:pointer;transition:transform .3s ease;user-select:none}
.user-menu .user-avatar:hover{transform:scale(1.05)}
.user-dropdown{position:absolute;top:calc(100% + 8px);left:0;background:#111;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:.5rem;min-width:230px;box-shadow:0 20px 60px rgba(0,0,0,.6);opacity:0;visibility:hidden;transform:translateY(-8px);transition:all .3s ease;z-index:200}
.user-dropdown.open{opacity:1;visibility:visible;transform:translateY(0)}
.user-dropdown .dd-item{display:flex;align-items:center;gap:.7rem;padding:.7rem .85rem;border-radius:8px;color:#ccc;font-size:.92rem;cursor:pointer;background:none;border:none;width:100%;text-align:right;font-family:inherit;text-decoration:none;transition:all .2s}
.user-dropdown .dd-item:hover{background:rgba(255,255,255,.04);color:#fff}
.user-dropdown .dd-item i{width:16px;color:#666;font-size:.85rem}
.user-dropdown .dd-item.active{background:rgba(212,160,23,.08);color:#D4A017}
.user-dropdown .dd-item.active i{color:#D4A017}
.user-dropdown .dd-item.admin{background:rgba(239,68,68,.06);color:#ef4444;font-weight:600}
.user-dropdown .dd-item.admin i{color:#ef4444}
.user-dropdown .dd-item.logout{color:#ef4444}
.user-dropdown .dd-item.logout i{color:#ef4444}
.user-dropdown .dd-sep{height:1px;background:rgba(255,255,255,.08);margin:.4rem 0}
`;

export async function setupUserMenu(user) {
  const menu = document.querySelector('.user-menu');
  if (!menu) return;

  // inject styles مرة واحدة
  if (!document.getElementById('user-menu-styles')) {
    const style = document.createElement('style');
    style.id = 'user-menu-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  // الصفحة الحالية
  const currentPage = location.pathname.split('/').pop() || 'dashboard.html';

  // تحقق إذا admin
  let isAdmin = false;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    isAdmin = !!data?.is_admin;
  } catch(e) { /* ignore */ }

  // helper لـ active class
  const activeClass = (page) => currentPage === page ? 'active' : '';

  // إنشاء الـ dropdown HTML
  const dropdown = document.createElement('div');
  dropdown.className = 'user-dropdown';
  dropdown.innerHTML = `
    ${isAdmin ? `
      <a href="admin.html" class="dd-item admin ${activeClass('admin.html')}">
        <i class="fas fa-shield-alt"></i> لوحة الإدارة
      </a>
    ` : ''}
    <a href="subscribe.html" class="dd-item ${activeClass('subscribe.html')}">
      <i class="fas fa-crown" style="color:#D4A017"></i> الاشتراك والباقات
    </a>
    <a href="referral.html" class="dd-item ${activeClass('referral.html')}">
      <i class="fas fa-gift" style="color:#22c55e"></i> شارك واربح 🎁
    </a>
    <a href="profile.html" class="dd-item ${activeClass('profile.html')}">
      <i class="fas fa-user"></i> الملف الشخصي
    </a>
    <a href="settings.html" class="dd-item ${activeClass('settings.html')}">
      <i class="fas fa-cog"></i> الإعدادات
    </a>
    <div class="dd-sep"></div>
    <button class="dd-item logout" type="button">
      <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
    </button>
  `;
  menu.appendChild(dropdown);

  // event handlers
  const avatar = menu.querySelector('.user-avatar');
  avatar.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => dropdown.classList.remove('open'));
  dropdown.addEventListener('click', (e) => e.stopPropagation());

  // logout
  dropdown.querySelector('.logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.href = 'glorex_landing.html';
  });
}
