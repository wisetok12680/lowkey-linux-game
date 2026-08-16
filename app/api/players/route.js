import { NextResponse } from 'next/server';
import { getAllPlayers, createOrLoginPlayer } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const players = await getAllPlayers();
    return NextResponse.json(
      { success: true, players },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, teamName, password } = body;

    const targetUser = username || teamName;

    if (!targetUser || typeof targetUser !== 'string' || !targetUser.trim()) {
      return NextResponse.json({ success: false, error: 'Team name is required' }, { status: 400 });
    }

    const trimmedUser = targetUser.trim();
    if (trimmedUser.length < 2 || trimmedUser.length > 30) {
      return NextResponse.json({ success: false, error: 'Team name must be between 2 and 30 characters' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return NextResponse.json({ success: false, error: 'Team password is required' }, { status: 400 });
    }

    const trimmedPass = password.trim();
    if (trimmedPass.length < 3 || trimmedPass.length > 50) {
      return NextResponse.json({ success: false, error: 'Password must be at least 3 characters long' }, { status: 400 });
    }

    const player = await createOrLoginPlayer(trimmedUser, teamName || trimmedUser, trimmedPass);

    const response = NextResponse.json({ success: true, player });
    
    // Set HTTP Cookie for browser session persistence (30 days)
    response.cookies.set('lowkey_team_auth', JSON.stringify({
      username: player.username,
      team_name: player.team_name
    }), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      httpOnly: false
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
