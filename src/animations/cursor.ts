import type { MouseAnimationsBase, CustomCursorOptions } from '../core/types';

/**
 * Replaces the native cursor with a dot + lagging ring.
 */
export class CustomCursor implements MouseAnimationsBase {
  private readonly opts: Required<CustomCursorOptions>;
  private readonly inner: HTMLElement;
  private readonly outer: HTMLElement;
  private readonly style: HTMLStyleElement;
  private mouseX = 0;
  private mouseY = 0;
  private outerX = 0;
  private outerY = 0;
  private rafId: number | null = null;
  private active = false;

  constructor(options: CustomCursorOptions = {}) {
    this.opts = {
      innerSize: 8,
      outerSize: 36,
      innerColor: '#ffffff',
      outerColor: 'rgba(255,255,255,0.5)',
      smoothness: 0.15,
      hideDefault: true,
      ...options,
    };
    this.style = this.injectStyles();
    this.inner = this.createElement('__ma-cursor-dot');
    this.outer = this.createElement('__ma-cursor-ring');
    document.body.append(this.inner, this.outer);
    this.enable();
  }

  private createElement(cls: string): HTMLElement {
    const el = document.createElement('div');
    el.className = cls;
    return el;
  }

  private injectStyles(): HTMLStyleElement {
    const { innerSize, outerSize, innerColor, outerColor } = this.opts;
    const s = document.createElement('style');
    s.textContent = `
      .__ma-cursor-dot,.__ma-cursor-ring {
        position: fixed;
        top: 0; left: 0;
        pointer-events: none;
        border-radius: 50%;
        z-index: 1000000;
        transform: translate(-50%,-50%);
        will-change: left, top;
      }
      .__ma-cursor-dot {
        width: ${innerSize}px; height: ${innerSize}px;
        background: ${innerColor};
      }
      .__ma-cursor-ring {
        width: ${outerSize}px; height: ${outerSize}px;
        border: 2px solid ${outerColor};
        background: transparent;
      }
      .__ma-hide-cursor, .__ma-hide-cursor * { cursor: none !important; }
    `;
    document.head.appendChild(s);
    return s;
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.inner.style.left = `${e.clientX}px`;
    this.inner.style.top = `${e.clientY}px`;
  };

  private loop = (): void => {
    if (!this.active) return;
    const ease = this.opts.smoothness;
    this.outerX += (this.mouseX - this.outerX) * ease;
    this.outerY += (this.mouseY - this.outerY) * ease;
    this.outer.style.left = `${this.outerX}px`;
    this.outer.style.top = `${this.outerY}px`;
    this.rafId = requestAnimationFrame(this.loop);
  };

  enable(): void {
    if (this.active) return;
    this.active = true;
    if (this.opts.hideDefault) document.body.classList.add('__ma-hide-cursor');
    document.addEventListener('mousemove', this.onMouseMove);
    this.inner.hidden = false;
    this.outer.hidden = false;
    this.rafId = requestAnimationFrame(this.loop);
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    document.body.classList.remove('__ma-hide-cursor');
    document.removeEventListener('mousemove', this.onMouseMove);
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    this.inner.hidden = true;
    this.outer.hidden = true;
  }

  destroy(): void {
    this.disable();
    this.inner.remove();
    this.outer.remove();
    this.style.remove();
  }
}
