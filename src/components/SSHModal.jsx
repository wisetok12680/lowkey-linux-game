import React, { useState } from 'react';
import { KeyRound, X, AlertCircle, Clipboard } from 'lucide-react';
import { COMPETITION_LEVELS, getTeamUsername, getTeamHomeDir } from '../engine/levels';
import { submitFlagAPI } from '../services/api';

export default function SSHModal({ isOpen, onClose, targetUser, gameState, setGameState, activePlayer }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const teamName = activePlayer?.team_name || activePlayer?.username || 'team';
  const defaultUser = targetUser || getTeamUsername(teamName, Math.min(COMPETITION_LEVELS.length - 1, gameState.currentLevel + 1));
  const levelIdx = parseInt(defaultUser.replace(/^[a-z]+/i, ''), 10) || (gameState.currentLevel + 1);

  const handleSSHConnect = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    const targetStage = Math.max(0, levelIdx - 1);
    const res = await submitFlagAPI(teamName, targetStage, passwordInput.trim());

    if (res && res.correct) {
      setErrorMsg('');
      setGameState(prev => {
        const nextLevel = isNaN(levelIdx) ? prev.currentLevel : levelIdx;
        const nextData = COMPETITION_LEVELS[nextLevel] || COMPETITION_LEVELS[prev.currentLevel];
        const nextUser = getTeamUsername(teamName, nextLevel);
        const nextHome = getTeamHomeDir(teamName, nextLevel);

        if (nextData && nextData.initialTree) {
          nextData.initialTree(prev.vfs, nextUser);
        }
        return {
          ...prev,
          currentLevel: nextLevel,
          currentUser: nextUser,
          cwd: nextHome,
          homeDir: nextHome,
          terminalLogs: [
            { type: 'output', text: `Linux lowkey-linux 5.15.0-generic x86_64\nWelcome to Lowkey Linux (Stage ${nextLevel})\nAuthenticated via SSH as ${nextUser}@lowkey-linux.` }
          ]
        };
      });
      setPasswordInput('');
      onClose();
    } else {
      setErrorMsg(res.error || 'Permission denied, please try again.');
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
            <span>ssh {defaultUser}@lowkey-linux</span>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSSHConnect} className="p-5 space-y-4 font-mono text-xs">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1 select-none">
            <p className="text-cyber-cyan font-bold">OpenSSH Authentication Prompt</p>
            <p className="text-slate-400">Enter password for <span className="text-cyber-accent">{defaultUser}@lowkey-linux</span>:</p>
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
