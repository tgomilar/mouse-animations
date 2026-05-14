export interface ElementAnimatorOptions {
  /** Lerp ease factor (0–1) for smoothing toward the target position. */
  ease: number;
  /**
   * Called on mousemove over a tracked element.
   * Return an object with targetX/Y to update the animation target,
   * or return void to keep the current target.
   */
  onMove: (
    element: HTMLElement,
    event: MouseEvent,
    rect: DOMRect,
  ) => { targetX: number; targetY: number } | void;
  /** Called each rAF tick with the smoothed current position. */
  onFrame: (element: HTMLElement, x: number, y: number) => void;
  /** Called on mouseleave (fires before target resets to 0). */
  onLeave?: (element: HTMLElement) => void;
  /** Called after an entry is set up and listeners are attached. */
  onSetup?: (element: HTMLElement) => void;
  /** Called before an entry is torn down (element transform is restored afterwards). */
  onTeardown?: (element: HTMLElement) => void;
}

/**
 * Drives a per-element hover animation lifecycle.
 *
 * For each element matching a selector, ElementAnimator attaches
 * mousemove/mouseleave listeners and runs a rAF loop that lerps
 * targetX/Y toward the values computed by onMove and applies them
 * via onFrame. enable/disable/destroy manage the full lifecycle.
 */
export class ElementAnimator {
  private readonly options: ElementAnimatorOptions;
  private entries: AnimationEntry[] = [];
  private active = false;

  constructor(options: ElementAnimatorOptions) {
    this.options = options;
  }

  /** Query the DOM for the given selector and set up an entry per element. */
  enable(selector: string): void {
    if (this.active) return;
    this.active = true;
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      this.entries.push(this.setupEntry(element));
    });
  }

  /** Tear down all entries and restore original transforms. */
  disable(): void {
    if (!this.active) return;
    this.active = false;
    this.entries.forEach((entry) => this.teardownEntry(entry));
    this.entries = [];
  }

  /** Alias for disable(). */
  destroy(): void {
    this.disable();
  }

  private setupEntry(element: HTMLElement): AnimationEntry {
    const entry: AnimationEntry = {
      element,
      savedTransform: element.style.transform ?? '',
      rafId: 0,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    const handleMove = (event: MouseEvent): void => {
      const rect = element.getBoundingClientRect();
      const result = this.options.onMove(element, event, rect);
      if (result) {
        entry.targetX = result.targetX;
        entry.targetY = result.targetY;
      }
    };

    const handleLeave = (): void => {
      entry.targetX = 0;
      entry.targetY = 0;
      this.options.onLeave?.(element);
    };

    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseleave', handleLeave);

    this.options.onSetup?.(element);

    const { ease } = this.options;
    const tick = (): void => {
      if (!this.active) return;
      entry.currentX += (entry.targetX - entry.currentX) * ease;
      entry.currentY += (entry.targetY - entry.currentY) * ease;
      this.options.onFrame(element, entry.currentX, entry.currentY);
      entry.rafId = requestAnimationFrame(tick);
    };
    entry.rafId = requestAnimationFrame(tick);

    return entry;
  }

  private teardownEntry(entry: AnimationEntry): void {
    this.options.onTeardown?.(entry.element);
    entry.element.style.transform = entry.savedTransform;
  }
}

interface AnimationEntry {
  element: HTMLElement;
  savedTransform: string;
  rafId: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
}
