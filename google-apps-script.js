/**
 * SYNC PLANNER - Google Apps Script
 *
 * Script ini menangani sinkronisasi data antara aplikasi Sync Planner
 * dengan Google Sheets untuk backup dan multi-device sync.
 *
 * CARA SETUP:
 * 1. Buka Google Sheets: https://docs.google.com/spreadsheets/d/17OKXU-lLbQvpY6bliaH5wgVzU597vqG6AAeZDVPdEaM/edit
 * 2. Klik Extensions > Apps Script
 * 3. Copy paste semua kode ini
 * 4. Klik Deploy > New Deployment > Web app
 * 5. Execute as: Me
 * 6. Who has access: Anyone
 * 7. Copy URL yang dihasilkan dan masukkan ke config.js di aplikasi
 */

// ===== KONSTANTA =====
const SHEET_ID = '17OKXU-lLbQvpY6bliaH5wgVzU597vqG6AAeZDVPdEaM';
const SHEETS = {
  DZIKIR: 'Dzikir',
  SHOLAT: 'Sholat',
  TASKS: 'Tasks',
  JOURNAL: 'Journal',
  POMODORO: 'Pomodoro',
  HABITS: 'Habits',
  GOALS: 'Goals',
  SYNC_LOG: 'SyncLog'
};

// ===== MAIN HANDLERS =====

/**
 * Handle GET requests - untuk retrieve data
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const userId = e.parameter.userId || 'default';

    if (!action) {
      return jsonResponse({ error: 'Action parameter required' }, 400);
    }

    let data;
    switch (action) {
      case 'getAllData':
        data = getAllUserData(userId);
        break;
      case 'getDzikir':
        data = getData(SHEETS.DZIKIR, userId);
        break;
      case 'getSholat':
        data = getData(SHEETS.SHOLAT, userId);
        break;
      case 'getTasks':
        data = getData(SHEETS.TASKS, userId);
        break;
      case 'getJournal':
        data = getData(SHEETS.JOURNAL, userId);
        break;
      case 'getPomodoro':
        data = getData(SHEETS.POMODORO, userId);
        break;
      case 'getHabits':
        data = getData(SHEETS.HABITS, userId);
        break;
      case 'getGoals':
        data = getData(SHEETS.GOALS, userId);
        break;
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }

    return jsonResponse({ success: true, data: data });

  } catch (error) {
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Handle POST requests - untuk save data
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const userId = params.userId || 'default';
    const data = params.data;

    if (!action) {
      return jsonResponse({ error: 'Action parameter required' }, 400);
    }

    let result;
    switch (action) {
      case 'syncAll':
        result = syncAllData(userId, data);
        break;
      case 'saveDzikir':
        result = saveData(SHEETS.DZIKIR, userId, data);
        break;
      case 'saveSholat':
        result = saveData(SHEETS.SHOLAT, userId, data);
        break;
      case 'saveTasks':
        result = saveData(SHEETS.TASKS, userId, data);
        break;
      case 'saveJournal':
        result = saveData(SHEETS.JOURNAL, userId, data);
        break;
      case 'savePomodoro':
        result = saveData(SHEETS.POMODORO, userId, data);
        break;
      case 'saveHabits':
        result = saveData(SHEETS.HABITS, userId, data);
        break;
      case 'saveGoals':
        result = saveData(SHEETS.GOALS, userId, data);
        break;
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }

    // Log sync
    logSync(userId, action, 'success');

    return jsonResponse({ success: true, result: result });

  } catch (error) {
    logSync(params.userId || 'default', params.action || 'unknown', 'error: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

// ===== DATA FUNCTIONS =====

/**
 * Get semua data user
 */
function getAllUserData(userId) {
  return {
    dzikir: getData(SHEETS.DZIKIR, userId),
    sholat: getData(SHEETS.SHOLAT, userId),
    tasks: getData(SHEETS.TASKS, userId),
    journal: getData(SHEETS.JOURNAL, userId),
    pomodoro: getData(SHEETS.POMODORO, userId),
    habits: getData(SHEETS.HABITS, userId),
    goals: getData(SHEETS.GOALS, userId)
  };
}

/**
 * Sync semua data sekaligus
 */
function syncAllData(userId, allData) {
  const results = {};

  if (allData.dzikir) results.dzikir = saveData(SHEETS.DZIKIR, userId, allData.dzikir);
  if (allData.sholat) results.sholat = saveData(SHEETS.SHOLAT, userId, allData.sholat);
  if (allData.tasks) results.tasks = saveData(SHEETS.TASKS, userId, allData.tasks);
  if (allData.journal) results.journal = saveData(SHEETS.JOURNAL, userId, allData.journal);
  if (allData.pomodoro) results.pomodoro = saveData(SHEETS.POMODORO, userId, allData.pomodoro);
  if (allData.habits) results.habits = saveData(SHEETS.HABITS, userId, allData.habits);
  if (allData.goals) results.goals = saveData(SHEETS.GOALS, userId, allData.goals);

  return results;
}

/**
 * Get data dari sheet tertentu
 */
function getData(sheetName, userId) {
  const sheet = getOrCreateSheet(sheetName);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return {}; // Hanya header

  const result = {};

  // Skip header row (index 0)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === userId) {
      const date = row[1]; // Kolom tanggal
      const jsonData = row[2]; // Kolom data JSON

      try {
        result[date] = JSON.parse(jsonData);
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  return result;
}

/**
 * Save data ke sheet
 */
function saveData(sheetName, userId, data) {
  const sheet = getOrCreateSheet(sheetName);

  // Hapus data lama user ini
  deleteUserData(sheet, userId);

  // Insert data baru
  const rows = [];
  for (const [date, value] of Object.entries(data)) {
    rows.push([
      userId,
      date,
      JSON.stringify(value),
      new Date().toISOString()
    ]);
  }

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
  }

  return { saved: rows.length };
}

/**
 * Hapus semua data user dari sheet
 */
function deleteUserData(sheet, userId) {
  const data = sheet.getDataRange().getValues();

  // Iterasi dari bawah ke atas untuk menghapus rows
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][0] === userId) {
      sheet.deleteRow(i + 1);
    }
  }
}

// ===== SHEET MANAGEMENT =====

/**
 * Get sheet atau create jika belum ada
 */
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);

    // Set header
    const headers = ['UserId', 'Date', 'Data', 'LastSync'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);

    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
  }

  return sheet;
}

/**
 * Log aktivitas sync
 */
function logSync(userId, action, status) {
  const sheet = getOrCreateSheet(SHEETS.SYNC_LOG);

  // Jika belum ada header, buat
  if (sheet.getLastRow() === 0) {
    const headers = ['Timestamp', 'UserId', 'Action', 'Status'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }

  sheet.appendRow([
    new Date().toISOString(),
    userId,
    action,
    status
  ]);

  // Keep only last 1000 logs
  if (sheet.getLastRow() > 1000) {
    sheet.deleteRows(2, sheet.getLastRow() - 1000);
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Return JSON response
 */
function jsonResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Setup initial sheets structure
 * Jalankan sekali untuk setup
 */
function setupSheets() {
  Object.values(SHEETS).forEach(sheetName => {
    getOrCreateSheet(sheetName);
  });

  Logger.log('✓ All sheets created successfully!');
}
