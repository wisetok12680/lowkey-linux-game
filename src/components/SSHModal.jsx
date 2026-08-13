import React, { useState } from 'react';
import { KeyRound, X, ShieldCheck, AlertCircle, Clipboard } from 'lucide-react';
import { COMPETITION_LEVELS } from '../engine/levels';

export default function SSHModal({ isOpen, onClose, targetUser, gameState, setGameState }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const defaultUser = targetUser || `user${Math.min(COMPETITION_LEVELS.length - 1, gameState.currentLevel + 1)}`;
  const levelIdx = parseInt(defaultUser.replace('user', ''), 10);
  const targetLevelObj = COMPETITION_LEVELS[levelIdx] || COMPETITION_LEVELS[gameState.currentLevel];

  const handleSSHConnect = (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    if (passwordInput.trim() === targetLevelObj.password || levelIdx <= gameState.currentLevel) {
      setErrorMsg('');
      setGameState(prev => {
        const nextLevel = isNaN(levelIdx) ? prev.currentLevel : levelIdx;
        const nextData = COMPETITION_LEVELS[nextLevel] || COMPETITION_LEVELS[prev.currentLevel];
        if (nextData && nextData.initialTree) {
          nextData.initialTree(prev.vfs);
        }
        return {
          ...prev,
          currentLevel: nextLevel,
          currentUser: nextData ? nextData.user : `user${nextLevel}`,
          cwd: nextData ? nextData.homeDir : `/home/user${nextLevel}`,
          homeDir: nextData ? nextData.homeDir : `/home/user${nextLevel}`,
          terminalLogs: [
            { type: 'output', text: `Linux lowkey-linux 5.15.0-generic x86_64\nWelcome to Lowkey Linux (Stage ${nextLevel})\nAuthenticated via SSH as ${defaultUser}@localhost.` }
          ]
        };
      });
      setPasswordInput('');
      onClose();
    } else {
      setErrorMsg('Permission denied, please try again.');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setPasswordInput(text.trim());
    } catch (err) {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-[#111622] border border-cyber-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#141926] border-b border-cyber-border select-none">
          <div className="flex items-center gap-2 text-white font-bold text-sm font-mono">
            <KeyRound className="w-4 h-4 text-cyber-accent" />
            <span>ssh {defaultUser}@localhost</span>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSSHConnect} className="p-5 space-y-4 font-mono text-xs">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1 select-none">
            <p className="text-cyber-cyan font-bold">OpenSSH Authentication Prompt</p>
            <p className="text-slate-400">Enter password for <span className="text-cyber-accent">{defaultUser}@localhost</span>:</p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Password Token</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Paste password key..."
                autoFocus
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-accent text-sm font-mono select-text"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1 text-xs font-sans whitespace-nowrap"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs font-sans">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 select-none">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition text-xs font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyber-accent text-slate-950 hover:bg-green-400 transition font-bold text-xs font-sans"
            >
              Connect Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
