import * as SQLite from 'expo-sqlite';
import { getToday, getCurrentHour, getWeekStart, getQuarter, getMonth } from '../utils/helpers';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('syncplanner_v2.db');
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- ============================================
    -- CASCADING GOAL SYSTEM
    -- ============================================

    -- Level 1: Quarterly Targets (OKR style)
    CREATE TABLE IF NOT EXISTS quarterly_targets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      quarter TEXT NOT NULL,
      vision_area TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    -- Key Results for each quarterly target
    CREATE TABLE IF NOT EXISTS key_results (
      id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      title TEXT NOT NULL,
      metric TEXT DEFAULT '',
      current_value REAL DEFAULT 0,
      target_value REAL DEFAULT 100,
      unit TEXT DEFAULT '%',
      FOREIGN KEY (target_id) REFERENCES quarterly_targets(id) ON DELETE CASCADE
    );

    -- Level 2: Monthly Milestones
    CREATE TABLE IF NOT EXISTS monthly_milestones (
      id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      month TEXT NOT NULL,
      definition_of_done TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      progress INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (target_id) REFERENCES quarterly_targets(id) ON DELETE CASCADE
    );

    -- Level 3: Weekly Sprints
    CREATE TABLE IF NOT EXISTS weekly_sprints (
      id TEXT PRIMARY KEY,
      milestone_id TEXT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      week_start TEXT NOT NULL,
      status TEXT DEFAULT 'planned',
      created_at TEXT NOT NULL,
      FOREIGN KEY (milestone_id) REFERENCES monthly_milestones(id) ON DELETE SET NULL
    );

    -- Level 4: Daily Actions
    CREATE TABLE IF NOT EXISTS daily_actions (
      id TEXT PRIMARY KEY,
      sprint_id TEXT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      pomodoro_count INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (sprint_id) REFERENCES weekly_sprints(id) ON DELETE SET NULL
    );

    -- Standalone Tasks (not linked to cascade, for quick tasks)
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      done INTEGER DEFAULT 0,
      status TEXT DEFAULT 'todo',
      created_at TEXT NOT NULL
    );

    -- ============================================
    -- MULTI-LEVEL REVIEWS
    -- ============================================
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      period TEXT NOT NULL,
      wins TEXT DEFAULT '',
      challenges TEXT DEFAULT '',
      lessons TEXT DEFAULT '',
      adjustments TEXT DEFAULT '',
      next_plan TEXT DEFAULT '',
      rating INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      UNIQUE(type, period)
    );

    -- ============================================
    -- DAILY SPIRITUAL TRACKERS (retained)
    -- ============================================
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

    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      action_id TEXT,
      duration_min INTEGER DEFAULT 25,
      completed INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (action_id) REFERENCES daily_actions(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS pomodoro_stats (
      date TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0
    );

    -- ============================================
    -- SUPPORTING FEATURES (retained)
    -- ============================================
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

// ============================================================
// TYPES
// ============================================================

export interface QuarterlyTarget {
  id: string;
  title: string;
  description: string;
  quarter: string;
  vision_area: string;
  status: string;
  created_at: string;
  progress?: number; // calculated
  key_results?: KeyResult[];
}

export interface KeyResult {
  id: string;
  target_id: string;
  title: string;
  metric: string;
  current_value: number;
  target_value: number;
  unit: string;
}

export interface MonthlyMilestone {
  id: string;
  target_id: string;
  title: string;
  description: string;
  month: string;
  definition_of_done: string;
  status: string;
  progress: number;
  created_at: string;
  target_title?: string; // joined
}

export interface WeeklySprint {
  id: string;
  milestone_id: string | null;
  title: string;
  description: string;
  week_start: string;
  status: string;
  created_at: string;
  milestone_title?: string; // joined
  actions_total?: number;
  actions_done?: number;
}

export interface DailyAction {
  id: string;
  sprint_id: string | null;
  title: string;
  date: string;
  done: boolean;
  priority: string;
  pomodoro_count: number;
  notes: string;
  created_at: string;
  sprint_title?: string; // joined
}

export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
  status: 'backlog' | 'todo' | 'progress' | 'done';
  created_at: string;
}

