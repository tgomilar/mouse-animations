import type { MouseAnimationsBase, ParticlesOptions } from '../core/types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

const DEFAULT_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f1c'];

/**
 * Bursts coloured canvas particles from each click position.
 */
export class Particles implements MouseAnimationsBase {
  private readonly opts: Required<ParticlesOptions>;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private pool: Particle[] = [];
  private rafId: number | null = null;
  private active = false;

  constructor(options: ParticlesOptions = {}) {
    this.opts = {
      count: 20,
      colors: DEFAULT_COLORS,
      size: 6,
      decay: 0.02,
      spread: 8,
      ...options,
    };
    this.canvas = this.createCanvas();
    this.ctx = this.canvas.getContext('2d')!;
    this.enable();
  }

  private createCanvas(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999997;';
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

  private onClick = (e: MouseEvent): void => {
    const { count, colors, size, spread } = this.opts;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = (0.5 + Math.random() * 0.5) * spread;
      this.pool.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * size,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
      });
    }
  };

  private loop = (): void => {
    if (!this.active) return;
    const { ctx: ctx, canvas: cv, opts: o } = this;
    ctx.clearRect(0, 0, cv.width, cv.height);

    this.pool = this.pool.filter((p) => p.alpha > 0);
    for (const p of this.pool) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;   // gravity
      p.vx *= 0.97;  // air resistance
      p.alpha -= o.decay;

      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    this.rafId = requestAnimationFrame(this.loop);
  };

  enable(): void {
    if (this.active) return;
    this.active = true;
    document.addEventListener('click', this.onClick);
    this.rafId = requestAnimationFrame(this.loop);
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    document.removeEventListener('click', this.onClick);
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  destroy(): void {
    this.disable();
    window.removeEventListener('resize', this.onResize);
    this.canvas.remove();
  }
}
