export class RefCounted {
  private count: number = 0;

  acquire(onFirst: () => void): void {
    if (this.count === 0) onFirst();
    this.count++;
  }

  release(onLast: () => void): void {
    this.count--;
    if (this.count <= 0) {
      this.count = 0;
      onLast();
    }
  }
}
