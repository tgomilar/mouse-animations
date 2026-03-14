export interface MouseAnimationsBase {
  enable(): void;
  disable(): void;
  destroy(): void;
}

export interface TrailOptions {
  /** Dot color. Default: '#ffffff' */
  color?: string;
  /** Max dot radius in px. Default: 6 */
  size?: number;
  /** Number of trail points to keep. Default: 20 */
  length?: number;
  /** Alpha subtracted per frame (0–1). Default: 0.05 */
  decay?: number;
  /** Optional CSS blur in px. Default: 0 */
  blur?: number;
}

export interface RippleOptions {
  /** Ripple fill color. Default: 'rgba(255,255,255,0.4)' */
  color?: string;
  /** Animation duration in ms. Default: 600 */
  duration?: number;
  /** Max ripple diameter in px. Default: 100 */
  maxSize?: number;
}

export interface CustomCursorOptions {
  /** Inner dot size in px. Default: 8 */
  innerSize?: number;
  /** Outer ring size in px. Default: 36 */
  outerSize?: number;
  /** Inner dot color. Default: '#ffffff' */
  innerColor?: string;
  /** Outer ring color. Default: 'rgba(255,255,255,0.5)' */
  outerColor?: string;
  /** Outer ring lerp factor (0–1). Default: 0.15 */
  smoothness?: number;
  /** Hide the native cursor. Default: true */
  hideDefault?: boolean;
}

export interface MagneticOptions {
  /** CSS selector for elements to magnetise */
  selector: string;
  /** Pull strength multiplier. Default: 0.3 */
  strength?: number;
  /** Activation radius in px. Default: 100 */
  radius?: number;
  /** Lerp ease factor (0–1). Default: 0.15 */
  ease?: number;
}

export interface ParticlesOptions {
  /** Number of particles per click. Default: 20 */
  count?: number;
  /** Array of colors to pick from randomly */
  colors?: string[];
  /** Max particle radius in px. Default: 6 */
  size?: number;
  /** Alpha decay per frame. Default: 0.02 */
  decay?: number;
  /** Initial speed spread. Default: 8 */
  spread?: number;
}

export interface ParallaxOptions {
  /** CSS selector for elements to shift */
  selector: string;
  /** Max translation in px at viewport edge. Default: 20 */
  depth?: number;
  /** Lerp ease factor (0–1). Default: 0.1 */
  ease?: number;
}

export interface TiltOptions {
  /** CSS selector for elements to tilt */
  selector: string;
  /** Max tilt angle in degrees. Default: 15 */
  maxTilt?: number;
  /** CSS perspective distance in px. Default: 800 */
  perspective?: number;
  /** Lerp ease factor (0–1). Default: 0.1 */
  ease?: number;
  /** Show a glare highlight overlay. Default: false */
  glare?: boolean;
}
