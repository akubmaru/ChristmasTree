import React from 'react';
import { TreeMode } from '../types';
import { Sparkles, Wind } from 'lucide-react';

interface UIOverlayProps {
  mode: TreeMode;
  onToggle: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ mode, onToggle }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <header className="flex flex-col items-start">
        <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-500 font-serif font-bold tracking-wider drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" style={{ fontFamily: 'Cinzel, serif' }}>
          ARIX
        </h1>
        <h2 className="text-emerald-400 text-sm md:text-base tracking-[0.3em] mt-2 uppercase opacity-80 font-light border-b border-emerald-800 pb-2 mb-4">
          Signature Collection
        </h2>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center md:items-end space-y-4 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md border border-emerald-900/50 p-6 rounded-lg shadow-2xl relative overflow-hidden group">
          
          {/* Decorative Corner Borders (Anime style) */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500/50"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500/50"></div>

          <p className="text-gray-400 text-xs uppercase tracking-widest mb-4 text-center md:text-right font-sans">
            BREATHING FORM: {mode === TreeMode.TREE_SHAPE ? 'SECOND FORM - ETERNAL PINE' : 'FIRST FORM - SCATTERED SPIRIT'}
          </p>

          <button
            onClick={onToggle}
            className={`
              relative px-8 py-3 w-full md:w-64 transition-all duration-500 ease-out
              border border-yellow-600/30
              flex items-center justify-center gap-3
              overflow-hidden
              ${mode === TreeMode.TREE_SHAPE 
                ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-100' 
                : 'bg-yellow-950/40 hover:bg-yellow-900/60 text-yellow-100'}
            `}
          >
            {/* Inner Glow Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            {mode === TreeMode.TREE_SHAPE ? (
              <>
                <Wind className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="font-serif tracking-widest">SCATTER</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="font-serif tracking-widest">ASSEMBLE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex justify-between items-end text-white/30 text-xs font-light">
        <div>
          <p>INTERACTIVE 3D EXPERIENCE</p>
          <p>WEBGL / REACT THREE FIBER</p>
        </div>
        <div className="text-right">
          <p className="tracking-widest">鬼滅の刃 VIBES</p>
        </div>
      </footer>
    </div>
  );
};

export default UIOverlay;