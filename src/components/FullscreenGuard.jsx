import React, { useState, useEffect } from 'react';
import { Maximize2, ShieldAlert, AlertTriangle, Lock } from 'lucide-react';

export default function FullscreenGuard({ activePlayer, gameState }) {
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      const isFS = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFS);
    };

    // Initial check
    checkFullscreen();

    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('MSFullscreenChange', checkFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('mozfullscreenchange', checkFullscreen);
      document.removeEventListener('MSFullscreenChange', checkFullscreen);
    };
  }, []);

  const requestFullscreenMode = () => {
    setHasInteracted(true);
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  // Only enforce invigilation when a player is active and game is in progress
  if (isFullscreen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex items-center justify-center p-6 font-sans animate-in fade-in duration-200">
      <div className="bg-[#0f121d] border border-amber-500/40 rounded-2xl max-w-lg w-full p-8 shadow-2xl shadow-amber-500/10 text-center flex flex-col items-center relative overflow-hidden">
        
        {/* Top Warning Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 animate-pulse" />

        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 shadow-inner shadow-amber-500/20">
          <ShieldAlert className="w-8 h-8 text-amber-400 animate-bounce" />
        </div>

        {/* Banner Title & Invigilation Notice */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-mono font-semibold uppercase tracking-wider mb-3">
          <Lock className="w-3.5 h-3.5" />
          <span>Proctored Invigilation Mode Active</span>
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          FULLSCREEN MODE REQUIRED
        </h2>

        <p className="text-slate-300 text-xs mt-3 leading-relaxed">
          Competition rules require full screen mode for proctoring and invigilation.
          The game has been <strong className="text-amber-400">PAUSED</strong> until full screen mode is restored.
        </p>

        {/* Status Box */}
        <div className="w-full bg-[#080a10] border border-slate-800 rounded-xl p-3.5 mt-5 font-mono text-xs text-left space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Active Team:</span>
            <span className="text-amber-400 font-semibold">{activePlayer?.team_name || activePlayer?.username || gameState?.teamName || 'Team'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Status:</span>
            <span className="text-red-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> PAUSED (Exited Fullscreen)
            </span>
          </div>
        </div>

        {/* Re-enter Fullscreen Button */}
        <button
          onClick={requestFullscreenMode}
          className="mt-6 w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/25 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Return to Full Screen to Continue</span>
        </button>

        <p className="text-[11px] text-slate-500 mt-4 font-mono">
          Click the button above to re-enter fullscreen and resume your session.
        </p>
      </div>
    </div>
  );
}
