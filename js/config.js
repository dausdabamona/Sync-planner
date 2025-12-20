/**
 * SYNC PLANNER - Configuration
 *
 * File ini berisi konfigurasi untuk koneksi ke Google Sheets
 */

const Config = {
  // Google Apps Script Web App URL
  // Setelah deploy Apps Script, paste URL-nya di sini
  GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx6zWpddfvFHXmtXhcJNSOnjE2sX-ui704sf7fLVKQ7ikbS1K6Vdf_bh4HbBzRfAqSUFg/exec',

  // User ID untuk multi-user support (opsional)
  // Bisa diisi dengan email, atau biarkan 'default' untuk single user
  USER_ID: 'default',

  // Sync settings
  SYNC_ENABLED: true, // Set true setelah setup Apps Script
  AUTO_SYNC: true, // Auto sync saat pindah halaman
  SYNC_INTERVAL: 5 * 60 * 1000, // Sync otomatis setiap 5 menit (ms)

  // Debug mode
  DEBUG: true // Set false untuk production (ubah jadi false nanti)
};

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Config;
}
