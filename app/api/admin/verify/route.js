import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { adminSecret } = body;

    const expectedSecret = process.env.ADMIN_SECRET || 'admin123';

    if (!adminSecret || typeof adminSecret !== 'string') {
      return NextResponse.json({ success: false, error: 'Admin secret key is required' }, { status: 400 });
    }

    if (adminSecret.trim() !== expectedSecret.trim()) {
      return NextResponse.json({ success: false, error: 'Invalid admin secret key' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Admin authenticated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
