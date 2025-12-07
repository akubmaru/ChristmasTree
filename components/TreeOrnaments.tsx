import React, { useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMode } from '../types';
import { CONFIG, COLORS } from '../constants';
import { generateOrnaments } from '../services/geometryService';
import { easing } from 'maath';

interface TreeOrnamentsProps {
  mode: TreeMode;
}

// Sub-component for moving lights along the garland path
const GarlandSpirit: React.FC<{ speed: number; offset: number; color: THREE.Color; mode: TreeMode }> = ({ speed, offset, color, mode }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const intensityRef = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!lightRef.current) return;

    // Fade light in/out based on mode
    // Reduced max intensity from 8 to 4 to be softer
    const targetIntensity = mode === TreeMode.TREE_SHAPE ? 4 : 0;
    easing.damp(intensityRef, 'current', targetIntensity, 2.0, delta);
    lightRef.current.intensity = intensityRef.current;

    // Move along spiral path
    const t = ((clock.getElapsedTime() * speed) + offset) % 1;
    
    // Logic matches geometryService garland generation
    const h = CONFIG.TREE_HEIGHT;
    const y = (t * h) - (h / 2);
    const r = CONFIG.TREE_RADIUS_BASE * (1 - t) + 1.2; // Slightly offset from beads
    const angle = t * Math.PI * 2 * CONFIG.GARLAND_LOOPS;

    lightRef.current.position.set(
      Math.cos(angle) * r,
      y,
      Math.sin(angle) * r
    );
  });

  return <pointLight ref={lightRef} distance={6} decay={2} color={color} />;
};

