import React, { useState, useEffect } from 'react';
import { Terminal, Users, KeyRound, Sparkles, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { createPlayerAPI } from '../services/api';

export default function WelcomeTeamModal({ isOpen, onSubmitSuccess }) {
  const [teamName, setTeamName] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear input fields and errors whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setTeamName('');
      setTeamPassword('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedTeam = teamName.trim();
    const trimmedPass = teamPassword.trim();

    if (!trimmedTeam) {
      setErrorMsg('Please enter your team name');
      return;
    }

    if (!trimmedPass) {
      setErrorMsg('Please enter a team password');
      return;
    }

    if (trimmedPass.length < 3) {
      setErrorMsg('Team password must be at least 3 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      const player = await createPlayerAPI(trimmedTeam, trimmedTeam, trimmedPass);
      setTeamName('');
      setTeamPassword('');
      setErrorMsg(null);
      onSubmitSuccess(player);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authenticate team. Check password or team name.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#12161f] border border-[#1e2638] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-sans select-none relative">
        {/* Glowing Background Effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-b from-[#161c28] to-[#12161f] border-b border-[#1e2638] text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> LOWKEY LINUX CTF
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight font-mono">
            TEAM LOGIN & REGISTRATION
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Set or enter your team password to authenticate and save your stage progress on Neon DB.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Team Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Team Name</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. CyberKnights"
              maxLength={30}
              autoComplete="off"
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c0e14] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono select-text"
            />
          </div>

          {/* Team Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-teal-400" />
              <span>Team Password</span>
            </label>
            <input
              type="password"
              required
              value={teamPassword}
              onChange={(e) => setTeamPassword(e.target.value)}
              placeholder="Enter team secret password..."
              maxLength={50}
              autoComplete="new-password"
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c0e14] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono select-text"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !teamName.trim() || !teamPassword.trim()}
            className="w-full py-3 px-4 text-xs font-mono font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-slate-950 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 font-sans tracking-wide mt-2"
          >
            <span>ENTER GAME</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
