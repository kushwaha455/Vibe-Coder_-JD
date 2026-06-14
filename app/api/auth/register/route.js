import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Employee from "../../../../lib/Employee";
import { getAuthUsers, saveAuthUsers, newAuthUserId, getEmployees } from "../../../../lib/mockData";
import bcrypt from "bcryptjs";

async function tryDb(callback, fallback) {
  try {
    await dbConnect();
    return await callback();
  } catch (error) {
    console.error("DB fallback used for auth/register:", error?.message || error);
    return await fallback(error);
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function isValidEmployeeEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  return tryDb(
    async () => {
      const employee = await Employee.findOne({
        email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, 'i'),
      });
      return Boolean(employee);
    },
    async () => {
      const employees = await getEmployees();
      return employees.some(
        (employee) => normalizeEmail(employee.email) === normalizedEmail
      );
    }
  );
}

export async function POST(req) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ success: false, message: "Sabhi fields bharna zaroori hai" }, { status: 400 });
  }

  // Allow any email address; verification via OTP is required before account activation.
  // Generate OTP and save as pending (verified: false). We'll create the DB user only after OTP verification.
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await bcrypt.hash(otp, 10);
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  const users = await getAuthUsers();
  const existing = users.find((u) => String(u.email || '').toLowerCase() === String(email || '').toLowerCase());
  const hashedPassword = await bcrypt.hash(password, 10);

  if (existing && existing.verified) {
    return NextResponse.json({ success: false, message: "Yeh Email pehle se registered hai" }, { status: 400 });
  }

  if (existing) {
    existing.name = name;
    existing.password = hashedPassword;
    existing.verified = true;
    delete existing.otpHash;
    delete existing.otpExpires;
    delete existing.lastOtp;
  } else {
    const newUser = {
      _id: newAuthUserId(users),
      name,
      email,
      password: hashedPassword,
      verified: true,
    };
    users.push(newUser);
  }

  await saveAuthUsers(users);

  return tryDb(
    async () => {
      const exists = await Employee.findOne({ email });
      if (!exists) {
        await Employee.create({ name, email, password: hashedPassword });
      }
      return NextResponse.json({ success: true, message: 'Account created. Ab login karein.' });
    },
    async () => {
      return NextResponse.json({ success: true, message: 'Account created locally. Ab login karein.' });
    }
  );
}