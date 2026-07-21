const screen  = document.getElementById('screen');
const brandEl = document.getElementById('brand');
const crumbEl = document.getElementById('crumb');
const backBtn = document.getElementById('backBtn');
const homeDot = document.getElementById('homeDot');
// DESIGN (2026-07-15): the home chip shows ONE mark — the house — on every
// screen. It used to swap per screen (list glyph, category icon, …), which
// made it read as a menu/status indicator when it is actually a Home button.
// One icon, one meaning, one behaviour. Don't reintroduce per-screen icons.
// Tapping the header home-dot returns to Home — but only when signed in, so it
// never short-circuits the login/welcome screens (where it's just a mark).
function goHomeFromDot(){ if(isLoggedIn() && Store.getString(WELCOME_SEEN,'')==='1') showHome('back'); }
homeDot.addEventListener('click', goHomeFromDot);
homeDot.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); goHomeFromDot(); } });

// ---- Header overflow menu (utilities) -------------------------------------
const hmenuEl  = document.getElementById('hmenu');
const hmenuBtn = document.getElementById('hmenuBtn');
const hmenuPop = document.getElementById('hmenuPop');
// Show the menu only on the signed-in landing; hide everywhere else so it never
// competes on task screens. Called by each screen via setMenuVisible().
function setMenuVisible(on){
  hmenuEl.style.display = on ? '' : 'none';
  if(!on) closeMenu();
}
function buildMenuItems(){
  hmenuPop.innerHTML = `
    <button class="hmenu-item" role="menuitem" onclick="menuGo(exportCSV)">${ICON.download}Export records</button>
    <button class="hmenu-item" role="menuitem" onclick="menuGo(()=>showManageData('fwd'))">${ICON.shield}Manage data</button>
    <button class="hmenu-item" role="menuitem" onclick="menuGo(()=>showAbout('fwd'))">${ICON.info}About this app</button>
    <div class="hmenu-sep"></div>
    <button class="hmenu-item danger" role="menuitem" onclick="menuGo(handleLogout)">${ICON.logout}Sign out</button>
  `;
}
function toggleMenu(e){
  if(e) e.stopPropagation();
  hmenuPop.hidden ? openMenu() : closeMenu();
}
function openMenu(){
  buildMenuItems();
  hmenuPop.hidden = false;
  hmenuBtn.setAttribute('aria-expanded','true');
}
function closeMenu(){
  hmenuPop.hidden = true;
  hmenuBtn.setAttribute('aria-expanded','false');
}
function menuGo(fn){ closeMenu(); fn(); }
// Dismiss on outside click / Escape.
document.addEventListener('click', e=>{ if(!hmenuPop.hidden && !hmenuEl.contains(e.target)) closeMenu(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && !hmenuPop.hidden) closeMenu(); });
const toastEl = document.getElementById('toast');
let state = { category:null, activity:null };
const ICON = {
  compass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="16 8 10.5 10.5 8 16 13.5 13.5 16 8"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  database:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>',
  audio:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>',
  video:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="14" height="14" rx="2"/><path d="m22 8-6 4 6 4V8Z"/></svg>',
  chevron:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  chevronRight:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9h14v-9"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 11 5 4 5-4"/><path d="M5 21h14"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6Z"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17l5-5-5-5"/><path d="M20 12H9"/><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  // ---- sound library (soundboard) media-player controls -------------------
  sbPlay:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.87l11-6.8a1 1 0 0 0 0-1.74l-11-6.8A1 1 0 0 0 8 5.2Z"/></svg>',
  sbPause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.4"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4"/></svg>',
  sbPrev:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="6" width="2.6" height="12" rx="1"/><path d="M20 6.7v10.6a.8.8 0 0 1-1.22.68l-8.5-5.3a.8.8 0 0 1 0-1.36l8.5-5.3A.8.8 0 0 1 20 6.7Z"/></svg>',
  sbNext:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="16.4" y="6" width="2.6" height="12" rx="1"/><path d="M4 6.7v10.6a.8.8 0 0 0 1.22.68l8.5-5.3a.8.8 0 0 0 0-1.36l-8.5-5.3A.8.8 0 0 0 4 6.7Z"/></svg>',
  sbShuffle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l4 4"/></svg>',
  sbRepeat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  sbSound:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 9a4 4 0 0 1 0 6"/></svg>',
  // ---- per-category monoline icons (positional, see CATEGORY_ICONS) --------
  catEar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 3-2 4-3 5.5-.8 1.2-.5 2.5-1.5 3.5a2.5 2.5 0 0 1-4-2"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .3"/></svg>',
  catSoundDir:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M8 9.5a4 4 0 0 0 0 5"/><path d="M16 9.5a4 4 0 0 1 0 5"/><path d="M5 7a8 8 0 0 0 0 10"/><path d="M19 7a8 8 0 0 1 0 10"/></svg>',
  catFootprints:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4.5c1.5 0 2 1.5 2 3.5s-.5 4-2 4-2-2-2-4 .5-3.5 2-3.5Z"/><path d="M5.5 14.5c0 1.5 3 1.5 3 0"/><path d="M17 9.5c1.5 0 2 1.5 2 3.5s-.5 4-2 4-2-2-2-4 .5-3.5 2-3.5Z"/><path d="M15.5 19.5c0 1.5 3 1.5 3 0"/></svg>',
  catTerrain:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8c3-2 5-2 9 0s6 2 9 0"/><path d="M3 13c3-2 5-2 9 0s6 2 9 0"/><path d="M3 18c3-2 5-2 9 0s6 2 9 0"/></svg>',
  catDots:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="1.6"/><circle cx="12" cy="7" r="1.6"/><circle cx="17" cy="7" r="1.6"/><circle cx="7" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="17" cy="12" r="1.6"/><circle cx="7" cy="17" r="1.6"/><circle cx="12" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/></svg>'
};
/* Per-category icons are POSITIONAL — keyed by category index, exactly like
   CATEGORY_PALETTE. If the content team reorders categories in activities.js,
   the icon follows the slot, not the name. Index past the end falls back to a
   neutral dot grid (the "other" mark). */
const CATEGORY_ICONS = [
  ICON.compass,       // 0 Direction
  ICON.catEar,        // 1 Sound
  ICON.catSoundDir,   // 2 Sound + Direction
  ICON.catFootprints, // 3 Straight Line Travel (includes push-toy stage)
  ICON.catTerrain,    // 4 Terrain Game
  ICON.catDots,       // 5 Other Activities
];
function catIcon(i){ return CATEGORY_ICONS[i] || ICON.catDots; }
/* ---------------------------------------------------------------------------
   ACTIVITY STILL-LIFES — thumbnail scenes for the activity cards ("object
   still-life" direction, picked 2026-07-21). Each scene draws the REAL
   equipment of the session — the phone that plays the cue, the cane, the push
   toy, the mats, the cone, the bell, the gift — flat, on a soft ground shadow.
   Deliberately NO people (figures at thumbnail size read as clipart).
   Colours ride the category CSS vars, so every scene auto-tints; the one
   fixed accent is the app's semantic rust (= cane/marker, same as the
   "With cane" tag). Keyed by activity id → category fallback → generic.
   --------------------------------------------------------------------------- */
