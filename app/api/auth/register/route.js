import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Employee from "../../../../lib/Employee";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    // 1. Database se connect karein
    await connectDB();

    // 2. Frontend se aaya data nikaalein
    const { name, email, password } = await req.json();

    // Validation check
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Sabhi fields bharna zaroori hai" }, { status: 400 });
    }

    // 3. Check karein ki email pehle se register toh nahi hai
    const userExists = await Employee.findOne({ email });
    if (userExists) {
      return NextResponse.json({ success: false, message: "Yeh Email pehle se registered hai" }, { status: 400 });
    }

    // 4. Password ko secure (Hash) karein taaki database me password safe rahe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Database mein naya user create karein
    const newEmployee = await Employee.create({
      name,
      email,
      password: hashedPassword, // Hashed password save ho raha hai
    });

    return NextResponse.json({ success: true, message: "Account created successfully!" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}