import React, { useState } from 'react';
import { X, Users, UserPlus, Trash2, Check, Trophy, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { createPlayerAPI, deletePlayerAPI } from '../services/api';
import { COMPETITION_LEVELS } from '../engine/levels';

export default function PlayerModal({
  isOpen,
  onClose,
  players,
  activePlayer,
  onSelectPlayer,
  onRefreshPlayers
}) {
  const [newTeamName, setNewTeamName] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  if (!isOpen) return null;

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = newTeamName.trim();
    if (!trimmed) return;

    try {
      setIsSubmitting(true);
      const created = await createPlayerAPI(trimmed, trimmed);
      setNewTeamName('');
      await onRefreshPlayers();
      onSelectPlayer(created);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamName) => {
    try {
      await deletePlayerAPI(teamName);
      setDeletingUser(null);
      await onRefreshPlayers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete team profile');
    }
  };

  const maxLevelIdx = COMPETITION_LEVELS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12161f] border border-[#1e2638] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans select-none flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#161c28] border-b border-[#1e2638] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
                TEAMS & PROGRESS
              </h2>
              <p className="text-xs text-slate-400">Synced to Neon Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Active Team Card */}
          {activePlayer && (
            <div className="bg-[#0c0e14] border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-mono font-bold text-slate-950 text-base shadow-md">
                  {(activePlayer.team_name || activePlayer.username).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-100">
                      Team {activePlayer.team_name || activePlayer.username}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> ACTIVE
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                    <span>Stage {activePlayer.current_level} / {maxLevelIdx}</span>
                    <span>•</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Highest Stage: {activePlayer.highest_level_unlocked}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono px-1">
              Registered Teams ({players.length})
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {players.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  No teams registered. Enter a team name below!
                </div>
              ) : (
                players.map((p) => {
                  const isActive = activePlayer && (activePlayer.team_name || activePlayer.username).toLowerCase() === (p.team_name || p.username).toLowerCase();
                  const isConfirmingDelete = deletingUser === p.username;

                  return (
                    <div
                      key={p.id || p.username}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                          : 'bg-[#0f131c] border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {(p.team_name || p.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-xs text-slate-200">
                              {p.team_name || p.username}
                            </span>
                            {isActive && (
                              <span className="text-[10px] text-emerald-400 font-mono font-medium">(Current)</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Stage {p.current_level} (Unlocked up to Stage {p.highest_level_unlocked})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive && (
                          <button
                            onClick={() => onSelectPlayer(p)}
                            className="px-3 py-1 text-xs font-mono font-semibold rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white transition shadow-sm"
                          >
                            Switch
                          </button>
                        )}

                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteTeam(p.username)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-mono"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeletingUser(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-slate-200 rounded text-[11px] font-mono"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          players.length > 1 && (
                            <button
                              onClick={() => setDeletingUser(p.username)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Delete Team"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Add New Team Form */}
          <form onSubmit={handleCreateTeam} className="space-y-2 pt-3 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block px-1">
              Add New Team
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name (e.g. CyberKnights)..."
                maxLength={30}
                className="flex-1 px-3.5 py-2 text-xs bg-[#0c0e14] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono select-text"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newTeamName.trim()}
                className="px-4 py-2 text-xs font-mono font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Team</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
