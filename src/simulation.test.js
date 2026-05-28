import { describe, it, expect } from 'vitest';
import { waveForce, waveVisualParticleCount } from './simulation.js';
import { textScanBounds } from './simulation.js';

// Mirrors the relevant fields of the config object in main.js.
const config = {
  waveStrength: 2.0,
  waveBandWidth: 50,
  waveVisualDensity: 0.25,
  maxWaveVisualParticles: 220,
};

describe('waveForce', () => {
  it('returns a finite zero force when the particle sits exactly on the wave origin', () => {
    // Regression guard: dividing by dist === 0 used to produce NaN, which
    // propagated into the particle position and corrupted it permanently.
    const wave = { x: 100, y: 100, radius: 10 };
    const force = waveForce(100, 100, 'BG', wave, config);

    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
    expect(Number.isNaN(force.x)).toBe(false);
    expect(Number.isNaN(force.y)).toBe(false);
  });

  it('never produces NaN for a TEXT particle on the origin (NaN * 0 is still NaN)', () => {
    const wave = { x: 0, y: 0, radius: 5 };
    const force = waveForce(0, 0, 'TEXT', wave, config);

    expect(Number.isFinite(force.x)).toBe(true);
    expect(Number.isFinite(force.y)).toBe(true);
    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
  });

  it('returns zero force when the particle is outside the wave band', () => {
    // Particle at dist 200 from origin, wave radius 10 -> distDiff 190 >> band 50.
    const wave = { x: 0, y: 0, radius: 10 };
    const force = waveForce(200, 0, 'BG', wave, config);

    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
  });

  it('returns zero force for TEXT particles even inside the band (strength 0)', () => {
    // Particle right on the wave crest (distDiff 0, fully inside the band).
    const wave = { x: 0, y: 0, radius: 100 };
    const force = waveForce(100, 0, 'TEXT', wave, config);

    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
  });

  it('pulls a BG particle toward the wave crest when inside the band', () => {
    // Particle at x=80 on the x-axis, wave radius 100: the crest is at x=100,
    // so the particle should be pushed outward (+x) toward it.
    const wave = { x: 0, y: 0, radius: 100 };
    const force = waveForce(80, 0, 'BG', wave, config);

    expect(force.x).toBeGreaterThan(0);
    expect(force.y).toBeCloseTo(0, 10); // on-axis: no vertical component
    expect(Number.isFinite(force.x)).toBe(true);
  });

  it('force falls off toward the edge of the band (quadratic factor)', () => {
    const wave = { x: 0, y: 0, radius: 100 };
    const nearCrest = waveForce(95, 0, 'BG', wave, config); // distDiff 5
    const nearEdge = waveForce(60, 0, 'BG', wave, config); // distDiff 40

    expect(Math.abs(nearCrest.x)).toBeGreaterThan(Math.abs(nearEdge.x));
  });
});

describe('waveVisualParticleCount', () => {
  it('scales with radius for small waves', () => {
    // 5 + floor(40 * 0.25) = 5 + 10 = 15
    expect(waveVisualParticleCount(40, config)).toBe(15);
  });

  it('uses the base count of 5 at radius 0', () => {
    expect(waveVisualParticleCount(0, config)).toBe(5);
  });

  it('caps at maxWaveVisualParticles for large waves', () => {
    // Without the cap this would be 5 + floor(5000 * 0.25) = 1255.
    expect(waveVisualParticleCount(5000, config)).toBe(config.maxWaveVisualParticles);
  });

  it('never exceeds the cap across a wide radius sweep', () => {
    for (let r = 0; r <= 10000; r += 137) {
      expect(waveVisualParticleCount(r, config)).toBeLessThanOrEqual(
        config.maxWaveVisualParticles
      );
    }
  });
});

describe('textScanBounds', () => {
  it('returns a region centered horizontally within the canvas', () => {
    const b = textScanBounds(1000, 800, 400, 200, 400);
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.w).toBeLessThanOrEqual(1000);
    // text width 400 centered in 1000 -> left edge near 300, minus a little padding
    expect(b.x).toBeGreaterThan(250);
    expect(b.x).toBeLessThan(300);
  });

  it('brackets centerY vertically', () => {
    const b = textScanBounds(1000, 800, 400, 200, 400);
    expect(b.y).toBeLessThan(400);
    expect(b.y + b.h).toBeGreaterThan(400);
  });

  it('clamps width to the canvas when text is wider than the canvas', () => {
    const b = textScanBounds(300, 800, 5000, 200, 400);
    expect(b.x).toBe(0);
    expect(b.w).toBeLessThanOrEqual(300);
  });

  it('clamps the vertical region to the canvas top edge', () => {
    const b = textScanBounds(1000, 100, 400, 400, 10);
    expect(b.y).toBe(0);
    expect(b.y + b.h).toBeLessThanOrEqual(100);
  });

  it('never returns zero or negative dimensions', () => {
    const b = textScanBounds(1000, 800, 0, 0, 400);
    expect(b.w).toBeGreaterThanOrEqual(1);
    expect(b.h).toBeGreaterThanOrEqual(1);
  });
});
