export interface ElementAnimatorOptions {
  ease: number;
  onMove: (
    element: HTMLElement,
    event: MouseEvent,
    rect: DOMRect,
  ) => { targetX: number; targetY: number } | void;
  onFrame: (element: HTMLElement, x: number, y: number) => void;
  onLeave?: (element: HTMLElement) => void;
  onSetup?: (element: HTMLElement) => void;
  onTeardown?: (element: HTMLElement) => void;
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

export class ElementAnimator {
  private readonly options: ElementAnimatorOptions;
  private entries: AnimationEntry[] = [];
  private active = false;

  constructor(options: ElementAnimatorOptions) {
    this.options = options;
  }

  enable(selector: string): void {
    if (this.active) return;
    this.active = true;
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      this.entries.push(this.setupEntry(element));
    });
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    this.entries.forEach((entry) => this.teardownEntry(entry));
    this.entries = [];
  }

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
