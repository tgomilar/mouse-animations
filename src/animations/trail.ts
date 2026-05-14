import { MouseTracker } from '../core/mouse-tracker';
import { CanvasOverlay } from '../core/canvas-overlay';
import type { MouseAnimationsBase, TrailOptions } from '../core/types';

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export class Trail implements MouseAnimationsBase {
  private readonly options: Required<TrailOptions>;
  private readonly tracker: MouseTracker;
  private readonly overlay: CanvasOverlay;
  private points: TrailPoint[] = [];
  private rafId: number | null = null;
  private active: boolean = false;

  constructor(options: TrailOptions = {}) {
    this.options = {
      color: '#ffffff',
      size: 6,
      length: 20,
      decay: 0.05,
      blur: 0,
      ...options,
    };
    this.tracker = MouseTracker.getInstance();
    this.overlay = new CanvasOverlay({ zIndex: 999999 });
    this.enable();
  }

  private onMove = (): void => {
    this.points.push({ x: this.tracker.x, y: this.tracker.y, alpha: 1 });
    if (this.points.length > this.options.length) this.points.shift();
  };

  private loop = (): void => {
    if (!this.active) return;
    const context = this.overlay.ctx;
    context.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);

    const pointCount = this.points.length;
    for (let i = 0; i < pointCount; i++) {
      const point = this.points[i];
      const ratio = (i + 1) / pointCount;
      context.globalAlpha = point.alpha * ratio;
      if (this.options.blur > 0) context.filter = `blur(${this.options.blur}px)`;
      context.fillStyle = this.options.color;
      context.beginPath();
      context.arc(point.x, point.y, Math.max(this.options.size * ratio, 0.5), 0, Math.PI * 2);
      context.fill();
      point.alpha = Math.max(0, point.alpha - this.options.decay);
    }

    this.points = this.points.filter((point) => point.alpha > 0);
    context.globalAlpha = 1;
    if (this.options.blur > 0) context.filter = 'none';
    this.rafId = requestAnimationFrame(this.loop);
  };

  enable(): void {
    if (this.active) return;
    this.active = true;
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
    this.overlay.ctx.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
  }

  destroy(): void {
    this.disable();
    this.overlay.destroy();
  }
}
