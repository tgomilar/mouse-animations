import { afterEach, describe, expect, it, vi } from 'vitest';
import { Particles } from './particles';

function stubCanvasContext() {
  const ctx = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
  };
  const spy = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  return { arc: ctx.arc, restore: () => spy.mockRestore() };
}

describe('Particles.setOptions', () => {
  const particles: Particles[] = [];
  let stub: ReturnType<typeof stubCanvasContext> | null = null;

  afterEach(() => {
    for (const particle of particles) particle.destroy();
    particles.length = 0;
    stub?.restore();
    stub = null;
    vi.useRealTimers();
  });

  it('bursts the updated particle count after setOptions', () => {
    vi.useFakeTimers();
    stub = stubCanvasContext();
    const particle = new Particles({ count: 3 });
    particles.push(particle);

    document.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50 }));
    vi.advanceTimersToNextTimer();
    expect(stub.arc).toHaveBeenCalledTimes(3);

    particle.setOptions({ count: 5 });
    document.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50 }));
    vi.advanceTimersToNextTimer();
    expect(stub.arc).toHaveBeenCalledTimes(11);
  });
});