const TreeOrnaments: React.FC<TreeOrnamentsProps> = ({ mode }) => {
  const baubleRef = useRef<THREE.InstancedMesh>(null);
  const garlandRef = useRef<THREE.InstancedMesh>(null);
  const ribbonRef = useRef<THREE.InstancedMesh>(null);
  
  const { baubles, garlands, ribbons } = useMemo(() => generateOrnaments(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  const progressRef = useRef(mode === TreeMode.TREE_SHAPE ? 1 : 0);
  const burstRef = useRef(0);

  // Trigger burst
  useEffect(() => {
    burstRef.current = 1.0;
  }, [mode]);

  // Initialize Colors
  useLayoutEffect(() => {
    if (baubleRef.current) {
      baubles.forEach((data, i) => baubleRef.current!.setColorAt(i, data.color));
      baubleRef.current.instanceColor!.needsUpdate = true;
    }
    // Ribbon colors are static gold
    if (ribbonRef.current) {
      ribbons.forEach((data, i) => ribbonRef.current!.setColorAt(i, data.color));
      ribbonRef.current.instanceColor!.needsUpdate = true;
    }
  }, [baubles, ribbons]);

  useFrame((state, delta) => {
    const target = mode === TreeMode.TREE_SHAPE ? 1 : 0;
    // Ornaments animate slightly slower for a "lag" effect behind the tree structure
    easing.damp(progressRef, 'current', target, CONFIG.ANIMATION_SPEED * 0.8, delta);
    // Flash burst decays quickly
    easing.damp(burstRef, 'current', 0, 0.25, delta);

    const t = progressRef.current;
    const time = state.clock.getElapsedTime();
    const burstScale = 1 + burstRef.current * 0.5;

    // Animate Baubles
    if (baubleRef.current) {
      baubles.forEach((data, i) => {
        const x = THREE.MathUtils.lerp(data.scatterPosition.x, data.treePosition.x, t);
        const y = THREE.MathUtils.lerp(data.scatterPosition.y, data.treePosition.y, t);
        const z = THREE.MathUtils.lerp(data.scatterPosition.z, data.treePosition.z, t);

        const floatY = Math.sin(time + data.phase) * 0.2;
        dummy.position.set(x, y + floatY, z);

        dummy.rotation.x = data.rotation.x + time * 0.2;
        dummy.rotation.y = data.rotation.y + time * 0.2;
        
        // Apply burst to scale
        dummy.scale.setScalar(data.scale * t * burstScale); 

        dummy.updateMatrix();
        baubleRef.current!.setMatrixAt(i, dummy.matrix);
      });
      baubleRef.current.instanceMatrix.needsUpdate = true;
    }

    // Animate Garlands with Dynamic Twinkle
    if (garlandRef.current) {
      garlands.forEach((data, i) => {
        // 1. Movement
        const x = THREE.MathUtils.lerp(data.scatterPosition.x, data.treePosition.x, t);
        const y = THREE.MathUtils.lerp(data.scatterPosition.y, data.treePosition.y, t);
        const z = THREE.MathUtils.lerp(data.scatterPosition.z, data.treePosition.z, t);

        dummy.position.set(x, y, z);
        dummy.rotation.set(0, 0, 0);
        
        // 2. Twinkle Logic (Zenitsu electricity style)
        // High frequency erratic flicker combined with slow pulse
        const timeMod = time * 8 + data.phase * 5;
        // Reduced peaks: sharp flicker max is now 1.0 (was 1.5)
        const sharpFlicker = Math.sin(timeMod) > 0.85 ? 1.0 : 0.5; 
        const breathe = Math.sin(time * 2 + data.phase) * 0.3 + 0.7;
        
        // Intensity multiplier
        // Reduced burst multiplier
        const brightness = (sharpFlicker * breathe) + (burstRef.current * 1.5);

        // Apply scale pulse based on brightness + burst
        dummy.scale.setScalar(data.scale * (0.8 + brightness * 0.2 + burstRef.current * 0.4));
        dummy.updateMatrix();
        garlandRef.current!.setMatrixAt(i, dummy.matrix);

        // 3. Color Update (Emissive feel via bright colors)
        // Base color is Gold Bright.
        tempColor.copy(data.color).multiplyScalar(brightness);
        garlandRef.current!.setColorAt(i, tempColor);
      });
      garlandRef.current.instanceMatrix.needsUpdate = true;
      garlandRef.current.instanceColor!.needsUpdate = true;
    }

    // Animate Ribbons
    if (ribbonRef.current) {
      ribbons.forEach((data, i) => {
        const x = THREE.MathUtils.lerp(data.scatterPosition.x, data.treePosition.x, t);
        const y = THREE.MathUtils.lerp(data.scatterPosition.y, data.treePosition.y, t);
        const z = THREE.MathUtils.lerp(data.scatterPosition.z, data.treePosition.z, t);

        dummy.position.set(x, y, z);
        dummy.rotation.copy(data.rotation);
        
        const flutter = Math.sin(time * 2 + data.phase) * 0.2;
        const twist = Math.cos(time * 1.5 + data.phase) * 0.1;

        dummy.rotation.y += flutter;
        dummy.rotation.x += twist;
        dummy.scale.setScalar(t * burstScale); // Apply burst to ribbon width too

        dummy.updateMatrix();
        ribbonRef.current!.setMatrixAt(i, dummy.matrix);
      });
      ribbonRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Dynamic Light Spirits traveling up the tree */}
      <GarlandSpirit speed={0.15} offset={0.0} color={COLORS.GOLD_BRIGHT} mode={mode} />
      <GarlandSpirit speed={0.15} offset={0.5} color={COLORS.GOLD_METALLIC} mode={mode} />

      {/* Baubles - Faceted Icosahedrons */}
      <instancedMesh
        ref={baubleRef}
        args={[undefined, undefined, baubles.length]}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={2.0}
        />
      </instancedMesh>

      {/* Garlands - Small Spheres/Pearls */}
      <instancedMesh
        ref={garlandRef}
        args={[undefined, undefined, garlands.length]}
      >
        <sphereGeometry args={[0.3, 8, 8]} />
        {/* 
            Using a simple material that relies on instanceColor for the "glow".
            High metalness helps it catch the scene lights too.
        */}
        <meshStandardMaterial
          color="#ffffff" 
          metalness={0.9}
          roughness={0.2}
          toneMapped={false} // Allow HDR colors to bloom
        />
      </instancedMesh>

      {/* Ribbons - Flat Rectangular Strips */}
      <instancedMesh
        ref={ribbonRef}
        args={[undefined, undefined, ribbons.length]}
      >
        <boxGeometry args={[0.15, 0.4, 0.05]} />
        <meshStandardMaterial
          color="#ffffff" 
          metalness={1.0} 
          roughness={0.2}
          envMapIntensity={2.5}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
};

export default TreeOrnaments;