import type { MouseAnimationsBase, ImageOptions } from '../core/types';

/** Elements that trigger the built-in 'hover' state. */
const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, summary, [tabindex]:not([tabindex="-1"])';

let sharedStyle: HTMLStyleElement | null = null;
let styleRefs = 0;

function acquireSharedStyle(): void {
  if (!sharedStyle) {
    sharedStyle = document.createElement('style');
    sharedStyle.textContent = `
      .__ma-img {
        position: fixed; top: 0; left: 0;
        pointer-events: none; z-index: 1000000;
        will-change: transform; user-select: none;
      }
      .__ma-hide, .__ma-hide * { cursor: none !important; }
    `;
    document.head.appendChild(sharedStyle);
  }
  styleRefs++;
}

function releaseSharedStyle(): void {
  if (--styleRefs <= 0) {
    sharedStyle?.remove();
    sharedStyle = null;
    styleRefs = 0;
  }
}

// Ref-counted __ma-hide class — prevents one instance's disable() from
// uncovering the cursor while another instance is still active.
let hideCount: number = 0;

function acquireHideClass(): void {
  if (++hideCount === 1) document.body.classList.add('__ma-hide');
}

function releaseHideClass(): void {
  if (--hideCount <= 0) {
    hideCount = 0;
    document.body.classList.remove('__ma-hide');
  }
}

export class Image implements MouseAnimationsBase {
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
  // Pre-rendered element per state — switching states is O(1) DOM toggle, no re-parse.
  private readonly stateEls: Map<string, HTMLElement> = new Map();
  private overrideStyle: HTMLStyleElement | null = null;
  private hidingCursor: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private curX: number = 0;
  private curY: number = 0;
  private rafId: number | null = null;
  private active: boolean  = false;
  private firstMove: boolean  = true;
  private currentState: string  = 'normal';
  private isMouseDown: boolean  = false;

  constructor(options: ImageOptions) {
    const { src, states = {}, overrideAll = false, hideDefault = true,
            width = 32, height = 32, offsetX = 0, offsetY = 0, smoothness = 1 } = options;
    this.src = src;
    this.states = { ...states };
    this.opts = { width, height, offsetX, offsetY, smoothness, hideDefault, overrideAll };
    acquireSharedStyle();
    this.el = this.buildContainer();
    document.body.appendChild(this.el);
    this.enable();
  }

  // ─── DOM helpers ────────────────────────────────────────────────────────────

  private buildContainer(): HTMLElement {
    const el = document.createElement('div');
    el.className = '__ma-img';
    el.hidden = true;

    const normalEl = this.createStateEl(this.src);
    this.stateEls.set('normal', normalEl);
    el.appendChild(normalEl);

    for (const [key, src] of Object.entries(this.states)) {
      const stateEl = this.createStateEl(src);
      stateEl.hidden = true;
      this.stateEls.set(key, stateEl);
      el.appendChild(stateEl);
    }

    return el;
  }

  private createStateEl(src: string): HTMLElement {
    const wrapper = document.createElement('div');
    this.renderContent(wrapper, src);
    return wrapper;
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

  // ─── Position ───────────────────────────────────────────────────────────────

  private updatePosition(): void {
    const { offsetX, offsetY, width, height } = this.opts;
    this.el.style.transform = `translate(${this.curX + offsetX - width / 2}px, ${this.curY + offsetY - height / 2}px)`;
  }

  private applyCursorHiding(): void {
    if (this.opts.overrideAll) {
      this.overrideStyle = document.createElement('style');
      this.overrideStyle.textContent = '* { cursor: none !important; }';
      document.head.appendChild(this.overrideStyle);
    } else if (this.opts.hideDefault) {
      acquireHideClass();
      this.hidingCursor = true;
    }
  }

  private removeCursorHiding(): void {
    if (this.overrideStyle) { this.overrideStyle.remove(); this.overrideStyle = null; }
    if (this.hidingCursor) { releaseHideClass(); this.hidingCursor = false; }
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
      this.applyCursorHiding();
      if (this.opts.smoothness < 1) this.rafId = requestAnimationFrame(this.loop);
      return;
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
    const prevEl: HTMLElement | undefined = this.stateEls.get(this.currentState);
    if (prevEl) prevEl.hidden = true;
    const nextEl: HTMLElement = this.stateEls.get(state) ?? this.stateEls.get('normal')!;
    nextEl.hidden = false;
    this.currentState = state;
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

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Update the cursor image for a given state at runtime.
   * - `'normal'` — default cursor
   * - `'hover'`  — shown over interactive elements (a, button, input…)
   * - `'active'` — shown while mouse button is held down
   * - Any other string is treated as a CSS selector
   */
  setSource(state: 'normal' | 'hover' | 'active' | string, src: string): void {
    if (state === 'normal') this.src = src;
    else this.states[state] = src;

    const existing: HTMLElement | undefined = this.stateEls.get(state);
    if (existing) {
      this.renderContent(existing, src);
    } else {
      const stateEl: HTMLElement = this.createStateEl(src);
      stateEl.hidden = this.currentState !== state;
      this.stateEls.set(state, stateEl);
      this.el.appendChild(stateEl);
    }
  }

  enable(): void {
    if (this.active) return;
    this.active = true;
    this.firstMove = true;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseover', this.onMouseOver);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    this.removeCursorHiding();
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
    releaseSharedStyle();
  }
}