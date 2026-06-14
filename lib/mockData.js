import { readFile, writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const employeesFile = path.join(dataDir, 'employees.json');
const rootEmployeesFile = path.join(__dirname, '..', 'employees.json');
const tasksFile = path.join(dataDir, 'tasks.json');

const defaultEmployees = [
  {
    _id: '1',
    name: 'Ayesha Sharma',
    email: 'ayesha.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'Marketing Lead',
    department: 'Marketing',
    salary: 67000,
  },
  {
    _id: '2',
    name: 'Rohan Patel',
    email: 'rohan.patel@example.com',
    phone: '+91 91234 56789',
    role: 'Frontend Developer',
    department: 'Engineering',
    salary: 82000,
  },
];

const defaultTasks = [
  { _id: '1', title: 'Sample Task', description: 'Demo task', completed: false },
];

async function readJsonFile(filePath, defaultData) {
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to read data file:', filePath, error);
    }
    await saveJsonFile(filePath, defaultData);
    return [...defaultData];
  }
}

async function saveJsonFile(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function getEmployees() {
  try {
    await access(rootEmployeesFile);
    return await readJsonFile(rootEmployeesFile, defaultEmployees);
  } catch (error) {
    return await readJsonFile(employeesFile, defaultEmployees);
  }
}

async function getActiveEmployeesFile() {
  try {
    await access(rootEmployeesFile);
    return rootEmployeesFile;
  } catch (error) {
    return employeesFile;
  }
}

export async function saveEmployees(employees) {
  await saveJsonFile(await getActiveEmployeesFile(), employees);
}

export function newEmployeeId(employees) {
  const ids = employees.map((employee) => Number(employee._id) || 0);
  return String(Math.max(0, ...ids) + 1);
}

export async function getTasks() {
  return await readJsonFile(tasksFile, defaultTasks);
}

export async function saveTasks(tasks) {
  await saveJsonFile(tasksFile, tasks);
}

export function newTaskId(tasks) {
  const ids = tasks.map((task) => Number(task._id) || 0);
  return String(Math.max(0, ...ids) + 1);
}
