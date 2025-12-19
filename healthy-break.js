/**
 * ============================================
 * HEALTHY BREAK SYSTEM
 * Pengingat Istirahat Sehat untuk Sync Planner
 * ============================================
 * Version: 1.0
 * Fitur:
 * - Pengingat istirahat setelah Pomodoro
 * - 6 pilihan aktivitas sehat
 * - Timer countdown
 * - Streak tracking
 * - Sedona Method integration
 */

// ============================================
// CONFIGURATION
// ============================================
const HEALTHY_BREAK_CONFIG = {
  activities: [
    {
      id: 'stretching',
      name: 'Stretching',
      icon: '🧘',
      duration: 2,
      description: 'Regangkan otot leher, bahu, dan punggung',
      steps: [
        'Berdiri dari kursi',
        'Putar kepala perlahan ke kiri-kanan (10 detik)',
        'Angkat bahu ke telinga, tahan 5 detik',
        'Regangkan tangan ke atas (10 detik)',
        'Sentuh ujung kaki atau tekuk badan (10 detik)'
      ],
      category: 'physical'
    },
    {
      id: 'wudhu',
      name: 'Wudhu',
      icon: '💧',
      duration: 3,
      description: 'Berwudhu untuk menyegarkan pikiran dan tubuh',
      steps: [
        'Niat dalam hati',
        'Basuh kedua tangan 3x',
        'Berkumur 3x',
        'Basuh muka 3x',
        'Basuh tangan sampai siku 3x',
        'Usap kepala',
        'Basuh kaki 3x'
      ],
      category: 'spiritual',
      recommendedAfter: 90
    },
    {
      id: 'walk',
      name: 'Jalan Keluar',
      icon: '🚶',
      duration: 5,
      description: 'Jalan keluar ruangan untuk udara segar',
      steps: [
        'Berdiri dan jalan keluar ruangan',
        'Hirup udara segar dalam-dalam',
        'Lakukan 20 langkah jalan santai',
        'Lihat pemandangan hijau jika ada',
        'Kembali dengan perasaan segar'
      ],
      category: 'physical'
    },
    {
      id: 'pushup',
      name: 'Push-up Ringan',
      icon: '💪',
      duration: 2,
      description: 'Push-up atau squat ringan untuk aliran darah',
      steps: [
        'Posisi push-up atau squat',
        'Lakukan 10-15 repetisi',
        'Istirahat 10 detik',
        'Ulangi 1 set lagi',
        'Tarik napas dalam'
      ],
      category: 'physical'
    },
    {
      id: 'dzikir',
      name: 'Dzikir Singkat',
      icon: '📿',
      duration: 2,
      description: 'Dzikir pendek untuk menenangkan hati',
      steps: [
        'Duduk dengan tenang',
        'Baca Subhanallah 10x',
        'Baca Alhamdulillah 10x',
        'Baca Allahu Akbar 10x',
        'Istighfar 3x'
      ],
      category: 'spiritual'
    },
    {
      id: 'eye_rest',
      name: 'Istirahat Mata',
      icon: '👁️',
      duration: 1,
      description: 'Teknik 20-20-20 untuk mata',
      steps: [
        'Tutup mata selama 20 detik',
        'Buka dan lihat objek 20 meter (jauh)',
        'Tahan selama 20 detik',
        'Kedipkan mata 20x',
        'Ulangi sekali lagi'
      ],
      category: 'physical'
    }
  ],
  
  rules: {
    mandatoryAfter: 90,      // Wajib break setelah 90 menit
    allowSkipBefore: 60,     // Boleh skip jika < 60 menit
    maxSkipsPerDay: 3,       // Max 3x skip per hari
    suggestWudhuAfter: 90    // Suggest wudhu setelah 90 menit
  },
  
  sedonaPrompts: [
    "Bisakah aku melepas kebutuhan akan pelepasan instan ini... sedikit saja?",
    "Apakah aku memilih untuk melepaskan perasaan ini sekarang?",
    "Bisakah aku membiarkan perasaan ini ada, tanpa bereaksi?",
    "Apakah aku bersedia melepaskan keinginan untuk mengontrol ini?",
    "Bisakah aku menerima bahwa aku bisa rileks tanpa perlu distraksi?"
  ]
};

