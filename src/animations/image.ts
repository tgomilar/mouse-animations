import { MouseFollower } from '../core/mouse-follower';
import type { MouseAnimationsBase, ImageOptions } from '../core/types';

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, select, textarea, label, summary, [tabindex]:not([tabindex="-1"])';

let sharedStyleElement: HTMLStyleElement | null = null;
let sharedStyleReferenceCount = 0;

function acquireSharedStyle(): void {
  if (!sharedStyleElement) {
    sharedStyleElement = document.createElement('style');
    sharedStyleElement.textContent = `
      .__ma-img {
        position: fixed; top: 0; left: 0;
        pointer-events: none; z-index: 1000000;
        will-change: transform; user-select: none;
      }
      .__ma-hide, .__ma-hide * { cursor: none !important; }
    `;
    document.head.appendChild(sharedStyleElement);
  }
  sharedStyleReferenceCount++;
}

function releaseSharedStyle(): void {
  if (--sharedStyleReferenceCount <= 0) {
    sharedStyleElement?.remove();
    sharedStyleElement = null;
    sharedStyleReferenceCount = 0;
  }
}

let hideClassCount = 0;

function acquireHideClass(): void {
  if (++hideClassCount === 1) document.body.classList.add('__ma-hide');
}

function releaseHideClass(): void {
  if (--hideClassCount <= 0) {
    hideClassCount = 0;
    document.body.classList.remove('__ma-hide');
  }
}

export class Image implements MouseAnimationsBase {
  private imageSource: string;
  private readonly stateSources: Record<string, string>;
  private readonly options: {
    width: number; height: number;
    offsetX: number; offsetY: number;
    smoothness: number;
    hideDefault: boolean;
    overrideAll: boolean;
  };
  private readonly imageElement: HTMLElement;
  private readonly stateElements: Map<string, HTMLElement> = new Map();
  private overrideStyle: HTMLStyleElement | null = null;
  private isHidingCursor: boolean = false;
  private lastKnownX: number = 0;
  private lastKnownY: number = 0;
  private readonly follower: MouseFollower;
  private active: boolean = false;
  private currentState: string = 'normal';
  private isMouseDown: boolean = false;

  constructor(options: ImageOptions) {
    const { src, states = {}, overrideAll = false, hideDefault = true,
            width = 32, height = 32, offsetX = 0, offsetY = 0, smoothness = 1 } = options;
    this.imageSource = src;
    this.stateSources = { ...states };
    this.options = { width, height, offsetX, offsetY, smoothness, hideDefault, overrideAll };
    acquireSharedStyle();
    this.imageElement = this.buildContainer();
    document.body.appendChild(this.imageElement);
    this.follower = new MouseFollower({
      smoothness: this.options.smoothness,
      onRawMove: (x, y) => {
        this.lastKnownX = x;
        this.lastKnownY = y;
      },
      onFrame: (x, y) => {
        this.applyPosition(x, y);
      },
      onFirstMove: (x, y) => {
        this.applyPosition(x, y);
        this.imageElement.hidden = false;
        this.applyCursorHiding();
      },
    });
    this.enable();
  }

  // ─── DOM helpers ────────────────────────────────────────────────────────────

  private buildContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = '__ma-img';
    container.hidden = true;

    const normalElement = this.createStateElement(this.imageSource);
    this.stateElements.set('normal', normalElement);
    container.appendChild(normalElement);

    for (const [key, src] of Object.entries(this.stateSources)) {
      const stateElement = this.createStateElement(src);
      stateElement.hidden = true;
      this.stateElements.set(key, stateElement);
      container.appendChild(stateElement);
    }

    return container;
  }

  private createStateElement(src: string): HTMLElement {
    const wrapper = document.createElement('div');
    this.renderContent(wrapper, src);
    return wrapper;
  }

  private renderContent(container: HTMLElement, src: string): void {
    container.innerHTML = '';
    const { width, height } = this.options;
    if (src.trimStart().startsWith('<svg')) {
      container.innerHTML = src;
      const svg = container.querySelector('svg');
      if (svg) { svg.style.width = `${width}px`; svg.style.height = `${height}px`; svg.style.display = 'block'; }
    } else {
      const image = document.createElement('img');
      image.src = src; image.width = width; image.height = height;
      image.draggable = false; image.style.display = 'block';
      container.appendChild(image);
    }
  }

  // ─── Position ───────────────────────────────────────────────────────────────

  private applyPosition(x: number, y: number): void {
    const { offsetX, offsetY, width, height } = this.options;
    this.imageElement.style.transform = `translate(${x + offsetX - width / 2}px, ${y + offsetY - height / 2}px)`;
  }

  private applyCursorHiding(): void {
    if (this.options.overrideAll) {
      this.overrideStyle = document.createElement('style');
      this.overrideStyle.textContent = '* { cursor: none !important; }';
      document.head.appendChild(this.overrideStyle);
    } else if (this.options.hideDefault) {
      acquireHideClass();
      this.isHidingCursor = true;
    }
  }

  private removeCursorHiding(): void {
    if (this.overrideStyle) { this.overrideStyle.remove(); this.overrideStyle = null; }
    if (this.isHidingCursor) { releaseHideClass(); this.isHidingCursor = false; }
  }

  // ─── State machine ──────────────────────────────────────────────────────────

  private resolveState(target: EventTarget | null): string {
    const element = target as Element | null;
    if (!element || typeof element.closest !== 'function') return 'normal';

    for (const key of Object.keys(this.stateSources)) {
      if (key !== 'hover' && key !== 'active') {
        try { if (element.closest(key)) return key; } catch { /* invalid selector */ }
      }
    }

    if ('hover' in this.stateSources && element.closest(INTERACTIVE_SELECTOR)) return 'hover';

    return 'normal';
  }

  private switchState(state: string): void {
    if (state === this.currentState) return;
    const previousElement = this.stateElements.get(this.currentState);
    if (previousElement) previousElement.hidden = true;
    const nextElement = this.stateElements.get(state) ?? this.stateElements.get('normal')!;
    nextElement.hidden = false;
    this.currentState = state;
  }

  private onMouseOver = (e: MouseEvent): void => {
    if (!this.isMouseDown) this.switchState(this.resolveState(e.target));
  };

  private onMouseDown = (): void => {
    if ('active' in this.stateSources) { this.isMouseDown = true; this.switchState('active'); }
  };

  private onMouseUp = (): void => {
    this.isMouseDown = false;
    this.switchState(this.resolveState(document.elementFromPoint(this.lastKnownX, this.lastKnownY)));
  };

  // ─── Public API ─────────────────────────────────────────────────────────────

  setSource(state: 'normal' | 'hover' | 'active' | string, src: string): void {
    if (state === 'normal') this.imageSource = src;
    else this.stateSources[state] = src;

    const existingElement = this.stateElements.get(state);
    if (existingElement) {
      this.renderContent(existingElement, src);
    } else {
      const stateElement = this.createStateElement(src);
      stateElement.hidden = this.currentState !== state;
      this.stateElements.set(state, stateElement);
      this.imageElement.appendChild(stateElement);
    }
  }

  enable(): void {
    if (this.active) return;
    this.active = true;
    this.follower.start();
    document.addEventListener('mouseover', this.onMouseOver);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    this.removeCursorHiding();
    this.follower.stop();
    document.removeEventListener('mouseover', this.onMouseOver);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.imageElement.hidden = true;
  }

  destroy(): void {
    this.disable();
    this.follower.destroy();
    this.imageElement.remove();
    releaseSharedStyle();
  }
}
