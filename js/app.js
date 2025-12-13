/**
 * ============================================
 * SYNC PLANNER v4.2 - MAIN APP
 * Integrasi semua modul
 * ============================================
 */

// ============================================
// APP STATE
// ============================================
const AppState = {
  initialized: false,
  currentPage: 'home',
  
  // Data caches
  dailySync: null,
  goals: [],
  tasks: [],
  
  // Pomodoro
  pomodoro: {
    active: false,
    duration: 25,
    remaining: 25 * 60,
    interval: null
  }
};

// ============================================
// APP INITIALIZATION
// ============================================
async function initApp() {
  console.log('[App] Initializing SyncPlanner v4.2...');
  
  // Initialize config
  SyncConfig.init();
  
  // Initialize UI
  SyncUI.init();
  
  // Initialize API
  SyncAPI.init();
  
  // Setup auth callbacks
  SyncAuth.onLoginSuccess = onLoginSuccess;
  SyncAuth.onLogoutSuccess = onLogoutSuccess;
  
  // Check if already logged in
  if (SyncConfig.isLoggedIn()) {
    onLoginSuccess(SyncConfig.user);
  } else {
    showLoginPage();
  }
  
  // Initialize auth (Google Sign-In)
  SyncAuth.init();
  
  AppState.initialized = true;
  console.log('[App] Initialization complete');
}

// ============================================
// AUTH HANDLERS
// ============================================
function onLoginSuccess(user) {
  console.log('[App] Login success:', user.name);
  
  // Check for API URL
  const apiUrlInput = document.getElementById('apiUrlInput');
  if (apiUrlInput && apiUrlInput.value) {
    SyncConfig.setApiUrl(apiUrlInput.value);
  }
  
  // Hide login, show app
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  
  // Update UI with user info
  updateUserUI(user);
  
  // Load data
  loadAppData();
}

function onLogoutSuccess() {
  console.log('[App] Logout success');
  
  // Show login, hide app
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('mainApp').classList.add('hidden');
  
  // Clear state
  AppState.dailySync = null;
  AppState.goals = [];
  AppState.tasks = [];
}

function showLoginPage() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('mainApp').classList.add('hidden');
}

function demoLogin() {
  const name = prompt('Masukkan nama Anda:', 'Demo User') || 'Demo User';
  SyncAuth.demoLogin(name);
}

function logout() {
  if (confirm('Yakin ingin logout?')) {
    SyncAuth.logout();
  }
}

// ============================================
// UI UPDATES
// ============================================
function updateUserUI(user) {
  const avatarEl = document.getElementById('userAvatar');
  const nameEl = document.getElementById('userName');
  const emailEl = document.getElementById('userEmail');
  const statusEl = document.getElementById('loginStatus');
  
  if (nameEl) nameEl.textContent = user.name || 'User';
  if (emailEl) emailEl.textContent = user.email || '-';
  
  if (avatarEl) {
    if (user.picture) {
      avatarEl.innerHTML = `<img src="${user.picture}" alt="Avatar">`;
    } else {
      avatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();
    }
  }
  
  if (statusEl) {
    statusEl.textContent = user.isDemo ? 'Demo Mode' : 'Google Account';
  }
  
  // Update greeting
  updateGreeting();
}

function updateGreeting() {
  const greeting = SyncUtils.getIslamicGreeting();
  const arabicEl = document.getElementById('greetingArabic');
  const textEl = document.getElementById('greetingText');
  
  if (arabicEl) arabicEl.textContent = greeting.arabic;
  if (textEl) textEl.textContent = greeting.text;
  
  // Update date
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    dateEl.textContent = SyncUtils.formatDate(new Date());
  }
}