export interface Review {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  period: string;
  wins: string;
  challenges: string;
  lessons: string;
  adjustments: string;
  next_plan: string;
  rating: number;
  created_at: string;
}

export interface JournalEntry {
  morning: { focus: string; gratitude: string; affirmation: string } | null;
  evening: { wins: string; improve: string; lesson: string } | null;
}

export interface PomodoroStats {
  today: number;
  total: number;
  streak: number;
}

export interface BrainDumpItem {
  id: string;
  text: string;
  created_at: string;
}

// ============================================================
// QUARTERLY TARGETS
// ============================================================

export async function getQuarterlyTargets(quarter?: string): Promise<QuarterlyTarget[]> {
  const db = await getDatabase();
  const q = quarter || getQuarter();
  const targets = await db.getAllAsync<QuarterlyTarget>(
    'SELECT * FROM quarterly_targets WHERE quarter = ? AND status = ? ORDER BY created_at',
    q, 'active'
  );

  for (const target of targets) {
    target.key_results = await db.getAllAsync<KeyResult>(
      'SELECT * FROM key_results WHERE target_id = ?', target.id
    );
    // Calculate progress from key results
    if (target.key_results.length > 0) {
      const totalProgress = target.key_results.reduce((sum, kr) => {
        return sum + Math.min(100, (kr.current_value / kr.target_value) * 100);
      }, 0);
      target.progress = Math.round(totalProgress / target.key_results.length);
    } else {
      // Calculate from milestones
      const milestones = await db.getAllAsync<{ progress: number }>(
        'SELECT progress FROM monthly_milestones WHERE target_id = ?', target.id
      );
      target.progress = milestones.length > 0
        ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length)
        : 0;
    }
  }
  return targets;
}

export async function addQuarterlyTarget(target: Omit<QuarterlyTarget, 'progress' | 'key_results'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO quarterly_targets (id, title, description, quarter, vision_area, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    target.id, target.title, target.description, target.quarter, target.vision_area, target.status, target.created_at
  );
}

export async function updateQuarterlyTarget(id: string, updates: Partial<QuarterlyTarget>): Promise<void> {
  const db = await getDatabase();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.title !== undefined) { sets.push('title = ?'); vals.push(updates.title); }
  if (updates.description !== undefined) { sets.push('description = ?'); vals.push(updates.description); }
  if (updates.status !== undefined) { sets.push('status = ?'); vals.push(updates.status); }
  if (updates.vision_area !== undefined) { sets.push('vision_area = ?'); vals.push(updates.vision_area); }
  if (sets.length === 0) return;
  vals.push(id);
  await db.runAsync(`UPDATE quarterly_targets SET ${sets.join(', ')} WHERE id = ?`, ...vals);
}

export async function deleteQuarterlyTarget(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM quarterly_targets WHERE id = ?', id);
}

// KEY RESULTS
export async function addKeyResult(kr: KeyResult): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO key_results (id, target_id, title, metric, current_value, target_value, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
    kr.id, kr.target_id, kr.title, kr.metric, kr.current_value, kr.target_value, kr.unit
  );
}

export async function updateKeyResult(id: string, current_value: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE key_results SET current_value = ? WHERE id = ?', current_value, id);
}

export async function deleteKeyResult(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM key_results WHERE id = ?', id);
}

// ============================================================
// MONTHLY MILESTONES
// ============================================================

export async function getMonthlyMilestones(month?: string, targetId?: string): Promise<MonthlyMilestone[]> {
  const db = await getDatabase();
  let query = `SELECT m.*, t.title as target_title FROM monthly_milestones m
    LEFT JOIN quarterly_targets t ON m.target_id = t.id WHERE 1=1`;
  const params: any[] = [];
  if (month) { query += ' AND m.month = ?'; params.push(month); }
  if (targetId) { query += ' AND m.target_id = ?'; params.push(targetId); }
  query += ' ORDER BY m.created_at';
  return db.getAllAsync<MonthlyMilestone>(query, ...params);
}

