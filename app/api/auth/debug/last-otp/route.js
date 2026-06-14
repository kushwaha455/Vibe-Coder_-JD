import { NextResponse } from 'next/server';
import { getAuthUsers } from '../../../../../lib/mockData';

export async function POST(req) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, message: 'Not allowed in production' }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ success: false, message: 'Missing email' }, { status: 400 });

  const users = await getAuthUsers();
  const user = users.find((u) => String(u.email || '').toLowerCase() === String(email || '').toLowerCase());
  if (!user) return NextResponse.json({ success: false, message: 'No pending user for that email' }, { status: 404 });

  const otp = user.lastOtp || null;
  return NextResponse.json({ success: true, otp });
}
