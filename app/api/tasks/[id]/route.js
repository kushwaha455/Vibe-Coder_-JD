import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Task from '../../../../lib/Task';
import { getTasks, saveTasks } from '../../../../lib/mockData';

async function tryDb(callback, fallback) {
  try {
    await dbConnect();
    return await callback();
  } catch (error) {
    console.error('DB fallback used for task detail route:', error?.message || error);
    return await fallback(error);
  }
}

export async function GET(request, context) {
  const { id } = await context.params;
  return tryDb(
    async () => {
      const task = await Task.findById(id);
      if (!task) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: task });
    },
    async () => {
      const tasks = await getTasks();
      const task = tasks.find((t) => t._id === id);
      if (!task) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: task });
    }
  );
}

export async function PUT(request, context) {
  const { id } = await context.params;
  const body = await request.json();

  return tryDb(
    async () => {
      const updated = await Task.findByIdAndUpdate(id, body, { new: true });
      if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: updated });
    },
    async () => {
      const tasks = await getTasks();
      const idx = tasks.findIndex((t) => t._id === id);
      if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      tasks[idx] = { ...tasks[idx], ...body };
      await saveTasks(tasks);
      return NextResponse.json({ success: true, data: tasks[idx] });
    }
  );
}

export async function DELETE(request, context) {
  const { id } = await context.params;
  return tryDb(
    async () => {
      const deleted = await Task.findByIdAndDelete(id);
      if (!deleted) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Task Deleted' });
    },
    async () => {
      const tasks = await getTasks();
      const idx = tasks.findIndex((t) => t._id === id);
      if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      tasks.splice(idx, 1);
      await saveTasks(tasks);
      return NextResponse.json({ success: true, message: 'Task Deleted' });
    }
  );
}
