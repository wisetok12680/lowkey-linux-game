import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, KeyRound } from 'lucide-react';
import { processCommand } from '../engine/commandProcessor';

export default function Terminal({ gameState, setGameState, currentLevelData, onOpenCheatsheet, onOpenSSHModal, activePlayer }) {
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sudoPrompt, setSudoPrompt] = useState(null); // { pendingCommand }
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.terminalLogs, inputVal, sudoPrompt]);

  const handleTerminalClick = (e) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (sudoPrompt) {
        // We are processing a password attempt for sudo!
        const enteredPass = inputVal.trim();
        const pendingCmd = sudoPrompt.pendingCommand;
        let actualTeamPass = activePlayer?.password || (typeof window !== 'undefined' ? localStorage.getItem('lowkey_linux_team_pass') : '') || '';

        // If no team password saved yet, accept entered password and bind it for the session
        if (!actualTeamPass && enteredPass) {
          actualTeamPass = enteredPass;
          if (typeof window !== 'undefined') {
            localStorage.setItem('lowkey_linux_team_pass', enteredPass);
          }
        }

        setInputVal('');
        setSudoPrompt(null);

        // Append masked password entry log to terminal
        const maskedLog = {
          type: 'output',
          text: `[sudo] password for ${gameState.currentUser}: ${'•'.repeat(enteredPass.length)}`
        };

        const isCorrect = enteredPass && actualTeamPass && enteredPass.toLowerCase() === actualTeamPass.toLowerCase();

        if (isCorrect) {
          // Password correct! Execute pending command as root!
          const sudoState = { ...gameState, isSudoVerified: true };
          const res = processCommand(pendingCmd, sudoState, setGameState);
          
          if (res && res.skipLogUpdate) return;
        } else {
          // Password incorrect!
          setGameState(prev => ({
            ...prev,
            terminalLogs: [
              ...prev.terminalLogs,
              maskedLog,
              { type: 'output', text: `sudo: 1 incorrect password attempt for team ${gameState.teamName || 'user'}. Permission denied.` }
            ]
          }));
        }
        return;
      }

      if (!inputVal.trim()) return;

      const res = processCommand(inputVal, gameState, setGameState);
      setInputVal('');
      setHistoryIndex(-1);

      if (res && res.promptSudoPassword) {
        setSudoPrompt({ pendingCommand: res.pendingCommand });
      } else if (res && res.promptSSHModal) {
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
    if (!inputVal.trim()) return;
    const parts = inputVal.split(' ');
    const lastPart = parts[parts.length - 1];
    if (!lastPart) return;

    const parentPathStr = lastPart.includes('/') ? lastPart.slice(0, lastPart.lastIndexOf('/')) || '.' : '.';
    const searchTerm = lastPart.includes('/') ? lastPart.slice(lastPart.lastIndexOf('/') + 1) : lastPart;
    const parentPath = gameState.vfs.normalizePath(gameState.cwd, parentPathStr, gameState.homeDir);
    const parentNode = gameState.vfs.getNode(parentPath);

    if (parentNode && parentNode.type === 'dir' && parentNode.children) {
      const matches = Object.keys(parentNode.children).filter(name => name.startsWith(searchTerm));
      if (matches.length === 1) {
        const completed = matches[0];
        const isDir = parentNode.children[completed].type === 'dir';
        const suffix = isDir ? '/' : ' ';
        if (lastPart.includes('/')) {
          parts[parts.length - 1] = `${parentPathStr}/${completed}${suffix}`;
        } else {
          parts[parts.length - 1] = `${completed}${suffix}`;
        }
        setInputVal(parts.join(' '));
      }
    }
  };

  return (
    <div 
      onClick={handleTerminalClick}
      className="bg-[#0b0e17] border border-cyber-border rounded-xl h-full flex flex-col shadow-2xl overflow-hidden font-mono text-xs select-text cursor-text"
    >
      {/* Terminal Titlebar Header */}
      <div className="bg-[#111622] border-b border-cyber-border px-4 py-2 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="text-slate-400 font-mono text-xs ml-2">
            {gameState.currentUser}@lowkey-linux: {gameState.cwd}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenSSHModal(null); }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-slate-700/80 transition select-none"
          >
            <KeyRound className="w-3 h-3" />
            <span>SSH</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenCheatsheet(); }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition border border-transparent select-none"
          >
            <BookOpen className="w-3 h-3" />
            <span>Commands</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Buffer & Embedded Input Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs text-slate-100 font-mono leading-relaxed select-text">
        {gameState.terminalLogs.map((log, index) => (
          <div key={index} className="leading-snug select-text">
            {log.type === 'input' ? (
              <div className="flex items-center gap-1 font-mono text-xs my-0.5 select-text">
                <span className="text-emerald-400 font-semibold">{log.user}@lowkey-linux</span>
                <span className="text-slate-500">:</span>
                <span className="text-sky-400 font-semibold">{log.cwd}</span>
                <span className="text-slate-400 font-semibold">$</span>
                <span className="text-slate-100 ml-1 font-normal select-text">{log.text}</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-slate-200 font-mono text-xs leading-relaxed my-0.5 select-text font-normal">
                {log.text}
              </pre>
            )}
          </div>
        ))}

        {/* Integrated Active Prompt Line */}
        <div className="flex items-center gap-1 font-mono text-xs pt-1 select-text">
          {sudoPrompt ? (
            <span className="text-amber-400 font-semibold flex-shrink-0">
              [sudo] password for {gameState.currentUser}:
            </span>
          ) : (
            <>
              <span className="text-emerald-400 font-semibold">{gameState.currentUser}@lowkey-linux</span>
              <span className="text-slate-500">:</span>
              <span className="text-sky-400 font-semibold">{gameState.cwd}</span>
              <span className="text-slate-400 font-semibold">$</span>
            </>
          )}
          <input
            ref={inputRef}
            type={sudoPrompt ? "password" : "text"}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-xs text-slate-100 focus:outline-none font-mono caret-emerald-400 ml-1 border-none p-0 focus:ring-0 select-text"
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