export async function addMonthlyMilestone(ms: Omit<MonthlyMilestone, 'target_title'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO monthly_milestones (id, target_id, title, description, month, definition_of_done, status, progress, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ms.id, ms.target_id, ms.title, ms.description, ms.month, ms.definition_of_done, ms.status, ms.progress, ms.created_at
  );
}

export async function updateMonthlyMilestone(id: string, updates: Partial<MonthlyMilestone>): Promise<void> {
  const db = await getDatabase();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.title !== undefined) { sets.push('title = ?'); vals.push(updates.title); }
  if (updates.description !== undefined) { sets.push('description = ?'); vals.push(updates.description); }
  if (updates.definition_of_done !== undefined) { sets.push('definition_of_done = ?'); vals.push(updates.definition_of_done); }
  if (updates.status !== undefined) { sets.push('status = ?'); vals.push(updates.status); }
  if (updates.progress !== undefined) { sets.push('progress = ?'); vals.push(updates.progress); }
  if (sets.length === 0) return;
  vals.push(id);
  await db.runAsync(`UPDATE monthly_milestones SET ${sets.join(', ')} WHERE id = ?`, ...vals);
}

export async function deleteMonthlyMilestone(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM monthly_milestones WHERE id = ?', id);
}

// ============================================================
// WEEKLY SPRINTS
// ============================================================

export async function getWeeklySprints(weekStart?: string): Promise<WeeklySprint[]> {
  const db = await getDatabase();
  const ws = weekStart || getWeekStart();
  const sprints = await db.getAllAsync<WeeklySprint>(
    `SELECT s.*, m.title as milestone_title FROM weekly_sprints s
     LEFT JOIN monthly_milestones m ON s.milestone_id = m.id
     WHERE s.week_start = ? ORDER BY s.created_at`, ws
  );

  for (const sprint of sprints) {
    const counts = await db.getFirstAsync<{ total: number; done: number }>(
      `SELECT COUNT(*) as total, SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) as done
       FROM daily_actions WHERE sprint_id = ?`, sprint.id
    );
    sprint.actions_total = counts?.total || 0;
    sprint.actions_done = counts?.done || 0;
  }
  return sprints;
}

export async function addWeeklySprint(sprint: Omit<WeeklySprint, 'milestone_title' | 'actions_total' | 'actions_done'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO weekly_sprints (id, milestone_id, title, description, week_start, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    sprint.id, sprint.milestone_id, sprint.title, sprint.description, sprint.week_start, sprint.status, sprint.created_at
  );
}

export async function updateWeeklySprint(id: string, updates: Partial<WeeklySprint>): Promise<void> {
  const db = await getDatabase();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.title !== undefined) { sets.push('title = ?'); vals.push(updates.title); }
  if (updates.description !== undefined) { sets.push('description = ?'); vals.push(updates.description); }
  if (updates.status !== undefined) { sets.push('status = ?'); vals.push(updates.status); }
  if (updates.milestone_id !== undefined) { sets.push('milestone_id = ?'); vals.push(updates.milestone_id); }
  if (sets.length === 0) return;
  vals.push(id);
  await db.runAsync(`UPDATE weekly_sprints SET ${sets.join(', ')} WHERE id = ?`, ...vals);
}

export async function deleteWeeklySprint(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM weekly_sprints WHERE id = ?', id);
}

// ============================================================
// DAILY ACTIONS
// ============================================================

export async function getDailyActions(date?: string): Promise<DailyAction[]> {
  const db = await getDatabase();
  const d = date || getToday();
  const rows = await db.getAllAsync<any>(
    `SELECT a.*, s.title as sprint_title FROM daily_actions a
     LEFT JOIN weekly_sprints s ON a.sprint_id = s.id
     WHERE a.date = ? ORDER BY a.done ASC, a.priority DESC, a.created_at`, d
  );
  return rows.map((r: any) => ({ ...r, done: !!r.done }));
}

