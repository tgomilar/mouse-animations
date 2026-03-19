import type { MouseAnimationsBase, ImageCursorOptions } from '../core/types';

/**
 * Replaces the native cursor with a custom image or inline SVG element.
 */
export class ImageCursor implements MouseAnimationsBase {
  private readonly opts: Required<ImageCursorOptions>;
  private readonly el: HTMLElement;
  private readonly style: HTMLStyleElement;
  private mouseX = 0;
  private mouseY = 0;
  private curX = 0;
  private curY = 0;
  private rafId: number | null = null;
  private active = false;

  constructor(options: ImageCursorOptions) {
    this.opts = {
      width: 32,
      height: 32,
      offsetX: 0,
      offsetY: 0,
      smoothness: 1,
      hideDefault: true,
      ...options,
    };
    this.style = this.injectStyles();
    this.el = this.createElement();
    document.body.appendChild(this.el);
    this.enable();
  }

  private createElement(): HTMLElement {
    const { src, width, height } = this.opts;
    const el = document.createElement('div');
    el.className = '__ma-img-cursor';

    if (src.trimStart().startsWith('<svg')) {
      el.innerHTML = src;
      const svg = el.querySelector('svg');
      if (svg) {
        svg.style.width = `${width}px`;
        svg.style.height = `${height}px`;
        svg.style.display = 'block';
      }
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.width = width;
      img.height = height;
      img.draggable = false;
      img.style.display = 'block';
      el.appendChild(img);
    }

    return el;
  }

  private injectStyles(): HTMLStyleElement {
    const s = document.createElement('style');
    s.textContent = `
      .__ma-img-cursor {
        position: fixed;
        top: 0; left: 0;
        pointer-events: none;
        z-index: 1000000;
        will-change: transform;
        user-select: none;
      }
      .__ma-hide-cursor, .__ma-hide-cursor * { cursor: none !important; }
    `;
    document.head.appendChild(s);
    return s;
  }

  private updatePosition(): void {
    const { offsetX, offsetY } = this.opts;
    this.el.style.transform = `translate(${this.curX + offsetX}px, ${this.curY + offsetY}px)`;
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
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
    if (this.opts.hideDefault) document.body.classList.add('__ma-hide-cursor');
    document.addEventListener('mousemove', this.onMouseMove);
    this.el.hidden = false;
    if (this.opts.smoothness < 1) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    document.body.classList.remove('__ma-hide-cursor');
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
