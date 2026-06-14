import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Employee from '../../../lib/Employee';
import { getEmployees } from '../../../lib/mockData';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizePassword(password) {
  return String(password || '').trim();
}

function passwordMatches(user, password) {
  const trimmed = normalizePassword(password);
  if (trimmed.toLowerCase() === 'password') return true;
  return Boolean(user.password && user.password === trimmed);
}

function toPlainUser(user) {
  if (!user) return null;
  if (typeof user.toObject === 'function') return user.toObject();
  return { ...user };
}

function authSuccess(user) {
  const token = 'demo-token-' + Date.now();
  return NextResponse.json({ success: true, token, user: toPlainUser(user) });
}

async function findUserInMockData(email) {
  const employees = await getEmployees();
  const normalized = normalizeEmail(email);
  return employees.find((employee) => normalizeEmail(employee.email) === normalized) || null;
}

async function findUserInDb(email) {
  await dbConnect();
  const normalized = normalizeEmail(email);
  const employees = await Employee.find({}).lean();
  return employees.find((employee) => normalizeEmail(employee.email) === normalized) || null;
}

async function findUser(email) {
  const mockUser = await findUserInMockData(email);
  if (mockUser) return mockUser;

  try {
    return await findUserInDb(email);
  } catch (error) {
    console.error('DB lookup failed for auth:', error?.message || error);
    return null;
  }
}

export async function POST(request) {
  const body = await request.json();
  const email = normalizeEmail(body?.email);
  const password = normalizePassword(body?.password);

  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Missing email or password' }, { status: 400 });
  }

  const user = await findUser(email);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Invalid credentials. Use an employee email with password "password".' },
      { status: 401 }
    );
  }

  if (!passwordMatches(user, password)) {
    return NextResponse.json(
      { success: false, error: 'Invalid credentials. Demo password is "password".' },
      { status: 401 }
    );
  }

  return authSuccess(user);
}
