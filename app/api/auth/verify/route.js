import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db';
import Employee from '../../../../lib/Employee';
import { getAuthUsers, saveAuthUsers } from '../../../../lib/mockData';

async function tryDb(callback, fallback) {
  try {
    await dbConnect();
    return await callback();
  } catch (error) {
    return await fallback(error);
  }
}

export async function POST(req) {
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ success: false, message: 'Missing email or otp' }, { status: 400 });

  const users = await getAuthUsers();
  const user = users.find((u) => String(u.email || '').toLowerCase() === String(email || '').toLowerCase());
  if (!user) return NextResponse.json({ success: false, message: 'No pending registration for this email' }, { status: 404 });
  if (user.verified) return NextResponse.json({ success: true, message: 'Already verified' });
  if (!user.otpHash || !user.otpExpires) return NextResponse.json({ success: false, message: 'OTP not found. Please request a new code.' }, { status: 400 });

  if (Date.now() > Number(user.otpExpires)) {
    return NextResponse.json({ success: false, message: 'OTP expired. Request a new one.' }, { status: 400 });
  }

  const ok = await bcrypt.compare(String(otp), String(user.otpHash));
  if (!ok) return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 401 });

  // mark verified in local store
  user.verified = true;
  delete user.otpHash;
  delete user.otpExpires;
  await saveAuthUsers(users);

  // Try to create a persistent DB user if DB is available
  return tryDb(
    async () => {
      const exists = await Employee.findOne({ email: user.email });
      if (!exists) {
        await Employee.create({ name: user.name, email: user.email, password: user.password });
      }
      return NextResponse.json({ success: true, message: 'Email verified and account created.' });
    },
    async () => {
      return NextResponse.json({ success: true, message: 'Email verified (local).' });
    }
  );
}
