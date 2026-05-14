/**
 * Singleton that tracks the cursor position across the page.
 *
 * Subscribe to be notified on every mousemove. The global mousemove listener
 * is lazily attached on first subscribe and detached when the last subscriber
 * unsubscribes.
 *
 * Exposes the cursor position as read-only getters .x and .y.
 */
export class MouseTracker {
  private static instance: MouseTracker | null = null;

  private cursorX: number = 0;
  private cursorY: number = 0;
  private listeners: Set<() => void> = new Set<() => void>();
  private bound: boolean = false;

  private constructor() {}

  /** Get or create the singleton instance. */
  static getInstance(): MouseTracker {
    if (!MouseTracker.instance) {
      MouseTracker.instance = new MouseTracker();
    }
    return MouseTracker.instance;
  }

  /** Current cursor X position (read-only). */
  get x(): number {
    return this.cursorX;
  }

  /** Current cursor Y position (read-only). */
  get y(): number {
    return this.cursorY;
  }

  /**
   * Register a callback to fire on every mousemove.
   * Attaches the global mousemove listener if this is the first subscriber.
   */
  subscribe(fn: () => void): void {
    this.listeners.add(fn);
    if (!this.bound) {
      document.addEventListener('mousemove', this.onMove);
      this.bound = true;
    }
  }

  /**
   * Unregister a previously subscribed callback.
   * Detaches the global mousemove listener when no subscribers remain.
   */
  unsubscribe(fn: () => void): void {
    this.listeners.delete(fn);
    if (this.listeners.size === 0 && this.bound) {
      document.removeEventListener('mousemove', this.onMove);
      this.bound = false;
    }
  }

  private onMove = (e: MouseEvent): void => {
    this.cursorX = e.clientX;
    this.cursorY = e.clientY;
    this.listeners.forEach((fn) => fn());
  };
}
