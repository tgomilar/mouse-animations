import { afterEach, describe, expect, it, vi } from 'vitest';
import { Trail } from './trail';

function stubCanvasContext() {
  const fillStyles: string[] = [];
  const ctx = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(function (this: { fillStyle: string }) {
      fillStyles.push(this.fillStyle);
    }),
    fillStyle: '',
    globalAlpha: 1,
    filter: 'none',
  };
  const spy = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  return { fillStyles, restore: () => spy.mockRestore() };
}

describe('Trail.setOptions', () => {
  const trails: Trail[] = [];
  let stub: ReturnType<typeof stubCanvasContext> | null = null;

  afterEach(() => {
    for (const trail of trails) trail.destroy();
    trails.length = 0;
    stub?.restore();
    stub = null;
    vi.useRealTimers();
  });

  it('renders subsequent frames with the updated color', () => {
    vi.useFakeTimers();
    stub = stubCanvasContext();
    const trail = new Trail({ color: '#ff0000', size: 4 });
    trails.push(trail);

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));
    vi.advanceTimersToNextTimer();
    expect(stub.fillStyles[stub.fillStyles.length - 1]).toBe('#ff0000');

    trail.setOptions({ color: '#00ff00' });
    vi.advanceTimersToNextTimer();
    expect(stub.fillStyles[stub.fillStyles.length - 1]).toBe('#00ff00');
  });
});
