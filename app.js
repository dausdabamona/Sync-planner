/**
 * ============================================
 * SYNC PLANNER - APP.JS
 * ============================================
 * Version: 2.0 (dengan Healthy Break Integration)
 */

// ============================================
// APPLICATION STATE
// ============================================
const state = {
  currentPage: 'home',
  selectedDate: new Date(),
  prayerTimes: { fajr: '04:30', dhuhr: '12:00', asr: '15:15', maghrib: '18:00', isha: '19:15' },
  pomodoro: {
    isRunning: false, isPaused: false, type: 'focus',
    duration: 25 * 60, remaining: 25 * 60, interval: null,
    task: '', sessionsCompleted: 0
  },
  dailySync: null,
  tasks: [],
  habits: [],
  journals: [],
  settings: { notifications: true, sound: true, vibration: true, darkMode: false }
};

const TIMER_TYPES = {
  focus: { duration: 25, label: '🍅 Fokus', color: '#0D47A1' },
  short: { duration: 5, label: '☕ Istirahat', color: '#10b981' },
  long: { duration: 15, label: '🌴 Panjang', color: '#f59e0b' },
  deep: { duration: 45, label: '🧠 Deep Work', color: '#7c3aed' },
  ultra: { duration: 90, label: '🚀 Ultra', color: '#dc2626' }
};

