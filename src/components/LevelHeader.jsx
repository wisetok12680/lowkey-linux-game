import React, { useState } from 'react';
import { Terminal, Lightbulb, ChevronDown, KeyRound, RefreshCw, Clipboard, Copy, Check } from 'lucide-react';
import { BANDIT_LEVELS } from '../engine/levels';

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
        const nextLevel = Math.min(BANDIT_LEVELS.length - 1, gameState.currentLevel + 1);
        setGameState(prev => {
          const nextData = BANDIT_LEVELS[nextLevel];
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
              ...prev.terminalLogs,
              { type: 'output', text: `[LEVEL COMPLETE] Logged into ${nextData.user}@localhost.` }
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

  return (
    <header className="bg-[#12161f] border-b border-[#1e2638] px-4 py-2.5 shadow-sm font-sans select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Branding */}
        <div>
          <h1 className="text-sm font-bold text-slate-100 tracking-tight font-mono">LOWKEY LINUX</h1>
          <p className="text-xs text-slate-400 font-normal">
            {currentLevelData.name}
          </p>
        </div>

        {/* Level Steps Bar */}
        <div className="hidden lg:flex items-center gap-1 bg-[#0c0e14] p-1 rounded-lg border border-[#1e2638] max-w-xl overflow-x-auto">
          {BANDIT_LEVELS.map((lvl, index) => {
            const isCompleted = index < gameState.currentLevel;
            const isCurrent = index === gameState.currentLevel;
            return (
              <button
                key={lvl.level}
                disabled={index > gameState.currentLevel}
                onClick={() => {
                  if (index <= gameState.currentLevel) {
                    setGameState(prev => ({
                      ...prev,
                      currentLevel: index,
                      currentUser: lvl.user,
                      cwd: lvl.homeDir,
                      homeDir: lvl.homeDir
                    }));
                  }
                }}
                className={`w-7 h-7 rounded flex items-center justify-center font-mono text-xs font-semibold transition ${
                  isCurrent 
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow' 
                    : isCompleted 
                    ? 'bg-slate-800 text-sky-400 hover:bg-slate-700' 
                    : 'text-slate-600 cursor-not-allowed hover:bg-transparent'
                }`}
                title={lvl.name}
              >
                {lvl.level}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Hints Toggle */}
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
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
                placeholder="Enter password..."
                className="w-32 md:w-40 px-2.5 py-1.5 text-xs bg-[#0c0e14] border border-slate-700 rounded-l-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono select-text"
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
                <div className={`absolute right-0 top-10 px-2.5 py-1 text-xs rounded shadow-md font-sans z-50 whitespace-nowrap ${
                  passFeedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {passFeedback.msg}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition flex items-center gap-1 font-sans"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </form>

          <button
            onClick={onResetProgress}
            title="Reset Game Progress"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hints Dropdown Drawer */}
      {showHints && (
        <div className="max-w-7xl mx-auto mt-2.5 p-3 bg-[#181e2a] border border-slate-700/80 rounded-lg space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>Level Hints</span>
            </div>

            <button
              onClick={() => handleCopyKey(currentLevelData.password)}
              className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 rounded font-mono text-[11px] transition"
            >
              {copiedKey ? (
                <span className="text-emerald-400 font-sans">Password Copied!</span>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Solution Key</span>
                </>
              )}
            </button>
          </div>

          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 font-mono select-text">
            {currentLevelData.hints.map((hint, idx) => (
              <li key={idx}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