// ============================================
// STATE
// ============================================
let healthyBreakState = {
  stats: {
    totalBreaks: 0,
    healthyBreaks: 0,
    skippedBreaks: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastBreakTime: null,
    activitiesCompleted: {}
  },
  currentBreak: {
    inProgress: false,
    startTime: null,
    selectedActivity: null,
    pomodoroType: null,
    totalMinutesToday: 0
  },
  settings: {
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    showSteps: true
  },
  breakTimer: {
    interval: null,
    remaining: 0
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function todayString() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getRandomSedonaPrompt() {
  const prompts = HEALTHY_BREAK_CONFIG.sedonaPrompts;
  return prompts[Math.floor(Math.random() * prompts.length)];
}

// ============================================
// SOUND & HAPTICS
// ============================================
function playBreakNotificationSound() {
  if (!healthyBreakState.settings.soundEnabled) return;
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + (i * 0.15);
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  } catch (e) {
    console.log('Audio not available');
  }
}

function playBreakCompleteSound() {
  if (!healthyBreakState.settings.soundEnabled) return;
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + (i * 0.12);
      gainNode.gain.setValueAtTime(0.35, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });
  } catch (e) {
    console.log('Audio not available');
  }
}

function vibrateDevice(pattern) {
  if (!healthyBreakState.settings.vibrationEnabled) return;
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// ============================================
// DATA PERSISTENCE
// ============================================
function loadHealthyBreakData() {
  const today = todayString();
  
  // Load today's stats
  const savedStats = localStorage.getItem(`healthyBreak_${today}`);
  if (savedStats) {
    const parsed = JSON.parse(savedStats);
    healthyBreakState.stats = { ...healthyBreakState.stats, ...parsed };
  } else {
    // Reset daily stats
    healthyBreakState.stats.totalBreaks = 0;
    healthyBreakState.stats.healthyBreaks = 0;
    healthyBreakState.stats.skippedBreaks = 0;
    healthyBreakState.stats.activitiesCompleted = {};
  }
  
  // Load persistent streak
  const savedStreak = localStorage.getItem('healthyBreakStreak');
  if (savedStreak) {
    const streakData = JSON.parse(savedStreak);
    healthyBreakState.stats.currentStreak = streakData.current || 0;
    healthyBreakState.stats.longestStreak = streakData.longest || 0;
    healthyBreakState.stats.lastBreakTime = streakData.lastTime || null;
  }
  
  // Load settings
  const savedSettings = localStorage.getItem('healthyBreakSettings');
  if (savedSettings) {
    healthyBreakState.settings = { ...healthyBreakState.settings, ...JSON.parse(savedSettings) };
  }
}

function saveHealthyBreakData() {
  const today = todayString();
  
  // Save today's stats
  localStorage.setItem(`healthyBreak_${today}`, JSON.stringify({
    totalBreaks: healthyBreakState.stats.totalBreaks,
    healthyBreaks: healthyBreakState.stats.healthyBreaks,
    skippedBreaks: healthyBreakState.stats.skippedBreaks,
    activitiesCompleted: healthyBreakState.stats.activitiesCompleted
  }));
  
  // Save streak (persistent)
  localStorage.setItem('healthyBreakStreak', JSON.stringify({
    current: healthyBreakState.stats.currentStreak,
    longest: healthyBreakState.stats.longestStreak,
    lastTime: healthyBreakState.stats.lastBreakTime
  }));
}

function saveHealthyBreakSettings() {
  localStorage.setItem('healthyBreakSettings', JSON.stringify(healthyBreakState.settings));
}

// ============================================
// MAIN TRIGGER FUNCTION
// ============================================
function triggerHealthyBreakReminder(context = {}) {
  if (!healthyBreakState.settings.enabled) return;
  
  const { type = 'focus', duration = 25, totalMinutesToday = 0, task = '' } = context;
  
  healthyBreakState.currentBreak = {
    inProgress: true,
    startTime: new Date(),
    selectedActivity: null,
    pomodoroType: type,
    totalMinutesToday: totalMinutesToday
  };
  
  // Play notification
  playBreakNotificationSound();
  vibrateDevice([200, 100, 200, 100, 300]);
  
  // Show modal
  showHealthyBreakModal(duration, totalMinutesToday, task);
}

// ============================================
// MODAL UI
// ============================================
function showHealthyBreakModal(duration, totalMinutes, task) {
  // Remove existing modal
  const existing = document.getElementById('healthyBreakModal');
  if (existing) existing.remove();
  
  const suggestWudhu = totalMinutes >= HEALTHY_BREAK_CONFIG.rules.suggestWudhuAfter;
  const canSkip = totalMinutes < HEALTHY_BREAK_CONFIG.rules.mandatoryAfter && 
                  healthyBreakState.stats.skippedBreaks < HEALTHY_BREAK_CONFIG.rules.maxSkipsPerDay;
  
  const sedonaPrompt = getRandomSedonaPrompt();
  
  // Build activity cards HTML
  let activitiesHTML = '';
  HEALTHY_BREAK_CONFIG.activities.forEach(activity => {
    const isRecommended = activity.id === 'wudhu' && suggestWudhu;
    activitiesHTML += `
      <div class="break-activity-card ${isRecommended ? 'recommended' : ''}" 
           onclick="selectBreakActivity('${activity.id}')" 
           id="breakActivity_${activity.id}">
        <div class="break-activity-icon">${activity.icon}</div>
        <div class="break-activity-name">${activity.name}</div>
        <div class="break-activity-duration">${activity.duration} menit</div>
        ${isRecommended ? '<div style="font-size:10px;color:#f59e0b;margin-top:4px;">⭐ Direkomendasikan</div>' : ''}
      </div>
    `;
  });
  
  const modalHTML = `
    <div class="modal-overlay active" id="healthyBreakModal" onclick="event.target.id === 'healthyBreakModal' ? null : null">
      <div class="modal healthy-break-modal" style="max-width:420px;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#10b981,#059669);color:white;padding:20px;border-radius:20px 20px 0 0;">
          <div style="text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">🧘</div>
            <h2 style="font-size:20px;font-weight:600;margin-bottom:4px;">Waktunya Istirahat Sehat</h2>
            <p style="font-size:13px;opacity:0.9;">Jangan langsung pegang HP!</p>
          </div>
        </div>
        
        <div class="modal-body" style="padding:20px;">
          <!-- Message -->
          <div class="break-message-box">
            <div class="break-message-text">
              Kamu sudah fokus <strong>${duration} menit</strong> ${task ? `untuk "${task}"` : ''}
            </div>
          </div>
          
          <!-- Sedona Prompt -->
          <div class="sedona-prompt-box">
            <div class="sedona-prompt-text">"${sedonaPrompt}"</div>
          </div>
          
          <!-- Activity Selection -->
          <div style="margin-bottom:16px;">
            <div style="font-size:14px;font-weight:600;color:#333;margin-bottom:12px;">
              Pilih Aktivitas Istirahat:
            </div>
            <div class="break-activity-grid">
              ${activitiesHTML}
            </div>
          </div>
          
          <!-- Activity Details (hidden initially) -->
          <div id="breakActivityDetails" style="display:none;">
            <div class="break-activity-steps" id="breakActivitySteps"></div>
            
            <!-- Timer -->
            <div id="breakTimerSection" style="display:none;text-align:center;margin-top:16px;">
              <div class="break-timer-display" id="breakTimerDisplay">00:00</div>
              <div class="break-progress-bar">
                <div class="break-progress-fill" id="breakProgressFill" style="width:100%;"></div>
              </div>
            </div>
          </div>
          
          <!-- Streak Stats -->
          <div class="break-streak-stats">
            <div class="break-streak-stat">
              <div class="break-streak-value">${healthyBreakState.stats.currentStreak}🔥</div>
              <div class="break-streak-label">Streak</div>
            </div>
            <div class="break-streak-stat">
              <div class="break-streak-value">${healthyBreakState.stats.healthyBreaks}</div>
              <div class="break-streak-label">Hari Ini</div>
            </div>
            <div class="break-streak-stat">
              <div class="break-streak-value">${healthyBreakState.stats.longestStreak}</div>
              <div class="break-streak-label">Terbaik</div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="break-action-buttons">
            <button class="break-btn-complete" id="breakCompleteBtn" onclick="completeHealthyBreak()" disabled>
              ✓ Pilih Aktivitas Dulu
            </button>
            ${canSkip ? `
              <button class="break-btn-skip" onclick="skipHealthyBreak()">
                Skip
              </button>
            ` : ''}
          </div>
          
          ${!canSkip ? `
            <div style="text-align:center;margin-top:12px;font-size:12px;color:#ef4444;">
              ${totalMinutes >= HEALTHY_BREAK_CONFIG.rules.mandatoryAfter 
                ? '⚠️ Sudah 90+ menit, istirahat wajib!' 
                : `⚠️ Sudah skip ${healthyBreakState.stats.skippedBreaks}x hari ini`}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ============================================
// ACTIVITY SELECTION
// ============================================
function selectBreakActivity(activityId) {
  const activity = HEALTHY_BREAK_CONFIG.activities.find(a => a.id === activityId);
  if (!activity) return;
  
  healthyBreakState.currentBreak.selectedActivity = activity;
  
  // Update visual selection
  document.querySelectorAll('.break-activity-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.getElementById(`breakActivity_${activityId}`).classList.add('selected');
  
  // Show activity details
  const detailsEl = document.getElementById('breakActivityDetails');
  detailsEl.style.display = 'block';
  
  // Show steps
  if (healthyBreakState.settings.showSteps) {
    let stepsHTML = `
      <div style="font-size:13px;font-weight:600;color:#333;margin-bottom:10px;">
        ${activity.icon} ${activity.name} - ${activity.description}
      </div>
    `;
    activity.steps.forEach((step, i) => {
      stepsHTML += `
        <div class="break-step-item">
          <div class="break-step-number">${i + 1}</div>
          <div>${step}</div>
        </div>
      `;
    });
    document.getElementById('breakActivitySteps').innerHTML = stepsHTML;
  }
  
  // Start timer
  startBreakTimer(activity.duration);
  
  // Update button
  const btn = document.getElementById('breakCompleteBtn');
  btn.textContent = `⏱️ Tunggu ${activity.duration} menit...`;
  btn.disabled = true;
}

// ============================================
// BREAK TIMER
// ============================================
function startBreakTimer(minutes) {
  const timerSection = document.getElementById('breakTimerSection');
  timerSection.style.display = 'block';
  
  const totalSeconds = minutes * 60;
  healthyBreakState.breakTimer.remaining = totalSeconds;
  
  // Clear existing interval
  if (healthyBreakState.breakTimer.interval) {
    clearInterval(healthyBreakState.breakTimer.interval);
  }
  
  updateBreakTimerDisplay(totalSeconds, totalSeconds);
  
  healthyBreakState.breakTimer.interval = setInterval(() => {
    healthyBreakState.breakTimer.remaining--;
    updateBreakTimerDisplay(healthyBreakState.breakTimer.remaining, totalSeconds);
    
    if (healthyBreakState.breakTimer.remaining <= 0) {
      clearInterval(healthyBreakState.breakTimer.interval);
      onBreakTimerComplete();
    }
  }, 1000);
}

function updateBreakTimerDisplay(remaining, total) {
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  
  document.getElementById('breakTimerDisplay').textContent = display;
  
  const progress = (remaining / total) * 100;
  document.getElementById('breakProgressFill').style.width = `${progress}%`;
}

function onBreakTimerComplete() {
  playBreakCompleteSound();
  vibrateDevice([100, 50, 100, 50, 200]);
  
  const btn = document.getElementById('breakCompleteBtn');
  btn.textContent = '✓ Selesai! Tap untuk Lanjut';
  btn.disabled = false;
  btn.style.animation = 'pulse 1s infinite';
}

// ============================================
// COMPLETE / SKIP ACTIONS
// ============================================
function completeHealthyBreak() {
  const activity = healthyBreakState.currentBreak.selectedActivity;
  if (!activity) return;
  
  // Clear timer
  if (healthyBreakState.breakTimer.interval) {
    clearInterval(healthyBreakState.breakTimer.interval);
  }
  
  // Update stats
  healthyBreakState.stats.totalBreaks++;
  healthyBreakState.stats.healthyBreaks++;
  healthyBreakState.stats.currentStreak++;
  healthyBreakState.stats.lastBreakTime = new Date().toISOString();
  
  // Track activity
  if (!healthyBreakState.stats.activitiesCompleted[activity.id]) {
    healthyBreakState.stats.activitiesCompleted[activity.id] = 0;
  }
  healthyBreakState.stats.activitiesCompleted[activity.id]++;
  
  // Update longest streak
  if (healthyBreakState.stats.currentStreak > healthyBreakState.stats.longestStreak) {
    healthyBreakState.stats.longestStreak = healthyBreakState.stats.currentStreak;
  }
  
  // Save
  saveHealthyBreakData();
  
  // Update header if exists
  updateBreakStatsHeader();
  
  // Close modal
  closeHealthyBreakModal();
  
  // Show toast
  if (typeof showToast === 'function') {
    showToast(`${activity.icon} Istirahat sehat selesai! Streak: ${healthyBreakState.stats.currentStreak}🔥`, 'success');
  }
  
  // Reset current break
  healthyBreakState.currentBreak = {
    inProgress: false,
    startTime: null,
    selectedActivity: null,
    pomodoroType: null,
    totalMinutesToday: 0
  };
}

function skipHealthyBreak() {
  const canSkip = healthyBreakState.currentBreak.totalMinutesToday < HEALTHY_BREAK_CONFIG.rules.mandatoryAfter &&
                  healthyBreakState.stats.skippedBreaks < HEALTHY_BREAK_CONFIG.rules.maxSkipsPerDay;
  
  if (!canSkip) {
    if (typeof showToast === 'function') {
      showToast('⚠️ Tidak bisa skip! Istirahat dulu ya.', 'warning');
    }
    return;
  }
  
  if (!confirm('Yakin mau skip istirahat sehat?\n\nIngat: Istirahat sebentar akan meningkatkan produktivitas!')) {
    return;
  }
  
  // Clear timer
  if (healthyBreakState.breakTimer.interval) {
    clearInterval(healthyBreakState.breakTimer.interval);
  }
  
  // Update stats
  healthyBreakState.stats.totalBreaks++;
  healthyBreakState.stats.skippedBreaks++;
  
  // Reset streak if too many skips
  if (healthyBreakState.stats.skippedBreaks >= HEALTHY_BREAK_CONFIG.rules.maxSkipsPerDay) {
    healthyBreakState.stats.currentStreak = 0;
  }
  
  // Save
  saveHealthyBreakData();
  
  // Update header if exists
  updateBreakStatsHeader();
  
  // Close modal
  closeHealthyBreakModal();
  
  // Show toast
  if (typeof showToast === 'function') {
    showToast(`⏭️ Istirahat di-skip (${healthyBreakState.stats.skippedBreaks}/${HEALTHY_BREAK_CONFIG.rules.maxSkipsPerDay})`, 'warning');
  }
  
  // Reset current break
  healthyBreakState.currentBreak = {
    inProgress: false,
    startTime: null,
    selectedActivity: null,
    pomodoroType: null,
    totalMinutesToday: 0
  };
}

function closeHealthyBreakModal() {
  const modal = document.getElementById('healthyBreakModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// ============================================
// HEADER STATS UPDATE
// ============================================
function updateBreakStatsHeader() {
  const streakEl = document.getElementById('breakStreak');
  if (streakEl) {
    streakEl.textContent = `${healthyBreakState.stats.currentStreak}🔥`;
  }
}

// ============================================
// SETTINGS MODAL
// ============================================
function openBreakSettingsModal() {
  const existing = document.getElementById('breakSettingsModal');
  if (existing) existing.remove();
  
  const modalHTML = `
    <div class="modal-overlay active" id="breakSettingsModal" onclick="if(event.target.id === 'breakSettingsModal') closeBreakSettingsModal()">
      <div class="modal" style="max-width:380px;">
        <div class="modal-header">
          <h3 class="modal-title">🧘 Pengaturan Istirahat</h3>
          <button class="modal-close" onclick="closeBreakSettingsModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="break-setting-checkbox" onclick="toggleBreakSetting('enabled')">
            <span class="break-setting-label">Aktifkan Pengingat Istirahat</span>
            <input type="checkbox" class="break-checkbox" id="breakSettingEnabled" 
                   ${healthyBreakState.settings.enabled ? 'checked' : ''} onchange="toggleBreakSetting('enabled')">
          </div>
          
          <div class="break-setting-checkbox" onclick="toggleBreakSetting('soundEnabled')">
            <span class="break-setting-label">Suara Notifikasi</span>
            <input type="checkbox" class="break-checkbox" id="breakSettingSoundEnabled" 
                   ${healthyBreakState.settings.soundEnabled ? 'checked' : ''} onchange="toggleBreakSetting('soundEnabled')">
          </div>
          
          <div class="break-setting-checkbox" onclick="toggleBreakSetting('vibrationEnabled')">
            <span class="break-setting-label">Getaran</span>
            <input type="checkbox" class="break-checkbox" id="breakSettingVibrationEnabled" 
                   ${healthyBreakState.settings.vibrationEnabled ? 'checked' : ''} onchange="toggleBreakSetting('vibrationEnabled')">
          </div>
          
          <div class="break-setting-checkbox" onclick="toggleBreakSetting('showSteps')">
            <span class="break-setting-label">Tampilkan Langkah Aktivitas</span>
            <input type="checkbox" class="break-checkbox" id="breakSettingShowSteps" 
                   ${healthyBreakState.settings.showSteps ? 'checked' : ''} onchange="toggleBreakSetting('showSteps')">
          </div>
          
          <!-- Stats Summary -->
          <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee;">
            <div style="font-size:13px;font-weight:600;color:#333;margin-bottom:12px;">Statistik Hari Ini</div>
            <div class="break-streak-stats" style="margin:0;">
              <div class="break-streak-stat">
                <div class="break-streak-value" style="color:#10b981;">${healthyBreakState.stats.healthyBreaks}</div>
                <div class="break-streak-label">Sehat</div>
              </div>
              <div class="break-streak-stat">
                <div class="break-streak-value" style="color:#f59e0b;">${healthyBreakState.stats.skippedBreaks}</div>
                <div class="break-streak-label">Skip</div>
              </div>
              <div class="break-streak-stat">
                <div class="break-streak-value" style="color:#0D47A1;">${healthyBreakState.stats.currentStreak}🔥</div>
                <div class="break-streak-label">Streak</div>
              </div>
            </div>
          </div>
          
          <!-- Reset Button -->
          <button onclick="resetBreakStats()" style="width:100%;margin-top:16px;padding:12px;background:#fee2e2;color:#ef4444;border:none;border-radius:12px;font-size:14px;font-weight:500;cursor:pointer;">
            🗑️ Reset Statistik Hari Ini
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeBreakSettingsModal() {
  const modal = document.getElementById('breakSettingsModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

function toggleBreakSetting(key) {
  healthyBreakState.settings[key] = !healthyBreakState.settings[key];
  
  const checkbox = document.getElementById(`breakSetting${key.charAt(0).toUpperCase() + key.slice(1)}`);
  if (checkbox) {
    checkbox.checked = healthyBreakState.settings[key];
  }
  
  saveHealthyBreakSettings();
}

function resetBreakStats() {
  if (!confirm('Reset semua statistik istirahat hari ini?')) return;
  
  healthyBreakState.stats.totalBreaks = 0;
  healthyBreakState.stats.healthyBreaks = 0;
  healthyBreakState.stats.skippedBreaks = 0;
  healthyBreakState.stats.activitiesCompleted = {};
  
  saveHealthyBreakData();
  updateBreakStatsHeader();
  closeBreakSettingsModal();
  
  if (typeof showToast === 'function') {
    showToast('Statistik istirahat di-reset', 'info');
  }
}

// ============================================
// REFLEKSI PAGE INTEGRATION
// ============================================
function renderBreakStatsForRefleksi() {
  const stats = healthyBreakState.stats;
  const total = stats.healthyBreaks + stats.skippedBreaks;
  const rate = total > 0 ? Math.round((stats.healthyBreaks / total) * 100) : 0;
  
  // Get top activities
  const activities = Object.entries(stats.activitiesCompleted)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  let topActivitiesHTML = '';
  activities.forEach(([id, count]) => {
    const activity = HEALTHY_BREAK_CONFIG.activities.find(a => a.id === id);
    if (activity) {
      topActivitiesHTML += `<span style="margin-right:8px;">${activity.icon}${count}x</span>`;
    }
  });
  
  return `
    <div class="card">
      <div class="card-header">
        <span class="card-title">🧘 Istirahat Sehat</span>
        <span class="break-streak-badge">${stats.currentStreak}🔥</span>
      </div>
      <div class="stats-grid" style="margin-bottom:0;">
        <div class="stat-card" style="padding:12px;">
          <div class="stat-value" style="font-size:24px;color:#10b981;">${stats.healthyBreaks}</div>
          <div class="stat-label">Sehat</div>
        </div>
        <div class="stat-card" style="padding:12px;">
          <div class="stat-value" style="font-size:24px;color:#f59e0b;">${stats.skippedBreaks}</div>
          <div class="stat-label">Skip</div>
        </div>
        <div class="stat-card" style="padding:12px;">
          <div class="stat-value" style="font-size:24px;color:#0D47A1;">${rate}%</div>
          <div class="stat-label">Rate</div>
        </div>
      </div>
      ${topActivitiesHTML ? `
        <div style="margin-top:12px;font-size:13px;color:#666;">
          Aktivitas favorit: ${topActivitiesHTML}
        </div>
      ` : ''}
    </div>
  `;
}

// ============================================
// JOURNALING PROMPT
// ============================================
function getBreakJournalingPrompt() {
  const stats = healthyBreakState.stats;
  return {
    label: '🧘 Istirahat Sehat',
    question: 'Bagaimana istirahat hari ini mempengaruhi produktivitasmu?',
    autoFill: `Sehat: ${stats.healthyBreaks}x, Skip: ${stats.skippedBreaks}x. Streak: ${stats.currentStreak}🔥`
  };
}

// ============================================
// INITIALIZATION
// ============================================
function initHealthyBreakSystem() {
  loadHealthyBreakData();
  updateBreakStatsHeader();
  
  // Check streak reset (if more than 1 day without activity)
  const lastBreak = healthyBreakState.stats.lastBreakTime;
  if (lastBreak) {
    const lastDate = new Date(lastBreak).toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastDate !== today && lastDate !== yesterday) {
      // More than 1 day gap - reset streak
      healthyBreakState.stats.currentStreak = 0;
      saveHealthyBreakData();
    }
  }
  
  console.log('✅ Healthy Break System initialized');
}

// ============================================
// EXPORTS (for integration)
// ============================================
window.initHealthyBreakSystem = initHealthyBreakSystem;
window.triggerHealthyBreakReminder = triggerHealthyBreakReminder;
window.selectBreakActivity = selectBreakActivity;
window.completeHealthyBreak = completeHealthyBreak;
window.skipHealthyBreak = skipHealthyBreak;
window.openBreakSettingsModal = openBreakSettingsModal;
window.closeBreakSettingsModal = closeBreakSettingsModal;
window.toggleBreakSetting = toggleBreakSetting;
window.resetBreakStats = resetBreakStats;
window.renderBreakStatsForRefleksi = renderBreakStatsForRefleksi;
window.getBreakJournalingPrompt = getBreakJournalingPrompt;
window.healthyBreakState = healthyBreakState;
window.HEALTHY_BREAK_CONFIG = HEALTHY_BREAK_CONFIG;
