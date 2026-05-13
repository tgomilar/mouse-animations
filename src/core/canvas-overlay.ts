export interface CanvasOverlayOptions {
  zIndex: number;
}

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

  destroy(): void {
    window.removeEventListener('resize', this.onResize);
    this.canvas.remove();
  }

  private onResize = (): void => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };
}
