import { describe, expect, it, vi } from 'vitest';
import { RefCounted } from './ref-counted';

describe('RefCounted', () => {
  it('calls onFirst when acquiring from zero', () => {
    const resource = new RefCounted();
    const onFirst = vi.fn();
    const onLast = vi.fn();

    resource.acquire(onFirst);

    expect(onFirst).toHaveBeenCalledTimes(1);
    expect(onLast).not.toHaveBeenCalled();
  });

  it('does not call onFirst on subsequent acquires', () => {
    const resource = new RefCounted();
    const onFirst = vi.fn();

    resource.acquire(onFirst);
    resource.acquire(onFirst);

    expect(onFirst).toHaveBeenCalledTimes(1);
  });

  it('calls onLast when releasing to zero from single acquire', () => {
    const resource = new RefCounted();
    const onLast = vi.fn();

    resource.acquire(() => {});
    resource.release(onLast);

    expect(onLast).toHaveBeenCalledTimes(1);
  });

  it('does not call onLast when release keeps count above zero', () => {
    const resource = new RefCounted();
    const onLast = vi.fn();

    resource.acquire(() => {});
    resource.acquire(() => {});
    resource.release(onLast);

    expect(onLast).not.toHaveBeenCalled();
  });

  it('calls onFirst again after full release cycle', () => {
    const resource = new RefCounted();
    const onFirst = vi.fn();

    resource.acquire(onFirst);
    resource.release(() => {});
    resource.acquire(onFirst);

    expect(onFirst).toHaveBeenCalledTimes(2);
  });

  it('does not call onLast more than once on extra releases', () => {
    const resource = new RefCounted();
    const onLast = vi.fn();

    resource.acquire(() => {});
    resource.release(onLast);
    resource.release(onLast);

    expect(onLast).toHaveBeenCalledTimes(1);
  });
});
