import type { MouseAnimationsBase, InvertOptions } from '../core/types';

/**
 * Renders an opaque white circle that follows the cursor and inverts the colors
 * of everything it passes over via mix-blend-mode: difference.
 */
export class Invert implements MouseAnimationsBase {
  private readonly opts: Required<InvertOptions>;
  private readonly el: HTMLElement;
  private readonly style: HTMLStyleElement;
  private mouseX = 0;
  private mouseY = 0;
  private curX = 0;
  private curY = 0;
  private rafId: number | null = null;
  private active = false;
  private firstMove = true;

  constructor(options: InvertOptions = {}) {
    this.opts = { size: 40, color: '#ffffff', smoothness: 1, hideDefault: true, ...options };
    this.style = this.injectStyles();
    this.el = this.buildElement();
    document.body.appendChild(this.el);
    this.enable();
  }

  private buildElement(): HTMLElement {
    const el = document.createElement('div');
    el.className = '__ma-invert';
    el.hidden = true;
    el.style.width = `${this.opts.size}px`;
    el.style.height = `${this.opts.size}px`;
    return el;
  }

  private injectStyles(): HTMLStyleElement {
    const s = document.createElement('style');
    s.textContent = `
      .__ma-invert {
        position: fixed; top: 0; left: 0;
        border-radius: 50%;
        background: ${this.opts.color};
        mix-blend-mode: difference;
        pointer-events: none; z-index: 1000000;
        will-change: transform; user-select: none;
        translate: -50% -50%;
      }
      .__ma-invert-hide, .__ma-invert-hide * { cursor: none !important; }
    `;
    document.head.appendChild(s);
    return s;
  }

  private updatePosition(): void {
    this.el.style.transform = `translate(${this.curX}px, ${this.curY}px)`;
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    if (this.firstMove) {
      this.firstMove = false;
      this.curX = this.mouseX;
      this.curY = this.mouseY;
      this.updatePosition();
      this.el.hidden = false;
      if (this.opts.hideDefault) document.body.classList.add('__ma-invert-hide');
    }
    if (this.opts.smoothness >= 1) {
      this.curX = this.mouseX;
      this.curY = this.mouseY;
      this.updatePosition();
    }
  };

  private loop = (): void => {
    if (!this.active) return;
    this.curX += (this.mouseX - this.curX) * this.opts.smoothness;
    this.curY += (this.mouseY - this.curY) * this.opts.smoothness;
    this.updatePosition();
    this.rafId = requestAnimationFrame(this.loop);
  };

  enable(): void {
    if (this.active) return;
    this.active = true;
    this.firstMove = true;
    document.addEventListener('mousemove', this.onMouseMove);
    if (this.opts.smoothness < 1) this.rafId = requestAnimationFrame(this.loop);
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    document.body.classList.remove('__ma-invert-hide');
    document.removeEventListener('mousemove', this.onMouseMove);
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    this.el.hidden = true;
  }

  destroy(): void {
    this.disable();
    this.el.remove();
    this.style.remove();
  }
}
