/** Lightweight singleton that tracks mouse position across the page. */
export class MouseTracker {
  private static instance: MouseTracker | null = null;

  x = 0;
  y = 0;
  /** Velocity since last move event */
  vx = 0;
  vy = 0;

  private prevX = 0;
  private prevY = 0;
  private listeners = new Set<() => void>();
  private bound = false;

  private constructor() {}

  static getInstance(): MouseTracker {
    if (!MouseTracker.instance) {
      MouseTracker.instance = new MouseTracker();
    }
    return MouseTracker.instance;
  }

  /** Attach the global mousemove listener (no-op if already bound). */
  bind(): void {
    if (this.bound) return;
    document.addEventListener('mousemove', this.onMove);
    this.bound = true;
  }

  /** Detach the global listener only when there are no remaining subscribers. */
  tryUnbind(): void {
    if (this.listeners.size > 0) return;
    document.removeEventListener('mousemove', this.onMove);
    this.bound = false;
  }

  subscribe(fn: () => void): void {
    this.listeners.add(fn);
  }

  unsubscribe(fn: () => void): void {
    this.listeners.delete(fn);
    this.tryUnbind();
  }

  private onMove = (e: MouseEvent): void => {
    this.prevX = this.x;
    this.prevY = this.y;
    this.x = e.clientX;
    this.y = e.clientY;
    this.vx = this.x - this.prevX;
    this.vy = this.y - this.prevY;
    this.listeners.forEach((fn) => fn());
  };
}
