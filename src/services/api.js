// API Client for Next.js Neon Database routes with no-cache live syncing

export async function fetchPlayersAPI() {
  try {
    const res = await fetch('/api/players', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const data = await res.json();
    if (data.success) {
      return data.players;
    }
    return [];
  } catch (err) {
    console.error('Error fetching players:', err);
    return [];
  }
}

export async function createPlayerAPI(username, teamName = 'Solo', password = '') {
  try {
    const res = await fetch('/api/players', {
      method: 'POST',
      cache: 'no-store',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ username, teamName, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to authenticate team');
    }
    return data.player;
  } catch (err) {
    console.error('Error authenticating player/team:', err);
    throw err;
  }
}

export async function updateProgressAPI(username, currentLevel) {
  try {
    const res = await fetch(`/api/players/${encodeURIComponent(username)}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ currentLevel })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update progress');
    }
    return data.player;
  } catch (err) {
    console.error('Error updating progress:', err);
    throw err;
  }
}

export async function deletePlayerAPI(username) {
  try {
    const res = await fetch(`/api/players/${encodeURIComponent(username)}`, {
      method: 'DELETE',
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete player');
    }
    return true;
  } catch (err) {
    console.error('Error deleting player:', err);
    throw err;
  }
}
