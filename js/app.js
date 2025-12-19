/* ============================================
   APP.JS - Core Navigation & Global Functions
   ============================================ */

// ===== NAVIGATION =====
function navigateTo(page) {
  const pages = ['tasks','goals','pomodoro','ibadah','dzikir','journal','vision','review','wisdom','braindump','settings'];
  if (pages.includes(page)) {
    window.location.href = 'pages/' + page + '.html';
  }
}

function goHome() {
  const isInPages = window.location.pathname.includes('/pages/');
  window.location.href = isInPages ? '../index.html' : 'index.html';
}

function goBack() { window.history.back(); }

// ===== HEADER =====
function renderHeader(options = {}) {
  const header = document.getElementById('appHeader');
  if (!header) return;
  
  if (options.simple) {
    header.innerHTML = `<div class="header-top"><button class="back-btn" onclick="goBack()">← Kembali</button><h1>${options.title || ''}</h1></div>`;
    header.className = 'header simple';
    return;
  }
  
  const dateStr = formatDate(new Date());
  const sholat = loadSholat();
  const sholatDone = Object.values(sholat).filter(s => s?.done).length;
  const dzikir = loadDzikir();
  const dzikirDone = DZIKIR_LIST.filter(d => (dzikir[d.id] || 0) >= d.count).length;
  
  header.innerHTML = `
    <div class="header-top">
      <div><h1>Sync Planner</h1><div class="header-date">${dateStr}</div></div>
      <button class="sync-btn" onclick="syncData()"><span>🔄</span><span id="syncCount">${AppState.sync.pending}</span></button>
    </div>
    <div class="header-greeting">
      <div class="arabic">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
      <div class="translation">Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang</div>
    </div>
    <div class="header-stats">
      <div class="stats-left">
        <div class="stat-item clickable" onclick="navigateTo('ibadah')"><span>🕌</span><span class="value">${sholatDone}/8</span></div>
        <div class="stat-item clickable" onclick="navigateTo('dzikir')"><span>📿</span><span class="value">${dzikirDone}/13</span></div>
      </div>
      <div class="quick-icons">
        <button class="quick-icon-btn" onclick="showQuickBrainDump()">💭</button>
        <button class="quick-icon-btn" onclick="showWisdomQuote()">🏛️</button>
      </div>
    </div>
  `;
}

// ===== BOTTOM NAV =====
function renderBottomNav(active = 'home') {
  const nav = document.getElementById('bottomNav');
  if (!nav) return;
  nav.innerHTML = `
    <button class="nav-item ${active==='menu'?'active':''}" onclick="showMenu()"><span class="icon">☰</span><span>Menu</span></button>
    <button class="nav-item ${active==='pomodoro'?'active':''}" onclick="navigateTo('pomodoro')"><span class="icon">🍅</span><span>Fokus</span></button>
    <button class="nav-item ${active==='home'?'active':''}" onclick="goHome()"><span class="icon">🏠</span><span>Home</span></button>
    <button class="nav-item ${active==='tasks'?'active':''}" onclick="navigateTo('tasks')"><span class="icon">✅</span><span>Tasks</span></button>
    <button class="nav-item ${active==='goals'?'active':''}" onclick="navigateTo('goals')"><span class="icon">🎯</span><span>Goals</span></button>
  `;
}

