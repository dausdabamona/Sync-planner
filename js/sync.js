/**
 * SYNC PLANNER - Sync Module
 *
 * Module ini menangani sinkronisasi data dengan Google Sheets
 */

const SyncManager = {
  isSyncing: false,
  lastSyncTime: null,
  syncIntervalId: null,

  /**
   * Initialize sync manager
   */
  init() {
    if (!Config.SYNC_ENABLED) {
      if (Config.DEBUG) console.log('⚠️ Sync disabled in config');
      return;
    }

    if (!Config.GOOGLE_APPS_SCRIPT_URL) {
      console.error('❌ Google Apps Script URL not configured');
      return;
    }

    // Load last sync time
    this.lastSyncTime = localStorage.getItem('sync_lastSyncTime');

    // Auto sync on page visibility change (saat pindah halaman/tab)
    if (Config.AUTO_SYNC) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && AppState.sync.pending > 0) {
          this.syncToCloud();
        }
      });

      // Auto sync on page unload
      window.addEventListener('beforeunload', () => {
        if (AppState.sync.pending > 0) {
          // Gunakan sendBeacon untuk sync saat page closing
          this.syncToCloudBeacon();
        }
      });

      // Periodic sync
      if (Config.SYNC_INTERVAL > 0) {
        this.syncIntervalId = setInterval(() => {
          if (AppState.sync.pending > 0) {
            this.syncToCloud();
          }
        }, Config.SYNC_INTERVAL);
      }
    }

    if (Config.DEBUG) console.log('✓ Sync Manager initialized');

    // Initial sync dari cloud ke local (jika belum ada data local)
    this.loadFromCloud();
  },

  /**
   * Sync semua data ke Google Sheets
   */
  async syncToCloud() {
    if (this.isSyncing) {
      if (Config.DEBUG) console.log('⏳ Sync already in progress...');
      return;
    }

    this.isSyncing = true;

    try {
      if (Config.DEBUG) console.log('📤 Syncing to Google Sheets...');

      // Collect all data
      const allData = {
        dzikir: Storage.load('dzikir', {}),
        sholat: Storage.load('sholat', {}),
        tasks: Storage.load('tasks', []),
        journal: Storage.load('journal', {}),
        pomodoro: Storage.load('pomodoro_sessions', []),
        habits: Storage.load('habits', {}),
        goals: Storage.load('goals', [])
      };

      // Send to Google Sheets
      const response = await fetch(Config.GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'syncAll',
          userId: Config.USER_ID,
          data: allData
        })
      });

      const result = await response.json();

      if (result.success) {
        AppState.sync.pending = 0;
        AppState.sync.lastSync = new Date().toISOString();
        this.lastSyncTime = AppState.sync.lastSync;
        localStorage.setItem('sync_lastSyncTime', this.lastSyncTime);

        // Update UI
        const el = document.getElementById('syncCount');
        if (el) el.textContent = '0';

        showToast('✓ Tersinkronisasi dengan Google Sheets', 'success');
        if (Config.DEBUG) console.log('✓ Sync completed:', result);
      } else {
        throw new Error(result.error || 'Sync failed');
      }

    } catch (error) {
      console.error('❌ Sync error:', error);
      showToast('⚠️ Gagal sync: ' + error.message, 'error');
    } finally {
      this.isSyncing = false;
    }
  },

  /**
   * Sync menggunakan sendBeacon (untuk saat page closing)
   */
  syncToCloudBeacon() {
    if (!navigator.sendBeacon) return;

    try {
      const allData = {
        dzikir: Storage.load('dzikir', {}),
        sholat: Storage.load('sholat', {}),
        tasks: Storage.load('tasks', []),
        journal: Storage.load('journal', {}),
        pomodoro: Storage.load('pomodoro_sessions', []),
        habits: Storage.load('habits', {}),
        goals: Storage.load('goals', [])
      };

      const blob = new Blob([JSON.stringify({
        action: 'syncAll',
        userId: Config.USER_ID,
        data: allData
      })], { type: 'application/json' });

      navigator.sendBeacon(Config.GOOGLE_APPS_SCRIPT_URL, blob);

      if (Config.DEBUG) console.log('📤 Beacon sync sent');

    } catch (error) {
      console.error('❌ Beacon sync error:', error);
    }
  },

  /**
   * Load data dari Google Sheets ke local
   */
  async loadFromCloud() {
    try {
      if (Config.DEBUG) console.log('📥 Loading from Google Sheets...');

      const response = await fetch(
        `${Config.GOOGLE_APPS_SCRIPT_URL}?action=getAllData&userId=${Config.USER_ID}`
      );

      const result = await response.json();

      if (result.success && result.data) {
        const cloudData = result.data;

        // Merge dengan data local (cloud data sebagai fallback)
        const localDzikir = Storage.load('dzikir', {});
        const localSholat = Storage.load('sholat', {});
        const localTasks = Storage.load('tasks', []);
        const localJournal = Storage.load('journal', {});

        // Jika local kosong, gunakan cloud data
        if (Object.keys(localDzikir).length === 0 && Object.keys(cloudData.dzikir || {}).length > 0) {
          Storage.save('dzikir', cloudData.dzikir);
          if (Config.DEBUG) console.log('📥 Loaded dzikir from cloud');
        }

        if (Object.keys(localSholat).length === 0 && Object.keys(cloudData.sholat || {}).length > 0) {
          Storage.save('sholat', cloudData.sholat);
          if (Config.DEBUG) console.log('📥 Loaded sholat from cloud');
        }

        if (localTasks.length === 0 && (cloudData.tasks || []).length > 0) {
          Storage.save('tasks', cloudData.tasks);
          if (Config.DEBUG) console.log('📥 Loaded tasks from cloud');
        }

        if (Object.keys(localJournal).length === 0 && Object.keys(cloudData.journal || {}).length > 0) {
          Storage.save('journal', cloudData.journal);
          if (Config.DEBUG) console.log('📥 Loaded journal from cloud');
        }

        if (cloudData.habits && Object.keys(cloudData.habits).length > 0) {
          Storage.save('habits', cloudData.habits);
        }

        if (cloudData.goals && cloudData.goals.length > 0) {
          Storage.save('goals', cloudData.goals);
        }

        if (cloudData.pomodoro && cloudData.pomodoro.length > 0) {
          Storage.save('pomodoro_sessions', cloudData.pomodoro);
        }

        showToast('✓ Data dimuat dari cloud', 'success');

      } else {
        if (Config.DEBUG) console.log('ℹ️ No cloud data found or sync disabled');
      }

    } catch (error) {
      // Gagal load dari cloud itu OK - app tetap jalan dengan local data
      if (Config.DEBUG) console.log('ℹ️ Could not load from cloud:', error.message);
    }
  },

  /**
   * Manual sync trigger
   */
  async manualSync() {
    await this.syncToCloud();
  },

  /**
   * Destroy sync manager
   */
  destroy() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }
};

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SyncManager.init());
} else {
  SyncManager.init();
}
