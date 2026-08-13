import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, KeyRound } from 'lucide-react';
import { processCommand } from '../engine/commandProcessor';

export default function Terminal({ gameState, setGameState, currentLevelData, onOpenCheatsheet, onOpenSSHModal }) {
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.terminalLogs, inputVal]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
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
      const commands = ['ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'chmod', 'chown', 'find', 'man', 'help', 'history', 'clear', 'ssh', 'submit', 'flag', 'apt', 'pacman'];
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
      className="flex flex-col h-full bg-[#0b0e14] border border-[#1b2234] rounded-lg shadow-2xl overflow-hidden font-mono select-text"
      onClick={handleTerminalClick}
    >
      {/* Real Terminal Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121723] border-b border-[#1b2234] select-none shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-2 mr-1">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-red-600/30"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-yellow-600/30"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-green-600/30"></span>
          </div>
          <span className="text-xs text-slate-300 font-mono font-medium">
            {gameState.currentUser}@lowkey-linux: {gameState.cwd}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenSSHModal(null); }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-slate-700/80 transition"
          >
            <KeyRound className="w-3 h-3" />
            <span>SSH</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenCheatsheet(); }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition border border-transparent"
          >
            <BookOpen className="w-3 h-3" />
            <span>Commands</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Buffer & Embedded Input Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs text-slate-100 font-mono leading-relaxed select-text">
        {gameState.terminalLogs.map((log, index) => (
          <div key={index} className="leading-snug">
            {log.type === 'input' ? (
              <div className="flex items-center gap-1 font-mono text-xs my-0.5">
                <span className="text-emerald-400 font-semibold">{log.user}@lowkey-linux</span>
                <span className="text-slate-500">:</span>
                <span className="text-sky-400 font-semibold">{log.cwd}</span>
                <span className="text-slate-400 font-semibold">$</span>
                <span className="text-slate-100 ml-1 font-normal">{log.text}</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-slate-200 font-mono text-xs leading-relaxed my-0.5 select-text font-normal">
                {log.text}
              </pre>
            )}
          </div>
        ))}

        {/* Integrated Active Prompt Line */}
        <div className="flex items-center gap-1 font-mono text-xs pt-1">
          <span className="text-emerald-400 font-semibold">{gameState.currentUser}@lowkey-linux</span>
          <span className="text-slate-500">:</span>
          <span className="text-sky-400 font-semibold">{gameState.cwd}</span>
          <span className="text-slate-400 font-semibold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-xs text-slate-100 focus:outline-none font-mono caret-emerald-400 ml-1 border-none p-0 focus:ring-0"
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
