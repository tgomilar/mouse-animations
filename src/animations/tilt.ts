import type { MouseAnimationsBase, TiltOptions } from '../core/types';

interface TiltEntry {
  el: HTMLElement;
  savedTransform: string;
  rafId: number | null;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  glareEl: HTMLElement | null;
  onMove: (e: MouseEvent) => void;
  onLeave: () => void;
}

/**
 * Applies a 3-D perspective tilt to matching elements as the cursor moves over them,
 * with an optional glare highlight.
 */
export class Tilt implements MouseAnimationsBase {
  private readonly opts: Required<TiltOptions>;
  private entries: TiltEntry[] = [];
  private active = false;

  constructor(options: TiltOptions) {
    this.opts = {
      maxTilt: 15,
      perspective: 800,
      ease: 0.1,
      glare: false,
      ...options,
    };
    this.enable();
  }

  private setupEntry(el: HTMLElement): TiltEntry {
    const entry: TiltEntry = {
      el,
      savedTransform: el.style.transform ?? '',
      rafId: null,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      glareEl: null,
      onMove: () => {},
      onLeave: () => {},
    };

    el.style.willChange = 'transform';

    if (this.opts.glare) {
      const g = document.createElement('div');
      g.style.cssText = [
        'position:absolute',
        'inset:0',
        'border-radius:inherit',
        'pointer-events:none',
        'background:linear-gradient(135deg,rgba(255,255,255,0.28) 0%,rgba(255,255,255,0) 60%)',
        'opacity:0',
        'transition:opacity 0.3s',
      ].join(';');
      if (!el.style.position || el.style.position === 'static') {
        el.style.position = 'relative';
      }
      el.style.overflow = 'hidden';
      el.appendChild(g);
      entry.glareEl = g;
    }

    entry.onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      // -1 … +1 within the element
      const nx = (e.clientX - r.left)  / r.width  * 2 - 1;
      const ny = (e.clientY - r.top)   / r.height * 2 - 1;
      entry.targetX =  ny * this.opts.maxTilt;   // rotateX  (tilt up/down)
      entry.targetY = -nx * this.opts.maxTilt;   // rotateY  (tilt left/right)
      if (entry.glareEl) {
        const angle = Math.atan2(ny, nx) * (180 / Math.PI);
        entry.glareEl.style.transform = `rotate(${angle}deg) scale(2)`;
        entry.glareEl.style.opacity   = '1';
      }
    };

    entry.onLeave = () => {
      entry.targetX = 0;
      entry.targetY = 0;
      if (entry.glareEl) entry.glareEl.style.opacity = '0';
    };

    el.addEventListener('mousemove', entry.onMove);
    el.addEventListener('mouseleave', entry.onLeave);

    const { perspective } = this.opts;
    const tick = () => {
      if (!this.active) return;
      entry.currentX += (entry.targetX - entry.currentX) * this.opts.ease;
      entry.currentY += (entry.targetY - entry.currentY) * this.opts.ease;
      el.style.transform =
        `perspective(${perspective}px) rotateX(${entry.currentX}deg) rotateY(${entry.currentY}deg)`;
      entry.rafId = requestAnimationFrame(tick);
    };
    entry.rafId = requestAnimationFrame(tick);

    return entry;
  }

  private teardownEntry(entry: TiltEntry): void {
    entry.el.removeEventListener('mousemove', entry.onMove);
    entry.el.removeEventListener('mouseleave', entry.onLeave);
    if (entry.rafId !== null) cancelAnimationFrame(entry.rafId);
    entry.el.style.transform  = entry.savedTransform;
    entry.el.style.willChange = '';
    entry.glareEl?.remove();
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
