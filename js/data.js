/* ============================================
   DATA.JS - Storage, State & Static Data
   ============================================ */

// ===== GLOBAL STATE =====
const AppState = {
  currentPage: 'home',
  timerActive: false,
  timerInterval: null,
  timerSeconds: 0,
  timerType: 'focus',
  dzikirTime: 'pagi',
  sync: { pending: 0, lastSync: null }
};

// ===== TIMER TYPES =====
const TIMER_TYPES = {
  focus: { name: 'Fokus', duration: 25, icon: '🎯', color: '#0D47A1' },
  short: { name: 'Istirahat', duration: 5, icon: '☕', color: '#00695C' },
  long: { name: 'Rehat Panjang', duration: 15, icon: '🌿', color: '#2E7D32' },
  deep: { name: 'Deep Work', duration: 45, icon: '🧠', color: '#6A1B9A' },
  ultra: { name: 'Ultra Focus', duration: 90, icon: '⚡', color: '#C62828' }
};

// ===== SHOLAT DATA =====
const SHOLAT_LIST = [
  { id: 'subuh', name: 'Subuh', icon: '🌅', time: '04:30', fardhu: true },
  { id: 'dhuha', name: 'Dhuha', icon: '☀️', time: '07:00', fardhu: false },
  { id: 'dzuhur', name: 'Dzuhur', icon: '🌤️', time: '12:00', fardhu: true },
  { id: 'ashar', name: 'Ashar', icon: '🌇', time: '15:30', fardhu: true },
  { id: 'maghrib', name: 'Maghrib', icon: '🌆', time: '18:00', fardhu: true },
  { id: 'isya', name: 'Isya', icon: '🌙', time: '19:30', fardhu: true },
  { id: 'tahajud', name: 'Tahajud', icon: '✨', time: '03:00', fardhu: false },
  { id: 'witir', name: 'Witir', icon: '🌟', time: '03:30', fardhu: false }
];

// ===== SUNNAH RASUL (11 habits) =====
const SUNNAH_HABITS = [
  { id: 'sahur', name: 'Sahur/Sarapan Pagi', arabic: 'تسحروا', time: 'pagi', icon: '🍽️' },
  { id: 'siwak', name: 'Siwak/Gosok Gigi', arabic: 'السواك', time: 'pagi', icon: '🪥' },
  { id: 'wudhu', name: 'Wudhu Sempurna', arabic: 'الوضوء', time: 'pagi', icon: '💧' },
  { id: 'dzikir_pagi', name: 'Dzikir Pagi', arabic: 'أذكار الصباح', time: 'pagi', icon: '📿' },
  { id: 'tilawah', name: 'Tilawah Quran', arabic: 'تلاوة القرآن', time: 'siang', icon: '📖' },
  { id: 'sedekah', name: 'Sedekah', arabic: 'الصدقة', time: 'siang', icon: '🤲' },
  { id: 'dzikir_sore', name: 'Dzikir Sore', arabic: 'أذكار المساء', time: 'sore', icon: '🌅' },
  { id: 'qiyamul', name: 'Qiyamul Lail', arabic: 'قيام الليل', time: 'malam', icon: '🌙' },
  { id: 'istighfar', name: 'Istighfar 100x', arabic: 'الاستغفار', time: 'malam', icon: '🤲' },
  { id: 'sholawat', name: 'Sholawat Nabi', arabic: 'الصلاة على النبي', time: 'malam', icon: '💚' },
  { id: 'tidur_cepat', name: 'Tidur Awal', arabic: 'النوم المبكر', time: 'malam', icon: '😴' }
];

