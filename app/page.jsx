'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VFS } from '@/src/engine/vfs';
import { COMPETITION_LEVELS, getTeamUsername, getTeamHomeDir } from '@/src/engine/levels';
import LevelHeader from '@/src/components/LevelHeader';
import Terminal from '@/src/components/Terminal';
import CheatsheetModal from '@/src/components/CheatsheetModal';
import SSHModal from '@/src/components/SSHModal';
import WelcomeTeamModal from '@/src/components/WelcomeTeamModal';
import VictoryModal from '@/src/components/VictoryModal';
import FullscreenGuard from '@/src/components/FullscreenGuard';
import { fetchPlayersAPI, updateProgressAPI } from '@/src/services/api';

const getUserForLevel = (levelData, player) => {
  const teamName = player?.team_name || player?.username || 'team';
  return getTeamUsername(teamName, levelData.level);
};

const getHomeDirForLevel = (levelData, player) => {
  const teamName = player?.team_name || player?.username || 'team';
  return getTeamHomeDir(teamName, levelData.level);
};

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    try {
      return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
    } catch (e) {
      return null;
    }
  }
  return null;
}

export default function GamePage() {
  const [players, setPlayers] = useState([]);
  const [activePlayer, setActivePlayer] = useState(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [sshModalConfig, setSshModalConfig] = useState({ isOpen: false, targetUser: null });

  const activePlayerUsernameRef = useRef(null);

  // Initialize Game State
  const [gameState, setGameState] = useState(() => {
    const vfs = new VFS();
    const currentLevel = 0;
    const initialData = COMPETITION_LEVELS[0];
    const defaultUser = getTeamUsername('team', 0);
    const defaultHome = getTeamHomeDir('team', 0);

    if (initialData.initialTree) {
      initialData.initialTree(vfs, defaultUser);
    }

    return {
      vfs,
      currentLevel,
      teamName: 'team',
      currentUser: defaultUser,
      cwd: defaultHome,
      prevCwd: defaultHome,
      homeDir: defaultHome,
      history: [],
      installedPackages: new Set(),
      terminalLogs: [
        { type: 'output', text: `Linux lowkey-linux 5.15.0-generic x86_64\nWelcome to Lowkey Linux CTF\nLogged in as ${defaultUser}@lowkey-linux.` }
      ]
    };
  });

  // Load players/teams from Neon Postgres database on initial mount
  const loadPlayers = useCallback(async () => {
    try {
      const list = await fetchPlayersAPI();
      setPlayers(list || []);

      // Check cookie first, fallback to localStorage
      const authCookie = getCookie('lowkey_team_auth');
      const savedTeamName = authCookie?.team_name || (typeof window !== 'undefined' ? localStorage.getItem('lowkey_linux_active_team') : null);

      if (savedTeamName && list && list.length > 0) {
        const match = list.find(
          (p) => (p.team_name || p.username).toLowerCase() === savedTeamName.toLowerCase()
        );
        if (match) {
          setActivePlayer(match);
          setIsWelcomeModalOpen(false);
          return;
        }
      }

      // No cookie / active session saved -> Prompt for Team Login & Password!
      setIsWelcomeModalOpen(true);
    } catch (err) {
      console.error('Failed to load teams from Neon database:', err);
      setIsWelcomeModalOpen(true);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  // Sync active team's VFS state ONLY when a NEW team logs in or activePlayer changes identity
  useEffect(() => {
    if (activePlayer && activePlayer.username !== activePlayerUsernameRef.current) {
      activePlayerUsernameRef.current = activePlayer.username;

      const playerLvl = Math.min(COMPETITION_LEVELS.length - 1, Math.max(0, activePlayer.current_level || 0));
      const vfs = new VFS();
      const teamName = activePlayer.team_name || activePlayer.username;

      // Populate VFS trees for all levels unlocked up to playerLvl
      for (let lvl = 0; lvl <= playerLvl; lvl++) {
        const lvlData = COMPETITION_LEVELS[lvl];
        const lvlUser = getTeamUsername(teamName, lvl);
        if (lvlData && lvlData.initialTree) {
          lvlData.initialTree(vfs, lvlUser);
        }
      }

      const currentLvlData = COMPETITION_LEVELS[playerLvl] || COMPETITION_LEVELS[0];
      const user = getUserForLevel(currentLvlData, activePlayer);
      const home = getHomeDirForLevel(currentLvlData, activePlayer);

      setGameState({
        vfs,
        currentLevel: playerLvl,
        teamName,
        currentUser: user,
        cwd: home,
        prevCwd: home,
        homeDir: home,
        history: [],
        installedPackages: new Set(),
        terminalLogs: [
          { type: 'output', text: `Linux lowkey-linux 5.15.0-generic x86_64\nWelcome Team ${teamName}! (Stage ${playerLvl})\nAuthenticated via SSH as ${user}@lowkey-linux.` }
        ]
      });
    }
  }, [activePlayer]);

  // Sync level progress changes to Neon Postgres backend
  useEffect(() => {
    if (!activePlayer) return;

    if (gameState.currentLevel !== activePlayer.current_level) {
      updateProgressAPI(activePlayer.username, gameState.currentLevel)
        .then((updatedPlayer) => {
          if (updatedPlayer) {
            setActivePlayer((prev) => prev ? { ...prev, current_level: updatedPlayer.current_level } : updatedPlayer);
          }
        })
        .catch((err) => console.error('Failed to update stage progress in Neon:', err));
    }
  }, [gameState.currentLevel, activePlayer]);

  // Handle successful welcome team registration / login
  const handleWelcomeSuccess = (newPlayer) => {
    const team = newPlayer.team_name || newPlayer.username;
    if (typeof window !== 'undefined') {
      localStorage.setItem('lowkey_linux_active_team', team);
      if (newPlayer.password) {
        localStorage.setItem('lowkey_linux_team_pass', newPlayer.password);
      }
    }

    activePlayerUsernameRef.current = newPlayer.username;
    setActivePlayer(newPlayer);
    setPlayers((prev) => [newPlayer, ...prev.filter((p) => p.username !== newPlayer.username)]);
    setIsWelcomeModalOpen(false);

    const initialData = COMPETITION_LEVELS[0];
    const user = getUserForLevel(initialData, newPlayer);
    const home = getHomeDirForLevel(initialData, newPlayer);
    const vfs = new VFS();
    if (initialData.initialTree) {
      initialData.initialTree(vfs, user);
    }

    setGameState({
      vfs,
      currentLevel: newPlayer.current_level || 0,
      teamName: team,
      currentUser: user,
      cwd: home,
      prevCwd: home,
      homeDir: home,
      history: [],
      installedPackages: new Set(),
      terminalLogs: [
        { type: 'output', text: `Linux lowkey-linux 5.15.0-generic x86_64\nWelcome Team ${team}!\nAuthenticated via SSH as ${user}@lowkey-linux.` }
      ]
    });
  };

  // Sign out active team
  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lowkey_linux_active_team');
      document.cookie = 'lowkey_team_auth=; path=/; max-age=0';
    }
    activePlayerUsernameRef.current = null;
    setActivePlayer(null);
    setIsWelcomeModalOpen(true);
  };

  // Reset Game Progress for current team
  const handleResetProgress = () => {
    if (!activePlayer) return;
    const team = activePlayer.team_name || activePlayer.username;
    if (window.confirm(`Reset progress for Team ${team} back to Stage 0?`)) {
      const vfs = new VFS();
      const initialData = COMPETITION_LEVELS[0];
      const user = getUserForLevel(initialData, activePlayer);
      const home = getHomeDirForLevel(initialData, activePlayer);

      if (initialData.initialTree) {
        initialData.initialTree(vfs, user);
      }

      setGameState({
        vfs,
        currentLevel: 0,
        teamName: team,
        currentUser: user,
        cwd: home,
        prevCwd: home,
        homeDir: home,
        history: [],
        installedPackages: new Set(),
        terminalLogs: [
          { type: 'output', text: `Linux lowkey-linux 5.15.0-generic x86_64\nWelcome Team ${team}! (Stage 0)\nAuthenticated via SSH as ${user}@lowkey-linux.` }
        ]
      });

      updateProgressAPI(activePlayer.username, 0)
        .then((updated) => {
          if (updated) {
            setActivePlayer((prev) => prev ? { ...prev, current_level: 0 } : updated);
            loadPlayers();
          }
        });
    }
  };

  const currentLevelData = COMPETITION_LEVELS[gameState.currentLevel] || COMPETITION_LEVELS[0];

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation & Level Objective Header */}
      <LevelHeader 
        gameState={gameState}
        setGameState={setGameState}
        currentLevelData={currentLevelData}
        onResetProgress={handleResetProgress}
        onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
        activePlayer={activePlayer}
        onSignOut={handleSignOut}
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
            activePlayer={activePlayer}
          />
        </section>
      </main>

      {/* Modals */}
      <WelcomeTeamModal
        isOpen={isWelcomeModalOpen}
        onSubmitSuccess={handleWelcomeSuccess}
      />

      <CheatsheetModal 
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      <SSHModal 
        isOpen={sshModalConfig.isOpen}
        onClose={() => setSshModalConfig({ isOpen: false, targetUser: null })}
        targetUser={sshModalConfig.targetUser || getTeamUsername(activePlayer?.team_name || activePlayer?.username || gameState.teamName || 'team', gameState.currentLevel + 1)}
        gameState={gameState}
        setGameState={setGameState}
        activePlayer={activePlayer}
      />

      <VictoryModal
        isOpen={gameState.currentLevel >= 16}
        activePlayer={activePlayer}
        gameState={gameState}
        onRestart={handleResetProgress}
      />

      <FullscreenGuard
        activePlayer={activePlayer}
        gameState={gameState}
      />
    </div>
  );
}
