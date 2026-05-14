import { ElementAnimator } from '../core/element-animator';
import type { MouseAnimationsBase, MagneticOptions } from '../core/types';

export class Magnetic implements MouseAnimationsBase {
  private readonly animator: ElementAnimator;
  private readonly options: Required<MagneticOptions>;

  constructor(options: MagneticOptions) {
    this.options = { strength: 0.3, radius: 100, ease: 0.15, ...options };
    this.animator = new ElementAnimator({
      ease: this.options.ease,
      onMove: (_, event, rect) => {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = event.clientX - centerX;
        const deltaY = event.clientY - centerY;
        if (Math.hypot(deltaX, deltaY) < this.options.radius) {
          return { targetX: deltaX * this.options.strength, targetY: deltaY * this.options.strength };
        }
      },
      onFrame: (element, x, y) => {
        element.style.transform = `translate(${x}px,${y}px)`;
      },
    });
    this.enable();
  }

  enable(): void {
    this.animator.enable(this.options.selector);
  }

  disable(): void {
    this.animator.disable();
  }

  destroy(): void {
    this.animator.destroy();
  }
}
