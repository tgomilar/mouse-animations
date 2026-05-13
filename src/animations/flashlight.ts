import { MouseFollower } from '../core/mouse-follower';
import type { MouseAnimationsBase, FlashlightOptions } from '../core/types';

export class Flashlight implements MouseAnimationsBase {
  private readonly options: Required<FlashlightOptions>;
  private readonly styleElement: HTMLStyleElement;
  private readonly flashElement: HTMLElement;
  private readonly follower: MouseFollower;
  private active: boolean = false;

  constructor(options: FlashlightOptions = {}) {
    this.options = {
      backdrop: 'rgba(0,0,0,0.85)',
      size: 200,
      blur: 0,
      smoothness: 1,
      ...options,
    };
    this.styleElement = this.injectStyles();
    this.flashElement = this.buildElement();
    document.body.appendChild(this.flashElement);
    this.follower = new MouseFollower({
      smoothness: this.options.smoothness,
      onFrame: (x, y) => {
        this.flashElement.style.setProperty('--ma-fl-x', `${x}px`);
        this.flashElement.style.setProperty('--ma-fl-y', `${y}px`);
      },
      onFirstMove: (x, y) => {
        this.flashElement.style.setProperty('--ma-fl-x', `${x}px`);
        this.flashElement.style.setProperty('--ma-fl-y', `${y}px`);
        this.flashElement.hidden = false;
      },
    });
    this.enable();
  }

  private injectStyles(): HTMLStyleElement {
    const { blur, backdrop } = this.options;
    const styleElement: HTMLStyleElement = document.createElement('style');
    styleElement.textContent = `
      .__ma-flashlight {
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none; z-index: 1000000;
        ${blur ? `backdrop-filter: blur(${blur}px);` : ''}
        -webkit-mask-image: radial-gradient(
          circle var(--ma-fl-r, 200px) at var(--ma-fl-x, 50%) var(--ma-fl-y, 50%),
          transparent var(--ma-fl-r, 200px),
          black calc(var(--ma-fl-r, 200px) + 1px)
        );
        mask-image: radial-gradient(
          circle var(--ma-fl-r, 200px) at var(--ma-fl-x, 50%) var(--ma-fl-y, 50%),
          transparent var(--ma-fl-r, 200px),
          black calc(var(--ma-fl-r, 200px) + 1px)
        );
        -webkit-mask-composite: exclude;
        mask-composite: exclude;
        background: ${backdrop};
      }
    `;
    document.head.appendChild(styleElement);
    return styleElement;
  }

  private buildElement(): HTMLElement {
    const element: HTMLDivElement = document.createElement('div');
    element.className = '__ma-flashlight';
    element.hidden = true;
    element.style.setProperty('--ma-fl-r', `${this.options.size}px`);
    return element;
  }

  enable(): void {
    if (this.active) return;
    this.active = true;
    this.follower.start();
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    this.follower.stop();
    this.flashElement.hidden = true;
  }

  destroy(): void {
    this.disable();
    this.follower.destroy();
    this.flashElement.remove();
    this.styleElement.remove();
  }
}
