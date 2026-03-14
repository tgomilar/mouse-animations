import { MouseTracker } from '../core/mouse-tracker';
import type { MouseAnimationsBase, TrailOptions } from '../core/types';

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

/**
 * Renders a fading dot trail that follows the cursor on a canvas overlay.
 */
export class Trail implements MouseAnimationsBase {
  private readonly opts: Required<TrailOptions>;
  private readonly tracker: MouseTracker;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private points: TrailPoint[] = [];
  private rafId: number | null = null;
  private active: boolean = false;

  constructor(options: TrailOptions = {}) {
    this.opts = {
      color: '#ffffff',
      size: 6,
      length: 20,
      decay: 0.05,
      blur: 0,
      ...options,
    };
    this.tracker = MouseTracker.getInstance();
    this.canvas = this.createCanvas();
    this.ctx = this.canvas.getContext('2d')!;
    this.enable();
  }

  private createCanvas(): HTMLCanvasElement {
    const c: HTMLCanvasElement = document.createElement('canvas');
    c.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999999;';
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    document.body.appendChild(c);
    window.addEventListener('resize', this.onResize);
    return c;
  }

  private onResize = (): void => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private onMove = (): void => {
    this.points.push({ x: this.tracker.x, y: this.tracker.y, alpha: 1 });
    if (this.points.length > this.opts.length) this.points.shift();
  };

  private loop = (): void => {
    if (!this.active) return;
    const { ctx: ctx, canvas: cv, opts: o } = this;
    ctx.clearRect(0, 0, cv.width, cv.height);

    const len: number = this.points.length;
    for (let i = 0; i < len; i++) {
      const p: TrailPoint = this.points[i];
      const ratio: number = (i + 1) / len;
      ctx.globalAlpha = p.alpha * ratio;
      if (o.blur > 0) ctx.filter = `blur(${o.blur}px)`;
      ctx.fillStyle = o.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(o.size * ratio, 0.5), 0, Math.PI * 2);
      ctx.fill();
      p.alpha = Math.max(0, p.alpha - o.decay);
    }

    this.points = this.points.filter((p) => p.alpha > 0);
    ctx.globalAlpha = 1;
    if (o.blur > 0) ctx.filter = 'none';
    this.rafId = requestAnimationFrame(this.loop);
  };

  enable(): void {
    if (this.active) return;
    this.active = true;
    this.tracker.bind();
    this.tracker.subscribe(this.onMove);
    this.rafId = requestAnimationFrame(this.loop);
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    this.tracker.unsubscribe(this.onMove);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  destroy(): void {
    this.disable();
    window.removeEventListener('resize', this.onResize);
    this.canvas.remove();
  }
}
