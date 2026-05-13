import { CanvasOverlay } from '../core/canvas-overlay';
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

export class Particles implements MouseAnimationsBase {
  private readonly options: Required<ParticlesOptions>;
  private readonly overlay: CanvasOverlay;
  private pool: Particle[] = [];
  private rafId: number | null = null;
  private active = false;

  constructor(options: ParticlesOptions = {}) {
    this.options = {
      count: 20,
      colors: DEFAULT_COLORS,
      size: 6,
      decay: 0.02,
      spread: 8,
      ...options,
    };
    this.overlay = new CanvasOverlay({ zIndex: 999997 });
    this.enable();
  }

  private onClick = (e: MouseEvent): void => {
    const { count, colors, size, spread } = this.options;
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
    const context = this.overlay.ctx;
    context.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);

    this.pool = this.pool.filter((particle) => particle.alpha > 0);
    for (const particle of this.pool) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2;
      particle.vx *= 0.97;
      particle.alpha -= this.options.decay;

      context.globalAlpha = Math.max(0, particle.alpha);
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1;
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
    this.overlay.ctx.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
  }

  destroy(): void {
    this.disable();
    this.overlay.destroy();
  }
}
