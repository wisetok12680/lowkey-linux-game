import React from 'react';
import { Terminal, RefreshCw, Lock, Trophy, LogOut, Brain, Target } from 'lucide-react';
import { COMPETITION_LEVELS, getTeamUsername, getTeamHomeDir } from '../engine/levels';

export default function LevelHeader({ gameState, setGameState, currentLevelData, onResetProgress, onOpenCheatsheet, activePlayer, onSignOut }) {
  const progressPercent = Math.round((gameState.currentLevel / (COMPETITION_LEVELS.length - 1)) * 100);
  const teamName = activePlayer?.team_name || activePlayer?.username || 'Team';

  return (
    <header className="bg-[#12161f] border-b border-[#1e2638] px-4 py-3 shadow-md font-sans select-none space-y-3">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left: Branding & Read-Only Team Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight font-mono">LOWKEY LINUX</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded uppercase tracking-wider">
                COMPETITION
              </span>
            </div>
            <p className="text-xs text-slate-400">Interactive System Competition</p>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Active Team Identity Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Team:</span>
            <span className="text-emerald-400 font-bold">{teamName}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">User:</span>
            <span className="text-sky-400 font-bold">{gameState.currentUser}</span>
          </div>
        </div>

        {/* Right: Stage Stepper & Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto">
          {/* Stage Progression Counter */}
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Progress:</span>
            <span className="text-amber-400 font-bold">{gameState.currentLevel} / {COMPETITION_LEVELS.length - 1}</span>
            <span className="text-slate-600">({progressPercent}%)</span>
          </div>

          {/* Reset Progress Action Button */}
          <button
            onClick={onResetProgress}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 transition font-mono"
            title="Reset Game Progress"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Sign Out Action Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition font-mono"
              title="Sign Out Active Team"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Level Stepper Toolbar */}
      <div className="max-w-7xl mx-auto bg-[#0a0d14] border border-[#1e2638] rounded-xl p-2 shadow-inner overflow-x-auto">
        <div className="flex items-center justify-between min-w-max gap-1">
          {COMPETITION_LEVELS.map((lvl, index) => {
            const isCompleted = index < (activePlayer?.highest_level_unlocked || gameState.currentLevel);
            const isCurrent = index === gameState.currentLevel;
            const isLocked = index > (activePlayer?.highest_level_unlocked || 0) && index > gameState.currentLevel;
            const targetUser = getTeamUsername(teamName, index);

            return (
              <button
                key={lvl.level}
                disabled={isLocked}
                onClick={() => {
                  if (!isLocked) {
                    setGameState(prev => {
                      const targetData = COMPETITION_LEVELS[index];
                      const targetUser = getTeamUsername(teamName, index);
                      const targetHome = getTeamHomeDir(teamName, index);
                      if (targetData && targetData.initialTree) {
                        targetData.initialTree(prev.vfs, targetUser);
                      }
                      return {
                        ...prev,
                        currentLevel: index,
                        currentUser: targetUser,
                        cwd: targetHome,
                        homeDir: targetHome,
                        terminalLogs: [
                          { type: 'output', text: `Linux lowkey-linux 5.15.0-generic x86_64\nWelcome Team ${teamName}! (Stage ${index})\nAuthenticated via SSH as ${targetUser}@lowkey-linux.` }
                        ]
                      };
                    });
                  }
                }}
                className={`min-w-[28px] h-7 px-1.5 rounded flex items-center justify-center font-mono text-xs font-semibold transition shrink-0 gap-0.5 ${
                  isCurrent 
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400' 
                    : isCompleted 
                    ? 'bg-slate-800/90 text-sky-400 hover:bg-slate-700 border border-slate-700/60' 
                    : 'bg-slate-900/60 text-slate-600 border border-slate-800/40 cursor-not-allowed'
                }`}
                title={`${lvl.name}${isLocked ? ' (Locked)' : isCompleted ? ' (Completed)' : ' (Current)'}`}
              >
                {isCompleted ? (
                  <span className="text-emerald-400 font-bold font-mono">{lvl.level}</span>
                ) : isLocked ? (
                  <Lock className="w-3 h-3 text-slate-600" />
                ) : (
                  <span className="font-bold">{lvl.level}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prominent Stage Concepts & Objective Banner */}
      <div className="max-w-7xl mx-auto bg-[#0a0d14] border border-[#1e2638] rounded-xl p-3 shadow-inner grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        {/* Left Column: Stage Objective */}
        <div className="md:col-span-6 bg-[#131924] border border-slate-800/80 rounded-lg p-3 flex items-start gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="space-y-1.5 select-text w-full">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Stage Objective</span>
            </div>
            {Array.isArray(currentLevelData.objective) ? (
              <ul className="space-y-1 text-xs text-slate-200 font-medium leading-relaxed select-text">
                {currentLevelData.objective.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold text-[10px] mt-0.5">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-200 font-medium leading-relaxed select-text">
                {currentLevelData.objective}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Concepts Needed & Module Reference */}
        <div className="md:col-span-6 bg-[#131924] border border-slate-800/80 rounded-lg p-3 flex items-start gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="space-y-2 select-text w-full">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 font-mono">Stage {gameState.currentLevel} Concepts Needed</span>
            </div>

            {/* Bulleted Concepts List */}
            {Array.isArray(currentLevelData.concepts) && (
              <ul className="space-y-1 text-xs text-slate-200 font-medium leading-relaxed select-text">
                {currentLevelData.concepts.map((concept, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold text-[10px] mt-0.5">•</span>
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Module Title */}
            {currentLevelData.module && (
              <div className="pt-1.5 border-t border-slate-800/60">
                <div className="text-[11px] font-semibold text-emerald-400 font-mono">
                  📚 {typeof currentLevelData.module === 'string' ? currentLevelData.module : currentLevelData.module.title}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
