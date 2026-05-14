/** Configuration for a MouseFollower instance. */
export interface MouseFollowerOptions {
  /** Lerp factor (0–1). 1 = instant snap, lower = smooth lag. */
  smoothness: number;
  /** Called each tick with the smoothed cursor position. */
  onFrame: (x: number, y: number) => void;
  /** Called on every raw mousemove before smoothing (for instant-follow elements). */
  onRawMove?: (x: number, y: number) => void;
  /** Called once on the first mousemove after start(). */
  onFirstMove?: (x: number, y: number) => void;
}

/**
 * Manages a mousemove listener and optional rAF lerp loop.
 *
 * - smoothness = 1: onFrame fires from the mousemove handler (instant).
 * - smoothness < 1: onFrame fires from a rAF loop that lerps toward the raw position.
 * - onRawMove always fires from the mousemove handler.
 * - onFirstMove fires once per start() cycle.
 *
 * Call .start() to begin tracking, .stop() to tear down, .destroy() as a finaliser.
 */
export class MouseFollower {
  private readonly options: MouseFollowerOptions;
  private rawX: number = 0;
  private rawY: number = 0;
  private smoothX: number = 0;
  private smoothY: number = 0;
  private rafId: number | null = null;
  private active: boolean = false;
  private hasReceivedFirstMove: boolean = false;

  constructor(options: MouseFollowerOptions) {
    this.options = options;
  }

  /** Attach the mousemove listener. Resets first-move state. */
  start(): void {
    if (this.active) return;
    this.active = true;
    this.hasReceivedFirstMove = false;
    document.addEventListener('mousemove', this.onMouseMove);
    if (this.options.smoothness < 1) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  /** Detach the mousemove listener and cancel the rAF loop. */
  stop(): void {
    if (!this.active) return;
    this.active = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Alias for stop(). */
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
