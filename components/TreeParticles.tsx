import React, { useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMode } from '../types';
import { CONFIG } from '../constants';
import { generateTreeParticles } from '../services/geometryService';
import { easing } from 'maath';

interface TreeParticlesProps {
  mode: TreeMode;
}

const TreeParticles: React.FC<TreeParticlesProps> = ({ mode }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => generateTreeParticles(CONFIG.PARTICLE_COUNT), []);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const progressRef = useRef(mode === TreeMode.TREE_SHAPE ? 1 : 0);
  
  // Ref to track the burst intensity (0 to 1)
  const burstRef = useRef(0);

  // Trigger burst when mode changes
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

    const target = mode === TreeMode.TREE_SHAPE ? 1 : 0;
    easing.damp(progressRef, 'current', target, CONFIG.ANIMATION_SPEED, delta);
    
    // Quickly damp the burst value back to 0
    easing.damp(burstRef, 'current', 0, 0.25, delta);

    const t = progressRef.current;
    const time = state.clock.getElapsedTime();

    data.forEach((particle, i) => {
      // 1. Position Interpolation
      const x = THREE.MathUtils.lerp(particle.scatterPosition.x, particle.treePosition.x, t);
      const y = THREE.MathUtils.lerp(particle.scatterPosition.y, particle.treePosition.y, t);
      const z = THREE.MathUtils.lerp(particle.scatterPosition.z, particle.treePosition.z, t);

      // 2. Motion
      // Heavy floating feel for boxes
      const floatIntensity = THREE.MathUtils.lerp(2.0, 0.02, t); 
      const floatSpeed = THREE.MathUtils.lerp(0.2, 0.5, t); 
      
      const floatY = Math.sin(time * floatSpeed + particle.phase) * floatIntensity;
      // Less horizontal movement to keep the cone shape solid
      const floatX = Math.cos(time * floatSpeed * 0.5 + particle.phase) * floatIntensity * 0.2; 

      dummy.position.set(x + floatX, y + floatY, z);

      // 3. Rotation Logic
      // Slow, heavy rotation for cubes
      const rotateSpeed = THREE.MathUtils.lerp(0.2, 0.05, t);
      
      dummy.rotation.x = particle.rotation.x + time * rotateSpeed;
      dummy.rotation.y = particle.rotation.y + time * rotateSpeed;
      dummy.rotation.z = particle.rotation.z;

      // 4. Scale Logic
      // Very subtle breathing, boxes are solid
      const pulse = 1 + Math.sin(time * 1.5 + particle.phase) * 0.05;
      
      // Add burst effect to scale: Momentary expansion
      const burstScale = 1 + burstRef.current * 0.6;
      
      dummy.scale.setScalar(particle.scale * pulse * burstScale);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.PARTICLE_COUNT]}
      castShadow
      receiveShadow
    >
      {/* BoxGeometry: The "Gift Box" aesthetic */}
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial
        toneMapped={false}
        color="#ffffff" 
        roughness={0.25} // Reduced roughness (was 0.4) to catch the new lights
        metalness={0.7} // Increased metalness (was 0.6) for better reflections
        envMapIntensity={2.5} // Increased environment reflection
      />
    </instancedMesh>
  );
};

export default TreeParticles;