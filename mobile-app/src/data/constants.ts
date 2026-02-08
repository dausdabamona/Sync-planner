// ===== TIMER TYPES =====
export const TIMER_TYPES = {
  focus: { name: 'Fokus', duration: 25, icon: '🎯', color: '#0D47A1' },
  short: { name: 'Istirahat', duration: 5, icon: '☕', color: '#00695C' },
  long: { name: 'Rehat Panjang', duration: 15, icon: '🌿', color: '#2E7D32' },
  deep: { name: 'Deep Work', duration: 45, icon: '🧠', color: '#6A1B9A' },
  ultra: { name: 'Ultra Focus', duration: 90, icon: '⚡', color: '#C62828' },
} as const;

export type TimerType = keyof typeof TIMER_TYPES;

// ===== SHOLAT DATA =====
export interface SholatItem {
  id: string;
  name: string;
  icon: string;
  time: string;
  fardhu: boolean;
}

export const SHOLAT_LIST: SholatItem[] = [
  { id: 'subuh', name: 'Subuh', icon: '🌅', time: '04:30', fardhu: true },
  { id: 'dhuha', name: 'Dhuha', icon: '☀️', time: '07:00', fardhu: false },
  { id: 'dzuhur', name: 'Dzuhur', icon: '🌤️', time: '12:00', fardhu: true },
  { id: 'ashar', name: 'Ashar', icon: '🌇', time: '15:30', fardhu: true },
  { id: 'maghrib', name: 'Maghrib', icon: '🌆', time: '18:00', fardhu: true },
  { id: 'isya', name: 'Isya', icon: '🌙', time: '19:30', fardhu: true },
  { id: 'tahajud', name: 'Tahajud', icon: '✨', time: '03:00', fardhu: false },
  { id: 'witir', name: 'Witir', icon: '🌟', time: '03:30', fardhu: false },
];

// ===== DZIKIR LIST (16 dzikir) =====
export interface DzikirItem {
  id: string;
  icon: string;
  arabic: string;
  latin: string;
  meaning: string;
  count: number;
  virtue: string;
  riwayat: string;
}

