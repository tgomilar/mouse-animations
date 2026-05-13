import { MouseFollower } from '../core/mouse-follower';
import type { MouseAnimationsBase, InvertOptions } from '../core/types';

export class Invert implements MouseAnimationsBase {
  private readonly options: Required<InvertOptions>;
  private readonly invertElement: HTMLElement;
  private readonly styleElement: HTMLStyleElement;
  private readonly follower: MouseFollower;
  private active = false;

  constructor(options: InvertOptions = {}) {
    this.options = { size: 40, color: '#ffffff', smoothness: 1, hideDefault: true, ...options };
    this.styleElement = this.injectStyles();
    this.invertElement = this.buildElement();
    document.body.appendChild(this.invertElement);
    this.follower = new MouseFollower({
      smoothness: this.options.smoothness,
      onFrame: (x, y) => {
        this.invertElement.style.transform = `translate(${x}px, ${y}px)`;
      },
      onFirstMove: (x, y) => {
        this.invertElement.style.transform = `translate(${x}px, ${y}px)`;
        this.invertElement.hidden = false;
        if (this.options.hideDefault) document.body.classList.add('__ma-invert-hide');
      },
    });
    this.enable();
  }

  private buildElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = '__ma-invert';
    element.hidden = true;
    element.style.width = `${this.options.size}px`;
    element.style.height = `${this.options.size}px`;
    return element;
  }

  private injectStyles(): HTMLStyleElement {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .__ma-invert {
        position: fixed; top: 0; left: 0;
        border-radius: 50%;
        background: ${this.options.color};
        mix-blend-mode: difference;
        pointer-events: none; z-index: 1000000;
        will-change: transform; user-select: none;
        translate: -50% -50%;
      }
      .__ma-invert-hide, .__ma-invert-hide * { cursor: none !important; }
    `;
    document.head.appendChild(styleElement);
    return styleElement;
  }

  enable(): void {
    if (this.active) return;
    this.active = true;
    this.follower.start();
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    document.body.classList.remove('__ma-invert-hide');
    this.follower.stop();
    this.invertElement.hidden = true;
  }

  destroy(): void {
    this.disable();
    this.follower.destroy();
    this.invertElement.remove();
    this.styleElement.remove();
  }
}
