import React, { useState, useEffect } from 'react';
import { VFS } from './engine/vfs';
import { COMPETITION_LEVELS } from './engine/levels';
import LevelHeader from './components/LevelHeader';
import Terminal from './components/Terminal';
import CheatsheetModal from './components/CheatsheetModal';
import SSHModal from './components/SSHModal';

export default function App() {
  const [gameState, setGameState] = useState(() => {
    const vfs = new VFS();
    const currentLevel = 0;
    const initialData = COMPETITION_LEVELS[0];
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
        { type: 'output', text: `Linux lowkey-linux 5.15.0-generic x86_64\nWelcome to Lowkey Linux (Competition)\nLogged in as ${initialData.user}@localhost.` }
      ]
    };
  });

  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [sshModalConfig, setSshModalConfig] = useState({ isOpen: false, targetUser: null });

  const currentLevelData = COMPETITION_LEVELS[gameState.currentLevel] || COMPETITION_LEVELS[0];

  // Reset Game Progress
  const handleResetProgress = () => {
    if (window.confirm('Reset all progress back to Level 0?')) {
      const vfs = new VFS();
      const initialData = COMPETITION_LEVELS[0];
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
          { type: 'output', text: `Linux lowkey-linux 5.15.0-generic x86_64\nWelcome to Lowkey Linux (Competition)\nLogged in as ${initialData.user}@localhost.` }
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

      {/* Main Content Area - Full-Width Terminal View */}
      <main className="flex-1 p-3 overflow-hidden">
        <section className="h-full min-h-0">
          <Terminal 
            gameState={gameState}
            setGameState={setGameState}
            currentLevelData={currentLevelData}
            onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
            onOpenSSHModal={(targetUser) => setSshModalConfig({ isOpen: true, targetUser })}
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
