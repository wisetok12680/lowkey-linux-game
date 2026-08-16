'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Users, 
  RefreshCw, 
  Search, 
  Trash2, 
  RotateCcw, 
  Shield, 
  Activity, 
  Clock, 
  Terminal, 
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  LogOut,
  Zap,
  Award,
  Circle
} from 'lucide-react';
import { fetchPlayersAPI, deletePlayerAPI, updateProgressAPI, updateInvigilationAPI } from '@/src/services/api';
import { COMPETITION_LEVELS } from '@/src/engine/levels';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminInputKey, setAdminInputKey] = useState('');
  const [authError, setAuthError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'reset'|'delete', team: '...' }

  const maxStageCount = COMPETITION_LEVELS.length - 1;

  // Check existing admin session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = sessionStorage.getItem('lowkey_admin_authed');
      if (savedToken === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!adminInputKey.trim()) {
      setAuthError('Please enter the admin secret key');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: adminInputKey.trim() })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid admin secret key');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lowkey_admin_authed', 'true');
      }
      setIsAuthenticated(true);
      setAdminInputKey('');
    } catch (err) {
      setAuthError(err.message || 'Access Denied: Invalid Admin Secret Key');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lowkey_admin_authed');
    }
    setIsAuthenticated(false);
  };

  // Load team data from Neon database
  const loadTeamsData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await fetchPlayersAPI();
      setTeams(data || []);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Error fetching teams for admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTeamsData();
    }
  }, [isAuthenticated, loadTeamsData]);

  // Auto-refresh polling every 5 seconds if enabled
  useEffect(() => {
    if (!isAuthenticated || !isAutoRefresh) return;
    const interval = setInterval(() => {
      loadTeamsData();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isAutoRefresh, loadTeamsData]);

  const handleResetTeamProgress = async (username) => {
    try {
      await updateProgressAPI(username, 0);
      setStatusMsg({ type: 'success', text: `Reset stage progress for team "${username}" to Stage 0` });
      setConfirmAction(null);
      await loadTeamsData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to reset team progress' });
    }
  };

  const handleDeleteTeamRecord = async (username) => {
    try {
      await deletePlayerAPI(username);
      setStatusMsg({ type: 'success', text: `Deleted team record "${username}"` });
      setConfirmAction(null);
      await loadTeamsData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete team' });
    }
  };

  const handleResetInvigilation = async (username) => {
    try {
      await updateInvigilationAPI(username, 0, false);
      if (typeof window !== 'undefined') {
        const teamKey = `lowkey_fs_exits_${username.toLowerCase()}`;
        localStorage.removeItem(teamKey);
      }
      setStatusMsg({ type: 'success', text: `Reset strikes & un-disqualified Team "${username}"!` });
      await loadTeamsData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to reset strikes' });
    }
  };

  // Filter & sort teams by progress
  const filteredTeams = teams
    .filter((t) => {
      const name = (t.team_name || t.username || '').toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (b.highest_level_unlocked !== a.highest_level_unlocked) {
        return b.highest_level_unlocked - a.highest_level_unlocked;
      }
      if (b.current_level !== a.current_level) {
        return b.current_level - a.current_level;
      }
      return new Date(b.last_active_at) - new Date(a.last_active_at);
    });

  // High-level overview stats
  const totalTeams = teams.length;
  const maxStageReached = teams.reduce((max, t) => Math.max(max, t.highest_level_unlocked || 0), 0);
  const activeNowCount = teams.filter((t) => {
    const activeTime = new Date(t.last_active_at).getTime();
    return Date.now() - activeTime < 5 * 60 * 1000; // active in last 5 mins
  }).length;

  const avgStage = totalTeams > 0
    ? (teams.reduce((acc, t) => acc + (t.current_level || 0), 0) / totalTeams).toFixed(1)
    : '0';

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusTag = (isoString) => {
    if (!isoString) return { label: 'OFFLINE', color: 'text-slate-500 bg-slate-800/60 border-slate-700' };
    const diffSecs = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSecs < 300) {
      return { label: 'ONLINE NOW', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
    if (diffSecs < 3600) {
      return { label: 'RECENT', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    }
    return { label: 'IDLE', color: 'text-slate-400 bg-slate-800/40 border-slate-800' };
  };

  // Admin Security Gateway Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans flex items-center justify-center p-4 select-none relative overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="bg-[#111622]/90 border border-slate-800/90 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative backdrop-blur-xl animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="p-6 text-center space-y-3 border-b border-slate-800/80 bg-gradient-to-b from-[#171e2e] to-[#111622]">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full tracking-wider">
                RESTRICTED AREA
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight">
              ADMIN SECURITY GATEWAY
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Enter the Admin Secret Key to access the live team tracking leaderboard.
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleAdminLogin} className="p-6 space-y-4 font-mono text-xs">
            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-medium animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Secret Key</span>
              </label>
              <input
                type="password"
                required
                autoFocus
                value={adminInputKey}
                onChange={(e) => setAdminInputKey(e.target.value)}
                placeholder="Enter secret admin key..."
                className="w-full px-4 py-3 text-xs bg-[#090c12] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono select-text transition shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || !adminInputKey.trim()}
              className="w-full py-3 px-4 text-xs font-mono font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-slate-950 rounded-xl transition shadow-lg shadow-emerald-500/20 font-sans tracking-wide mt-2"
            >
              {isVerifying ? 'VERIFYING KEY...' : 'AUTHENTICATE ADMIN'}
            </button>

            <div className="pt-2 text-center">
              <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition font-sans flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Game</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans p-4 sm:p-6 lg:p-8 select-text relative">
      {/* Background Lighting Gradients */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Top Navbar & Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111622]/90 border border-slate-800/90 p-5 rounded-2xl shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 shadow-lg shadow-emerald-500/5">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-100 tracking-tight font-mono">
                  LOWKEY LINUX ADMIN DASHBOARD
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE NEON DB
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time CTF team tracking & level progression leaderboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Game</span>
            </Link>

            <button
              onClick={loadTeamsData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition border border-slate-700/80"
              title="Lock Admin Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* System Notification Banner */}
        {statusMsg && (
          <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 border animate-in fade-in duration-200 shadow-md ${
            statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <div className="flex items-center gap-2 font-mono">
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
            <button onClick={() => setStatusMsg(null)} className="hover:opacity-75 font-bold px-2">✕</button>
          </div>
        )}

        {/* High-Level Overview Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Teams */}
          <div className="bg-gradient-to-b from-[#131826] to-[#0e121d] border border-slate-800/80 hover:border-slate-700 p-5 rounded-2xl shadow-xl transition duration-300 group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">TOTAL TEAMS</span>
              <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl group-hover:scale-105 transition">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">{totalTeams}</h3>
              <span className="text-[11px] text-slate-400 font-mono">registered</span>
            </div>
          </div>

          {/* Card 2: Highest Stage */}
          <div className="bg-gradient-to-b from-[#131826] to-[#0e121d] border border-slate-800/80 hover:border-slate-700 p-5 rounded-2xl shadow-xl transition duration-300 group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">HIGHEST STAGE</span>
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-105 transition">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">Stage {maxStageReached}</h3>
              <span className="text-[11px] text-slate-400 font-mono">/ {maxStageCount}</span>
            </div>
          </div>

          {/* Card 3: Online Now */}
          <div className="bg-gradient-to-b from-[#131826] to-[#0e121d] border border-slate-800/80 hover:border-slate-700 p-5 rounded-2xl shadow-xl transition duration-300 group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">ONLINE NOW</span>
              <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl group-hover:scale-105 transition">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-sky-400 font-mono tracking-tight">{activeNowCount}</h3>
              <span className="text-[11px] text-slate-400 font-mono">active in 5m</span>
            </div>
          </div>

          {/* Card 4: Avg Stage & Auto Refresh */}
          <div className="bg-gradient-to-b from-[#131826] to-[#0e121d] border border-slate-800/80 hover:border-slate-700 p-5 rounded-2xl shadow-xl transition duration-300 group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">AVG STAGE</span>
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border transition ${
                  isAutoRefresh ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Toggle Auto Refresh (5s)"
              >
                {isAutoRefresh ? 'AUTO (5s)' : 'PAUSED'}
              </button>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">Stage {avgStage}</h3>
              <span className="text-[11px] text-slate-400 font-mono">average</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111622]/80 border border-slate-800/80 p-4 rounded-2xl shadow-md backdrop-blur-md">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team name..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#090c12] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition"
            />
          </div>

          <div className="text-xs text-slate-400 font-mono self-end sm:self-center flex items-center gap-2">
            <span>Showing <strong className="text-slate-200">{filteredTeams.length}</strong> of <strong className="text-slate-200">{totalTeams}</strong> teams</span>
            {lastRefreshedAt && <span className="text-slate-600">• Refreshed {lastRefreshedAt.toLocaleTimeString()}</span>}
          </div>
        </div>

        {/* Teams Leaderboard Table */}
        <div className="bg-[#111622]/90 border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-[#151b2a] border-b border-slate-800 font-mono text-[11px] uppercase text-slate-400 tracking-wider select-none">
                <tr>
                  <th className="py-4 px-5 font-bold">Rank</th>
                  <th className="py-4 px-5 font-bold">Team Name</th>
                  <th className="py-4 px-5 font-bold">Current Stage</th>
                  <th className="py-4 px-5 font-bold">Highest Stage</th>
                  <th className="py-4 px-5 font-bold">Invigilation Exits</th>
                  <th className="py-4 px-5 font-bold">Status</th>
                  <th className="py-4 px-5 font-bold">Registered</th>
                  <th className="py-4 px-5 font-bold">Last Active</th>
                  <th className="py-4 px-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500 font-mono text-xs">
                      {searchQuery ? `No teams found matching "${searchQuery}"` : 'No teams registered in database yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team, idx) => {
                    const teamName = team.team_name || team.username;
                    const progressPct = Math.round((team.current_level / maxStageCount) * 100);
                    const status = getStatusTag(team.last_active_at);
                    const isMaster = team.highest_level_unlocked >= maxStageCount;
                    const isConfirming = confirmAction && confirmAction.team === team.username;
                    const isDisqualified = team.is_disqualified || (team.fullscreen_exits >= 5);

                    return (
                      <tr 
                        key={team.id || team.username} 
                        className={`transition duration-150 ${
                          idx === 0 
                            ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]' 
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-4 px-5 font-mono font-bold">
                          {idx === 0 ? (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 text-[11px] font-bold w-max shadow-sm">
                              🥇 #1
                            </span>
                          ) : idx === 1 ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-300/20 text-slate-200 border border-slate-300/30 font-bold text-[11px] w-max">
                              🥈 #2
                            </span>
                          ) : idx === 2 ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-700/20 text-amber-400 border border-amber-700/30 font-bold text-[11px] w-max">
                              🥉 #3
                            </span>
                          ) : (
                            <span className="text-slate-500 font-semibold text-xs ml-1">#{idx + 1}</span>
                          )}
                        </td>

                        {/* Team Name */}
                        <td className="py-4 px-5 font-mono font-bold text-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                              {teamName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-100 font-semibold">{teamName}</span>
                              {isMaster && (
                                <span className="text-[9px] text-amber-400 font-mono font-bold flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> MASTER FINISHER
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Current Stage */}
                        <td className="py-4 px-5 font-mono">
                          <div className="space-y-1.5 max-w-[150px]">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-emerald-400">Stage {team.current_level}</span>
                              <span className="text-slate-400 font-semibold text-[10px]">{progressPct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/30"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Highest Unlocked */}
                        <td className="py-4 px-5 font-mono">
                          <span className="px-2.5 py-1 text-xs bg-slate-800/90 text-teal-300 border border-slate-700/80 rounded-lg font-semibold inline-flex items-center gap-1 shadow-sm">
                            <Trophy className="w-3 h-3 text-amber-400" />
                            <span>Stage {team.highest_level_unlocked}</span>
                          </span>
                        </td>

                        {/* Invigilation & Exits */}
                        <td className="py-4 px-5 font-mono">
                          {isDisqualified ? (
                            <span className="px-2.5 py-1 text-[10px] bg-red-950/80 text-red-400 border border-red-800/80 rounded-lg font-bold inline-flex items-center gap-1 shadow-sm">
                              <AlertCircle className="w-3 h-3 text-red-400" />
                              <span>DISQUALIFIED ({team.fullscreen_exits || 5}/5)</span>
                            </span>
                          ) : (
                            <span className={`px-2.5 py-1 text-[11px] border rounded-lg font-semibold inline-flex items-center gap-1 shadow-sm ${
                              (team.fullscreen_exits || 0) > 0 
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                                : 'bg-slate-900/90 text-slate-400 border-slate-800'
                            }`}>
                              <Shield className="w-3 h-3 text-amber-400" />
                              <span>{team.fullscreen_exits || 0} / 5 Exits</span>
                            </span>
                          )}
                        </td>

                        {/* Status Tag */}
                        <td className="py-4 px-5 font-mono">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>

                        {/* Registered */}
                        <td className="py-4 px-5 font-mono text-slate-400 text-xs">
                          {team.created_at ? new Date(team.created_at).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Last Active */}
                        <td className="py-4 px-5 font-mono text-xs">
                          <span className="text-slate-300">{formatRelativeTime(team.last_active_at)}</span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right font-mono">
                          {isConfirming ? (
                            <div className="flex items-center justify-end gap-1.5 animate-in fade-in duration-150">
                              <button
                                onClick={() => {
                                  if (confirmAction.type === 'reset') handleResetTeamProgress(team.username);
                                  if (confirmAction.type === 'delete') handleDeleteTeamRecord(team.username);
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold shadow-sm"
                              >
                                Confirm {confirmAction.type}
                              </button>
                              <button
                                onClick={() => setConfirmAction(null)}
                                className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {((team.fullscreen_exits || 0) > 0 || isDisqualified) && (
                                <button
                                  onClick={() => handleResetInvigilation(team.username)}
                                  className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-xl transition border border-amber-500/30"
                                  title="Reset Fullscreen Strikes & Un-disqualify Team"
                                >
                                  <Shield className="w-4 h-4 text-amber-400" />
                                </button>
                              )}
                              <button
                                onClick={() => setConfirmAction({ type: 'reset', team: team.username })}
                                className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-700"
                                title="Reset Team Progress to Stage 0"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setConfirmAction({ type: 'delete', team: team.username })}
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/30"
                                title="Delete Team Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
