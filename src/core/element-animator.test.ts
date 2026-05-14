import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElementAnimator } from './element-animator';

describe('ElementAnimator', () => {
  const animators: ElementAnimator[] = [];
  const elements: HTMLElement[] = [];

  afterEach(() => {
    for (const animator of animators) animator.destroy();
    animators.length = 0;
    for (const element of elements) element.remove();
    elements.length = 0;
    vi.useRealTimers();
  });

  function createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'tracked';
    document.body.appendChild(element);
    elements.push(element);
    return element;
  }

  it('calls onSetup for each element matching the selector', () => {
    createElement();
    createElement();
    const onSetup = vi.fn();
    const animator = new ElementAnimator({
      ease: 0.1,
      onMove: vi.fn(),
      onFrame: vi.fn(),
      onSetup,
    });
    animators.push(animator);

    animator.enable('.tracked');

    expect(onSetup).toHaveBeenCalledTimes(2);
  });

  it('fires onMove on mousemove over a tracked element', () => {
    const element = createElement();
    const onMove = vi.fn();
    const animator = new ElementAnimator({
      ease: 0.1,
      onMove,
      onFrame: vi.fn(),
    });
    animators.push(animator);

    animator.enable('.tracked');
    element.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove.mock.calls[0][0]).toBe(element);
  });

  it('fires onLeave on mouseleave', () => {
    const element = createElement();
    const onLeave = vi.fn();
    const animator = new ElementAnimator({
      ease: 0.1,
      onMove: vi.fn(),
      onFrame: vi.fn(),
      onLeave,
    });
    animators.push(animator);

    animator.enable('.tracked');
    element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(onLeave.mock.calls[0][0]).toBe(element);
  });

  it('calls onFrame each rAF tick with smoothed position', () => {
    vi.useFakeTimers();
    const element = createElement();
    const onMove = vi.fn(() => ({ targetX: 100, targetY: 0 }));
    const onFrame = vi.fn();
    const animator = new ElementAnimator({
      ease: 0.5,
      onMove,
      onFrame,
    });
    animators.push(animator);

    animator.enable('.tracked');
    element.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    vi.advanceTimersToNextTimer();

    expect(onFrame).toHaveBeenCalledWith(element, expect.any(Number), expect.any(Number));
  });

  it('restores original transform on disable', () => {
    const element = createElement();
    element.style.transform = 'translateX(10px)';
    const animator = new ElementAnimator({
      ease: 0.1,
      onMove: vi.fn(),
      onFrame: vi.fn(),
    });
    animators.push(animator);

    animator.enable('.tracked');
    animator.disable();

    expect(element.style.transform).toBe('translateX(10px)');
  });

  it('re-enables after disable with fresh entries', () => {
    createElement();
    const onSetup = vi.fn();
    const animator = new ElementAnimator({
      ease: 0.1,
      onMove: vi.fn(),
      onFrame: vi.fn(),
      onSetup,
    });
    animators.push(animator);

    animator.enable('.tracked');
    animator.disable();
    animator.enable('.tracked');

    expect(onSetup).toHaveBeenCalledTimes(2);
  });
});