const STILL_W = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"`;
const _sBG    = `<rect width="320" height="120" fill="var(--cat-soft)"/>`;
const _sShadow= (cx,rx)=>`<ellipse cx="${cx}" cy="101" rx="${rx}" ry="8" fill="var(--cat-deep)" opacity=".12"/>`;
// The phone — the app itself is the sound source in most activities.
const _sPhone = (x,y)=>`<rect x="${x-16}" y="${y-30}" width="32" height="58" rx="7" fill="var(--cat-deep)"/><rect x="${x-11}" y="${y-25}" width="22" height="42" rx="3" fill="var(--card,#fffdf8)"/><circle cx="${x}" cy="${y+22}" r="2.5" fill="var(--card,#fffdf8)"/>`;
const _sArcsR = (x,y)=>`<g fill="none" stroke="var(--cat)" stroke-width="3" stroke-linecap="round"><path d="M${x} ${y-15} a22 22 0 0 1 0 30" opacity=".8"/><path d="M${x+13} ${y-25} a38 38 0 0 1 0 50" opacity=".45"/></g>`;
const _sArcsL = (x,y)=>`<g fill="none" stroke="var(--cat)" stroke-width="3" stroke-linecap="round"><path d="M${x} ${y-15} a22 22 0 0 0 0 30" opacity=".8"/><path d="M${x-13} ${y-25} a38 38 0 0 0 0 50" opacity=".45"/></g>`;
// The cane — white underlay so the rust dash reads on every tint.
const _sCane  = (x1,y1,x2,y2)=>`<path d="M${x1} ${y1} L${x2} ${y2}" stroke="var(--card,#fffdf8)" stroke-width="7" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="#b5521f" stroke-width="7" stroke-linecap="round" stroke-dasharray="24 15"/><circle cx="${x2}" cy="${y2}" r="8" fill="var(--card,#fffdf8)" stroke="#8a3c12" stroke-width="3"/>`;
const _sSweep = (x,y)=>`<path d="M${x} ${y} a30 13 0 0 1 50 -6" fill="none" stroke="#8a3c12" stroke-width="2.5" stroke-dasharray="2 7" stroke-linecap="round" opacity=".7"/>`;
const _sCone  = (x)=>`<path d="M${x} 98 L${x-10} 66 a4 4 0 0 1 4 -5 h12 a4 4 0 0 1 4 5 L${x+20} 98 Z" transform="translate(-5 0)" fill="#b5521f"/><rect x="${x-20}" y="96" width="40" height="7" rx="3.5" fill="#8a3c12"/>`;
const _sMat   = (x,w,fill)=>`<path d="M${x} 98 L${x+w} 98 L${x+w-10} 74 L${x+10} 74 Z" fill="${fill}" stroke="var(--cat)" stroke-width="2"/>`;
const _sSteps = (x,y,n)=>{ let s=''; for(let i=0;i<n;i++){ const dx=x+i*30, dy=y+(i%2? -6:2); s+=`<ellipse cx="${dx}" cy="${dy}" rx="5.5" ry="9" transform="rotate(78 ${dx} ${dy})" fill="var(--cat-deep)" opacity="${.35+.13*i}"/>`; } return s; };
const _sBell  = (x,y)=>`<path d="M${x-22} ${y} q-6 -34 14 -44 q6 -3 12 0 q20 10 14 44 Z" transform="translate(0 0)" fill="var(--cat)"/><path d="M${x-28} ${y} h56 a6 6 0 0 1 0 12 h-56 a6 6 0 0 1 0 -12" fill="var(--cat-deep)"/><circle cx="${x}" cy="${y+14}" r="5" fill="var(--card,#fffdf8)"/><path d="M${x} ${y-48} v-8 a8 8 0 0 1 8 -8" fill="none" stroke="var(--cat-deep)" stroke-width="4" stroke-linecap="round"/>`;
const _sGift  = (x,y)=>`<rect x="${x-20}" y="${y-18}" width="40" height="34" rx="4" fill="var(--cat)"/><rect x="${x-23}" y="${y-24}" width="46" height="10" rx="3" fill="var(--cat-deep)"/><path d="M${x} ${y-24} v40 M${x-23} ${y-2} h46" stroke="var(--cat-soft)" stroke-width="4"/><path d="M${x-9} ${y-24} q9 -14 9 0 q0 -14 9 0" stroke="var(--cat-deep)" stroke-width="3" fill="none" stroke-linecap="round"/>`;
const STILL = {
  // Sound — the bell, rung out of sight.
  'sound-which': `<svg ${STILL_W}>${_sBG}${_sShadow(160,72)}${_sBell(160,88)}${_sArcsR(224,64)}${_sArcsL(96,64)}</svg>`,
  // Sound — the phone is the source; where did it ring from?
  'sound-source': `<svg ${STILL_W}>${_sBG}${_sShadow(112,54)}${_sPhone(112,64)}${_sArcsR(142,58)}<path d="M196 64 h66" stroke="var(--cat-deep)" stroke-width="3" stroke-dasharray="1 9" stroke-linecap="round" opacity=".7"/><circle cx="276" cy="64" r="6" fill="none" stroke="var(--cat-deep)" stroke-width="2.5" opacity=".7"/></svg>`,
  // Direction — the compass, needle mid-swing.
  'dir-basic-commands': `<svg ${STILL_W}>${_sBG}${_sShadow(160,58)}<circle cx="160" cy="58" r="38" fill="var(--card,#fffdf8)" stroke="var(--cat)" stroke-width="3"/><circle cx="160" cy="58" r="30" fill="none" stroke="var(--cat-line)" stroke-width="1.5"/><path d="M160 24 v8 M160 84 v8 M126 58 h8 M186 58 h8" stroke="var(--cat-deep)" stroke-width="2.5" stroke-linecap="round"/><path d="M172 40 L163 61 L148 76 L157 55 Z" fill="#b5521f"/><circle cx="160" cy="58" r="4" fill="var(--card,#fffdf8)" stroke="var(--cat-deep)" stroke-width="2"/></svg>`,
  // Direction advanced — the full rose with lettered points.
  'dir-advanced-commands': `<svg ${STILL_W}>${_sBG}${_sShadow(160,58)}<circle cx="160" cy="58" r="38" fill="var(--card,#fffdf8)" stroke="var(--cat)" stroke-width="3"/><path d="M160 26 L166 52 L160 58 L154 52 Z" fill="#b5521f"/><path d="M160 90 L154 64 L160 58 L166 64 Z M128 58 L154 52 L160 58 L154 64 Z M192 58 L166 64 L160 58 L166 52 Z" fill="var(--cat-deep)" opacity=".8"/><g font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="var(--cat-deep)" text-anchor="middle"><text x="160" y="18">N</text><text x="212" y="62">E</text><text x="160" y="112">S</text><text x="108" y="62">W</text></g></svg>`,
  // Sound + Direction — near speaker loud, far speaker faint.
  'snddir-nearfar': `<svg ${STILL_W}>${_sBG}${_sShadow(84,44)}${_sShadow(252,26)}${_sPhone(84,62)}${_sArcsR(114,56)}<g transform="translate(252,52) scale(.62)" opacity=".75"><rect x="-16" y="-30" width="32" height="58" rx="7" fill="var(--cat-deep)"/><rect x="-11" y="-25" width="22" height="42" rx="3" fill="var(--card,#fffdf8)"/></g><path d="M282 40 a16 16 0 0 1 0 22" fill="none" stroke="var(--cat)" stroke-width="2.5" stroke-linecap="round" opacity=".4"/></svg>`,
  // Near/far with the cane along.
  'snddir-nearfar-cane': `<svg ${STILL_W}>${_sBG}${_sShadow(76,40)}${_sShadow(230,60)}${_sPhone(76,60)}${_sArcsR(106,54)}${_sCane(178,34,252,94)}${_sSweep(206,102)}</svg>`,
  // Steps to the sound — one footprint trail, phone waiting.
  'snddir-steps-solo': `<svg ${STILL_W}>${_sBG}${_sShadow(262,40)}${_sSteps(52,72,5)}${_sPhone(262,64)}${_sArcsL(232,58)}</svg>`,
  // Steps together — three trails, one phone.
  'snddir-steps-group': `<svg ${STILL_W}>${_sBG}${_sShadow(268,38)}${_sSteps(44,44,4)}${_sSteps(56,72,4)}${_sSteps(44,96,4)}${_sPhone(268,62)}${_sArcsL(238,56)}</svg>`,
  // SLT 1 — no cane yet: just the straight line to the sound.
  'slt-nocane': `<svg ${STILL_W}>${_sBG}${_sShadow(258,40)}<path d="M28 96 H210" stroke="var(--card,#fffdf8)" stroke-width="7" stroke-linecap="round"/><path d="M28 96 H210" stroke="var(--cat)" stroke-width="7" stroke-linecap="round" stroke-dasharray="22 14"/>${_sPhone(258,62)}${_sArcsL(228,56)}</svg>`,
  // SLT 2 — the push toy on the cane (the stigma-breaker).
  'slt-withcane-toy': `<svg ${STILL_W}>${_sBG}${_sShadow(190,80)}${_sCane(96,26,208,86)}<rect x="196" y="70" width="44" height="22" rx="6" fill="var(--cat)"/><circle cx="208" cy="96" r="7" fill="var(--cat-deep)"/><circle cx="230" cy="96" r="7" fill="var(--cat-deep)"/><circle cx="208" cy="96" r="2.5" fill="var(--card,#fffdf8)"/><circle cx="230" cy="96" r="2.5" fill="var(--card,#fffdf8)"/><path d="M240 74 a14 14 0 0 1 8 -8" stroke="var(--cat-deep)" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  // SLT 3 — the cane alone, mid-sweep.
  'slt-withcane': `<svg ${STILL_W}>${_sBG}${_sShadow(170,105)}${_sCane(62,98,237,32)}<circle cx="62" cy="99" r="9" fill="var(--card,#fffdf8)" stroke="#8a3c12" stroke-width="3"/>${_sSweep(96,106)}</svg>`,
  // Terrain — three surfaces to meet.
  'terrain-intro': `<svg ${STILL_W}>${_sBG}${_sShadow(160,105)}${_sMat(48,72,'var(--cat-line)')}${_sMat(132,72,'var(--card,#fffdf8)')}<g fill="var(--cat-deep)" opacity=".6"><circle cx="158" cy="86" r="2.2"/><circle cx="172" cy="90" r="2.2"/><circle cx="186" cy="84" r="2.2"/></g>${_sMat(216,72,'var(--card,#fffdf8)')}<path d="M232 88 q7 -8 14 0 t14 0 M236 80 q7 -8 14 0" stroke="var(--cat-deep)" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".6"/></svg>`,
  // Terrain — walk the course: the long mat, the cone at the end.
  'terrain-walk': `<svg ${STILL_W}>${_sBG}${_sShadow(150,110)}${_sMat(36,160,'var(--card,#fffdf8)')}<g fill="var(--cat-deep)" opacity=".5"><circle cx="80" cy="86" r="2.2"/><circle cx="112" cy="90" r="2.2"/><circle cx="144" cy="85" r="2.2"/><circle cx="170" cy="89" r="2.2"/></g>${_sCone(252)}</svg>`,
  // Terrain — the obstacle sits mid-path.
  'terrain-obstacle': `<svg ${STILL_W}>${_sBG}${_sShadow(160,110)}${_sMat(36,248,'var(--card,#fffdf8)')}<rect x="140" y="52" width="44" height="30" rx="5" fill="var(--cat-deep)"/><rect x="146" y="44" width="32" height="14" rx="4" fill="var(--cat)"/></svg>`,
  // Other — the central sound: everyone gathers round.
  'other-central-sound': `<svg ${STILL_W}>${_sBG}${_sShadow(160,44)}${_sPhone(160,58)}<circle cx="160" cy="58" r="46" fill="none" stroke="var(--cat)" stroke-width="2.5" stroke-dasharray="3 8" stroke-linecap="round" opacity=".65"/><g fill="var(--cat-deep)"><circle cx="160" cy="6" r="5"/><circle cx="206" cy="30" r="5"/><circle cx="206" cy="86" r="5"/><circle cx="160" cy="110" r="5"/><circle cx="114" cy="86" r="5"/><circle cx="114" cy="30" r="5"/></g></svg>`,
  // Other — follow the gift.
  'other-gift-follow': `<svg ${STILL_W}>${_sBG}${_sShadow(252,36)}<path d="M36 84 Q92 58 148 76 T232 72" stroke="var(--cat-deep)" stroke-width="3" fill="none" stroke-dasharray="1 9" stroke-linecap="round" opacity=".7"/>${_sGift(252,74)}</svg>`,
  // Assessment — the score sheet and pencil.
  'assess-procedure': `<svg ${STILL_W}>${_sBG}${_sShadow(160,58)}<rect x="118" y="10" width="84" height="94" rx="8" fill="var(--card,#fffdf8)" stroke="var(--cat)" stroke-width="2.5"/><rect x="146" y="4" width="28" height="12" rx="4" fill="var(--cat-deep)"/><path d="M132 36 l6 6 10 -12" stroke="var(--cat)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M158 38 h30" stroke="var(--cat-line)" stroke-width="3.5" stroke-linecap="round"/><path d="M132 60 l6 6 10 -12" stroke="var(--cat)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M158 62 h30" stroke="var(--cat-line)" stroke-width="3.5" stroke-linecap="round"/><circle cx="138" cy="86" r="5" stroke="var(--cat)" stroke-width="2.5" fill="none"/><path d="M158 86 h30" stroke="var(--cat-line)" stroke-width="3.5" stroke-linecap="round"/><path d="M226 96 L244 44 l8 3 -14 52 -7 6 Z" fill="#b5521f"/><path d="M244 44 l8 3 2 -7 a4 4 0 0 0 -7 -2 Z" fill="var(--cat-deep)"/></svg>`,
};
const STILL_CAT = {
  'Direction':            ()=>STILL['dir-basic-commands'],
  'Sound':                ()=>STILL['sound-which'],
  'Sound + Direction':    ()=>STILL['snddir-steps-solo'],
  'Straight Line Travel': ()=>STILL['slt-withcane'],
  'Terrain Game':         ()=>STILL['terrain-intro'],
  'Other Activities':     ()=>STILL['other-gift-follow'],
};
function activityStill(cat, act){
  if(STILL[act.id]) return STILL[act.id];
  const fb = STILL_CAT[cat && cat.category];
  return fb ? fb() : STILL['assess-procedure'];
}
const CATEGORY_PALETTE = [
  { c:"#2f6f4e", deep:"#1f4d36", soft:"#e2efe5", line:"#cce0d1" },
  { c:"#1f6f86", deep:"#124a5b", soft:"#dceef2", line:"#c2e0e8" },
  { c:"#6a4ea8", deep:"#47326f", soft:"#eae3f5", line:"#dccff0" },
  { c:"#b5521f", deep:"#8a3c12", soft:"#f6e3d6", line:"#eccdb6" },
  { c:"#8a6f2b", deep:"#5f4c1c", soft:"#f3ead0", line:"#e6d6a8" },
  { c:"#3a7d5d", deep:"#265a41", soft:"#e2f0e8", line:"#c8e2d2" },
  { c:"#9a4060", deep:"#702c45", soft:"#f4e0e8", line:"#ecc6d5" },
];
function themeFor(catIndex){
  const p = CATEGORY_PALETTE[catIndex % CATEGORY_PALETTE.length];
  document.body.style.setProperty('--cat',      p.c);
  document.body.style.setProperty('--cat-deep', p.deep);
  document.body.style.setProperty('--cat-soft', p.soft);
  document.body.style.setProperty('--cat-line', p.line);
}
function resetTheme(){ themeFor(0); }
function catColor(i){ return CATEGORY_PALETTE[i % CATEGORY_PALETTE.length].c; }

/* ---------------------------------------------------------------------------
   IDENTITY & SCHEMA — Batch 1 (un-backfillable before any production session).
   Every stored object carries:
     • schemaVersion — so a future reader knows what shape it holds (cheap B→A)
     • id            — stable UUID; deletion is by-id, never by array index
     • teacherId     — per-install operator id, minted ONCE at boot. Records
                       written before this existed are tagged 'legacy' by the
                       migration shim below.
   Stamping lives INSIDE saveRecord (the seam-adjacent chokepoint), not at call
   sites, so no future caller can write an unattributable record by mistake.
   --------------------------------------------------------------------------- */
const SCHEMA_VERSION = 2; // v2: pseudonymisation — researchId on every profile and record
const TEACHER_KEY = 'teacherId';
function newId(){
  if(window.crypto && window.crypto.randomUUID) return crypto.randomUUID();
  // Fallback for older WebViews: RFC-4122-shaped v4 from getRandomValues.
  const b = new Uint8Array(16);
  (window.crypto || {}).getRandomValues ? crypto.getRandomValues(b) : b.forEach((_,i)=>b[i]=Math.floor(Math.random()*256));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map(x=>x.toString(16).padStart(2,'0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
// RESEARCH ID — the pseudonymous spine of the data model. Every child gets one
// stable, speakable, PII-FREE id at enrolment. Records, the CSV, and any future
// consent record key off THIS, never the child's name. The name↔researchId map
// lives only inside the profile (separable, the single point you encrypt or
// withhold). Format OM-XXXX-XXXX: ambiguous glyphs (0/O, 1/I) dropped so it can
// be read aloud or written down without error. This is also the join key the
// future backend / cross-device identity will extend — do not rebase it on name.
function newResearchId(){
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0 O 1 I
  const b = new Uint8Array(8);
  (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(b) : b.forEach((_,i)=>b[i]=Math.floor(Math.random()*256));
  const s = [...b].map(x=>A[x % A.length]).join('');
  return `OM-${s.slice(0,4)}-${s.slice(4,8)}`;
}
// Synchronous read of the operator id (cache-served, like all reads).
function getTeacherId(){ return Store.getString(TEACHER_KEY, ''); }
// Mint the per-install operator id exactly once, at boot, behind the seam.
// If the verified write fails the id still lives in the cache for this session
// (records stay attributable today) — but we warn, because it won't survive a
// restart and the next boot would mint a DIFFERENT id.
async function ensureDeviceTeacherId(){
  if(getTeacherId()) return true;
  const ok = await Store.setString(TEACHER_KEY, 'op_' + newId());
  if(!ok) setTimeout(()=>toast('Storage warning — device ID could not be saved. Restart the app before recording sessions.'), 600);
  return ok;
}

/* ---------------------------------------------------------------------------
   SCHOOLS & TEACHERS — local login model (PILOT).

   Shape is deliberately the production shape: a list of schools, each with an
   id, a name, and a roster of teachers (each teacher = id + name). At
   production this becomes two Supabase tables (schools, teachers) joined by
   school_id — so nothing here is rework, only a backend swap.

   >>> PRODUCTION SEAM <<<
   Local now: anyone can pick a school, pick a teacher, add a teacher, add a
   school, and "log in" with NO credential check. This is a pilot convenience,
   NOT production behaviour. At production:
     • the credential step (stubbed below) becomes a real Supabase Auth
       password/OTP check;
     • "add school" moves behind an ADMIN role;
     • "add teacher" becomes admin-only or an invite flow;
     • this local seed is replaced by rows fetched from Supabase.
   Everything downstream keys off the per-install op_ teacher id, which maps to
   the authenticated Supabase user id — so only THIS screen changes at prod.

   NOTE: seed school names below are PLACEHOLDERS for the dropdown, not a claim
   that these specific institutions are involved. Swap for real pilot schools.
   --------------------------------------------------------------------------- */
const SCHOOLS_KEY = 'schools';
const SESSION_SCHOOL_KEY  = 'sessionSchool';   // {id,name} of logged-in school
const SESSION_TEACHER_KEY = 'sessionTeacher';  // {id,name} of logged-in teacher
const LOGGED_IN_KEY = 'loggedIn';

// >>> PILOT GATE <<< Teacher-facing self-provisioning. FALSE for the pilot:
// schools/teachers are admin-provisioned (seeded now; Supabase later), so a
// teacher's login is a clean two-tap pick — no way to create junk schools or
// fake teachers. addSchool()/addTeacher() stay as ADMIN primitives. Flip TRUE
// only for your own provisioning during a field visit, then flip back.
const PILOT_ALLOW_SELF_PROVISION = false;

// PILOT SEED — the 3 real pilot schools (IIT Delhi + NCAHT).
// IDs are STABLE, human-readable strings (not newId()) so the same school
// resolves to the same id on every device — a precondition for cross-device
// attribution. Do NOT change an id once sessions exist under it; that orphans
// records. Teacher names below are PLACEHOLDERS until the coordinator sends
// real names — swap the name strings (keep the ids) when they arrive.
//
// loginId = the identifier the teacher TYPES to sign in (you assign these,
// e.g. saksham01). It is NOT a secret — it just names the account. The PASSWORD
// is deliberately absent here: a real password cannot live on-device (see
// verifyCredentials). When Supabase lands, loginId maps to that teacher's
// server account; the password is checked there, never in this file.
function seedSchools(){
  return [
    { id:'sch_saksham_noida', name:'Saksham School, Noida',
      teachers:[ {id:'tch_saksham_1', name:'Teacher 1', loginId:'saksham01'} ] },
    { id:'sch_rnks_jaipur',   name:'Rajasthan Netraheen Kalyan Sangam (RNKS), Jaipur',
      teachers:[ {id:'tch_rnks_1', name:'Teacher 1', loginId:'rnks01'} ] },
    { id:'sch_nab_kullu',     name:'National Association of Blind, Kullu',
      teachers:[ {id:'tch_nab_1', name:'Teacher 1', loginId:'nab01'} ] }
  ];
}
function loadSchools(){
  const v = Store.getJSON(SCHOOLS_KEY, null);
  return Array.isArray(v) ? v : [];
}
async function ensureSchoolsSeeded(){
  if(loadSchools().length) return;
  await Store.setJSON(SCHOOLS_KEY, seedSchools());
}
function schoolById(id){ return loadSchools().find(s=>s.id===id) || null; }
// Resolve attribution ids on records back to readable names for export/display.
function schoolNameById(id){ if(!id) return ''; const s = schoolById(id); return s ? s.name : id; }
function teacherNameById(id){
  if(!id) return '';
  for(const s of loadSchools()){ const t = (s.teachers||[]).find(x=>x.id===id); if(t) return t.name; }
  return id; // unknown id — show the raw id rather than hiding attribution
}
async function addSchool(name){
  const list = loadSchools();
  const school = { id:newId(), name:name.trim(), teachers:[] };
  list.push(school);
  const ok = await Store.setJSON(SCHOOLS_KEY, list);
  return ok ? school : null;
}
async function addTeacher(schoolId, name, loginId){
  const list = loadSchools();
  const s = list.find(x=>x.id===schoolId);
  if(!s) return null;
  const teacher = { id:newId(), name:name.trim(), loginId:(loginId||'').trim() };
  s.teachers = s.teachers || []; s.teachers.push(teacher);
  const ok = await Store.setJSON(SCHOOLS_KEY, list);
  return ok ? teacher : null;
}

// Session helpers — who is logged in right now (this device).
function getSessionSchool(){  return Store.getJSON(SESSION_SCHOOL_KEY,  null); }
function getSessionTeacher(){ return Store.getJSON(SESSION_TEACHER_KEY, null); }
function isLoggedIn(){ return Store.getString(LOGGED_IN_KEY, '') === '1'; }

/* >>> PRODUCTION SEAM — the ONLY place a credential is checked. <<<
   ────────────────────────────────────────────────────────────────────────────
   WHY THIS IS A STUB, AND MUST STAY ONE UNTIL SUPABASE:
   This file ships inside the APK on the teacher's phone. Any password stored
   here to compare against — and any logic that does the comparing — is readable
   and editable by anyone holding the app. A password check that runs on-device
   provides NO access control; it only looks like it does. Real auth requires a
   server that holds the hashed password and makes the decision somewhere the
   user can't reach. That server is Supabase (gated, per project plan).

   WHAT THIS DOES NOW (pilot, no backend):
   It resolves the typed loginId to a teacher in the selected school and accepts
   any non-empty password. So the SCREEN and FLOW are real and final — only the
   verdict is stubbed. Returns the matched teacher, or null.

   THE SWAP (landed on feat/cloud-sync, behind CLOUD_SYNC): with the flag ON the
   verdict comes from supabase.auth.signInWithPassword via Cloud.signIn() — the
   server holds the hashed password and decides. On success the loginId is
   resolved to the local roster teacher, same contract as before:
   (school, loginId, password) → teacher|null. Nothing else in the login UI
   changes.

   PILOT_LOCAL_AUTH — the fallback, scoped deliberately narrowly:
   • CLOUD_SYNC off            → stub verdict (offline pilot, unchanged).
   • Cloud says WRONG PASSWORD → null. The fallback NEVER overrides a real
     server rejection, or cloud auth would be decorative.
   • Cloud UNREACHABLE (dead network, timeout) → stub verdict IF
     PILOT_LOCAL_AUTH is true, so a field session in a no-signal school isn't
     bricked by connectivity. NOTE: a fallback login has no cloud session, so
     NEW-child enrolment will still refuse until a real online sign-in happens.
     Set PILOT_LOCAL_AUTH false to require server auth absolutely. */
const PILOT_LOCAL_AUTH = true;
async function verifyCredentials(school, loginId, password){
  const id = (loginId || '').trim().toLowerCase();
  const pw = (password || '');
  if(!id || !pw) return null;                 // both fields required
  const t = (school.teachers || []).find(x => (x.loginId || '').toLowerCase() === id);
  if(!t) return null;                         // unknown login ID for this school
  if(Cloud.enabled()){
    const res = await Cloud.signIn(id, pw);  // <loginId>@domain unless a full email was typed
    if(res.ok) return t;                      // server-verified
    if(!res.offline) return null;             // reached the server, rejected — final
    if(!PILOT_LOCAL_AUTH) return null;        // unreachable + no fallback allowed
    // Unreachable + fallback: fall through to the stub verdict below.
  }
  // STUB VERDICT (pilot / offline fallback): any non-empty password passes.
  return t;
}

// >>> PRODUCTION SEAM: this is where the real credential check lands. <<<
// Local: no password — selecting a teacher and confirming IS the login.
async function logIn(school, teacher){
  await Store.setJSON(SESSION_SCHOOL_KEY,  { id:school.id,  name:school.name });
  await Store.setJSON(SESSION_TEACHER_KEY, { id:teacher.id, name:teacher.name });
  await Store.setString(LOGGED_IN_KEY, '1');
  // Keep the human-readable teacher name on records too (display convenience).
  await Store.setString('teacherName', teacher.name);
  await Store.setString('schoolName',  school.name);
}
async function logOut(){
  await Store._remove(LOGGED_IN_KEY);
  await Store._remove(SESSION_SCHOOL_KEY);
  await Store._remove(SESSION_TEACHER_KEY);
}

const REC_PREFIX = 'rec_';
function loadRecords(activityId){
  const v = Store.getJSON(REC_PREFIX+activityId, []);
  return Array.isArray(v) ? v : [];
}
// Returns true on confirmed save, false if the write could not be verified.
// ENVELOPE GUARANTEE: every record is stamped here — id, schemaVersion,
// teacherId, whenISO — so nothing unattributable can enter storage, no matter
// who calls this. whenISO is the CANONICAL timestamp (ISO 8601, sortable,
// locale-free); any human-readable form is derived at render time only.
async function saveRecord(activityId, record){
  record.id            = record.id            || newId();
  record.schemaVersion = record.schemaVersion || SCHEMA_VERSION;
  record.teacherId     = record.teacherId     || getTeacherId() || 'legacy';
  record.whenISO       = record.whenISO       || new Date().toISOString();
  // Operator attribution (Batch 1, school/teacher addition). teacherId above is
  // the per-DEVICE op_ id; these add WHO was logged in (roster teacher) and at
  // WHICH school. Stamped here at the single chokepoint so every record carries
  // it and nothing unattributable enters storage. Empty string when no session
  // (e.g. a pre-login legacy record) — never undefined.
  // >>> At production these map to Supabase teacher_id / school_id FKs. <<<
  record.schoolId      = record.schoolId      || (getSessionSchool()  || {}).id || '';
  record.teacherRosterId = record.teacherRosterId || (getSessionTeacher() || {}).id || '';
  const all = loadRecords(activityId); all.unshift(record);
  return Store.setJSON(REC_PREFIX+activityId, all);
}
function getStudent(){ return Store.getString('studentName', ''); }
function setStudent(v){ return Store.setString('studentName', v); }

/* ---------------------------------------------------------------------------
   CHILD PROFILES — captured once per child, referenced by every session.
   Demographics are profile data, NOT per-record data, so they live in their
   own keyspace behind the same Store seam. Fields are exactly the set the
   content team specified: name, age, height, weight, dominant hand, photo.
   `capturedOn` is stored so a stale age is at least detectable later.
   Photo is a downscaled low-res data URL (or '' if none).
   --------------------------------------------------------------------------- */
const PROFILE_KEY = 'profiles';
function loadProfiles(){
  const v = Store.getJSON(PROFILE_KEY, []);
  return Array.isArray(v) ? v : [];
}
// Returns true on confirmed save, false if the write could not be verified.
async function saveProfiles(list){ return Store.setJSON(PROFILE_KEY, list); }
function profileById(id){ return loadProfiles().find(p=>p.id===id) || null; }
async function upsertProfile(profile){
  const list = loadProfiles();
  const i = list.findIndex(p=>p.id===profile.id);
  // New children go to the END of the list (design call 2026-07-15): the grid
  // reads in the order children were added, so long-standing students keep
  // their familiar spots and the newest face appears last.
  if(i===-1) list.push(profile); else list[i] = profile;
  return saveProfiles(list);
}
function newProfileId(){ return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
/* DEMO CHILDREN seed — Aditya and Vaishu appear on every fresh install so the
   child flows are usable without re-entering them per device. Their photos are
   bundled LOCAL files (faces/aditya.jpg, faces/vaishu.jpg — the faces/ folder
   is gitignored: children's photos never enter the repo; build.sh copies it
   into www/ like the other media). Seeds ONLY when the device has zero
   profiles, so it never touches real data. PRIVACY: bundling a real child's
   photo+name into the APK needs guardian consent on file — remove or swap
   these before any build that leaves the team if that consent isn't in place.
   researchId is minted locally (legacy path) on purpose: demo children must
   NOT be enrolled to the cloud. */
async function ensureDemoChildrenSeeded(){
  const list = loadProfiles();
  const BUNDLED = { aditya: 'faces/aditya.jpg', vaishu: 'faces/vaishu.jpg' };
  if(list.length){
    // REPAIR pass: profiles named after the demo children but photo-less
    // (created by hand, or resurrected by an OS backup restore — allowBackup
    // was on until 2026-07-13) get the bundled photo attached at boot.
    // Never overwrites a photo that's actually set.
    let changed = false;
    list.forEach(p=>{
      const key = (p.name || '').trim().toLowerCase();
      if(!p.photo && BUNDLED[key]){ p.photo = BUNDLED[key]; changed = true; }
    });
    if(changed) await saveProfiles(list);
    return;
  }
  const now = new Date().toISOString();
  const mk = (name, photo) => ({
    id: newProfileId(), researchId: newResearchId(), schemaVersion: SCHEMA_VERSION,
    name, dob: '', height: '', weight: '', dominantHand: '', filledBy: 'Teacher',
    photo, capturedOn: now,
    videoConsent: false, videoConsentBy: '', videoConsentRelation: '',
    videoConsentMethod: '', videoConsentOn: '', videoConsentWithdrawnOn: '',
    videoConsentFormSerial: '', videoConsentFormPhoto: ''
  });
  await saveProfiles([ mk('Aditya', BUNDLED.aditya), mk('Vaishu', BUNDLED.vaishu) ]);
}
// The active child whose name flows into saved records.
function getActiveProfileId(){ return Store.getString('activeProfile', ''); }
function setActiveProfileId(v){ return Store.setString('activeProfile', v); }
function getActiveProfile(){ const id = getActiveProfileId(); return id ? profileById(id) : null; }

/* ---------------------------------------------------------------------------
   DELETION / ENTRY MANAGEMENT — all routed through the Store seam, same as
   reads and writes, so the Capacitor swap still only touches _get/_set/etc.
   Deletion is a first-class feature here, not a debug path: this is children's
   disability data, and a teacher must be able to remove a wrong record, remove
   a child, or wipe the device cleanly. Every destructive call is explicit and
   confirmed at the UI layer; the CSV export is the only backup, so the UI
   points at it first.
   --------------------------------------------------------------------------- */
// Remove a single session record by its stable UUID id. Index-based deletion
// was retired (Batch 1): an index baked into rendered HTML races any re-render
// and can delete the WRONG child's record. The id can't go stale that way —
// a stale id simply matches nothing and the delete safely no-ops to false.
// Returns true on confirmed write (or confirmed key removal when none remain).
async function deleteRecord(activityId, recordId){
  const all = loadRecords(activityId);
  const gone = all.find(r=>r.id === recordId);
  const kept = all.filter(r=>r.id !== recordId);
  if(kept.length === all.length) return false;       // id not found — nothing deleted
  // ERASURE, not just unlinking: a deleted record must not leave its video
  // bytes behind in DATA/videos/ (DPDP §12 — orphaned clips are still
  // children's personal data, now with no record even pointing at them).
  if(gone && gone.video) await deleteVideoFile(gone.video);
  if(kept.length === 0){ await Store._remove(REC_PREFIX+activityId); return true; }
  return Store.setJSON(REC_PREFIX+activityId, kept);
}
/* ---- VIDEO-FILE ERASURE HELPERS (F9). Files live under DATA/videos/ keyed by
   researchId; records hold only the filename pointer. Every path that removes
   a record/child/device-data flows through these so no clip is ever orphaned.
   Deletion is best-effort and silent on a missing file (already gone = goal
   state); web preview stores no bytes, so it's a no-op there. ---- */
async function deleteVideoFile(filename){
  const cap = window.Capacitor;
  if(!filename || !cap || !cap.isNativePlatform || !cap.isNativePlatform()) return false;
  try { await cap.Plugins.Filesystem.deleteFile({ path: filename, directory: 'DATA' }); return true; }
  catch(_){ return false; }
}
// Every stored-clip filename referenced by ONE child's records.
function videoFilenamesForProfile(profileId){
  const names = [];
  Store._keys().filter(k=>k.indexOf(REC_PREFIX)===0).forEach(k=>{
    const recs = Store.getJSON(k, []);
    if(!Array.isArray(recs)) return;
    recs.forEach(r=>{ if(r.profileId===profileId && r.video) names.push(r.video); });
  });
  return names;
}
// Consent-withdrawal erasure: delete this child's clip FILES and strip the
// dangling `video` pointers from their records (records themselves stay —
// the assessment data was consented separately; only video is withdrawn).
async function eraseVideosForProfile(profileId){
  let n = 0;
  for(const k of Store._keys().filter(k=>k.indexOf(REC_PREFIX)===0)){
    const recs = Store.getJSON(k, []);
    if(!Array.isArray(recs)) continue;
    let changed = false;
    for(const r of recs){
      if(r.profileId===profileId && r.video){
        await deleteVideoFile(r.video);
        delete r.video; changed = true; n++;
      }
    }
    if(changed) await Store.setJSON(k, recs);
  }
  return n;
}
// How many saved records reference a given child, across every activity.
function recordCountForProfile(profileId){
  let n = 0;
  Store._keys().filter(k=>k.indexOf(REC_PREFIX)===0).forEach(k=>{
    const recs = Store.getJSON(k, []);
    if(Array.isArray(recs)) n += recs.filter(r=>r.profileId===profileId).length;
  });
  return n;
}
// All saved records for ONE child, grouped by activity. Each group:
// { activityId, category, activity, records:[…newest-first] }. Used by the
// child-detail screen. Falls back to name-match for pre-profileId records,
// same rule as gatherAllRecords, so old demo data still attributes.
function recordsForProfile(profileId){
  const p = profileById(profileId);
  const groups = [];
  Store._keys().filter(k=>k.indexOf(REC_PREFIX)===0).forEach(k=>{
    const id = k.slice(REC_PREFIX.length);
    const recs = Store.getJSON(k, []);
    if(!Array.isArray(recs)) return;
    const mine = recs.filter(r=>{
      if(r.profileId) return r.profileId === profileId;
      return p && r.student && r.student === p.name;   // legacy name fallback
    });
    if(!mine.length) return;
    mine.sort((a,b)=> String(b.whenISO||b.when||'').localeCompare(String(a.whenISO||a.when||'')));
    const meta = activityNameById(id);
    groups.push({ activityId:id, category:meta.category, activity:meta.activity, records:mine });
  });
  // Stable order: by category then activity name.
  groups.sort((a,b)=> (a.category+a.activity).localeCompare(b.category+b.activity));
  return groups;
}
// If the deleted child was active, clears the active selection too.
async function deleteProfile(profileId){
  // 0. erase this child's video FILES first (F9): once the records are swept
  //    the filename pointers are gone and the clips would be unreachable
  //    orphans on disk. Files before pointers, always.
  for(const fn of videoFilenamesForProfile(profileId)){ await deleteVideoFile(fn); }
  // Consent-form photo is a file too — same rule, no orphans.
  const _p = profileById(profileId);
  if(_p && _p.videoConsentFormPhoto) await deleteVideoFile(_p.videoConsentFormPhoto);
  // 1. sweep linked records out of every activity bucket
  const recKeys = Store._keys().filter(k=>k.indexOf(REC_PREFIX)===0);
  for(const k of recKeys){
    const recs = Store.getJSON(k, []);
    if(!Array.isArray(recs)) continue;
    const kept = recs.filter(r=>r.profileId !== profileId);
    if(kept.length === recs.length) continue;       // nothing for this child here
    if(kept.length === 0) await Store._remove(k);
    else await Store.setJSON(k, kept);
  }
  // 2. remove the profile itself
  const kept = loadProfiles().filter(p=>p.id !== profileId);
  const ok = await saveProfiles(kept);
  // 3. if this child was the active one, clear the selection + legacy name
  if(getActiveProfileId() === profileId){ await setActiveProfileId(''); await setStudent(''); }
  return ok;
}
// The danger-zone reset. Removes profiles, every activity's records, the active
// selection and legacy name. Deliberately KEEPS welcomeSeen so a teacher isn't
// dumped back to the intro screen after a data wipe.
async function clearAllData(){
  // Video files go first (F9): remove the whole videos/ tree so a device wipe
  // is a real wipe — no clip survives the records that pointed at it.
  const cap = window.Capacitor;
  if(cap && cap.isNativePlatform && cap.isNativePlatform()){
    try { await cap.Plugins.Filesystem.rmdir({ path: 'videos', directory: 'DATA', recursive: true }); } catch(_){}
    try { await cap.Plugins.Filesystem.rmdir({ path: 'consent', directory: 'DATA', recursive: true }); } catch(_){}
  }
  const recKeys = Store._keys().filter(k=>k.indexOf(REC_PREFIX)===0);
  for(const k of recKeys){ await Store._remove(k); }
  await Store._remove(PROFILE_KEY);
  await setActiveProfileId('');
  await setStudent('');
}

/* ---------------------------------------------------------------------------
   MIGRATION SHIM — runs at every boot, idempotent, writes only what changed.
   Batch 1 is NOT done without this: delete-by-id breaks every pre-existing
   (demo/pilot) record that has no id. For each legacy record/profile it:
     • backfills a UUID `id`            (records only — profiles already have one)
     • stamps `schemaVersion: 1`
     • tags `teacherId: 'legacy'`       (pre-teacherId records are honestly
                                         marked un-attributable, not faked)
     • converts when → whenISO ONLY when the parse round-trips exactly
       (new Date(Date.parse(when)).toLocaleString() === when). Locale strings
       like "11/6/2026" are D/M in en-IN but parsed M/D by Date.parse — blind
       conversion would silently swap day and month. Ambiguous legacy strings
       keep `when` as display-only and get no whenISO; that is the safe loss.
   On later boots every guard fails and zero writes happen.
   --------------------------------------------------------------------------- */
async function migrateLegacyData(){
  // PROFILES FIRST: records inherit researchId from their linked profile, so
  // every profile must have one before the record loop runs. Order is load-bearing.
  const profiles = loadProfiles();
  let pChanged = false;
  for(const p of profiles){
    if(!p.researchId){ p.researchId = newResearchId(); pChanged = true; }
    if((p.schemaVersion||1) < SCHEMA_VERSION){ p.schemaVersion = SCHEMA_VERSION; pChanged = true; }
    // Consent envelope backfill (additive, no schema bump): pre-consent
    // profiles get an EXPLICIT false, not undefined — no consent on file is a
    // stated fact, and every consent read stays a plain boolean check.
    if(p.videoConsent === undefined){
      p.videoConsent = false;
      p.videoConsentBy = ''; p.videoConsentRelation = ''; p.videoConsentMethod = '';
      p.videoConsentOn = ''; p.videoConsentWithdrawnOn = '';
      pChanged = true;
    }
    // Consent-evidence backfill (additive, later than the envelope fields).
    if(p.videoConsentFormPhoto === undefined){
      p.videoConsentFormPhoto = ''; p.videoConsentFormSerial = '';
      pChanged = true;
    }
  }
  if(pChanged) await saveProfiles(profiles);
  for(const k of Store._keys().filter(k=>k.indexOf(REC_PREFIX)===0)){
    const recs = Store.getJSON(k, null);
    if(!Array.isArray(recs)) continue;
    let changed = false;
    for(const r of recs){
      if(!r.id){ r.id = newId(); changed = true; }
      if(!r.schemaVersion){ r.schemaVersion = SCHEMA_VERSION; changed = true; }
      if(!r.teacherId){ r.teacherId = 'legacy'; changed = true; }
      // School/teacher attribution added after some records existed. Legacy rows
      // honestly carry '' (unknown) rather than a guessed value.
      if(r.schoolId === undefined){ r.schoolId = ''; changed = true; }
      if(r.teacherRosterId === undefined){ r.teacherRosterId = ''; changed = true; }
      // v2 pseudonymisation: backfill researchId from the linked profile. A
      // record with a profileId inherits that child's pseudonym; one without
      // (true orphan) gets a fresh id so it is never name-keyed. Stamp v2 too.
      if(!r.researchId){
        const lp = r.profileId ? profileById(r.profileId) : null;
        r.researchId = (lp && lp.researchId) ? lp.researchId : newResearchId();
        changed = true;
      }
      if((r.schemaVersion||1) < SCHEMA_VERSION){ r.schemaVersion = SCHEMA_VERSION; changed = true; }
      if(!r.whenISO && r.when){
        const t = Date.parse(r.when);
        if(!isNaN(t) && new Date(t).toLocaleString() === r.when){
          r.whenISO = new Date(t).toISOString(); changed = true;
        }
      }
    }
    if(changed) await Store.setJSON(k, recs);
  }
}

/* ---------------------------------------------------------------------------
   EXPORT — the data escape hatch. Until a native app adds real
   storage/cloud, this is how a teacher's session data leaves the device so it
   can't be silently lost. Builds one CSV across ALL activities.
   --------------------------------------------------------------------------- */
function activityNameById(id){
  for(const cat of ACTIVITY_DATA){
    for(const act of cat.activities){
      if(act.id === id) return { category: cat.category, activity: act.name };
    }
  }
  return { category: '', activity: id }; // id no longer in activities.js — still export it
}
// Resolve an activity OBJECT by id (null if no longer in activities.js).
// Sibling of activityNameById, which returns only names.
function findActivity(id){
  for(const cat of ACTIVITY_DATA){
    for(const act of cat.activities){ if(act.id === id) return act; }
  }
  return null;
}
function gatherAllRecords(){
  const rows = [];
  Store._keys().filter(k=>k.indexOf(REC_PREFIX)===0).forEach(k=>{
    const id = k.slice(REC_PREFIX.length);
    const meta = activityNameById(id);
    const recs = Store.getJSON(k, []);
    if(!Array.isArray(recs)) return;
    recs.forEach(r=>{
      // Join the child's demographics onto the row. Prefer profileId; fall back
      // to matching by name for any record saved before profiles existed.
      let p = r.profileId ? profileById(r.profileId) : null;
      if(!p && r.student) p = loadProfiles().find(x=>x.name===r.student) || null;
      rows.push({ category: meta.category, activity: meta.activity,
        // Pseudonym is the primary identifier in every export. Resolve from the
        // record, then the linked profile; never synthesise from the name.
        // Group records have no child — the row says GROUP so researchers can
        // tell a whole-group score from a missing id at a glance.
        researchId: r.group ? 'GROUP' : (r.researchId || (p?p.researchId:'') || ''),
        student: r.student || (p?p.name:''),
        // Canonical ISO timestamp when present (sortable, locale-free);
        // legacy display string only for old records that had no safe ISO.
        when: r.whenISO || r.when || '',
        teacherId: r.teacherId || '',
        // Operator attribution: roster teacher + school who ran the session.
        // Resolve to readable names for the CSV; fall back to the raw id, then ''.
        teacherName: teacherNameById(r.teacherRosterId) || '',
        schoolName:  schoolNameById(r.schoolId) || '',
        age: p?ageFromDOB(p.dob):'', dob: p?(p.dob||''):'', height: p?p.height:'', weight: p?p.weight:'',
        hand: p?p.dominantHand:'', filledBy: p?(p.filledBy||''):'', video: r.video || '',
        // Consent envelope — lets researchers verify consent coverage per row.
        // Status is derived, never stored: Withdrawn beats No (audit-honest).
        videoConsent: p ? (p.videoConsent ? 'Yes' : (p.videoConsentWithdrawnOn ? 'Withdrawn' : 'No')) : '',
        videoConsentOn: p?(p.videoConsentOn||''):'', videoConsentWithdrawnOn: p?(p.videoConsentWithdrawnOn||''):'',
        // Guardian identity is PII — exported only on the keysheet, like name/DOB.
        videoConsentBy: p?(p.videoConsentBy||''):'', videoConsentRelation: p?(p.videoConsentRelation||''):'',
        videoConsentMethod: p?(p.videoConsentMethod||''):'',
        // Evidence: serial is a printed number (not PII); photo exported as Yes/No.
        videoConsentFormSerial: p?(p.videoConsentFormSerial||''):'',
        videoConsentFormPhoto: p ? (p.videoConsentFormPhoto ? 'Yes' : 'No') : '',
        values: r.values || {} });
    });
  });
  return rows;
}
function csvCell(v){
  const s = String(v == null ? '' : v);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
}
function buildCSV(rows, includePII){
  // Value columns = union of all field labels across every record, stable order.
  const valueCols = [];
  rows.forEach(r=>Object.keys(r.values).forEach(label=>{ if(valueCols.indexOf(label)===-1) valueCols.push(label); }));
  // DEFAULT EXPORT IS PSEUDONYMISED: Research ID leads; the two direct
  // identifiers (name, DOB) are OMITTED unless includePII is explicitly set.
  // Age/height/weight/hand are research demographics, not direct identifiers,
  // so they stay. This is the F1/F8 fix: the file that leaves the device by
  // default carries no name and no date of birth.
  const idCols  = includePII ? ['Research ID','Student','DOB'] : ['Research ID'];
  // Consent columns: status + dates ship in EVERY export (researchers must be
  // able to verify coverage); the guardian's identity (by/relation/method) is
  // PII and ships only on the keysheet, same rule as name and DOB.
  const consentCols = includePII
    ? ['Video consent','Consent on','Consent withdrawn on','Consent form serial','Consent form photo','Consent by','Guardian relation','Consent method']
    : ['Video consent','Consent on','Consent withdrawn on','Consent form serial','Consent form photo'];
  const header = [...idCols,'Category','Activity','Age','Height (cm)','Weight (kg)','Dominant hand','Filled by','When','School','Teacher','Teacher ID','Video file', ...consentCols, ...valueCols];
  const lines = [header.map(csvCell).join(',')];
  rows.forEach(r=>{
    const idVals = includePII ? [r.researchId, r.student, r.dob] : [r.researchId];
    const consentVals = includePII
      ? [r.videoConsent, r.videoConsentOn, r.videoConsentWithdrawnOn, r.videoConsentFormSerial, r.videoConsentFormPhoto, r.videoConsentBy, r.videoConsentRelation, r.videoConsentMethod]
      : [r.videoConsent, r.videoConsentOn, r.videoConsentWithdrawnOn, r.videoConsentFormSerial, r.videoConsentFormPhoto];
    const base = [...idVals, r.category, r.activity, r.age, r.height, r.weight, r.hand, r.filledBy, r.when, r.schoolName, r.teacherName, r.teacherId, r.video, ...consentVals];
    const vals = valueCols.map(c=> r.values[c] != null ? r.values[c] : '');
    lines.push(base.concat(vals).map(csvCell).join(','));
  });
  return '\ufeff' + lines.join('\r\n'); // BOM so Excel reads UTF-8 (Indian-language names) correctly
}
async function exportCSV(includePII){
  const rows = gatherAllRecords();
  if(!rows.length){ toast('No saved results to export yet.'); return; }
  const csv = buildCSV(rows, includePII);
  const stamp = new Date().toISOString().slice(0,10);
  // Filename signals the contents: the default carries no names; the key sheet does.
  const filename = includePII ? `om-keysheet-${stamp}.csv` : `om-records-${stamp}.csv`;

  // NATIVE PATH: the browser <a download> trick does not reliably save a file
  // inside a Capacitor WebView (no download manager). Write the file to the
  // app's data directory via Filesystem, then hand it to the OS share sheet so
  // the teacher can save it to Files/Drive/email — the native equivalent of a
  // download. CSV is the only backup, so a failure here must be loud.
  const cap = window.Capacitor;
  if(cap && cap.isNativePlatform && cap.isNativePlatform()){
    try {
      const Filesystem = cap.Plugins.Filesystem;
      const Share = cap.Plugins.Share;
      const writeRes = await Filesystem.writeFile({
        path: filename,
        data: csv,
        directory: 'CACHE',            // Directory.Cache — fine for a transient export
        encoding: 'utf8'
      });
      // getUri gives a file:// path the share sheet can attach.
      const uriRes = await Filesystem.getUri({ path: filename, directory: 'CACHE' });
      await Share.share({
        title: 'O&M records export',
        text: `O&M records (${rows.length} ${rows.length===1?'record':'records'})`,
        url: uriRes.uri,
        dialogTitle: 'Save or send your records CSV'
      });
      // F8: the CSV is unencrypted PII-adjacent data in the OS cache. Once the
      // share sheet has resolved the OS has copied what it needs, so delete our
      // copy rather than leaving it for backup/file-access tooling to harvest.
      try { await Filesystem.deleteFile({ path: filename, directory: 'CACHE' }); } catch(_){}
      toast(`Exported ${rows.length} ${rows.length===1?'record':'records'}.`);
    } catch(e){
      toast('Export failed — could not write the file. Try again.');
    }
    return;
  }

  // WEB PATH (unchanged): anchor download.
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
  toast(`Exported ${rows.length} ${rows.length===1?'record':'records'}.`);
}
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('show'); setTimeout(()=>toastEl.classList.remove('show'), 1800); }

/* Age is derived from date of birth, never stored as a fixed number — so a
   record never shows a stale age. Returns '' if no/invalid DOB. */
function ageFromDOB(dob){
  if(!dob) return '';
  const b = new Date(dob); if(isNaN(b)) return '';
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if(m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a >= 0 && a < 130 ? String(a) : '';
}

/* Downscale a chosen image to a low-res square data URL before storing it.
   Keeps localStorage small and limits how identifiable a stored photo is.
   ~160px longest side, JPEG q0.7. Returns a Promise<dataURL>. */
function downscaleImage(file, max){
  max = max || 160;
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onerror = ()=>reject(new Error('read failed'));
    reader.onload = ()=>{
      const img = new Image();
      img.onerror = ()=>reject(new Error('decode failed'));
      img.onload = ()=>{
        let { width:w, height:h } = img;
        if(w > h && w > max){ h = Math.round(h*max/w); w = max; }
        else if(h >= w && h > max){ w = Math.round(w*max/h); h = max; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function esc(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function paint(html, dir, stagger, opts){
  opts = opts || {};
  // Navigating away? Close the help popup FIRST (instant, no animation) so its
  // borrowed content returns to the outgoing screen before innerHTML wipes it.
  if(typeof closeRefSheet === 'function') closeRefSheet(true);
  if(typeof closeDemoPopup === 'function') closeDemoPopup(true); // and any playing demo
  // Default: utilities menu is hidden. The signed-in landing re-shows it.
  if(typeof setMenuVisible === 'function') setMenuVisible(false);
  if(dir === 'none'){
    screen.removeAttribute('data-dir'); screen.classList.remove('stagger'); screen.style.animation = 'none'; screen.innerHTML = html;
  } else {
    screen.setAttribute('data-dir', dir || 'fwd');
    screen.style.animation = 'none'; void screen.offsetWidth; screen.style.animation = '';
    screen.classList.toggle('stagger', !!stagger); screen.innerHTML = html;
  }
  if(!opts.skipLedeFocus){
    const h1 = screen.querySelector('.lede');
    if(h1){ h1.setAttribute('tabindex','-1'); h1.focus({preventScroll:true}); }
  }
}
/* ===========================================================================
   THREE-PAGE FLOW
   Page 1  showWelcome      — app name, tagline, enter. Shown once (a Store flag
                              records that it's been seen), then launch skips here.
   Page 2  showHub          — the child-capture form inline (collapses to a chip
                              once a child is saved) + the action buttons.
   Page 3  showActivityList — a flat list of every activity, category hue kept as
                              a quiet left spine. Tap an activity -> its run screen.
   =========================================================================== */
const WELCOME_SEEN = 'welcomeSeen';
/* ---------------------------------------------------------------------------
   LOGIN (PILOT, LOCAL) — school dropdown -> teacher list -> log in.
   Add-new-teacher and add-new-school are inline pilot conveniences.
   See the SCHOOLS & TEACHERS production seam above for what changes at prod.
   --------------------------------------------------------------------------- */
let loginSelSchoolId = '';   // currently chosen school in the login screen

function showLogin(dir){
  state = { category:null, activity:null };
  crumbEl.textContent = 'Sign in';
  backBtn.style.display = 'none';
  homeDot.innerHTML = ICON.home;
  resetTheme();
  const schools = loadSchools();
  const opts = schools.map(s=>`<option value="${s.id}" ${s.id===loginSelSchoolId?'selected':''}>${esc(s.name)}</option>`).join('');
  paint(`
    <div class="welcome-mark">${ICON.compass}</div>
    <h1 class="lede">Sign in<small>Choose your school, then enter your login ID and password.</small></h1>
    <div class="field">
      <label for="lg_school">School</label>
      <select id="lg_school" class="select" onchange="onSchoolPick(this.value)">
        <option value="" ${loginSelSchoolId?'':'selected'} disabled>Select your school…</option>
        ${opts}
      </select>
    </div>
    <div id="lg_teacherArea">${loginSelSchoolId ? credentialFormMarkup(loginSelSchoolId) : ''}</div>
    ${PILOT_ALLOW_SELF_PROVISION ? `<button type="button" class="linklike" onclick="showAddSchool()" style="margin-top:var(--s3)">+ Add a new school</button>` : ''}
  `, dir || 'fwd', false);
}

// Login ID + password form, revealed once a school is chosen. The fields are
// real and final; verifyCredentials() supplies the (currently stubbed) verdict.
function credentialFormMarkup(schoolId){
  const s = schoolById(schoolId);
  if(!s) return '';
  if(!(s.teachers||[]).length){
    return `<p class="muted" style="margin:var(--s2) 0">No accounts listed for this school yet. Please contact your coordinator.</p>`;
  }
  return `
    <div class="field">
      <label for="lg_id">Login ID</label>
      <input type="text" id="lg_id" placeholder="e.g. saksham01" autocomplete="username"
             autocapitalize="none" autocorrect="off" spellcheck="false"
             onkeydown="if(event.key==='Enter'){document.getElementById('lg_pw').focus();}">
    </div>
    <div class="field">
      <label for="lg_pw">Password</label>
      <input type="password" id="lg_pw" placeholder="Your password" autocomplete="current-password"
             onkeydown="if(event.key==='Enter'){handleLogin('${s.id}');}">
    </div>
    <p id="lg_err" class="login-err" role="alert" style="display:none"></p>
    <button type="button" class="save" onclick="handleLogin('${s.id}')">Sign in</button>
  `;
}

function onSchoolPick(id){
  loginSelSchoolId = id;
  document.getElementById('lg_teacherArea').innerHTML = credentialFormMarkup(id);
}

async function handleLogin(schoolId){
  const s = schoolById(schoolId);
  if(!s){ showLoginError('Could not find that school — please reselect.'); return; }
  const idEl = document.getElementById('lg_id');
  const pwEl = document.getElementById('lg_pw');
  const loginId = idEl ? idEl.value : '';
  const password = pwEl ? pwEl.value : '';
  if(!loginId.trim()){ showLoginError('Enter your login ID.'); if(idEl) idEl.focus(); return; }
  if(!password){ showLoginError('Enter your password.'); if(pwEl) pwEl.focus(); return; }
  const btn = document.querySelector('#lg_teacherArea .save');
  if(btn){ btn.disabled = true; }
  const teacher = await verifyCredentials(s, loginId, password);
  if(!teacher){
    if(btn){ btn.disabled = false; }
    showLoginError('Login ID or password is incorrect.');
    if(pwEl){ pwEl.value = ''; pwEl.focus(); }
    return;
  }
  await logIn(s, teacher);
  showHub('fwd');
}

function showLoginError(msg){
  const el = document.getElementById('lg_err');
  if(el){ el.textContent = msg; el.style.display = ''; }
  else { toast(msg); }
}

function showAddTeacher(schoolId){
  const s = schoolById(schoolId); if(!s) return;
  crumbEl.textContent = 'Add teacher';
  paint(`
    <h1 class="lede">Add a teacher<small>New teacher for ${esc(s.name)}.</small></h1>
    <div class="field"><label for="nt_name">Teacher's name</label>
      <input type="text" id="nt_name" placeholder="Full name" autocomplete="off"></div>
    <div class="field"><label for="nt_login">Login ID</label>
      <input type="text" id="nt_login" placeholder="e.g. saksham02" autocapitalize="none" autocorrect="off" spellcheck="false" autocomplete="off"></div>
    <button type="button" class="save" onclick="handleAddTeacher('${s.id}')">Add &amp; sign in</button>
    <button type="button" class="linklike" onclick="loginSelSchoolId='${s.id}';showLogin('back')" style="margin-top:var(--s2)">Cancel</button>
  `, 'fwd', false);
}
async function handleAddTeacher(schoolId){
  const name = (document.getElementById('nt_name').value||'').trim();
  const loginId = (document.getElementById('nt_login').value||'').trim();
  if(!name){ toast('Please enter a name.'); return; }
  if(!loginId){ toast('Please assign a login ID.'); return; }
  const t = await addTeacher(schoolId, name, loginId);
  if(!t){ toast('Could not save — please try again.'); return; }
  const s = schoolById(schoolId);
  await logIn(s, t);
  showHub('fwd');
}

function showAddSchool(){
  crumbEl.textContent = 'Add school';
  paint(`
    <h1 class="lede">Add a school<small>Create a new school, then add its first teacher.</small></h1>
    <div class="field"><label for="ns_name">School name</label>
      <input type="text" id="ns_name" placeholder="School name" autocomplete="off"></div>
    <button type="button" class="save" onclick="handleAddSchool()">Create school</button>
    <button type="button" class="linklike" onclick="showLogin('back')" style="margin-top:var(--s2)">Cancel</button>
  `, 'fwd', false);
}
async function handleAddSchool(){
  const name = (document.getElementById('ns_name').value||'').trim();
  if(!name){ toast('Please enter a school name.'); return; }
  const s = await addSchool(name);
  if(!s){ toast('Could not save — please try again.'); return; }
  loginSelSchoolId = s.id;
  showAddTeacher(s.id);   // a new school has no teachers — go add the first
}

/* ---------------------------------------------------------------------------
   HOME — the signed-in landing (Path A). A true tier ABOVE the "Today" hub:
   three doors (About · Stored data · Activities) plus sign-out. The hub
   (child setup + teach) now lives behind the Activities tile, so child setup
   stays adjacent to teaching. Home is the top of the signed-in tree, so the
   header home-dot returns here and sign-out lives here.
   --------------------------------------------------------------------------- */
function showHome(dir){
  state = { category:null, activity:null };
  const t = getSessionTeacher();
  crumbEl.textContent = t ? `Signed in as ${t.name}` : 'Home';
  backBtn.style.display = 'none';
  homeDot.innerHTML = ICON.home;
  resetTheme();
  // The two-thing landing: Activities and Students, nothing else. Utilities
  // (Export, Manage data, About, Sign out) live in the header overflow menu.
  // Child selection happens LATER in the flow (at the child picker, after an
  // activity is chosen), so the hub deliberately carries no active-child chip
  // and Activities always routes through the activity list.
  paint(`
    <h1 class="lede">Today<small>Pick a student, then run an activity.</small></h1>
    <div class="hub-actions">
      <button class="action-row" onclick="showActivityList('fwd')">
        <span class="action-ic">${ICON.compass}</span>
        <span class="action-text"><strong>Activities</strong><small>Choose an activity, then the student to run it with</small></span>
        <span class="action-go">${ICON.chevronRight}</span>
      </button>
      <button class="action-row" onclick="showStudents('fwd')">
        <span class="action-ic">${ICON.user}</span>
        <span class="action-text"><strong>Students</strong><small>Add a new child, or open an existing one</small></span>
        <span class="action-go">${ICON.chevronRight}</span>
      </button>
    </div>
  `, dir || 'fwd', false);
  setMenuVisible(true); // landing is the only screen with the utilities menu
}
// Back-compat: older call sites and the welcome/login flow route to showHub.
// The landing collapsed into showHome, so showHub now just forwards there.
function showHub(dir, opts){ showHome(dir); }

async function handleLogout(){
  const go = await askConfirm({
    title:'Sign out?',
    body:'You can sign back in any time from the school list. Nothing on this device is deleted.',
    confirmLabel:'Sign out' });
  if(!go) return;
  await logOut();
  loginSelSchoolId = '';
  showLogin('back');
}

// Read-only "about" — same content as the first-run welcome, but reachable any
// time from Home, so it carries a back button (unlike the one-time welcome).
function showAbout(dir){
  state = { category:null, activity:null };
  crumbEl.textContent = 'About';
  backBtn.style.display = 'flex';
  backBtn.onclick = ()=>showHome('back');
  homeDot.innerHTML = ICON.home;
  resetTheme();
  paint(`
    <div class="welcome-mark">${ICON.compass}</div>
    <h1 class="lede">O&amp;M Cane Training<small>A calm space for teachers to set up a child, run orientation &amp; mobility activities, and record how each session goes — all on this device.</small></h1>
  `, dir || 'fwd', false);
}

function showWelcome(dir){
  state = { category:null, activity:null };
  crumbEl.textContent = 'Welcome';
  backBtn.style.display = 'none';
  homeDot.innerHTML = ICON.home;
  resetTheme();
  paint(`
    <div class="welcome">
      <div class="welcome-mark">${ICON.compass}</div>
      <h1 class="lede">O&amp;M Cane Training<small>A calm space for teachers to set up a child, run orientation &amp; mobility activities, and record how each session goes — all on this device.</small></h1>
      <button class="save welcome-btn" onclick="enterFromWelcome()">Get started</button>
    </div>
  `, dir || 'fwd', false);
}
async function enterFromWelcome(){
  await Store.setString(WELCOME_SEEN, '1');
  showHome('fwd');
}
function avatarFor(p, cls){
  cls = cls || 'avatar-img';
  if(p && p.photo) return `<img class="${cls}" src="${p.photo}" alt="">`;
  const initial = (p && p.name ? p.name : '?').trim().charAt(0).toUpperCase();
  if(cls==='avatar-img') return `<span class="blob">${esc(initial)}</span>`;
  return `<span class="${cls}">${esc(initial)}</span>`;
}

/* ---------------------------------------------------------------------------
   STUDENTS — the second of the hub's two destinations. One screen that does
   both jobs the brief asks for: "add a student" (the demographic form, behind
   a disclosure) and "see existing student data" (the saved-children list,
   tap-through to each child's detail). Selecting a child here makes them the
   active one and returns to the hub so a session can start immediately.
   --------------------------------------------------------------------------- */
function showStudents(dir, opts){
  opts = opts || {};
  pendingPickerReturn = null; // not in a picker flow when on the Students list
  state = { category:null, activity:null };
  crumbEl.textContent = 'Students';
  backBtn.style.display = 'flex';
  backBtn.onclick = ()=>showHub('back');
  homeDot.innerHTML = ICON.home;
  resetTheme();
  const profiles = loadProfiles();
  const activeId = getActiveProfileId();
  // Open the add-child form on paint when asked (e.g. from an "Add" tap), OR
  // automatically when there are no children yet — first run lands on the form.
  const formOpen = !!opts.addForm || profiles.length === 0;

  const rows = profiles.length
    ? profiles.map(p=>{
        const n = recordCountForProfile(p.id);
        const sub = [childSub(p), `${n} ${n===1?'result':'results'}`].filter(Boolean).join(' · ');
        const isActive = p.id === activeId;
        const tag = isActive ? '<span class="active-tag">Active</span>' : '';
        // Tapping a student selects them (makes active) and returns to the hub,
        // ready to teach. The chevron-into-detail lives on a separate control so
        // "select to teach" and "inspect saved data" don't fight for the tap.
        return `<div class="student-row${isActive?' is-active':''}">
          <button type="button" class="student-pick" onclick="selectChild('${p.id}')">
            ${avatarFor(p,'avatar')}<span class="who">${tag}${esc(p.name)}<small>${esc(sub)}</small></span>
          </button>
          <button type="button" class="student-open" aria-label="See ${esc(p.name)}'s saved data" onclick="showChildDetail('${p.id}',{from:'students'})">${ICON.chevronRight}</button>
        </div>`;
      }).join('')
    : '<p class="empty">No students added yet. Add the first one below.</p>';

  paint(`
    <h1 class="lede">Students<small>Add a child, or open an existing one to teach or review their data.</small></h1>
    <details class="disclosure" id="childForm" ${formOpen?'open':''}>
      <summary>${ICON.plus}<span class="disclosure-label">Add a new student</span><span class="chev">${ICON.chevron}</span></summary>
      <div class="sop-body"><div class="sop-inner">${profileFormMarkup(null, true)}</div></div>
    </details>
    <h2 class="section-label" style="margin-top:var(--s4)">Existing students</h2>
    ${rows}
  `, dir || 'fwd', false);
}
function childSub(p){
  const age = ageFromDOB(p.dob);
  return [age?age+' yrs':'', p.dominantHand?p.dominantHand+'-handed':''].filter(Boolean).join(' · ');
}
/* ---------------------------------------------------------------------------
   MANAGE DATA (page) — the entry-management surface. Kept OFF the primary
   teach path on its own screen so destructive controls aren't a stray tap
   away. Three tiers: per-record delete lives on the activity screen; per-child
   delete lives here; the full wipe is a clearly-marked danger zone. Every
   destructive action confirms and nudges toward CSV export first, because the
   export is the only backup.
   --------------------------------------------------------------------------- */
function showManageData(dir){
  state = { category:null, activity:null };
  crumbEl.textContent = 'Stored data';
  backBtn.style.display = 'flex';
  backBtn.onclick = ()=>showHome('back');
  homeDot.innerHTML = ICON.home;
  resetTheme();
  const profiles = loadProfiles();
  const childRows = profiles.length
    ? profiles.map(p=>{
        const n = recordCountForProfile(p.id);
        const sub = [childSub(p), `${n} ${n===1?'result':'results'}`].filter(Boolean).join(' · ');
        // The whole row is now a button into the child's detail view. Delete
        // moved into that detail screen, so this list is clean navigation.
        return `<button type="button" class="activechild rowtap" onclick="showChildDetail('${p.id}',{from:'manage'})">${avatarFor(p,'avatar')}<span class="who">${esc(p.name)}<small>${esc(sub)}</small></span><span class="action-go">${ICON.chevronRight}</span></button>`;
      }).join('')
    : '<p class="empty">No children saved yet.</p>';
  paint(`
    <h1 class="lede">Stored data<small>Tap a child to see their saved results. Export a CSV first — it is the only backup.</small></h1>
    <button class="action-row" onclick="exportCSV()" style="margin-bottom:var(--s3)">
      <span class="action-ic">${ICON.download}</span>
      <span class="action-text"><strong>Export everything</strong><small>Download all sessions as a CSV</small></span>
    </button>
    <h2 class="section-label">Children on this device</h2>
    ${childRows}
    <div class="danger-zone">
      <h2 class="panel-title" style="color:#8a3c12">${ICON.trash} Danger zone</h2>
      <p style="margin:0 0 var(--s3); font-size:var(--t-bodysm); color:var(--ink-soft);">This permanently removes every child profile and every saved result from this device. It cannot be undone.</p>
      <button type="button" class="save danger-btn" onclick="confirmClearAll()">Clear all data</button>
    </div>
  `, dir || 'fwd', false);
}

/* ---------------------------------------------------------------------------
   CHILD DETAIL — one child's profile summary + every saved result, grouped by
   activity (newest first). Reached by tapping a child on the Stored data list.
   Per-child Remove lives here (off the list, one level in, so it isn't a stray
   tap). Per-result delete reuses the by-id deletion path.
   --------------------------------------------------------------------------- */
function showChildDetail(profileId, opts){
  opts = opts || {};
  const p = profileById(profileId);
  if(!p){ toast('That child could not be found.'); showStudents('back'); return; }
  state = { category:null, activity:null };
  crumbEl.textContent = p.name;
  backBtn.style.display = 'flex';
  // Reachable from Students and from Stored data — go back to whichever opened it.
  const from = opts.from || childDetailFrom || 'students';
  childDetailFrom = from;
  backBtn.onclick = ()=> from === 'manage' ? showManageData('back') : showStudents('back');
  homeDot.innerHTML = ICON.home;
  resetTheme();
  const groups = recordsForProfile(profileId);
  const total = groups.reduce((n,g)=>n+g.records.length, 0);
  const body = groups.length
    ? groups.map(g=>{
        const act = findActivity(g.activityId);
        const resultLabels = act ? act.dataFields.filter(f=>f.type==='result'||f.type==='mastery').map(f=>f.label) : [];
        const recs = g.records.map(r=>childRecordRow(r, resultLabels, g.activityId)).join('');
        return `<h2 class="section-label">${esc(g.activity || g.activityId)}</h2>${recs}`;
      }).join('')
    : '<p class="empty">No results saved for this child yet.</p>';
  const filledLine = p.filledBy ? `<p class="muted" style="margin:0 0 var(--s3)">Details filled by ${esc(p.filledBy)}.</p>` : '';
  // Consent at a glance — teachers must see video-consent state without
  // opening the edit form. Derived, same precedence as the CSV export.
  const consentLine = (function(){
    const d = iso => { const t = new Date(iso); return isNaN(t) ? iso : t.toLocaleDateString(); };
    // Evidence tail: serial + form-photo viewer, appended to whichever state line applies.
    const ev = [];
    if(p.videoConsentFormSerial) ev.push(`form no. ${esc(p.videoConsentFormSerial)}`);
    if(p.videoConsentFormPhoto)  ev.push(`<button type="button" class="linklike" onclick="viewConsentPhoto('${p.id}')">view form photo</button>`);
    const tail = ev.length ? ` (${ev.join(' · ')})` : '';
    if(p.videoConsent) return `<p class="muted" style="margin:0 0 var(--s3)">Video consent on file since ${esc(d(p.videoConsentOn))} — given by ${esc(p.videoConsentBy||'guardian')}${p.videoConsentRelation?` (${esc(p.videoConsentRelation)})`:''}${tail}.</p>`;
    if(p.videoConsentWithdrawnOn) return `<p class="muted" style="margin:0 0 var(--s3)">Video consent withdrawn on ${esc(d(p.videoConsentWithdrawnOn))} — video capture is locked${tail}.</p>`;
    return `<p class="muted" style="margin:0 0 var(--s3)">No video consent on file — video capture is locked.</p>`;
  })();
  const isActive = p.id === getActiveProfileId();
  const activateRow = isActive
    ? '<p class="muted" style="margin:0 0 var(--s3)">This is the active student.</p>'
    : `<button type="button" class="action-row" style="margin-bottom:var(--s3)" onclick="selectChild('${p.id}')">
         <span class="action-ic">${ICON.compass}</span>
         <span class="action-text"><strong>Teach this student</strong><small>Make ${esc(p.name)} active and pick an activity</small></span>
         <span class="action-go">${ICON.chevronRight}</span>
       </button>`;
  paint(`
    <div class="activechild" style="margin-bottom:var(--s3)">${avatarFor(p,'avatar')}<span class="who">${esc(p.name)}<small>${esc(childSub(p) || 'No demographics')}</small></span></div>
    ${filledLine}
    ${consentLine}
    ${activateRow}
    <details class="disclosure" id="childForm" ${opts.editForm?'open':''}>
      <summary>${ICON.edit}<span class="disclosure-label">Edit details</span><span class="chev">${ICON.chevron}</span></summary>
      <div class="sop-body"><div class="sop-inner">${profileFormMarkup(p, true)}</div></div>
    </details>
    <h2 class="section-label" style="margin-top:var(--s4)">Saved results</h2>
    <p class="muted" style="margin:0 0 var(--s3)">${total} ${total===1?'result':'results'} saved.</p>
    ${body}
    <div class="danger-zone">
      <p style="margin:0 0 var(--s3); font-size:var(--t-bodysm); color:var(--ink-soft);">Removing this child also deletes all of their saved results. Export a CSV first if you need a backup.</p>
      <button type="button" class="save danger-btn" onclick="confirmDeleteChild('${p.id}')">${ICON.trash} Remove ${esc(p.name)}</button>
    </div>
  `, dir_for_detail(opts), false);
}
let childDetailFrom = 'students';
function dir_for_detail(opts){ return opts && opts.dir ? opts.dir : 'fwd'; }
// A record row for the child-detail view: date + values, plus a by-id delete.
// Sibling of renderRecord — that one is for the activity screen and leads with
// the student name; here the child is already the page, so we lead with date.
function childRecordRow(r, resultLabels, activityId){
  resultLabels = resultLabels || [];
  const entries = Object.entries(r.values||{}).filter(([k,v])=>v && v!=='' && v!=='—');
  entries.sort((a,b)=>{ const ar = resultLabels.includes(a[0])?0:1; const br = resultLabels.includes(b[0])?0:1; return ar-br; });
  const pills = entries.map(([k,v])=>{ const isResult = resultLabels.includes(k); return `<span class="${isResult?'val-result':''}">${esc(k)}: ${esc(v)}</span>`; }).join('');
  const del = r.id ? `<button type="button" class="rec-del" aria-label="Delete this result" onclick="confirmDeleteRecordFromChild('${esc(activityId)}','${esc(r.id)}','${esc(r.profileId||'')}')">${ICON.trash}</button>` : '';
  return `<div class="record"><div class="rec-head"><span class="rec-meta"><span class="when">${esc(fmtWhen(r))}</span></span>${del}</div><div class="vals">${pills || '<span>(no values)</span>'}</div></div>`;
}
// Delete a result from the child-detail screen, then re-render that screen in
// place (not the activity screen, where the sibling delete returns).
async function confirmDeleteRecordFromChild(activityId, recordId, profileId){
  const go = await askConfirm({
    title:'Delete this result?',
    body:'This one saved result will be permanently removed. This cannot be undone.',
    confirmLabel:'Delete result', danger:true });
  if(!go) return;
  const ok = await deleteRecord(activityId, recordId);
  if(!ok){ toast('Could not delete — please try again.'); return; }
  toast('Result deleted');
  showChildDetail(profileId);
}
async function confirmDeleteChild(id){
  const p = profileById(id); if(!p) return;
  const n = recordCountForProfile(id);
  const go = await askConfirm({
    title:`Remove ${esc(p.name)}?`,
    body:`${esc(p.name)}'s profile${n? ` and their <strong>${n} saved ${n===1?'result':'results'}</strong>`:''} will be permanently removed. This cannot be undone — if you haven't exported a CSV backup yet, cancel and export first.`,
    confirmLabel:`Remove ${esc(p.name)}`, danger:true });
  if(!go) return;
  const ok = await deleteProfile(id);
  toast(ok ? `Removed ${p.name}` : 'Could not remove — please try again.');
  showManageData('none');
}
async function confirmClearAll(){
  const profiles = loadProfiles().length;
  const results = gatherAllRecords().length;
  if(!profiles && !results){ toast('There is no data to clear.'); return; }
  // ONE dialog with real counts + an explicit "I understand" tick (replaces
  // the old double window.confirm — two stacked yes/no boxes teach people to
  // click through; a named consequence + armed button makes them read).
  const go = await askConfirm({
    title:'Clear all data on this device?',
    body:`This permanently deletes <strong>${profiles} ${profiles===1?'child':'children'}</strong> and <strong>${results} saved ${results===1?'result':'results'}</strong>. The CSV export is the only backup.`,
    extra:`<button type="button" class="confirm-export" onclick="exportCSV()">${ICON.download} Export CSV first</button>`,
    ack:'I understand this cannot be undone',
    confirmLabel:'Clear all data', danger:true });
  if(!go) return;
  await clearAllData();
  toast('All data cleared');
  showHome('back');
}
// SCREEN 3a — CATEGORY GRID. The activities page now opens on the categories
// (Direction, Sound, …), not every activity at once. Each tile names a category
// (its own hue on the icon chip) and shows how many activities it holds; tapping
// drills into showCategory for just that type. Colour still does one job: naming.
function showActivityList(dir){
  state = { category:null, activity:null };
  crumbEl.textContent = 'Activities';
  backBtn.style.display = 'flex';
  backBtn.onclick = ()=>showHub('back');
  homeDot.innerHTML = ICON.home;
  resetTheme();
  const tiles = [];
  ACTIVITY_DATA.forEach((cat,ci)=>{
    if(!cat.activities || !cat.activities.length) return; // hide empty categories
    const col = catColor(ci);
    const n = cat.activities.length;
    const sub = cat.description ? esc(cat.description) : `${n} ${n===1?'activity':'activities'}`;
    tiles.push(`<button class="action-row cat-tile" style="--tile:${col}" onclick="showCategory(${ci},'fwd')">
      <span class="action-ic">${catIcon(ci)}</span>
      <span class="action-text"><strong>${esc(cat.category)}</strong><small>${sub}</small></span>
      <span class="count-pill">${n}</span>
      <span class="action-go">${ICON.chevronRight}</span>
    </button>`);
  });
  paint(`<h1 class="lede">Activities<small>Pick a category to see its activities.</small></h1><div class="cat-grid">${tiles.join('')}</div>`, dir || 'fwd', true);
}
// SCREEN 3b — ONE CATEGORY. Lists only the activities inside the chosen type,
// themed to that category. Reuses the neutral grouped-card markup (cane tag +
// saved count). Back returns to the category grid, not Home.
function showCategory(ci, dir){
  const cat = ACTIVITY_DATA[ci];
  if(!cat){ showActivityList('back'); return; }
  state = { category:ci, activity:null };
  crumbEl.textContent = cat.category;
  backBtn.style.display = 'flex';
  backBtn.onclick = ()=>showActivityList('back');
  homeDot.innerHTML = ICON.home;
  themeFor(ci);
  const pal = CATEGORY_PALETTE[ci % CATEGORY_PALETTE.length];
  const col = catColor(ci);
  /* MEDIA-FORWARD activity cards (design call 2026-07-21, "A3" won the
     on-device bake-off): the demo's first frame leads each card — the video
     loads metadata only, so the thumb costs one frame, not the clip. No demo
     filmed yet → the striped placeholder, which doubles as the content team's
     to-film list. */
  const cards = cat.activities.map((act,ai)=>{
    const n = loadRecords(act.id).length;
    // Cane status is a per-card BINARY: with-cane = rust semantic marker,
    // without-cane = neutral pill. Category identity already lives in the header.
    const tag = act.withCane
      ? '<span class="tag cane">With cane</span>'
      : '<span class="tag neutral">Without cane</span>';
    // GROUP activities are scored once for the whole group — straight to the
    // record screen; everything else goes to the batch roster picker.
    const groupTag = act.group ? '<span class="tag neutral">Group</span>' : '';
    const go = act.group ? `showActivity(${ci},${ai},{dir:'fwd'})` : `showChildPicker(${ci},${ai},'fwd')`;
    // STILL-LIFE thumbs on every card (video frames retired 2026-07-21 — the
    // demos aren't final, and a designed scene stays stable while clips
    // churn). The ▶ badge is a real control: tapping it plays the demo in an
    // overlay WITHOUT triggering the card's navigation (stopPropagation in
    // playDemo). File/title ride on data-attrs so names with quotes are safe.
    const thumb = `<span class="media-thumb still">${activityStill(cat, act)}${
      act.videoFile ? `<span class="media-play" role="button" tabindex="0"
        data-video="${esc(act.videoFile)}" data-title="${esc(act.name)}"
        aria-label="Play the demo video for ${esc(act.name)}"
        onclick="playDemo(this, event)"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();playDemo(this, event);}">${ICON.sbPlay || '▶'} demo</span>` : ''}</span>`;
    return `<button class="card-media" onclick="${go}">
      ${thumb}
      <span class="media-body"><h2>${esc(act.name)}</h2>
        <span class="meta">${tag}${groupTag}${ n ? `<span class="pill saved">${n} saved</span>` : '' }</span></span>
    </button>`;
  }).join('');
  const lede = cat.description ? esc(cat.description) : 'Pick an activity to read the steps and record a result.';
  // Category-level ? — same headless-sheet pattern as the activity screens.
  // Renders only when the category defines `help` in activities.js (guidance
  // lines + optional demo video), so categories opt in content-side.
  const hasHelp = Array.isArray(cat.help) && cat.help.length;
  const helpBtn = hasHelp
    ? `<button type="button" class="help-btn" aria-label="About ${esc(cat.category)} — what to pick and why"
        aria-haspopup="dialog" aria-expanded="false" onclick="toggleRefSheet(this,'catRefSheet')">?</button>`
    : '';
  const helpVideo = hasHelp && cat.helpVideo
    ? `<div class="ref-block"><span class="section-label">Demonstration</span><video controls src="${esc(cat.helpVideo)}" style="width:100%;margin-top:10px;border-radius:14px;"></video></div>`
    : '';
  // Optional setup photo — same opt-in pattern as helpVideo. Content team sets
  // `helpImage` on the category in activities.js (filename at root, bundled
  // like demo videos). Renders between the demo video and the help lines.
  const helpImage = hasHelp && cat.helpImage
    ? `<div class="ref-block"><span class="section-label">Setup example</span><img src="${esc(cat.helpImage)}" alt="How the ${esc(cat.category)} setup looks when laid out" style="width:100%;margin-top:10px;border-radius:14px;"/></div>`
    : '';
  const helpSheet = hasHelp
    ? `<div class="ref-src" id="catRefSheet" data-help-title="${esc(cat.category)}" hidden>
          ${helpVideo}
          ${helpImage}
          <h2 class="section-label">How to use this category</h2>
          <ol class="sop-list">${cat.help.map(h=>`<li>${esc(h)}</li>`).join('')}</ol>
      </div>`
    : '';
  paint(`<section class="cat-group">
    <div class="cat-head"><span class="cat-ic" style="background:${col}">${catIcon(ci)}</span><span class="cat-name" style="color:${pal.deep}">${esc(cat.category)}</span></div>
    <div class="lede-row">
      <h1 class="lede" style="margin-top:6px">${esc(cat.category)}<small>${lede}</small></h1>
      ${helpBtn}
    </div>
    ${helpSheet}
    <div class="cat-cards">${cards}</div>
  </section>`, dir || 'fwd', true);
}
async function selectChild(id){
  await setActiveProfileId(id);
  const p = profileById(id);
  if(p) await setStudent(p.name);
  showHub('none');
}
/* The demographic capture form, rendered INLINE on the hub. Fields: name, DOB
   (age is derived), height, weight, dominant hand, low-res photo. */
let pendingPhoto = null; // holds a freshly downscaled data URL before save
function profileFormMarkup(editing, bare){
  pendingPhoto = editing ? (editing.photo || null) : null;
  // Same reset for the staged consent-form photo: a photo picked for one child
  // and abandoned must NEVER survive into another child's save (audit found a
  // cross-child evidence leak here — the avatar reset above set the pattern).
  pendingConsentPhoto = null;
  const v = (k)=> editing && editing[k] != null ? esc(String(editing[k])) : '';
  const hand = editing ? editing.dominantHand : '';
  const photoInner = pendingPhoto ? `<img id="photoImg" class="photo-preview" src="${pendingPhoto}" alt="Current photo">`
                                  : `<span id="photoImg" class="photo-preview">${ICON.user}</span>`;
  const ageHint = editing && editing.dob && ageFromDOB(editing.dob) ? ` <span style="font-weight:500;color:var(--ink-faint)">(age ${ageFromDOB(editing.dob)})</span>` : '';
  // "Filled by" = who took these details down. A roster picker of the current
  // school's teachers, defaulting to the signed-in teacher. An "Other…" option
  // reveals a free-text box for an aide/parent who isn't on the roster. We store
  // the resolved NAME (not the id) so the value survives roster edits and joins
  // cleanly into the CSV — same as before, just chosen instead of typed.
  const sessSchool = getSessionSchool();
  const roster = sessSchool ? ((schoolById(sessSchool.id) || {}).teachers || []) : [];
  const currentFilledBy = editing && editing.filledBy != null && editing.filledBy !== ''
    ? editing.filledBy
    : (editing ? '' : ((getSessionTeacher() || {}).name || ''));
  // Does the current value match a roster name? If yes, preselect it; if it's a
  // non-empty value with no roster match, it's an "Other" custom name.
  const onRoster = roster.some(t => t.name === currentFilledBy);
  const isOther = !!currentFilledBy && !onRoster;
  const rosterOptions = roster.map(t =>
    `<option value="${esc(t.name)}" ${t.name===currentFilledBy?'selected':''}>${esc(t.name)}</option>`
  ).join('');
  const filledByMarkup = `
        <div class="field"><label for="p_filledby_sel">Filled by <span style="font-weight:500;color:var(--ink-faint)">(who recorded these details)</span></label>
          <select id="p_filledby_sel" class="select" onchange="onFilledByChange(this)">
            ${roster.length ? '' : '<option value="" selected>— no roster teachers —</option>'}
            ${rosterOptions}
            <option value="__other__" ${isOther?'selected':''}>Other (type a name)…</option>
          </select>
          <input type="text" id="p_filledby_other" value="${esc(isOther?currentFilledBy:'')}" placeholder="Name of the person taking the details"
                 autocomplete="off" style="margin-top:8px;${isOther?'':'display:none'}">
        </div>`;
  // The form body. When `bare`, it has no panel wrapper or title — the
  // disclosure on the Hub supplies the container and the "Add/Edit child"
  // label, so we don't double the framing (guardrail #2: one shadow tier).
  const body = `
      <form id="profileForm" onsubmit="return false;"><fieldset><legend class="visually-hidden">Child details</legend>
        <div class="field"><label for="p_name">Name</label><input type="text" id="p_name" value="${v('name')}" placeholder="Child's name" autocomplete="off"></div>
        <div class="field"><label for="p_dob">Date of birth${ageHint}</label><input type="date" id="p_dob" value="${v('dob')}"></div>
        <div class="field"><label for="p_height">Height (cm)</label><input type="number" id="p_height" min="0" step="0.1" value="${v('height')}" placeholder="e.g. 124"></div>
        <div class="field"><label for="p_weight">Weight (kg)</label><input type="number" id="p_weight" min="0" step="0.1" value="${v('weight')}" placeholder="e.g. 26"></div>
        <div class="field"><label id="lbl_hand">Dominant hand</label>
          <div class="seg" id="p_hand" data-value="${hand||''}" role="group" aria-labelledby="lbl_hand">
            ${['Left','Right','Unknown'].map(h=>`<button type="button" onclick="pickSeg('p_hand','${h}',this)" aria-pressed="${hand===h}">${h}</button>`).join('')}
          </div>
        </div>
        ${filledByMarkup}
        <div class="field"><label>Photo <span style="font-weight:500;color:var(--ink-faint)">(optional, stored low-resolution)</span></label>
          <div class="photo-field">
            ${photoInner}
            <div class="photo-actions">
              <button type="button" class="tool-btn" onclick="document.getElementById('p_photo').click()">${ICON.video} Choose photo</button>
              <button type="button" class="tool-btn" id="photoClear" onclick="clearPhoto()" ${pendingPhoto?'':'style="display:none"'}>Remove</button>
            </div>
            <input type="file" id="p_photo" accept="image/*" style="display:none" onchange="handlePhotoPick(this)">
          </div>
        </div>
        <div class="field consent-field">
          <div class="checkrow">
            <input type="checkbox" id="p_videoconsent" onchange="toggleConsentFields(this)" ${editing && editing.videoConsent ? 'checked' : ''}>
            <label for="p_videoconsent">Guardian consent for video — this child may be filmed performing activities and the clips shared with researchers</label>
          </div>
          <span class="field-hint">Required before any video can be attached for this child. Withdraw anytime by unticking and saving.</span>
          <!-- VERIFIABLE consent record (DPDP Rule 10): a bare tick is not enough.
               WHO consented, their RELATION to the child, and HOW consent was
               taken are recorded with the grant. Hidden until the box is ticked. -->
          <div class="consent-sub" id="consentSub" ${editing && editing.videoConsent ? '' : 'style="display:none"'}>
            <div class="field"><label for="p_consentby">Consent given by</label>
              <input type="text" id="p_consentby" value="${esc((editing||{}).videoConsentBy||'')}" placeholder="Guardian's full name" autocomplete="off"></div>
            <div class="field"><label id="lbl_consentrel">Relation to child</label>
              <div class="seg" id="p_consentrel" data-value="${esc((editing||{}).videoConsentRelation||'')}" role="group" aria-labelledby="lbl_consentrel">
                ${['Mother','Father','Legal guardian'].map(rel=>`<button type="button" onclick="pickSeg('p_consentrel','${rel}',this)" aria-pressed="${((editing||{}).videoConsentRelation||'')===rel}">${rel}</button>`).join('')}
              </div>
            </div>
            <div class="field"><label for="p_consentmethod">How consent was taken</label>
              <select id="p_consentmethod" class="select">
                ${['Signed paper form','Verbal, in person at school','Other'].map(m=>`<option value="${m}" ${(((editing||{}).videoConsentMethod)||'Signed paper form')===m?'selected':''}>${m}</option>`).join('')}
              </select>
            </div>
            <div class="field"><label for="p_consentserial">Form serial no. <span class="field-hint">(optional — printed on the paper form)</span></label>
              <input type="text" id="p_consentserial" value="${esc((editing||{}).videoConsentFormSerial||'')}" placeholder="e.g. RNKS-023" autocomplete="off"></div>
            <div class="field"><label>Photo of the signed form <span class="field-hint">(recommended — audit evidence)</span></label>
              <div class="video-slot" id="consentPhotoSlot">
                <span class="video-name" id="consentPhotoName">${(editing||{}).videoConsentFormPhoto ? 'Form photo on file' : 'No photo attached'}</span>
                <div class="video-actions">
                  <button type="button" class="tool-btn" onclick="document.getElementById('p_consentphoto').click()">${ICON.video} ${(editing||{}).videoConsentFormPhoto ? 'Replace' : 'Add photo'}</button>
                  <button type="button" class="tool-btn" id="consentPhotoClear" onclick="clearConsentPhoto()" style="display:none">Remove</button>
                </div>
              </div>
              <input type="file" id="p_consentphoto" accept="image/*" capture="environment" style="display:none" onchange="handleConsentPhotoPick(this)">
            </div>
          </div>
        </div>
        <button type="button" class="save" id="saveProfileBtn" onclick="handleProfileSave('${editing ? editing.id : ''}')">${ editing ? 'Save changes' : 'Save info'}</button>
      </fieldset></form>`;
  if(bare) return body;
  return `
    <div class="panel primary">
      <h2 class="panel-title">${ICON.edit} ${editing ? 'Edit child' : 'Add a child'}</h2>
      ${body}
    </div>`;
}
function wirePhotoState(){ /* placeholder for any post-paint wiring; photo input is inline */ }
// Reveal/hide the free-text box when the roster picker switches to/from "Other".
function onFilledByChange(sel){
  const other = document.getElementById('p_filledby_other');
  if(!other) return;
  if(sel.value === '__other__'){ other.style.display = ''; other.focus(); }
  else { other.style.display = 'none'; }
}
// Resolve the chosen "Filled by" name from the picker (or the Other text box).
function readFilledBy(){
  const sel = document.getElementById('p_filledby_sel');
  if(!sel) return '';
  if(sel.value === '__other__'){
    return ((document.getElementById('p_filledby_other')||{}).value || '').trim();
  }
  return sel.value || '';
}
function handlePhotoPick(input){
  const file = input.files && input.files[0];
  if(!file) return;
  downscaleImage(file, 160).then(dataUrl=>{
    pendingPhoto = dataUrl;
    const img = document.getElementById('photoImg');
    if(img){
      const fresh = document.createElement('img');
      fresh.id = 'photoImg'; fresh.className = 'photo-preview'; fresh.src = dataUrl; fresh.alt = 'Selected photo';
      img.replaceWith(fresh);
    }
    const clr = document.getElementById('photoClear'); if(clr) clr.style.display = '';
  }).catch(()=>toast('Could not read that image.'));
}
function clearPhoto(){
  pendingPhoto = null;
  const img = document.getElementById('photoImg');
  if(img){
    const fresh = document.createElement('span');
    fresh.id = 'photoImg'; fresh.className = 'photo-preview'; fresh.innerHTML = ICON.user;
    img.replaceWith(fresh);
  }
  const clr = document.getElementById('photoClear'); if(clr) clr.style.display = 'none';
  const file = document.getElementById('p_photo'); if(file) file.value = '';
}
/* ---- CONSENT EVIDENCE: photo of the signed paper form + optional serial.
   The tick is the teacher's attestation; the photo makes it AUDITABLE without
   visiting the school's paper file. Stored like video: a JPEG file in app Data
   under consent/, keyed by researchId — the profile holds only the filename.
   WITHDRAWAL DOES NOT DELETE IT (it is the evidence consent existed); child
   deletion and device wipe do. ---- */
let pendingConsentPhoto = null;   // staged dataURL before Save info
function handleConsentPhotoPick(input){
  const file = input.files && input.files[0];
  if(!file) return;
  // 1400px keeps handwriting/signatures readable at ~200–400 KB.
  downscaleImage(file, 1400).then(dataUrl=>{
    pendingConsentPhoto = dataUrl;
    const nameEl = document.getElementById('consentPhotoName');
    if(nameEl) nameEl.textContent = 'Photo ready — saved with this child';
    const clr = document.getElementById('consentPhotoClear'); if(clr) clr.style.display = '';
  }).catch(()=>toast('Could not read that photo.'));
}
function clearConsentPhoto(){
  pendingConsentPhoto = null;
  const nameEl = document.getElementById('consentPhotoName');
  if(nameEl) nameEl.textContent = 'No photo attached';
  const clr = document.getElementById('consentPhotoClear'); if(clr) clr.style.display = 'none';
  const f = document.getElementById('p_consentphoto'); if(f) f.value = '';
}
// Write the staged form photo to app Data. Returns filename, or '' on web
// preview / failure (same stance as video: web persists no bytes).
async function writeConsentPhoto(researchId, dataUrl){
  const cap = window.Capacitor;
  if(!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return '';
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g,'-');
    const filename = `consent/${researchId}_${stamp}.jpg`;
    const base64 = String(dataUrl).split(',')[1] || '';
    await cap.Plugins.Filesystem.writeFile({ path: filename, data: base64, directory: 'DATA', recursive: true });
    return filename;
  } catch(e){ console.warn('Consent photo store failed', e); return ''; }
}
// Full-screen viewer so an auditor can SEE the signed form from the app.
async function viewConsentPhoto(profileId){
  const p = profileById(profileId);
  if(!p || !p.videoConsentFormPhoto){ toast('No form photo on file.'); return; }
  const cap = window.Capacitor;
  if(!cap || !cap.isNativePlatform || !cap.isNativePlatform()){
    toast('Form photo is stored on the device (not available in web preview).'); return;
  }
  try {
    const res = await cap.Plugins.Filesystem.readFile({ path: p.videoConsentFormPhoto, directory: 'DATA' });
    const overlay = document.createElement('div');
    overlay.className = 'evidence-overlay';
    overlay.innerHTML = `<img alt="Photo of the signed consent form" src="data:image/jpeg;base64,${res.data}">
      <button type="button" class="tool-btn evidence-close">Close</button>`;
    overlay.querySelector('.evidence-close').onclick = ()=>overlay.remove();
    overlay.onclick = (e)=>{ if(e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  } catch(e){ toast('Could not open the form photo — the file may have been removed.'); }
}
// Reveal/hide the verifiable-consent sub-fields with the checkbox.
function toggleConsentFields(cb){
  const sub = document.getElementById('consentSub');
  if(!sub) return;
  sub.style.display = cb.checked ? '' : 'none';
  if(cb.checked){ const by = document.getElementById('p_consentby'); if(by) by.focus(); }
}
async function handleProfileSave(existingId){
  const name = (document.getElementById('p_name').value || '').trim();
  if(!name){ toast('Please enter the child\u2019s name.'); return; }
  // Consent validation: a tick without WHO and RELATION is not verifiable
  // consent (DPDP Rule 10) \u2014 refuse the save until both are filled.
  const consentChecked = !!(document.getElementById('p_videoconsent') || {}).checked;
  const consentBy  = ((document.getElementById('p_consentby')||{}).value || '').trim();
  const consentRel = (document.getElementById('p_consentrel')||{dataset:{}}).dataset.value || '';
  if(consentChecked && !consentBy){ toast('Enter the guardian\u2019s name who gave video consent.'); return; }
  if(consentChecked && !consentRel){ toast('Pick the guardian\u2019s relation to the child.'); return; }
  const btn = document.getElementById('saveProfileBtn');
  if(btn){ btn.disabled = true; setTimeout(()=>{ if(btn) btn.disabled=false; }, 300); }
  // >>> CLOUD ENROLMENT (Architecture A) — server-assigned child ID. <<<
  // With CLOUD_SYNC on, a NEW child is enrolled through the enrol_child() RPC:
  // the SERVER mints research_id and creates the children row (school stamped
  // from the signed-in teacher's JWT), so a second device can later join on the
  // same ID. Online-only BY DESIGN (R&D decision locked 2026-07-03): one moment
  // of connectivity per child, at enrolment; assessments stay offline. EDITS to
  // an existing child stay local — their researchId is preserved below.
  // newResearchId() is the LEGACY/MIGRATION path only: flag OFF, or a pre-cloud
  // profile that never got an ID.
  let cloudResearchId = '';
  if(Cloud.enabled() && !existingId){
    const res = await Cloud.enrolChild({
      name,
      dob:    (document.getElementById('p_dob').value    || '').trim(),
      height: (document.getElementById('p_height').value || '').trim(),
      weight: (document.getElementById('p_weight').value || '').trim(),
      hand: document.getElementById('p_hand').dataset.value || '',
      filledBy: readFilledBy(),
      consent: consentChecked,
      consentBy: consentBy,
      consentRelation: consentRel,
      consentMethod: consentChecked ? ((document.getElementById('p_consentmethod')||{}).value || 'Signed paper form') : ''
    });
    if(!res.ok){
      if(btn) btn.disabled = false;
      toast(res.offline
        ? 'No internet — a new child can only be enrolled online (their ID comes from the server). Connect and try again. Existing children keep working offline.'
        : 'Could not enrol this child: ' + res.error + '. Make sure you signed in while online, then try again.');
      return;
    }
    cloudResearchId = res.researchId;
  }
  const profile = {
    id: existingId || newProfileId(),
    // Pseudonym minted ONCE at enrolment and preserved across edits. Records key
    // off this, not the name below. Preserving on edit is load-bearing: re-minting
    // would orphan every record already linked to the old researchId.
    // Cloud path: cloudResearchId (server-minted, above) wins for new children.
    researchId: (existingId ? (profileById(existingId)||{}).researchId : '') || cloudResearchId || newResearchId(),
    schemaVersion: SCHEMA_VERSION,
    name,
    dob: (document.getElementById('p_dob').value || '').trim(),
    height: (document.getElementById('p_height').value || '').trim(),
    weight: (document.getElementById('p_weight').value || '').trim(),
    dominantHand: document.getElementById('p_hand').dataset.value || '',
    filledBy: readFilledBy(),
    photo: pendingPhoto || '',
    capturedOn: existingId ? (profileById(existingId)||{}).capturedOn || new Date().toISOString() : new Date().toISOString()
  };
  // ---- Per-child guardian VIDEO CONSENT envelope (DPDP §6 + Rule 10) ----
  // Grant: stamp who/relation/method/when. Re-grant after a withdrawal is a
  // FRESH consent (new videoConsentOn, withdrawnOn cleared). Withdrawal: keep
  // the original grant fields as the audit record and stamp withdrawnOn —
  // never wipe history, or there is no evidence consent ever existed.
  const prev = existingId ? (profileById(existingId) || {}) : {};
  if(consentChecked){
    profile.videoConsent         = true;
    profile.videoConsentBy       = consentBy;
    profile.videoConsentRelation = consentRel;
    profile.videoConsentMethod   = (document.getElementById('p_consentmethod')||{}).value || 'Signed paper form';
    profile.videoConsentOn       = (prev.videoConsent ? prev.videoConsentOn : '') || new Date().toISOString();
    profile.videoConsentWithdrawnOn = '';
  } else {
    profile.videoConsent         = false;
    profile.videoConsentBy       = prev.videoConsentBy || '';
    profile.videoConsentRelation = prev.videoConsentRelation || '';
    profile.videoConsentMethod   = prev.videoConsentMethod || '';
    profile.videoConsentOn       = prev.videoConsentOn || '';
    profile.videoConsentWithdrawnOn = prev.videoConsent
      ? new Date().toISOString()                        // this save IS the withdrawal
      : (prev.videoConsentWithdrawnOn || '');
  }
  // Consent EVIDENCE (photo of the signed form + serial). Evidence survives
  // withdrawal — it proves consent existed for what was already recorded.
  profile.videoConsentFormSerial = consentChecked
    ? (((document.getElementById('p_consentserial')||{}).value || '').trim() || prev.videoConsentFormSerial || '')
    : (prev.videoConsentFormSerial || '');
  // Write only when the photo has a consent context (currently ticked, or a
  // prior grant it evidences) — a photo staged then unticked before save must
  // not park guardian PII on a child with no consent claim at all.
  if(pendingConsentPhoto && (consentChecked || prev.videoConsent)){
    const newPhoto = await writeConsentPhoto(profile.researchId, pendingConsentPhoto);
    if(newPhoto && prev.videoConsentFormPhoto) await deleteVideoFile(prev.videoConsentFormPhoto); // replaced → old file goes
    profile.videoConsentFormPhoto = newPhoto || prev.videoConsentFormPhoto || '';
  } else {
    profile.videoConsentFormPhoto = prev.videoConsentFormPhoto || '';
  }
  // Withdrawal + stored clips → offer erasure (DPDP §6(6)/§12). Processing
  // before withdrawal was lawful, so keeping the clips is permitted — but the
  // guardian can ask for erasure, so the teacher gets the choice right here.
  const isWithdrawal = !!prev.videoConsent && !consentChecked;
  let eraseAfterSave = false;
  if(isWithdrawal){
    const clips = videoFilenamesForProfile(profile.id);
    if(clips.length){
      eraseAfterSave = window.confirm(
        `Consent withdrawn. ${clips.length} video ${clips.length===1?'clip is':'clips are'} already stored for ${name}.\n\n` +
        'OK — also delete the stored clips now (recommended if the guardian asked for erasure).\n' +
        'Cancel — keep clips already taken; only future video is blocked.');
    }
  }
  const ok = await upsertProfile(profile);
  if(!ok){
    toast('Could not save — storage may be full. Export your data, then try again.');
    return;
  }
  if(eraseAfterSave){
    const n = await eraseVideosForProfile(profile.id);
    toast(`Consent withdrawn — ${n} video ${n===1?'clip':'clips'} deleted.`);
  }
  // A newly added child becomes the active one.
  await setActiveProfileId(profile.id);
  await setStudent(profile.name);
  pendingPhoto = null;
  pendingConsentPhoto = null;
  toast(existingId ? 'Child updated' : 'Child saved');
  // After an edit, return to that child's detail; after an add, to the list —
  // unless the add originated from the activity child-picker, in which case go
  // back there with the new child already active and ready to run.
  if(existingId){ showChildDetail(profile.id, { dir:'none' }); }
  else if(pendingPickerReturn){
    const ctx = pendingPickerReturn; pendingPickerReturn = null;
    // A child added mid-roster joins the batch PRE-SELECTED and marked New —
    // the teacher asked for them, so don't make them tap the face again.
    if(!rosterSel.includes(profile.id)) rosterSel.push(profile.id);
    showChildPicker(ctx.catIndex, ctx.actIndex, 'none', { skipLedeFocus:true, newId: profile.id });
  }
  else showStudents('none');
}
/* ---------------------------------------------------------------------------
   SOP AUDIO — multi-language narration.
   Two paths, in priority order:
     1. act.sopTranslations present → language switcher + derived audio path.
        Files are produced by generate-audio.js and named audio/{id}_{lang}.mp3.
        This derived-path convention is the contract between the script and the
        app — change it in BOTH places or neither.
     2. act.audioFile present (legacy single-file) → play it directly.
     3. neither → the dashed placeholder.
   The chosen language is remembered through the Store seam (key 'audioLang').
   --------------------------------------------------------------------------- */
const AUDIO_LANGS = [
  // English first = the DEFAULT narration. It is spoken from the on-screen
  // sop[] itself (no translation needed), so every activity can have it.
  { code:'en', label:'English' },
  { code:'hi', label:'हिन्दी' },   // Hindi
  { code:'ta', label:'தமிழ்' },    // Tamil
  { code:'bn', label:'বাংলা' },    // Bengali
];
const AUDIO_LANG_KEY = 'audioLang';
function getAudioLang(){
  const v = Store.getString(AUDIO_LANG_KEY, '');
  return AUDIO_LANGS.some(l=>l.code===v) ? v : AUDIO_LANGS[0].code;
}
function audioPathFor(activityId, lang){ return `audio/${activityId}_${lang}.mp3`; }
function buildAudioHtml(act){
  // The switcher renders whenever narration is POSSIBLE: any activity with
  // sop[] can have English narration (spoken from the steps themselves);
  // sopTranslations only gates the other languages.
  if(act.sopTranslations || (act.sop && act.sop.length)){
    const tr = act.sopTranslations || {};
    const cur = getAudioLang();
    const buttons = AUDIO_LANGS.map(l=>{
      // English narrates the sop[] itself; other languages need a translation.
      const has = l.code==='en' ? !!(act.sop && act.sop.length)
                                : !!(tr[l.code] && tr[l.code].length);
      // Languages with no translation text yet are shown disabled (no audio file will exist).
      return `<button type="button" onclick="switchAudioLang('${act.id}','${l.code}',this)" aria-pressed="${l.code===cur}" ${has?'':'disabled'}>${l.label}</button>`;
    }).join('');
    const src = audioPathFor(act.id, cur);
    // onerror → if the derived file isn't bundled yet, fall back to the placeholder text in-place.
    return `<div class="audio-lang">
      <span class="audio-lang-label">SOP narration — choose a language</span>
      <div class="seg" role="group" aria-label="Audio language">${buttons}</div>
      <audio id="sopAudio" controls src="${src}" onerror="audioMissing()"></audio>
      <div class="media-slot" id="sopAudioMissing" style="display:none">${ICON.audio}<span>Audio for this language isn't generated yet — run generate-audio.js, then rebuild.</span></div>
    </div>`;
  }
  if(act.audioFile){
    return `<audio controls src="${esc(act.audioFile)}" style="width:100%;margin-top:16px;"></audio>`;
  }
  return `<div class="media-slot">${ICON.audio}<span>Audio narration slot — add sopTranslations (or audioFile) in activities.js once generated.</span></div>`;
}
async function switchAudioLang(activityId, lang, btn){
  await Store.setString(AUDIO_LANG_KEY, lang);
  // Update pressed state on the buttons.
  const group = btn.parentElement;
  [...group.children].forEach(b=>b.setAttribute('aria-pressed','false'));
  btn.setAttribute('aria-pressed','true');
  // Swap the audio source and reset the missing-fallback.
  const audio = document.getElementById('sopAudio');
  const missing = document.getElementById('sopAudioMissing');
  if(missing) missing.style.display = 'none';
  if(audio){ audio.style.display = ''; audio.src = audioPathFor(activityId, lang); audio.load(); }
}
function audioMissing(){
  const audio = document.getElementById('sopAudio');
  const missing = document.getElementById('sopAudioMissing');
  if(audio) audio.style.display = 'none';
  if(missing) missing.style.display = '';
}
/* ---------------------------------------------------------------------------
   CHILD PICKER (screen between an activity tap and the run screen).
   "Who are we working with?" — a Netflix-style face grid. Tapping a child sets
   them active and continues into the activity. A dashed tile adds a new child
   inline (reusing profileFormMarkup); on save we return here with the new child
   active. The ? in the lede row reveals the activity's step sequence.
   --------------------------------------------------------------------------- */
let pendingPickerReturn = null; // {catIndex, actIndex} — set while adding a child from the picker
/* BATCH ROSTER (2026-07-21, replaces the single-child picker): activities run
   in batches, so the face grid is now a MULTI-select. Tap faces to build the
   roster, then one CTA starts the activity with everyone selected. A solo
   session is simply a batch of one — one flow, one mental model. */
let rosterSel = [];   // profileIds ticked in the picker (survives add-student round-trips)
let batchRoster = []; // the roster locked in when Start is tapped; consumed by showActivity
function showChildPicker(catIndex, actIndex, dir, opts){
  opts = opts || {};
  const cat = ACTIVITY_DATA[catIndex];
  if(!cat){ showActivityList('back'); return; }
  const act = cat.activities[actIndex];
  if(!act){ showCategory(catIndex,'back'); return; }
  // Group activities never pick a child — anything that lands here by an old
  // path is forwarded to the record screen, same as the category card.
  if(act.group){ showActivity(catIndex, actIndex, { dir: dir || 'fwd' }); return; }
  state = { category:catIndex, activity:actIndex };
  crumbEl.textContent = act.name;
  backBtn.style.display = 'flex';
  backBtn.onclick = ()=>showCategory(catIndex,'back');
  homeDot.innerHTML = ICON.home;
  themeFor(catIndex);

  const profiles = loadProfiles();
  // Drop selections whose child no longer exists (deleted between visits).
  rosterSel = rosterSel.filter(id=>profiles.some(p=>p.id===id));
  // No children yet → drop straight into the add form, same as the Students screen.
  const formOpen = !!opts.addForm || profiles.length === 0;

  const tiles = profiles.map(p=>{
    const face = p.photo
      ? `<img class="face" src="${p.photo}" alt="">`
      : `<span class="face">${esc((p.name||'?').trim().charAt(0).toUpperCase())}</span>`;
    const sel = rosterSel.includes(p.id);
    const isNew = opts.newId === p.id;
    return `<button type="button" class="pick-tile roster-tile${sel?' sel':''}" id="tile_${p.id}"
      aria-pressed="${sel}" onclick="rosterToggle('${p.id}')">
      ${face}<span class="roster-tick" aria-hidden="true">${ICON.check}</span>
      ${isNew ? '<span class="roster-new">New</span>' : ''}
      <span class="pick-name">${esc(p.name)}</span>
    </button>`;
  }).join('');

  // ? help — the SAME reference sheet as the record screen (demo, steps, note,
  // narration), fully hidden until the ? is used.
  const sopBlock = buildRefSheet(act, 'pickerRefSheet');

  // Single add path: the "Add a new student" disclosure below the grid. A child
  // added from HERE joins the roster pre-selected (see handleProfileSave).
  const addForm = `<details class="disclosure" id="pickerAddForm" ${formOpen?'open':''}>
      <summary>${ICON.plus}<span class="disclosure-label">Add a new student</span><span class="chev">${ICON.chevron}</span></summary>
      <div class="sop-body"><div class="sop-inner">${profileFormMarkup(null, true)}</div></div>
    </details>`;

  // Context so handleProfileSave knows to come back to THIS picker, not the list.
  pendingPickerReturn = { catIndex, actIndex };

  paint(`
    <div class="lede-row">
      <h1 class="lede">${esc(act.name)}<small>Who is doing this activity? Tap everyone taking part.</small></h1>
      <button type="button" class="help-btn" aria-label="How to run ${esc(act.name)} — demo, steps and narration"
        aria-haspopup="dialog" aria-expanded="false" onclick="toggleRefSheet(this,'pickerRefSheet')">?</button>
    </div>
    ${sopBlock}
    ${profiles.length ? `
      <div class="roster-selbar">
        <span class="roster-count" id="rosterCount" aria-live="polite"></span>
        <button type="button" class="roster-all" id="rosterAllBtn" onclick="rosterSelectAll()">Select all</button>
      </div>
      <div class="picker-grid">${tiles}</div>` : ''}
    ${addForm}
    ${profiles.length ? `<button type="button" class="save roster-cta" id="rosterCta" onclick="startBatch(${catIndex},${actIndex})"></button>` : ''}
  `, dir || 'fwd', true, { skipLedeFocus: !!opts.skipLedeFocus });

  rosterPaintCount();
  // When there are no children at all, the add form is the only path — open it
  // and the SOP stays available behind the ?.
  if(formOpen && profiles.length === 0){
    const d = document.getElementById('pickerAddForm'); if(d) d.open = true;
  }
}
function rosterToggle(id){
  const i = rosterSel.indexOf(id);
  if(i === -1) rosterSel.push(id); else rosterSel.splice(i,1);
  const tile = document.getElementById('tile_'+id);
  if(tile){ tile.classList.toggle('sel', i === -1); tile.setAttribute('aria-pressed', i === -1 ? 'true' : 'false'); }
  rosterPaintCount();
}
function rosterSelectAll(){
  const all = loadProfiles().map(p=>p.id);
  const everyone = rosterSel.length === all.length;
  rosterSel = everyone ? [] : all; // toggles: Select all ⇄ Clear
  all.forEach(id=>{
    const t = document.getElementById('tile_'+id);
    if(t){ t.classList.toggle('sel', !everyone); t.setAttribute('aria-pressed', String(!everyone)); }
  });
  rosterPaintCount();
}
// One place keeps the count line, the Select-all label and the CTA honest.
function rosterPaintCount(){
  const total = loadProfiles().length;
  const n = rosterSel.length;
  const cnt = document.getElementById('rosterCount');
  if(cnt) cnt.textContent = `${n} of ${total} selected`;
  const allBtn = document.getElementById('rosterAllBtn');
  if(allBtn) allBtn.textContent = (n === total && total > 0) ? 'Clear' : 'Select all';
  const cta = document.getElementById('rosterCta');
  if(cta){
    cta.textContent = n ? `Start with ${n} ${n===1?'student':'students'}` : 'Select at least one student';
    cta.disabled = !n;
  }
}
async function startBatch(catIndex, actIndex){
  if(!rosterSel.length) return;
  batchRoster = rosterSel.slice();
  pendingPickerReturn = null;
  // Batch of ONE keeps full parity with the old solo flow (incl. the video
  // evidence control, which is consent-gated per child via the active profile).
  if(batchRoster.length === 1){
    await setActiveProfileId(batchRoster[0]);
    const p = profileById(batchRoster[0]);
    if(p) await setStudent(p.name);
  }
  showActivity(catIndex, actIndex, { dir:'fwd' });
}
/* ---------------------------------------------------------------------------
   REFERENCE SHEET — the content behind the ? on BOTH the child picker and the
   record screen. One builder, one toggle, so the two ? buttons are identical:
   demo video → step sequence → facilitator note → Sarvam narration switcher.
   `domId` differentiates the two instances (they never coexist on one screen).

   DESIGN CHANGE 2026-07-15: the ? no longer expands inline. Every ? in the
   app now opens the SAME animated popup (see helpPopup below), so the help
   experience is identical on the category, picker and record screens. The
   builder stashes the content in a hidden div; toggleRefSheet MOVES it into
   the popup on open and returns it on close (moving, not cloning, keeps any
   playing narration/demo element intact and its inline handlers wired).
   --------------------------------------------------------------------------- */
function buildRefSheet(act, domId){
  const sopSteps = act.sop.map(s=>`<li>${esc(s)}</li>`).join('');
  const noteHtml = act.facilitatorNote ? `<div class="note"><strong>Facilitator note</strong>${esc(act.facilitatorNote)}</div>` : '';
  const audioHtml = buildAudioHtml(act);
  const demoVideoHtml = act.videoFile
    ? `<div class="ref-block"><span class="section-label">Demonstration</span><video controls src="${esc(act.videoFile)}" style="width:100%;margin-top:10px;border-radius:14px;"></video></div>`
    : `<div class="ref-block"><span class="section-label">Demonstration</span><div class="media-slot">${ICON.video}<span>Demo video slot — add a filename in activities.js (videoFile) when available.</span></div></div>`;
  return `<div class="ref-src" id="${domId}" data-help-title="${esc(act.name)}" hidden>
        ${demoVideoHtml}
        <h2 class="section-label">Sequence of procedure</h2><ol class="sop-list">${sopSteps}</ol>
        ${noteHtml}
        ${audioHtml}
    </div>`;
}
/* ---- HELP POPUP — one dialog, lazily created, shared by every ? ---------- */
let helpPopupState = null; // { src, opener } while open — where to return content/focus
function ensureHelpPopup(){
  let ov = document.getElementById('helpOverlay');
  if(ov) return ov;
  ov = document.createElement('div');
  ov.id = 'helpOverlay'; ov.className = 'help-overlay'; ov.hidden = true;
  ov.innerHTML = `
    <div class="help-card" role="dialog" aria-modal="true" aria-labelledby="helpPopupTitle">
      <div class="help-handle" aria-hidden="true"></div>
      <div class="help-card-head">
        <h2 class="help-card-title" id="helpPopupTitle"></h2>
        <button type="button" class="help-close" aria-label="Close help" onclick="closeRefSheet()">${ICON.close}</button>
      </div>
      <div class="help-card-body" id="helpPopupBody"></div>
    </div>`;
  // Tap the dimmed backdrop (not the card) to dismiss.
  ov.addEventListener('click', e=>{ if(e.target === ov) closeRefSheet(); });
  const card = ov.querySelector('.help-card');
  const body = ov.querySelector('.help-card-body');
  // Header hairline appears only once content actually scrolls beneath it.
  body.addEventListener('scroll', ()=>{ card.classList.toggle('is-scrolled', body.scrollTop > 4); }, {passive:true});
  // Swipe-down on the handle/header dismisses the sheet (phones). The card
  // tracks the finger 1:1; past the threshold the closing transition takes
  // over FROM the dragged position, otherwise it springs back.
  let dragFrom = null, dragY = 0;
  const onDragStart = e=>{ dragFrom = e.touches[0].clientY; dragY = 0; card.style.transition = 'none'; };
  const onDragMove = e=>{
    if(dragFrom === null) return;
    dragY = Math.max(0, e.touches[0].clientY - dragFrom);
    card.style.transform = 'translateY(' + dragY + 'px)';
  };
  const onDragEnd = ()=>{
    if(dragFrom === null) return;
    const y = dragY; dragFrom = null; dragY = 0;
    if(y > 80){
      closeRefSheet(); // removes .open + adds .closing (transition re-enabled next frame)
      requestAnimationFrame(()=>{ card.style.transition = ''; card.style.transform = ''; });
    } else {
      card.style.transition = ''; card.style.transform = ''; // spring back
    }
  };
  const head = ov.querySelector('.help-card-head');
  const handle = ov.querySelector('.help-handle');
  [head, handle].forEach(el=>{
    el.addEventListener('touchstart', onDragStart, {passive:true});
    el.addEventListener('touchmove', onDragMove, {passive:true});
    el.addEventListener('touchend', onDragEnd);
    el.addEventListener('touchcancel', onDragEnd);
  });
  document.body.appendChild(ov);
  return ov;
}
/* ---- DEMO PLAYER — tap the ▶ badge on a card, the clip plays right there --
   Same overlay surface as the help popup. Built fresh per open and removed on
   close (no stale video elements holding memory); Esc / backdrop / ✕ close it
   and always pause first. stopPropagation keeps the card tap (navigation)
   and the badge tap (play) from firing together. */
function demoEscListener(e){ if(e.key === 'Escape') closeDemoPopup(); }
function closeDemoPopup(instant){
  const ov = document.getElementById('demoOverlay');
  if(!ov) return;
  const v = ov.querySelector('video');
  if(v){ try{ v.pause(); }catch(_){} }
  document.body.style.overflow = '';
  document.removeEventListener('keydown', demoEscListener);
  ov.classList.remove('open'); ov.classList.add('closing');
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(instant || reduced){ ov.remove(); } else { setTimeout(()=>ov.remove(), 240); }
}
function playDemo(el, ev){
  if(ev) ev.stopPropagation();
  const file = el.getAttribute('data-video');
  if(!file) return;
  closeDemoPopup(true); // never two players
  const ov = document.createElement('div');
  ov.id = 'demoOverlay'; ov.className = 'help-overlay';
  ov.innerHTML = `
    <div class="help-card video-card" role="dialog" aria-modal="true" aria-labelledby="demoPopupTitle">
      <div class="help-card-head">
        <h2 class="help-card-title" id="demoPopupTitle"></h2>
        <button type="button" class="help-close" aria-label="Close video" onclick="closeDemoPopup()">${ICON.close}</button>
      </div>
      <video class="demo-video" controls autoplay playsinline></video>
    </div>`;
  // textContent / property assignment — titles and filenames stay inert.
  ov.querySelector('#demoPopupTitle').textContent = el.getAttribute('data-title') || 'Demonstration';
  ov.querySelector('video').src = file;
  ov.addEventListener('click', e=>{ if(e.target === ov) closeDemoPopup(); });
  document.body.appendChild(ov);
  requestAnimationFrame(()=> requestAnimationFrame(()=> ov.classList.add('open')));
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', demoEscListener);
  ov.querySelector('.help-close').focus({preventScroll:true});
}
/* ---- CONFIRM DIALOG — styled replacement for window.confirm() ------------
   Same cuboid card + motion as the help popup, so destructive moments feel
   like part of the app instead of a browser interruption. Best-practice
   shape: consequences stated with REAL COUNTS, Cancel is the focused
   default, the destructive button is rust-red, and irreversible bulk
   actions demand an explicit "I understand" tick before the button arms.
   Returns a Promise<boolean> — await it exactly like window.confirm. */
function askConfirm(opts){
  return new Promise(resolve=>{
    const prev = document.getElementById('confirmOverlay');
    if(prev) prev.remove();
    const ov = document.createElement('div');
    ov.id = 'confirmOverlay'; ov.className = 'help-overlay';
    const ackHtml = opts.ack
      ? `<label class="confirm-ack"><input type="checkbox" id="confirmAck"><span>${opts.ack}</span></label>`
      : '';
    ov.innerHTML = `
      <div class="help-card confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="confirmTitle" aria-describedby="confirmBody">
        <div class="help-card-head"><h2 class="help-card-title" id="confirmTitle">${opts.title}</h2></div>
        <div class="help-card-body">
          <p class="confirm-body" id="confirmBody">${opts.body}</p>
          ${opts.extra || ''}
          ${ackHtml}
          <div class="confirm-actions">
            <button type="button" class="confirm-cancel" id="confirmCancel">${opts.cancelLabel || 'Cancel'}</button>
            <button type="button" class="save confirm-go ${opts.danger ? 'danger-btn' : ''}" id="confirmGo" ${opts.ack ? 'disabled' : ''}>${opts.confirmLabel || 'Confirm'}</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const settle = val=>{
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      ov.classList.remove('open'); ov.classList.add('closing');
      setTimeout(()=>{ ov.remove(); resolve(val); }, 240);
    };
    const onKey = e=>{ if(e.key === 'Escape') settle(false); };
    ov.addEventListener('click', e=>{ if(e.target === ov) settle(false); });
    ov.querySelector('#confirmCancel').onclick = ()=>settle(false);
    ov.querySelector('#confirmGo').onclick = ()=>settle(true);
    if(opts.ack){
      ov.querySelector('#confirmAck').addEventListener('change', e=>{
        ov.querySelector('#confirmGo').disabled = !e.target.checked;
      });
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(()=> requestAnimationFrame(()=> ov.classList.add('open')));
    ov.querySelector('#confirmCancel').focus({preventScroll:true}); // safe default
  });
}
// One keydown handler while open: Esc dismisses, Tab is trapped inside the
// dialog (cycles through the card's own controls — close, video, narration).
function helpKeyListener(e){
  if(e.key === 'Escape'){ closeRefSheet(); return; }
  if(e.key !== 'Tab') return;
  const ov = document.getElementById('helpOverlay');
  if(!ov || ov.hidden) return;
  const focusables = ov.querySelectorAll('button, [href], input, select, textarea, video[controls], audio[controls], [tabindex]:not([tabindex="-1"])');
  if(!focusables.length) return;
  const first = focusables[0], last = focusables[focusables.length - 1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
}
// Give borrowed content back to its hidden home (if that screen still exists).
function restoreHelpContent(){
  const ov = document.getElementById('helpOverlay');
  if(!ov) return;
  const body = ov.querySelector('#helpPopupBody');
  if(helpPopupState && helpPopupState.src && document.contains(helpPopupState.src)){
    while(body.firstChild) helpPopupState.src.appendChild(body.firstChild);
  } else {
    body.innerHTML = '';
  }
  helpPopupState = null;
}
// The one entry point every ? button calls. Same name as the old inline
// toggle so the mental model ("? toggles the reference sheet") survives.
// The popup title rides on the source div (data-help-title) — set by the
// builders — so no name ever passes through an inline onclick string.
function toggleRefSheet(btn, domId){
  const src = document.getElementById(domId);
  if(!src) return;
  const ov = ensureHelpPopup();
  if(!ov.hidden){ closeRefSheet(); return; } // ? acts as close while open
  restoreHelpContent(); // safety: reclaim anything a previous screen left behind
  const body = ov.querySelector('#helpPopupBody');
  while(src.firstChild) body.appendChild(src.firstChild);
  ov.querySelector('#helpPopupTitle').textContent = src.getAttribute('data-help-title') || 'How to run this activity';
  helpPopupState = { src, opener: btn };
  // Fresh start every open: scrolled to the top, no leftover scroll hairline.
  const bodyEl = ov.querySelector('.help-card-body');
  bodyEl.scrollTop = 0;
  ov.querySelector('.help-card').classList.remove('is-scrolled');
  ov.classList.remove('closing');
  ov.hidden = false;
  // Two-frame open so the transition actually runs from the hidden state.
  requestAnimationFrame(()=> requestAnimationFrame(()=> ov.classList.add('open')));
  document.body.style.overflow = 'hidden'; // page behind must not scroll
  btn.setAttribute('aria-expanded','true');
  document.addEventListener('keydown', helpKeyListener);
  const closeBtn = ov.querySelector('.help-close');
  if(closeBtn) closeBtn.focus({preventScroll:true});
}
function closeRefSheet(instant){
  const ov = document.getElementById('helpOverlay');
  if(!ov || ov.hidden) return;
  // Silence any demo video / narration before it goes back to its hidden home.
  ov.querySelectorAll('video,audio').forEach(m=>{ try{ m.pause(); }catch(_){} });
  document.body.style.overflow = '';
  document.removeEventListener('keydown', helpKeyListener);
  const opener = helpPopupState && helpPopupState.opener;
  if(opener && document.contains(opener)){
    opener.setAttribute('aria-expanded','false');
    if(!instant) opener.focus({preventScroll:true});
  }
  const finish = ()=>{ ov.hidden = true; ov.classList.remove('closing'); restoreHelpContent(); };
  ov.classList.remove('open');
  ov.classList.add('closing'); // exit runs shorter + accelerating (see CSS)
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(instant || reduced){ finish(); } else { setTimeout(finish, 240); } // matches CSS .22s exit
}
/* ---------------------------------------------------------------------------
   SOUND LIBRARY (soundboard) — rendered on activities with soundboard:true.
   Plays bundled mp3s from ./sounds, offline, inside the Capacitor WebView (no
   server). One sound at a time; the playing pad carries the category accent.
   Sound list + which activities show it both live in activities.js, so the
   content team controls all of it without touching this file.
   --------------------------------------------------------------------------- */
function buildSoundboard(act){
  if(!act || !act.soundboard) return '';
  if(typeof SOUND_LIBRARY === 'undefined' || !Array.isArray(SOUND_LIBRARY) || !SOUND_LIBRARY.length) return '';
  // Group, preserving first-seen order (matches activities.js authoring order).
  const groups = [];
  SOUND_LIBRARY.forEach((s, i)=>{
    const name = s.group || 'Sounds';
    let g = groups.find(x=>x.name === name);
    if(!g){ g = { name, items:[] }; groups.push(g); }
    g.items.push({ s, i });
  });
  // One group visible at a time (tabs) so the panel height stays fixed no
  // matter how many sounds the content team adds.
  const tabs = groups.map((g,gi)=>`<button type="button" class="sb-tab" role="tab" aria-selected="${gi===0}" aria-controls="sbGroup${gi}" onclick="SB.showGroup(${gi}, this)">${esc(g.name)}</button>`).join('');
  const panels = groups.map((g,gi)=>`
      <div class="sb-gridwrap" id="sbGroup${gi}" role="tabpanel" aria-label="${esc(g.name)}"${gi===0?'':' hidden'}>
        <div class="sb-grid">${g.items.map(({s,i})=>`
          <button type="button" class="sb-pad" data-idx="${i}" aria-pressed="false" aria-label="Play ${esc(s.label)}" onclick="SB.playIdx(${i})">
            <span class="sb-glyph" aria-hidden="true">
              <span class="sb-ico">${ICON.sbSound}</span>
              <span class="sb-eq"><i></i><i></i><i></i></span>
            </span>
            <span class="sb-label">${esc(s.label)}</span>
          </button>`).join('')}</div>
      </div>`).join('');
  return `
    <div class="panel" id="soundboardPanel" data-playing="false">
      <h2 class="panel-title">${ICON.audio} Sound library</h2>
      <p class="sb-hint">Pick a category, tap a sound, then use the player to replay, skip, shuffle or loop. Watch where the child turns — stand about three steps away.</p>
      <div class="sb-tabs" role="tablist" aria-label="Sound categories">${tabs}</div>
      ${panels}
      <div class="sb-player is-idle" id="sbPlayer">
        <div class="sb-track">
          <span class="name" id="sbName">Select a sound</span>
          <span class="grp" id="sbGrp"></span>
        </div>
        <div class="sb-seek">
          <span class="t" id="sbElapsed">0:00</span>
          <div class="sb-progress" id="sbProgress" role="slider" tabindex="0"
               aria-label="Seek position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"
               onclick="SB.seekFromClient(event.clientX)" onkeydown="SB.seekKey(event)">
            <div class="fill" id="sbFill"></div><div class="knob" id="sbKnob"></div>
          </div>
          <span class="t total" id="sbTotal">0:00</span>
        </div>
        <div class="sb-transport">
          <button type="button" class="sb-tbtn toggle" id="sbShuffle" aria-pressed="false" aria-label="Shuffle off" onclick="SB.toggleShuffle()">${ICON.sbShuffle}</button>
          <button type="button" class="sb-tbtn side" id="sbPrev" aria-label="Previous sound" onclick="SB.prev()">${ICON.sbPrev}</button>
          <button type="button" class="sb-tbtn main" id="sbPlay" aria-label="Play" onclick="SB.toggle()">${ICON.sbPlay}</button>
          <button type="button" class="sb-tbtn side" id="sbNext" aria-label="Next sound" onclick="SB.next(true)">${ICON.sbNext}</button>
          <button type="button" class="sb-tbtn toggle" id="sbRepeat" aria-label="Repeat off" onclick="SB.cycleRepeat()">${ICON.sbRepeat}<span class="badge" id="sbRepeatBadge" hidden>1</span></button>
        </div>
      </div>
      <span class="visually-hidden" aria-live="assertive" id="sbLive"></span>
    </div>`;
}
/* Media-player controller for the Sound Library. One <audio> element; the
   library (SOUND_LIBRARY) is the queue. repeat: off → all → one. The category
   accent marks the current track (pad + play button + progress + lit toggles). */
const SB = {
  audio:null, idx:-1, playing:false, shuffle:false, repeat:'off',
  _el(id){ return document.getElementById(id); },
  _ensure(){
    if(SB.audio) return SB.audio;
    const a = new Audio();
    a.addEventListener('timeupdate', SB._onTime);
    a.addEventListener('loadedmetadata', SB._onMeta);
    a.addEventListener('ended', SB._onEnded);
    SB.audio = a; return a;
  },
  showGroup(gi){
    document.querySelectorAll('#soundboardPanel .sb-tab').forEach((t,k)=>t.setAttribute('aria-selected', String(k===gi)));
    document.querySelectorAll('#soundboardPanel .sb-gridwrap').forEach((w,k)=>{ w.hidden = (k!==gi); });
  },
  playIdx(i){ SB.load(i, true); },
  load(i, autoplay){
    if(typeof SOUND_LIBRARY==='undefined' || i<0 || i>=SOUND_LIBRARY.length) return;
    const s = SOUND_LIBRARY[i]; const a = SB._ensure();
    SB.idx = i; a.src = s.file; try{ a.currentTime = 0; }catch(e){}
    const player = SB._el('sbPlayer'); if(player){ player.hidden = false; player.classList.remove('is-idle'); }
    const nm = SB._el('sbName'); if(nm) nm.textContent = s.label;
    const gp = SB._el('sbGrp'); if(gp) gp.textContent = s.group || '';
    SB._fill(0); const el = SB._el('sbElapsed'); if(el) el.textContent = '0:00';
    SB._highlight(i);
    if(autoplay) SB.play(); else SB._setPlaying(false);
    SB._announce((autoplay?'Playing ':'Selected ') + s.label);
  },
  _first(){ return (SB.shuffle && SOUND_LIBRARY.length > 1) ? Math.floor(Math.random()*SOUND_LIBRARY.length) : 0; },
  play(){
    if(SB.idx < 0){ SB.load(SB._first(), true); return; }
    const a = SB._ensure(); const p = a.play(); if(p && p.catch) p.catch(()=>{});
    if(navigator.vibrate) navigator.vibrate(25);
    SB._setPlaying(true);
  },
  pause(){ if(SB.audio) SB.audio.pause(); SB._setPlaying(false); },
  toggle(){ if(SB.idx < 0){ SB.load(SB._first(), true); return; } SB.playing ? SB.pause() : SB.play(); },
  next(user){
    if(typeof SOUND_LIBRARY==='undefined' || !SOUND_LIBRARY.length) return;
    let n;
    if(SB.shuffle && SOUND_LIBRARY.length > 1){ do { n = Math.floor(Math.random()*SOUND_LIBRARY.length); } while(n === SB.idx); }
    else { n = SB.idx + 1; if(n >= SOUND_LIBRARY.length) n = 0; }
    SB.load(n, true);
  },
  prev(){
    const a = SB.audio;
    if(a && a.currentTime > 2){ try{ a.currentTime = 0; }catch(e){} return; }
    let n = SB.shuffle ? SB.idx : SB.idx - 1;
    if(n < 0) n = SOUND_LIBRARY.length - 1;
    SB.load(n, true);
  },
  toggleShuffle(){
    SB.shuffle = !SB.shuffle;
    const b = SB._el('sbShuffle');
    if(b){ b.classList.toggle('on', SB.shuffle); b.setAttribute('aria-pressed', String(SB.shuffle));
      b.setAttribute('aria-label', SB.shuffle ? 'Shuffle on' : 'Shuffle off'); }
    SB._announce('Shuffle ' + (SB.shuffle?'on':'off'));
  },
  cycleRepeat(){
    SB.repeat = SB.repeat==='off' ? 'all' : SB.repeat==='all' ? 'one' : 'off';
    const b = SB._el('sbRepeat'); const badge = SB._el('sbRepeatBadge');
    if(b){ b.classList.toggle('on', SB.repeat !== 'off');
      b.setAttribute('aria-label', SB.repeat==='off'?'Repeat off':SB.repeat==='all'?'Repeat all':'Repeat one'); }
    if(badge) badge.hidden = (SB.repeat !== 'one');
    SB._announce(SB.repeat==='off'?'Repeat off':SB.repeat==='all'?'Repeat all':'Repeat one');
  },
  seekFromClient(clientX){
    const bar = SB._el('sbProgress'); const a = SB.audio;
    if(!bar || !a || !a.duration) return;
    const r = bar.getBoundingClientRect();
    let ratio = (clientX - r.left) / r.width; ratio = Math.max(0, Math.min(1, ratio));
    try{ a.currentTime = ratio * a.duration; }catch(e){}
    SB._fill(ratio*100);
  },
  seekKey(e){
    const a = SB.audio;
    if(e.key===' '||e.key==='Enter'){ SB.toggle(); e.preventDefault(); return; }
    if(!a || !a.duration) return;
    if(e.key==='ArrowRight'){ a.currentTime = Math.min(a.duration, a.currentTime+1); e.preventDefault(); }
    else if(e.key==='ArrowLeft'){ a.currentTime = Math.max(0, a.currentTime-1); e.preventDefault(); }
  },
  _onTime(){
    const a = SB.audio; if(!a) return;
    const pct = a.duration ? (a.currentTime/a.duration)*100 : 0;
    SB._fill(pct);
    const el = SB._el('sbElapsed'); if(el) el.textContent = SB._fmt(a.currentTime);
    const pr = SB._el('sbProgress'); if(pr) pr.setAttribute('aria-valuenow', String(Math.round(pct)));
  },
  _onMeta(){ const a = SB.audio; const t = SB._el('sbTotal'); if(t) t.textContent = SB._fmt(a && isFinite(a.duration) ? a.duration : 0); },
  _onEnded(){
    if(SB.repeat==='one'){ try{ SB.audio.currentTime = 0; }catch(e){} SB.play(); return; }
    if(SB.repeat==='all'){ SB.next(false); return; }
    SB._setPlaying(false); try{ SB.audio.currentTime = 0; }catch(e){}
    SB._fill(0); const el = SB._el('sbElapsed'); if(el) el.textContent = '0:00';
  },
  _setPlaying(on){
    SB.playing = on;
    const btn = SB._el('sbPlay');
    if(btn){ btn.innerHTML = on ? ICON.sbPause : ICON.sbPlay; btn.setAttribute('aria-label', on ? 'Pause' : 'Play'); }
    const panel = SB._el('soundboardPanel'); if(panel) panel.setAttribute('data-playing', String(on));
  },
  _fill(pct){ const f = SB._el('sbFill'); const k = SB._el('sbKnob'); if(f) f.style.width = pct+'%'; if(k) k.style.left = pct+'%'; },
  _highlight(i){ document.querySelectorAll('.sb-pad').forEach(p=>{ p.setAttribute('aria-pressed', String(Number(p.dataset.idx)===i)); }); },
  _announce(msg){ const a = SB._el('sbLive'); if(a) a.textContent = msg; },
  _fmt(sec){ sec = Math.max(0, Math.floor(sec||0)); const m = Math.floor(sec/60); const s = sec%60; return m+':'+(s<10?'0':'')+s; },
  // Stop and fully reset when navigating between screens (no cross-screen audio).
  reset(){
    if(SB.audio){ try{ SB.audio.pause(); }catch(e){}
      SB.audio.removeEventListener('timeupdate', SB._onTime);
      SB.audio.removeEventListener('loadedmetadata', SB._onMeta);
      SB.audio.removeEventListener('ended', SB._onEnded);
    }
    SB.audio = null; SB.idx = -1; SB.playing = false; SB.shuffle = false; SB.repeat = 'off';
  }
};

/* ---------------------------------------------------------------------------
   COMMAND BOARD — rendered on activities with commandBoard:true (Direction).
   Big buttons that SPEAK a movement command (left / right / jump / north …)
   from bundled Sarvam-generated mp3s: audio/commands/{id}_{lang}.mp3.
   Offline, same as all media. Why buttons and not the teacher's voice: every
   child hears the identical cue at identical loudness every time — the
   assessment measures the CHILD's response, not the teacher's delivery.

   The command list lives on the activity in activities.js (content-team
   owned). Language follows the same audioLang the SOP narration uses — one
   language choice everywhere. "Surprise me" plays a random command (never the
   same one twice in a row) so the child can't predict the sequence — the same
   reason the Sound Library has shuffle.
   --------------------------------------------------------------------------- */
function buildCommandBoard(act){
  if(!act || !act.commandBoard || !Array.isArray(act.commands) || !act.commands.length) return '';
  CB.cmds = act.commands; CB.last = -1;
  const pads = act.commands.map((c,i)=>{
    return `<button type="button" class="cmd-pad" data-idx="${i}" aria-pressed="false"
      aria-label="Speak command: ${esc(c.label)}" onclick="CB.play(${i})">
      <span class="cmd-label">${esc(c.label)}</span>
    </button>`;
  }).join('');
  return `
    <div class="panel" id="commandBoardPanel">
      <h2 class="panel-title">${ICON.audio} Command board</h2>
      <p class="cmd-hint">Tap a command — the app speaks it. One command at a time; wait for the movement to finish. Use Surprise me once the child expects a pattern.</p>
      <div class="cmd-grid">${pads}</div>
      <button type="button" class="cmd-surprise" onclick="CB.surprise()">${ICON.sbShuffle} Surprise me</button>
      <span class="visually-hidden" aria-live="assertive" id="cmdLive"></span>
    </div>`;
}
/* One Audio element. Commands are English-only by design (audioLang is for
   SOP narration, not cues); missing file → teacher toast, and the pad still
   flashes so the drill can continue by voice. */
const CB = {
  audio:null, cmds:[], last:-1, _timer:null,
  play(i){
    const c = CB.cmds[i]; if(!c) return;
    if(!CB.audio) CB.audio = new Audio();
    const a = CB.audio;
    a.onerror = null;
    try{ a.pause(); }catch(e){}
    a.src = `audio/commands/${c.id}_en.mp3`;
    a.onerror = ()=>{
      toast(`Audio for “${c.label}” isn’t generated yet — run generate-command-audio.js, then rebuild.`);
    };
    const p = a.play(); if(p && p.catch) p.catch(()=>{});
    if(navigator.vibrate) navigator.vibrate(20);
    CB.last = i;
    CB._flash(i, c.label);
  },
  surprise(){
    if(!CB.cmds.length) return;
    let n;
    if(CB.cmds.length === 1){ n = 0; }
    else { do { n = Math.floor(Math.random()*CB.cmds.length); } while(n === CB.last); }
    CB.play(n);
  },
  _flash(i, label){
    document.querySelectorAll('#commandBoardPanel .cmd-pad').forEach(p=>{
      p.setAttribute('aria-pressed', String(Number(p.dataset.idx)===i));
      p.classList.toggle('is-speaking', Number(p.dataset.idx)===i);
    });
    const live = document.getElementById('cmdLive'); if(live) live.textContent = label;
    clearTimeout(CB._timer);
    CB._timer = setTimeout(()=>{
      document.querySelectorAll('#commandBoardPanel .cmd-pad.is-speaking').forEach(p=>{
        p.classList.remove('is-speaking'); p.setAttribute('aria-pressed','false');
      });
    }, 1600);
  },
  // Stop and fully reset when navigating between screens (no cross-screen audio).
  reset(){
    clearTimeout(CB._timer); CB._timer = null;
    if(CB.audio){ try{ CB.audio.pause(); }catch(e){} CB.audio.onerror = null; }
    CB.audio = null; CB.cmds = []; CB.last = -1;
  }
};
function showActivity(catIndex, actIndex, opts){
  opts = opts || {};
  if(typeof SB !== 'undefined') SB.reset();
  if(typeof CB !== 'undefined') CB.reset();
  const cat = ACTIVITY_DATA[catIndex];
  const act = cat.activities[actIndex];
  state = { category:catIndex, activity:actIndex };
  crumbEl.textContent = cat.category;
  backBtn.style.display = 'flex';
  backBtn.onclick = ()=>{ if(typeof SB !== 'undefined') SB.reset(); if(typeof CB !== 'undefined') CB.reset(); showCategory(catIndex,'back'); };
  homeDot.innerHTML = ICON.home;
  themeFor(catIndex);
  const audioHtml = buildAudioHtml(act);
  const resultLabels = act.dataFields.filter(f=>f.type==='result'||f.type==='mastery').map(f=>f.label);
  const records = loadRecords(act.id);
  const recHtml = records.length ? records.map(r=>renderRecord(r, resultLabels, act.id)).join('') : '<p class="empty">No results logged yet — run the activity, then record below.</p>';
  const isGroup = !!act.group;
  // Non-group activities run on the BATCH ROSTER. No roster (deep link, stale
  // state) → back to the picker; the record sheet is meaningless without one.
  if(!isGroup && !batchRoster.length){ showChildPicker(catIndex, actIndex, opts.dir || 'fwd'); return; }
  const rosterKids = isGroup ? [] : batchRoster.map(id=>profileById(id)).filter(Boolean);
  const solo = !isGroup && rosterKids.length === 1;
  // GROUP mode: one result for the whole group. Otherwise the roster bar names
  // the batch and offers one way back to change it.
  const childBar = isGroup
    ? `<div class="activechild"><span class="avatar">${ICON.user}</span><span class="who">Whole group<small>One result for the group — no child selection</small></span></div>`
    : `<div class="activechild"><span class="avatar">${ICON.user}</span><span class="who">${rosterKids.length} ${rosterKids.length===1?'student':'students'} in this batch<small>${esc(rosterKids.map(p=>p.name).join(', '))}</small></span><button type="button" class="swap" onclick="showChildPicker(${catIndex},${actIndex},'back')">Change</button></div>`;
  // Reset any video staged from a previous record on this screen.
  pendingVideo = null;
  // FORM AREA. Group + solo keep the single flat form (solo = batch of one,
  // full parity incl. video evidence). A batch of 2+ renders the RESULT SHEET:
  // one row per child, big tick = achieved, tap the row for optional detail
  // (the activity's own fields, namespaced per child). Sheet video capture is
  // deliberately absent for 2+ — clips are consent-gated per child and one
  // stage can't hold N gates honestly; solo runs keep the control.
  let formInner, saveBtnHtml;
  if(isGroup || solo){
    const fields = act.dataFields.map(f=>buildField(f)).join('');
    formInner = `${fields}${isGroup ? '' : videoUploadMarkup()}`;
    // Solo = batch of one = the active profile (set in startBatch), so the
    // original handleSave path — including video commit — applies unchanged.
    saveBtnHtml = `<button type="button" class="save" id="saveBtn" onclick="handleSave('${act.id}')">Save result</button>`;
  } else {
    formInner = rosterKids.map(p=>{
      const perChild = act.dataFields.map(f=>buildField(f, '_'+p.id)).join('');
      return `<div class="rkid" id="rrow_${p.id}">
        <div class="rkid-top">
          <button type="button" class="rkid-main" aria-expanded="false" onclick="toggleRosterDetail('${p.id}',this)">
            ${avatarFor(p,'avatar')}<span class="rkid-name">${esc(p.name)}<small id="rsub_${p.id}">Tap for detail</small></span>
          </button>
          <button type="button" class="bigcheck" id="ach_${p.id}" aria-pressed="false"
            aria-label="${esc(p.name)} achieved this activity" onclick="toggleAchieved('${p.id}',this)">${ICON.check}</button>
        </div>
        <div class="rkid-detail" id="rdet_${p.id}" hidden>${perChild}</div>
      </div>`;
    }).join('');
    saveBtnHtml = `<button type="button" class="save" id="saveBtn" onclick="handleBatchSave('${act.id}')">Save results</button>`;
  }
  // The ? sheet: shared with the child picker — demo, steps, note, narration.
  const refSheet = buildRefSheet(act, 'actRefSheet');
  paint(`
    <div class="lede-row">
      <h1 class="lede">${esc(act.name)}<small>${esc(cat.category)}</small></h1>
      <button type="button" class="help-btn" aria-label="How to run ${esc(act.name)} — demo, steps and narration"
        aria-haspopup="dialog" aria-expanded="false" onclick="toggleRefSheet(this,'actRefSheet')">?</button>
    </div>
    ${refSheet}
    ${childBar}
    ${buildSoundboard(act)}
    ${buildCommandBoard(act)}
    <div class="panel primary" id="formPanel">
      <h2 class="panel-title">${ICON.edit} ${isGroup || solo ? 'Record a result' : 'Record results — tick who got it'}</h2>
      <form id="dataForm" onsubmit="return false;"><fieldset><legend class="visually-hidden">Record a result for ${esc(act.name)}</legend>${formInner}${saveBtnHtml}</fieldset></form>
    </div>
    <div class="panel quiet"><h2 class="panel-title">${ICON.list} Past results</h2><div id="recordList">${recHtml}</div></div>
  `, opts.dir || 'fwd', false, { skipLedeFocus: !!opts.focusForm });
  if(!isGroup && !solo) batchPaintSave();
  if(opts.focusForm){
    const panel = document.getElementById('formPanel');
    if(panel){ panel.scrollIntoView({behavior:'smooth', block:'start'}); }
    const firstInput = screen.querySelector('#dataForm input, #dataForm textarea, .seg button');
    if(firstInput){ firstInput.focus({preventScroll:true}); }
  }
}
/* ---------------------------------------------------------------------------
   TEACHER VIDEO CAPTURE — evidence footage attached to a saved result.
   Distinct from the DEMO video (reference, behind the ?). This is the clip the
   teacher films of the CHILD performing the activity, to submit to researchers.

   Storage decision: video is large, so we do NOT base64 it into the Store the
   way profile photos are stored. We copy the picked file into the app's Data
   directory keyed off the child's researchId (pseudonym, never the name), and
   record only { filename, when } on the saved record. The bytes live on disk;
   the record points at them. This is the same seam a future Supabase swap uses
   (upload file → store storage path), so no rework later.
   --------------------------------------------------------------------------- */
let pendingVideo = null; // { tempName, displayName, mime } staged before save
function videoUploadMarkup(){
  // Consent gate (UI layer): no guardian video-consent on this child → no capture
  // control at all. The hard enforcement lives in handleSave/commitPendingVideo;
  // this just keeps the teacher from staging a clip that would be refused.
  const child = getActiveProfile();
  if(!child || !child.videoConsent){
    return `<div class="field video-field">
      <label>Video evidence <span class="field-hint">— optional; filmed by you, sent to researchers</span></label>
      <div class="video-slot video-slot--locked">
        <span class="video-name">Locked — no guardian video-consent on file for this child.</span>
      </div>
      <span class="field-hint">Open this child’s profile (Edit child → Guardian consent for video) to enable video.</span>
    </div>`;
  }
  const has = !!pendingVideo;
  const label = has ? esc(pendingVideo.displayName) : 'No video attached';
  return `<div class="field video-field">
      <label>Video evidence <span class="field-hint">— optional; filmed by you, sent to researchers</span></label>
      <div class="video-slot" id="videoSlot">
        <span class="video-name" id="videoName">${label}</span>
        <div class="video-actions">
          <button type="button" class="tool-btn" onclick="document.getElementById('r_video').click()">${ICON.video} ${has?'Replace':'Add video'}</button>
          <button type="button" class="tool-btn" id="videoClear" onclick="clearPendingVideo()" ${has?'':'style="display:none"'}>Remove</button>
        </div>
      </div>
      <input type="file" id="r_video" accept="video/*" capture="environment" style="display:none" onchange="handleVideoPick(this)">
    </div>`;
}
function handleVideoPick(input){
  const file = input.files && input.files[0];
  if(!file){ return; }
  // Stage metadata only; the actual file copy happens at save time so an
  // abandoned form leaves nothing on disk.
  pendingVideo = { file, displayName: file.name || 'clip.mp4', mime: file.type || 'video/mp4' };
  const nameEl = document.getElementById('videoName');
  if(nameEl) nameEl.textContent = pendingVideo.displayName;
  const clr = document.getElementById('videoClear'); if(clr) clr.style.display = '';
  // Flip the add button label to Replace without a full repaint.
  const addBtn = clr ? clr.previousElementSibling : null;
  if(addBtn) addBtn.innerHTML = `${ICON.video} Replace`;
}
function clearPendingVideo(){
  pendingVideo = null;
  const nameEl = document.getElementById('videoName');
  if(nameEl) nameEl.textContent = 'No video attached';
  const clr = document.getElementById('videoClear'); if(clr) clr.style.display = 'none';
  const file = document.getElementById('r_video'); if(file) file.value = '';
  const addBtn = clr ? clr.previousElementSibling : null;
  if(addBtn) addBtn.innerHTML = `${ICON.video} Add video`;
}
// Copy the staged video into app Data storage, keyed off the child's pseudonym.
// Returns { filename } to stamp on the record, or null on web / no file / error.
async function commitPendingVideo(researchId){
  if(!pendingVideo) return null;
  // Consent chokepoint (enforcement layer): never write video bytes for a child
  // without recorded guardian video-consent. Fail closed — if we can't confirm
  // consent, we refuse. This is the line the UI lock backstops, not the reverse.
  const child = getActiveProfile();
  if(!child || !child.videoConsent){ return null; }
  const cap = window.Capacitor;
  if(!cap || !cap.isNativePlatform || !cap.isNativePlatform()){
    // Web preview has no persistent file store — keep the metadata so the record
    // still reflects that a clip was taken, but no bytes are copied.
    return { filename: `${researchId}_${Date.now()}_${pendingVideo.displayName}`, stored:false };
  }
  const Filesystem = cap.Plugins.Filesystem;
  const stamp = new Date().toISOString().replace(/[:.]/g,'-');
  const ext = (pendingVideo.displayName.split('.').pop() || 'mp4').toLowerCase();
  const filename = `videos/${researchId}_${stamp}.${ext}`;
  try {
    // CHUNKED copy (memory fix): the old path read the WHOLE clip into memory
    // as one base64 string (~1.35x the file size, on top of the Blob) — a long
    // 1080p clip could OOM the WebView and crash Save. Now the file is read in
    // 3 MB slices, each decoded and appended natively, so peak JS memory is one
    // chunk no matter how long the clip is. 3 MB is a multiple of 3 bytes, so
    // every chunk's base64 decodes cleanly with no mid-file padding.
    const file = pendingVideo.file;
    if(!file || !file.size) return null;
    const CHUNK = 3 * 1024 * 1024;
    for(let off = 0; off < file.size; off += CHUNK){
      const slice = file.slice(off, Math.min(off + CHUNK, file.size));
      const dataUrl = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=()=>rej(r.error); r.readAsDataURL(slice); });
      const base64 = String(dataUrl).split(',')[1] || '';
      if(off === 0) await Filesystem.writeFile({ path: filename, data: base64, directory: 'DATA', recursive: true });
      else          await Filesystem.appendFile({ path: filename, data: base64, directory: 'DATA' });
    }
    return { filename, stored:true };
  } catch(e){
    console.warn('Video store failed', e);
    // A half-written clip is corrupt AND unconsented-adjacent junk — remove it
    // so a failed save leaves the disk exactly as it was.
    await deleteVideoFile(filename);
    return null;
  }
}
// `sfx` (optional) namespaces every field id — the batch sheet renders the SAME
// dataFields once per child as `f_<field>_<profileId>`, so one activity screen
// can hold N children's inputs without collisions. Solo/group callers omit it.
function buildField(f, sfx){
  sfx = sfx || '';
  const fid = `f_${f.id}${sfx}`;
  if(f.type === 'count'){ return `<div class="field"><label for="${fid}">${esc(f.label)}</label><input type="number" id="${fid}" min="0" placeholder="0"></div>`; }
  if(f.type === 'result'){
    return `<div class="field"><label id="lbl_${f.id}${sfx}">${esc(f.label)}</label><div class="seg" id="${fid}" data-value="" role="group" aria-labelledby="lbl_${f.id}${sfx}">${['Independent','Prompted','Unable'].map(v=>`<button type="button" onclick="pickSeg('${fid}','${v}',this)" aria-pressed="false">${v}</button>`).join('')}</div></div>`;
  }
  // 'mastery' — the one-tap scale for simple drills. Plain-language version of
  // the support-level scoring O&M inventories use (independent / prompted /
  // not yet): Got it = first-cue, on their own; With help = needed a prompt or
  // a repeat; Not yet = couldn't do it this time (and that's fine — it's a
  // snapshot, not a verdict).
  if(f.type === 'mastery'){
    return `<div class="field"><label id="lbl_${f.id}${sfx}">${esc(f.label)}</label><div class="seg" id="${fid}" data-value="" role="group" aria-labelledby="lbl_${f.id}${sfx}">${['Got it','With help','Not yet'].map(v=>`<button type="button" onclick="pickSeg('${fid}','${v}',this)" aria-pressed="false">${v}</button>`).join('')}</div></div>`;
  }
  // 'teacherNotes' — progressive disclosure: the score is the required tap,
  // the note is optional and stays folded until the teacher wants it. The
  // placeholder prompts what's actually useful to write.
  if(f.type === 'teacherNotes'){
    return `<details class="tnotes">
      <summary>${ICON.edit}<span class="tnotes-title">${esc(f.label)}</span><span class="tnotes-opt">optional</span></summary>
      <textarea id="${fid}" placeholder="Anything worth remembering — what helped, what surprised you, what to try next session."></textarea>
    </details>`;
  }
  if(f.type === 'checkbox'){ return `<div class="field"><div class="checkrow"><input type="checkbox" id="${fid}"><label for="${fid}">${esc(f.label)}</label></div></div>`; }
  return `<div class="field"><label for="${fid}">${esc(f.label)}</label><textarea id="${fid}" placeholder="Type any observations..."></textarea></div>`;
}
function pickSeg(groupId, value, btn){
  const group = document.getElementById(groupId);
  group.dataset.value = value;
  [...group.children].forEach(b=>b.setAttribute('aria-pressed','false'));
  btn.setAttribute('aria-pressed','true');
}
async function handleSave(activityId){
  const cat = ACTIVITY_DATA[state.category];
  const act = cat.activities[state.activity];
  // GROUP activities save ONE record for the whole group: no child, no
  // researchId, no video (video consent is per-child and a group clip can't be
  // verified against unidentified children — fail closed, DPDP). The record
  // carries group:true so display and CSV can label it honestly.
  const isGroup = !!act.group;
  const child = isGroup ? null : getActiveProfile();
  if(!isGroup && !child){ toast('Choose or add a child first.'); return; }
  // PSEUDONYM, not name, goes on the record. profileId is the local device link;
  // researchId is the portable pseudonym that survives export and (future) sync.
  const researchId = isGroup ? '' : child.researchId;
  const btn = document.getElementById('saveBtn');
  if(btn){ btn.disabled = true; setTimeout(()=>{ if(btn) btn.disabled=false; }, 300); }
  const values = {};
  act.dataFields.forEach(f=>{
    const el = document.getElementById('f_'+f.id);
    if(f.type === 'count')        values[f.label] = el.value || '0';
    else if(f.type === 'result' || f.type === 'mastery') values[f.label] = el.dataset.value || '—';
    else if(f.type === 'checkbox')values[f.label] = el.checked ? 'Yes' : 'No';
    else                          values[f.label] = el.value || '';
  });
  // Content only — id / schemaVersion / teacherId / whenISO are stamped
  // inside saveRecord (the envelope chokepoint).
  // Drop any staged clip if consent isn't on file, and tell the teacher why.
  // Group saves never have a clip (the control isn't rendered) — clear any
  // stale stage defensively and skip the commit entirely.
  if(pendingVideo && (isGroup || !child.videoConsent)){
    pendingVideo = null;
    if(!isGroup) toast('Video not saved — no guardian video-consent for this child.');
  }
  const hadClip = !!pendingVideo;   // remember before commit clears/consumes it
  const videoMeta = isGroup ? null : await commitPendingVideo(researchId);
  const rec = isGroup ? { group: true, values } : { researchId, profileId: child.id, values };
  if(videoMeta){ rec.video = videoMeta.filename; }
  const ok = await saveRecord(activityId, rec);
  if(!ok){
    toast('Could not save — storage may be full. Export your data, then try again.');
    return;
  }
  pendingVideo = null;
  // Honest toasts: a clip that failed to store must not be a silent loss —
  // the teacher can re-attach it now; discovering it missing weeks later, they can't.
  if(hadClip && !videoMeta)                       toast('Saved — but the video could not be stored. Please re-attach it.');
  else if(videoMeta && videoMeta.stored === false) toast('Saved (video kept on web preview only)');
  else                                             toast('Saved');
  showActivity(state.category, state.activity, { sopCollapsed:true, focusForm:true, dir:'none' });
}
/* ---- BATCH SHEET interactions + save (rosters of 2+) ---------------------
   The tick IS the result: ticked children save `Achieved: Yes` plus whatever
   detail was entered. Unticked children save `Achieved: No` ONLY if the
   teacher entered detail for them — an untouched, unticked row writes
   NOTHING, because absence of a record must not read as failure in the CSV. */
