import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, ShieldAlert, AlertTriangle, Lock, XCircle, AlertOctagon } from 'lucide-react';
import { updateInvigilationAPI } from '../services/api';

const MAX_STRIKES = 5;

export default function FullscreenGuard({ activePlayer, gameState, isWelcomeModalOpen }) {
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [exitCount, setExitCount] = useState(0);
  const wasFullscreenRef = useRef(true);

  const teamName = activePlayer?.team_name || activePlayer?.username || gameState?.teamName || 'team';
  const storageKey = `lowkey_fs_exits_${teamName.toLowerCase()}`;

  // Sync state if activePlayer from DB has disqualification/exits data
  useEffect(() => {
    if (activePlayer && activePlayer.fullscreen_exits !== undefined) {
      setExitCount(activePlayer.fullscreen_exits || 0);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, (activePlayer.fullscreen_exits || 0).toString());
      }
    } else if (typeof window !== 'undefined') {
      const savedCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
      setExitCount(isNaN(savedCount) ? 0 : savedCount);
    }
  }, [activePlayer, storageKey]);

  useEffect(() => {
    const checkFullscreen = () => {
      const isFS = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      const isFinished = gameState?.currentLevel >= 16;

      // Detect transition from FULLSCREEN -> NOT FULLSCREEN (Only when activePlayer is logged in, modal is closed, and not finished)
      if (wasFullscreenRef.current && !isFS && activePlayer && !isWelcomeModalOpen && !isFinished) {
        setExitCount(prev => {
          const newCount = prev + 1;
          const isDisq = newCount >= MAX_STRIKES;
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, newCount.toString());
          }
          const userKey = activePlayer?.username || teamName;
          updateInvigilationAPI(userKey, newCount, isDisq).catch(err => console.error('Invigilation sync error:', err));
          return newCount;
        });
      }

      wasFullscreenRef.current = isFS;
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
  }, [storageKey, activePlayer, isWelcomeModalOpen, gameState?.currentLevel]);

  const requestFullscreenMode = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const strikesRemaining = Math.max(0, MAX_STRIKES - exitCount);
  const isDisqualified = exitCount >= MAX_STRIKES;
  const isFinished = gameState?.currentLevel >= 16;

  // Don't render banner if team is not logged in, welcome modal is open, challenge is completed (level >= 16), or currently in fullscreen (and not disqualified)
  if (!activePlayer || isWelcomeModalOpen || isFinished || (isFullscreen && !isDisqualified)) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 font-sans animate-in fade-in duration-200">
      <div className={`bg-[#0f121d] border ${isDisqualified ? 'border-red-600/60 shadow-red-600/20' : 'border-amber-500/40 shadow-amber-500/10'} rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center flex flex-col items-center relative overflow-hidden`}>
        
        {/* Top Warning Accent Glow */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isDisqualified ? 'bg-red-600' : 'bg-gradient-to-r from-amber-500 via-red-500 to-amber-500'} animate-pulse`} />

        {/* Warning Icon Badge */}
        <div className={`w-16 h-16 rounded-2xl ${isDisqualified ? 'bg-red-500/15 border-red-500/40' : 'bg-amber-500/10 border-amber-500/30'} border flex items-center justify-center mb-4 shadow-inner`}>
          {isDisqualified ? (
            <AlertOctagon className="w-8 h-8 text-red-500 animate-bounce" />
          ) : (
            <ShieldAlert className="w-8 h-8 text-amber-400 animate-bounce" />
          )}
        </div>

        {/* Invigilation Header Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${isDisqualified ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'} text-[11px] font-mono font-semibold uppercase tracking-wider mb-2`}>
          <Lock className="w-3.5 h-3.5" />
          <span>Proctored Invigilation Mode</span>
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          {isDisqualified ? 'TEAM DISQUALIFIED' : 'FULLSCREEN MODE REQUIRED'}
        </h2>

        <p className="text-slate-300 text-xs mt-2 leading-relaxed">
          {isDisqualified ? (
            <span className="text-red-400 font-semibold">
              You have exceeded the maximum limit of {MAX_STRIKES} fullscreen exits. Your competition session has been permanently locked for invigilation review.
            </span>
          ) : (
            <span>
              Competition rules require continuous fullscreen mode. Exiting fullscreen pauses your terminal until you return.
            </span>
          )}
        </p>

        {/* Strike Meter / Counter Bar */}
        <div className="w-full bg-[#080a10] border border-slate-800 rounded-xl p-4 mt-5 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400">Fullscreen Exits Used:</span>
            <span className={`font-bold ${exitCount >= MAX_STRIKES ? 'text-red-400' : exitCount >= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {exitCount} / {MAX_STRIKES} Exits
            </span>
          </div>

          {/* 5-Strike Progress Dots */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(strikeNum => {
              const isUsed = strikeNum <= exitCount;
              return (
                <div 
                  key={strikeNum}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isUsed 
                      ? 'bg-red-500 shadow-sm shadow-red-500/50' 
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                  title={`Exit Strike ${strikeNum}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>Active Team: <strong className="text-slate-300">{teamName}</strong></span>
            <span className={isDisqualified ? 'text-red-400 font-semibold' : 'text-amber-400'}>
              {isDisqualified ? '0 Warnings Remaining' : `${strikesRemaining} Warnings Remaining`}
            </span>
          </div>
        </div>

        {/* Re-enter Fullscreen Button / Disqualified Lock Box */}
        {!isDisqualified ? (
          <button
            onClick={requestFullscreenMode}
            className="mt-6 w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/25 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Return to Full Screen ({strikesRemaining} Exits Left)</span>
          </button>
        ) : (
          <div className="mt-6 w-full py-3.5 px-6 bg-red-950/40 border border-red-800/60 text-red-300 font-mono text-xs rounded-xl flex items-center justify-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <span>Locked • Contact Competition Invigilator</span>
          </div>
        )}

        <p className="text-[11px] text-slate-500 mt-4 font-mono">
          {!isDisqualified 
            ? 'Click the button above to re-enter full screen and resume your terminal.'
            : 'Invigilators can reset team strikes from the competition admin dashboard.'}
        </p>
      </div>
    </div>
  );
}
