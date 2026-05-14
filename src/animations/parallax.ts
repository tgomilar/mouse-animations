import { MouseTracker } from '../core/mouse-tracker';
import type { MouseAnimationsBase, ParallaxOptions } from '../core/types';

const NO_OP = (): void => {};

export class Parallax implements MouseAnimationsBase {
  private readonly options: Required<ParallaxOptions>;
  private readonly tracker: MouseTracker;
  private elements: HTMLElement[] = [];
  private savedTransforms: string[] = [];
  private rafId: number | null = null;
  private active: boolean = false;
  private currentX: number = 0;
  private currentY: number = 0;

  constructor(options: ParallaxOptions) {
    this.options = { depth: 20, ease: 0.1, ...options };
    this.tracker = MouseTracker.getInstance();
    this.enable();
  }

  private loop = (): void => {
    if (!this.active) return;

    const targetX = (this.tracker.x / window.innerWidth - 0.5) * 2;
    const targetY = (this.tracker.y / window.innerHeight - 0.5) * 2;

    this.currentX += (targetX - this.currentX) * this.options.ease;
    this.currentY += (targetY - this.currentY) * this.options.ease;

    const offsetX = this.currentX * this.options.depth;
    const offsetY = this.currentY * this.options.depth;

    this.elements.forEach((element) => {
      element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });

    this.rafId = requestAnimationFrame(this.loop);
  };

  enable(): void {
    if (this.active) return;
    this.active = true;
    this.elements = Array.from(
      document.querySelectorAll<HTMLElement>(this.options.selector),
    );
    this.savedTransforms = this.elements.map((element) => element.style.transform);
    this.tracker.subscribe(NO_OP);
    this.rafId = requestAnimationFrame(this.loop);
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    this.tracker.unsubscribe(NO_OP);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.elements.forEach((element, index) => {
      element.style.transform = this.savedTransforms[index] ?? '';
    });
  }

  destroy(): void {
    this.disable();
    this.elements = [];
    this.savedTransforms = [];
  }
}
