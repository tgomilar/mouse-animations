import {
  Trail, Ripple, CustomCursor, Magnetic, Particles, Parallax,
  Tilt, Spotlight, Flashlight, Invert, Image,
} from 'mouse-animations';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function inp(id: string): HTMLInputElement  { return el<HTMLInputElement>(id); }
function out(id: string): HTMLOutputElement { return el<HTMLOutputElement>(id); }

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha.toFixed(2)})`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

type CodeMode = 'js' | 'jquery' | 'react';

function renderCode(
  codeId: string,
  cls: string,
  opts: Record<string, unknown>,
  mode: CodeMode = 'js',
  jqTarget = '$(document)',
): void {
  const jqMethod = cls.charAt(0).toLowerCase() + cls.slice(1);
  const varName  = jqMethod;

  const displayOpts = mode === 'jquery'
    ? Object.fromEntries(Object.entries(opts).filter(([k]) => k !== 'selector'))
    : opts;

  const rows = Object.entries(displayOpts).map(([k, v]) => {
    let val: string;
    if (typeof v === 'string') {
      val = `<span class="tok-str">'${esc(v)}'</span>`;
    } else if (typeof v === 'boolean') {
      val = `<span class="tok-bool">${v}</span>`;
    } else if (Array.isArray(v)) {
      val =
        '<span class="tok-pun">[</span>' +
        (v as string[]).map(s => `<span class="tok-str">'${esc(s)}'</span>`).join('<span class="tok-pun">, </span>') +
        '<span class="tok-pun">]</span>';
    } else {
      val = `<span class="tok-num">${v}</span>`;
    }
    return `  <span class="tok-key">${k}</span><span class="tok-pun">:</span> ${val}<span class="tok-pun">,</span>`;
  });

  if (mode === 'react') {
    el(codeId).innerHTML = [
      `<span class="tok-kw">import</span> <span class="tok-pun">{</span> <span class="tok-key">useEffect</span> <span class="tok-pun">}</span> <span class="tok-kw">from</span> <span class="tok-str">"react"</span><span class="tok-pun">;</span>`,
      `<span class="tok-kw">import</span> <span class="tok-pun">{</span> <span class="tok-cls">${cls}</span> <span class="tok-pun">}</span> <span class="tok-kw">from</span> <span class="tok-str">"mouse-animations"</span><span class="tok-pun">;</span>`,
      ``,
      `<span class="tok-kw">export default function</span> <span class="tok-cls">${cls}Demo</span><span class="tok-pun">() {</span>`,
      `<span class="tok-key">useEffect</span><span class="tok-pun">(() => {</span>`,
      `<span class="tok-key">const</span> <span class="tok-key">${varName}</span> <span class="tok-pun">=</span> <span class="tok-kw">new</span> <span class="tok-cls">${cls}</span><span class="tok-pun">({</span>`,
      ...rows,
      `<span class="tok-pun">});</span>`,
      `<span class="tok-key">return</span> <span class="tok-pun">() =></span> <span class="tok-key">${varName}.destroy()</span><span class="tok-pun">;</span>`,
      `<span class="tok-pun">}, []);</span>`,
      ``,
      `<span class="tok-key">return</span> <span class="tok-pun">&lt;</span><span class="tok-key">main</span> <span class="tok-key">style</span><span class="tok-pun">=</span><span class="tok-pun">{</span> <span class="tok-pun">{</span> <span class="tok-key">minHeight</span><span class="tok-pun">:</span> <span class="tok-str">'100vh'</span> <span class="tok-pun">}</span> <span class="tok-pun">}</span><span class="tok-pun">&gt;</span><span class="tok-pun">{</span><span class="tok-pun">/*</span> your app <span class="tok-pun">*/</span><span class="tok-pun">}</span><span class="tok-pun">&lt;/</span><span class="tok-key">main</span><span class="tok-pun">&gt;</span><span class="tok-pun">;</span>`,
      `<span class="tok-pun">}</span>`,
    ].join('\n');
    return;
  }

  if (mode === 'jquery') {
    el(codeId).innerHTML = [
      `<span class="tok-kw">import</span> <span class="tok-str">"mouse-animations/jquery"</span><span class="tok-pun">;</span>`,
      `<span class="tok-pun">// &lt;script src="https://esm.sh/mouse-animations/jquery"&gt;&lt;/script&gt;</span>`,
      ``,
      `<span class="tok-key">${jqTarget}</span><span class="tok-pun">.</span><span class="tok-cls">${jqMethod}</span><span class="tok-pun">({</span>`,
      ...rows,
      `<span class="tok-pun">})</span>`,
      ``,
      `<span class="tok-pun">// ${jqTarget}.${jqMethod}('disable')   pause</span>`,
      `<span class="tok-pun">// ${jqTarget}.${jqMethod}('enable')    resume</span>`,
      `<span class="tok-pun">// ${jqTarget}.${jqMethod}('destroy')   cleanup</span>`,
    ].join('\n');
  } else {
    el(codeId).innerHTML = [
      `<span class="tok-kw">import</span> <span class="tok-pun">{</span> <span class="tok-cls">${cls}</span> <span class="tok-pun">}</span> <span class="tok-kw">from</span> <span class="tok-str">"mouse-animations"</span><span class="tok-pun">;</span>`,
      `<span class="tok-pun">// import { ${cls} } from "https://esm.sh/mouse-animations";</span>`,
      ``,
      `<span class="tok-kw">const</span> <span class="tok-key">${varName}</span> <span class="tok-pun">=</span> <span class="tok-kw">new</span> <span class="tok-cls">${cls}</span><span class="tok-pun">({</span>`,
      ...rows,
      `<span class="tok-pun">})</span>`,
      ``,
      `<span class="tok-pun">// ${varName}.disable()   pause</span>`,
      `<span class="tok-pun">// ${varName}.enable()    resume</span>`,
      `<span class="tok-pun">// ${varName}.destroy()   cleanup</span>`,
    ].join('\n');
  }
}

