import jQuery from "jquery";
import { Trail, Ripple, CustomCursor, Magnetic, Particles, Parallax, Tilt } from "./index";
import type { TrailOptions, RippleOptions, CustomCursorOptions, MagneticOptions, ParticlesOptions, ParallaxOptions, TiltOptions } from "./core/types";

type AnimInstance = { enable(): void; disable(): void; destroy(): void };
type Method = "enable" | "disable" | "destroy";
type SelectorOpts<T extends { selector: string }> = Omit<T, "selector"> & { selector?: string };

declare global {
  interface JQuery {
    trail(opts?: TrailOptions | Method): this;
    ripple(opts?: RippleOptions | Method): this;
    customCursor(opts?: CustomCursorOptions | Method): this;
    magnetic(opts?: SelectorOpts<MagneticOptions> | Method): this;
    particles(opts?: ParticlesOptions | Method): this;
    parallax(opts?: SelectorOpts<ParallaxOptions> | Method): this;
    tilt(opts?: SelectorOpts<TiltOptions> | Method): this;
  }
}

// Generic plugin factory for effects that don't need element-specific selectors.
function makePlugin<T extends object>(key: string, AnimConstructor: new (opts: T) => AnimInstance) {
  return function (this: JQuery, optsOrMethod: T | Method = {} as T): JQuery {
    return this.each(function (this: Element) {
      const $el = jQuery(this);
      if (typeof optsOrMethod === "string") {
        const inst = $el.data(key) as AnimInstance | undefined;
        if (inst) {
          inst[optsOrMethod]();
          if (optsOrMethod === "destroy") $el.removeData(key);
        }
      } else {
        ($el.data(key) as AnimInstance | undefined)?.destroy();
        $el.data(key, new AnimConstructor(optsOrMethod));
      }
    });
  };
}

jQuery.fn.trail = makePlugin<TrailOptions>("ma.trail", Trail);
jQuery.fn.ripple = makePlugin<RippleOptions>("ma.ripple", Ripple);
jQuery.fn.customCursor = makePlugin<CustomCursorOptions>("ma.cursor", CustomCursor);
jQuery.fn.particles = makePlugin<ParticlesOptions>("ma.particles", Particles);

// Magnetic, Parallax, and Tilt all target elements via a selector, so one instance
// covers all matched elements. Auto-generate a unique class when no selector is given.
let _selectorCounter = 0;

function makeSelectorPlugin<T extends { selector: string }>(
  key: string,
  AnimConstructor: new (opts: T) => AnimInstance,
) {
  return function (this: JQuery, optsOrMethod: SelectorOpts<T> | Method = {} as SelectorOpts<T>): JQuery {
    if (typeof optsOrMethod === "string") {
      return this.each(function (this: Element) {
        const $el = jQuery(this);
        const inst = $el.data(key) as AnimInstance | undefined;
        if (inst) {
          inst[optsOrMethod as Method]();
          if (optsOrMethod === "destroy") $el.removeData(key);
        }
      });
    }

    const cls = optsOrMethod.selector ? undefined : `_ma-sel-${++_selectorCounter}`;
    if (cls) this.addClass(cls);

    const selector = optsOrMethod.selector ?? `.${cls as string}`;
    const { selector: _ignored, ...rest } = optsOrMethod;

    const inst = new AnimConstructor({ ...rest, selector } as unknown as T);
    this.first().data(key, inst);

    return this;
  };
}

jQuery.fn.magnetic = makeSelectorPlugin<MagneticOptions>("ma.magnetic", Magnetic);
jQuery.fn.parallax = makeSelectorPlugin<ParallaxOptions>("ma.parallax", Parallax);
jQuery.fn.tilt = makeSelectorPlugin<TiltOptions>("ma.tilt", Tilt);

export default jQuery;
