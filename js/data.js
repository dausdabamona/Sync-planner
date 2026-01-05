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

// ===== DZIKIR PAGI & SORE (16 dzikir) =====
// Diurutkan dari yang paling pendek ke paling panjang (dalam setiap grup count)
const DZIKIR_LIST = [
  // === Count 1x (8 dzikir) - dari pendek ke panjang ===
  {
    id: 'd01',
    icon: '🌟',
    arabic: 'سُبْحَانَ اللهِ وَ بِحَمْدِهِ سُبْحَانَ اللهِ اْلعَظِيْمِ',
    latin: "Subhanallah wabihamdihi, subhanallahil 'adzhim",
    meaning: 'Maha Suci Allah dan dengan pujian-Nya, Maha Suci Allah Yang Maha Agung',
    count: 1,
    virtue: 'Dua kalimat ringan di lisan, berat di timbangan, dicintai Ar-Rahman',
    riwayat: 'HR. Bukhari'
  },
  {
    id: 'd02',
    icon: '💪',
    arabic: 'لاَ إِلٰهَ إِلاَّ اللهُ وَ اللهُ أَكْبَرُ وَ لاَ حَوْلَ وَ لاَ قُوَّةَ إِلاَّ بِاللهِ',
    latin: 'Laa ilaaha illallaahu wallaahu akbar walaa haula walaa quwwata illa billah',
    meaning: 'Tiada Tuhan selain Allah, Allah Maha Besar, tiada daya dan upaya kecuali dengan izin Allah',
    count: 1,
    virtue: 'Diampuni dosanya meskipun sebanyak BUIH SAMUDERA',
    riwayat: 'HR. Tirmidzi'
  },
  {
    id: 'd03',
    icon: '🤲',
    arabic: 'أَسْتَغْفِرُ اللهَ الَّذِى لاَ إِلٰهَ إِلاَّ هُوَ اْلحَيَّ اْلقَيُّوْمَ وَ اَتُوْبُ اِلَيْهِ',
    latin: 'Astaghfirullahalladzi laa ilaaha illa huwalhayyalqayyuma wa atuubu ilaihi',
    meaning: 'Aku minta ampun kepada Allah yang tiada Tuhan selain-Nya, Yang Maha Hidup lagi Maha Mengurus, dan aku bertaubat kepada-Nya',
    count: 1,
    virtue: 'Diampuni dosa meskipun telah LARI DARI PERANG',
    riwayat: 'HR. Abu Dawud'
  },
  {
    id: 'd04',
    icon: '🪑',
    arabic: 'سُبْحَانَكَ اللّٰهُمَّ وَ بِحَمْدِكَ أَشْهَدُ أَنْ لاَ إِلٰهَ إِلاَّ أَنْتَ أَسْتَغْفِرُكَ وَ أَتُوْبُ إِلَيْكَ',
    latin: 'Subhanakallaahumma wabihamdika, asyhadu alla ilaaha illa anta, astaghfiruka wa atuubu ilaika',
    meaning: 'Maha Suci Engkau ya Allah, aku bersaksi tiada Tuhan selain Engkau, aku minta ampun dan bertaubat kepada-Mu',
    count: 1,
    virtue: 'Diampuni dosa selama duduk (dibaca saat berdiri dari duduk)',
    riwayat: 'HR. Tirmidzi'
  },
  {
    id: 'd05',
    icon: '💚',
    arabic: 'رَضِيْتُ بِاللهِ رَبًّا وَ بِاْلإِسْلاَمِ دِيْنًا وَ بِمُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَ سَلَّمَ رَسُوْلاً',
    latin: "Radhiitu billaahi rabba, wabil islaami diina, wabimuhammadin ﷺ rasuula",
    meaning: 'Aku ridha Allah sebagai Tuhan, Islam sebagai agama, dan Muhammad ﷺ sebagai Rasul',
    count: 1,
    virtue: 'WAJIB MASUK SURGA bagi yang membacanya',
    riwayat: 'HR. Abu Dawud'
  },
  {
    id: 'd06',
    icon: '👁️',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا',
    latin: "Alhamdulillaahilladzii 'aafaanii mimmabtalaaka bihi, wa fadhdhalanii 'ala katsiirin mimman khalaqa tafdhiilan",
    meaning: 'Segala puji bagi Allah yang menyelamatkan saya dari cobaan itu dan memberi kelebihan kepadaku',
    count: 1,
    virtue: 'Cobaan tidak akan menimpa yang membacanya (saat melihat orang tertimpa cobaan)',
    riwayat: 'HR. Tirmidzi'
  },
  {
    id: 'd07',
    icon: '🆘',
    arabic: 'لاَ إِلٰهَ إِلاَّ اللهُ اْلعَلِيُّ اْلحَلِيْمُ لاَ إِلٰهَ إِلاَّ اللهُ رَبُّ اْلعَرْشِ اْلعَظِيْمِ لاَ إِلٰهَ إِلاَّ اللهُ رَبُّ السَّمٰوَاتِ وَ اْلاَرْضِ وَ رَبُّ اْلعَرْشِ اْلكَرِيْمِ',
    latin: "Laa ilaaha illallahul 'aliyyul haliim, laa ilaaha illallahu rabbil 'arsyil 'adziim, laa ilaaha illallahu rabbissamawaati wal ardhi wa rabbil 'arsyil kariim",
    meaning: 'Tiada Tuhan selain Allah Yang Maha Luhur lagi Maha Penyantun, Tuhan Arsy yang agung, Tuhan langit dan bumi',
    count: 1,
    virtue: 'DOA SAAT KESUSAHAN',
    riwayat: 'HR. Tirmidzi'
  },
  {
    id: 'd08',
    icon: '👑',
    arabic: 'اَللّٰهُمَّ أَنْتَ رَبِّى لاَ إِلٰهَ إِلاَّ أَنْتَ خَلَقْتَنِى وَ أَنَا عَبْدُكَ وَ أَنَا عَلَى عَهْدِكَ وَ وَعْدِكَ مَا اسْتَطَعْتُ أَعُوْذُبِكَ مِنْ شَرِّمَا صَنَعْتُ وَ أَبُوْءُ إِلَيْكَ بِنِعْمَتِكَ عَلَيَّ وَ أَعْتَرِفُ بِذُنُوْبِى فَاغْفِرْلِى ذُنُوْبِى إِنَّهُ لاَ يَغْفِرُ الذُّنُوْبَ إِلاَّ أَنْتَ',
    latin: "Allahumma anta rabbi laa ilaaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wawa'dika mastatha'tu, a'udzubika min syarrima shana'tu, wa abuu-u ilaika bini'matika 'alayya, wa a'trifu bidzunuubii, faghfirlii dzunuubii, innahu laayaghfirudzunuuba illa anta",
    meaning: 'Ya Allah, Engkau Tuhanku, Engkau menciptakanku, aku hamba-Mu, aku berpegang pada janji-Mu, aku berlindung dari keburukan perbuatanku, aku mengakui dosa-dosaku, ampunilah aku',
    count: 1,
    virtue: '👑 SAYYIDUL ISTIGHFAR - Pagi meninggal sebelum sore = SURGA. Sore meninggal sebelum pagi = SURGA',
    riwayat: 'HR. Tirmidzi'
  },
  // === Count 3x (1 dzikir) ===
  {
    id: 'd09',
    icon: '🛡️',
    arabic: 'بِسْمِ اللهِ الَّذِى لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِى اْلأَرْضِ وَ لاَ فِى السَّمَاءِ وَ هُوَ السَّمِيْعُ اْلعَلِيْمُ',
    latin: "Bismillaahilladzi laa yadhurru ma'asmihi syaiun fil ardhi wa laa fissamaai wahuwas samii'ul 'aliim",
    meaning: 'Dengan nama Allah yang tidak membahayakan bersama nama-Nya sesuatu di bumi dan di langit',
    count: 3,
    virtue: 'DIJAGA dari segala bahaya (dibaca 3x pagi & 3x sore)',
    riwayat: 'HR. Tirmidzi'
  },
  // === Count 100x (7 dzikir) - dari pendek ke panjang ===
  {
    id: 'd10',
    icon: '🕌',
    arabic: 'سُبْحَانَ اللهِ',
    latin: 'Subhanallah',
    meaning: 'Maha Suci Allah',
    count: 100,
    virtue: 'Pahalanya seperti 100x haji',
    riwayat: 'HR. Tirmidzi'
  },
  {
    id: 'd11',
    icon: '🤲',
    arabic: 'الْحَمْدُ لِلَّهِ',
    latin: 'Alhamdulillah',
    meaning: 'Segala puji bagi Allah',
    count: 100,
    virtue: 'Pahalanya seperti 100 kuda yang dikeluarkan di jalan Allah',
    riwayat: 'HR. Tirmidzi'
  },
  {
    id: 'd12',
    icon: '⭐',
    arabic: 'اللهُ أَكْبَرُ',
    latin: 'Allahu Akbar',
    meaning: 'Allah Maha Besar',
    count: 100,
    virtue: 'Pahalanya tidak ada yang menandingi',
    riwayat: 'HR. Tirmidzi'
  },
  {
    id: 'd13',
    icon: '🌙',
    arabic: 'لاَ إِلٰهَ إِلاَّ اللهُ',
    latin: 'Laa ilaaha illallah',
    meaning: 'Tiada Tuhan selain Allah',
    count: 100,
    virtue: 'Pahalanya seperti memerdekakan 100 budak',
    riwayat: 'HR. Tirmidzi'
  },
  {
    id: 'd14',
    icon: '📿',
    arabic: 'سُبْحَانَ اللهِ وَ بِحَمْدِهِ',
    latin: 'Subhanallah wabihamdihi',
    meaning: 'Maha Suci Allah dan dengan pujian-Nya',
    count: 100,
    virtue: 'Diampuni dosanya meskipun sebanyak BUIH SAMUDERA',
    riwayat: 'HR. Bukhari'
  },
  {
    id: 'd15',
    icon: '🔄',
    arabic: 'رَبِّ اغْفِرْلِى وَ تُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيْمُ',
    latin: 'Rabbighfirlii watubb alayya, innaka antatawwaaburrahiim',
    meaning: 'Ya Tuhan, ampunilah aku dan terimalah taubatku, Engkau Maha Penerima taubat lagi Maha Penyayang',
    count: 100,
    virtue: 'Amalan yang biasa dibaca Nabi ﷺ 100x setiap duduk',
    riwayat: 'HR. Abu Dawud'
  },
  {
    id: 'd16',
    icon: '✨',
    arabic: 'لاَ إِلٰهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيْكَ لَهُ لَهُ اْلمُلْكُ وَ لَهُ اْلحَمْدُ وَ هُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ',
    latin: "Laailaaha illallahu wahdahu laa syariikalahu lahulmulku walahulhamdu wahuwa 'ala kulli syai-in qodiir",
    meaning: 'Tiada Tuhan selain Allah Yang Maha Esa, tiada sekutu bagi-Nya, milik-Nya kerajaan dan segala puji',
    count: 100,
    virtue: 'Pahala 10 budak, 100 kebaikan, hapus 100 kejelekan, dijaga dari setan',
    riwayat: 'HR. Bukhari'
  }
];

