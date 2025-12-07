import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { ParticleData } from '../types';

const tempVec3 = new THREE.Vector3();

// Helper to get random point in sphere
const randomPointInSphere = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const generateTreeParticles = (count: number): ParticleData[] => {
  const particles: ParticleData[] = [];

  for (let i = 0; i < count; i++) {
    // 1. Generate Tree Position (Spiral Cone)
    const h = Math.random(); 
    // Bias height slightly upwards to fill the top nicely
    const y = (h * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
    
    // Radius decreases as height increases
    const currentRadius = CONFIG.TREE_RADIUS_BASE * (1 - h);
    
    const angle = i * 2.39996;
    
    // Tighter constraint on radius noise to make the "Cone" shape more solid/majestic
    const r = currentRadius * Math.sqrt(Math.random()) + (Math.random() * 0.5);
    
    const treePos = new THREE.Vector3(
      Math.cos(angle) * r,
      y,
      Math.sin(angle) * r
    );

    // 2. Scatter Position
    const scatterPos = randomPointInSphere(CONFIG.SCATTER_RADIUS);

    // 3. Properties
    // Distribution: Mostly Emerald/Dark, with Gold accents
    const rand = Math.random();
    let color = COLORS.EMERALD_DEEP;
    
    if (rand > 0.95) color = COLORS.WHITE_GLOW; // Rare diamond sparks
    else if (rand > 0.80) color = COLORS.GOLD_METALLIC; // Gold gifts
    else if (rand > 0.70) color = COLORS.CRIMSON_ACCENT; // Red gifts
    else if (rand > 0.40) color = COLORS.EMERALD_BRIGHT; // Bright leaves
    
    // Randomize rotation - Cubes look best when tumbling
    const rotation = new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    // SCALE: Larger to resemble gifts/boxes
    // Base scale range: 0.8 - 1.5 (much larger than previous 0.15)
    let scale = 0.8 + Math.random() * 0.7;
    
    // Feature pieces (Big Gifts)
    if (Math.random() > 0.98) {
        scale = 2.0; 
    }

    particles.push({
      id: i,
      scatterPosition: scatterPos,
      treePosition: treePos,
      rotation: rotation,
      scale: scale,
      color: color,
      speed: Math.random() * 0.5 + 0.5,
      phase: Math.random() * Math.PI * 2
    });
  }

  return particles;
};

export const generateOrnaments = () => {
  const baubles: ParticleData[] = [];
  const garlands: ParticleData[] = [];
  const ribbons: ParticleData[] = [];

  // 1. Generate Baubles (Large spheres scattered on surface)
  for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
    const h = Math.random();
    const y = (h * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
    
    // Place strictly on the outer radius to sit "on top" of the foliage
    const coneRadius = CONFIG.TREE_RADIUS_BASE * (1 - h);
    // Add offset to make them pop out
    const r = coneRadius + 0.4; 
    
    const angle = Math.random() * Math.PI * 2;

    const treePos = new THREE.Vector3(
      Math.cos(angle) * r,
      y,
      Math.sin(angle) * r
    );

    const scatterPos = randomPointInSphere(CONFIG.SCATTER_RADIUS);

    // Bauble Colors: mostly Red and Gold
    const isGold = Math.random() > 0.4;
    const color = isGold ? COLORS.GOLD_METALLIC : COLORS.CRIMSON_ACCENT;

    baubles.push({
      id: i,
      scatterPosition: scatterPos,
      treePosition: treePos,
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      scale: 0.6 + Math.random() * 0.4, // Large size
      color: color,
      speed: Math.random() * 0.5 + 0.5,
      phase: Math.random() * Math.PI * 2
    });
  }

  // 2. Generate Garland (Spiral string of pearls)
  const totalPoints = CONFIG.GARLAND_SEGMENTS;
  for (let i = 0; i < totalPoints; i++) {
    const t = i / totalPoints; // 0 to 1
    
    const y = (t * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
    
    // Spiral radius
    const coneRadius = CONFIG.TREE_RADIUS_BASE * (1 - t);
    const r = coneRadius + 0.6; // Sit even further out than baubles

    // Spiral Angle
    const angle = t * Math.PI * 2 * CONFIG.GARLAND_LOOPS;

    const treePos = new THREE.Vector3(
      Math.cos(angle) * r,
      y,
      Math.sin(angle) * r
    );

    const scatterPos = randomPointInSphere(CONFIG.SCATTER_RADIUS * 1.2);

    garlands.push({
      id: i + CONFIG.ORNAMENT_COUNT,
      scatterPosition: scatterPos,
      treePosition: treePos,
      rotation: new THREE.Euler(),
      scale: 0.25, // Small consistent size
      color: COLORS.GOLD_BRIGHT, // Glowing gold
      speed: 1.0,
      phase: i * 0.1 // Ripple effect phase
    });
  }

  // 3. Generate Ribbons (Vertical flowing sashes)
  let ribbonIdCounter = 0;
  for (let r = 0; r < CONFIG.RIBBON_COUNT; r++) {
    const startAngle = (r / CONFIG.RIBBON_COUNT) * Math.PI * 2;
    
    for (let s = 0; s < CONFIG.RIBBON_SEGMENTS; s++) {
      const t = s / CONFIG.RIBBON_SEGMENTS;
      
      // Height goes bottom up.
      const y = (t * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
      const coneRadius = CONFIG.TREE_RADIUS_BASE * (1 - t);
      
      // Radius offset: Ribbons drape outside everything
      const radius = coneRadius + 0.9;

      // Gentle spiral
      const angle = startAngle + (t * Math.PI * 2.5); 

      const treePos = new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );

      // Pre-calculate rotation to align with the spiral tangent roughly
      const rotation = new THREE.Euler(
        0, 
        -angle, // Face outward
        (Math.PI / 4) // Tilt 45 degrees
      );

      const scatterPos = randomPointInSphere(CONFIG.SCATTER_RADIUS * 1.3);

      ribbons.push({
        id: CONFIG.ORNAMENT_COUNT + CONFIG.GARLAND_SEGMENTS + ribbonIdCounter++,
        scatterPosition: scatterPos,
        treePosition: treePos,
        rotation: rotation,
        scale: 1.0,
        color: COLORS.GOLD_METALLIC,
        speed: 0.5,
        phase: r + (s * 0.1) // Phase shift for wave animation
      });
    }
  }

  return { baubles, garlands, ribbons };
};

export const generateEmbers = (): ParticleData[] => {
  const particles: ParticleData[] = [];

  for (let i = 0; i < CONFIG.EMBER_COUNT; i++) {
    const h = Math.random();
    const y = (h * CONFIG.TREE_HEIGHT * 1.4) - (CONFIG.TREE_HEIGHT / 2); 
    const radiusBase = CONFIG.TREE_RADIUS_BASE * 1.2; 
    const r = radiusBase * (1 - h * 0.3) + Math.random() * 4; 
    const angle = Math.random() * Math.PI * 2;

    const treePos = new THREE.Vector3(
      Math.cos(angle) * r,
      y,
      Math.sin(angle) * r
    );

    const scatterPos = randomPointInSphere(CONFIG.SCATTER_RADIUS * 1.6);

    particles.push({
      id: i,
      scatterPosition: scatterPos,
      treePosition: treePos,
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      scale: Math.random() * 0.15 + 0.05,
      color: COLORS.EMBER_GLOW,
      speed: Math.random() * 0.5 + 0.5,
      phase: Math.random() * Math.PI * 2
    });
  }
  return particles;
};

export const generateSnowflakes = (): ParticleData[] => {
  const particles: ParticleData[] = [];
  const count = CONFIG.SNOW_COUNT;
  
  for (let i = 0; i < count; i++) {
    // Widen the cylinder radius significantly (8 * 6 = 48) to cover more camera angles
    const radius = CONFIG.TREE_RADIUS_BASE * 6.0; 
    const r = Math.sqrt(Math.random()) * radius;
    const theta = Math.random() * Math.PI * 2;
    
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    
    // Vertical spread: Taller range (e.g. -40 to +40)
    const y = (Math.random() * 80) - 40;

    particles.push({
      id: i,
      scatterPosition: new THREE.Vector3(x, y, z), 
      treePosition: new THREE.Vector3(x, y, z),
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      // Scale: Large flakes for visibility (0.15 to 0.45)
      scale: Math.random() * 0.3 + 0.15, 
      color: COLORS.SNOW_WHITE,
      // Speed: Fast fall for storm effect
      speed: Math.random() * 1.0 + 0.5, 
      phase: Math.random() * Math.PI * 2 
    });
  }
  return particles;
};