// ============================================
// DATA LOADING
// ============================================
async function loadAppData() {
  console.log('[App] Loading data...');
  
  // Update date display
  updateGreeting();
  
  // Initialize dzikir
  SyncDzikir.init();
  
  // Try to load from API if configured
  if (SyncConfig.API_URL) {
    try {
      const dailySync = await SyncAPI.get('getDailySync');
      AppState.dailySync = dailySync;
      
      // Update UI with loaded data
      renderDailyQuote(dailySync.quote);
      renderTodayTasks(dailySync.todayTasks);
      renderPomodoroStats(dailySync.pomodoroToday);
      updateSholatProgress(dailySync.sholat);
      
      // Update API status
      const apiStatusEl = document.getElementById('apiStatus');
      if (apiStatusEl) apiStatusEl.textContent = '✅ Terhubung';
      
    } catch (err) {
      console.error('[App] Failed to load data:', err);
      SyncUI.toast.warning('Gagal memuat data: ' + err.message);
      
      const apiStatusEl = document.getElementById('apiStatus');
      if (apiStatusEl) apiStatusEl.textContent = '❌ ' + err.message;
    }
  } else {
    // No API configured, show local data only
    const apiStatusEl = document.getElementById('apiStatus');
    if (apiStatusEl) apiStatusEl.textContent = 'Tidak dikonfigurasi';
  }
  
  // Sync pending queue
  SyncAPI.syncPendingQueue();
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderDailyQuote(quote) {
  const container = document.getElementById('dailyQuote');
  if (!container) return;
  
  if (quote) {
    container.innerHTML = `
      <p>"${SyncUtils.escapeHtml(quote.text)}"</p>
      <p class="text-small mt-md">— ${SyncUtils.escapeHtml(quote.author)}</p>
    `;
  } else {
    container.innerHTML = `<em>Tidak ada quote</em>`;
  }
}

function renderTodayTasks(tasks) {
  const container = document.getElementById('todayTasks');
  if (!container) return;
  
  if (!tasks || tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="icon">✅</span>
        <p>Tidak ada tugas hari ini</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = tasks.map(task => `
    <div class="task-item" style="padding: 12px; border-bottom: 1px solid var(--gray-100);">
      <div style="font-weight: 500;">${SyncUtils.escapeHtml(task.title)}</div>
      <div class="text-small text-muted">${task.priority} • ${task.status}</div>
    </div>
  `).join('');
}

function renderPomodoroStats(stats) {
  const container = document.getElementById('pomodoroStats');
  if (!container) return;
  
  const sessions = stats?.sessions || 0;
  const minutes = stats?.totalMinutes || 0;
  
  container.innerHTML = `
    <p class="text-center text-muted">${sessions} sesi • ${minutes} menit fokus</p>
  `;
}

function updateSholatProgress(sholat) {
  const el = document.getElementById('sholatProgress');
  if (!el) return;
  
  const sholatWaktu = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
  let completed = 0;
  
  if (sholat) {
    sholatWaktu.forEach(waktu => {
      if (sholat[waktu]) completed++;
    });
  }
  
  el.textContent = `${completed}/5`;
}

// ============================================
// POMODORO FUNCTIONS
// ============================================
function setPomodoro(minutes) {
  AppState.pomodoro.duration = minutes;
  AppState.pomodoro.remaining = minutes * 60;
  updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
  const timeEl = document.getElementById('pomodoroTime');
  if (!timeEl) return;
  
  const mins = Math.floor(AppState.pomodoro.remaining / 60);
  const secs = AppState.pomodoro.remaining % 60;
  
  timeEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function togglePomodoro() {
  const btn = document.getElementById('pomodoroStartBtn');
  
  if (AppState.pomodoro.active) {
    // Stop
    clearInterval(AppState.pomodoro.interval);
    AppState.pomodoro.active = false;
    if (btn) btn.textContent = '▶️ Mulai';
  } else {
    // Start
    AppState.pomodoro.active = true;
    if (btn) btn.textContent = '⏸️ Pause';
    
    AppState.pomodoro.interval = setInterval(() => {
      AppState.pomodoro.remaining--;
      updatePomodoroDisplay();
      
      if (AppState.pomodoro.remaining <= 0) {
        // Timer complete
        clearInterval(AppState.pomodoro.interval);
        AppState.pomodoro.active = false;
        if (btn) btn.textContent = '▶️ Mulai';
        
        // Vibrate
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        // Show toast
        SyncUI.toast.success('🍅 Pomodoro selesai! Istirahat sejenak.');
        
        // Log to API
        if (SyncConfig.API_URL) {
          SyncAPI.addToQueue('logPomodoro', {
            type: 'pomodoro',
            duration_minutes: AppState.pomodoro.duration
          });
        }
        
        // Reset
        AppState.pomodoro.remaining = AppState.pomodoro.duration * 60;
        updatePomodoroDisplay();
      }
    }, 1000);
  }
}

// ============================================
// TASK FUNCTIONS
// ============================================
function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const dueDate = document.getElementById('taskDueDate').value;
  const priority = document.getElementById('taskPriority').value;
  
  if (!title) {
    SyncUI.toast.warning('Judul task tidak boleh kosong');
    return;
  }
  
  const taskData = {
    title,
    description,
    due_date: dueDate,
    priority,
    status: 'TODO'
  };
  
  // Add to queue for sync
  SyncAPI.addToQueue('addTask', taskData);
  
  // Clear form
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDescription').value = '';
  document.getElementById('taskDueDate').value = '';
  document.getElementById('taskPriority').value = 'normal';
  
  // Close modal
  closeModal('task');
  
  SyncUI.toast.success('Task ditambahkan');
  
  // Sync
  SyncAPI.syncPendingQueue();
}

// ============================================
// SYNC FUNCTIONS
// ============================================
function manualSync() {
  SyncUI.toast.info('Menyinkronkan...');
  
  SyncAPI.syncPendingQueue().then(result => {
    if (result.success > 0) {
      SyncUI.toast.success(`${result.success} item berhasil disinkronkan`);
      // Reload data
      loadAppData();
    } else if (result.failed > 0) {
      SyncUI.toast.error(`${result.failed} item gagal disinkronkan`);
    } else {
      SyncUI.toast.info('Tidak ada yang perlu disinkronkan');
    }
  }).catch(err => {
    SyncUI.toast.error('Sync gagal: ' + err.message);
  });
}

// Override API sync indicator
SyncAPI.updateSyncIndicator = function() {
  SyncUI.updateSyncIndicator(this.getPendingCount());
};

// ============================================
// PAGE NAVIGATION
// ============================================
window.addEventListener('pagechange', (e) => {
  const page = e.detail.page;
  AppState.currentPage = page;
  
  // Sync pending when changing pages
  if (SyncAPI.getPendingCount() > 0) {
    SyncAPI.syncPendingQueue();
  }
  
  // Page-specific initialization
  switch(page) {
    case 'dzikir':
      if (!SyncDzikir.state.sortedData.length) {
        SyncDzikir.init();
      }
      break;
    case 'settings':
      updateSettingsPage();
      break;
  }
});

function updateSettingsPage() {
  // Update pending count
  const pendingEl = document.getElementById('settingPendingCount');
  if (pendingEl) {
    pendingEl.textContent = SyncAPI.getPendingCount();
  }
}

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('[SW] Registered:', reg.scope);
      })
      .catch(err => {
        console.log('[SW] Registration failed:', err);
      });
  });
}

// ============================================
// INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', initApp);

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
window.addEventListener('error', (e) => {
  console.error('[App] Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[App] Unhandled promise rejection:', e.reason);
});
