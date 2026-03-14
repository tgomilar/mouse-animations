import { Trail, Ripple, CustomCursor, Magnetic, Particles, Parallax, Tilt } from 'mouse-animations';

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
  instance = new Trail(getOpts());
  setCardActive('btn-trail', 'card-trail', true);

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
