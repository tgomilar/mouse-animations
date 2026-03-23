import type { MouseAnimationsBase, SpotlightOptions } from '../core/types';

interface SpotlightEntry {
  el: HTMLElement;
  onMove: (e: MouseEvent) => void;
  onLeave: () => void;
}

/**
 * Renders a radial gradient spotlight that follows the cursor inside each matched element.
 */
export class Spotlight implements MouseAnimationsBase {
  private readonly opts: Required<SpotlightOptions>;
  private readonly style: HTMLStyleElement;
  private entries: SpotlightEntry[] = [];
  private active = false;

  constructor(options: SpotlightOptions) {
    this.opts = { color: 'rgba(255,255,255,0.12)', size: 200, ...options };
    this.style = this.injectStyles();
    this.enable();
  }

  private injectStyles(): HTMLStyleElement {
    const s = document.createElement('style');
    s.textContent = `
      .__ma-spotlight { position: relative; }
      .__ma-spotlight::before {
        content: '';
        position: absolute; inset: 0;
        border-radius: inherit;
        pointer-events: none;
        background: radial-gradient(
          circle var(--ma-spot-r, 200px) at var(--ma-spot-x, -9999px) var(--ma-spot-y, -9999px),
          var(--ma-spot-color, rgba(255,255,255,0.12)),
          transparent
        );
      }
    `;
    document.head.appendChild(s);
    return s;
  }

  private bind(): void {
    document.querySelectorAll<HTMLElement>(this.opts.selector).forEach(el => {
      el.style.setProperty('--ma-spot-r', `${this.opts.size}px`);
      el.style.setProperty('--ma-spot-color', this.opts.color);

      const onMove = (e: MouseEvent): void => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--ma-spot-x', `${e.clientX - r.left}px`);
        el.style.setProperty('--ma-spot-y', `${e.clientY - r.top}px`);
      };

      const onLeave = (): void => {
        el.style.setProperty('--ma-spot-x', '-9999px');
        el.style.setProperty('--ma-spot-y', '-9999px');
      };

      el.classList.add('__ma-spotlight');
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      this.entries.push({ el, onMove, onLeave });
    });
  }

  private unbind(): void {
    this.entries.forEach(({ el, onMove, onLeave }) => {
      el.classList.remove('__ma-spotlight');
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.style.removeProperty('--ma-spot-x');
      el.style.removeProperty('--ma-spot-y');
      el.style.removeProperty('--ma-spot-r');
      el.style.removeProperty('--ma-spot-color');
    });
    this.entries = [];
  }

  enable(): void {
    if (this.active) return;
    this.active = true;
    this.bind();
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    this.unbind();
  }

  destroy(): void {
    this.disable();
    this.style.remove();
  }
}