function setupModeToggle(toggleId: string, onChange: (mode: CodeMode) => void): () => void {
  const btns = document.querySelectorAll<HTMLButtonElement>(`#${toggleId} .toggle-btn`);
  btns.forEach(btn => {
    btn.onclick = () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange(btn.dataset['mode'] as CodeMode);
    };
  });
  return () => { btns.forEach(btn => { btn.onclick = null; }); };
}

// ─── Slider ───────────────────────────────────────────────────────────────────

const TOTAL = 11;
const ACCENTS = [
  '#f43f5e', '#c084fc', '#60a5fa', '#34d399', '#f472b6',
  '#fbbf24', '#a78bfa', '#38bdf8', '#fb923c', '#94a3b8', '#4ade80',
];
const CURSOR_NONE = new Set([0, 3, 10]); // invert, cursor, image

let current = 0;
let sliding  = false;

const track   = el('slider-track');
const prevBtn = el<HTMLButtonElement>('arrow-prev');
const nextBtn = el<HTMLButtonElement>('arrow-next');
const counter = el('slide-counter');
const navBtns = document.querySelectorAll<HTMLButtonElement>('.nav-btn');

function updateUI(idx: number): void {
  counter.textContent = `${idx + 1} / ${TOTAL}`;
  prevBtn.disabled = idx === 0;
  nextBtn.disabled = idx === TOTAL - 1;
  document.body.classList.toggle('cursor-none', CURSOR_NONE.has(idx));
  document.documentElement.style.setProperty('--accent', ACCENTS[idx]!);
  navBtns.forEach(btn => btn.classList.toggle('active', +btn.dataset['idx']! === idx));
}

function goTo(idx: number): void {
  if (sliding || idx < 0 || idx >= TOTAL || idx === current) return;
  sliding = true;
  destroyEffect();
  track.style.transform = `translateX(${-idx * 100}vw)`;
  current = idx;
  updateUI(idx);
  track.addEventListener('transitionend', function handler() {
    track.removeEventListener('transitionend', handler);
    sliding = false;
    mountEffect(idx);
  }, { once: true });
}

prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(current - 1);
});

navBtns.forEach(btn => {
  btn.addEventListener('click', () => goTo(+btn.dataset['idx']!));
});

let touchX = 0;
let touchY = 0;
document.addEventListener('touchstart', e => {
  touchX = e.touches[0]!.clientX;
  touchY = e.touches[0]!.clientY;
}, { passive: true });
document.addEventListener('touchend', e => {
  const t = e.changedTouches[0]!;
  const dx = t.clientX - touchX;
  const dy = t.clientY - touchY;
  const target = e.target;
  const inCodeBlock = target instanceof Element && target.closest('.code-block') !== null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && !inCodeBlock) {
    goTo(current + (dx < 0 ? 1 : -1));
  }
});

document.querySelectorAll<HTMLButtonElement>('.customize-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const drawer = el(btn.dataset['ctrl']!);
    const open = drawer.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.textContent = open ? '⚙ Close' : '⚙ Customize';
  });
});

// ─── Effect registry ──────────────────────────────────────────────────────────

type AnyInstance = { destroy(): void };
let instance: AnyInstance | null = null;

const MOUNTS: Array<() => AnyInstance> = [
  mountInvert, mountTrail, mountRipple, mountCursor, mountMagnetic, mountParticles,
  mountParallax, mountTilt, mountSpotlight, mountFlashlight, mountImage,
];

function mountEffect(idx: number): void { instance = MOUNTS[idx]!(); }
function destroyEffect(): void          { instance?.destroy(); instance = null; }

// ─── Invert ───────────────────────────────────────────────────────────────────

