// EDIT THESE when you have your real details
const CONFIG = {
  instagram: 'https://www.instagram.com/coignitive_media',
  whatsapp: 'https://wa.me/923112043154',   // wa.me needs the country code, no leading 0
  bookingLink: 'https://wa.me/923112043154' // swap for Calendly etc. if you add one
};

document.querySelectorAll('.book').forEach(a => { a.href = CONFIG.bookingLink; a.target = '_blank'; a.rel = 'noopener'; });
document.querySelectorAll('[data-link]').forEach(a => { a.href = CONFIG[a.dataset.link]; a.target = '_blank'; a.rel = 'noopener'; });

// Mobile menu
const burger = document.querySelector('.burger'), menu = document.getElementById('menu');
burger.addEventListener('click', () => {
  burger.setAttribute('aria-expanded', menu.classList.toggle('open'));
});
menu.addEventListener('click', e => { if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

// Hero spotlight grid follows the cursor
const hero = document.querySelector('.hero');
hero.addEventListener('pointermove', e => {
  const r = hero.getBoundingClientRect();
  hero.style.setProperty('--x', e.clientX - r.left + 'px');
  hero.style.setProperty('--y', e.clientY - r.top + 'px');
});

// Results tabs (arrow keys supported)
const tabs = [...document.querySelectorAll('[role=tab]')];
function pick(i) {
  tabs.forEach((t, n) => {
    t.setAttribute('aria-selected', n === i);
    t.tabIndex = n === i ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = n !== i;
  });
  tabs[i].focus();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => pick(i));
  t.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') pick((i + 1) % tabs.length);
    if (e.key === 'ArrowLeft') pick((i - 1 + tabs.length) % tabs.length);
  });
});

// Sound toggle on video tiles (videos start muted so they can autoplay)
function setSound(btn, on) {
  const v = btn.parentElement.querySelector('video');
  v.muted = !on;
  if (on && v.paused) v.play();
  btn.setAttribute('aria-pressed', on);
  btn.setAttribute('aria-label', on ? 'Mute video' : 'Unmute video');
}
document.querySelectorAll('.snd').forEach(b => b.addEventListener('click', () => setSound(b, b.getAttribute('aria-pressed') !== 'true')));

// Portfolio: click a cover tile. The other covers fade out, the cover moves to the first place
// and its collection slides out into places 2, 3 and 4.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const work = document.querySelector('.work'), covers = [...work.querySelectorAll('.cover')];
const ease = 'cubic-bezier(.2,.8,.2,1)', dur = n => reduce ? 0 : n;
let current = null;
const extrasOf = c => [...work.querySelectorAll('.extra[data-g="' + c.dataset.g + '"]')];
const toFirst = c => 'translate(' + (covers[0].offsetLeft - c.offsetLeft) + 'px,' + (covers[0].offsetTop - c.offsetTop) + 'px)';
function place(cover) {               // extras sit exactly over grid cells 2, 3 and 4
  const extras = extrasOf(cover);
  extras.forEach((e, i) => { const s = covers[i + 1]; e.style.left = s.offsetLeft + 'px'; e.style.top = s.offsetTop + 'px'; e.style.width = s.offsetWidth + 'px'; });
  return {extras, others: covers.filter(c => c !== cover)};
}
const fromCover = e => 'translate(' + (covers[0].offsetLeft - parseFloat(e.style.left)) + 'px,' + (covers[0].offsetTop - parseFloat(e.style.top)) + 'px) scale(.88)';
function label(cover, open) {
  const b = cover.querySelector('.more'); b.setAttribute('aria-expanded', open);
  b.querySelector('.badge').textContent = open ? 'Show less' : '+3 more';
}
function openGroup(cover) {
  current = cover; label(cover, true);
  const {extras, others} = place(cover);
  others.forEach(s => {
    s.getAnimations().forEach(a => a.cancel());
    const snd = s.querySelector('.snd'); if (snd) setSound(snd, false);
    const a = s.animate([{opacity: 1, transform: 'none'}, {opacity: 0, transform: 'scale(.9)'}], {duration: dur(380), easing: 'ease', fill: 'forwards'});
    a.onfinish = () => { s.style.visibility = 'hidden'; a.cancel(); };
  });
  cover.getAnimations().forEach(a => a.cancel());
  cover.animate([{transform: 'none'}, {transform: toFirst(cover)}], {duration: dur(650), easing: ease, fill: 'forwards'});
  extras.forEach((e, i) => {
    e.getAnimations().forEach(a => a.cancel()); e.hidden = false;
    e.animate([{transform: fromCover(e), opacity: 0}, {transform: 'none', opacity: 1}],
      {duration: dur(750), delay: dur(350 + i * 120), easing: ease, fill: 'backwards'});
    const v = e.querySelector('video'); if (v) v.play().catch(() => {});
  });
}
function closeGroup(cover) {
  current = null; label(cover, false);
  const {extras, others} = place(cover);
  extras.forEach((e, i) => {
    const snd = e.querySelector('.snd'); if (snd) setSound(snd, false);
    e.getAnimations().forEach(a => a.cancel());
    const a = e.animate([{transform: 'none', opacity: 1}, {transform: fromCover(e), opacity: 0}],
      {duration: dur(550), delay: dur((extras.length - 1 - i) * 80), easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards'});
    a.onfinish = () => { e.hidden = true; a.cancel(); };
  });
  const t = toFirst(cover); cover.getAnimations().forEach(a => a.cancel());
  cover.animate([{transform: t}, {transform: 'none'}], {duration: dur(600), delay: dur(450), easing: ease, fill: 'backwards'});
  others.forEach((s, i) => {
    s.getAnimations().forEach(a => a.cancel()); s.style.visibility = '';
    s.animate([{opacity: 0, transform: 'scale(.9)'}, {opacity: 1, transform: 'none'}], {duration: dur(550), delay: dur(900 + i * 90), easing: ease, fill: 'backwards'});
    const v = s.querySelector('video'); if (v) v.play().catch(() => {});
  });
}
covers.forEach(c => c.querySelector('.more').addEventListener('click', () => {
  if (current && current !== c) return;
  current === c ? closeGroup(c) : openGroup(c);
}));
addEventListener('resize', () => {
  if (!current) return;
  place(current); current.getAnimations().forEach(a => a.cancel());
  current.animate([{transform: toFirst(current)}, {transform: toFirst(current)}], {duration: 0, fill: 'forwards'});
});
addEventListener('keydown', e => { if (e.key === 'Escape' && current) { const c = current; closeGroup(c); c.querySelector('.more').focus(); } });

// Motion: scroll reveals, count-ups, progress bar, card glow
document.querySelectorAll('.sec h2,.sec .intro,.card,.panel,.steps li,.about>div,details,.pills,.custom,.cta>*,.filters,.tabs').forEach(el => {
  el.classList.add('rv');
  el.style.setProperty('--d', [...el.parentElement.children].indexOf(el) % 6);
});
function count(el) {
  const m = el.textContent.match(/^(\D*)([\d.,]+)(.*)$/); if (!m || reduce) return;
  const to = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, com = m[2].includes(','), t0 = performance.now();
  (function f(t) {
    const p = Math.min((t - t0) / 1500, 1), v = to * (1 - Math.pow(1 - p, 3));
    el.textContent = m[1] + (com ? v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec}) : v.toFixed(dec)) + m[3];
    if (p < 1) requestAnimationFrame(f);
  })(t0);
}
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('vis');
  if (e.target.matches('.stats b,.kpi')) count(e.target);
  io.unobserve(e.target);
}), {threshold: .15});
document.querySelectorAll('.rv,.stats b,.kpi').forEach(el => io.observe(el));

