import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMode } from '../types';
import { CONFIG, COLORS } from '../constants';
import { easing } from 'maath';

interface TreeStarProps {
  mode: TreeMode;
}

const TreeStar: React.FC<TreeStarProps> = ({ mode }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Target position: Top of tree (Slightly higher to accommodate shape)
  const treePos = useMemo(() => new THREE.Vector3(0, CONFIG.TREE_HEIGHT / 2 + 1.2, 0), []);
  
  // Scatter position: Random high up
  const scatterPos = useMemo(() => new THREE.Vector3(
    (Math.random() - 0.5) * 10,
    CONFIG.TREE_HEIGHT + 5,
    (Math.random() - 0.5) * 10
  ), []);
  
  const progressRef = useRef(mode === TreeMode.TREE_SHAPE ? 1 : 0);

  // Define 5-Pointed Star Shape
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.9;
    const innerRadius = 0.45;
    
    // Draw star logic
    for (let i = 0; i < points * 2; i++) {
        // Angle step is PI / 5
        const angle = (i * Math.PI) / points;
        // Swap sin/cos to make angle 0 point upwards
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.sin(angle) * r;
        const y = Math.cos(angle) * r;
        
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3
  }), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const target = mode === TreeMode.TREE_SHAPE ? 1 : 0;
    easing.damp(progressRef, 'current', target, CONFIG.ANIMATION_SPEED, delta);
    const t = progressRef.current;

    // Position lerp
    meshRef.current.position.lerpVectors(scatterPos, treePos, t);
    
    // Scale: 0 when scattered, 1.3 when tree
    const s = THREE.MathUtils.lerp(0, 1.3, t); 
    
    // Subtle breathing animation
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    meshRef.current.scale.setScalar(s * pulse);
    
    // Rotation - Continuous slow spin
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={meshRef}>
      {/* Center the geometry by offsetting Z by half depth */}
      <mesh castShadow position={[0, 0, -0.15]}> 
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial 
            color={COLORS.GOLD_BRIGHT}
            emissive={COLORS.GOLD_METALLIC}
            // Lower emissive intensity (was 0.5)
            emissiveIntensity={0.2} 
            roughness={0.3}
            metalness={1.0}
        />
      </mesh>
      
      {/* Inner Light - Reduced Intensity (4 -> 2) */}
      <pointLight 
        color={COLORS.GOLD_BRIGHT} 
        intensity={2} 
        distance={10}
        decay={2}
      />
    </group>
  );
};

export default TreeStar;