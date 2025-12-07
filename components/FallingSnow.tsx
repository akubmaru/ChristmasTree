import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMode } from '../types';
import { CONFIG } from '../constants';
import { generateSnowflakes } from '../services/geometryService';
import { easing } from 'maath';

interface FallingSnowProps {
  mode: TreeMode;
}

const FallingSnow: React.FC<FallingSnowProps> = ({ mode }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const data = useMemo(() => generateSnowflakes(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Track opacity for transition
  const opacityState = useRef({ value: 0 });

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    data.forEach((particle, i) => {
      meshRef.current!.setColorAt(i, particle.color);
    });
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    // 1. Handle Opacity Transition
    const targetOpacity = mode === TreeMode.TREE_SHAPE ? 1.0 : 0;
    
    easing.damp(opacityState.current, 'value', targetOpacity, 1.5, delta);
    materialRef.current.opacity = opacityState.current.value;
    
    if (materialRef.current.opacity < 0.01) {
       meshRef.current.visible = false;
       return;
    } else {
       meshRef.current.visible = true;
    }

    const time = state.clock.getElapsedTime();
    // Ranges must match generateSnowflakes (range -40 to 40 = 80 height)
    const heightRange = 80;
    const lowerBound = -40;

    data.forEach((particle, i) => {
      // 2. Physics / Animation
      const fallSpeed = particle.speed * 3.0; // Rapid fall
      
      let currentY = particle.treePosition.y - (time * fallSpeed);
      
      // Strict wrapping within bounds
      currentY = ((currentY - lowerBound) % heightRange + heightRange) % heightRange + lowerBound;

      // Enhanced Horizontal drift (Turbulent Blizzard Wind)
      // Combine multiple sine waves for chaotic movement
      const windForce = 1.5;
      const turbulence = Math.sin(time * 3.0 + particle.phase * 2.0) * 0.5;
      
      const driftX = (Math.sin(time * 0.8 + particle.phase) + turbulence) * windForce;
      const driftZ = (Math.cos(time * 0.5 + particle.phase) + turbulence) * 0.8;

      dummy.position.set(
        particle.treePosition.x + driftX,
        currentY,
        particle.treePosition.z + driftZ
      );

      dummy.rotation.set(
        particle.rotation.x + time * 0.5,
        particle.rotation.y + time * 0.3,
        particle.rotation.z
      );

      dummy.scale.setScalar(particle.scale);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.SNOW_COUNT]}
    >
      {/* Octahedron looks like a simple crystal/flake */}
      <octahedronGeometry args={[0.1, 0]} />
      <meshBasicMaterial
        ref={materialRef}
        toneMapped={false}
        transparent
        opacity={0} // Controlled by useFrame
        color="#ffffff"
        depthWrite={false}
      />
    </instancedMesh>
  );
};

export default FallingSnow;