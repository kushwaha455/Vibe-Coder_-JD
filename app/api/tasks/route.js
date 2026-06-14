import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Task from '../../../lib/Task';
import { getTasks, saveTasks, newTaskId } from '../../../lib/mockData';

async function tryDb(callback, fallback) {
  try {
    await dbConnect();
    return await callback();
  } catch (error) {
    console.error('DB fallback used for tasks route:', error?.message || error);
    return await fallback(error);
  }
}

// GET: list tasks
export async function GET() {
  return tryDb(
    async () => {
      const tasks = await Task.find({});
      return NextResponse.json({ success: true, data: tasks });
    },
    async () => {
      const tasks = await getTasks();
      return NextResponse.json({ success: true, data: tasks });
    }
  );
}

// POST: create task
export async function POST(request) {
  const body = await request.json();

  return tryDb(
    async () => {
      const newTask = await Task.create(body);
      return NextResponse.json({ success: true, data: newTask }, { status: 201 });
    },
    async () => {
      const tasks = await getTasks();
      const newTask = { _id: newTaskId(tasks), ...body };
      tasks.push(newTask);
      await saveTasks(tasks);
      return NextResponse.json({ success: true, data: newTask }, { status: 201 });
    }
  );
}