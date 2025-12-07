import React from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import TreeParticles from './TreeParticles';
import TreeOrnaments from './TreeOrnaments';
import SpiritEmbers from './SpiritEmbers';
import FallingSnow from './FallingSnow';
import TreeStar from './TreeStar';
import Environment from './Environment';
import { TreeMode } from '../types';

interface ExperienceProps {
  mode: TreeMode;
}

const Experience: React.FC<ExperienceProps> = ({ mode }) => {
  return (
    <>
      {/* Low angle camera (Y= -2) looking slightly up, further back (Z=26) for scale */}
      <PerspectiveCamera makeDefault position={[0, -2, 26]} fov={40} />
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        maxDistance={40}
        minDistance={12}
        rotateSpeed={0.5}
        autoRotate={mode === TreeMode.TREE_SHAPE}
        autoRotateSpeed={0.3}
        // Limit vertical angle to keep the "majestic" look mostly
        maxPolarAngle={Math.PI / 1.4}
      />

      <Environment />
      <TreeParticles mode={mode} />
      <TreeOrnaments mode={mode} />
      <SpiritEmbers mode={mode} />
      <FallingSnow mode={mode} />
      <TreeStar mode={mode} />

      {/* Post Processing - Subtle Luxury */}
      <EffectComposer disableNormalPass>
        {/* 
           Enhanced Bloom for "Illuminated Gift Box" effect.
           Intensity lowered significantly (0.35) to prevent blinding glare while keeping glow.
        */}
        <Bloom 
          luminanceThreshold={1.1} // Higher threshold: only very bright things glow
          mipmapBlur 
          intensity={0.35} // Reduced from 0.6 to 0.35
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
        <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
      
      {/* Floor reflection - lowered further */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#000000" 
          roughness={0.15} 
          metalness={0.6}
        />
      </mesh>
    </>
  );
};

export default Experience;