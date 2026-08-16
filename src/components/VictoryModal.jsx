import React from 'react';
import { Trophy, ShieldCheck, Terminal, Award, Sparkles, RefreshCw, Key, CheckCircle2, FileText, Cpu, Star } from 'lucide-react';

export default function VictoryModal({ isOpen, activePlayer, gameState, onRestart }) {
  if (!isOpen) return null;

  const teamName = activePlayer?.team_name || activePlayer?.username || gameState?.teamName || 'CyberNights';

  const masteredModules = [
    { name: 'Filesystem Architecture', icon: Terminal, desc: '/etc, /var, POSIX Tree' },
    { name: 'POSIX Access Control', icon: ShieldCheck, desc: 'chmod, octal masks, sticky bits' },
    { name: 'SSH Key Authentication', icon: Key, desc: 'OpenSSH identity keys & permissions' },
    { name: 'Pipeline Stream Chaining', icon: Cpu, desc: 'sort, uniq, grep stream chaining' },
    { name: 'Cipher Translation', icon: RefreshCw, desc: 'tr, ROT13 character rotation' },
    { name: 'Binary Forensics & Decoding', icon: FileText, desc: 'base64 -d & binary stream parsing' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in duration-300">
      <div className="bg-[#0f1420] border border-[#1e293b] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative border-emerald-500/30">
        
        {/* Animated Background Glow Accent */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Header Banner */}
        <div className="relative px-8 py-8 bg-gradient-to-b from-[#131b2e] to-[#0f1420] border-b border-slate-800/80 text-center flex flex-col items-center">
          
          {/* Trophy Badge */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#0a0d14] rounded-[14px] flex items-center justify-center">
                <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-emerald-400" />
            <span>Master Vault Unlocked • Stage 16 Complete</span>
          </div>

          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400 tracking-tight">
            CONGRATULATIONS, TEAM {teamName.toUpperCase()}!
          </h1>
          
          <p className="text-slate-400 text-xs mt-2 max-w-lg leading-relaxed">
            You have successfully completed all stages of the <strong className="text-emerald-400 font-semibold">Lowkey Linux Systems Competition</strong> and retrieved the Master Vault Flag!
          </p>
        </div>

        {/* Modal Body / Mastered Skills Grid */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Team Credentials Card */}
          <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center font-mono text-emerald-400 font-bold">
                {teamName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-slate-200 font-semibold text-sm">Team {teamName}</div>
                <div className="text-slate-400 text-xs font-mono">Master System Certification • 100% Passed</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg text-emerald-400 text-xs font-mono font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>STATUS: LINUX MASTER</span>
            </div>
          </div>

          {/* Mastered Skills Grid */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Mastered Systems Capabilities</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {masteredModules.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <div 
                    key={idx} 
                    className="bg-[#0c101a] border border-slate-800/80 hover:border-emerald-500/40 rounded-xl p-3 flex flex-col gap-1.5 transition"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span>{m.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {m.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Master Flag Verification Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-center space-y-1 select-all">
            <div className="text-slate-500 text-[10px] uppercase font-semibold">Verified Master Vault Flag</div>
            <div className="text-emerald-400 font-bold tracking-wider text-sm">
              MASTER_VAULT_FLAG_2026_ULTIMATE_LINUX_HERO
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0a0d14] border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Lowkey Linux Competition Engine v2.4
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restart Competition</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