export const DZIKIR_LIST: DzikirItem[] = [
  {
    id: 'd01', icon: '🌟',
    arabic: 'سُبْحَانَ اللهِ وَ بِحَمْدِهِ سُبْحَانَ اللهِ اْلعَظِيْمِ',
    latin: "Subhanallah wabihamdihi, subhanallahil 'adzhim",
    meaning: 'Maha Suci Allah dan dengan pujian-Nya, Maha Suci Allah Yang Maha Agung',
    count: 1, virtue: 'Dua kalimat ringan di lisan, berat di timbangan, dicintai Ar-Rahman', riwayat: 'HR. Bukhari',
  },
  {
    id: 'd02', icon: '💪',
    arabic: 'لاَ إِلٰهَ إِلاَّ اللهُ وَ اللهُ أَكْبَرُ وَ لاَ حَوْلَ وَ لاَ قُوَّةَ إِلاَّ بِاللهِ',
    latin: 'Laa ilaaha illallaahu wallaahu akbar walaa haula walaa quwwata illa billah',
    meaning: 'Tiada Tuhan selain Allah, Allah Maha Besar, tiada daya dan upaya kecuali dengan izin Allah',
    count: 1, virtue: 'Diampuni dosanya meskipun sebanyak BUIH SAMUDERA', riwayat: 'HR. Tirmidzi',
  },
  {
    id: 'd03', icon: '🤲',
    arabic: 'أَسْتَغْفِرُ اللهَ الَّذِى لاَ إِلٰهَ إِلاَّ هُوَ اْلحَيَّ اْلقَيُّوْمَ وَ اَتُوْبُ اِلَيْهِ',
    latin: 'Astaghfirullahalladzi laa ilaaha illa huwalhayyalqayyuma wa atuubu ilaihi',
    meaning: 'Aku minta ampun kepada Allah yang tiada Tuhan selain-Nya, Yang Maha Hidup lagi Maha Mengurus, dan aku bertaubat kepada-Nya',
    count: 1, virtue: 'Diampuni dosa meskipun telah LARI DARI PERANG', riwayat: 'HR. Abu Dawud',
  },
  {
    id: 'd04', icon: '🪑',
    arabic: 'سُبْحَانَكَ اللّٰهُمَّ وَ بِحَمْدِكَ أَشْهَدُ أَنْ لاَ إِلٰهَ إِلاَّ أَنْتَ أَسْتَغْفِرُكَ وَ أَتُوْبُ إِلَيْكَ',
    latin: 'Subhanakallaahumma wabihamdika, asyhadu alla ilaaha illa anta, astaghfiruka wa atuubu ilaika',
    meaning: 'Maha Suci Engkau ya Allah, aku bersaksi tiada Tuhan selain Engkau, aku minta ampun dan bertaubat kepada-Mu',
    count: 1, virtue: 'Diampuni dosa selama duduk (dibaca saat berdiri dari duduk)', riwayat: 'HR. Tirmidzi',
  },
  {
    id: 'd05', icon: '💚',
    arabic: 'رَضِيْتُ بِاللهِ رَبًّا وَ بِاْلإِسْلاَمِ دِيْنًا وَ بِمُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَ سَلَّمَ رَسُوْلاً',
    latin: "Radhiitu billaahi rabba, wabil islaami diina, wabimuhammadin rasul",
    meaning: 'Aku ridha Allah sebagai Tuhan, Islam sebagai agama, dan Muhammad sebagai Rasul',
    count: 1, virtue: 'WAJIB MASUK SURGA bagi yang membacanya', riwayat: 'HR. Abu Dawud',
  },
  {
    id: 'd06', icon: '👁️',
    arabic: 'اَلْحَمْدُ ِللهِ الَّذِى عَافَانِى مِمَّا ابْتَلاَكَ بِهِ وَ فَضَّلَنِى عَلَى كَثِيْرٍ مِمَّن خَلَقَ تَفْضِيْلاً',
    latin: "Alhamdulillaahilladzii 'aafaanii mimmabtalaaka bihi, wa fadhdhalanii 'ala katsiirin mimman khalaqa tafdhiilan",
    meaning: 'Segala puji bagi Allah yang menyelamatkan saya dari cobaan itu dan memberi kelebihan kepadaku',
    count: 1, virtue: 'Cobaan tidak akan menimpa yang membacanya', riwayat: 'HR. Tirmidzi',
  },
  {
    id: 'd07', icon: '🆘',
    arabic: 'لاَ إِلٰهَ إِلاَّ اللهُ اْلعَلِيُّ اْلحَلِيْمُ لاَ إِلٰهَ إِلاَّ اللهُ رَبُّ اْلعَرْشِ اْلعَظِيْمِ لاَ إِلٰهَ إِلاَّ اللهُ رَبُّ السَّمٰوَاتِ وَ اْلاَرْضِ وَ رَبُّ اْلعَرْشِ اْلكَرِيْمِ',
    latin: "Laa ilaaha illallahul 'aliyyul haliim, laa ilaaha illallahu rabbil 'arsyil 'adziim, laa ilaaha illallahu rabbissamawaati wal ardhi wa rabbil 'arsyil kariim",
    meaning: 'Tiada Tuhan selain Allah Yang Maha Luhur lagi Maha Penyantun, Tuhan Arsy yang agung, Tuhan langit dan bumi',
    count: 1, virtue: 'DOA SAAT KESUSAHAN', riwayat: 'HR. Tirmidzi',
  },
  {
    id: 'd08', icon: '👑',
    arabic: 'اَللّٰهُمَّ أَنْتَ رَبِّى لاَ إِلٰهَ إِلاَّ أَنْتَ خَلَقْتَنِى وَ أَنَا عَبْدُكَ وَ أَنَا عَلَى عَهْدِكَ وَ وَعْدِكَ مَا اسْتَطَعْتُ أَعُوْذُبِكَ مِنْ شَرِّمَا صَنَعْتُ وَ أَبُوْءُ إِلَيْكَ بِنِعْمَتِكَ عَلَيَّ وَ أَعْتَرِفُ بِذُنُوْبِى فَاغْفِرْلِى ذُنُوْبِى إِنَّهُ لاَ يَغْفِرُ الذُّنُوْبَ إِلاَّ أَنْتَ',
    latin: "Allahumma anta rabbi laa ilaaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wawa'dika mastatha'tu, a'udzubika min syarrima shana'tu, wa abuu-u ilaika bini'matika 'alayya, wa a'trifu bidzunuubii, faghfirlii dzunuubii, innahu laayaghfirudzunuuba illa anta",
    meaning: 'Ya Allah, Engkau Tuhanku, Engkau menciptakanku, aku hamba-Mu, aku berpegang pada janji-Mu, aku berlindung dari keburukan perbuatanku, aku mengakui dosa-dosaku, ampunilah aku',
    count: 1, virtue: 'SAYYIDUL ISTIGHFAR - Pagi meninggal sebelum sore = SURGA', riwayat: 'HR. Tirmidzi',
  },
  {
    id: 'd09', icon: '🛡️',
    arabic: 'بِسْمِ اللهِ الَّذِى لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِى اْلأَرْضِ وَ لاَ فِى السَّمَاءِ وَ هُوَ السَّمِيْعُ اْلعَلِيْمُ',
    latin: "Bismillaahilladzi laa yadhurru ma'asmihi syaiun fil ardhi wa laa fissamaai wahuwas samii'ul 'aliim",
    meaning: 'Dengan nama Allah yang tidak membahayakan bersama nama-Nya sesuatu di bumi dan di langit',
    count: 3, virtue: 'DIJAGA dari segala bahaya (dibaca 3x pagi & 3x sore)', riwayat: 'HR. Tirmidzi',
  },
  {
    id: 'd10', icon: '🕌',
    arabic: 'سُبْحَانَ اللهِ', latin: 'Subhanallah', meaning: 'Maha Suci Allah',
    count: 100, virtue: 'Pahalanya seperti 100x haji', riwayat: 'HR. Tirmidzi',
  },
  {
    id: 'd11', icon: '⭐',
    arabic: 'اَللهُ أَكْبَرُ', latin: 'Allahu Akbar', meaning: 'Allah Maha Besar',
    count: 100, virtue: 'Pahalanya tidak ada yang menandingi', riwayat: 'HR. Tirmidzi',
  },
  {
    id: 'd12', icon: '🤲',
    arabic: 'اَلْحَمْدُ ِللهِ', latin: 'Alhamdulillah', meaning: 'Segala puji bagi Allah',
    count: 100, virtue: 'Pahalanya seperti 100 kuda di jalan Allah', riwayat: 'HR. Tirmidzi',
  },
  {
    id: 'd13', icon: '🌙',
    arabic: 'لاَ إِلٰهَ إِلاَّ اللهُ', latin: 'Laa ilaaha illallah', meaning: 'Tiada Tuhan selain Allah',
    count: 100, virtue: 'Pahalanya seperti memerdekakan 100 budak', riwayat: 'HR. Tirmidzi',
  },
  {
    id: 'd14', icon: '📿',
    arabic: 'سُبْحَانَ اللهِ وَ بِحَمْدِهِ', latin: 'Subhanallah wabihamdihi', meaning: 'Maha Suci Allah dan dengan pujian-Nya',
    count: 100, virtue: 'Diampuni dosanya meskipun sebanyak BUIH SAMUDERA', riwayat: 'HR. Bukhari',
  },
  {
    id: 'd15', icon: '🔄',
    arabic: 'رَبِّ اغْفِرْلِى وَ تُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيْمُ',
    latin: 'Rabbighfirlii watubb alayya, innaka antatawwaaburrahiim',
    meaning: 'Ya Tuhan, ampunilah aku dan terimalah taubatku, Engkau Maha Penerima taubat lagi Maha Penyayang',
    count: 100, virtue: 'Amalan yang biasa dibaca Nabi 100x setiap duduk', riwayat: 'HR. Abu Dawud',
  },
  {
    id: 'd16', icon: '✨',
    arabic: 'لاَ إِلٰهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيْكَ لَهُ لَهُ اْلمُلْكُ وَ لَهُ اْلحَمْدُ وَ هُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ',
    latin: "Laailaaha illallahu wahdahu laa syariikalahu lahulmulku walahulhamdu wahuwa 'ala kulli syai-in qodiir",
    meaning: 'Tiada Tuhan selain Allah Yang Maha Esa, tiada sekutu bagi-Nya, milik-Nya kerajaan dan segala puji',
    count: 100, virtue: 'Pahala 10 budak, 100 kebaikan, hapus 100 kejelekan, dijaga dari setan', riwayat: 'HR. Bukhari',
  },
];

