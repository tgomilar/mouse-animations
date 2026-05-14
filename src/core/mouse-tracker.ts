export class MouseTracker {
  private static instance: MouseTracker | null = null;

  private cursorX: number = 0;
  private cursorY: number = 0;
  private listeners: Set<() => void> = new Set<() => void>();
  private bound: boolean = false;

  private constructor() {}

  static getInstance(): MouseTracker {
    if (!MouseTracker.instance) {
      MouseTracker.instance = new MouseTracker();
    }
    return MouseTracker.instance;
  }

  get x(): number {
    return this.cursorX;
  }

  get y(): number {
    return this.cursorY;
  }

  subscribe(fn: () => void): void {
    this.listeners.add(fn);
    if (!this.bound) {
      document.addEventListener('mousemove', this.onMove);
      this.bound = true;
    }
  }

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
