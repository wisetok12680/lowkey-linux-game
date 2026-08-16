import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'players.json');

function readLocalDb() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local db file:', err);
  }
  return { players: [], nextId: 1 };
}

function writeLocalDb(data) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local db file:', err);
  }
}

let dbInitPromise = null;

function getDbClient() {
  let connectionString = process.env.DATABASE_URL;

  // Fallback to reading .env.local directly if process.env.DATABASE_URL is empty in Next runtime
  if (!connectionString || connectionString.trim() === '') {
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        for (const line of content.split('\n')) {
          if (line.startsWith('DATABASE_URL=')) {
            connectionString = line.replace('DATABASE_URL=', '').trim();
            break;
          }
        }
      }
    } catch (e) {}
  }

  if (!connectionString || connectionString.trim() === '') {
    return null;
  }

  connectionString = connectionString.replace('&channel_binding=require', '').replace('?channel_binding=require', '');
  return neon(connectionString);
}

export async function initDb() {
  const sql = getDbClient();
  if (!sql) return;

  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS players (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            team_name VARCHAR(100) DEFAULT 'Solo',
            password VARCHAR(255) DEFAULT '',
            current_level INT NOT NULL DEFAULT 0,
            highest_level_unlocked INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `;

        await sql`
          ALTER TABLE players ADD COLUMN IF NOT EXISTS team_name VARCHAR(100) DEFAULT 'Solo';
        `;
        await sql`
          ALTER TABLE players ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT '';
        `;
        await sql`
          ALTER TABLE players ADD COLUMN IF NOT EXISTS fullscreen_exits INT DEFAULT 0;
        `;
        await sql`
          ALTER TABLE players ADD COLUMN IF NOT EXISTS is_disqualified BOOLEAN DEFAULT FALSE;
        `;
      } catch (err) {
        console.error('Failed to initialize Neon database table:', err);
      }
    })();
  }
  return dbInitPromise;
}

export async function getAllPlayers() {
  const sql = getDbClient();
  if (sql) {
    try {
      await initDb();
      const rows = await sql`
        SELECT id, username, team_name, current_level, highest_level_unlocked, fullscreen_exits, is_disqualified, created_at, last_active_at 
        FROM players 
        ORDER BY last_active_at DESC;
      `;
      return rows;
    } catch (err) {
      console.warn('Neon query failed, falling back to local file db:', err.message);
    }
  }

  const store = readLocalDb();
  return [...store.players].map(({ password, ...rest }) => rest).sort((a, b) => new Date(b.last_active_at) - new Date(a.last_active_at));
}

export async function getPlayer(username) {
  const cleanUser = username ? username.trim() : '';
  const sql = getDbClient();

  if (sql) {
    try {
      await initDb();
      const rows = await sql`
        SELECT id, username, team_name, current_level, highest_level_unlocked, fullscreen_exits, is_disqualified, created_at, last_active_at 
        FROM players 
        WHERE LOWER(username) = LOWER(${cleanUser}) OR LOWER(team_name) = LOWER(${cleanUser})
        LIMIT 1;
      `;
      if (rows.length > 0) return rows[0];
    } catch (err) {
      console.warn('Neon query getPlayer failed, falling back to local storage:', err.message);
    }
  }

  const store = readLocalDb();
  const found = store.players.find(p => p.username.toLowerCase() === cleanUser.toLowerCase() || (p.team_name && p.team_name.toLowerCase() === cleanUser.toLowerCase()));
  if (!found) return null;
  const { password, ...rest } = found;
  return rest;
}

function createOrLoginLocal(trimmedUser, trimmedTeam, trimmedPass) {
  const store = readLocalDb();
  const existing = store.players.find(p => p.username.toLowerCase() === trimmedUser.toLowerCase() || (p.team_name && p.team_name.toLowerCase() === trimmedTeam.toLowerCase()));
  if (existing) {
    if (existing.password && existing.password !== trimmedPass) {
      throw new Error('Incorrect password for this team');
    }
    if (!existing.password && trimmedPass) {
      existing.password = trimmedPass;
    }
    existing.team_name = trimmedTeam;
    existing.last_active_at = new Date().toISOString();
    writeLocalDb(store);
    return existing;
  }

  const newPlayer = {
    id: store.nextId++,
    username: trimmedUser,
    team_name: trimmedTeam,
    password: trimmedPass,
    current_level: 0,
    highest_level_unlocked: 0,
    fullscreen_exits: 0,
    is_disqualified: false,
    created_at: new Date().toISOString(),
    last_active_at: new Date().toISOString()
  };
  store.players.push(newPlayer);
  writeLocalDb(store);
  return newPlayer;
}

export async function createOrLoginPlayer(username, teamName = 'Solo', password = '') {
  const sql = getDbClient();
  const trimmedUser = username.trim();
  const trimmedTeam = (teamName || 'Solo').trim();
  const trimmedPass = (password || '').trim();

  if (sql) {
    try {
      await initDb();
      const existingRows = await sql`
        SELECT id, username, team_name, password, current_level, highest_level_unlocked, fullscreen_exits, is_disqualified, created_at, last_active_at
        FROM players
        WHERE LOWER(username) = LOWER(${trimmedUser}) OR LOWER(team_name) = LOWER(${trimmedTeam})
        LIMIT 1;
      `;

      if (existingRows.length > 0) {
        const existing = existingRows[0];
        if (existing.password && existing.password !== trimmedPass) {
          throw new Error('Incorrect password for this team');
        }

        const updatedRows = await sql`
          UPDATE players
          SET team_name = ${trimmedTeam},
              password = CASE WHEN password = '' THEN ${trimmedPass} ELSE password END,
              last_active_at = CURRENT_TIMESTAMP
          WHERE id = ${existing.id}
          RETURNING id, username, team_name, password, current_level, highest_level_unlocked, fullscreen_exits, is_disqualified, created_at, last_active_at;
        `;
        return updatedRows[0];
      }

      const newRows = await sql`
        INSERT INTO players (username, team_name, password, current_level, highest_level_unlocked, fullscreen_exits, is_disqualified, last_active_at)
        VALUES (${trimmedUser}, ${trimmedTeam}, ${trimmedPass}, 0, 0, 0, FALSE, CURRENT_TIMESTAMP)
        RETURNING id, username, team_name, password, current_level, highest_level_unlocked, fullscreen_exits, is_disqualified, created_at, last_active_at;
      `;
      return newRows[0];
    } catch (err) {
      if (err.message === 'Incorrect password for this team') {
        throw err;
      }
      console.warn('Neon createOrLoginPlayer failed, falling back to local file db:', err.message);
    }
  }

  return createOrLoginLocal(trimmedUser, trimmedTeam, trimmedPass);
}

function updateProgressLocal(cleanUser, levelNum) {
  const store = readLocalDb();
  const player = store.players.find(p => p.username.toLowerCase() === cleanUser.toLowerCase() || (p.team_name && p.team_name.toLowerCase() === cleanUser.toLowerCase()));
  if (player) {
    player.current_level = levelNum;
    player.highest_level_unlocked = Math.max(player.highest_level_unlocked || 0, levelNum);
    player.last_active_at = new Date().toISOString();
    writeLocalDb(store);
    const { password, ...rest } = player;
    return rest;
  }
  return null;
}

export async function updatePlayerProgress(username, currentLevel) {
  const sql = getDbClient();
  const levelNum = Number(currentLevel);
  const cleanUser = username ? username.trim() : '';

  if (sql) {
    try {
      await initDb();
      const rows = await sql`
        UPDATE players
        SET current_level = ${levelNum},
            highest_level_unlocked = GREATEST(highest_level_unlocked, ${levelNum}),
            last_active_at = CURRENT_TIMESTAMP
        WHERE LOWER(username) = LOWER(${cleanUser}) OR LOWER(team_name) = LOWER(${cleanUser})
        RETURNING id, username, team_name, current_level, highest_level_unlocked, fullscreen_exits, is_disqualified, created_at, last_active_at;
      `;
      if (rows.length > 0) return rows[0];
    } catch (err) {
      console.warn('Neon updatePlayerProgress failed, falling back to local file db:', err.message);
    }
  }

  return updateProgressLocal(cleanUser, levelNum);
}

export async function updatePlayerInvigilation(username, fullscreenExits, isDisqualified) {
  const sql = getDbClient();
  const cleanUser = username ? username.trim() : '';
  const exits = Number(fullscreenExits) || 0;
  const disq = Boolean(isDisqualified);

  if (sql) {
    try {
      await initDb();
      const rows = await sql`
        UPDATE players
        SET fullscreen_exits = ${exits},
            is_disqualified = ${disq},
            last_active_at = CURRENT_TIMESTAMP
        WHERE LOWER(username) = LOWER(${cleanUser}) OR LOWER(team_name) = LOWER(${cleanUser})
        RETURNING id, username, team_name, current_level, highest_level_unlocked, fullscreen_exits, is_disqualified, created_at, last_active_at;
      `;
      if (rows.length > 0) return rows[0];
    } catch (err) {
      console.warn('Neon updatePlayerInvigilation failed, falling back to local file db:', err.message);
    }
  }

  const store = readLocalDb();
  const player = store.players.find(p => p.username.toLowerCase() === cleanUser.toLowerCase() || (p.team_name && p.team_name.toLowerCase() === cleanUser.toLowerCase()));
  if (player) {
    player.fullscreen_exits = exits;
    player.is_disqualified = disq;
    player.last_active_at = new Date().toISOString();
    writeLocalDb(store);
    const { password, ...rest } = player;
    return rest;
  }
  return null;
}

export async function deletePlayer(username) {
  const sql = getDbClient();
  const cleanUser = username ? username.trim() : '';

  if (sql) {
    try {
      await initDb();
      await sql`
        DELETE FROM players 
        WHERE LOWER(username) = LOWER(${cleanUser}) OR LOWER(team_name) = LOWER(${cleanUser});
      `;
    } catch (err) {
      console.warn('Neon deletePlayer failed, falling back to local file db:', err.message);
    }
  }

  const store = readLocalDb();
  store.players = store.players.filter(p => p.username.toLowerCase() !== cleanUser.toLowerCase() && (!p.team_name || p.team_name.toLowerCase() !== cleanUser.toLowerCase()));
  writeLocalDb(store);
  return true;
}