// ===== SUNNAH HABITS =====
export interface SunnahHabit {
  id: string;
  name: string;
  icon: string;
  arabic: string;
  time: 'pagi' | 'siang' | 'sore' | 'malam';
}

export const SUNNAH_HABITS: SunnahHabit[] = [
  { id: 'h01', name: 'Sholat Tahajud', icon: '🌙', arabic: 'قِيَامُ اللَّيْلِ', time: 'pagi' },
  { id: 'h02', name: 'Dzikir Pagi', icon: '📿', arabic: 'أَذْكَارُ الصَّبَاحِ', time: 'pagi' },
  { id: 'h03', name: 'Sholat Dhuha', icon: '☀️', arabic: 'صَلَاةُ الضُّحَى', time: 'pagi' },
  { id: 'h04', name: 'Tilawah Al-Quran', icon: '📖', arabic: 'تِلَاوَةُ الْقُرْآنِ', time: 'pagi' },
  { id: 'h05', name: 'Sedekah', icon: '🤲', arabic: 'الصَّدَقَةُ', time: 'siang' },
  { id: 'h06', name: 'Puasa Sunnah', icon: '🍽️', arabic: 'الصِّيَامُ', time: 'siang' },
  { id: 'h07', name: 'Dzikir Sore', icon: '🌇', arabic: 'أَذْكَارُ الْمَسَاءِ', time: 'sore' },
  { id: 'h08', name: 'Sholat Rawatib', icon: '🕌', arabic: 'السُّنَنُ الرَّوَاتِبُ', time: 'sore' },
  { id: 'h09', name: 'Makan dengan Tangan Kanan', icon: '🍽️', arabic: 'الْأَكْلُ بِالْيَمِينِ', time: 'siang' },
  { id: 'h10', name: 'Tidur dalam Keadaan Wudhu', icon: '💤', arabic: 'النَّوْمُ عَلَى طَهَارَةٍ', time: 'malam' },
  { id: 'h11', name: 'Baca Ayat Kursi & Al-Mulk', icon: '📖', arabic: 'آيَةُ الْكُرْسِيِّ وَالْمُلْكِ', time: 'malam' },
];

