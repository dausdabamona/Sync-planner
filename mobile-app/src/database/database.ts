import * as SQLite from 'expo-sqlite';
import { getToday, getCurrentHour } from '../utils/helpers';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('syncplanner.db');
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      done INTEGER DEFAULT 0,
      status TEXT DEFAULT 'todo',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      why TEXT DEFAULT '',
      progress INTEGER DEFAULT 0,
      milestones TEXT DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sholat (
      date TEXT NOT NULL,
      sholat_id TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      PRIMARY KEY (date, sholat_id)
    );

    CREATE TABLE IF NOT EXISTS dzikir (
      date TEXT NOT NULL,
      time_period TEXT NOT NULL,
      dzikir_id TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      PRIMARY KEY (date, time_period, dzikir_id)
    );

    CREATE TABLE IF NOT EXISTS habits (
      date TEXT NOT NULL,
      habit_id TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      PRIMARY KEY (date, habit_id)
    );

    CREATE TABLE IF NOT EXISTS journal (
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      focus TEXT DEFAULT '',
      gratitude TEXT DEFAULT '',
      affirmation TEXT DEFAULT '',
      wins TEXT DEFAULT '',
      improve TEXT DEFAULT '',
      lesson TEXT DEFAULT '',
      PRIMARY KEY (date, type)
    );

    CREATE TABLE IF NOT EXISTS pomodoro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS braindump (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dontlist (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vision (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS review (
      date TEXT PRIMARY KEY,
      wins TEXT DEFAULT '',
      challenges TEXT DEFAULT '',
      lessons TEXT DEFAULT '',
      next_week TEXT DEFAULT '',
      rating INTEGER DEFAULT 0
    );
  `);

  // Initialize vision defaults
  const visionCount = await database.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM vision');
  if (visionCount && visionCount.cnt === 0) {
    await database.execAsync(`
      INSERT OR IGNORE INTO vision (key, value) VALUES ('year10', '');
      INSERT OR IGNORE INTO vision (key, value) VALUES ('year3', '');
      INSERT OR IGNORE INTO vision (key, value) VALUES ('year1', '');
    `);
  }
}

// ==================== TASKS ====================
export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
  status: 'backlog' | 'todo' | 'progress' | 'done';
  created_at: string;
}

export async function getTasks(): Promise<Task[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM tasks ORDER BY created_at DESC');
  return rows.map(r => ({ ...r, done: !!r.done }));
}

export async function addTask(task: Omit<Task, 'done'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO tasks (id, title, priority, done, status, created_at) VALUES (?, ?, ?, 0, ?, ?)',
    task.id, task.title, task.priority, task.status, task.created_at
  );
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const db = await getDatabase();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.title !== undefined) { sets.push('title = ?'); vals.push(updates.title); }
  if (updates.priority !== undefined) { sets.push('priority = ?'); vals.push(updates.priority); }
  if (updates.done !== undefined) { sets.push('done = ?'); vals.push(updates.done ? 1 : 0); }
  if (updates.status !== undefined) { sets.push('status = ?'); vals.push(updates.status); }
  if (sets.length === 0) return;
  vals.push(id);
  await db.runAsync(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, ...vals);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', id);
}

// ==================== GOALS ====================
export interface Goal {
  id: string;
  title: string;
  why: string;
  progress: number;
  milestones: string;
  created_at: string;
}

export async function getGoals(): Promise<Goal[]> {
  const db = await getDatabase();
  return db.getAllAsync<Goal>('SELECT * FROM goals ORDER BY created_at DESC');
}

export async function addGoal(goal: Goal): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO goals (id, title, why, progress, milestones, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    goal.id, goal.title, goal.why, goal.progress, goal.milestones, goal.created_at
  );
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
  const db = await getDatabase();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.title !== undefined) { sets.push('title = ?'); vals.push(updates.title); }
  if (updates.why !== undefined) { sets.push('why = ?'); vals.push(updates.why); }
  if (updates.progress !== undefined) { sets.push('progress = ?'); vals.push(updates.progress); }
  if (updates.milestones !== undefined) { sets.push('milestones = ?'); vals.push(updates.milestones); }
  if (sets.length === 0) return;
  vals.push(id);
  await db.runAsync(`UPDATE goals SET ${sets.join(', ')} WHERE id = ?`, ...vals);
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM goals WHERE id = ?', id);
}

// ==================== SHOLAT ====================
export async function getSholatToday(): Promise<Record<string, boolean>> {
  const db = await getDatabase();
  const today = getToday();
  const rows = await db.getAllAsync<{ sholat_id: string; done: number }>(
    'SELECT sholat_id, done FROM sholat WHERE date = ?', today
  );
  const result: Record<string, boolean> = {};
  rows.forEach(r => { result[r.sholat_id] = !!r.done; });
  return result;
}

export async function toggleSholat(sholatId: string): Promise<void> {
  const db = await getDatabase();
  const today = getToday();
  const existing = await db.getFirstAsync<{ done: number }>(
    'SELECT done FROM sholat WHERE date = ? AND sholat_id = ?', today, sholatId
  );
  if (existing) {
    await db.runAsync(
      'UPDATE sholat SET done = ? WHERE date = ? AND sholat_id = ?',
      existing.done ? 0 : 1, today, sholatId
    );
  } else {
    await db.runAsync(
      'INSERT INTO sholat (date, sholat_id, done) VALUES (?, ?, 1)',
      today, sholatId
    );
  }
}

// ==================== DZIKIR ====================
export async function getDzikirToday(): Promise<Record<string, number>> {
  const db = await getDatabase();
  const today = getToday();
  const hour = getCurrentHour();
  const period = hour < 12 ? 'pagi' : 'sore';
  const rows = await db.getAllAsync<{ dzikir_id: string; count: number }>(
    'SELECT dzikir_id, count FROM dzikir WHERE date = ? AND time_period = ?', today, period
  );
  const result: Record<string, number> = {};
  rows.forEach(r => { result[r.dzikir_id] = r.count; });
  return result;
}

export async function updateDzikirCount(dzikirId: string, count: number): Promise<void> {
  const db = await getDatabase();
  const today = getToday();
  const hour = getCurrentHour();
  const period = hour < 12 ? 'pagi' : 'sore';
  const existing = await db.getFirstAsync(
    'SELECT count FROM dzikir WHERE date = ? AND time_period = ? AND dzikir_id = ?',
    today, period, dzikirId
  );
  if (existing) {
    await db.runAsync(
      'UPDATE dzikir SET count = ? WHERE date = ? AND time_period = ? AND dzikir_id = ?',
      count, today, period, dzikirId
    );
  } else {
    await db.runAsync(
      'INSERT INTO dzikir (date, time_period, dzikir_id, count) VALUES (?, ?, ?, ?)',
      today, period, dzikirId, count
    );
  }
}

// ==================== HABITS ====================
export async function getHabitsToday(): Promise<Record<string, boolean>> {
  const db = await getDatabase();
  const today = getToday();
  const rows = await db.getAllAsync<{ habit_id: string; done: number }>(
    'SELECT habit_id, done FROM habits WHERE date = ?', today
  );
  const result: Record<string, boolean> = {};
  rows.forEach(r => { result[r.habit_id] = !!r.done; });
  return result;
}

export async function toggleHabit(habitId: string): Promise<void> {
  const db = await getDatabase();
  const today = getToday();
  const existing = await db.getFirstAsync<{ done: number }>(
    'SELECT done FROM habits WHERE date = ? AND habit_id = ?', today, habitId
  );
  if (existing) {
    await db.runAsync(
      'UPDATE habits SET done = ? WHERE date = ? AND habit_id = ?',
      existing.done ? 0 : 1, today, habitId
    );
  } else {
    await db.runAsync(
      'INSERT INTO habits (date, habit_id, done) VALUES (?, ?, 1)',
      today, habitId
    );
  }
}

// ==================== JOURNAL ====================
export interface JournalEntry {
  morning: { focus: string; gratitude: string; affirmation: string } | null;
  evening: { wins: string; improve: string; lesson: string } | null;
}

export async function getJournalToday(): Promise<JournalEntry> {
  const db = await getDatabase();
  const today = getToday();
  const rows = await db.getAllAsync<any>('SELECT * FROM journal WHERE date = ?', today);
  const result: JournalEntry = { morning: null, evening: null };
  rows.forEach(r => {
    if (r.type === 'morning') {
      result.morning = { focus: r.focus, gratitude: r.gratitude, affirmation: r.affirmation };
    } else if (r.type === 'evening') {
      result.evening = { wins: r.wins, improve: r.improve, lesson: r.lesson };
    }
  });
  return result;
}

export async function saveJournalMorning(data: { focus: string; gratitude: string; affirmation: string }): Promise<void> {
  const db = await getDatabase();
  const today = getToday();
  await db.runAsync(
    `INSERT OR REPLACE INTO journal (date, type, focus, gratitude, affirmation) VALUES (?, 'morning', ?, ?, ?)`,
    today, data.focus, data.gratitude, data.affirmation
  );
}

export async function saveJournalEvening(data: { wins: string; improve: string; lesson: string }): Promise<void> {
  const db = await getDatabase();
  const today = getToday();
  await db.runAsync(
    `INSERT OR REPLACE INTO journal (date, type, wins, improve, lesson) VALUES (?, 'evening', ?, ?, ?)`,
    today, data.wins, data.improve, data.lesson
  );
}

// ==================== POMODORO ====================
export interface PomodoroStats {
  today: number;
  total: number;
  streak: number;
}

export async function getPomodoroStats(): Promise<PomodoroStats> {
  const db = await getDatabase();
  const today = getToday();
  const row = await db.getFirstAsync<any>('SELECT * FROM pomodoro WHERE date = ?', today);
  if (row) return { today: row.count, total: row.total, streak: row.streak };
  const lastRow = await db.getFirstAsync<any>('SELECT * FROM pomodoro ORDER BY date DESC LIMIT 1');
  return { today: 0, total: lastRow?.total || 0, streak: lastRow?.streak || 0 };
}

export async function incrementPomodoro(): Promise<PomodoroStats> {
  const db = await getDatabase();
  const today = getToday();
  const existing = await db.getFirstAsync<any>('SELECT * FROM pomodoro WHERE date = ?', today);
  if (existing) {
    const newCount = existing.count + 1;
    const newTotal = existing.total + 1;
    await db.runAsync(
      'UPDATE pomodoro SET count = ?, total = ? WHERE date = ?',
      newCount, newTotal, today
    );
    return { today: newCount, total: newTotal, streak: existing.streak };
  } else {
    const lastRow = await db.getFirstAsync<any>('SELECT * FROM pomodoro ORDER BY date DESC LIMIT 1');
    const newTotal = (lastRow?.total || 0) + 1;
    const newStreak = (lastRow?.streak || 0) + 1;
    await db.runAsync(
      'INSERT INTO pomodoro (date, count, total, streak) VALUES (?, 1, ?, ?)',
      today, newTotal, newStreak
    );
    return { today: 1, total: newTotal, streak: newStreak };
  }
}

// ==================== BRAIN DUMP ====================
export interface BrainDumpItem {
  id: string;
  text: string;
  created_at: string;
}

export async function getBrainDumps(): Promise<BrainDumpItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<BrainDumpItem>('SELECT * FROM braindump ORDER BY created_at DESC');
}

export async function addBrainDump(item: BrainDumpItem): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT INTO braindump (id, text, created_at) VALUES (?, ?, ?)', item.id, item.text, item.created_at);
}

export async function deleteBrainDump(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM braindump WHERE id = ?', id);
}

// ==================== DONT LIST ====================
export async function getDontList(): Promise<BrainDumpItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<BrainDumpItem>('SELECT * FROM dontlist ORDER BY created_at DESC');
}

export async function addDontItem(item: BrainDumpItem): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT INTO dontlist (id, text, created_at) VALUES (?, ?, ?)', item.id, item.text, item.created_at);
}

export async function deleteDontItem(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM dontlist WHERE id = ?', id);
}

// ==================== VISION ====================
export async function getVision(): Promise<{ year10: string; year3: string; year1: string }> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT * FROM vision');
  const result = { year10: '', year3: '', year1: '' };
  rows.forEach(r => {
    if (r.key in result) (result as any)[r.key] = r.value;
  });
  return result;
}

export async function saveVision(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO vision (key, value) VALUES (?, ?)', key, value);
}

// ==================== REVIEW ====================
export interface WeeklyReview {
  date: string;
  wins: string;
  challenges: string;
  lessons: string;
  next_week: string;
  rating: number;
}

export async function getReview(date: string): Promise<WeeklyReview | null> {
  const db = await getDatabase();
  return db.getFirstAsync<WeeklyReview>('SELECT * FROM review WHERE date = ?', date);
}

export async function saveReview(review: WeeklyReview): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO review (date, wins, challenges, lessons, next_week, rating) VALUES (?, ?, ?, ?, ?, ?)',
    review.date, review.wins, review.challenges, review.lessons, review.next_week, review.rating
  );
}

// ==================== SETTINGS ====================
export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? defaultValue;
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}

// ==================== EXPORT / IMPORT ====================
export async function exportAllData(): Promise<string> {
  const db = await getDatabase();
  const tables = ['tasks', 'goals', 'sholat', 'dzikir', 'habits', 'journal', 'pomodoro', 'braindump', 'dontlist', 'vision', 'review', 'settings'];
  const data: Record<string, any[]> = {};
  for (const table of tables) {
    data[table] = await db.getAllAsync(`SELECT * FROM ${table}`);
  }
  return JSON.stringify(data, null, 2);
}

export async function importAllData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);
  const db = await getDatabase();

  await db.execAsync('BEGIN TRANSACTION');
  try {
    // Clear existing data
    const tables = ['tasks', 'goals', 'sholat', 'dzikir', 'habits', 'journal', 'pomodoro', 'braindump', 'dontlist', 'vision', 'review', 'settings'];
    for (const table of tables) {
      await db.execAsync(`DELETE FROM ${table}`);
    }

    // Import tasks
    if (data.tasks) {
      for (const t of data.tasks) {
        await db.runAsync('INSERT INTO tasks (id, title, priority, done, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          t.id, t.title, t.priority, t.done, t.status, t.created_at);
      }
    }

    // Import goals
    if (data.goals) {
      for (const g of data.goals) {
        await db.runAsync('INSERT INTO goals (id, title, why, progress, milestones, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          g.id, g.title, g.why, g.progress, g.milestones, g.created_at);
      }
    }

    // Import sholat
    if (data.sholat) {
      for (const s of data.sholat) {
        await db.runAsync('INSERT INTO sholat (date, sholat_id, done) VALUES (?, ?, ?)', s.date, s.sholat_id, s.done);
      }
    }

    // Import dzikir
    if (data.dzikir) {
      for (const d of data.dzikir) {
        await db.runAsync('INSERT INTO dzikir (date, time_period, dzikir_id, count) VALUES (?, ?, ?, ?)',
          d.date, d.time_period, d.dzikir_id, d.count);
      }
    }

    // Import habits
    if (data.habits) {
      for (const h of data.habits) {
        await db.runAsync('INSERT INTO habits (date, habit_id, done) VALUES (?, ?, ?)', h.date, h.habit_id, h.done);
      }
    }

    // Import journal
    if (data.journal) {
      for (const j of data.journal) {
        await db.runAsync('INSERT INTO journal (date, type, focus, gratitude, affirmation, wins, improve, lesson) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          j.date, j.type, j.focus, j.gratitude, j.affirmation, j.wins, j.improve, j.lesson);
      }
    }

    // Import pomodoro
    if (data.pomodoro) {
      for (const p of data.pomodoro) {
        await db.runAsync('INSERT INTO pomodoro (date, count, total, streak) VALUES (?, ?, ?, ?)',
          p.date, p.count, p.total, p.streak);
      }
    }

    // Import braindump
    if (data.braindump) {
      for (const b of data.braindump) {
        await db.runAsync('INSERT INTO braindump (id, text, created_at) VALUES (?, ?, ?)', b.id, b.text, b.created_at);
      }
    }

    // Import dontlist
    if (data.dontlist) {
      for (const d of data.dontlist) {
        await db.runAsync('INSERT INTO dontlist (id, text, created_at) VALUES (?, ?, ?)', d.id, d.text, d.created_at);
      }
    }

    // Import vision
    if (data.vision) {
      for (const v of data.vision) {
        await db.runAsync('INSERT INTO vision (key, value) VALUES (?, ?)', v.key, v.value);
      }
    }

    // Import review
    if (data.review) {
      for (const r of data.review) {
        await db.runAsync('INSERT INTO review (date, wins, challenges, lessons, next_week, rating) VALUES (?, ?, ?, ?, ?, ?)',
          r.date, r.wins, r.challenges, r.lessons, r.next_week, r.rating);
      }
    }

    // Import settings
    if (data.settings) {
      for (const s of data.settings) {
        await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', s.key, s.value);
      }
    }

    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
}

export async function clearAllData(): Promise<void> {
  const db = await getDatabase();
  const tables = ['tasks', 'goals', 'sholat', 'dzikir', 'habits', 'journal', 'pomodoro', 'braindump', 'dontlist', 'vision', 'review', 'settings'];
  for (const table of tables) {
    await db.execAsync(`DELETE FROM ${table}`);
  }
}
