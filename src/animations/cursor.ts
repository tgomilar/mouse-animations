import { MouseFollower } from '../core/mouse-follower';
import type { MouseAnimationsBase, CustomCursorOptions } from '../core/types';

export class CustomCursor implements MouseAnimationsBase {
  private readonly options: Required<CustomCursorOptions>;
  private readonly innerDot: HTMLElement;
  private readonly outerRing: HTMLElement;
  private readonly styleElement: HTMLStyleElement;
  private readonly follower: MouseFollower;
  private active = false;

  constructor(options: CustomCursorOptions = {}) {
    this.options = {
      innerSize: 8,
      outerSize: 36,
      innerColor: '#ffffff',
      outerColor: 'rgba(255,255,255,0.5)',
      smoothness: 0.15,
      hideDefault: true,
      ...options,
    };
    this.styleElement = this.injectStyles();
    this.innerDot = this.createElement('__ma-cursor-dot');
    this.outerRing = this.createElement('__ma-cursor-ring');
    document.body.append(this.innerDot, this.outerRing);
    this.follower = new MouseFollower({
      smoothness: this.options.smoothness,
      onRawMove: (x, y) => {
        this.innerDot.style.left = `${x}px`;
        this.innerDot.style.top = `${y}px`;
      },
      onFrame: (x, y) => {
        this.outerRing.style.left = `${x}px`;
        this.outerRing.style.top = `${y}px`;
      },
      onFirstMove: () => {
        if (this.options.hideDefault) document.body.classList.add('__ma-hide-cursor');
        this.innerDot.hidden = false;
        this.outerRing.hidden = false;
      },
    });
    this.enable();
  }

  private createElement(className: string): HTMLElement {
    const element = document.createElement('div');
    element.className = className;
    return element;
  }

  private injectStyles(): HTMLStyleElement {
    const { innerSize, outerSize, innerColor, outerColor } = this.options;
    const styleElement = document.createElement('style');
    styleElement.textContent = `
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
    document.body.classList.remove('__ma-hide-cursor');
    this.follower.stop();
    this.innerDot.hidden = true;
    this.outerRing.hidden = true;
  }

  destroy(): void {
    this.disable();
    this.follower.destroy();
    this.innerDot.remove();
    this.outerRing.remove();
    this.styleElement.remove();
  }
}