const nav = document.querySelector('.nav'), bar = document.createElement('div');
bar.className = 'prog'; document.body.prepend(bar);
addEventListener('scroll', () => {
  const m = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = 'scaleX(' + (m ? scrollY / m : 0) + ')';
  nav.classList.toggle('scrolled', scrollY > 20);
}, {passive: true});
document.addEventListener('pointermove', e => {
  const c = e.target.closest('.card'); if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
});

// Video editing calculator
const VP = {1:2000, 2:3600, 3:5400, 4:7200, 5:9000, 6:10800, 7:12600, 8:12000, 12:18000}, REG = 2000, MAXV = 12;
const vprice = n => VP[n] ?? n * 1500;   // 9 to 11 videos are not in the price list: estimated at the 8 and 12 package rate
let vn = 1;
const rs = x => 'Rs. ' + Math.round(x).toLocaleString('en-US');
function tween(el, to) {
  const from = +el.dataset.v || 0; el.dataset.v = to;
  if (reduce) { el.textContent = rs(to); return; }
  const t0 = performance.now();
  (function f(t) { const p = Math.min((t - t0) / 350, 1); el.textContent = rs(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
}
function vrender() {
  const p = vprice(vn), $ = id => document.getElementById(id);
  $('vn').textContent = vn;
  tween($('vreg'), vn * REG); tween($('vyour'), p); tween($('vsave'), vn * REG - p);
  $('vm').disabled = vn <= 1; $('vpl').disabled = vn >= MAXV;
  $('vnote').textContent = vn >= MAXV ? 'Need more than 12 videos? Contact us for a custom bulk editing package.' : (VP[vn] ? '' : 'Estimated price for this amount. Confirm with us on WhatsApp.');
  document.querySelectorAll('#vt tbody tr').forEach(r => r.classList.toggle('sel', +r.dataset.n === vn));
  $('vq').href = CONFIG.whatsapp + '?text=' + encodeURIComponent('Hi! I’d like ' + vn + ' video' + (vn > 1 ? 's' : '') + ' edited (' + rs(p) + ').');
}
document.getElementById('vm').addEventListener('click', () => { vn = Math.max(1, vn - 1); vrender(); });
document.getElementById('vpl').addEventListener('click', () => { vn = Math.min(MAXV, vn + 1); vrender(); });
document.querySelectorAll('#vt tbody tr').forEach(r => r.addEventListener('click', () => { vn = +r.dataset.n; vrender(); }));
vrender();