function mountInvert(): AnyInstance {
  let mode: CodeMode = 'js';
  const JQ = '$(document)';

  function opts() {
    return {
      color:      '#ffffff',
      size:       +inp('invert-size').value,
      smoothness: +(+inp('invert-smooth').value / 100).toFixed(2),
    };
  }

  let invert = new Invert(opts());
  renderCode('code-invert', 'Invert', opts(), mode, JQ);

  function refresh() {
    invert.destroy();
    invert = new Invert(opts());
    renderCode('code-invert', 'Invert', opts(), mode, JQ);
  }

  const cleanupToggle = setupModeToggle('toggle-invert', m => { mode = m; renderCode('code-invert', 'Invert', opts(), mode, JQ); });

  inp('invert-size').oninput = e => {
    out('invert-size-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('invert-smooth').oninput = e => {
    out('invert-smooth-val').value = (+((e.target as HTMLInputElement).value) / 100).toFixed(2);
    refresh();
  };

  return {
    destroy() {
      invert.destroy();
      cleanupToggle();
      inp('invert-size').oninput = null;
      inp('invert-smooth').oninput = null;
    },
  };
}

// ─── Trail ────────────────────────────────────────────────────────────────────

function mountTrail(): AnyInstance {
  let mode: CodeMode = 'js';
  const JQ = '$(document)';

  function opts() {
    return {
      color:  inp('trail-color').value,
      size:   +inp('trail-size').value,
      length: +inp('trail-length').value,
      decay:  +(+inp('trail-decay').value / 100).toFixed(2),
      blur:   +inp('trail-blur').value,
    };
  }

  let trail = new Trail(opts());
  renderCode('code-trail', 'Trail', opts(), mode, JQ);

  function refresh() {
    trail.destroy();
    trail = new Trail(opts());
    renderCode('code-trail', 'Trail', opts(), mode, JQ);
  }

  const cleanupToggle = setupModeToggle('toggle-trail', m => { mode = m; renderCode('code-trail', 'Trail', opts(), mode, JQ); });

  inp('trail-color').oninput = e => {
    el('trail-color-hex').textContent = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('trail-size').oninput = e => {
    out('trail-size-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('trail-length').oninput = e => {
    out('trail-length-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('trail-decay').oninput = e => {
    out('trail-decay-val').value = (+((e.target as HTMLInputElement).value) / 100).toFixed(2);
    refresh();
  };
  inp('trail-blur').oninput = e => {
    out('trail-blur-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };

  return {
    destroy() {
      trail.destroy();
      cleanupToggle();
      inp('trail-color').oninput = null;
      inp('trail-size').oninput = null;
      inp('trail-length').oninput = null;
      inp('trail-decay').oninput = null;
      inp('trail-blur').oninput = null;
    },
  };
}

// ─── Ripple ───────────────────────────────────────────────────────────────────

function mountRipple(): AnyInstance {
  let mode: CodeMode = 'js';
  const JQ = '$(document)';

  function opts() {
    const hex   = inp('ripple-color').value;
    const alpha = +inp('ripple-opacity').value / 100;
    return {
      color:    hexToRgba(hex, alpha),
      duration: +inp('ripple-duration').value,
      maxSize:  +inp('ripple-size').value,
    };
  }

  let ripple = new Ripple(opts());
  renderCode('code-ripple', 'Ripple', opts(), mode, JQ);

  function refresh() {
    ripple.destroy();
    ripple = new Ripple(opts());
    renderCode('code-ripple', 'Ripple', opts(), mode, JQ);
  }

  const cleanupToggle = setupModeToggle('toggle-ripple', m => { mode = m; renderCode('code-ripple', 'Ripple', opts(), mode, JQ); });

  inp('ripple-color').oninput = e => {
    el('ripple-color-hex').textContent = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('ripple-opacity').oninput = e => {
    out('ripple-opacity-val').value = (+((e.target as HTMLInputElement).value) / 100).toFixed(2);
    refresh();
  };
  inp('ripple-duration').oninput = e => {
    out('ripple-duration-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('ripple-size').oninput = e => {
    out('ripple-size-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };

  return {
    destroy() {
      ripple.destroy();
      cleanupToggle();
      inp('ripple-color').oninput = null;
      inp('ripple-opacity').oninput = null;
      inp('ripple-duration').oninput = null;
      inp('ripple-size').oninput = null;
    },
  };
}

// ─── Custom Cursor ────────────────────────────────────────────────────────────

function mountCursor(): AnyInstance {
  let mode: CodeMode = 'js';
  const JQ = '$(document)';

  function opts() {
    return {
      innerSize:  +inp('cursor-inner-size').value,
      outerSize:  +inp('cursor-outer-size').value,
      innerColor:  inp('cursor-inner-color').value,
      outerColor:  hexToRgba(inp('cursor-outer-color').value, 0.3),
      smoothness: +(+inp('cursor-smooth').value / 100).toFixed(2),
    };
  }

  let cursor = new CustomCursor(opts());
  renderCode('code-cursor', 'CustomCursor', opts(), mode, JQ);

  function refresh() {
    cursor.destroy();
    cursor = new CustomCursor(opts());
    renderCode('code-cursor', 'CustomCursor', opts(), mode, JQ);
  }

  const cleanupToggle = setupModeToggle('toggle-cursor', m => { mode = m; renderCode('code-cursor', 'CustomCursor', opts(), mode, JQ); });

  inp('cursor-inner-color').oninput = e => {
    el('cursor-inner-hex').textContent = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('cursor-outer-color').oninput = e => {
    el('cursor-outer-hex').textContent = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('cursor-inner-size').oninput = e => {
    out('cursor-inner-size-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('cursor-outer-size').oninput = e => {
    out('cursor-outer-size-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('cursor-smooth').oninput = e => {
    out('cursor-smooth-val').value = (+((e.target as HTMLInputElement).value) / 100).toFixed(2);
    refresh();
  };

  return {
    destroy() {
      cursor.destroy();
      cleanupToggle();
      inp('cursor-inner-color').oninput = null;
      inp('cursor-outer-color').oninput = null;
      inp('cursor-inner-size').oninput = null;
      inp('cursor-outer-size').oninput = null;
      inp('cursor-smooth').oninput = null;
    },
  };
}

// ─── Magnetic ─────────────────────────────────────────────────────────────────

function mountMagnetic(): AnyInstance {
  let mode: CodeMode = 'js';
  const JQ = "$('.mag-target')";

  function opts() {
    return {
      selector: '.mag-target',
      strength: +(+inp('mag-strength').value / 100).toFixed(2),
      radius:   +inp('mag-radius').value,
      ease:     +(+inp('mag-ease').value / 100).toFixed(2),
    };
  }

  let mag = new Magnetic(opts());
  renderCode('code-magnetic', 'Magnetic', opts(), mode, JQ);

  function refresh() {
    mag.destroy();
    mag = new Magnetic(opts());
    renderCode('code-magnetic', 'Magnetic', opts(), mode, JQ);
  }

  const cleanupToggle = setupModeToggle('toggle-magnetic', m => { mode = m; renderCode('code-magnetic', 'Magnetic', opts(), mode, JQ); });

  inp('mag-strength').oninput = e => {
    out('mag-strength-val').value = (+((e.target as HTMLInputElement).value) / 100).toFixed(2);
    refresh();
  };
  inp('mag-radius').oninput = e => {
    out('mag-radius-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('mag-ease').oninput = e => {
    out('mag-ease-val').value = (+((e.target as HTMLInputElement).value) / 100).toFixed(2);
    refresh();
  };

  return {
    destroy() {
      mag.destroy();
      cleanupToggle();
      inp('mag-strength').oninput = null;
      inp('mag-radius').oninput = null;
      inp('mag-ease').oninput = null;
    },
  };
}

// ─── Particles ────────────────────────────────────────────────────────────────

function mountParticles(): AnyInstance {
  let mode: CodeMode = 'js';
  const JQ = '$(document)';
  const COLORS = ['#c084fc', '#60a5fa', '#fbbf24', '#f472b6', '#34d399', '#fb923c'];

  function opts() {
    return {
      count:  +inp('particles-count').value,
      colors: COLORS,
      size:   +inp('particles-size').value,
      spread: +inp('particles-spread').value,
      decay:  0.015,
    };
  }

  let particles = new Particles(opts());
  renderCode('code-particles', 'Particles', opts(), mode, JQ);

  function refresh() {
    particles.destroy();
    particles = new Particles(opts());
    renderCode('code-particles', 'Particles', opts(), mode, JQ);
  }

  const cleanupToggle = setupModeToggle('toggle-particles', m => { mode = m; renderCode('code-particles', 'Particles', opts(), mode, JQ); });

  inp('particles-count').oninput = e => {
    out('particles-count-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('particles-size').oninput = e => {
    out('particles-size-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('particles-spread').oninput = e => {
    out('particles-spread-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };

  return {
    destroy() {
      particles.destroy();
      cleanupToggle();
      inp('particles-count').oninput = null;
      inp('particles-size').oninput = null;
      inp('particles-spread').oninput = null;
    },
  };
}

// ─── Parallax ─────────────────────────────────────────────────────────────────

function mountParallax(): AnyInstance {
  let mode: CodeMode = 'js';
  const JQ = "$('.parallax-target')";

  function opts() {
    return {
      selector: '.parallax-target',
      depth: +inp('parallax-depth').value,
      ease:  +(+inp('parallax-ease').value / 100).toFixed(2),
    };
  }

  let parallax = new Parallax(opts());
  renderCode('code-parallax', 'Parallax', opts(), mode, JQ);

  function refresh() {
    parallax.destroy();
    parallax = new Parallax(opts());
    renderCode('code-parallax', 'Parallax', opts(), mode, JQ);
  }

  const cleanupToggle = setupModeToggle('toggle-parallax', m => { mode = m; renderCode('code-parallax', 'Parallax', opts(), mode, JQ); });

  inp('parallax-depth').oninput = e => {
    out('parallax-depth-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('parallax-ease').oninput = e => {
    out('parallax-ease-val').value = (+((e.target as HTMLInputElement).value) / 100).toFixed(2);
    refresh();
  };

  return {
    destroy() {
      parallax.destroy();
      cleanupToggle();
      inp('parallax-depth').oninput = null;
      inp('parallax-ease').oninput = null;
    },
  };
}

// ─── Tilt ─────────────────────────────────────────────────────────────────────

function mountTilt(): AnyInstance {
  let mode: CodeMode = 'js';
  const JQ = "$('.tilt-target')";

  function opts() {
    return {
      selector:    '.tilt-target',
      maxTilt:     +inp('tilt-max').value,
      perspective: +inp('tilt-perspective').value,
      ease:        0.1,
      glare:       inp('tilt-glare').checked,
    };
  }

  let tilt = new Tilt(opts());
  renderCode('code-tilt', 'Tilt', opts(), mode, JQ);

  function refresh() {
    tilt.destroy();
    tilt = new Tilt(opts());
    renderCode('code-tilt', 'Tilt', opts(), mode, JQ);
  }

  const cleanupToggle = setupModeToggle('toggle-tilt', m => { mode = m; renderCode('code-tilt', 'Tilt', opts(), mode, JQ); });

  inp('tilt-max').oninput = e => {
    out('tilt-max-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('tilt-perspective').oninput = e => {
    out('tilt-perspective-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('tilt-glare').onchange = () => refresh();

  return {
    destroy() {
      tilt.destroy();
      cleanupToggle();
      inp('tilt-max').oninput = null;
      inp('tilt-perspective').oninput = null;
      inp('tilt-glare').onchange = null;
    },
  };
}

// ─── Spotlight ────────────────────────────────────────────────────────────────

function mountSpotlight(): AnyInstance {
  let mode: CodeMode = 'js';
  const JQ = "$('.spotlight-target')";

  function opts() {
    const hex     = inp('spotlight-color').value;
    const opacity = +inp('spotlight-opacity').value / 100;
    return {
      selector: '.spotlight-target',
      color:    hexToRgba(hex, opacity),
      size:     +inp('spotlight-size').value,
    };
  }

  let spotlight = new Spotlight(opts());
  renderCode('code-spotlight', 'Spotlight', opts(), mode, JQ);

  function refresh() {
    spotlight.destroy();
    spotlight = new Spotlight(opts());
    renderCode('code-spotlight', 'Spotlight', opts(), mode, JQ);
  }

  const cleanupToggle = setupModeToggle('toggle-spotlight', m => { mode = m; renderCode('code-spotlight', 'Spotlight', opts(), mode, JQ); });

  inp('spotlight-color').oninput = e => {
    el('spotlight-color-hex').textContent = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('spotlight-opacity').oninput = e => {
    out('spotlight-opacity-val').value = (+((e.target as HTMLInputElement).value) / 100).toFixed(2);
    refresh();
  };
  inp('spotlight-size').oninput = e => {
    out('spotlight-size-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };

  return {
    destroy() {
      spotlight.destroy();
      cleanupToggle();
      inp('spotlight-color').oninput = null;
      inp('spotlight-opacity').oninput = null;
      inp('spotlight-size').oninput = null;
    },
  };
}

// ─── Flashlight ───────────────────────────────────────────────────────────────

function mountFlashlight(): AnyInstance {
  let mode: CodeMode = 'js';
  const JQ = '$(document)';

  function opts() {
    return {
      backdrop:   `rgba(0,0,0,${(+inp('fl-opacity').value / 100).toFixed(2)})`,
      size:       +inp('fl-size').value,
      blur:       +inp('fl-blur').value,
      smoothness: 0.12,
    };
  }

  let fl = new Flashlight(opts());
  renderCode('code-flashlight', 'Flashlight', opts(), mode, JQ);

  function refresh() {
    fl.destroy();
    fl = new Flashlight(opts());
    renderCode('code-flashlight', 'Flashlight', opts(), mode, JQ);
  }

  const cleanupToggle = setupModeToggle('toggle-flashlight', m => { mode = m; renderCode('code-flashlight', 'Flashlight', opts(), mode, JQ); });

  inp('fl-opacity').oninput = e => {
    out('fl-opacity-val').value = (+((e.target as HTMLInputElement).value) / 100).toFixed(2);
    refresh();
  };
  inp('fl-size').oninput = e => {
    out('fl-size-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('fl-blur').oninput = e => {
    out('fl-blur-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };

  return {
    destroy() {
      fl.destroy();
      cleanupToggle();
      inp('fl-opacity').oninput = null;
      inp('fl-size').oninput = null;
      inp('fl-blur').oninput = null;
    },
  };
}

// ─── Image Cursor ─────────────────────────────────────────────────────────────

function mountImage(): AnyInstance {
  let mode: CodeMode = 'js';
  const JQ = '$(document)';

  const PRESETS: Record<string, string> = {
    star:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><polygon points="16,2 20,12 30,12 22,19 25,30 16,24 7,30 10,19 2,12 12,12" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/></svg>`,
    arrow:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M4 2L4 26L10 20L16 30L20 28L14 18L22 18Z" fill="#a78bfa" stroke="#7c3aed" stroke-width="1" stroke-linejoin="round"/></svg>`,
    crosshair: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="#60a5fa" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="10" stroke="#60a5fa" stroke-width="2"/><line x1="16" y1="22" x2="16" y2="30" stroke="#60a5fa" stroke-width="2"/><line x1="2" y1="16" x2="10" y2="16" stroke="#60a5fa" stroke-width="2"/><line x1="22" y1="16" x2="30" y2="16" stroke="#60a5fa" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="#60a5fa"/></svg>`,
    heart:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16 28C16 28 4 20 4 11C4 7 7 4 11 4C13.5 4 15.5 5.5 16 7C16.5 5.5 18.5 4 21 4C25 4 28 7 28 11C28 20 16 28 16 28Z" fill="#f43f5e" stroke="#be123c" stroke-width="1"/></svg>`,
  };

  let activePreset = 'star';

  function opts() {
    return {
      src:        PRESETS[activePreset]!,
      width:      +inp('imgcursor-width').value,
      height:     +inp('imgcursor-height').value,
      smoothness: +(+inp('imgcursor-smooth').value / 100).toFixed(2),
    };
  }

  function displayOpts() {
    return {
      src:        '<svg ...>',
      width:      +inp('imgcursor-width').value,
      height:     +inp('imgcursor-height').value,
      smoothness: +(+inp('imgcursor-smooth').value / 100).toFixed(2),
    };
  }

  let img = new Image(opts());
  renderCode('code-image', 'Image', displayOpts(), mode, JQ);

  function refresh() {
    img.destroy();
    img = new Image(opts());
    renderCode('code-image', 'Image', displayOpts(), mode, JQ);
  }

  const cleanupToggle = setupModeToggle('toggle-image', m => { mode = m; renderCode('code-image', 'Image', displayOpts(), mode, JQ); });

  const presetBtns = document.querySelectorAll<HTMLElement>('#imgcursor-presets .preset-btn');
  presetBtns.forEach(btn => {
    btn.onclick = () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePreset = btn.dataset['preset']!;
      refresh();
    };
  });

  inp('imgcursor-width').oninput = e => {
    out('imgcursor-width-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('imgcursor-height').oninput = e => {
    out('imgcursor-height-val').value = (e.target as HTMLInputElement).value;
    refresh();
  };
  inp('imgcursor-smooth').oninput = e => {
    out('imgcursor-smooth-val').value = (+((e.target as HTMLInputElement).value) / 100).toFixed(2);
    refresh();
  };

  return {
    destroy() {
      img.destroy();
      cleanupToggle();
      presetBtns.forEach(btn => { btn.onclick = null; });
      inp('imgcursor-width').oninput = null;
      inp('imgcursor-height').oninput = null;
      inp('imgcursor-smooth').oninput = null;
    },
  };
}

// ─── Init ─────────────────────────────────────────────────────────────────────

updateUI(0);
mountEffect(0);
