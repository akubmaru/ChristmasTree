import * as THREE from 'three';

// Colors tuned for "Matte Luxury" - less blinding HDR, more rich pigment.
export const COLORS = {
  EMERALD_DEEP: new THREE.Color('#011a0d').multiplyScalar(1.0), // Very dark forest green
  EMERALD_BRIGHT: new THREE.Color('#059669').multiplyScalar(1.2), // Muted emerald
  GOLD_METALLIC: new THREE.Color('#d4af37').multiplyScalar(1.5), // Classic metallic gold
  GOLD_BRIGHT: new THREE.Color('#fcd34d').multiplyScalar(2.0), // Soft highlight
  CRIMSON_ACCENT: new THREE.Color('#7f1d1d').multiplyScalar(1.2), // Deep velvet red
  WHITE_GLOW: new THREE.Color('#e5e7eb').multiplyScalar(1.2), // Soft silver/white
  EMBER_GLOW: new THREE.Color('#ffaa00').multiplyScalar(3.0), // Hot orange/gold firefly
  SNOW_WHITE: new THREE.Color('#ffffff').multiplyScalar(5.0), // Blindingly bright white snow
};

export const CONFIG = {
  PARTICLE_COUNT: 3500, // Slightly fewer but larger particles for "Gift Box" look
  ORNAMENT_COUNT: 120, // Number of large baubles
  GARLAND_SEGMENTS: 400, // Number of beads in the spiral garland
  GARLAND_LOOPS: 6, // How many times the garland wraps around
  RIBBON_COUNT: 8, // Number of flowing ribbon strips
  RIBBON_SEGMENTS: 80, // Particles per ribbon
  EMBER_COUNT: 2000, // New shimmering embers
  SNOW_COUNT: 10000, // Heavy blizzard density
  TREE_HEIGHT: 18, // Taller for majesty
  TREE_RADIUS_BASE: 8, // Wide majestic base
  SCATTER_RADIUS: 25,
  ANIMATION_SPEED: 1.8, // Slower, heavier movement
};