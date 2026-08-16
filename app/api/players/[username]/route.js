import { NextResponse } from 'next/server';
import { getPlayer, updatePlayerProgress, updatePlayerInvigilation, deletePlayer } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, context) {
  try {
    const params = await context.params;
    const username = decodeURIComponent(params?.username || '').trim();
    const player = await getPlayer(username);
    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, player },
      { headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const username = decodeURIComponent(params?.username || '').trim();
    const body = await request.json();
    const { currentLevel, fullscreenExits, isDisqualified, action } = body;

    let player;
    if (action === 'invigilation' || fullscreenExits !== undefined || isDisqualified !== undefined) {
      player = await updatePlayerInvigilation(username, fullscreenExits ?? 0, isDisqualified ?? false);
    } else if (currentLevel !== undefined && currentLevel !== null && !isNaN(currentLevel)) {
      player = await updatePlayerProgress(username, Number(currentLevel));
    } else {
      return NextResponse.json({ success: false, error: 'Valid payload is required' }, { status: 400 });
    }

    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, player },
      { headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const username = decodeURIComponent(params?.username || '').trim();
    await deletePlayer(username);
    return NextResponse.json({ success: true, message: `Player ${username} deleted` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
