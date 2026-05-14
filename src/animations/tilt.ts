import { ElementAnimator } from '../core/element-animator';
import type { MouseAnimationsBase, TiltOptions } from '../core/types';

export class Tilt implements MouseAnimationsBase {
  private readonly animator: ElementAnimator;
  private readonly options: Required<TiltOptions>;
  private readonly glareElements = new Map<HTMLElement, HTMLElement>();

  constructor(options: TiltOptions) {
    this.options = { maxTilt: 15, perspective: 800, ease: 0.1, glare: false, ...options };
    this.animator = new ElementAnimator({
      ease: this.options.ease,
      onMove: (element, event, rect) => {
        const normalizedX = (event.clientX - rect.left) / rect.width * 2 - 1;
        const normalizedY = (event.clientY - rect.top) / rect.height * 2 - 1;
        const glareElement = this.glareElements.get(element);
        if (glareElement) {
          const glareAngle = Math.atan2(normalizedY, normalizedX) * (180 / Math.PI);
          glareElement.style.transform = `rotate(${glareAngle}deg) scale(2)`;
          glareElement.style.opacity = '1';
        }
        return {
          targetX: normalizedY * this.options.maxTilt,
          targetY: -normalizedX * this.options.maxTilt,
        };
      },
      onFrame: (element, x, y) => {
        element.style.transform = `perspective(${this.options.perspective}px) rotateX(${x}deg) rotateY(${y}deg)`;
      },
      onLeave: (element) => {
        const glareElement = this.glareElements.get(element);
        if (glareElement) glareElement.style.opacity = '0';
      },
      onSetup: (element) => {
        element.style.willChange = 'transform';
        if (this.options.glare) {
          const glareElement = document.createElement('div');
          glareElement.style.cssText = [
            'position:absolute',
            'inset:0',
            'border-radius:inherit',
            'pointer-events:none',
            'background:linear-gradient(135deg,rgba(255,255,255,0.28) 0%,rgba(255,255,255,0) 60%)',
            'opacity:0',
            'transition:opacity 0.3s',
          ].join(';');
          if (!element.style.position || element.style.position === 'static') {
            element.style.position = 'relative';
          }
          element.style.overflow = 'hidden';
          element.appendChild(glareElement);
          this.glareElements.set(element, glareElement);
        }
      },
      onTeardown: (element) => {
        element.style.willChange = '';
        const glareElement = this.glareElements.get(element);
        glareElement?.remove();
        this.glareElements.delete(element);
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
