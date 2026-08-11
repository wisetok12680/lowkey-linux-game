import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, BookOpen, KeyRound, Copy, Check } from 'lucide-react';
import { processCommand } from '../engine/commandProcessor';

export default function Terminal({ gameState, setGameState, onOpenCheatsheet, onOpenSSHModal }) {
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copiedLogIndex, setCopiedLogIndex] = useState(null);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.terminalLogs]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedLogIndex(index);
    setTimeout(() => setCopiedLogIndex(null), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!inputVal.trim()) return;

      const res = processCommand(inputVal, gameState, setGameState);
      setInputVal('');
      setHistoryIndex(-1);

      if (res && res.promptSSHModal) {
        onOpenSSHModal(res.sshTargetUser);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const history = gameState.history;
      if (history.length === 0) return;

      const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInputVal(history[newIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const history = gameState.history;
      if (historyIndex === -1) return;

      const newIndex = historyIndex + 1;
      if (newIndex >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(newIndex);
        setInputVal(history[newIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
    }
  };

  const handleTabCompletion = () => {
    const parts = inputVal.split(' ');
    const lastPart = parts[parts.length - 1];

    if (parts.length === 1) {
      const commands = ['ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'chmod', 'chown', 'find', 'man', 'help', 'history', 'clear', 'ssh', 'apt', 'pacman'];
      const matches = commands.filter(c => c.startsWith(lastPart));
      if (matches.length === 1) {
        setInputVal(matches[0] + ' ');
      }
    } else {
      const currNode = gameState.vfs.getNode(gameState.cwd);
      if (currNode && currNode.children) {
        const entries = Object.keys(currNode.children);
        const matches = entries.filter(e => e.startsWith(lastPart));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          setInputVal(parts.join(' '));
        }
      }
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#0c0e14] border border-[#1e2638] rounded-lg shadow-lg overflow-hidden font-mono select-text"
      onClick={handleTerminalClick}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#12161f] border-b border-[#1e2638] select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span>
          </div>
          <TerminalIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-300 font-mono">
            {gameState.currentUser}@lowkey-linux:{gameState.cwd}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenSSHModal(null); }}
            className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
          >
            <KeyRound className="w-3 h-3" />
            <span>SSH</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenCheatsheet(); }}
            className="flex items-center gap-1 px-2 py-0.5 text-xs rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <BookOpen className="w-3 h-3" />
            <span>Commands</span>
          </button>
        </div>
      </div>

      {/* Terminal Content Body */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs text-slate-200 leading-relaxed font-mono select-text">
        <div className="text-slate-500 text-[11px] pb-2 border-b border-slate-800/80 mb-2 select-none">
          <p className="text-slate-300 font-semibold">Lowkey Linux Terminal Simulator</p>
          <p>Type <span className="text-emerald-400">help</span> to list commands, <span className="text-emerald-400">man &lt;cmd&gt;</span> for manuals.</p>
        </div>

        {gameState.terminalLogs.map((log, index) => (
          <div key={index} className="space-y-1 group relative">
            {log.type === 'input' ? (
              <div className="flex items-center gap-1.5 font-mono select-text">
                <span className="text-emerald-400 font-semibold">{log.user}@lowkey-linux</span>
                <span className="text-slate-600">:</span>
                <span className="text-sky-400">{log.cwd}</span>
                <span className="text-slate-500">$</span>
                <span className="text-slate-100 ml-1">{log.text}</span>
              </div>
            ) : (
              <div className="relative group">
                <pre className="whitespace-pre-wrap text-slate-300 font-mono text-[11px] bg-[#10141d] p-2 rounded border border-[#1e2638] leading-snug select-text pr-12">
                  {log.text}
                </pre>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopyText(log.text, index); }}
                  className="absolute right-1.5 top-1.5 p-1 rounded bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px]"
                  title="Copy output"
                >
                  {copiedLogIndex === index ? (
                    <span className="text-emerald-400 font-sans">Copied</span>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Prompt Input Line */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-emerald-400 font-semibold">{gameState.currentUser}@lowkey-linux</span>
          <span className="text-slate-600">:</span>
          <span className="text-sky-400">{gameState.cwd}</span>
          <span className="text-slate-500">$</span>
          <div className="flex-1 flex items-center ml-1">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-slate-100 font-mono text-xs caret-emerald-400 select-text"
              placeholder="type command..."
              autoFocus
              spellCheck="false"
              autoComplete="off"
            />
          </div>
        </div>
        <div ref={terminalEndRef} />
      </div>

      {/* Footer bar */}
      <div className="px-3.5 py-1.5 bg-[#12161f] border-t border-[#1e2638] flex items-center justify-between text-[11px] text-slate-500 select-none">
        <div className="flex items-center gap-3">
          <span><kbd className="px-1 bg-slate-800 rounded text-slate-300">Tab</kbd> Autocomplete</span>
          <span><kbd className="px-1 bg-slate-800 rounded text-slate-300">↑/↓</kbd> History</span>
        </div>
        <span className="text-slate-400">Shell: {gameState.currentUser}</span>
      </div>
    </div>
  );
}
