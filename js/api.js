/**
 * ============================================
 * SYNC PLANNER v4.2 - API MODULE
 * Komunikasi dengan Backend
 * ============================================
 */

const SyncAPI = {
  // Cache untuk responses
  cache: {},
  cacheTimestamps: {},
  
  // Pending queue untuk offline sync
  pendingQueue: [],
  isSyncing: false,
  
  // Initialize
  init() {
    // Load pending queue dari localStorage
    const savedQueue = localStorage.getItem('syncplanner_pending_queue');
    if (savedQueue) {
      try {
        this.pendingQueue = JSON.parse(savedQueue);
      } catch(e) {
        this.pendingQueue = [];
      }
    }
    
    // Auto sync saat online
    window.addEventListener('online', () => {
      this.syncPendingQueue();
    });
  },
  
  // Check if cache is valid
  isCacheValid(key) {
    const timestamp = this.cacheTimestamps[key];
    if (!timestamp) return false;
    return (Date.now() - timestamp) < SyncConfig.CACHE_DURATION;
  },
  
  // Set cache
  setCache(key, data) {
    this.cache[key] = data;
    this.cacheTimestamps[key] = Date.now();
  },
  
  // Get from cache
  getCache(key) {
    if (this.isCacheValid(key)) {
      return this.cache[key];
    }
    return null;
  },
  
  // Clear cache
  clearCache(key = null) {
    if (key) {
      delete this.cache[key];
      delete this.cacheTimestamps[key];
    } else {
      this.cache = {};
      this.cacheTimestamps = {};
    }
  },
  
  // Validate user is logged in
  validateAuth() {
    if (!SyncConfig.isLoggedIn()) {
      throw new Error('Silakan login terlebih dahulu');
    }
    if (!SyncConfig.API_URL) {
      throw new Error('API URL belum dikonfigurasi');
    }
  },
  
  // GET request
  async get(action, params = {}, useCache = true) {
    this.validateAuth();
    
    const cacheKey = `${action}_${JSON.stringify(params)}`;
    
    // Return from cache if valid
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }
    
    const url = new URL(SyncConfig.API_URL);
    url.searchParams.append('action', action);
    url.searchParams.append('userId', SyncConfig.getUserId());
    
    // Add params
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.append(k, v);
      }
    });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SyncConfig.API_TIMEOUT);
    
    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch(e) {
        throw new Error('Invalid JSON response from server');
      }
      
      if (!data.success) {
        throw new Error(data.error?.message || data.error || 'API Error');
      }
      
      // Cache successful response
      this.setCache(cacheKey, data.data);
      
      return data.data;
      
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        throw new Error('Request timeout - server tidak merespons');
      }
      
      throw err;
    }
  },
  
  // POST request
  async post(action, body = {}) {
    this.validateAuth();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SyncConfig.API_TIMEOUT);
    
    const payload = {
      action,
      userId: SyncConfig.getUserId(),
      ...body
    };
    
    try {
      const response = await fetch(SyncConfig.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain' // GAS requirement
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch(e) {
        throw new Error('Invalid JSON response from server');
      }
      
      if (!data.success) {
        throw new Error(data.error?.message || data.error || 'API Error');
      }
      
      return data.data;
      
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        throw new Error('Request timeout - server tidak merespons');
      }
      
      throw err;
    }
  },
  
  // Add to pending queue (for offline support)
  addToQueue(action, data) {
    const item = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      action,
      data,
      timestamp: new Date().toISOString(),
      retries: 0
    };
    
    this.pendingQueue.push(item);
    this.savePendingQueue();
    this.updateSyncIndicator();
    
    return item.id;
  },
  
  // Save queue to localStorage
  savePendingQueue() {
    localStorage.setItem('syncplanner_pending_queue', JSON.stringify(this.pendingQueue));
  },
  
  // Sync pending queue
  async syncPendingQueue() {
    if (this.isSyncing || this.pendingQueue.length === 0) return;
    if (!navigator.onLine) return;
    
    this.isSyncing = true;
    console.log('[Sync] Starting sync, items:', this.pendingQueue.length);
    
    const itemsToSync = [...this.pendingQueue];
    let successCount = 0;
    let failedItems = [];
    
    for (const item of itemsToSync) {
      try {
        await this.post(item.action, item.data);
        
        // Remove from queue on success
        this.pendingQueue = this.pendingQueue.filter(q => q.id !== item.id);
        successCount++;
        
        console.log('[Sync] Success:', item.action);
        
      } catch (err) {
        console.error('[Sync] Failed:', item.action, err.message);
        
        // Increment retry count
        const queueItem = this.pendingQueue.find(q => q.id === item.id);
        if (queueItem) {
          queueItem.retries++;
          
          // Remove if too many retries
          if (queueItem.retries > 5) {
            this.pendingQueue = this.pendingQueue.filter(q => q.id !== item.id);
            failedItems.push(item);
          }
        }
      }
    }
    
    this.savePendingQueue();
    this.isSyncing = false;
    this.updateSyncIndicator();
    
    console.log('[Sync] Completed. Success:', successCount, 'Failed:', failedItems.length);
    
    // Invalidate cache after sync
    if (successCount > 0) {
      this.clearCache();
    }
    
    return { success: successCount, failed: failedItems.length };
  },
  
  // Update sync indicator (will be overridden by UI)
  updateSyncIndicator() {
    const count = this.pendingQueue.length;
    console.log('[Sync] Pending items:', count);
    // Override in main app to update UI
  },
  
  // Get pending count
  getPendingCount() {
    return this.pendingQueue.length;
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SyncAPI };
}
