declare module 'canvas-confetti' {
  function confetti(options?: {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    ticks?: number;
    zIndex?: number;
    shapes?: string[];
    scalar?: number;
    drift?: number;
    gravity?: number;
    startVelocity?: number;
    decay?: number;
    disableForReducedMotion?: boolean;
  }): Promise<null> | null;
  export = confetti;
}