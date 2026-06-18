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

/* ============================================================
   📱 Mobile Bottom Navigation
   IMPORTANT: hide all mobile-only elements on desktop by default
============================================================ */
.bottom-nav,.more-backdrop,.more-drawer{display:none !important}

@media(max-width:768px){
  /* Re-enable on mobile */
  .more-backdrop{display:block !important}
  .more-drawer{display:block !important}
  /* Hide desktop nav-tabs on mobile */
  .nav-tabs{display:none !important}
  .topbar .user-name{display:none !important}
  .topbar{padding:.7rem 1rem !important;gap:.5rem !important}

  /* Make room for bottom nav */
  body{padding-bottom:calc(70px + env(safe-area-inset-bottom)) !important}

  /* Show bottom nav */
  .bottom-nav{
    display:flex !important;
    position:fixed;bottom:0;left:0;right:0;
    background:rgba(8,8,8,.96);
    backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
    border-top:1px solid rgba(255,255,255,.08);
    z-index:200;
    padding:.45rem .3rem calc(.7rem + env(safe-area-inset-bottom));
    direction:rtl
  }

  .bn-item{
    flex:1;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:.22rem;
    padding:.35rem .2rem;min-height:50px;
    color:#888;text-decoration:none;
    font-size:.65rem;font-weight:500;
    border:none;background:none;cursor:pointer;
    font-family:inherit;
    transition:color .15s;
    -webkit-tap-highlight-color:transparent
  }
  .bn-item i{font-size:1.2rem;transition:transform .2s}
  .bn-item.active{color:#D4A017}
  .bn-item.active i{transform:scale(1.1)}
  .bn-item:active i{transform:scale(.9)}

  /* "More" drawer */
  .more-backdrop{
    position:fixed;inset:0;
    background:rgba(0,0,0,.65);
    z-index:250;
    opacity:0;visibility:hidden;
    transition:all .3s ease
  }
  .more-backdrop.open{opacity:1;visibility:visible}

  .more-drawer{
    position:fixed;bottom:0;left:0;right:0;
    background:#111;
    border-radius:20px 20px 0 0;
    border-top:1px solid rgba(255,255,255,.08);
    padding:.6rem 1rem calc(1.5rem + env(safe-area-inset-bottom));
    z-index:300;
    transform:translateY(100%);
    transition:transform .3s cubic-bezier(.4,0,.2,1);
    max-height:80vh;overflow-y:auto;
    direction:rtl
  }
  .more-drawer.open{transform:translateY(0)}

  .drawer-handle{
    width:40px;height:4px;
    background:rgba(255,255,255,.2);
    border-radius:2px;
    margin:.4rem auto 1rem
  }

  .drawer-h{
    font-size:.75rem;font-weight:600;
    color:#666;letter-spacing:.5px;
    text-transform:uppercase;
    padding:.5rem .9rem .3rem
  }

  .drawer-item{
    display:flex;align-items:center;gap:1rem;
    padding:1rem .9rem;
    border-radius:12px;
    color:#ddd;text-decoration:none;
    font-size:.98rem;
    border:none;background:none;width:100%;
    text-align:right;font-family:inherit;
    cursor:pointer;
    -webkit-tap-highlight-color:transparent;
    transition:background .15s
  }
  .drawer-item:active{background:rgba(255,255,255,.06)}
  .drawer-item.active{background:rgba(212,160,23,.1);color:#D4A017}
  .drawer-item.active i{color:#D4A017}
  .drawer-item.admin{color:#ef4444;font-weight:600}
  .drawer-item.admin i{color:#ef4444}
  .drawer-item.logout{color:#ef4444}
  .drawer-item.logout i{color:#ef4444}

  .drawer-item i{
    width:28px;text-align:center;font-size:1.05rem;
    color:#888
  }

  /* Hide user-dropdown on mobile (replaced by drawer) */
  .user-dropdown{display:none !important}
}
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

  // إنشاء الـ dropdown HTML (Desktop)
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
    // 📱 On mobile, open the bottom drawer instead of the dropdown
    if (window.matchMedia('(max-width:768px)').matches) {
      const d = document.querySelector('.more-drawer');
      const b = document.querySelector('.more-backdrop');
      if (d && b) {
        d.classList.add('open');
        b.classList.add('open');
        document.body.style.overflow = 'hidden';
        return;
      }
    }
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => dropdown.classList.remove('open'));
  dropdown.addEventListener('click', (e) => e.stopPropagation());

  // logout
  dropdown.querySelector('.logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.href = 'glorex_landing.html';
  });

  // 📱 Setup mobile bottom nav (styles already injected above)
  _setupBottomNav(currentPage, isAdmin);
}

/* ============================================================
   📱 Mobile Bottom Navigation Bar
   Can be called standalone from pages that don't use setupUserMenu
   (e.g., dashboard.html which has its own user-menu HTML)
============================================================ */
export function setupBottomNav(currentPage, isAdmin) {
  // Inject styles if not already (for standalone usage)
  if (!document.getElementById('user-menu-styles')) {
    const style = document.createElement('style');
    style.id = 'user-menu-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }
  _setupBottomNav(currentPage, isAdmin);
}

function _setupBottomNav(currentPage, isAdmin) {
  if (document.querySelector('.bottom-nav')) return; // already injected

  // 5 main items (last is "More" drawer toggle)
  const mainItems = [
    { page: 'dashboard.html', icon: 'fa-home',     label: 'الرئيسية' },
    { page: 'checklist.html', icon: 'fa-list-check', label: 'القائمة' },
    { page: 'journal.html',   icon: 'fa-book',     label: 'السجل' },
    { page: 'calendar.html',  icon: 'fa-calendar', label: 'التقويم' },
  ];

  // Drawer items (shown when "More" is tapped)
  const drawerItems = [
    { page: 'lessons.html',  icon: 'fa-graduation-cap', label: 'الدروس' },
    { page: 'chat.html',     icon: 'fa-comments',       label: 'المحادثة' },
    { page: 'calculator.html', icon: 'fa-calculator',   label: 'حاسبة المخاطر' },
    { page: 'news.html',     icon: 'fa-newspaper',      label: 'الأخبار' },
    { page: 'bookings.html', icon: 'fa-video',          label: 'جلسات 1:1' },
  ];

  // Bottom nav HTML
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  const isActive = (p) => currentPage === p ? ' active' : '';
  nav.innerHTML = mainItems.map(it =>
    `<a href="${it.page}" class="bn-item${isActive(it.page)}">
       <i class="fas ${it.icon}"></i>
       <span>${it.label}</span>
     </a>`
  ).join('') + `
    <button type="button" class="bn-item bn-more">
      <i class="fas fa-ellipsis"></i>
      <span>المزيد</span>
    </button>
  `;
  document.body.appendChild(nav);

  // Backdrop + drawer
  const backdrop = document.createElement('div');
  backdrop.className = 'more-backdrop';
  document.body.appendChild(backdrop);

  const drawer = document.createElement('div');
  drawer.className = 'more-drawer';
  drawer.innerHTML = `
    <div class="drawer-handle"></div>
    <div class="drawer-h">التنقل</div>
    ${drawerItems.map(it =>
      `<a href="${it.page}" class="drawer-item${isActive(it.page)}">
         <i class="fas ${it.icon}"></i> ${it.label}
       </a>`
    ).join('')}
    <div class="drawer-h" style="margin-top:.5rem">الحساب</div>
    ${isAdmin ? `
      <a href="admin.html" class="drawer-item admin${isActive('admin.html')}">
        <i class="fas fa-shield-alt"></i> لوحة الإدارة
      </a>
    ` : ''}
    <a href="subscribe.html" class="drawer-item${isActive('subscribe.html')}">
      <i class="fas fa-crown" style="color:#D4A017"></i> الاشتراك والباقات
    </a>
    <a href="referral.html" class="drawer-item${isActive('referral.html')}">
      <i class="fas fa-gift" style="color:#22c55e"></i> شارك واربح 🎁
    </a>
    <a href="profile.html" class="drawer-item${isActive('profile.html')}">
      <i class="fas fa-user"></i> الملف الشخصي
    </a>
    <a href="settings.html" class="drawer-item${isActive('settings.html')}">
      <i class="fas fa-cog"></i> الإعدادات
    </a>
    <button type="button" class="drawer-item logout">
      <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
    </button>
  `;
  document.body.appendChild(drawer);

  const closeDrawer = () => {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  nav.querySelector('.bn-more').addEventListener('click', () => {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  backdrop.addEventListener('click', closeDrawer);

  drawer.querySelector('.logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.href = 'glorex_landing.html';
  });
}
