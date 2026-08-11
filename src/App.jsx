import React, { useState, useEffect } from 'react';
import { VFS } from './engine/vfs';
import { BANDIT_LEVELS } from './engine/levels';
import LevelHeader from './components/LevelHeader';
import Terminal from './components/Terminal';
import RangerView from './components/RangerView';
import CheatsheetModal from './components/CheatsheetModal';
import SSHModal from './components/SSHModal';

export default function App() {
  const [gameState, setGameState] = useState(() => {
    const vfs = new VFS();
    const currentLevel = 0;
    const initialData = BANDIT_LEVELS[0];
    if (initialData.initialTree) {
      initialData.initialTree(vfs);
    }

    return {
      vfs,
      currentLevel,
      currentUser: initialData.user,
      cwd: initialData.homeDir,
      prevCwd: initialData.homeDir,
      homeDir: initialData.homeDir,
      history: [],
      installedPackages: new Set(),
      terminalLogs: [
        { type: 'output', text: `LOWKEY LINUX GAME SYSTEM INITIALIZED.\nActive user: ${initialData.user}\nType 'help' or 'man' to get started.` }
      ]
    };
  });

  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [sshModalConfig, setSshModalConfig] = useState({ isOpen: false, targetUser: null });

  const currentLevelData = BANDIT_LEVELS[gameState.currentLevel] || BANDIT_LEVELS[0];

  // Reset Game Progress
  const handleResetProgress = () => {
    if (window.confirm('Reset all progress back to Level 0?')) {
      const vfs = new VFS();
      const initialData = BANDIT_LEVELS[0];
      if (initialData.initialTree) {
        initialData.initialTree(vfs);
      }
      setGameState({
        vfs,
        currentLevel: 0,
        currentUser: initialData.user,
        cwd: initialData.homeDir,
        prevCwd: initialData.homeDir,
        homeDir: initialData.homeDir,
        history: [],
        installedPackages: new Set(),
        terminalLogs: [
          { type: 'output', text: `SYSTEM RESET. Welcome back to Bandit Level 0.` }
        ]
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Navigation & Level Objective Header */}
      <LevelHeader 
        gameState={gameState}
        setGameState={setGameState}
        currentLevelData={currentLevelData}
        onResetProgress={handleResetProgress}
        onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
      />

      {/* Main Content Area - Split View (Terminal + RANGER View) */}
      <main className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Terminal Pane */}
        <section className="lg:col-span-7 h-full min-h-0">
          <Terminal 
            gameState={gameState}
            setGameState={setGameState}
            onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
            onOpenSSHModal={(targetUser) => setSshModalConfig({ isOpen: true, targetUser })}
          />
        </section>

        {/* Navigable RANGER File Manager Pane */}
        <section className="lg:col-span-5 h-full min-h-0">
          <RangerView 
            gameState={gameState}
            setGameState={setGameState}
          />
        </section>
      </main>

      {/* Modals */}
      <CheatsheetModal 
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      <SSHModal 
        isOpen={sshModalConfig.isOpen}
        onClose={() => setSshModalConfig({ isOpen: false, targetUser: null })}
        targetUser={sshModalConfig.targetUser}
        gameState={gameState}
        setGameState={setGameState}
      />
    </div>
  );
}
