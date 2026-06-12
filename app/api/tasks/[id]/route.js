import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/lib/Task';

// PUT: Update task details or status
export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const body = await request.json();
    const updatedTask = await Task.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE: Remove task from DB
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    await Task.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Task Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}