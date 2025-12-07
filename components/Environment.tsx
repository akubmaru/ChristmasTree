import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Stars, Environment as DreiEnvironment } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../constants';

const Environment: React.FC = () => {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame(({ clock }) => {
    if (lightRef.current) {
      // Gentle pulse - Reduced intensity significantly (was 10+) to avoid blinding center
      lightRef.current.intensity = 5 + Math.sin(clock.elapsedTime) * 2;
    }
  });

  return (
    <group>
      {/* HDRI for realistic reflections on the glossy particles */}
      <DreiEnvironment preset="city" blur={1} />

      {/* Ambient increased significantly to lift shadows */}
      <ambientLight intensity={2.5} color={COLORS.EMERALD_DEEP} />

      {/* Key Light - Very bright warm light from front-right */}
      <directionalLight 
        position={[10, 10, 10]} 
        intensity={8.0} 
        color="#ffecd2" 
        castShadow
      />
      
      {/* Fill Light - Cool bright light to fill shadows from left */}
      <directionalLight 
        position={[-10, 5, 5]} 
        intensity={4.0} 
        color="#d1fae5" 
      />

      {/* RIM LIGHT - New Backlight to separate tree from background */}
      <directionalLight 
        position={[0, 10, -10]} 
        intensity={5.0} 
        color="#a5f3fc" 
      />

      {/* Core Soul Light */}
      <pointLight 
        ref={lightRef}
        position={[0, 0, 0]} 
        color={COLORS.GOLD_METALLIC} 
        distance={25} 
        decay={2} 
      />

      {/* Bottom Uplight - Powerful theatrical uplighting */}
      <spotLight 
        position={[0, -10, 5]} 
        angle={0.8} 
        penumbra={1} 
        intensity={50} 
        color={COLORS.EMERALD_BRIGHT} 
      />

      {/* Background Sparkles */}
      <Sparkles 
        count={200} 
        scale={30} 
        size={4} 
        speed={0.1} 
        opacity={0.5} 
        color={COLORS.GOLD_BRIGHT} 
      />
      
      <Stars radius={70} depth={60} count={1000} factor={4} saturation={0} fade speed={0.5} />
      
      <fog attach="fog" args={['#010502', 10, 80]} />
    </group>
  );
};

export default Environment;