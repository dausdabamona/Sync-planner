# 🕌 Sync Planner - Multi-Page Edition

Aplikasi produktivitas Islami dengan struktur multi-file yang terorganisir.

## 📁 Struktur File

```
sync-planner/
├── index.html              # Home + Header + Nav
├── css/
│   ├── base.css           # Reset, Variables, Typography (3KB)
│   ├── components.css     # Cards, Buttons, Forms, Modals (7KB)
│   ├── layout.css         # Header, Nav, Pages (4KB)
│   └── features.css       # Sholat, Habits, Tasks, dll (18KB)
├── js/
│   ├── data.js            # Storage, State, Static Data (17KB)
│   └── app.js             # Core Navigation & Functions (8KB)
└── pages/
    ├── tasks.html         # Tasks & Kanban Board
    ├── goals.html         # Goals 12 Minggu
    ├── pomodoro.html      # Pomodoro Timer (5 tipe)
    ├── ibadah.html        # Sholat & Dzikir Tracker
    ├── habits.html        # Sunnah Rasul (11 habits)
    ├── journal.html       # Jurnal Pagi/Malam
    ├── vision.html        # Piramida Visi (10/3/1 tahun)
    ├── review.html        # Weekly Review
    ├── wisdom.html        # Wisdom Stoik (30 situasi)
    ├── braindump.html     # Brain Dump & Don't List
    └── settings.html      # Pengaturan
```

## ✅ Fitur Lengkap

### 🏠 Home Page
- Quote Card dengan refresh
- Quick Actions (Fokus, Task, Jurnal, Wisdom)
- Jurnal Pagi/Malam status cards
- Wisdom of the Day card
- Sholat Tracker mini (8 waktu)
- Sunnah Rasul mini (11 habits)
- Today Focus tasks
- Jadwal Hari Ini (Best Week Template)

### 📋 Produktivitas
- **Tasks** - List view + Kanban board (4 kolom)
- **Goals 12 Minggu** - Dengan progress & milestones
- **Pomodoro Timer** - 5 tipe: Focus(25), Short(5), Long(15), Deep(45), Ultra(90)
- **Brain Dump** - Capture pikiran, convert to task

### 🕌 Ibadah
- **Tracker Sholat** - 8 waktu (5 fardhu + 3 sunnah)
- **Sunnah Rasul** - 11 kebiasaan grouped by time
- **Dzikir Pagi/Sore** - 15+15 dzikir dengan fullscreen counter

### 📝 Refleksi
- **Jurnal Pagi** - Syukur, Fokus, Afirmasi
- **Jurnal Malam** - Wins, Improve, Lesson
- **Don't List** - Hal yang dihindari dengan tracking
- **Weekly Review** - Evaluasi mingguan

### 🎯 Visi & Planning
- **Piramida Visi** - 10, 3, 1 tahun
- **Best Week Template** - Jadwal ideal weekday/weekend

### 🧠 Wisdom
- **30 Situasi Wisdom** - 10 detailed + 20 summary
- Filter by area (Istri, Anak, Diri)
- Search functionality
- 4 framework: Stoic, NLP, Sedona, Atomic

### ⚙️ Settings
- Export/Import data (JSON)
- Clear all data
- Toggle notifications & sound

## 🚀 Cara Penggunaan

1. Buka `index.html` di browser
2. Navigasi lewat bottom nav atau menu
3. Semua data tersimpan di localStorage

## 💾 Data Storage

Prefix: `sync_`
- `sync_tasks` - Daftar task
- `sync_goals` - Goals 12 minggu
- `sync_sholat` - Tracker sholat (per hari)
- `sync_habits` - Sunnah rasul (per hari)
- `sync_dzikir` - Progress dzikir (per hari)
- `sync_journal` - Jurnal pagi/malam (per hari)
- `sync_pomodoro` - Stats pomodoro
- `sync_braindump` - Brain dump items
- `sync_dontlist` - Don't list items
- `sync_vision` - Piramida visi

## 📊 Total Size

| Folder | Size |
|--------|------|
| CSS | ~32 KB |
| JS | ~25 KB |
| Pages | ~83 KB |
| **Total** | **~147 KB** |

## 🎨 Customization

Edit `css/base.css` untuk mengubah warna:
```css
:root {
  --primary: #0D47A1;
  --secondary: #00695C;
  --accent: #FF6F00;
  --success: #2E7D32;
  --danger: #C62828;
  --spiritual: #6A1B9A;
}
```

---

بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ

*Sync Planner v2.0 - Multi-Page Edition*
