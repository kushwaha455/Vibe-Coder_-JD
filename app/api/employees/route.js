import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Employee from '../../../lib/Employee';
import { getEmployees, saveEmployees, newEmployeeId } from '../../../lib/mockData';

async function tryDb(callback, fallback) {
  try {
    await dbConnect();
    return await callback();
  } catch (error) {
    console.error('DB fallback used for employees route:', error?.message || error);
    return await fallback(error);
  }
}

export async function GET() {
  return tryDb(
    async () => {
      const employees = await Employee.find({});
      return NextResponse.json({ success: true, data: employees });
    },
    async () => {
      const employees = await getEmployees();
      return NextResponse.json({ success: true, data: employees });
    }
  );
}

// Naya Employee add karne ke liye (POST)
export async function POST(request) {
  const body = await request.json();

  return tryDb(
    async () => {
      const newEmployee = await Employee.create(body);
      return NextResponse.json({ success: true, data: newEmployee }, { status: 201 });
    },
    async () => {
      const employees = await getEmployees();
      const newEmployee = { _id: newEmployeeId(employees), ...body };
      employees.push(newEmployee);
      await saveEmployees(employees);
      return NextResponse.json({ success: true, data: newEmployee }, { status: 201 });
    }
  );
}