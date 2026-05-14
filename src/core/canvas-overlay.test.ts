import { afterEach, describe, expect, it } from 'vitest';
import { CanvasOverlay } from './canvas-overlay';

describe('CanvasOverlay', () => {
  const overlays: CanvasOverlay[] = [];

  afterEach(() => {
    for (const overlay of overlays) overlay.destroy();
    overlays.length = 0;
  });

  it('appends a canvas to the body', () => {
    const overlay = new CanvasOverlay({ zIndex: 9999 });
    overlays.push(overlay);

    expect(overlay.canvas.parentElement).toBe(document.body);
  });

  it('sets fixed positioning and full viewport size', () => {
    const overlay = new CanvasOverlay({ zIndex: 9999 });
    overlays.push(overlay);

    const style = overlay.canvas.style;
    expect(style.position).toBe('fixed');
    expect(style.top).toBe('0px');
    expect(style.left).toBe('0px');
    expect(style.width).toBe('100%');
    expect(style.height).toBe('100%');
    expect(style.pointerEvents).toBe('none');
  });

  it('applies the given z-index', () => {
    const overlay = new CanvasOverlay({ zIndex: 42 });
    overlays.push(overlay);

    expect(overlay.canvas.style.zIndex).toBe('42');
  });

  it('matches canvas pixel dimensions to the viewport', () => {
    window.innerWidth = 800;
    window.innerHeight = 600;
    const overlay = new CanvasOverlay({ zIndex: 9999 });
    overlays.push(overlay);

    expect(overlay.canvas.width).toBe(800);
    expect(overlay.canvas.height).toBe(600);
  });

  it('updates dimensions on window resize', () => {
    window.innerWidth = 400;
    window.innerHeight = 300;
    const overlay = new CanvasOverlay({ zIndex: 9999 });
    overlays.push(overlay);

    window.innerWidth = 1024;
    window.innerHeight = 768;
    window.dispatchEvent(new Event('resize'));

    expect(overlay.canvas.width).toBe(1024);
    expect(overlay.canvas.height).toBe(768);
  });

  it('removes the canvas from the DOM on destroy', () => {
    const overlay = new CanvasOverlay({ zIndex: 9999 });
    overlays.push(overlay);

    overlay.destroy();

    expect(overlay.canvas.parentElement).toBeNull();
  });

  it('stops updating dimensions after destroy', () => {
    const overlay = new CanvasOverlay({ zIndex: 9999 });
    overlays.push(overlay);

    overlay.destroy();
    window.innerWidth = 999;
    window.innerHeight = 888;
    window.dispatchEvent(new Event('resize'));

    expect(overlay.canvas.width).not.toBe(999);
  });
});