// Alias untuk kompatibilitas
const DZIKIR_PAGI = DZIKIR_LIST;
const DZIKIR_SORE = DZIKIR_LIST;

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
function loadDzikir() {
  // Auto-reset dzikir berdasarkan waktu
  const hour = getCurrentHour();
  const isPagi = hour < 12; // 00:00-11:59 = pagi, 12:00-23:59 = sore

  const allData = Storage.load('dzikir', {});
  const today = Storage.today();

  // Migration: convert old format to new format
  if (!allData[today]) {
    allData[today] = { pagi: {}, sore: {} };
  } else if (!allData[today].pagi && !allData[today].sore) {
    // Old format detected (flat object), migrate to new format
    const oldData = allData[today];
    allData[today] = { pagi: {}, sore: oldData };
  }

  return isPagi ? allData[today].pagi : allData[today].sore;
}
function saveDzikir(data) {
  // Simpan dzikir berdasarkan waktu (pagi/sore)
  const hour = getCurrentHour();
  const isPagi = hour < 12;

  const allData = Storage.load('dzikir', {});
  const today = Storage.today();

  if (!allData[today]) {
    allData[today] = { pagi: {}, sore: {} };
  } else if (!allData[today].pagi && !allData[today].sore) {
    // Old format detected, migrate to new format
    const oldData = allData[today];
    allData[today] = { pagi: {}, sore: oldData };
  }

  if (isPagi) {
    allData[today].pagi = data;
  } else {
    allData[today].sore = data;
  }

  // Keep only last 30 days
  const keys = Object.keys(allData).sort().reverse().slice(0, 30);
  const trimmed = {};
  keys.forEach(k => trimmed[k] = allData[k]);

  Storage.save('dzikir', trimmed);
}
function loadJournal() { return Storage.getToday('journal', { morning: null, evening: null }); }
function loadPomodoro() { return Storage.load('pomodoro', { today: 0, total: 0, streak: 0 }); }
function loadBrainDump() { return Storage.load('braindump', []); }
function loadDontList() { return Storage.load('dontlist', []); }
function loadVision() { return Storage.load('vision', { year10: '', year3: '', year1: '' }); }