// ===== MENU =====
function showMenu() {
  const menuHTML = `
    <div class="menu-overlay" id="menuOverlay" onclick="closeMenu()">
      <div class="menu-panel" onclick="event.stopPropagation()">
        <div class="menu-header"><h3>Menu</h3><button onclick="closeMenu()">✕</button></div>
        <div class="menu-content">
          <div class="menu-section">
            <div class="menu-section-title">📋 Produktivitas</div>
            <div class="menu-item" onclick="navigateTo('tasks')"><span>✅</span> Tasks</div>
            <div class="menu-item" onclick="navigateTo('goals')"><span>🎯</span> Goals 12 Minggu</div>
            <div class="menu-item" onclick="navigateTo('pomodoro')"><span>🍅</span> Pomodoro Timer</div>
          </div>
          <div class="menu-section">
            <div class="menu-section-title">🕌 Ibadah</div>
            <div class="menu-item" onclick="navigateTo('ibadah')"><span>🕌</span> Tracker Sholat</div>
            <div class="menu-item" onclick="navigateTo('dzikir')"><span>📿</span> Dzikir Pagi/Sore (13)</div>
          </div>
          <div class="menu-section">
            <div class="menu-section-title">📝 Refleksi</div>
            <div class="menu-item" onclick="navigateTo('journal')"><span>📓</span> Jurnal Pagi/Malam</div>
            <div class="menu-item" onclick="navigateTo('braindump')"><span>💭</span> Brain Dump & Don't List</div>
            <div class="menu-item" onclick="navigateTo('review')"><span>📊</span> Weekly Review</div>
          </div>
          <div class="menu-section">
            <div class="menu-section-title">🎯 Visi & Wisdom</div>
            <div class="menu-item" onclick="navigateTo('vision')"><span>🔭</span> Piramida Visi</div>
            <div class="menu-item" onclick="navigateTo('wisdom')"><span>🏛️</span> Wisdom Stoik (80 Situasi)</div>
          </div>
          <div class="menu-section">
            <div class="menu-item" onclick="navigateTo('settings')"><span>⚙️</span> Pengaturan</div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', menuHTML);
  setTimeout(() => document.getElementById('menuOverlay').classList.add('active'), 10);
}

function closeMenu() {
  const overlay = document.getElementById('menuOverlay');
  if (overlay) { overlay.classList.remove('active'); setTimeout(() => overlay.remove(), 300); }
}

// ===== SYNC =====
function syncData() {
  AppState.sync.pending = 0;
  const el = document.getElementById('syncCount');
  if (el) el.textContent = '0';
  showToast('✓ Tersinkronisasi', 'success');
}

// ===== TOAST =====
function showToast(msg, type = 'info') {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ===== MODAL =====
function openModal(content) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = 'activeModal';
  overlay.innerHTML = content;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
}

function closeModal() { document.getElementById('activeModal')?.remove(); }

// ===== QUICK ACTIONS =====
function showQuickBrainDump() {
  openModal(`<div class="modal"><div class="modal-header"><h3 class="modal-title">💭 Brain Dump</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body"><div class="form-group"><textarea class="form-input form-textarea" id="bdText" rows="4" placeholder="Tulis apapun..."></textarea></div>
    <button class="btn-submit" onclick="saveBrainDump()">Simpan</button></div></div>`);
}

function saveBrainDump() {
  const text = document.getElementById('bdText')?.value.trim();
  if (!text) { showToast('Tulis sesuatu', 'error'); return; }
  const dumps = loadBrainDump();
  dumps.unshift({ id: generateId(), text, createdAt: new Date().toISOString() });
  Storage.save('braindump', dumps);
  closeModal();
  showToast('✓ Tersimpan', 'success');
}

function showWisdomQuote() {
  const q = getRandomQuote();
  openModal(`<div class="modal" style="background:linear-gradient(135deg,#1a1f2e,#0d1117);color:white;">
    <div class="modal-body" style="text-align:center;padding:30px;">
      <div style="font-size:40px;margin-bottom:16px;">🏛️</div>
      <div style="font-size:16px;line-height:1.6;margin-bottom:16px;">"${q.text}"</div>
      <div style="color:#d4a853;margin-bottom:24px;">— ${q.source}</div>
      <button onclick="closeModal()" style="padding:10px 24px;border-radius:8px;border:none;background:#d4a853;color:#1a1a1a;font-weight:600;cursor:pointer;">Tutup</button>
    </div></div>`);
}

function showAddTask() {
  openModal(`<div class="modal"><div class="modal-header"><h3 class="modal-title">➕ Tambah Task</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label class="form-label">Judul</label><input type="text" class="form-input" id="taskTitle" placeholder="Apa yang perlu dikerjakan?"></div>
      <div class="form-group"><label class="form-label">Prioritas</label><select class="form-input" id="taskPriority"><option value="high">🔴 High</option><option value="medium" selected>🟡 Medium</option><option value="low">🟢 Low</option></select></div>
      <button class="btn-submit" onclick="saveNewTask()">Simpan</button>
    </div></div>`);
}

function saveNewTask() {
  const title = document.getElementById('taskTitle')?.value.trim();
  if (!title) { showToast('Judul tidak boleh kosong', 'error'); return; }
  const tasks = loadTasks();
  tasks.push({ id: generateId(), title, priority: document.getElementById('taskPriority').value, done: false, status: 'todo', createdAt: new Date().toISOString() });
  Storage.save('tasks', tasks);
  closeModal();
  showToast('✓ Task ditambahkan', 'success');
  if (typeof renderHome === 'function') renderHome();
}

// ===== TOGGLE FUNCTIONS =====
function toggleSholat(id) {
  const sholat = loadSholat();
  if (!sholat[id]) sholat[id] = {};
  sholat[id].done = !sholat[id].done;
  Storage.saveToday('sholat', sholat);
  if (typeof renderHeader === 'function') renderHeader();
  if (typeof renderSholat === 'function') renderSholat();
  if (typeof renderHome === 'function') renderHome();
}

function toggleHabit(id) {
  const habits = loadHabits();
  habits[id] = !habits[id];
  Storage.saveToday('habits', habits);
  if (typeof renderHeader === 'function') renderHeader();
  if (typeof renderHabits === 'function') renderHabits();
  if (typeof renderHome === 'function') renderHome();
}

function toggleTask(id) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === id);
  if (task) { task.done = !task.done; Storage.save('tasks', tasks); }
  if (typeof renderTasks === 'function') renderTasks();
  if (typeof renderHome === 'function') renderHome();
}

// ===== INJECT MENU STYLES =====
const menuStyles = document.createElement('style');
menuStyles.textContent = `
.menu-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;opacity:0;visibility:hidden;transition:all 0.3s}
.menu-overlay.active{opacity:1;visibility:visible}
.menu-panel{position:absolute;left:0;top:0;bottom:0;width:280px;max-width:80%;background:white;transform:translateX(-100%);transition:transform 0.3s;overflow-y:auto}
.menu-overlay.active .menu-panel{transform:translateX(0)}
.menu-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #eee}
.menu-header h3{font-size:18px;margin:0}
.menu-header button{background:none;border:none;font-size:20px;cursor:pointer}
.menu-content{padding:12px}
.menu-section{margin-bottom:16px}
.menu-section-title{font-size:11px;font-weight:600;color:#666;text-transform:uppercase;padding:8px 12px}
.menu-item{display:flex;align-items:center;gap:12px;padding:12px;cursor:pointer;border-radius:8px;font-size:14px}
.menu-item:hover{background:#f5f5f5}
.menu-item span:first-child{font-size:18px}
.header.simple{padding:12px 16px}
.header.simple .header-top{margin-bottom:0;display:flex;align-items:center}
.header.simple .back-btn{background:none;border:none;color:white;font-size:14px;cursor:pointer;padding:0;margin-right:12px}
.header.simple h1{font-size:16px;margin:0}
`;
document.head.appendChild(menuStyles);
