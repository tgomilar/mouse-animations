export interface CanvasOverlayOptions {
  /** CSS z-index for the overlay canvas. */
  zIndex: number;
}

/**
 * Creates and manages a full-viewport, fixed-position canvas overlay.
 *
 * The canvas is appended to document.body with pointer-events: none and
 * auto-resizes on window resize. Call .destroy() to clean up.
 */
export class CanvasOverlay {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  constructor(options: CanvasOverlayOptions) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'pointer-events:none',
      `z-index:${options.zIndex}`,
    ].join(';');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    document.body.appendChild(this.canvas);
    window.addEventListener('resize', this.onResize);
    this.ctx = this.canvas.getContext('2d')!;
  }

  /** Remove the canvas element and the resize listener. */
  destroy(): void {
    window.removeEventListener('resize', this.onResize);
    this.canvas.remove();
  }

  private onResize = (): void => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };
}
