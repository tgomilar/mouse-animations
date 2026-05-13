import { Trail, Ripple, CustomCursor, Magnetic, Particles, Parallax, Tilt, Spotlight, Flashlight, Invert, Image } from 'mouse-animations';

// ─── Utils ────────────────────────────────────────────────────────────────────

function getElement<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function getInput(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement;
}

function getOutput(id: string): HTMLOutputElement {
  return document.getElementById(id) as HTMLOutputElement;
}

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha.toFixed(2)})`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildCodeSnippet(className: string, opts: Record<string, unknown>): string {
  const rows = Object.entries(opts).map(([key, value]) => {
    let renderedValue: string;
    if (typeof value === 'string') {
      renderedValue = `<span class="tok-str">'${escapeHtml(value)}'</span>`;
    } else if (Array.isArray(value)) {
      renderedValue =
        '<span class="tok-pun">[</span>' +
        (value as string[])
          .map(item => `<span class="tok-str">'${escapeHtml(item)}'</span>`)
          .join('<span class="tok-pun">, </span>') +
        '<span class="tok-pun">]</span>';
    } else if (typeof value === 'object' && value !== null) {
      const inner = Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => `<span class="tok-key">${k}</span><span class="tok-pun">: </span><span class="tok-str">'${escapeHtml(String(v))}'</span>`)
        .join('<span class="tok-pun">, </span>');
      renderedValue = `<span class="tok-pun">{ </span>${inner}<span class="tok-pun"> }</span>`;
    } else {
      renderedValue = `<span class="tok-num">${value}</span>`;
    }
    return `  <span class="tok-key">${key}</span><span class="tok-pun">:</span> ${renderedValue}<span class="tok-pun">,</span>`;
  });
  return [
    `<span class="tok-kw">new</span> <span class="tok-cls">${className}</span><span class="tok-pun">({</span>`,
    ...rows,
    `<span class="tok-pun">})</span>`,
  ].join('\n');
}

function renderCode(codeElementId: string, className: string, opts: Record<string, unknown>): void {
  getElement(codeElementId).innerHTML = buildCodeSnippet(className, opts);
}

function setCardActive(buttonId: string, cardId: string, active: boolean): void {
  const button = getElement(buttonId);
  button.classList.toggle('on', active);
  button.textContent = active ? 'Disable' : 'Enable';
  getElement(cardId).classList.toggle('active', active);
}

// ─── Trail ────────────────────────────────────────────────────────────────────

{
  let instance: Trail | null = null;

  function getOpts() {
    return {
      color:  getInput('trail-color').value,
      size:   +getInput('trail-size').value,
      length: +getInput('trail-length').value,
      decay:  +(+getInput('trail-decay').value / 100).toFixed(2),
      blur:   +getInput('trail-blur').value,
    };
  }

  function refresh(): void {
    const opts = getOpts();
    renderCode('code-trail', 'Trail', opts);
    if (instance) { instance.destroy(); instance = new Trail(opts); }
  }

  renderCode('code-trail', 'Trail', getOpts());

  getInput('trail-color').addEventListener('input', event => {
    const color = (event.target as HTMLInputElement).value;
    getElement('trail-color-hex').textContent = color;
    refresh();
  });

  getInput('trail-size').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('trail-size-val').value = String(value);
    refresh();
  });

  getInput('trail-length').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('trail-length-val').value = String(value);
    refresh();
  });

  getInput('trail-decay').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('trail-decay-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getInput('trail-blur').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('trail-blur-val').value = String(value);
    refresh();
  });

  getElement('btn-trail').addEventListener('click', () => {
    if (instance) {
      instance.destroy();
      instance = null;
      setCardActive('btn-trail', 'card-trail', false);
    } else {
      instance = new Trail(getOpts());
      setCardActive('btn-trail', 'card-trail', true);
    }
  });
}

// ─── Ripple ───────────────────────────────────────────────────────────────────

{
  let instance: Ripple | null = null;

  function getOpts() {
    const hex   = getInput('ripple-color').value;
    const alpha = +getInput('ripple-opacity').value / 100;
    return {
      color:    hexToRgba(hex, alpha),
      duration: +getInput('ripple-duration').value,
      maxSize:  +getInput('ripple-size').value,
    };
  }

  function refresh(): void {
    const opts = getOpts();
    renderCode('code-ripple', 'Ripple', opts);
    if (instance) { instance.destroy(); instance = new Ripple(opts); }
  }

  renderCode('code-ripple', 'Ripple', getOpts());

  getInput('ripple-color').addEventListener('input', event => {
    const color = (event.target as HTMLInputElement).value;
    getElement('ripple-color-hex').textContent = color;
    refresh();
  });

  getInput('ripple-opacity').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('ripple-opacity-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getInput('ripple-duration').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('ripple-duration-val').value = String(value);
    refresh();
  });

  getInput('ripple-size').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('ripple-size-val').value = String(value);
    refresh();
  });

  getElement('btn-ripple').addEventListener('click', () => {
    if (instance) {
      instance.destroy();
      instance = null;
      setCardActive('btn-ripple', 'card-ripple', false);
    } else {
      instance = new Ripple(getOpts());
      setCardActive('btn-ripple', 'card-ripple', true);
    }
  });
}

// ─── Custom Cursor ────────────────────────────────────────────────────────────

{
  let instance: CustomCursor | null = null;

  function getOpts() {
    const outerHex   = getInput('cursor-outer-color').value;
    const outerAlpha = +getInput('cursor-outer-opacity').value / 100;
    return {
      innerSize:  +getInput('cursor-inner-size').value,
      outerSize:  +getInput('cursor-outer-size').value,
      innerColor:  getInput('cursor-inner-color').value,
      outerColor:  hexToRgba(outerHex, outerAlpha),
      smoothness: +(+getInput('cursor-smooth').value / 100).toFixed(2),
    };
  }

  function refresh(): void {
    const opts = getOpts();
    renderCode('code-cursor', 'CustomCursor', opts);
    if (instance) { instance.destroy(); instance = new CustomCursor(opts); }
  }

  renderCode('code-cursor', 'CustomCursor', getOpts());

  getInput('cursor-inner-color').addEventListener('input', event => {
    const color = (event.target as HTMLInputElement).value;
    getElement('cursor-inner-hex').textContent = color;
    refresh();
  });

  getInput('cursor-outer-color').addEventListener('input', event => {
    const color = (event.target as HTMLInputElement).value;
    getElement('cursor-outer-hex').textContent = color;
    refresh();
  });

  getInput('cursor-inner-size').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('cursor-inner-size-val').value = String(value);
    refresh();
  });

  getInput('cursor-outer-opacity').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('cursor-outer-opacity-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getInput('cursor-outer-size').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('cursor-outer-size-val').value = String(value);
    refresh();
  });

  getInput('cursor-smooth').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('cursor-smooth-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getElement('btn-cursor').addEventListener('click', () => {
    if (instance) {
      instance.destroy();
      instance = null;
      setCardActive('btn-cursor', 'card-cursor', false);
    } else {
      instance = new CustomCursor(getOpts());
      setCardActive('btn-cursor', 'card-cursor', true);
    }
  });
}

// ─── Magnetic ─────────────────────────────────────────────────────────────────

{
  let instance: Magnetic | null = null;

  function getOpts() {
    return {
      selector: '.mag-target',
      strength: +(+getInput('mag-strength').value / 100).toFixed(2),
      radius:   +getInput('mag-radius').value,
      ease:     +(+getInput('mag-ease').value / 100).toFixed(2),
    };
  }

  function refresh(): void {
    const opts = getOpts();
    renderCode('code-magnetic', 'Magnetic', opts);
    if (instance) { instance.destroy(); instance = new Magnetic(opts); }
  }

  renderCode('code-magnetic', 'Magnetic', getOpts());

  getInput('mag-strength').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('mag-strength-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getInput('mag-radius').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('mag-radius-val').value = String(value);
    refresh();
  });

  getInput('mag-ease').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('mag-ease-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getElement('btn-magnetic').addEventListener('click', () => {
    if (instance) {
      instance.destroy();
      instance = null;
      setCardActive('btn-magnetic', 'card-magnetic', false);
    } else {
      instance = new Magnetic(getOpts());
      setCardActive('btn-magnetic', 'card-magnetic', true);
    }
  });
}

// ─── Particles ────────────────────────────────────────────────────────────────

{
  let instance: Particles | null = null;

  function getActiveColors(): string[] {
    return Array.from(document.querySelectorAll<HTMLElement>('#particles-palette .swatch.on'))
      .map(swatch => swatch.dataset['color']!);
  }

  function getOpts() {
    return {
      count:  +getInput('particles-count').value,
      colors:  getActiveColors(),
      size:   +getInput('particles-size').value,
      spread: +getInput('particles-spread').value,
      decay:  +(+getInput('particles-decay').value / 1000).toFixed(3),
    };
  }

  function refresh(): void {
    const opts = getOpts();
    renderCode('code-particles', 'Particles', opts);
    if (instance) { instance.destroy(); instance = new Particles(opts); }
  }

  renderCode('code-particles', 'Particles', getOpts());

  getInput('particles-count').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('particles-count-val').value = String(value);
    refresh();
  });

  getInput('particles-size').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('particles-size-val').value = String(value);
    refresh();
  });

  getInput('particles-spread').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('particles-spread-val').value = String(value);
    refresh();
  });

  getInput('particles-decay').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('particles-decay-val').value = (value / 1000).toFixed(3);
    refresh();
  });

  document.querySelectorAll<HTMLElement>('#particles-palette .swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const activeCount = document.querySelectorAll('#particles-palette .swatch.on').length;
      if (swatch.classList.contains('on') && activeCount <= 1) return;
      swatch.classList.toggle('on');
      refresh();
    });
  });

  getElement('btn-particles').addEventListener('click', () => {
    if (instance) {
      instance.destroy();
      instance = null;
      setCardActive('btn-particles', 'card-particles', false);
    } else {
      instance = new Particles(getOpts());
      setCardActive('btn-particles', 'card-particles', true);
    }
  });
}

// ─── Parallax ─────────────────────────────────────────────────────────────────

{
  let instance: Parallax | null = null;

  function getOpts() {
    return {
      selector: '.parallax-target',
      depth: +getInput('parallax-depth').value,
      ease:  +(+getInput('parallax-ease').value / 100).toFixed(2),
    };
  }

  function refresh(): void {
    const opts = getOpts();
    renderCode('code-parallax', 'Parallax', opts);
    if (instance) { instance.destroy(); instance = new Parallax(opts); }
  }

  renderCode('code-parallax', 'Parallax', getOpts());

  getInput('parallax-depth').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('parallax-depth-val').value = String(value);
    refresh();
  });

  getInput('parallax-ease').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('parallax-ease-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getElement('btn-parallax').addEventListener('click', () => {
    if (instance) {
      instance.destroy();
      instance = null;
      setCardActive('btn-parallax', 'card-parallax', false);
    } else {
      instance = new Parallax(getOpts());
      setCardActive('btn-parallax', 'card-parallax', true);
    }
  });
}

// ─── Logo demo — trail + cursor orbiting the M ────────────────────────────────

{
  const canvas = document.getElementById('logo-canvas') as HTMLCanvasElement;
  const span  = document.querySelector('.logo-anim') as HTMLElement;
  const ctx    = canvas.getContext('2d')!;

  let cx = 0, cy = 0, rx = 0, ry = 0;

  function updateGeometry(): void {
    const h1 = canvas.parentElement as HTMLElement;
    canvas.width  = h1.offsetWidth  || 1;
    canvas.height = h1.offsetHeight || 1;
    cx = span.offsetLeft + span.offsetWidth  / 2  + 50;
    cy = span.offsetTop  + span.offsetHeight / 2;
    rx = span.offsetWidth  * 0.62;
    ry = span.offsetHeight * 0.30;
  }

  window.addEventListener('resize', updateGeometry);

  let ox = 0, oy = 0;

  function frame(): void {
    const t = (Date.now() / 1400) % (Math.PI * 2);
    const x = cx + rx * Math.cos(t);
    const y = cy + ry * Math.sin(t);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ox += (x - ox) * 0.1;
    oy += (y - oy) * 0.1;

    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = 'rgba(134,239,172,0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ox, oy, 13, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  document.fonts.ready.then(() => {
    updateGeometry();
    ox = cx; oy = cy;
    requestAnimationFrame(frame);
  });
}

// ─── Tilt ─────────────────────────────────────────────────────────────────────

{
  let instance: Tilt | null = null;

  function getOpts() {
    return {
      selector:    '.tilt-target',
      maxTilt:     +getInput('tilt-max').value,
      perspective: +getInput('tilt-perspective').value,
      ease:        +(+getInput('tilt-ease').value / 100).toFixed(2),
      glare:        getInput('tilt-glare').checked,
    };
  }

  function refresh(): void {
    const opts = getOpts();
    renderCode('code-tilt', 'Tilt', opts);
    if (instance) { instance.destroy(); instance = new Tilt(opts); }
  }

  renderCode('code-tilt', 'Tilt', getOpts());

  getInput('tilt-max').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('tilt-max-val').value = String(value);
    refresh();
  });

  getInput('tilt-perspective').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('tilt-perspective-val').value = String(value);
    refresh();
  });

  getInput('tilt-ease').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('tilt-ease-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getInput('tilt-glare').addEventListener('change', () => refresh());

  getElement('btn-tilt').addEventListener('click', () => {
    if (instance) {
      instance.destroy();
      instance = null;
      setCardActive('btn-tilt', 'card-tilt', false);
    } else {
      instance = new Tilt(getOpts());
      setCardActive('btn-tilt', 'card-tilt', true);
    }
  });
}

// ─── Spotlight ────────────────────────────────────────────────────────────────

{
  let instance: Spotlight | null = null;

  function getOpts() {
    const hex     = getInput('spotlight-color').value;
    const opacity = +getInput('spotlight-opacity').value / 100;
    return {
      selector: '.spotlight-target',
      color: hexToRgba(hex, opacity),
      size: +getInput('spotlight-size').value,
    };
  }

  function refresh(): void {
    const opts = getOpts();
    renderCode('code-spotlight', 'Spotlight', opts);
    if (instance) { instance.destroy(); instance = new Spotlight(opts); }
  }

  renderCode('code-spotlight', 'Spotlight', getOpts());

  getInput('spotlight-color').addEventListener('input', event => {
    const color = (event.target as HTMLInputElement).value;
    getElement('spotlight-color-hex').textContent = color;
    refresh();
  });

  getInput('spotlight-opacity').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('spotlight-opacity-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getInput('spotlight-size').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('spotlight-size-val').value = String(value);
    refresh();
  });

  getElement('btn-spotlight').addEventListener('click', () => {
    if (instance) {
      instance.destroy();
      instance = null;
      setCardActive('btn-spotlight', 'card-spotlight', false);
    } else {
      instance = new Spotlight(getOpts());
      setCardActive('btn-spotlight', 'card-spotlight', true);
    }
  });
}

// ─── Flashlight ────────────────────────────────────────────────────────────────

{
  let instance: Flashlight | null = null;

  function getOpts() {
    return {
      backdrop: `rgba(0,0,0,${(+getInput('fl-opacity').value / 100).toFixed(2)})`,
      size: +getInput('fl-size').value,
      blur: +getInput('fl-blur').value,
      smoothness: +(+getInput('fl-smooth').value / 100).toFixed(2),
    };
  }

  function refresh(): void {
    const opts = getOpts();
    renderCode('code-flashlight', 'Flashlight', opts);
    if (instance) { instance.destroy(); instance = new Flashlight(opts); }
  }

  renderCode('code-flashlight', 'Flashlight', getOpts());

  getInput('fl-opacity').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('fl-opacity-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getInput('fl-size').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('fl-size-val').value = String(value);
    refresh();
  });

  getInput('fl-blur').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('fl-blur-val').value = String(value);
    refresh();
  });

  getInput('fl-smooth').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('fl-smooth-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getElement('btn-flashlight').addEventListener('click', () => {
    if (instance) {
      instance.destroy();
      instance = null;
      setCardActive('btn-flashlight', 'card-flashlight', false);
    } else {
      instance = new Flashlight(getOpts());
      setCardActive('btn-flashlight', 'card-flashlight', true);
    }
  });
}

// ─── Invert Cursor ────────────────────────────────────────────────────────────

{
  let instance: Invert | null = null;

  function getOpts() {
    return {
      color:      getInput('invert-color').value,
      size:       +getInput('invert-size').value,
      smoothness: +(+getInput('invert-smooth').value / 100).toFixed(2),
    };
  }

  function refresh(): void {
    const opts = getOpts();
    renderCode('code-invert', 'Invert', opts);
    if (instance) { instance.destroy(); instance = new Invert(opts); }
  }

  renderCode('code-invert', 'Invert', getOpts());
  instance = new Invert(getOpts());
  setCardActive('btn-invert', 'card-invert', true);

  getInput('invert-color').addEventListener('input', event => {
    const color = (event.target as HTMLInputElement).value;
    getElement('invert-color-hex').textContent = color;
    refresh();
  });

  getInput('invert-size').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('invert-size-val').value = String(value);
    refresh();
  });

  getInput('invert-smooth').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('invert-smooth-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getElement('btn-invert').addEventListener('click', () => {
    if (instance) {
      instance.destroy();
      instance = null;
      setCardActive('btn-invert', 'card-invert', false);
    } else {
      instance = new Invert(getOpts());
      setCardActive('btn-invert', 'card-invert', true);
    }
  });
}

// ─── Image Cursor ─────────────────────────────────────────────────────────────

{
  let instance: Image | null = null;

  const PRESETS: Record<string, string> = {
    star:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><polygon points="16,2 20,12 30,12 22,19 25,30 16,24 7,30 10,19 2,12 12,12" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/></svg>`,
    arrow:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M4 2L4 26L10 20L16 30L20 28L14 18L22 18Z" fill="#a78bfa" stroke="#7c3aed" stroke-width="1" stroke-linejoin="round"/></svg>`,
    crosshair: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="#60a5fa" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="10" stroke="#60a5fa" stroke-width="2"/><line x1="16" y1="22" x2="16" y2="30" stroke="#60a5fa" stroke-width="2"/><line x1="2" y1="16" x2="10" y2="16" stroke="#60a5fa" stroke-width="2"/><line x1="22" y1="16" x2="30" y2="16" stroke="#60a5fa" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="#60a5fa"/></svg>`,
    heart:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16 28C16 28 4 20 4 11C4 7 7 4 11 4C13.5 4 15.5 5.5 16 7C16.5 5.5 18.5 4 21 4C25 4 28 7 28 11C28 20 16 28 16 28Z" fill="#f43f5e" stroke="#be123c" stroke-width="1"/></svg>`,
  };

  const HOVER_PRESETS: Record<string, string> = {
    hand:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="11" y="2" width="4" height="13" rx="2" fill="#a78bfa"/><rect x="17" y="7" width="4" height="9" rx="2" fill="#a78bfa"/><rect x="23" y="9" width="4" height="8" rx="2" fill="#a78bfa"/><rect x="5" y="13" width="6" height="8" rx="2" fill="#a78bfa"/><rect x="11" y="15" width="16" height="10" rx="3" fill="#a78bfa"/></svg>`,
    lens:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="13" cy="13" r="9" fill="none" stroke="#60a5fa" stroke-width="2.5"/><line x1="19.5" y1="19.5" x2="29" y2="29" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    spark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16 2L17.5 13L28 16L17.5 19L16 30L14.5 19L4 16L14.5 13Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/></svg>`,
  };

  const ACTIVE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="5" fill="#f43f5e"/><circle cx="16" cy="16" r="10" fill="none" stroke="#f43f5e" stroke-width="2" opacity="0.6"/><circle cx="16" cy="16" r="15" fill="none" stroke="#f43f5e" stroke-width="1" opacity="0.3"/></svg>`;

  let activePreset = 'star';
  let activeHover  = 'none';

  function getOpts() {
    const states: Record<string, string> = {};
    if (activeHover !== 'none') states['hover'] = HOVER_PRESETS[activeHover]!;
    if (getInput('imgcursor-active').checked) states['active'] = ACTIVE_SVG;
    return {
      src:         PRESETS[activePreset]!,
      width:       +getInput('imgcursor-width').value,
      height:      +getInput('imgcursor-height').value,
      smoothness:  +(+getInput('imgcursor-smooth').value / 100).toFixed(2),
      overrideAll: getInput('imgcursor-override').checked,
      ...(Object.keys(states).length ? { states } : {}),
    };
  }

  function displayOpts() {
    const opts = getOpts();
    const display: Record<string, unknown> = {
      src: '<svg ...>',
      width: opts.width, height: opts.height, smoothness: opts.smoothness,
    };
    if (opts.overrideAll) display['overrideAll'] = true;
    if (opts.states) {
      display['states'] = Object.fromEntries(
        Object.keys(opts.states).map(k => [k, '<svg ...>'])
      );
    }
    return display;
  }

  function refresh(): void {
    renderCode('code-image', 'Image', displayOpts());
    if (instance) { instance.destroy(); instance = new Image(getOpts()); }
  }

  renderCode('code-image', 'Image', displayOpts());

  document.querySelectorAll<HTMLElement>('#imgcursor-presets .preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll<HTMLElement>('#imgcursor-presets .preset-btn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      activePreset = btn.dataset['preset']!;
      refresh();
    });
  });

  document.querySelectorAll<HTMLElement>('#imgcursor-hover-presets .preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll<HTMLElement>('#imgcursor-hover-presets .preset-btn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      activeHover = btn.dataset['hover']!;
      refresh();
    });
  });

  getInput('imgcursor-width').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('imgcursor-width-val').value = String(value);
    refresh();
  });

  getInput('imgcursor-height').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('imgcursor-height-val').value = String(value);
    refresh();
  });

  getInput('imgcursor-smooth').addEventListener('input', event => {
    const value = +(event.target as HTMLInputElement).value;
    getOutput('imgcursor-smooth-val').value = (value / 100).toFixed(2);
    refresh();
  });

  getInput('imgcursor-override').addEventListener('change', () => refresh());
  getInput('imgcursor-active').addEventListener('change', () => refresh());

  getElement('btn-image').addEventListener('click', () => {
    if (instance) {
      instance.destroy();
      instance = null;
      setCardActive('btn-image', 'card-image', false);
    } else {
      instance = new Image(getOpts());
      setCardActive('btn-image', 'card-image', true);
    }
  });
}

// ─── Copy install command ──────────────────────────────────────────────────────

{
  const btn = getElement<HTMLButtonElement>('copy-install');
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText('npm install mouse-animations').then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
  });
}
