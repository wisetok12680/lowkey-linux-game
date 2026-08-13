import React, { useState } from 'react';
import { Terminal, Lightbulb, ChevronDown, KeyRound, RefreshCw, Clipboard, Copy, Check, HelpCircle, Target, Sparkles, Lock, Trophy } from 'lucide-react';
import { COMPETITION_LEVELS } from '../engine/levels';

export default function LevelHeader({ gameState, setGameState, currentLevelData, onResetProgress, onOpenCheatsheet }) {
  const [showHints, setShowHints] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passFeedback, setPassFeedback] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passInput.trim()) return;

    if (passInput.trim() === currentLevelData.password) {
      setPassFeedback({ type: 'success', msg: 'Correct password! Advancing level...' });
      setTimeout(() => {
        const nextLevel = Math.min(COMPETITION_LEVELS.length - 1, gameState.currentLevel + 1);
        setGameState(prev => {
          const nextData = COMPETITION_LEVELS[nextLevel];
          if (nextData.initialTree) {
            nextData.initialTree(prev.vfs);
          }
          return {
            ...prev,
            currentLevel: nextLevel,
            currentUser: nextData.user,
            cwd: nextData.homeDir,
            homeDir: nextData.homeDir,
            terminalLogs: [
              { type: 'output', text: `Linux lowkey-linux 5.15.0-generic x86_64\nWelcome to Lowkey Linux (Stage ${nextLevel})\nLogged in as ${nextData.user}@localhost.` }
            ]
          };
        });
        setPassInput('');
        setPassFeedback(null);
      }, 1000);
    } else {
      setPassFeedback({ type: 'error', msg: 'Incorrect password' });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setPassInput(text.trim());
    } catch (err) {
      // Fallback
    }
  };

  const handleCopyKey = (keyText) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  const progressPercent = Math.round((gameState.currentLevel / (COMPETITION_LEVELS.length - 1)) * 100);

  return (
    <header className="bg-[#12161f] border-b border-[#1e2638] px-4 py-3 shadow-md font-sans select-none space-y-3">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left: Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight font-mono">LOWKEY LINUX</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                STAGE {gameState.currentLevel}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {currentLevelData.name}
            </p>
          </div>
        </div>

        {/* Level Stepper & Progression Bar UI Element */}
        <div className="flex flex-col gap-1.5 bg-[#0c0e14] p-2 rounded-xl border border-[#1e2638] max-w-xl w-full">
          <div className="flex items-center justify-between px-1 text-[11px] font-mono">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>LEVEL PROGRESSION</span>
            </span>
            <span className="text-emerald-400 font-bold">
              Stage {gameState.currentLevel} / {COMPETITION_LEVELS.length - 1} ({progressPercent}%)
            </span>
          </div>

          {/* Visual Progress Bar Track */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Interactive Level Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {COMPETITION_LEVELS.map((lvl, index) => {
              const isCompleted = index < gameState.currentLevel;
              const isCurrent = index === gameState.currentLevel;
              const isLocked = index > gameState.currentLevel;
              return (
                <button
                  key={lvl.level}
                  disabled={isLocked}
                  onClick={() => {
                    if (!isLocked) {
                      setGameState(prev => {
                        const targetData = COMPETITION_LEVELS[index];
                        if (targetData && targetData.initialTree) {
                          targetData.initialTree(prev.vfs);
                        }
                        return {
                          ...prev,
                          currentLevel: index,
                          currentUser: targetData.user,
                          cwd: targetData.homeDir,
                          homeDir: targetData.homeDir,
                          terminalLogs: [
                            { type: 'output', text: `Linux lowkey-linux 5.15.0-generic x86_64\nWelcome to Lowkey Linux (Stage ${index})\nLogged in as ${targetData.user}@localhost.` }
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
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : isLocked ? (
                    <Lock className="w-2.5 h-2.5 text-slate-600" />
                  ) : (
                    <span>{lvl.level}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Actions: Hints, Password Form, Reset */}
        <div className="flex items-center gap-2">
          {/* Hints Toggle */}
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition shadow-sm font-medium"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Hints ({currentLevelData.hints.length})</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showHints ? 'rotate-180' : ''}`} />
          </button>

          {/* Password Submit Form */}
          <form onSubmit={handlePasswordSubmit} className="flex items-center gap-1">
            <div className="relative flex items-center">
              <input
                type="text"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="Enter stage password..."
                className="w-36 md:w-44 px-3 py-1.5 text-xs bg-[#0c0e14] border border-slate-700 rounded-l-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono select-text"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="px-2 py-1.5 bg-slate-800 border-y border-r border-slate-700 text-slate-400 hover:text-slate-200 rounded-r-md text-xs font-mono transition flex items-center gap-1"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
              </button>

              {passFeedback && (
                <div className={`absolute right-0 top-10 px-3 py-1.5 text-xs rounded-md shadow-lg font-sans z-50 whitespace-nowrap font-medium ${
                  passFeedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {passFeedback.msg}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition flex items-center gap-1.5 shadow-sm font-sans"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </form>

          <button
            onClick={onResetProgress}
            title="Reset Game Progress"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Prominent Stage Question & Objective Banner */}
      <div className="max-w-7xl mx-auto bg-[#0a0d14] border border-[#1e2638] rounded-xl p-3 shadow-inner grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        {/* Left Column: Stage Question */}
        <div className="md:col-span-6 bg-[#131924] border border-slate-800/80 rounded-lg p-3 flex items-start gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="space-y-1 select-text">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 font-mono">Stage {gameState.currentLevel} Question</span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {currentLevelData.question}
            </p>
          </div>
        </div>

        {/* Right Column: Stage Objective */}
        <div className="md:col-span-6 bg-[#131924] border border-slate-800/80 rounded-lg p-3 flex items-start gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="space-y-1 select-text">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Stage Objective</span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {currentLevelData.objective}
            </p>
          </div>
        </div>
      </div>

      {/* Hints Dropdown Drawer */}
      {showHints && (
        <div className="max-w-7xl mx-auto p-3.5 bg-[#181e2a] border border-slate-700/80 rounded-lg space-y-2.5 text-xs shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <div className="font-semibold text-amber-400 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span>Level {gameState.currentLevel} Hints & Walkthrough</span>
            </div>

            <button
              onClick={() => handleCopyKey(currentLevelData.password)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 rounded-md font-mono text-[11px] transition shadow-sm"
            >
              {copiedKey ? (
                <span className="text-emerald-400 font-sans font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Password Copied!
                </span>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Solution Key</span>
                </>
              )}
            </button>
          </div>

          <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1 font-mono select-text leading-relaxed">
            {currentLevelData.hints.map((hint, idx) => (
              <li key={idx} className="bg-slate-900/40 p-1.5 rounded border border-slate-800">{hint}</li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
