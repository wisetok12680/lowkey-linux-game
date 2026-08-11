import React, { useState } from 'react';
import { BookOpen, Search, X, Terminal, Shield, Package, HardDrive } from 'lucide-react';
import { MAN_PAGES } from '../engine/commandProcessor';

export default function CheatsheetModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCmd, setSelectedCmd] = useState('ls');

  if (!isOpen) return null;

  const categories = [
    {
      title: 'Linux Basics & File System',
      icon: Terminal,
      commands: ['ls', 'cd', 'pwd', 'cat', 'touch', 'mkdir', 'rm', 'cp', 'mv', 'find', 'history', 'clear', 'exit', 'help', 'man']
    },
    {
      title: 'Permissions & Ownership',
      icon: Shield,
      commands: ['chmod', 'chown']
    },
    {
      title: 'Package Management',
      icon: Package,
      commands: ['apt', 'pacman', 'flatpak', 'snap']
    },
    {
      title: 'SSH & Network',
      icon: HardDrive,
      commands: ['ssh']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-[#12161f] border border-[#1e2638] rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#10141d] border-b border-[#1e2638] select-none">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Command Documentation & Manual Reader</span>
          </div>

          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Command List */}
          <div className="w-64 bg-[#0c0e14] border-r border-[#1e2638] p-3 flex flex-col gap-3 overflow-y-auto select-none">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search command..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Categorized List */}
            <div className="space-y-3">
              {categories.map((cat, idx) => {
                const CatIcon = cat.icon;
                const filteredCmds = cat.commands.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
                if (filteredCmds.length === 0) return null;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      <CatIcon className="w-3 h-3 text-sky-400" />
                      <span>{cat.title}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 font-mono">
                      {filteredCmds.map(cmd => (
                        <button
                          key={cmd}
                          onClick={() => setSelectedCmd(cmd)}
                          className={`px-2 py-1 rounded text-left text-xs transition border ${
                            selectedCmd === cmd
                              ? 'bg-slate-800 border-slate-700 text-emerald-400 font-semibold'
                              : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                          }`}
                        >
                          {cmd}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Man Page Viewer Right Area */}
          <div className="flex-1 p-4 bg-[#0c0e14] overflow-y-auto font-mono text-xs text-slate-200">
            <div className="mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span className="text-emerald-400 text-xs font-semibold">MANUAL: {selectedCmd.toUpperCase()}</span>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-sky-400 rounded text-[10px]">
                {selectedCmd}
              </span>
            </div>

            <pre className="whitespace-pre-wrap leading-relaxed text-slate-300 bg-[#10141d] p-3 rounded border border-slate-800/80 text-[11px] select-text">
              {MAN_PAGES[selectedCmd] || `No manual page entry available for ${selectedCmd}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