// ===== WISDOM QUOTES =====
export interface WisdomQuote {
  text: string;
  source: string;
  framework: 'stoic' | 'nlp' | 'sedona' | 'atomic';
}

export const WISDOM_QUOTES: WisdomQuote[] = [
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
  { text: "Kamu tidak naik ke level tujuanmu. Kamu jatuh ke level sistemmu.", source: "James Clear", framework: "atomic" },
];

// ===== WISDOM DATA =====
export interface WisdomItem {
  id: string;
  icon: string;
  title: string;
  area: 'istri' | 'anak' | 'diri';
  p: string;
  pm: string;
  detail?: boolean;
  trigger?: string;
  wrong?: string[];
  right?: string[];
  stoic?: string;
  nlp?: string;
  sedona?: string;
  atomic?: string;
}

export const WISDOM_DATA: WisdomItem[] = [
  { id: 'W001', icon: '😤', title: 'Istri Mengomel Panjang', area: 'istri', p: 'الصبر مفتاح الفرج', pm: 'Kesabaran adalah kunci', detail: true, trigger: 'Istri mengomel', wrong: ['Membalas', 'Mengabaikan'], right: ['Dengarkan', 'Validasi'], stoic: 'Fokus respons', nlp: 'Reframe kebutuhan', sedona: 'Lepas ego', atomic: 'Napas 3x' },
  { id: 'W002', icon: '😢', title: 'Anak Tantrum', area: 'anak', p: 'اللين يفتح القلوب', pm: 'Kelembutan membuka hati', detail: true, trigger: 'Anak menangis di publik', wrong: ['Membentak', 'Menyeret'], right: ['Tenang', 'Peluk'], stoic: 'Pandangan orang bukan kontrol', nlp: 'Anchor tenang', sedona: 'Lepas malu', atomic: 'Jongkok sejajar' },
  { id: 'W003', icon: '💼', title: 'Pekerjaan Menumpuk', area: 'diri', p: 'خير العمل أدومه', pm: 'Konsistensi terbaik', detail: true, trigger: 'Deadline banyak', wrong: ['Panik', 'Prokrastinasi'], right: ['Prioritas', 'Fokus satu'], stoic: 'Satu tugas depan', nlp: 'Chunk down', sedona: 'Lepas sempurna', atomic: '2-minute rule' },
  { id: 'W004', icon: '😔', title: 'Istri Diam Dingin', area: 'istri', p: 'الكلمة الطيبة صدقة', pm: 'Kata baik sedekah', detail: true },
  { id: 'W005', icon: '📱', title: 'Anak Kecanduan Gadget', area: 'anak', p: 'القدوة خير', pm: 'Teladan terbaik', detail: true },
  { id: 'W006', icon: '😴', title: 'Bangun Kesiangan', area: 'diri', p: 'البركة في البكور', pm: 'Berkah di pagi', detail: true },
  { id: 'W007', icon: '💔', title: 'Istri Kecewa Berat', area: 'istri', p: 'الاعتراف بالخطأ', pm: 'Akui kesalahan', detail: true },
  { id: 'W008', icon: '🎓', title: 'Anak Malas Belajar', area: 'anak', p: 'العلم بالتعلم', pm: 'Ilmu dengan belajar', detail: true },
  { id: 'W009', icon: '💰', title: 'Tekanan Finansial', area: 'diri', p: 'الرزق بيد الله', pm: 'Rezeki di tangan Allah', detail: true },
  { id: 'W010', icon: '🤝', title: 'Istri Minta Perhatian', area: 'istri', p: 'إذا حضرت فاحضر', pm: 'Hadir sepenuhnya', detail: true },
  { id: 'W011', icon: '😡', title: 'Anak Membantah', area: 'anak', p: 'الحوار قبل القرار', pm: 'Dialog dulu' },
  { id: 'W012', icon: '🔥', title: 'Kehilangan Motivasi', area: 'diri', p: 'إنما الأعمال بالنيات', pm: 'Niat menentukan' },
  { id: 'W013', icon: '💑', title: 'Romantisme Berkurang', area: 'istri', p: 'المودة والرحمة', pm: 'Cinta kasih' },
  { id: 'W014', icon: '📚', title: 'Anak Berbohong', area: 'anak', p: 'الصدق منجاة', pm: 'Jujur keselamatan' },
  { id: 'W015', icon: '😓', title: 'Burnout', area: 'diri', p: 'لنفسك عليك حق', pm: 'Diri punya hak' },
  { id: 'W016', icon: '🏠', title: 'Istri Komplain Rumah', area: 'istri', p: 'التعاون على البر', pm: 'Tolong-menolong' },
  { id: 'W017', icon: '👊', title: 'Anak Berkelahi Saudara', area: 'anak', p: 'العدل بين الأولاد', pm: 'Adil antar anak' },
  { id: 'W018', icon: '📵', title: 'Prokrastinasi Digital', area: 'diri', p: 'الوقت كالسيف', pm: 'Waktu bagai pedang' },
  { id: 'W019', icon: '💬', title: 'Istri Curhat Panjang', area: 'istri', p: 'استمع لتفهم', pm: 'Dengar untuk paham' },
  { id: 'W020', icon: '🌙', title: 'Anak Susah Tidur', area: 'anak', p: 'النوم المبكر صحة', pm: 'Tidur awal sehat' },
  { id: 'W021', icon: '🗣️', title: 'Istri Membandingkan', area: 'istri', p: 'القناعة كنز', pm: 'Qanaah harta' },
  { id: 'W022', icon: '🎮', title: 'Anak Tak Mau Berhenti Main', area: 'anak', p: 'الاعتدال', pm: 'Keseimbangan' },
  { id: 'W023', icon: '😤', title: 'Marah Tanpa Sebab', area: 'diri', p: 'الغضب يفسد', pm: 'Marah merusak' },
  { id: 'W024', icon: '💭', title: 'Istri Cemburu', area: 'istri', p: 'الغيرة من الإيمان', pm: 'Cemburu dari iman' },
  { id: 'W025', icon: '🤕', title: 'Anak Sakit', area: 'anak', p: 'الصبر عند البلاء', pm: 'Sabar saat ujian' },
  { id: 'W026', icon: '😰', title: 'Anxiety', area: 'diri', p: 'التوكل على الله', pm: 'Tawakkal' },
  { id: 'W027', icon: '👨‍👩‍👧', title: 'Beda Pola Asuh', area: 'istri', p: 'الشورى', pm: 'Musyawarah' },
  { id: 'W028', icon: '📝', title: 'Anak Nilai Jelek', area: 'anak', p: 'الفشل بداية', pm: 'Gagal awal sukses' },
  { id: 'W029', icon: '🎯', title: 'Tidak Bisa Fokus', area: 'diri', p: 'الإتقان', pm: 'Kesempurnaan' },
  { id: 'W030', icon: '🏃', title: 'Istri Lelah Urus Anak', area: 'istri', p: 'خير الناس', pm: 'Sebaik manusia' },
];

// ===== BEST WEEK TEMPLATE =====
export interface ScheduleItem {
  time: string;
  activity: string;
  category: string;
}

export const BEST_WEEK_TEMPLATE = {
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
    { time: '22:00', activity: 'Tidur', category: 'routine' },
  ] as ScheduleItem[],
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
    { time: '22:00', activity: 'Tidur', category: 'routine' },
  ] as ScheduleItem[],
};
