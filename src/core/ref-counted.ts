/**
 * Manages a reference-counted resource lifecycle.
 *
 * - First acquire() calls onFirst.
 * - Last release() calls onLast.
 * - Nesting is tracked via an internal counter.
 *
 * Usage:
 * ```
 * const resource = new RefCounted();
 * resource.acquire(() => create());   // creates on first use
 * resource.release(() => dispose());  // disposes on last release
 * ```
 */
export class RefCounted {
  private count: number = 0;

  /** Increment the ref count. Calls onFirst when transitioning from 0 to 1. */
  acquire(onFirst: () => void): void {
    if (this.count === 0) onFirst();
    this.count++;
  }

  /** Decrement the ref count. Calls onLast when transitioning from 1 to 0. */
  release(onLast: () => void): void {
    this.count--;
    if (this.count <= 0) {
      this.count = 0;
      onLast();
    }
  }
}
