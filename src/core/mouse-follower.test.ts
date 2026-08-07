import { afterEach, describe, expect, it, vi } from 'vitest';
import { MouseFollower } from './mouse-follower';
import type { MouseFollowerOptions } from './mouse-follower';

function dispatchMouseMove(x: number, y: number): void {
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }));
}

describe('MouseFollower', () => {
  const followers: MouseFollower[] = [];

  afterEach(() => {
    for (const follower of followers) follower.destroy();
    followers.length = 0;
    vi.useRealTimers();
  });

  function createFollower(options: MouseFollowerOptions): MouseFollower {
    const follower = new MouseFollower(options);
    followers.push(follower);
    return follower;
  }

  it('calls onFrame with raw position when smoothness is 1', () => {
    const onFrame = vi.fn();
    const follower = createFollower({ smoothness: 1, onFrame });

    follower.start();
    dispatchMouseMove(100, 200);

    expect(onFrame).toHaveBeenCalledWith(100, 200);
  });

  it('calls onRawMove on every mousemove', () => {
    const onRawMove = vi.fn();
    const follower = createFollower({ smoothness: 1, onFrame: vi.fn(), onRawMove });

    follower.start();
    dispatchMouseMove(10, 20);
    dispatchMouseMove(30, 40);

    expect(onRawMove).toHaveBeenCalledTimes(2);
    expect(onRawMove).toHaveBeenNthCalledWith(1, 10, 20);
    expect(onRawMove).toHaveBeenNthCalledWith(2, 30, 40);
  });

  it('calls onFirstMove once on the first mousemove after start', () => {
    const onFirstMove = vi.fn();
    const follower = createFollower({ smoothness: 1, onFrame: vi.fn(), onFirstMove });

    follower.start();
    dispatchMouseMove(50, 60);
    dispatchMouseMove(70, 80);

    expect(onFirstMove).toHaveBeenCalledTimes(1);
    expect(onFirstMove).toHaveBeenCalledWith(50, 60);
  });

  it('resets onFirstMove after stop and start', () => {
    const onFirstMove = vi.fn();
    const follower = createFollower({ smoothness: 1, onFrame: vi.fn(), onFirstMove });

    follower.start();
    dispatchMouseMove(10, 20);
    follower.stop();
    follower.start();
    dispatchMouseMove(30, 40);

    expect(onFirstMove).toHaveBeenCalledTimes(2);
    expect(onFirstMove).toHaveBeenNthCalledWith(2, 30, 40);
  });

  it('does not call onFrame from mousemove when smoothness is below 1', () => {
    vi.useFakeTimers();
    const onFrame = vi.fn();
    const follower = createFollower({ smoothness: 0.5, onFrame });

    follower.start();
    dispatchMouseMove(100, 200);

    expect(onFrame).not.toHaveBeenCalled();
  });

  it('calls onFrame from rAF with lerped position when smoothness is below 1', () => {
    vi.useFakeTimers();
    const onFrame = vi.fn();
    const follower = createFollower({ smoothness: 0.5, onFrame });

    follower.start();
    dispatchMouseMove(100, 0);      // firstMove sets smooth=(100,0)
    vi.advanceTimersToNextTimer();  // rAF: smooth+(100-100)*0.5=100  →  onFrame(100,0)
    dispatchMouseMove(50, 0);       // raw becomes (50,0)
    vi.advanceTimersToNextTimer();  // rAF: smooth+(50-100)*0.5=75   →  onFrame(75,0)

    expect(onFrame).toHaveBeenLastCalledWith(75, 0);
  });

  it('stops calling onFrame after stop() when using rAF', () => {
    vi.useFakeTimers();
    const onFrame = vi.fn();
    const follower = createFollower({ smoothness: 0.5, onFrame });

    follower.start();
    dispatchMouseMove(100, 0);
    follower.stop();
    vi.advanceTimersByTime(100);

    expect(onFrame).not.toHaveBeenCalled();
  });

  it('setting smoothness to 1 makes onFrame fire from mousemove', () => {
    const onFrame = vi.fn();
    const follower = createFollower({ smoothness: 0.5, onFrame });

    follower.start();
    follower.smoothness = 1;
    dispatchMouseMove(100, 200);

    expect(onFrame).toHaveBeenCalledWith(100, 200);
  });

  it('setting smoothness below 1 starts the rAF loop', () => {
    vi.useFakeTimers();
    const onFrame = vi.fn();
    const follower = createFollower({ smoothness: 1, onFrame });

    follower.start();
    follower.smoothness = 0.5;
    dispatchMouseMove(100, 0);
    vi.advanceTimersToNextTimer();

    expect(onFrame).toHaveBeenCalledWith(100, 0);
  });

  it('setting smoothness to 1 stops the rAF loop', () => {
    vi.useFakeTimers();
    const onFrame = vi.fn();
    const follower = createFollower({ smoothness: 0.5, onFrame });

    follower.start();
    follower.smoothness = 1;
    dispatchMouseMove(100, 0);
    vi.advanceTimersByTime(100);

    expect(onFrame).toHaveBeenCalledTimes(1);
  });
});
