import { afterEach, describe, expect, it, vi } from 'vitest';
import { MouseTracker } from './mouse-tracker';

function dispatchMouseMove(x: number, y: number): void {
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }));
}

describe('MouseTracker', () => {
  const subscribers: (() => void)[] = [];

  afterEach(() => {
    const tracker = MouseTracker.getInstance();
    for (const subscriber of subscribers) {
      tracker.unsubscribe(subscriber);
    }
    subscribers.length = 0;
  });

  function track(onMove?: () => void): MouseTracker {
    const subscriber = onMove ?? vi.fn();
    subscribers.push(subscriber);
    MouseTracker.getInstance().subscribe(subscriber);
    return MouseTracker.getInstance();
  }

  it('updates cursor position after mousemove', () => {
    const tracker = track();

    dispatchMouseMove(100, 200);

    expect(tracker.x).toBe(100);
    expect(tracker.y).toBe(200);
  });

  it('fires the subscribed callback on mousemove', () => {
    const callback = vi.fn();
    track(callback);

    dispatchMouseMove(50, 60);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not fire after unsubscribing', () => {
    const callback = vi.fn();
    const tracker = MouseTracker.getInstance();
    tracker.subscribe(callback);
    subscribers.push(callback);
    tracker.unsubscribe(callback);

    dispatchMouseMove(70, 80);

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls multiple subscribers on one event', () => {
    const a = vi.fn();
    const b = vi.fn();
    track(a);
    track(b);

    dispatchMouseMove(90, 100);

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('returns the same instance on repeated calls', () => {
    const first = MouseTracker.getInstance();
    const second = MouseTracker.getInstance();

    expect(first).toBe(second);
  });
});
