import type { MouseAnimationsBase, RippleOptions } from '../core/types';

/**
 * Creates an expanding ripple circle at each click position.
 */
export class Ripple implements MouseAnimationsBase {
  private readonly opts: Required<RippleOptions>;
  private readonly container: HTMLDivElement;
  private readonly style: HTMLStyleElement;
  private active = false;

  constructor(options: RippleOptions = {}) {
    this.opts = {
      color: 'rgba(255, 255, 255, 0.4)',
      duration: 600,
      maxSize: 100,
      ...options,
    };
    this.style = this.injectStyles();
    this.container = this.createContainer();
    this.enable();
  }

  private createContainer(): HTMLDivElement {
    const el = document.createElement('div');
    el.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999998;overflow:hidden;';
    document.body.appendChild(el);
    return el;
  }

  private injectStyles(): HTMLStyleElement {
    const s = document.createElement('style');
    s.textContent = `
      @keyframes __ma-ripple-expand {
        from { transform: scale(0); opacity: 1; }
        to   { transform: scale(1); opacity: 0; }
      }
      .__ma-ripple-el {
        position: fixed;
        border-radius: 50%;
        pointer-events: none;
        animation: __ma-ripple-expand var(--_dur) ease-out forwards;
      }
    `;
    document.head.appendChild(s);
    return s;
  }

  private onClick = (e: MouseEvent): void => {
    const { maxSize, color, duration } = this.opts;
    const el = document.createElement('div');
    el.className = '__ma-ripple-el';
    el.style.cssText = `
      width:${maxSize}px;height:${maxSize}px;
      left:${e.clientX - maxSize / 2}px;top:${e.clientY - maxSize / 2}px;
      background:${color};
      --_dur:${duration}ms;
    `;
    this.container.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  };

  enable(): void {
    if (this.active) return;
    this.active = true;
    document.addEventListener('click', this.onClick);
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    document.removeEventListener('click', this.onClick);
  }

  destroy(): void {
    this.disable();
    this.container.remove();
    this.style.remove();
  }
}
