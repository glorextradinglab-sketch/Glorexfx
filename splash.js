/* ============================================================
   GLOREX — App Splash Screen
   Native-app-like boot animation with the gold bull logo.
   Auto-injects on module load. Shows once per session.

   Usage:
     <script type="module" src="./splash.js?v=20260702"></script>
   Or import from any module:
     import './splash.js?v=20260702';
============================================================ */

const SESSION_KEY = 'glorex_splash_shown';
const DURATION = 2200;  // total visible time (ms)
const FADE_OUT = 500;   // fade-out duration (ms)

const CSS = `
.glx-splash{
  position:fixed;inset:0;z-index:99999;
  background:radial-gradient(ellipse at center,#0a0a0a 0%,#000 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:1.4rem;
  opacity:1;
  transition:opacity ${FADE_OUT}ms cubic-bezier(.4,0,.2,1);
  overflow:hidden;
  pointer-events:auto;
}
.glx-splash.fadeout{opacity:0;pointer-events:none}
.glx-splash::before{
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse 900px 600px at 50% 40%,rgba(212,160,23,.15),transparent 60%),
    radial-gradient(ellipse 600px 400px at 50% 60%,rgba(160,120,16,.08),transparent 60%);
  pointer-events:none;
  animation:glx-mesh 3s ease-in-out infinite alternate;
}
@keyframes glx-mesh{
  0%{opacity:.7;transform:scale(1)}
  100%{opacity:1;transform:scale(1.08)}
}

/* Logo container with rings */
.glx-logo-wrap{
  position:relative;
  width:180px;height:180px;
  display:flex;align-items:center;justify-content:center;
  animation:glx-logo-in 1s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes glx-logo-in{
  0%{transform:scale(.3);opacity:0;filter:blur(20px)}
  60%{opacity:1;filter:blur(0)}
  100%{transform:scale(1);opacity:1;filter:blur(0)}
}

/* Bull logo image */
.glx-bull{
  width:140px;height:140px;
  object-fit:contain;
  filter:drop-shadow(0 8px 40px rgba(212,160,23,.6));
  animation:glx-bull-pulse 1.6s ease-in-out .8s infinite;
  position:relative;z-index:3;
}
@keyframes glx-bull-pulse{
  0%,100%{transform:scale(1);filter:drop-shadow(0 8px 40px rgba(212,160,23,.6))}
  50%{transform:scale(1.05);filter:drop-shadow(0 12px 60px rgba(240,192,48,.9))}
}

/* Expanding rings */
.glx-ring{
  position:absolute;top:50%;left:50%;
  width:100px;height:100px;
  border-radius:50%;
  border:1.5px solid rgba(212,160,23,.6);
  transform:translate(-50%,-50%);
  animation:glx-ring-expand 2s cubic-bezier(0,0,.2,1) infinite;
  opacity:0;
}
.glx-ring:nth-child(2){animation-delay:.6s}
.glx-ring:nth-child(3){animation-delay:1.2s}
@keyframes glx-ring-expand{
  0%{width:100px;height:100px;opacity:.8;border-width:2px}
  100%{width:280px;height:280px;opacity:0;border-width:.5px}
}

/* Brand text */
.glx-brand-name{
  font-family:'Space Grotesk','Cairo',sans-serif;
  font-weight:700;
  font-size:2.4rem;
  letter-spacing:.15em;
  background:linear-gradient(135deg,#F0C030 0%,#D4A017 50%,#A07810 100%);
  -webkit-background-clip:text;
  background-clip:text;
  -webkit-text-fill-color:transparent;
  animation:glx-brand-in .9s cubic-bezier(.4,0,.2,1) .5s both;
  position:relative;
  z-index:2;
}
@keyframes glx-brand-in{
  0%{opacity:0;transform:translateY(20px);letter-spacing:.4em}
  100%{opacity:1;transform:translateY(0);letter-spacing:.15em}
}

/* Tagline */
.glx-tagline{
  color:#666;font-size:.85rem;font-weight:400;
  letter-spacing:.05em;
  animation:glx-tagline-in .8s cubic-bezier(.4,0,.2,1) 1s both;
  position:relative;z-index:2;
  font-family:'IBM Plex Sans Arabic','Cairo',sans-serif;
}
@keyframes glx-tagline-in{
  0%{opacity:0;transform:translateY(10px)}
  100%{opacity:1;transform:translateY(0)}
}

/* Loading bar */
.glx-progress{
  position:absolute;bottom:60px;left:50%;transform:translateX(-50%);
  width:120px;height:2px;
  background:rgba(255,255,255,.08);
  border-radius:2px;overflow:hidden;
  animation:glx-tagline-in .8s cubic-bezier(.4,0,.2,1) 1.2s both;
}
.glx-progress::after{
  content:'';position:absolute;top:0;right:0;
  height:100%;width:0%;
  background:linear-gradient(90deg,#D4A017,#F0C030);
  border-radius:2px;
  animation:glx-progress-fill ${DURATION - 200}ms cubic-bezier(.4,0,.2,1) forwards;
  box-shadow:0 0 8px rgba(240,192,48,.6);
}
@keyframes glx-progress-fill{
  0%{width:0%}
  100%{width:100%}
}

@media(max-width:640px){
  .glx-logo-wrap{width:150px;height:150px}
  .glx-bull{width:110px;height:110px}
  .glx-brand-name{font-size:2rem}
  .glx-ring{width:80px;height:80px}
  @keyframes glx-ring-expand{
    0%{width:80px;height:80px;opacity:.8;border-width:2px}
    100%{width:220px;height:220px;opacity:0;border-width:.5px}
  }
}
`;

function inject() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('glx-splash')) return;

  // Skip if user has seen splash this session
  try {
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
  } catch(e) { /* sessionStorage may be blocked — show splash anyway */ }

  // Inject styles
  if (!document.getElementById('glx-splash-styles')) {
    const style = document.createElement('style');
    style.id = 'glx-splash-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // Inject splash HTML
  const splash = document.createElement('div');
  splash.className = 'glx-splash';
  splash.id = 'glx-splash';
  splash.innerHTML = `
    <div class="glx-logo-wrap">
      <div class="glx-ring"></div>
      <div class="glx-ring"></div>
      <div class="glx-ring"></div>
      <img src="glorex_bull_gold.png" alt="GLOREX" class="glx-bull"/>
    </div>
    <div class="glx-brand-name">GLOREX</div>
    <div class="glx-tagline">منصة التداول الاحترافية بالعربي</div>
    <div class="glx-progress"></div>
  `;

  // Attach to body (or html if body not ready)
  (document.body || document.documentElement).appendChild(splash);

  // Lock scroll while splash is up
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';

  // Auto-hide after DURATION ms
  setTimeout(() => {
    splash.classList.add('fadeout');
    document.documentElement.style.overflow = prevOverflow;
    setTimeout(() => {
      splash.remove();
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch(e){}
    }, FADE_OUT);
  }, DURATION);
}

// Auto-inject as early as possible
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    // If body doesn't exist yet, wait for it
    document.addEventListener('DOMContentLoaded', inject, { once: true });
  } else {
    inject();
  }
}

export { inject as showSplash };
