import type { MouseAnimationsBase, RippleOptions } from '../core/types';

export class Ripple implements MouseAnimationsBase {
  private readonly options: Required<RippleOptions>;
  private readonly containerElement: HTMLDivElement;
  private readonly styleElement: HTMLStyleElement;
  private active = false;

  constructor(options: RippleOptions = {}) {
    this.options = {
      color: 'rgba(255, 255, 255, 0.4)',
      duration: 600,
      maxSize: 100,
      ...options,
    };
    this.styleElement = this.injectStyles();
    this.containerElement = this.createContainer();
    this.enable();
  }

  private createContainer(): HTMLDivElement {
    const containerElement = document.createElement('div');
    containerElement.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999998;overflow:hidden;';
    document.body.appendChild(containerElement);
    return containerElement;
  }

  private injectStyles(): HTMLStyleElement {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
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
    document.head.appendChild(styleElement);
    return styleElement;
  }

  private onClick = (e: MouseEvent): void => {
    const { maxSize, color, duration } = this.options;
    const rippleElement = document.createElement('div');
    rippleElement.className = '__ma-ripple-el';
    rippleElement.style.cssText = `
      width:${maxSize}px;height:${maxSize}px;
      left:${e.clientX - maxSize / 2}px;top:${e.clientY - maxSize / 2}px;
      background:${color};
      --_dur:${duration}ms;
    `;
    this.containerElement.appendChild(rippleElement);
    rippleElement.addEventListener('animationend', () => rippleElement.remove(), { once: true });
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
    this.containerElement.remove();
    this.styleElement.remove();
  }
}
