/**
 * ============================================
 * SYNC PLANNER v4.2 - UI MODULE
 * User Interface Components
 * ============================================
 */

const SyncUI = {
  // Toast notification
  toast: {
    show(message, type = 'info', duration = 3000) {
      const toast = document.getElementById('toast');
      if (!toast) {
        console.log(`[Toast] ${type}: ${message}`);
        return;
      }
      
      const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ️',
        warning: '⚠️'
      };
      
      toast.innerHTML = `${icons[type] || 'ℹ️'} ${message}`;
      toast.className = `toast ${type} show`;
      
      // Auto hide
      setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    },
    
    success(message) {
      this.show(message, 'success');
    },
    
    error(message) {
      this.show(message, 'error');
    },
    
    info(message) {
      this.show(message, 'info');
    },
    
    warning(message) {
      this.show(message, 'warning');
    }
  },
  
  // Modal management
  modal: {
    open(name) {
      const modal = document.getElementById(`modal-${name}`);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },
    
    close(name) {
      const modal = document.getElementById(`modal-${name}`);
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    },
    
    closeAll() {
      document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
      });
      document.body.style.overflow = '';
    }
  },
  
  // Loading states
  loading: {
    show(containerId, message = 'Memuat...') {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      container.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>${message}</p>
        </div>
      `;
    },
    
    showSkeleton(containerId, count = 3) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      container.innerHTML = Array(count).fill(`
        <div class="skeleton-item">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      `).join('');
    },
    
    hide(containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    }
  },
  
  // Empty states
  empty: {
    show(containerId, icon = '📭', message = 'Tidak ada data', action = null) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      let html = `
        <div class="empty-state">
          <span class="icon">${icon}</span>
          <p>${message}</p>
      `;
      
      if (action) {
        html += `<button class="btn-primary" onclick="${action.handler}">${action.label}</button>`;
      }
      
      html += '</div>';
      container.innerHTML = html;
    }
  },
  
  // Error states
  error: {
    show(containerId, message = 'Terjadi kesalahan', retryHandler = null) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      let html = `
        <div class="error-state">
          <span class="icon">❌</span>
          <p>${message}</p>
      `;
      
      if (retryHandler) {
        html += `<button class="btn-secondary" onclick="${retryHandler}">🔄 Coba Lagi</button>`;
      }
      
      html += '</div>';
      container.innerHTML = html;
    }
  },
  
  // Page navigation
  page: {
    current: 'home',
    
    show(pageName, navEl = null) {
      // Hide all pages
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      
      // Show target page
      const page = document.getElementById(`page-${pageName}`);
      if (page) {
        page.classList.add('active');
      }
      
      // Update nav
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      if (navEl) {
        navEl.classList.add('active');
      }
      
      this.current = pageName;
      
      // Trigger page load event
      window.dispatchEvent(new CustomEvent('pagechange', { detail: { page: pageName } }));
    },
    
    getCurrent() {
      return this.current;
    }
  },
  
  // Tabs
  tabs: {
    show(tabGroupId, tabName) {
      const group = document.getElementById(tabGroupId);
      if (!group) return;
      
      // Update tab buttons
      group.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
      });
      
      // Update tab content
      group.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.dataset.tab === tabName);
      });
    }
  },
  
  // Confirm dialog
  confirm(message, onConfirm, onCancel = null) {
    if (confirm(message)) {
      if (typeof onConfirm === 'function') onConfirm();
    } else {
      if (typeof onCancel === 'function') onCancel();
    }
  },
  
  // Update sync indicator
  updateSyncIndicator(count) {
    const syncBtn = document.getElementById('syncButton');
    const syncBtnCount = document.getElementById('syncBtnCount');
    const settingCount = document.getElementById('settingPendingCount');
    
    if (syncBtn) {
      if (count > 0) {
        syncBtn.style.display = 'flex';
        if (syncBtnCount) syncBtnCount.textContent = count;
      } else {
        syncBtn.style.display = 'none';
      }
    }
    
    if (settingCount) {
      settingCount.textContent = count;
    }
  },
  
  // Render offline state
  renderOfflineState() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (offlineIndicator) {
      offlineIndicator.style.display = navigator.onLine ? 'none' : 'block';
    }
  },
  
  // Initialize UI
  init() {
    // Close modal on backdrop click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.modal.closeAll();
      }
    });
    
    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.modal.closeAll();
      }
    });
    
    // Online/offline detection
    window.addEventListener('online', () => {
      this.toast.success('Kembali online');
      this.renderOfflineState();
    });
    
    window.addEventListener('offline', () => {
      this.toast.warning('Anda sedang offline');
      this.renderOfflineState();
    });
    
    this.renderOfflineState();
  }
};

// Global shortcut functions
function showToast(message, type) { SyncUI.toast.show(message, type); }
function openModal(name) { SyncUI.modal.open(name); }
function closeModal(name) { SyncUI.modal.close(name); }
function showPage(pageName, navEl) { SyncUI.page.show(pageName, navEl); }

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SyncUI };
}
