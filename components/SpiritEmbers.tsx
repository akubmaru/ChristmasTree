import React, { useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMode } from '../types';
import { CONFIG } from '../constants';
import { generateEmbers } from '../services/geometryService';
import { easing } from 'maath';

interface SpiritEmbersProps {
  mode: TreeMode;
}

const SpiritEmbers: React.FC<SpiritEmbersProps> = ({ mode }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => generateEmbers(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const progressRef = useRef(mode === TreeMode.TREE_SHAPE ? 1 : 0);
  const burstRef = useRef(0);

  useEffect(() => {
    burstRef.current = 1.0;
  }, [mode]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    data.forEach((particle, i) => {
      meshRef.current!.setColorAt(i, particle.color);
    });
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Transition Logic
    const target = mode === TreeMode.TREE_SHAPE ? 1 : 0;
    // Embers transition slightly slower/lazier than the structure
    easing.damp(progressRef, 'current', target, CONFIG.ANIMATION_SPEED * 0.6, delta);
    // Embers have a slightly longer burst tail for a magical feel
    easing.damp(burstRef, 'current', 0, 0.4, delta);

    const t = progressRef.current;
    
    const time = state.clock.getElapsedTime();

    data.forEach((particle, i) => {
      // 1. Base Interpolation
      const baseX = THREE.MathUtils.lerp(particle.scatterPosition.x, particle.treePosition.x, t);
      const baseY = THREE.MathUtils.lerp(particle.scatterPosition.y, particle.treePosition.y, t);
      const baseZ = THREE.MathUtils.lerp(particle.scatterPosition.z, particle.treePosition.z, t);

      // 2. Additive Animation (The "Life" of the ember)
      // Vertical Rise: Embers always float up.
      // We loop this offset so they don't fly away forever.
      const riseSpeed = 0.5 * particle.speed;
      const verticalOffset = (time * riseSpeed + particle.phase) % 6; 
      
      // Spiral/Swirl Motion
      // In Tree mode: gentle spiral up. In Scatter: chaotic swirl.
      // Burst increases swirl radius momentarily for "explosion" effect
      const swirlRadius = THREE.MathUtils.lerp(3.0, 0.5, t) + (burstRef.current * 5.0); 
      const swirlSpeed = THREE.MathUtils.lerp(0.5, 0.2, t) + (burstRef.current * 2.0);
      
      const offsetX = Math.cos(time * swirlSpeed + particle.phase) * swirlRadius;
      const offsetZ = Math.sin(time * swirlSpeed + particle.phase) * swirlRadius;
      
      // Apply Position
      // Note: We subtract half the vertical loop height to center the motion around the anchor
      dummy.position.set(
        baseX + offsetX,
        baseY + verticalOffset - 3, 
        baseZ + offsetZ
      );

      // Rotation (Tumbling)
      dummy.rotation.set(
        particle.rotation.x + time,
        particle.rotation.y + time,
        particle.rotation.z
      );

      // Scale (Twinkling)
      // Sine wave flicker
      const flicker = 0.8 + Math.sin(time * 5 + particle.phase) * 0.4;
      
      // Burst makes them grow significantly (3x) like sparks flying
      const burstScale = 1 + burstRef.current * 2.0;

      dummy.scale.setScalar(particle.scale * flicker * burstScale);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.EMBER_COUNT]}
    >
      {/* Tetrahedron gives a nice "spark" shape with sharp points */}
      <tetrahedronGeometry args={[0.2, 0]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.6}
        color="#ffffff"
        blending={THREE.AdditiveBlending}
        depthWrite={false} // Important for transparent particles to not occlude each other weirdly
      />
    </instancedMesh>
  );
};

export default SpiritEmbers;