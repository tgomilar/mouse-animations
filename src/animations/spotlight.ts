import type { MouseAnimationsBase, SpotlightOptions } from '../core/types';

interface GlowEntry {
  element: HTMLElement;
  handleMove: (e: MouseEvent) => void;
  handleLeave: () => void;
}

export class Spotlight implements MouseAnimationsBase {
  private readonly options: Required<SpotlightOptions>;
  private readonly styleElement: HTMLStyleElement;
  private entries: GlowEntry[] = [];

  constructor(options: SpotlightOptions = {}) {
    this.options = {
      selector: '',
      color: 'rgba(255,255,255,0.12)',
      size: 200,
      ...options,
    };
    this.styleElement = this.injectStyles();
    this.enable();
  }

  private injectStyles(): HTMLStyleElement {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
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
    document.head.appendChild(styleElement);
    return styleElement;
  }

  private bind(): void {
    if (!this.options.selector) return;
    document.querySelectorAll<HTMLElement>(this.options.selector).forEach(element => {
      element.style.setProperty('--ma-spot-r', `${this.options.size}px`);
      element.style.setProperty('--ma-spot-color', this.options.color);

      const handleMove = (e: MouseEvent): void => {
        const rect = element.getBoundingClientRect();
        element.style.setProperty('--ma-spot-x', `${e.clientX - rect.left}px`);
        element.style.setProperty('--ma-spot-y', `${e.clientY - rect.top}px`);
      };

      const handleLeave = (): void => {
        element.style.setProperty('--ma-spot-x', '-9999px');
        element.style.setProperty('--ma-spot-y', '-9999px');
      };

      element.classList.add('__ma-spotlight');
      element.addEventListener('mousemove', handleMove);
      element.addEventListener('mouseleave', handleLeave);
      this.entries.push({ element, handleMove, handleLeave });
    });
  }

  private unbind(): void {
    this.entries.forEach(({ element, handleMove, handleLeave }) => {
      element.classList.remove('__ma-spotlight');
      element.removeEventListener('mousemove', handleMove);
      element.removeEventListener('mouseleave', handleLeave);
      element.style.removeProperty('--ma-spot-x');
      element.style.removeProperty('--ma-spot-y');
      element.style.removeProperty('--ma-spot-r');
      element.style.removeProperty('--ma-spot-color');
    });
    this.entries = [];
  }

  enable(): void {
    this.bind();
  }

  disable(): void {
    this.unbind();
  }

  destroy(): void {
    this.disable();
    this.styleElement.remove();
  }
}
