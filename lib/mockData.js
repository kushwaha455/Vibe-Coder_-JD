import { readFile, writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const tmpDataDir = path.join(os.tmpdir(), 'vibe-task-manager-data');
const employeesFile = path.join(dataDir, 'employees.json');
const rootEmployeesFile = path.join(__dirname, '..', 'employees.json');
const authUsersFile = path.join(dataDir, 'auth-users.json');
const rootAuthUsersFile = path.join(__dirname, '..', 'auth-users.json');
const tasksFile = path.join(dataDir, 'tasks.json');
const tempEmployeesFile = path.join(tmpDataDir, 'employees.json');
const tempAuthUsersFile = path.join(tmpDataDir, 'auth-users.json');
const tempTasksFile = path.join(tmpDataDir, 'tasks.json');

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

const defaultAuthUsers = [];

const defaultTasks = [
  { _id: '1', title: 'Sample Task', description: 'Demo task', completed: false },
];

function fallbackFilePath(filePath) {
  if (filePath === rootEmployeesFile || filePath === employeesFile) return tempEmployeesFile;
  if (filePath === rootAuthUsersFile || filePath === authUsersFile) return tempAuthUsersFile;
  if (filePath === tasksFile) return tempTasksFile;
  return filePath;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

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
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    if (['EACCES', 'EPERM', 'EROFS'].includes(error?.code)) {
      const fallback = fallbackFilePath(filePath);
      await mkdir(path.dirname(fallback), { recursive: true });
      await writeFile(fallback, JSON.stringify(data, null, 2), 'utf8');
      return;
    }
    throw error;
  }
}

export async function getEmployees() {
  if (await fileExists(rootEmployeesFile)) {
    return await readJsonFile(rootEmployeesFile, defaultEmployees);
  }
  if (await fileExists(employeesFile)) {
    return await readJsonFile(employeesFile, defaultEmployees);
  }
  if (await fileExists(tempEmployeesFile)) {
    return await readJsonFile(tempEmployeesFile, defaultEmployees);
  }
  return await readJsonFile(employeesFile, defaultEmployees);
}

export async function getAuthUsers() {
  if (await fileExists(rootAuthUsersFile)) {
    return await readJsonFile(rootAuthUsersFile, defaultAuthUsers);
  }
  if (await fileExists(authUsersFile)) {
    return await readJsonFile(authUsersFile, defaultAuthUsers);
  }
  if (await fileExists(tempAuthUsersFile)) {
    return await readJsonFile(tempAuthUsersFile, defaultAuthUsers);
  }
  return await readJsonFile(authUsersFile, defaultAuthUsers);
}

async function getActiveEmployeesFile() {
  if (await fileExists(rootEmployeesFile)) {
    return rootEmployeesFile;
  }
  if (await fileExists(employeesFile)) {
    return employeesFile;
  }
  if (await fileExists(tempEmployeesFile)) {
    return tempEmployeesFile;
  }
  return employeesFile;
}

async function getAuthUsersFile() {
  if (await fileExists(rootAuthUsersFile)) {
    return rootAuthUsersFile;
  }
  if (await fileExists(authUsersFile)) {
    return authUsersFile;
  }
  if (await fileExists(tempAuthUsersFile)) {
    return tempAuthUsersFile;
  }
  return authUsersFile;
}

export async function saveEmployees(employees) {
  await saveJsonFile(await getActiveEmployeesFile(), employees);
}

export async function saveAuthUsers(users) {
  await saveJsonFile(await getAuthUsersFile(), users);
}

export function newEmployeeId(employees) {
  const ids = employees.map((employee) => Number(employee._id) || 0);
  return String(Math.max(0, ...ids) + 1);
}

export function newAuthUserId(users) {
  const ids = users.map((user) => Number(user._id) || 0);
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
