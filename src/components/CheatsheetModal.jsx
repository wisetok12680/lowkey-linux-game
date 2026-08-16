import React, { useState } from 'react';
import { BookOpen, Search, X, Terminal, Shield, Package, HardDrive, Filter } from 'lucide-react';
import { MAN_PAGES } from '../engine/commandProcessor';

export default function CheatsheetModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCmd, setSelectedCmd] = useState('sort');

  if (!isOpen) return null;

  const categories = [
    {
      title: 'Linux Basics & File System',
      icon: Terminal,
      commands: ['ls', 'cd', 'pwd', 'whoami', 'cat', 'touch', 'mkdir', 'rm', 'cp', 'mv', 'find', 'history', 'clear', 'exit', 'help', 'man']
    },
    {
      title: 'Text Pipelines & Streams',
      icon: Filter,
      commands: ['sort', 'uniq', 'tr', 'xxd', 'hexdump', 'grep', 'base64', 'wc', 'head', 'tail']
    },
    {
      title: 'Permissions & Ownership',
      icon: Shield,
      commands: ['chmod', 'chown', 'sudo']
    },
    {
      title: 'Package Management & Tools',
      icon: Package,
      commands: ['apt', 'pacman', 'inspect-tool', 'flatpak', 'snap']
    },
    {
      title: 'SSH & Network',
      icon: HardDrive,
      commands: ['ssh']
    }
  ];

  const currentManPage = MAN_PAGES[selectedCmd.toLowerCase()] || `No documentation available for ${selectedCmd}.`;

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

          {/* Main Manual View Area */}
          <div className="flex-1 p-4 bg-[#0a0d14] overflow-y-auto font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3 select-none">
              <span className="text-sky-400 font-bold uppercase">{selectedCmd}(1) Manual Page</span>
              <span className="text-[10px] text-slate-500">Lowkey Linux Manual System</span>
            </div>

            <pre className="whitespace-pre-wrap leading-relaxed select-text font-mono text-slate-200">
              {currentManPage}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