export async function getActionsForSprint(sprintId: string): Promise<DailyAction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT a.*, s.title as sprint_title FROM daily_actions a
     LEFT JOIN weekly_sprints s ON a.sprint_id = s.id
     WHERE a.sprint_id = ? ORDER BY a.date, a.created_at`, sprintId
  );
  return rows.map((r: any) => ({ ...r, done: !!r.done }));
}

export async function addDailyAction(action: Omit<DailyAction, 'done' | 'pomodoro_count' | 'sprint_title'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO daily_actions (id, sprint_id, title, date, done, priority, pomodoro_count, notes, created_at) VALUES (?, ?, ?, ?, 0, ?, 0, ?, ?)',
    action.id, action.sprint_id, action.title, action.date, action.priority, action.notes, action.created_at
  );
}

export async function updateDailyAction(id: string, updates: Partial<DailyAction>): Promise<void> {
  const db = await getDatabase();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.title !== undefined) { sets.push('title = ?'); vals.push(updates.title); }
  if (updates.done !== undefined) { sets.push('done = ?'); vals.push(updates.done ? 1 : 0); }
  if (updates.priority !== undefined) { sets.push('priority = ?'); vals.push(updates.priority); }
  if (updates.pomodoro_count !== undefined) { sets.push('pomodoro_count = ?'); vals.push(updates.pomodoro_count); }
  if (updates.notes !== undefined) { sets.push('notes = ?'); vals.push(updates.notes); }
  if (updates.sprint_id !== undefined) { sets.push('sprint_id = ?'); vals.push(updates.sprint_id); }
  if (sets.length === 0) return;
  vals.push(id);
  await db.runAsync(`UPDATE daily_actions SET ${sets.join(', ')} WHERE id = ?`, ...vals);
}

export async function deleteDailyAction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM daily_actions WHERE id = ?', id);
}

// ============================================================
// STANDALONE TASKS
// ============================================================

export async function getTasks(): Promise<Task[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM tasks ORDER BY created_at DESC');
  return rows.map((r: any) => ({ ...r, done: !!r.done }));
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

// ============================================================
// MULTI-LEVEL REVIEWS
// ============================================================

export async function getReview(type: string, period: string): Promise<Review | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Review>(
    'SELECT * FROM reviews WHERE type = ? AND period = ?', type, period
  );
}

export async function saveReview(review: Review): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO reviews (id, type, period, wins, challenges, lessons, adjustments, next_plan, rating, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    review.id, review.type, review.period, review.wins, review.challenges,
    review.lessons, review.adjustments, review.next_plan, review.rating, review.created_at
  );
}

export async function getReviewHistory(type: string, limit: number = 12): Promise<Review[]> {
  const db = await getDatabase();
  return db.getAllAsync<Review>(
    'SELECT * FROM reviews WHERE type = ? ORDER BY period DESC LIMIT ?', type, limit
  );
}

// ============================================================
// SHOLAT (retained)
// ============================================================

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
    await db.runAsync('UPDATE sholat SET done = ? WHERE date = ? AND sholat_id = ?', existing.done ? 0 : 1, today, sholatId);
  } else {
    await db.runAsync('INSERT INTO sholat (date, sholat_id, done) VALUES (?, ?, 1)', today, sholatId);
  }
}

// ============================================================
// DZIKIR (retained)
// ============================================================

export async function getDzikirToday(): Promise<Record<string, number>> {
  const db = await getDatabase();
  const today = getToday();
  const period = getCurrentHour() < 12 ? 'pagi' : 'sore';
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
  const period = getCurrentHour() < 12 ? 'pagi' : 'sore';
  const existing = await db.getFirstAsync(
    'SELECT count FROM dzikir WHERE date = ? AND time_period = ? AND dzikir_id = ?', today, period, dzikirId
  );
  if (existing) {
    await db.runAsync('UPDATE dzikir SET count = ? WHERE date = ? AND time_period = ? AND dzikir_id = ?', count, today, period, dzikirId);
  } else {
    await db.runAsync('INSERT INTO dzikir (date, time_period, dzikir_id, count) VALUES (?, ?, ?, ?)', today, period, dzikirId, count);
  }
}

// ============================================================
// HABITS (retained)
// ============================================================

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
    await db.runAsync('UPDATE habits SET done = ? WHERE date = ? AND habit_id = ?', existing.done ? 0 : 1, today, habitId);
  } else {
    await db.runAsync('INSERT INTO habits (date, habit_id, done) VALUES (?, ?, 1)', today, habitId);
  }
}

// ============================================================
// JOURNAL (retained)
// ============================================================

export async function getJournalToday(): Promise<JournalEntry> {
  const db = await getDatabase();
  const today = getToday();
  const rows = await db.getAllAsync<any>('SELECT * FROM journal WHERE date = ?', today);
  const result: JournalEntry = { morning: null, evening: null };
  rows.forEach((r: any) => {
    if (r.type === 'morning') result.morning = { focus: r.focus, gratitude: r.gratitude, affirmation: r.affirmation };
    else if (r.type === 'evening') result.evening = { wins: r.wins, improve: r.improve, lesson: r.lesson };
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

// ============================================================
// POMODORO (enhanced with action linking)
// ============================================================

export async function getPomodoroStats(): Promise<PomodoroStats> {
  const db = await getDatabase();
  const today = getToday();
  const row = await db.getFirstAsync<any>('SELECT * FROM pomodoro_stats WHERE date = ?', today);
  if (row) return { today: row.count, total: row.total, streak: row.streak };
  const lastRow = await db.getFirstAsync<any>('SELECT * FROM pomodoro_stats ORDER BY date DESC LIMIT 1');
  return { today: 0, total: lastRow?.total || 0, streak: lastRow?.streak || 0 };
}

export async function incrementPomodoro(actionId?: string): Promise<PomodoroStats> {
  const db = await getDatabase();
  const today = getToday();
  const now = new Date().toISOString();

  // Log individual session
  const sessionId = `pom_${Date.now().toString(36)}`;
  await db.runAsync(
    'INSERT INTO pomodoro_sessions (id, date, action_id, duration_min, completed, created_at) VALUES (?, ?, ?, 25, 1, ?)',
    sessionId, today, actionId || null, now
  );

  // Update daily action pomodoro count
  if (actionId) {
    await db.runAsync(
      'UPDATE daily_actions SET pomodoro_count = pomodoro_count + 1 WHERE id = ?', actionId
    );
  }

  // Update stats
  const existing = await db.getFirstAsync<any>('SELECT * FROM pomodoro_stats WHERE date = ?', today);
  if (existing) {
    const newCount = existing.count + 1;
    const newTotal = existing.total + 1;
    await db.runAsync('UPDATE pomodoro_stats SET count = ?, total = ? WHERE date = ?', newCount, newTotal, today);
    return { today: newCount, total: newTotal, streak: existing.streak };
  } else {
    const lastRow = await db.getFirstAsync<any>('SELECT * FROM pomodoro_stats ORDER BY date DESC LIMIT 1');
    const newTotal = (lastRow?.total || 0) + 1;
    const newStreak = (lastRow?.streak || 0) + 1;
    await db.runAsync('INSERT INTO pomodoro_stats (date, count, total, streak) VALUES (?, 1, ?, ?)', today, newTotal, newStreak);
    return { today: 1, total: newTotal, streak: newStreak };
  }
}

export async function getPomodoroSessionsForAction(actionId: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM pomodoro_sessions WHERE action_id = ?', actionId
  );
  return row?.cnt || 0;
}

// ============================================================
// BRAIN DUMP (retained)
// ============================================================

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

// DONT LIST
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

// ============================================================
// VISION (retained)
// ============================================================

export async function getVision(): Promise<{ year10: string; year3: string; year1: string }> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT * FROM vision');
  const result = { year10: '', year3: '', year1: '' };
  rows.forEach(r => { if (r.key in result) (result as any)[r.key] = r.value; });
  return result;
}

export async function saveVision(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO vision (key, value) VALUES (?, ?)', key, value);
}

// SETTINGS
export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? defaultValue;
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}

// ============================================================
// DASHBOARD AGGREGATION
// ============================================================

export async function getDashboardData() {
  const db = await getDatabase();
  const today = getToday();
  const quarter = getQuarter();
  const month = getMonth();
  const weekStart = getWeekStart();

  const [targets, milestones, sprints, todayActions, sholat, pomStats] = await Promise.all([
    getQuarterlyTargets(quarter),
    getMonthlyMilestones(month),
    getWeeklySprints(weekStart),
    getDailyActions(today),
    getSholatToday(),
    getPomodoroStats(),
  ]);

  const sprintsDone = sprints.reduce((s, sp) => s + (sp.actions_done || 0), 0);
  const sprintsTotal = sprints.reduce((s, sp) => s + (sp.actions_total || 0), 0);
  const actionsDone = todayActions.filter(a => a.done).length;

  return {
    quarter: { targets, avgProgress: targets.length ? Math.round(targets.reduce((s, t) => s + (t.progress || 0), 0) / targets.length) : 0 },
    month: { milestones, avgProgress: milestones.length ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length) : 0 },
    week: { sprints, done: sprintsDone, total: sprintsTotal },
    today: { actions: todayActions, done: actionsDone, total: todayActions.length },
    sholat,
    pomodoro: pomStats,
  };
}

// ============================================================
// EXPORT / IMPORT
// ============================================================

export async function exportAllData(): Promise<string> {
  const db = await getDatabase();
  const tables = [
    'quarterly_targets', 'key_results', 'monthly_milestones', 'weekly_sprints', 'daily_actions',
    'tasks', 'reviews', 'sholat', 'dzikir', 'habits', 'journal',
    'pomodoro_sessions', 'pomodoro_stats', 'braindump', 'dontlist', 'vision', 'settings'
  ];
  const data: Record<string, any[]> = {};
  for (const table of tables) {
    data[table] = await db.getAllAsync(`SELECT * FROM ${table}`);
  }
  return JSON.stringify(data, null, 2);
}

export async function importAllData(jsonStr: string): Promise<void> {
  const db = await getDatabase();
  const data = JSON.parse(jsonStr);
  const tables = [
    'quarterly_targets', 'key_results', 'monthly_milestones', 'weekly_sprints', 'daily_actions',
    'tasks', 'reviews', 'sholat', 'dzikir', 'habits', 'journal',
    'pomodoro_sessions', 'pomodoro_stats', 'braindump', 'dontlist', 'vision', 'settings'
  ];
  // Clear existing data first
  for (const table of tables) {
    await db.execAsync(`DELETE FROM ${table}`);
  }
  // Import each table
  for (const table of tables) {
    const rows = data[table];
    if (!rows || !Array.isArray(rows) || rows.length === 0) continue;
    for (const row of rows) {
      const cols = Object.keys(row);
      const placeholders = cols.map(() => '?').join(', ');
      const vals = cols.map(c => row[c]);
      await db.runAsync(
        `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
        ...vals
      );
    }
  }
}

export async function clearAllData(): Promise<void> {
  const db = await getDatabase();
  const tables = [
    'quarterly_targets', 'key_results', 'monthly_milestones', 'weekly_sprints', 'daily_actions',
    'tasks', 'reviews', 'sholat', 'dzikir', 'habits', 'journal',
    'pomodoro_sessions', 'pomodoro_stats', 'braindump', 'dontlist', 'vision', 'settings'
  ];
  for (const table of tables) {
    await db.execAsync(`DELETE FROM ${table}`);
  }
}
