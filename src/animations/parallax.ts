import { MouseTracker } from '../core/mouse-tracker';
import type { MouseAnimationsBase, ParallaxOptions } from '../core/types';

/**
 * Shifts elements along X/Y based on normalised mouse position across the viewport,
 * creating a floating depth/parallax effect.
 */
export class Parallax implements MouseAnimationsBase {
  private readonly opts: Required<ParallaxOptions>;
  private readonly tracker: MouseTracker;
  private elements: HTMLElement[] = [];
  private savedTransforms: string[] = [];
  private rafId: number | null = null;
  private active = false;
  private currentX = 0;
  private currentY = 0;

  constructor(options: ParallaxOptions) {
    this.opts = { depth: 20, ease: 0.1, ...options };
    this.tracker = MouseTracker.getInstance();
    this.enable();
  }

  private loop = (): void => {
    if (!this.active) return;

    // Normalise to -1 … +1 relative to viewport centre
    const targetX = (this.tracker.x / window.innerWidth  - 0.5) * 2;
    const targetY = (this.tracker.y / window.innerHeight - 0.5) * 2;

    this.currentX += (targetX - this.currentX) * this.opts.ease;
    this.currentY += (targetY - this.currentY) * this.opts.ease;

    const tx = this.currentX * this.opts.depth;
    const ty = this.currentY * this.opts.depth;

    this.elements.forEach((el) => {
      el.style.transform = `translate(${tx}px, ${ty}px)`;
    });

    this.rafId = requestAnimationFrame(this.loop);
  };

  enable(): void {
    if (this.active) return;
    this.active = true;
    this.elements = Array.from(
      document.querySelectorAll<HTMLElement>(this.opts.selector),
    );
    this.savedTransforms = this.elements.map((el) => el.style.transform);
    this.tracker.bind();
    this.rafId = requestAnimationFrame(this.loop);
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.elements.forEach((el, i) => {
      el.style.transform = this.savedTransforms[i] ?? '';
    });
  }

  destroy(): void {
    this.disable();
    this.elements = [];
    this.savedTransforms = [];
  }
}
