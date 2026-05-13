export interface MouseFollowerOptions {
  smoothness: number;
  onFrame: (x: number, y: number) => void;
  onRawMove?: (x: number, y: number) => void;
  onFirstMove?: (x: number, y: number) => void;
}

export class MouseFollower {
  private readonly options: MouseFollowerOptions;
  private rawX = 0;
  private rawY = 0;
  private smoothX = 0;
  private smoothY = 0;
  private rafId: number | null = null;
  private active = false;
  private hasReceivedFirstMove = false;

  constructor(options: MouseFollowerOptions) {
    this.options = options;
  }

  start(): void {
    if (this.active) return;
    this.active = true;
    this.hasReceivedFirstMove = false;
    document.addEventListener('mousemove', this.onMouseMove);
    if (this.options.smoothness < 1) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy(): void {
    this.stop();
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.rawX = e.clientX;
    this.rawY = e.clientY;

    if (!this.hasReceivedFirstMove) {
      this.hasReceivedFirstMove = true;
      this.smoothX = this.rawX;
      this.smoothY = this.rawY;
      this.options.onFirstMove?.(this.rawX, this.rawY);
    }

    this.options.onRawMove?.(this.rawX, this.rawY);

    if (this.options.smoothness >= 1) {
      this.smoothX = this.rawX;
      this.smoothY = this.rawY;
      this.options.onFrame(this.rawX, this.rawY);
    }
  };

  private loop = (): void => {
    if (!this.active) return;
    this.smoothX += (this.rawX - this.smoothX) * this.options.smoothness;
    this.smoothY += (this.rawY - this.smoothY) * this.options.smoothness;
    this.options.onFrame(this.smoothX, this.smoothY);
    this.rafId = requestAnimationFrame(this.loop);
  };
}
