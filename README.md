# mouse-animations

A lightweight, framework-agnostic library for cursor and mouse effects. Zero dependencies, under 5 kB gzipped, fully typed. Optional jQuery plugin included.

**[Live Playground →](https://tgomilar.github.io/mouse-animations/)**

---

## Effects

| Effect           | Description                                                         |
| ---------------- | ------------------------------------------------------------------- |
| **Trail**        | Fading dot trail that follows the cursor on a canvas overlay        |
| **Ripple**       | Expanding circle at each click position                             |
| **CustomCursor** | Dot + smoothly lagging outer ring replacing the native cursor       |
| **Magnetic**     | Pulls matching elements toward the cursor as it approaches          |
| **Particles**    | Burst of coloured particles on each click                           |
| **Parallax**     | Elements shift subtly as the mouse moves across the viewport        |
| **Tilt**         | 3D perspective tilt that follows the cursor within each element     |
| **Spotlight**    | Radial gradient glow that follows the cursor inside each element    |
| **Invert**       | Colored circle that inverts content beneath it via mix-blend-mode   |
| **Image**        | Replaces the native cursor with a custom image or inline SVG        |

---

## Installation

**npm**

```bash
npm install mouse-animations
```

**CDN (no build step)**

```html
<script type="module">
  import { Trail } from "https://cdn.jsdelivr.net/npm/mouse-animations/+esm";
</script>
```

---

## Usage

Each effect is an independent class. Instantiate to start, call `destroy()` to clean up.

```ts
import { Trail } from "mouse-animations";

const trail = new Trail({ color: "#a78bfa", size: 8 });

trail.disable(); // pause — keeps DOM elements intact
trail.enable(); // resume
trail.destroy(); // stop and remove all DOM elements
```

All classes share the same interface:

```ts
interface MouseAnimationsBase {
  enable(): void; // start or resume the effect
  disable(): void; // pause without removing DOM elements
  destroy(): void; // stop and remove all DOM elements
}
```

All option types are exported for use in TypeScript projects:

```ts
import type {
  TrailOptions, RippleOptions, CustomCursorOptions,
  MagneticOptions, ParticlesOptions, ParallaxOptions,
  TiltOptions, SpotlightOptions, InvertOptions, ImageOptions,
} from "mouse-animations";
```

---

## API

### Trail

Renders a fading dot trail that follows the cursor on a canvas overlay.

```ts
import { Trail } from "mouse-animations";

const trail = new Trail({
  color: "#ffffff", // dot color
  size: 6, // max dot radius in px
  length: 20, // number of trail points to keep
  decay: 0.05, // alpha subtracted per frame (0–1)
  blur: 0, // CSS blur in px
});
```

---

### Ripple

Creates an expanding ripple circle at each click position.

```ts
import { Ripple } from "mouse-animations";

const ripple = new Ripple({
  color: "rgba(255,255,255,0.4)", // fill color
  duration: 600, // animation duration in ms
  maxSize: 100, // max ripple diameter in px
});
```

---

### CustomCursor

Replaces the native cursor with a dot and a smoothly lagging outer ring.

```ts
import { CustomCursor } from "mouse-animations";

const cursor = new CustomCursor({
  innerSize: 8, // inner dot size in px
  outerSize: 36, // outer ring size in px
  innerColor: "#ffffff", // inner dot color
  outerColor: "rgba(255,255,255,0.5)", // outer ring color
  smoothness: 0.15, // outer ring lerp factor (0–1); lower = more lag
  hideDefault: true, // hide the native cursor
});
```

---

### Magnetic

Applies a magnetic pull to matching elements as the cursor approaches them. The transform is restored when the cursor leaves.

```ts
import { Magnetic } from "mouse-animations";

const magnetic = new Magnetic({
  selector: ".btn", // CSS selector for elements to magnetise (required)
  strength: 0.3, // pull strength multiplier
  radius: 100, // activation radius in px
  ease: 0.15, // lerp ease factor (0–1)
});
```

---

### Particles

Bursts coloured canvas particles from each click position.

```ts
import { Particles } from "mouse-animations";

const particles = new Particles({
  count: 20, // particles per click
  colors: ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff"], // colors picked at random
  size: 6, // max particle radius in px
  spread: 8, // initial speed spread
  decay: 0.02, // alpha decay per frame
});
```

---

### Parallax

Shifts matching elements as the mouse moves across the viewport, creating a depth illusion.

```ts
import { Parallax } from "mouse-animations";

const parallax = new Parallax({
  selector: ".layer", // CSS selector for elements to shift (required)
  depth: 20, // max translation in px at the viewport edge
  ease: 0.1, // lerp ease factor (0–1)
});
```

---

### Tilt

Applies a 3D perspective tilt to matching elements as the cursor moves over them, with an optional glare highlight.

```ts
import { Tilt } from "mouse-animations";

const tilt = new Tilt({
  selector: ".card", // CSS selector for elements to tilt (required)
  maxTilt: 15, // max tilt angle in degrees
  perspective: 800, // CSS perspective distance in px
  ease: 0.1, // lerp ease factor (0–1)
  glare: false, // show a glare highlight overlay
});
```

---

### Spotlight

Renders a radial gradient glow that follows the cursor inside each matched element. Works best on dark cards and panels.

```ts
import { Spotlight } from "mouse-animations";

const spotlight = new Spotlight({
  selector: ".card", // CSS selector for elements (required)
  color: "rgba(255,255,255,0.12)", // spotlight glow color
  size: 200, // spotlight radius in px
});
```

---

### Invert

Renders an opaque circle that follows the cursor and inverts the colors of everything beneath it using `mix-blend-mode: difference`. Works on text, images, and any colored content.

> The inversion result depends on the circle color. White (`#ffffff`, default) produces the classic full inversion. Use a different color if the page background is light — for example `#000000` inverts on white backgrounds identically.

```ts
import { Invert } from "mouse-animations";

const cursor = new Invert({
  size: 40,          // circle diameter in px
  color: "#ffffff",  // circle color — affects the inversion output. Default: '#ffffff'
  smoothness: 1,     // lerp factor (0–1); 1 = instant snap, lower = lag
  hideDefault: true, // hide the native cursor
});
```

---

### Image

Replaces the native cursor with a custom image URL or inline SVG string.

> **Note:** The name `Image` shadows the DOM built-in `Image` constructor (`HTMLImageElement`) within the same file. If you need both, use an alias:
> ```ts
> import { Image as CursorImage } from "mouse-animations";
> ```

```ts
import { Image } from "mouse-animations";

const cursor = new Image({
  src: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>...</svg>",
  width: 32,         // cursor element width in px
  height: 32,        // cursor element height in px
  offsetX: 0,        // horizontal offset from cursor position in px
  offsetY: 0,        // vertical offset from cursor position in px
  smoothness: 1,     // lerp factor (0–1); 1 = instant snap, lower = lag
  hideDefault: true, // hide the native cursor
  overrideAll: false, // inject * { cursor: none !important } — defeats cursor: pointer on buttons/links
  states: {               // alternate images per interaction state (optional)
    hover: "<svg .../>",  // built-in: shown over a, button, input, select, textarea…
    active: "<svg .../>", // built-in: shown while mousedown is held
    ".my-zone": "<svg .../>", // custom: any CSS selector matched via closest()
  },
});
```

An image URL is also accepted as `src`:

```ts
new Image({ src: "/my-cursor.png", width: 40, height: 40 });
```

#### State-based cursors

Use `states` to show a different cursor image on interactive elements or while the mouse button is held. Any key other than the built-ins is treated as a CSS selector matched via `closest()`.

```ts
const cursor = new Image({
  src: starSvg,
  overrideAll: true,
  states: {
    hover: handSvg,         // a, button, input, select, textarea…
    active: clickSvg,       // while mousedown is held
    ".danger-zone": warnSvg, // any CSS selector
  },
});
```

#### `setSource(state, src)`

Swap a cursor image at runtime without recreating the instance:

```ts
cursor.setSource("normal", newSvg);
cursor.setSource("hover", newHandSvg);
cursor.setSource(".danger-zone", "/new-warn.png");
```

---

## jQuery plugin

All effects are available as jQuery methods. jQuery `>=3.0.0` is an optional peer dependency.

```bash
npm install mouse-animations jquery
```

```js
import "mouse-animations/jquery";

// Global effects — bound to a container element
$("body").trail({ color: "#a78bfa", size: 8 });
$("body").ripple({ duration: 700, maxSize: 120 });
$("body").customCursor({ innerColor: "#a78bfa", smoothness: 0.12 });
$("body").particles({ count: 24 });
$("body").invert({ size: 40, color: "#ffffff" });
$("body").image({ src: "<svg .../>", overrideAll: true, states: { hover: "<svg .../>" } });

// Selector-based effects — one instance covers all matched elements.
// The selector option is optional: if omitted, a unique class is stamped
// onto the matched elements automatically.
$(".btn").magnetic({ strength: 0.4, radius: 120 });
$(".layer").parallax({ depth: 20, ease: 0.1 });
$(".card").tilt({ maxTilt: 15, perspective: 800, glare: true });
$(".card").spotlight({ color: "rgba(255,255,255,0.12)", size: 200 });

// All plugins support enable / disable / destroy
$("body").trail("disable");
$("body").trail("enable");
$("body").trail("destroy");
```

---

## Combining effects

All effects are independent and can run simultaneously:

```ts
import { Trail, Ripple, Particles, CustomCursor, Magnetic, Parallax, Tilt, Spotlight, Invert, Image } from "mouse-animations";

const trail     = new Trail({ color: "#a78bfa" });
const ripple    = new Ripple({ color: "rgba(167,139,250,0.35)" });
const particles = new Particles({ count: 24 });
const cursor    = new CustomCursor({ innerColor: "#a78bfa" });
const magnetic  = new Magnetic({ selector: ".magnetic-btn" });
const parallax  = new Parallax({ selector: ".layer" });
const tilt      = new Tilt({ selector: ".card", glare: true });
const spotlight = new Spotlight({ selector: ".card" });
const invert    = new Invert({ size: 40 });
const image     = new Image({ src: starSvg, overrideAll: true });

// Clean up all at once
[trail, ripple, particles, cursor, magnetic, parallax, tilt, spotlight, invert, image].forEach((e) => e.destroy());
```

---

## License

MIT