// ============================================
// WISDOM DATA
// ============================================
const WISDOM_DATA = [
  { text: "Barangsiapa yang mengenal dirinya, maka ia mengenal Tuhannya.", source: "Ali bin Abi Thalib", icon: "🌙" },
  { text: "Ilmu tanpa amal bagaikan pohon tanpa buah.", source: "Imam Al-Ghazali", icon: "📚" },
  { text: "Waktu bagaikan pedang, jika engkau tidak memanfaatkannya maka ia akan memotongmu.", source: "Ali bin Abi Thalib", icon: "⏰" },
  { text: "Sesungguhnya Allah tidak mengubah keadaan suatu kaum hingga mereka mengubah apa yang ada pada diri mereka.", source: "QS. Ar-Ra'd: 11", icon: "✨" },
  { text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.", source: "HR. Ahmad", icon: "🤝" },
  { text: "Bersabarlah, karena sesungguhnya Allah bersama orang-orang yang sabar.", source: "QS. Al-Anfal: 46", icon: "🌿" },
  { text: "Jadilah seperti lebah, hinggap pada yang baik dan menghasilkan yang baik.", source: "Ali bin Abi Thalib", icon: "🐝" },
  { text: "Orang mukmin yang kuat lebih baik dan lebih dicintai Allah daripada mukmin yang lemah.", source: "HR. Muslim", icon: "💪" }
];

// ============================================
// HELPER FUNCTIONS
// ============================================
function todayString() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function formatDate(date) {
  return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getRandomWisdom() {
  return WISDOM_DATA[Math.floor(Math.random() * WISDOM_DATA.length)];
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  const colors = { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#333' };
  toast.style.background = colors[type] || colors.info;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================
// LOCAL STORAGE
// ============================================
function loadAllData() {
  const today = todayString();
  const savedSync = localStorage.getItem('sync_' + today);
  state.dailySync = savedSync ? JSON.parse(savedSync) : initializeDailySync();
  
  const savedSettings = localStorage.getItem('syncPlannerSettings');
  if (savedSettings) state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
  
  const savedTasks = localStorage.getItem('syncPlannerTasks');
  state.tasks = savedTasks ? JSON.parse(savedTasks) : [];
  
  const savedHabits = localStorage.getItem('syncPlannerHabits');
  if (savedHabits) {
    state.habits = JSON.parse(savedHabits);
  } else {
    state.habits = getDefaultHabits();
    saveData('syncPlannerHabits', state.habits); // Save default habits
  }
  
  const savedJournals = localStorage.getItem('syncPlannerJournals');
  state.journals = savedJournals ? JSON.parse(savedJournals) : [];
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function initializeDailySync() {
  const sync = {
    date: todayString(),
    morningReflection: null,
    eveningReflection: null,
    gratitude: [],
    intentions: [],
    stats: { tasks_completed: 0, pomodoro_sessions: 0, pomodoro_minutes: 0, habits_done: 0 }
  };
  saveData('sync_' + todayString(), sync);
  return sync;
}

function getDefaultHabits() {
  return [
    { id: generateId(), name: 'Sholat Subuh', icon: '🌅', streak: 0 },
    { id: generateId(), name: 'Tilawah', icon: '📖', streak: 0 },
    { id: generateId(), name: 'Olahraga', icon: '🏃', streak: 0 },
    { id: generateId(), name: 'Tidur Awal', icon: '😴', streak: 0 }
  ];
}

// ============================================
// PAGE NAVIGATION
// ============================================
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById('page-' + pageName);
  if (targetPage) targetPage.classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const activeNav = document.querySelector('.nav-item[data-page="' + pageName + '"]');
  if (activeNav) activeNav.classList.add('active');
  
  state.currentPage = pageName;
  
  if (pageName === 'home') renderHomePage();
  else if (pageName === 'tasks') renderTasksPage();
  else if (pageName === 'pomodoro') renderPomodoroPage();
  else if (pageName === 'refleksi') renderRefleksiPage();
  else if (pageName === 'settings') renderSettingsPage();
}

// ============================================
// SOUND & VIBRATION
// ============================================
function playSound(type) {
  if (!state.settings.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'complete' ? 880 : 523.25;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

function vibrate(pattern) {
  if (state.settings.vibration && 'vibrate' in navigator) navigator.vibrate(pattern);
}

// ============================================
// POMODORO TIMER
// ============================================
function setTimerType(type) {
  if (state.pomodoro.isRunning && !confirm('Timer sedang berjalan. Ganti?')) return;
  stopTimer();
  state.pomodoro.type = type;
  state.pomodoro.duration = TIMER_TYPES[type].duration * 60;
  state.pomodoro.remaining = state.pomodoro.duration;
  renderPomodoroPage();
}

function startTimer() {
  if (state.pomodoro.isRunning && !state.pomodoro.isPaused) return;
  state.pomodoro.isPaused = false;
  state.pomodoro.isRunning = true;
  
  state.pomodoro.interval = setInterval(() => {
    state.pomodoro.remaining--;
    updateTimerDisplay();
    if (state.pomodoro.remaining <= 0) completePomodoro();
  }, 1000);
  
  updateTimerControls();
}

function pauseTimer() {
  if (!state.pomodoro.isRunning) return;
  state.pomodoro.isPaused = true;
  clearInterval(state.pomodoro.interval);
  updateTimerControls();
}

function stopTimer() {
  state.pomodoro.isRunning = false;
  state.pomodoro.isPaused = false;
  clearInterval(state.pomodoro.interval);
  state.pomodoro.remaining = state.pomodoro.duration;
  updateTimerDisplay();
  updateTimerControls();
}

function completePomodoro() {
  clearInterval(state.pomodoro.interval);
  state.pomodoro.isRunning = false;
  state.pomodoro.isPaused = false;
  
  const durationMinutes = state.pomodoro.duration / 60;
  const isWorkSession = state.pomodoro.type !== 'short' && state.pomodoro.type !== 'long';
  
  if (isWorkSession) {
    state.pomodoro.sessionsCompleted++;
    if (state.dailySync) {
      state.dailySync.stats.pomodoro_sessions++;
      state.dailySync.stats.pomodoro_minutes += durationMinutes;
      saveData('sync_' + todayString(), state.dailySync);
    }
  }
  
  playSound('complete');
  vibrate([200, 100, 200, 100, 200]);
  showToast('🍅 ' + TIMER_TYPES[state.pomodoro.type].label + ' selesai!', 'success');
  updateHeaderStats();
  
  state.pomodoro.remaining = state.pomodoro.duration;
  updateTimerDisplay();
  updateTimerControls();
  
  // === HEALTHY BREAK INTEGRATION ===
  if (isWorkSession && typeof triggerHealthyBreakReminder === 'function') {
    const totalMinutesToday = state.dailySync?.stats?.pomodoro_minutes || durationMinutes;
    setTimeout(() => {
      triggerHealthyBreakReminder({
        type: state.pomodoro.type,
        duration: durationMinutes,
        totalMinutesToday: totalMinutesToday,
        task: state.pomodoro.task || ''
      });
    }, 1500);
  }
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  if (display) display.textContent = formatTime(state.pomodoro.remaining);
  
  const progress = document.getElementById('timerProgress');
  if (progress) {
    const pct = state.pomodoro.remaining / state.pomodoro.duration;
    progress.style.strokeDashoffset = 2 * Math.PI * 90 * (1 - pct);
  }
}

function updateTimerControls() {
  const startBtn = document.getElementById('timerStartBtn');
  const pauseBtn = document.getElementById('timerPauseBtn');
  const stopBtn = document.getElementById('timerStopBtn');
  if (!startBtn) return;
  
  if (state.pomodoro.isRunning && !state.pomodoro.isPaused) {
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-flex';
    stopBtn.style.display = 'inline-flex';
  } else if (state.pomodoro.isPaused) {
    startBtn.style.display = 'inline-flex';
    startBtn.innerHTML = '▶️ Lanjut';
    pauseBtn.style.display = 'none';
    stopBtn.style.display = 'inline-flex';
  } else {
    startBtn.style.display = 'inline-flex';
    startBtn.innerHTML = '▶️ Mulai';
    pauseBtn.style.display = 'none';
    stopBtn.style.display = 'none';
  }
}

function setTimerTask(task) {
  state.pomodoro.task = task;
}

// ============================================
// TASKS MANAGEMENT
// ============================================
function addTask(title, priority = 'medium', dueDate = null) {
  const task = {
    id: generateId(),
    title: title,
    priority: priority,
    dueDate: dueDate,
    completed: false,
    createdAt: new Date().toISOString()
  };
  state.tasks.unshift(task);
  saveData('syncPlannerTasks', state.tasks);
  renderTasksPage();
  showToast('✅ Tugas ditambahkan', 'success');
}

function toggleTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    if (task.completed && state.dailySync) {
      state.dailySync.stats.tasks_completed++;
      saveData('sync_' + todayString(), state.dailySync);
    }
    saveData('syncPlannerTasks', state.tasks);
    renderTasksPage();
    updateHeaderStats();
  }
}

function deleteTask(taskId) {
  if (!confirm('Hapus tugas ini?')) return;
  state.tasks = state.tasks.filter(t => t.id !== taskId);
  saveData('syncPlannerTasks', state.tasks);
  renderTasksPage();
  showToast('🗑️ Tugas dihapus', 'info');
}

function startTaskPomodoro(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    state.pomodoro.task = task.title;
    showPage('pomodoro');
    showToast('🍅 Fokus pada: ' + task.title, 'info');
  }
}

// ============================================
// HABITS MANAGEMENT
// ============================================
function toggleHabit(habitId) {
  const today = todayString();
  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return;
  
  if (!habit.completedDates) habit.completedDates = [];
  
  const idx = habit.completedDates.indexOf(today);
  if (idx === -1) {
    habit.completedDates.push(today);
    habit.streak = (habit.streak || 0) + 1;
    if (state.dailySync) {
      state.dailySync.stats.habits_done++;
      saveData('sync_' + today, state.dailySync);
    }
    showToast(habit.icon + ' ' + habit.name + ' selesai! Streak: ' + habit.streak, 'success');
  } else {
    habit.completedDates.splice(idx, 1);
    habit.streak = Math.max(0, (habit.streak || 1) - 1);
  }
  
  saveData('syncPlannerHabits', state.habits);
  renderHomePage();
  updateHeaderStats();
}

function isHabitDoneToday(habit) {
  if (!habit.completedDates) return false;
  return habit.completedDates.includes(todayString());
}

// ============================================
// JOURNAL / GRATITUDE
// ============================================
function saveGratitude(items) {
  if (state.dailySync) {
    state.dailySync.gratitude = items;
    saveData('sync_' + todayString(), state.dailySync);
  }
}

function saveMorningReflection(text) {
  if (state.dailySync) {
    state.dailySync.morningReflection = text;
    saveData('sync_' + todayString(), state.dailySync);
    showToast('☀️ Refleksi pagi tersimpan', 'success');
  }
}

function saveEveningReflection(text) {
  if (state.dailySync) {
    state.dailySync.eveningReflection = text;
    saveData('sync_' + todayString(), state.dailySync);
    showToast('🌙 Refleksi malam tersimpan', 'success');
  }
}

function addJournalEntry(content, mood) {
  const entry = {
    id: generateId(),
    date: todayString(),
    content: content,
    mood: mood,
    createdAt: new Date().toISOString()
  };
  state.journals.unshift(entry);
  saveData('syncPlannerJournals', state.journals);
  showToast('📝 Jurnal tersimpan', 'success');
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function updateHeaderStats() {
  const tasksEl = document.getElementById('headerTasks');
  const pomodoroEl = document.getElementById('headerPomodoro');
  const habitsEl = document.getElementById('headerHabits');
  const breakStreakEl = document.getElementById('breakStreak');
  
  if (tasksEl && state.dailySync) tasksEl.textContent = state.dailySync.stats.tasks_completed;
  if (pomodoroEl && state.dailySync) pomodoroEl.textContent = state.dailySync.stats.pomodoro_sessions;
  if (habitsEl && state.dailySync) habitsEl.textContent = state.dailySync.stats.habits_done;
  if (breakStreakEl && typeof healthyBreakState !== 'undefined') {
    breakStreakEl.textContent = healthyBreakState.stats.currentStreak + '🔥';
  }
}

function renderHomePage() {
  // Render Wisdom Card
  const wisdomContainer = document.getElementById('wisdomCard');
  if (wisdomContainer) {
    const w = getRandomWisdom();
    wisdomContainer.innerHTML = '<div class="wisdom-icon">' + w.icon + '</div>' +
      '<div class="wisdom-text">"' + w.text + '"</div>' +
      '<div class="wisdom-source">— ' + w.source + '</div>';
  }
  
  // Render Habits
  const habitsContainer = document.getElementById('habitsContainer');
  if (habitsContainer) {
    let html = '';
    state.habits.forEach(habit => {
      const done = isHabitDoneToday(habit);
      html += '<div class="habit-item">' +
        '<div class="habit-info">' +
          '<span class="habit-icon">' + habit.icon + '</span>' +
          '<div><div class="habit-name">' + habit.name + '</div>' +
          '<div class="habit-streak">' + (habit.streak || 0) + ' hari streak</div></div>' +
        '</div>' +
        '<div class="habit-check ' + (done ? 'done' : '') + '" onclick="toggleHabit(\'' + habit.id + '\')">' +
          (done ? '✓' : '') +
        '</div>' +
      '</div>';
    });
    habitsContainer.innerHTML = html;
  }
  
  // Render Today's Tasks (preview)
  const todayTasks = document.getElementById('todayTasks');
  if (todayTasks) {
    const pending = state.tasks.filter(t => !t.completed).slice(0, 3);
    if (pending.length === 0) {
      todayTasks.innerHTML = '<div class="empty-state"><div class="empty-icon">🎉</div><div class="empty-text">Tidak ada tugas pending!</div></div>';
    } else {
      let html = '';
      pending.forEach(task => {
        html += '<div class="task-item priority-' + task.priority + '">' +
          '<div class="task-checkbox" onclick="toggleTask(\'' + task.id + '\')"></div>' +
          '<div class="task-content">' +
            '<div class="task-title">' + task.title + '</div>' +
          '</div>' +
          '<button class="task-action-btn" onclick="startTaskPomodoro(\'' + task.id + '\')">🍅</button>' +
        '</div>';
      });
      todayTasks.innerHTML = html;
    }
  }
  
  updateHeaderStats();
}

function renderTasksPage() {
  const container = document.getElementById('tasksContainer');
  if (!container) return;
  
  if (state.tasks.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">Belum ada tugas. Tambahkan tugas baru!</div></div>';
    return;
  }
  
  // Separate completed and pending
  const pending = state.tasks.filter(t => !t.completed);
  const completed = state.tasks.filter(t => t.completed);
  
  let html = '';
  
  if (pending.length > 0) {
    html += '<div style="font-size:13px;font-weight:600;color:#888;margin-bottom:8px;">PENDING (' + pending.length + ')</div>';
    pending.forEach(task => {
      html += renderTaskItem(task);
    });
  }
  
  if (completed.length > 0) {
    html += '<div style="font-size:13px;font-weight:600;color:#888;margin:16px 0 8px;">SELESAI (' + completed.length + ')</div>';
    completed.forEach(task => {
      html += renderTaskItem(task);
    });
  }
  
  container.innerHTML = html;
}

function renderTaskItem(task) {
  return '<div class="task-item ' + (task.completed ? 'completed' : '') + ' priority-' + task.priority + '">' +
    '<div class="task-checkbox ' + (task.completed ? 'checked' : '') + '" onclick="toggleTask(\'' + task.id + '\')">' +
      (task.completed ? '✓' : '') +
    '</div>' +
    '<div class="task-content">' +
      '<div class="task-title">' + task.title + '</div>' +
      '<div class="task-meta">' +
        '<span class="task-tag">' + task.priority + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="task-actions">' +
      (task.completed ? '' : '<button class="task-action-btn" onclick="startTaskPomodoro(\'' + task.id + '\')">🍅</button>') +
      '<button class="task-action-btn" onclick="deleteTask(\'' + task.id + '\')">🗑️</button>' +
    '</div>' +
  '</div>';
}

function renderPomodoroPage() {
  const typeButtons = document.getElementById('timerTypes');
  if (typeButtons) {
    let html = '';
    Object.keys(TIMER_TYPES).forEach(type => {
      const t = TIMER_TYPES[type];
      const active = state.pomodoro.type === type ? 'active' : '';
      html += '<button class="timer-type-btn ' + active + '" onclick="setTimerType(\'' + type + '\')">' +
        t.label + ' (' + t.duration + 'm)</button>';
    });
    typeButtons.innerHTML = html;
  }
  
  updateTimerDisplay();
  updateTimerControls();
  
  // Show current task
  const taskDisplay = document.getElementById('timerTask');
  if (taskDisplay) {
    taskDisplay.textContent = state.pomodoro.task || 'Pilih tugas atau ketik manual';
    taskDisplay.style.display = state.pomodoro.task ? 'block' : 'none';
  }
}

function renderRefleksiPage() {
  const container = document.getElementById('refleksiContent');
  if (!container) return;
  
  const stats = state.dailySync?.stats || { tasks_completed: 0, pomodoro_sessions: 0, pomodoro_minutes: 0, habits_done: 0 };
  
  let html = '<div class="stats-grid">' +
    '<div class="stat-card"><div class="stat-value">' + stats.tasks_completed + '</div><div class="stat-label">Tugas Selesai</div></div>' +
    '<div class="stat-card"><div class="stat-value">' + stats.pomodoro_sessions + '</div><div class="stat-label">Sesi Pomodoro</div></div>' +
    '<div class="stat-card"><div class="stat-value">' + stats.pomodoro_minutes + '</div><div class="stat-label">Menit Fokus</div></div>' +
    '<div class="stat-card"><div class="stat-value">' + stats.habits_done + '</div><div class="stat-label">Habit Selesai</div></div>' +
  '</div>';
  
  // Healthy Break Stats (if available)
  if (typeof renderBreakStatsForRefleksi === 'function') {
    html += renderBreakStatsForRefleksi();
  }
  
  // Gratitude Section
  html += '<div class="card"><div class="card-header"><span class="card-title">🙏 Syukur Hari Ini</span></div>' +
    '<div id="gratitudeSection">' +
      '<div class="gratitude-item"><div class="gratitude-number">1</div>' +
        '<input type="text" class="form-input" placeholder="Aku bersyukur untuk..." id="gratitude1" onchange="saveGratitudeFromInputs()"></div>' +
      '<div class="gratitude-item"><div class="gratitude-number">2</div>' +
        '<input type="text" class="form-input" placeholder="Aku bersyukur untuk..." id="gratitude2" onchange="saveGratitudeFromInputs()"></div>' +
      '<div class="gratitude-item"><div class="gratitude-number">3</div>' +
        '<input type="text" class="form-input" placeholder="Aku bersyukur untuk..." id="gratitude3" onchange="saveGratitudeFromInputs()"></div>' +
    '</div></div>';
  
  // Reflections
  html += '<div class="card"><div class="card-header"><span class="card-title">🌙 Refleksi Malam</span></div>' +
    '<textarea class="form-textarea" id="eveningReflection" placeholder="Apa yang berjalan baik hari ini? Apa yang bisa diperbaiki?" rows="4">' +
    (state.dailySync?.eveningReflection || '') + '</textarea>' +
    '<button class="btn btn-primary btn-full mt-2" onclick="saveEveningReflection(document.getElementById(\'eveningReflection\').value)">💾 Simpan Refleksi</button>' +
  '</div>';
  
  container.innerHTML = html;
  
  // Load gratitude values
  if (state.dailySync?.gratitude) {
    state.dailySync.gratitude.forEach((g, i) => {
      const el = document.getElementById('gratitude' + (i + 1));
      if (el) el.value = g;
    });
  }
}

function saveGratitudeFromInputs() {
  const items = [
    document.getElementById('gratitude1')?.value || '',
    document.getElementById('gratitude2')?.value || '',
    document.getElementById('gratitude3')?.value || ''
  ].filter(g => g.trim());
  saveGratitude(items);
}

function renderSettingsPage() {
  // Settings are rendered in HTML, just update toggles
  const notifToggle = document.getElementById('settingNotifications');
  const soundToggle = document.getElementById('settingSound');
  const vibrationToggle = document.getElementById('settingVibration');
  
  if (notifToggle) notifToggle.checked = state.settings.notifications;
  if (soundToggle) soundToggle.checked = state.settings.sound;
  if (vibrationToggle) vibrationToggle.checked = state.settings.vibration;
}

function toggleSetting(key) {
  state.settings[key] = !state.settings[key];
  saveData('syncPlannerSettings', state.settings);
}

// ============================================
// MODALS
// ============================================
function openAddTaskModal() {
  const modal = document.getElementById('addTaskModal');
  if (modal) modal.classList.add('active');
}

function closeAddTaskModal() {
  const modal = document.getElementById('addTaskModal');
  if (modal) modal.classList.remove('active');
  // Clear form
  document.getElementById('newTaskTitle').value = '';
  document.getElementById('newTaskPriority').value = 'medium';
}

function submitNewTask() {
  const title = document.getElementById('newTaskTitle').value.trim();
  const priority = document.getElementById('newTaskPriority').value;
  
  if (!title) {
    showToast('Masukkan judul tugas', 'warning');
    return;
  }
  
  addTask(title, priority);
  closeAddTaskModal();
}

function openPomodoroTaskModal() {
  const modal = document.getElementById('pomodoroTaskModal');
  if (modal) {
    // Populate with pending tasks
    const taskList = document.getElementById('pomodoroTaskList');
    const pending = state.tasks.filter(t => !t.completed);
    
    let html = '<div class="form-group"><input type="text" class="form-input" id="customPomodoroTask" placeholder="Atau ketik tugas baru..."></div>';
    
    if (pending.length > 0) {
      html += '<div style="font-size:13px;color:#888;margin:12px 0 8px;">Atau pilih dari tugas:</div>';
      pending.forEach(task => {
        html += '<div class="task-item" style="cursor:pointer;margin-bottom:8px;" onclick="selectPomodoroTask(\'' + task.id + '\')">' +
          '<span style="margin-right:8px;">📋</span>' + task.title +
        '</div>';
      });
    }
    
    taskList.innerHTML = html;
    modal.classList.add('active');
  }
}

function closePomodoroTaskModal() {
  const modal = document.getElementById('pomodoroTaskModal');
  if (modal) modal.classList.remove('active');
}

function selectPomodoroTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    state.pomodoro.task = task.title;
    renderPomodoroPage();
    closePomodoroTaskModal();
    showToast('🍅 Tugas dipilih: ' + task.title, 'info');
  }
}

function confirmCustomPomodoroTask() {
  const input = document.getElementById('customPomodoroTask');
  if (input && input.value.trim()) {
    state.pomodoro.task = input.value.trim();
    renderPomodoroPage();
    closePomodoroTaskModal();
    showToast('🍅 Tugas: ' + state.pomodoro.task, 'info');
  } else {
    showToast('Masukkan atau pilih tugas', 'warning');
  }
}

// ============================================
// DZIKIR COUNTER
// ============================================
let dzikirState = {
  count: 0,
  target: 33,
  currentDzikir: 'subhanallah'
};

const DZIKIR_LIST = {
  subhanallah: { arabic: 'سُبْحَانَ اللّٰهِ', latin: 'Subhanallah', target: 33 },
  alhamdulillah: { arabic: 'اَلْحَمْدُ لِلّٰهِ', latin: 'Alhamdulillah', target: 33 },
  allahuakbar: { arabic: 'اللّٰهُ أَكْبَرُ', latin: 'Allahu Akbar', target: 33 }
};

function incrementDzikir() {
  dzikirState.count++;
  updateDzikirDisplay();
  vibrate([50]);
  
  if (dzikirState.count >= dzikirState.target) {
    playSound('complete');
    showToast('✨ ' + DZIKIR_LIST[dzikirState.currentDzikir].latin + ' selesai!', 'success');
    
    // Auto next
    setTimeout(() => {
      if (dzikirState.currentDzikir === 'subhanallah') {
        setDzikir('alhamdulillah');
      } else if (dzikirState.currentDzikir === 'alhamdulillah') {
        setDzikir('allahuakbar');
      } else {
        showToast('🎉 Dzikir selesai! Alhamdulillah', 'success');
      }
    }, 1000);
  }
}

function setDzikir(type) {
  dzikirState.currentDzikir = type;
  dzikirState.count = 0;
  dzikirState.target = DZIKIR_LIST[type].target;
  updateDzikirDisplay();
}

function resetDzikir() {
  dzikirState.count = 0;
  updateDzikirDisplay();
}

function updateDzikirDisplay() {
  const d = DZIKIR_LIST[dzikirState.currentDzikir];
  const countEl = document.getElementById('dzikirCount');
  const arabicEl = document.getElementById('dzikirArabic');
  const latinEl = document.getElementById('dzikirLatin');
  const progressEl = document.getElementById('dzikirProgress');
  
  if (countEl) countEl.textContent = dzikirState.count;
  if (arabicEl) arabicEl.textContent = d.arabic;
  if (latinEl) latinEl.textContent = d.latin;
  if (progressEl) progressEl.textContent = dzikirState.count + '/' + dzikirState.target;
}

// ============================================
// INITIALIZATION
// ============================================
function initApp() {
  loadAllData();
  
  // Initialize Healthy Break System
  if (typeof initHealthyBreakSystem === 'function') {
    initHealthyBreakSystem();
  }
  
  // Render initial page
  showPage('home');
  
  // Update date display
  const dateEl = document.getElementById('currentDate');
  if (dateEl) dateEl.textContent = formatDate(new Date());
  
  // Initialize Dzikir display
  updateDzikirDisplay();
  
  console.log('✅ Sync Planner initialized');
}

// Start app when DOM ready
document.addEventListener('DOMContentLoaded', initApp);

// Export for debugging
window.state = state;
window.showPage = showPage;
window.showToast = showToast;