// ===== DZIKIR PAGI (15 dzikir) =====
const DZIKIR_PAGI = [
  { id: 'ayat_kursi', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...', latin: 'Allahu laa ilaaha illa huwal hayyul qayyuum...', meaning: 'Allah, tidak ada Tuhan selain Dia, Yang Maha Hidup...', count: 1, virtue: 'Dijaga dari gangguan setan hingga sore' },
  { id: 'ikhlas', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ...', latin: 'Qul huwallaahu ahad...', meaning: 'Katakanlah: Dialah Allah, Yang Maha Esa...', count: 3, virtue: 'Seperti membaca 1/3 Al-Quran' },
  { id: 'falaq', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...', latin: "Qul a'uudzu birabbil falaq...", meaning: 'Aku berlindung kepada Tuhan yang menguasai subuh...', count: 3, virtue: 'Perlindungan dari kejahatan' },
  { id: 'nas', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ...', latin: "Qul a'uudzu birabbin naas...", meaning: 'Aku berlindung kepada Tuhan manusia...', count: 3, virtue: 'Perlindungan dari bisikan setan' },
  { id: 'sayyidul', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ...', latin: 'Allahumma anta rabbii laa ilaaha illaa anta...', meaning: 'Ya Allah, Engkau Tuhanku, tidak ada Tuhan selain Engkau...', count: 1, virtue: 'Sayyidul Istighfar' },
  { id: 'pagi1', arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ...', latin: 'Ashbahnaa wa ashbahal mulku lillaah...', meaning: 'Kami memasuki waktu pagi dan kerajaan milik Allah...', count: 1, virtue: 'Doa pembuka pagi' },
  { id: 'pagi2', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا...', latin: 'Allahumma bika ashbahnaa wa bika amsainaa...', meaning: 'Ya Allah, dengan rahmat-Mu kami memasuki waktu pagi...', count: 1, virtue: 'Berserah kepada Allah' },
  { id: 'pagi3', arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ...', latin: "Allahumma maa ashbaha bii min ni'matin...", meaning: 'Ya Allah, nikmat yang ada padaku di pagi ini...', count: 1, virtue: 'Syukur atas nikmat' },
  { id: 'tauhid', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...', latin: 'Laa ilaaha illallaahu wahdahu laa syariika lah...', meaning: 'Tidak ada Tuhan selain Allah...', count: 10, virtue: 'Pahala memerdekakan budak' },
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', latin: 'Subhaanallaahi wa bihamdihi', meaning: 'Maha Suci Allah dan dengan memuji-Nya', count: 100, virtue: 'Dihapus dosa walau seperti buih laut' },
  { id: 'taawudz', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ...', latin: "A'uudzu bikalimaatillaahit taammaati...", meaning: 'Aku berlindung dengan kalimat-kalimat Allah...', count: 3, virtue: 'Perlindungan dari kejahatan' },
  { id: 'ridhaa', arabic: 'رَضِيتُ بِاللَّهِ رَبًّا...', latin: 'Radhiitu billaahi rabbaa...', meaning: 'Aku ridha Allah sebagai Tuhanku...', count: 3, virtue: 'Hak mendapat syafaat Nabi ﷺ' },
  { id: 'doa_afiat', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ...', latin: "Allahumma innii as'alukal 'aafiyah...", meaning: 'Ya Allah, aku memohon keselamatan...', count: 1, virtue: 'Doa keselamatan komprehensif' },
  { id: 'doa_ilmu', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا...', latin: "Allahumma innii as'aluka 'ilman naafi'an...", meaning: 'Ya Allah, aku memohon ilmu yang bermanfaat...', count: 1, virtue: 'Doa setelah sholat Subuh' },
  { id: 'hasbiyallah', arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ...', latin: 'Hasbiyallaahu laa ilaaha illa huwa...', meaning: 'Cukuplah Allah bagiku...', count: 7, virtue: 'Allah akan mencukupi urusanmu' }
];

// ===== DZIKIR SORE (15 dzikir) =====
const DZIKIR_SORE = [
  { id: 'ayat_kursi_s', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...', latin: 'Allahu laa ilaaha illa huwal hayyul qayyuum...', meaning: 'Allah, tidak ada Tuhan selain Dia...', count: 1, virtue: 'Dijaga hingga pagi' },
  { id: 'ikhlas_s', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ...', latin: 'Qul huwallaahu ahad...', meaning: 'Katakanlah: Dialah Allah, Yang Maha Esa...', count: 3, virtue: '1/3 Al-Quran' },
  { id: 'falaq_s', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...', latin: "Qul a'uudzu birabbil falaq...", meaning: 'Aku berlindung kepada Tuhan subuh...', count: 3, virtue: 'Perlindungan' },
  { id: 'nas_s', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ...', latin: "Qul a'uudzu birabbin naas...", meaning: 'Aku berlindung kepada Tuhan manusia...', count: 3, virtue: 'Perlindungan' },
  { id: 'sayyidul_s', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي...', latin: 'Allahumma anta rabbii...', meaning: 'Ya Allah, Engkau Tuhanku...', count: 1, virtue: 'Sayyidul Istighfar' },
  { id: 'sore1', arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ...', latin: 'Amsainaa wa amsal mulku lillaah...', meaning: 'Kami memasuki waktu sore...', count: 1, virtue: 'Doa pembuka sore' },
  { id: 'sore2', arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا...', latin: 'Allahumma bika amsainaa...', meaning: 'Ya Allah, dengan rahmat-Mu kami memasuki sore...', count: 1, virtue: 'Berserah' },
  { id: 'sore3', arabic: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ...', latin: "Allahumma maa amsaa bii min ni'matin...", meaning: 'Ya Allah, nikmat yang ada padaku di sore ini...', count: 1, virtue: 'Syukur' },
  { id: 'tauhid_s', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ...', latin: 'Laa ilaaha illallaahu wahdahu...', meaning: 'Tidak ada Tuhan selain Allah...', count: 10, virtue: 'Pahala besar' },
  { id: 'subhanallah_s', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', latin: 'Subhaanallaahi wa bihamdihi', meaning: 'Maha Suci Allah...', count: 100, virtue: 'Penghapus dosa' },
  { id: 'taawudz_s', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ...', latin: "A'uudzu bikalimaatillaah...", meaning: 'Aku berlindung dengan kalimat Allah...', count: 3, virtue: 'Perlindungan' },
  { id: 'ridhaa_s', arabic: 'رَضِيتُ بِاللَّهِ رَبًّا...', latin: 'Radhiitu billaahi rabbaa...', meaning: 'Aku ridha Allah sebagai Tuhanku...', count: 3, virtue: 'Syafaat' },
  { id: 'doa_afiat_s', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ...', latin: "Allahumma innii as'alukal 'aafiyah...", meaning: 'Ya Allah, aku memohon keselamatan...', count: 1, virtue: 'Keselamatan' },
  { id: 'doa_malam', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ...', latin: "Allahumma innii as'aluka khaira haadzihil lailah...", meaning: 'Ya Allah, aku memohon kebaikan malam ini...', count: 1, virtue: 'Doa malam' },
  { id: 'hasbiyallah_s', arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ...', latin: 'Hasbiyallaahu laa ilaaha illa huwa...', meaning: 'Cukuplah Allah bagiku...', count: 7, virtue: 'Kecukupan' }
];

// ===== WISDOM QUOTES =====
const WISDOM_QUOTES = [
  { text: "Jangan biarkan apa yang tidak bisa kamu kontrol mengganggu apa yang bisa kamu kontrol.", source: "Stoikisme", framework: "stoic" },
  { text: "Antara stimulus dan respons ada ruang. Di ruang itu ada kekuatan untuk memilih respons kita.", source: "Viktor Frankl", framework: "nlp" },
  { text: "Kamu bukan budak emosi. Kamu adalah pengamat yang bisa melepaskannya.", source: "Sedona Method", framework: "sedona" },
  { text: "Habit adalah bunga majemuk dari perbaikan diri.", source: "James Clear", framework: "atomic" },
  { text: "Jadilah seperti batu karang yang ombak terus menghantam, namun tetap berdiri.", source: "Marcus Aurelius", framework: "stoic" },
  { text: "Peta bukanlah wilayah. Persepsi kita bukanlah realitas.", source: "NLP Presupposition", framework: "nlp" },
  { text: "Bisa kamu menyambut perasaan ini? Bisa kamu melepaskannya?", source: "Sedona Method", framework: "sedona" },
  { text: "Jika ingin kebiasaan baik, buatlah itu jelas, menarik, mudah, dan memuaskan.", source: "James Clear", framework: "atomic" },
  { text: "Yang menghambat adalah pikiran, bukan hal-hal itu sendiri.", source: "Epictetus", framework: "stoic" },
  { text: "Setiap perilaku memiliki niat positif di baliknya.", source: "NLP Presupposition", framework: "nlp" },
  { text: "Melepaskan bukan berarti menyerah. Melepaskan berarti membebaskan.", source: "Sedona Method", framework: "sedona" },
  { text: "Kamu tidak naik ke level tujuanmu. Kamu jatuh ke level sistemmu.", source: "James Clear", framework: "atomic" }
];

// ===== BEST WEEK TEMPLATE =====
const BEST_WEEK_TEMPLATE = {
  weekdays: [
    { time: '04:00', activity: 'Bangun, Tahajud, Istighfar', category: 'ibadah' },
    { time: '04:30', activity: 'Sholat Subuh berjamaah', category: 'ibadah' },
    { time: '05:00', activity: 'Dzikir Pagi + Tilawah', category: 'ibadah' },
    { time: '05:30', activity: 'Olahraga ringan', category: 'health' },
    { time: '06:00', activity: 'Mandi, persiapan kerja', category: 'routine' },
    { time: '06:30', activity: 'Sarapan bersama keluarga', category: 'family' },
    { time: '07:00', activity: 'Sholat Dhuha + Jurnal Pagi', category: 'ibadah' },
    { time: '07:30', activity: 'Berangkat kerja', category: 'work' },
    { time: '08:00', activity: 'Deep Work Session 1', category: 'work' },
    { time: '10:00', activity: 'Break + Review tasks', category: 'work' },
    { time: '12:00', activity: 'Sholat Dzuhur', category: 'ibadah' },
    { time: '13:30', activity: 'Deep Work Session 2', category: 'work' },
    { time: '15:30', activity: 'Sholat Ashar', category: 'ibadah' },
    { time: '17:00', activity: 'Dzikir Sore', category: 'ibadah' },
    { time: '18:00', activity: 'Sholat Maghrib', category: 'ibadah' },
    { time: '18:30', activity: 'Quality time keluarga', category: 'family' },
    { time: '19:30', activity: 'Sholat Isya', category: 'ibadah' },
    { time: '20:30', activity: 'Belajar / membaca', category: 'growth' },
    { time: '21:30', activity: 'Jurnal Malam', category: 'growth' },
    { time: '22:00', activity: 'Tidur', category: 'routine' }
  ],
  weekend: [
    { time: '04:00', activity: 'Bangun, Tahajud', category: 'ibadah' },
    { time: '04:30', activity: 'Sholat Subuh', category: 'ibadah' },
    { time: '05:00', activity: 'Dzikir Pagi + Tilawah', category: 'ibadah' },
    { time: '06:00', activity: 'Olahraga keluarga', category: 'health' },
    { time: '07:00', activity: 'Sholat Dhuha', category: 'ibadah' },
    { time: '08:00', activity: 'Quality time keluarga', category: 'family' },
    { time: '12:00', activity: 'Sholat Dzuhur', category: 'ibadah' },
    { time: '14:00', activity: 'Istirahat siang', category: 'routine' },
    { time: '15:30', activity: 'Sholat Ashar', category: 'ibadah' },
    { time: '16:00', activity: 'Personal project', category: 'growth' },
    { time: '17:00', activity: 'Dzikir Sore', category: 'ibadah' },
    { time: '18:00', activity: 'Sholat Maghrib', category: 'ibadah' },
    { time: '19:30', activity: 'Sholat Isya', category: 'ibadah' },
    { time: '21:00', activity: 'Weekly review', category: 'growth' },
    { time: '22:00', activity: 'Tidur', category: 'routine' }
  ]
};

// ===== STORAGE =====
const Storage = {
  save(key, data) {
    try {
      localStorage.setItem(`sync_${key}`, JSON.stringify(data));
      AppState.sync.pending++;
      return true;
    } catch (e) { return false; }
  },
  
  load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(`sync_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) { return defaultValue; }
  },
  
  today() { return new Date().toISOString().split('T')[0]; },
  
  getToday(key, defaultValue = null) {
    const allData = this.load(key, {});
    return allData[this.today()] || defaultValue;
  },
  
  saveToday(key, data) {
    const allData = this.load(key, {});
    allData[this.today()] = data;
    const keys = Object.keys(allData).sort().reverse().slice(0, 30);
    const trimmed = {};
    keys.forEach(k => trimmed[k] = allData[k]);
    this.save(key, trimmed);
  }
};

// ===== UTILITY FUNCTIONS =====
function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
function getCurrentHour() { return new Date().getHours(); }
function isWeekend() { const day = new Date().getDay(); return day === 0 || day === 6; }

function getGreeting() {
  const hour = getCurrentHour();
  if (hour < 10) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

function getRandomQuote() {
  return WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
}

// ===== DATA LOADERS =====
function loadTasks() { return Storage.load('tasks', []); }
function loadGoals() { return Storage.load('goals', []); }
function loadSholat() { return Storage.getToday('sholat', {}); }
function loadHabits() { return Storage.getToday('habits', {}); }
function loadDzikir() { return Storage.getToday('dzikir', { pagi: {}, sore: {} }); }
function loadJournal() { return Storage.getToday('journal', { morning: null, evening: null }); }
function loadPomodoro() { return Storage.load('pomodoro', { today: 0, total: 0, streak: 0 }); }
function loadBrainDump() { return Storage.load('braindump', []); }
function loadDontList() { return Storage.load('dontlist', []); }
function loadVision() { return Storage.load('vision', { year10: '', year3: '', year1: '' }); }
