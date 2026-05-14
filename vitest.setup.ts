import { createCanvas } from 'canvas';

HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  contextId: string,
) {
  if (contextId === '2d') {
    const offscreen = createCanvas(this.width, this.height);
    return offscreen.getContext('2d') as unknown as CanvasRenderingContext2D;
  }
  return null;
} as unknown as typeof HTMLCanvasElement.prototype.getContext;
