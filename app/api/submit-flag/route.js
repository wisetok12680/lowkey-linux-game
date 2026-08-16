import { NextResponse } from 'next/server';
import { getPlayer, updatePlayerProgress } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Server-side password map for anti-cheat verification
const SERVER_STAGE_PASSWORDS = [
  "NH7nx1LgT89k3vPZ",                     // Stage 0
  "r48xP02kM91LqW7z",                     // Stage 1
  "Um83n2x9V1kL04pQ",                     // Stage 2
  "pQ79vX01kL34n2m8",                     // Stage 3
  "koP89n31xQ45vL72",                     // Stage 4
  "DX7kM023nL19vP84",                     // Stage 5
  "zK89pX02mL14vN93",                     // Stage 6
  "qP90mL34vX81n2k7",                     // Stage 7
  "mK90pL34vN81n2k7",                     // Stage 8
  "xU91mL74vP09n3k2",                     // Stage 9
  "b64_pW78mX01nL92kP34",                 // Stage 10
  "rot13_vK92nL10mP45kQ78",               // Stage 11
  "hex_zK90pL34vN81n2m9",                 // Stage 12
  "ssh_kP90mL34vX81n2m9",                 // Stage 13
  "token_pW90nL12vM45xQ78",               // Stage 14
  "MASTER_VAULT_FLAG_2026_ULTIMATE_LINUX_HERO" // Stage 15 (Master Vault)
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, currentLevel, password } = body;

    const levelNum = Number(currentLevel);
    const submittedPass = (password || '').trim();
    const cleanUser = (username || '').trim();

    if (!cleanUser || isNaN(levelNum)) {
      return NextResponse.json({ success: false, error: 'Username and level are required' }, { status: 400 });
    }

    // 1. Check if team is disqualified in Neon DB
    const player = await getPlayer(cleanUser);
    if (player && (player.is_disqualified || player.fullscreen_exits >= 5)) {
      return NextResponse.json({ 
        success: false, 
        disqualified: true, 
        error: '[ACCESS DENIED] Team Disqualified for Invigilation Violation. Contact Invigilator.' 
      }, { status: 403 });
    }

    // 2. Validate level range
    if (levelNum < 0 || levelNum >= SERVER_STAGE_PASSWORDS.length) {
      return NextResponse.json({ success: false, error: 'Invalid stage level' }, { status: 400 });
    }

    // 3. Server-side password verification
    const expectedPass = SERVER_STAGE_PASSWORDS[levelNum];
    if (submittedPass === expectedPass) {
      const nextLevel = Math.min(SERVER_STAGE_PASSWORDS.length, levelNum + 1);
      
      // Update progress in database
      const updatedPlayer = await updatePlayerProgress(cleanUser, nextLevel);

      return NextResponse.json({
        success: true,
        correct: true,
        currentLevel: levelNum,
        nextLevel: nextLevel,
        isFinalLevel: levelNum === 15,
        player: updatedPlayer
      });
    }

    return NextResponse.json({
      success: true,
      correct: false,
      error: `[ERROR] Incorrect password token for Stage ${levelNum}. Try again.`
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
