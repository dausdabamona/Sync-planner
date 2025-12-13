/**
 * ============================================
 * SYNC PLANNER v4.2 - UTILS MODULE
 * Fungsi-fungsi utilitas
 * ============================================
 */

const SyncUtils = {
  // Format tanggal ke string Indonesia
  formatDate(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  },
  
  // Format tanggal pendek
  formatDateShort(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  },
  
  // Format waktu
  formatTime(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },
  
  // Get today string (YYYY-MM-DD)
  getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },
  
  // Get current week number
  getWeekNumber(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  },
  
  // Generate UUID
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Escape HTML
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  // Truncate text
  truncate(text, length = 50) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },
  
  // Parse JSON safely
  parseJSON(str, defaultValue = null) {
    try {
      return JSON.parse(str);
    } catch(e) {
      return defaultValue;
    }
  },
  
  // Deep clone object
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  
  // Check if mobile device
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // Check if online
  isOnline() {
    return navigator.onLine;
  },
  
  // Get greeting based on time
  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 5) return 'Selamat Malam';
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  },
  
  // Get Islamic greeting
  getIslamicGreeting() {
    const hour = new Date().getHours();
    if (hour < 5) return { arabic: 'طَابَتْ لَيْلَتُكُم', text: 'Selamat malam yang baik' };
    if (hour < 12) return { arabic: 'صَبَاحُ الْخَيْرِ', text: 'Selamat pagi' };
    if (hour < 15) return { arabic: 'سَلَامٌ عَلَيْكُمْ', text: 'Salam sejahtera' };
    if (hour < 19) return { arabic: 'مَسَاءُ الْخَيْرِ', text: 'Selamat sore' };
    return { arabic: 'طَابَتْ لَيْلَتُكُم', text: 'Selamat malam yang baik' };
  },
  
  // Validate email
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  // Format number with thousand separator
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },
  
  // Calculate percentage
  percentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  },
  
  // Get relative time
  relativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    
    return this.formatDateShort(dateStr);
  },
  
  // Local storage helpers with error handling
  storage: {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch(e) {
        return defaultValue;
      }
    },
    
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch(e) {
        console.error('Storage error:', e);
        return false;
      }
    },
    
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch(e) {
        return false;
      }
    },
    
    clear() {
      try {
        localStorage.clear();
        return true;
      } catch(e) {
        return false;
      }
    }
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SyncUtils };
}
