# 🌙 Sync Planner v2.0

Aplikasi produktivitas Islami dengan fitur **Healthy Break Integration**.

## 📁 Struktur File

```
sync-planner-v2/
├── index.html        # HTML utama (347 baris)
├── styles.css        # Semua CSS (1466 baris)
├── app.js            # Logic utama (807 baris)
├── healthy-break.js  # Modul istirahat sehat (873 baris)
└── README.md         # Dokumentasi ini
```

## ✨ Fitur Utama

### 🏠 Home
- Wisdom Card (kutipan Islami random)
- Habit tracker harian
- Preview tugas hari ini
- Dzikir counter cepat

### 📋 Tugas
- CRUD tugas dengan prioritas
- Start Pomodoro dari tugas
- Filter pending/selesai

### 🍅 Pomodoro Timer
- 5 tipe timer: Fokus (25m), Istirahat (5m), Panjang (15m), Deep Work (45m), Ultra (90m)
- Progress ring visual
- Pilih tugas sebelum mulai

### 🧘 Healthy Break (BARU!)
- Pengingat istirahat sehat setelah Pomodoro
- 6 pilihan aktivitas:
  - 🧘 Stretching (2 menit)
  - 💧 Wudhu (3 menit) - direkomendasikan setelah 90 menit
  - 🚶 Jalan Keluar (5 menit)
  - 💪 Push-up Ringan (2 menit)
  - 📿 Dzikir Singkat (2 menit)
  - 👁️ Istirahat Mata (1 menit)
- Timer countdown dengan langkah-langkah
- Streak tracking
- Sedona Method prompts

### 📊 Refleksi
- Statistik harian (tugas, pomodoro, habit)
- Healthy Break stats
- Journaling syukur
- Refleksi malam

### ⚙️ Settings
- Notifikasi, suara, getaran
- Pengaturan Healthy Break
- Export/hapus data

## 🚀 Cara Pakai

1. Buka semua 4 file di folder yang sama
2. Buka `index.html` di browser
3. Atau host di server lokal

### Testing Lokal
```bash
# Dengan Python
cd sync-planner-v2
python -m http.server 8000
# Buka http://localhost:8000

# Atau dengan Node.js
npx serve .
```

## 💾 Data Storage

Semua data disimpan di **localStorage**:
- `syncPlannerTasks` - Daftar tugas
- `syncPlannerHabits` - Habit & streak
- `syncPlannerJournals` - Jurnal
- `syncPlannerSettings` - Pengaturan
- `sync_YYYY-MM-DD` - Data harian
- `healthyBreak_YYYY-MM-DD` - Stats istirahat
- `healthyBreakStreak` - Streak persistent
- `healthyBreakSettings` - Setting istirahat

## 🔧 Integrasi Healthy Break

Healthy Break otomatis trigger setelah sesi Pomodoro selesai (kecuali istirahat). Kode integrasi ada di `app.js`:

```javascript
// Di completePomodoro()
if (isWorkSession && typeof triggerHealthyBreakReminder === 'function') {
  setTimeout(() => {
    triggerHealthyBreakReminder({
      type: state.pomodoro.type,
      duration: durationMinutes,
      totalMinutesToday: totalMinutesToday,
      task: state.pomodoro.task || ''
    });
  }, 1500);
}
```

## 📱 PWA Ready

Untuk membuat PWA, tambahkan:
1. `manifest.json`
2. `service-worker.js`
3. Icons (192x192, 512x512)

---

**Made with ❤️ for productivity & spirituality**
