import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Employee from '../../../../lib/Employee';
import { getEmployees, saveEmployees } from '../../../../lib/mockData';

async function tryDb(callback, fallback) {
  try {
    await dbConnect();
    return await callback();
  } catch (error) {
    console.error('DB fallback used for employee detail route:', error?.message || error);
    return await fallback(error);
  }
}

const normalizeId = (id) => {
  const value = String(id ?? '').trim();
  if (!value || value === 'undefined' || value === 'null') return null;
  return value;
};

export async function GET(request, context) {
  const params = await context.params;
  const id = normalizeId(params.id);
  if (!id) {
    return NextResponse.json({ success: false, error: 'Invalid employee ID' }, { status: 400 });
  }
  return tryDb(
    async () => {
      const emp = await Employee.findById(id);
      if (!emp) return await getFallbackEmployee(id);
      return NextResponse.json({ success: true, data: emp });
    },
    async () => await getFallbackEmployee(id)
  );
}

async function getFallbackEmployee(id) {
  const employees = await getEmployees();
  const emp = employees.find((e) => String(e._id) === String(id));
  if (!emp) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: emp });
}

export async function PUT(request, context) {
  const params = await context.params;
  const id = normalizeId(params.id);
  if (!id) {
    return NextResponse.json({ success: false, error: 'Invalid employee ID' }, { status: 400 });
  }
  const body = await request.json();

  return tryDb(
    async () => {
      const updated = await Employee.findByIdAndUpdate(id, body, { new: true });
      if (!updated) return await updateFallbackEmployee(id, body);
      return NextResponse.json({ success: true, data: updated });
    },
    async () => await updateFallbackEmployee(id, body)
  );
}

async function updateFallbackEmployee(id, body) {
  const employees = await getEmployees();
  const idx = employees.findIndex((e) => String(e._id) === String(id));
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
  }
  employees[idx] = { ...employees[idx], ...body };
  await saveEmployees(employees);
  return NextResponse.json({ success: true, data: employees[idx] });
}

export async function DELETE(request, context) {
  const params = await context.params;
  const id = normalizeId(params.id);
  if (!id) {
    return NextResponse.json({ success: false, error: 'Invalid employee ID' }, { status: 400 });
  }
  return tryDb(
    async () => {
      const deleted = await Employee.findByIdAndDelete(id);
      if (!deleted) return await deleteFallbackEmployee(id);
      return NextResponse.json({ success: true, message: 'Employee deleted' });
    },
    async () => await deleteFallbackEmployee(id)
  );
}

async function deleteFallbackEmployee(id) {
  const employees = await getEmployees();
  const idx = employees.findIndex((e) => String(e._id) === String(id));
  if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  employees.splice(idx, 1);
  await saveEmployees(employees);
  return NextResponse.json({ success: true, message: 'Employee deleted' });
}
