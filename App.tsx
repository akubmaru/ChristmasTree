import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';
import { TreeMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<TreeMode>(TreeMode.TREE_SHAPE);

  const toggleMode = () => {
    setMode((prev) => (prev === TreeMode.TREE_SHAPE ? TreeMode.SCATTERED : TreeMode.TREE_SHAPE));
  };

  return (
    <div className="relative w-full h-full bg-black">
      <Suspense fallback={null}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0, 15], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: false, alpha: false, stencil: false, depth: true }}
        >
          <color attach="background" args={['#010805']} />
          <Experience mode={mode} />
        </Canvas>
      </Suspense>
      
      <Loader 
        containerStyles={{ background: '#010805' }}
        barStyles={{ background: '#D4AF37', height: '2px' }}
        dataStyles={{ fontFamily: 'Cinzel', color: '#D4AF37' }}
      />
      
      <UIOverlay mode={mode} onToggle={toggleMode} />
    </div>
  );
};

export default App;