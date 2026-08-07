import { afterEach, describe, expect, it } from 'vitest';
import { Ripple } from './ripple';

describe('Ripple.setOptions', () => {
  const ripples: Ripple[] = [];

  afterEach(() => {
    for (const ripple of ripples) ripple.destroy();
    ripples.length = 0;
    document.body.innerHTML = '';
  });

  it('applies updated options to ripples created after setOptions', () => {
    const ripple = new Ripple();
    ripples.push(ripple);

    ripple.setOptions({ maxSize: 60, color: 'red', duration: 500 });
    document.dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 100 }));

    const element = document.querySelector('.__ma-ripple-el') as HTMLElement;
    expect(element).not.toBeNull();
    expect(element.style.width).toBe('60px');
    expect(element.style.height).toBe('60px');
    expect(element.style.background).toBe('red');
    expect(element.style.left).toBe('70px');
    expect(element.style.top).toBe('70px');
    expect(element.style.cssText).toContain('500ms');
  });
});