function toggleAchieved(pid, btn){
  const on = btn.getAttribute('aria-pressed') !== 'true';
  btn.setAttribute('aria-pressed', String(on));
  const row = document.getElementById('rrow_'+pid);
  if(row) row.classList.toggle('done', on);
  batchPaintSave();
}
function toggleRosterDetail(pid, btn){
  const det = document.getElementById('rdet_'+pid);
  if(!det) return;
  det.hidden = !det.hidden;
  btn.setAttribute('aria-expanded', String(!det.hidden));
  const sub = document.getElementById('rsub_'+pid);
  if(sub && det.hidden) sub.textContent = 'Tap for detail';
  if(sub && !det.hidden) sub.textContent = 'Optional — score, counts, notes';
}
function batchPaintSave(){
  const btn = document.getElementById('saveBtn');
  if(!btn) return;
  const n = document.querySelectorAll('.bigcheck[aria-pressed="true"]').length;
  btn.textContent = n ? `Save ${n} ${n===1?'result':'results'}` : 'Save results';
}
async function handleBatchSave(activityId){
  const cat = ACTIVITY_DATA[state.category];
  const act = cat.activities[state.activity];
  const btn = document.getElementById('saveBtn');
  if(btn){ btn.disabled = true; setTimeout(()=>{ if(btn) btn.disabled=false; }, 400); }
  let saved = 0, failed = 0;
  for(const pid of batchRoster){
    const child = profileById(pid);
    if(!child) continue;
    const achBtn = document.getElementById('ach_'+pid);
    const achieved = !!(achBtn && achBtn.getAttribute('aria-pressed') === 'true');
    const values = {};
    let hasDetail = false;
    act.dataFields.forEach(f=>{
      const el = document.getElementById('f_'+f.id+'_'+pid);
      if(!el) return;
      if(f.type === 'count'){ const v = el.value || ''; if(v && v !== '0') hasDetail = true; values[f.label] = v || '0'; }
      else if(f.type === 'result' || f.type === 'mastery'){ const v = el.dataset.value || ''; if(v) hasDetail = true; values[f.label] = v || '—'; }
      else if(f.type === 'checkbox'){ if(el.checked) hasDetail = true; values[f.label] = el.checked ? 'Yes' : 'No'; }
      else { const v = el.value || ''; if(v.trim()) hasDetail = true; values[f.label] = v; }
    });
    if(!achieved && !hasDetail) continue; // untouched row → no record, on purpose
    values['Achieved'] = achieved ? 'Yes' : 'No'; // flows straight into the CSV's value columns
    const ok = await saveRecord(activityId, { researchId: child.researchId, profileId: child.id, values });
    if(ok) saved++; else failed++;
  }
  if(failed){ toast(`Saved ${saved}, but ${failed} failed — storage may be full. Export your data, then try again.`); }
  else if(!saved){ toast('Nothing to save yet — tick who got it, or add detail to a row.'); return; }
  else toast(`Saved ${saved} ${saved===1?'result':'results'}`);
  showActivity(state.category, state.activity, { dir:'none', skipLedeFocus:true });
}
// Human-readable timestamp, derived AT RENDER from the canonical whenISO.
// Legacy records that never got a safe whenISO fall back to their stored
// display string. Never store the locale form for new records.
function fmtWhen(r){
  if(r.whenISO){ const d = new Date(r.whenISO); if(!isNaN(d.getTime())) return d.toLocaleString(); }
  return r.when || '';
}
// On-device DISPLAY name for a record. The record itself carries only the
// pseudonym (researchId) + the local profileId link — never the name. Here, on
// the teacher's own device, we resolve back to the real name so the list stays
// human-readable. Off-device (CSV/sync) this resolution never happens, so the
// name never leaves. Fallback order: profile name → researchId → legacy student.
function recordDisplayName(r){
  if(r.group) return 'Group';
  const p = r.profileId ? profileById(r.profileId) : null;
  if(p && p.name) return p.name;
  return r.researchId || r.student || '—';
}
function renderRecord(r, resultLabels, activityId){
  resultLabels = resultLabels || [];
  const entries = Object.entries(r.values).filter(([k,v])=>v && v!=='' && v!=='—');
  entries.sort((a,b)=>{ const ar = resultLabels.includes(a[0]) ? 0 : 1; const br = resultLabels.includes(b[0]) ? 0 : 1; return ar - br; });
  const pills = entries.map(([k,v])=>{ const isResult = resultLabels.includes(k); return `<span class="${isResult ? 'val-result' : ''}">${esc(k)}: ${esc(v)}</span>`; }).join('');
  // Delete is BY ID — the migration shim guarantees every record has one.
  const del = (activityId != null && r.id)
    ? `<button type="button" class="rec-del" aria-label="Delete this result" onclick="confirmDeleteRecord('${esc(activityId)}','${esc(r.id)}')">${ICON.trash}</button>`
    : '';
  const videoPill = r.video ? `<span class="val-video">${ICON.video} Video</span>` : '';
  return `<div class="record"><div class="rec-head"><span class="rec-meta"><span class="who">${esc(recordDisplayName(r))}</span> <span class="when">· ${esc(fmtWhen(r))}</span></span>${del}</div><div class="vals">${pills || '<span>(no values)</span>'}${videoPill}</div></div>`;
}
async function confirmDeleteRecord(activityId, recordId){
  const go = await askConfirm({
    title:'Delete this result?',
    body:'This one saved result will be permanently removed. This cannot be undone.',
    confirmLabel:'Delete result', danger:true });
  if(!go) return;
  const ok = await deleteRecord(activityId, recordId);
  if(!ok){ toast('Could not delete — please try again.'); return; }
  toast('Result deleted');
  // Re-render the current activity screen in place (no entrance slide).
  showActivity(state.category, state.activity, { sopCollapsed:true, dir:'none', skipLedeFocus:true });
}
// Always open on the Welcome page. (Earlier this was show-once via a
// `welcomeSeen` flag; the app now lands on Welcome every launch by request.)
//
// BOOT: storage is now cache-backed and the cache is filled asynchronously
// (localStorage on web, Capacitor Preferences on native). We MUST wait for
// Store.init() before the first paint, or render code reads an empty cache and
// the teacher sees no children/records on a cold start. If init somehow fails,
// we still paint Welcome (which reads nothing) so the app is never a blank
// screen, and surface a toast.
(async function boot(){
  try {
    await Store.init();
    await ensureDeviceTeacherId();   // mint per-install operator id, once
    await migrateLegacyData();       // idempotent backfill: id / schemaVersion /
                                     // teacherId:'legacy' / safe whenISO
    await ensureSchoolsSeeded();     // PILOT seed of schools/teachers (see seam)
    await ensureDemoChildrenSeeded();// demo children (fresh installs only — see seed note)
  }
  catch(e){ setTimeout(()=>toast('Storage failed to load — please restart the app.'), 400); }
  // Login gates the app. Once signed in, the welcome-seen flag decides whether
  // to show the one-time welcome or drop straight into the hub.
  if(!isLoggedIn()){ showLogin('fwd'); }
  else if(Store.getString(WELCOME_SEEN,'') !== '1'){ showWelcome('fwd'); }
  else { showHome('fwd'); }
})();
