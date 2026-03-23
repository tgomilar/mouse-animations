import type { MouseAnimationsBase, ImageCursorOptions } from '../core/types';

/** Elements that trigger the built-in 'hover' state. */
const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, summary, [tabindex]:not([tabindex="-1"])';

/**
 * Replaces the native cursor with a custom image or inline SVG element.
 */
export class ImageCursor implements MouseAnimationsBase {
  private src: string;
  private readonly states: Record<string, string>;
  private readonly opts: {
    width: number; height: number;
    offsetX: number; offsetY: number;
    smoothness: number;
    hideDefault: boolean;
    overrideAll: boolean;
  };
  private readonly el: HTMLElement;
  private readonly style: HTMLStyleElement;
  private overrideStyle: HTMLStyleElement | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private curX = 0;
  private curY = 0;
  private rafId: number | null = null;
  private active = false;
  private currentState = 'normal';
  private isMouseDown = false;

  constructor(options: ImageCursorOptions) {
    const { src, states = {}, overrideAll = false, hideDefault = true,
            width = 32, height = 32, offsetX = 0, offsetY = 0, smoothness = 1 } = options;
    this.src = src;
    this.states = { ...states };
    this.opts = { width, height, offsetX, offsetY, smoothness, hideDefault, overrideAll };
    this.style = this.injectStyles();
    this.el = this.buildElement(src);
    document.body.appendChild(this.el);
    this.enable();
  }

  // ─── DOM helpers ────────────────────────────────────────────────────────────

  private buildElement(src: string): HTMLElement {
    const el = document.createElement('div');
    el.className = '__ma-img-cursor';
    this.renderContent(el, src);
    return el;
  }

  private renderContent(container: HTMLElement, src: string): void {
    container.innerHTML = '';
    const { width, height } = this.opts;
    if (src.trimStart().startsWith('<svg')) {
      container.innerHTML = src;
      const svg = container.querySelector('svg');
      if (svg) { svg.style.width = `${width}px`; svg.style.height = `${height}px`; svg.style.display = 'block'; }
    } else {
      const img = document.createElement('img');
      img.src = src; img.width = width; img.height = height;
      img.draggable = false; img.style.display = 'block';
      container.appendChild(img);
    }
  }

  private injectStyles(): HTMLStyleElement {
    const s = document.createElement('style');
    s.textContent = `
      .__ma-img-cursor {
        position: fixed; top: 0; left: 0;
        pointer-events: none; z-index: 1000000;
        will-change: transform; user-select: none;
      }
      .__ma-hide-cursor, .__ma-hide-cursor * { cursor: none !important; }
    `;
    document.head.appendChild(s);
    return s;
  }

  // ─── Position ───────────────────────────────────────────────────────────────

  private updatePosition(): void {
    const { offsetX, offsetY } = this.opts;
    this.el.style.transform = `translate(${this.curX + offsetX}px, ${this.curY + offsetY}px)`;
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    if (this.opts.smoothness >= 1) {
      this.curX = this.mouseX; this.curY = this.mouseY;
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

  // ─── State machine ──────────────────────────────────────────────────────────

  private resolveState(target: EventTarget | null): string {
    const el = target as Element | null;
    if (!el || typeof el.closest !== 'function') return 'normal';

    // Custom selector states take priority (checked in insertion order)
    for (const key of Object.keys(this.states)) {
      if (key !== 'hover' && key !== 'active') {
        try { if (el.closest(key)) return key; } catch { /* invalid selector */ }
      }
    }

    if ('hover' in this.states && el.closest(INTERACTIVE)) return 'hover';

    return 'normal';
  }

  private switchState(state: string): void {
    if (state === this.currentState) return;
    this.currentState = state;
    this.renderContent(this.el, state === 'normal' ? this.src : (this.states[state] ?? this.src));
  }

  private onMouseOver = (e: MouseEvent): void => {
    if (!this.isMouseDown) this.switchState(this.resolveState(e.target));
  };

  private onMouseDown = (): void => {
    if ('active' in this.states) { this.isMouseDown = true; this.switchState('active'); }
  };

  private onMouseUp = (): void => {
    this.isMouseDown = false;
    this.switchState(this.resolveState(document.elementFromPoint(this.mouseX, this.mouseY)));
  };

  private get hasStates(): boolean {
    return Object.keys(this.states).length > 0;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Update the cursor image for a given state at runtime.
   * - `'normal'` — default cursor
   * - `'hover'`  — shown over interactive elements (a, button, input…)
   * - `'active'` — shown while mouse button is held down
   * - Any other string is treated as a CSS selector
   */
  setSource(state: 'normal' | 'hover' | 'active' | string, src: string): void {
    if (state === 'normal') {
      this.src = src;
      if (this.currentState === 'normal') this.renderContent(this.el, src);
    } else {
      this.states[state] = src;
      if (this.currentState === state) this.renderContent(this.el, src);
    }
  }

  enable(): void {
    if (this.active) return;
    this.active = true;

    if (this.opts.overrideAll) {
      this.overrideStyle = document.createElement('style');
      this.overrideStyle.textContent = '* { cursor: none !important; }';
      document.head.appendChild(this.overrideStyle);
    } else if (this.opts.hideDefault) {
      document.body.classList.add('__ma-hide-cursor');
    }

    document.addEventListener('mousemove', this.onMouseMove);
    if (this.hasStates) {
      document.addEventListener('mouseover', this.onMouseOver);
      document.addEventListener('mousedown', this.onMouseDown);
      document.addEventListener('mouseup', this.onMouseUp);
    }
    this.el.hidden = false;
    if (this.opts.smoothness < 1) this.rafId = requestAnimationFrame(this.loop);
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    document.body.classList.remove('__ma-hide-cursor');
    if (this.overrideStyle) { this.overrideStyle.remove(); this.overrideStyle = null; }
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseover', this.onMouseOver);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    this.el.hidden = true;
  }

  destroy(): void {
    this.disable();
    this.el.remove();
    this.style.remove();
  }
}
