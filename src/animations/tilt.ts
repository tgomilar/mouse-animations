import type { MouseAnimationsBase, TiltOptions } from '../core/types';

interface TiltEntry {
  element: HTMLElement;
  savedTransform: string;
  rafId: number | null;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  glareElement: HTMLElement | null;
  handleMove: (e: MouseEvent) => void;
  handleLeave: () => void;
}

export class Tilt implements MouseAnimationsBase {
  private readonly options: Required<TiltOptions>;
  private entries: TiltEntry[] = [];
  private active = false;

  constructor(options: TiltOptions) {
    this.options = {
      maxTilt: 15,
      perspective: 800,
      ease: 0.1,
      glare: false,
      ...options,
    };
    this.enable();
  }

  private setupEntry(element: HTMLElement): TiltEntry {
    const entry: TiltEntry = {
      element,
      savedTransform: element.style.transform ?? '',
      rafId: null,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      glareElement: null,
      handleMove: () => {},
      handleLeave: () => {},
    };

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
      entry.glareElement = glareElement;
    }

    entry.handleMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const normalizedX = (e.clientX - rect.left) / rect.width * 2 - 1;
      const normalizedY = (e.clientY - rect.top) / rect.height * 2 - 1;
      entry.targetX = normalizedY * this.options.maxTilt;
      entry.targetY = -normalizedX * this.options.maxTilt;
      if (entry.glareElement) {
        const glareAngle = Math.atan2(normalizedY, normalizedX) * (180 / Math.PI);
        entry.glareElement.style.transform = `rotate(${glareAngle}deg) scale(2)`;
        entry.glareElement.style.opacity = '1';
      }
    };

    entry.handleLeave = () => {
      entry.targetX = 0;
      entry.targetY = 0;
      if (entry.glareElement) entry.glareElement.style.opacity = '0';
    };

    element.addEventListener('mousemove', entry.handleMove);
    element.addEventListener('mouseleave', entry.handleLeave);

    const { perspective } = this.options;
    const tick = () => {
      if (!this.active) return;
      entry.currentX += (entry.targetX - entry.currentX) * this.options.ease;
      entry.currentY += (entry.targetY - entry.currentY) * this.options.ease;
      element.style.transform =
        `perspective(${perspective}px) rotateX(${entry.currentX}deg) rotateY(${entry.currentY}deg)`;
      entry.rafId = requestAnimationFrame(tick);
    };
    entry.rafId = requestAnimationFrame(tick);

    return entry;
  }

  private teardownEntry(entry: TiltEntry): void {
    entry.element.removeEventListener('mousemove', entry.handleMove);
    entry.element.removeEventListener('mouseleave', entry.handleLeave);
    if (entry.rafId !== null) cancelAnimationFrame(entry.rafId);
    entry.element.style.transform = entry.savedTransform;
    entry.element.style.willChange = '';
    entry.glareElement?.remove();
  }

  enable(): void {
    if (this.active) return;
    this.active = true;
    document.querySelectorAll<HTMLElement>(this.options.selector).forEach((element) => {
      this.entries.push(this.setupEntry(element));
    });
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    this.entries.forEach((entry) => this.teardownEntry(entry));
    this.entries = [];
  }

  destroy(): void {
    this.disable();
  }
}
