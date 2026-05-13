import type { MouseAnimationsBase, MagneticOptions } from '../core/types';

interface MagneticEntry {
  element: HTMLElement;
  savedTransform: string;
  rafId: number | null;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  handleMove: (e: MouseEvent) => void;
  handleLeave: () => void;
}

export class Magnetic implements MouseAnimationsBase {
  private readonly options: Required<MagneticOptions>;
  private entries: MagneticEntry[] = [];
  private active = false;

  constructor(options: MagneticOptions) {
    this.options = {
      strength: 0.3,
      radius: 100,
      ease: 0.15,
      ...options,
    };
    this.enable();
  }

  private setupEntry(element: HTMLElement): MagneticEntry {
    const entry: MagneticEntry = {
      element,
      savedTransform: element.style.transform ?? '',
      rafId: null,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      handleMove: () => {},
      handleLeave: () => {},
    };

    entry.handleMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      if (Math.hypot(deltaX, deltaY) < this.options.radius) {
        entry.targetX = deltaX * this.options.strength;
        entry.targetY = deltaY * this.options.strength;
      }
    };

    entry.handleLeave = () => {
      entry.targetX = 0;
      entry.targetY = 0;
    };

    element.addEventListener('mousemove', entry.handleMove);
    element.addEventListener('mouseleave', entry.handleLeave);

    const tick = () => {
      if (!this.active) return;
      entry.currentX += (entry.targetX - entry.currentX) * this.options.ease;
      entry.currentY += (entry.targetY - entry.currentY) * this.options.ease;
      element.style.transform = `translate(${entry.currentX}px,${entry.currentY}px)`;
      entry.rafId = requestAnimationFrame(tick);
    };
    entry.rafId = requestAnimationFrame(tick);

    return entry;
  }

  private teardownEntry(entry: MagneticEntry): void {
    entry.element.removeEventListener('mousemove', entry.handleMove);
    entry.element.removeEventListener('mouseleave', entry.handleLeave);
    if (entry.rafId !== null) cancelAnimationFrame(entry.rafId);
    entry.element.style.transform = entry.savedTransform;
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
