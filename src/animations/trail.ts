import { MouseTracker } from '../core/mouse-tracker';
import type { MouseAnimationsBase, TrailOptions } from '../core/types';

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export class Trail implements MouseAnimationsBase {
  private readonly options: Required<TrailOptions>;
  private readonly tracker: MouseTracker;
  private readonly canvasElement: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
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
    this.canvasElement = this.createCanvas();
    this.context = this.canvasElement.getContext('2d')!;
    this.enable();
  }

  private createCanvas(): HTMLCanvasElement {
    const canvasElement = document.createElement('canvas');
    canvasElement.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999999;';
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    document.body.appendChild(canvasElement);
    window.addEventListener('resize', this.onResize);
    return canvasElement;
  }

  private onResize = (): void => {
    this.canvasElement.width = window.innerWidth;
    this.canvasElement.height = window.innerHeight;
  };

  private onMove = (): void => {
    this.points.push({ x: this.tracker.x, y: this.tracker.y, alpha: 1 });
    if (this.points.length > this.options.length) this.points.shift();
  };

  private loop = (): void => {
    if (!this.active) return;
    const context = this.context;
    context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

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
    this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  destroy(): void {
    this.disable();
    window.removeEventListener('resize', this.onResize);
    this.canvasElement.remove();
  }
}
