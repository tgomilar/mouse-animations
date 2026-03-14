import type { MouseAnimationsBase, MagneticOptions } from '../core/types';

interface MagEntry {
  el: HTMLElement;
  savedTransform: string;
  rafId: number | null;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  onMove: (e: MouseEvent) => void;
  onLeave: () => void;
}

/**
 * Applies a magnetic pull to matching elements as the cursor approaches them.
 */
export class Magnetic implements MouseAnimationsBase {
  private readonly opts: Required<MagneticOptions>;
  private entries: MagEntry[] = [];
  private active = false;

  constructor(options: MagneticOptions) {
    this.opts = {
      strength: 0.3,
      radius: 100,
      ease: 0.15,
      ...options,
    };
    this.enable();
  }

  private setupEntry(el: HTMLElement): MagEntry {
    const entry: MagEntry = {
      el,
      savedTransform: el.style.transform ?? '',
      rafId: null,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      onMove: () => {},
      onLeave: () => {},
    };

    entry.onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.hypot(dx, dy) < this.opts.radius) {
        entry.targetX = dx * this.opts.strength;
        entry.targetY = dy * this.opts.strength;
      }
    };

    entry.onLeave = () => {
      entry.targetX = 0;
      entry.targetY = 0;
    };

    el.addEventListener('mousemove', entry.onMove);
    el.addEventListener('mouseleave', entry.onLeave);

    const tick = () => {
      if (!this.active) return;
      entry.currentX += (entry.targetX - entry.currentX) * this.opts.ease;
      entry.currentY += (entry.targetY - entry.currentY) * this.opts.ease;
      el.style.transform = `translate(${entry.currentX}px,${entry.currentY}px)`;
      entry.rafId = requestAnimationFrame(tick);
    };
    entry.rafId = requestAnimationFrame(tick);

    return entry;
  }

  private teardownEntry(entry: MagEntry): void {
    entry.el.removeEventListener('mousemove', entry.onMove);
    entry.el.removeEventListener('mouseleave', entry.onLeave);
    if (entry.rafId !== null) cancelAnimationFrame(entry.rafId);
    entry.el.style.transform = entry.savedTransform;
  }

  enable(): void {
    if (this.active) return;
    this.active = true;
    document.querySelectorAll<HTMLElement>(this.opts.selector).forEach((el) => {
      this.entries.push(this.setupEntry(el));
    });
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    this.entries.forEach((e) => this.teardownEntry(e));
    this.entries = [];
  }

  destroy(): void {
    this.disable();
  }
}
