/**
 * ============================================
 * SYNC PLANNER v4.2 - DZIKIR MODULE
 * Fitur Dzikir dengan urutan optimal dan auto-advance
 * ============================================
 */

const SyncDzikir = {
  // State
  state: {
    time: 'pagi', // 'pagi' atau 'sore'
    currentDzikir: null,
    currentCount: 0,
    currentIndex: 0,
    progress: {},
    isFullscreen: false,
    sortedData: [] // Data yang sudah diurutkan
  },
  
  // Data dzikir - diurutkan dari yang paling sedikit & pendek ke yang paling banyak & panjang
  // Urutan: target (ascending) -> panjang text (ascending)
  DATA: [
    // === TARGET 1x (paling sedikit) ===
    {
      id: 'kafaratul_majlis',
      arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
      latin: "Subhaanakallaahumma wa bihamdika, asyhadu an laa ilaaha illaa anta, astaghfiruka wa atuubu ilaik",
      meaning: 'Maha Suci Engkau ya Allah dan segala puji bagi-Mu. Aku bersaksi tidak ada Tuhan selain Engkau. Aku memohon ampun dan bertaubat kepada-Mu',
      target: 1,
      time: 'both',
      virtue: 'Kafaratul Majelis - Diampuni dosanya selama di majelisnya itu.',
      source: 'HR. Tirmidzi',
      icon: '📿'
    },
    {
      id: 'melihat_ujian',
      arabic: 'الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا',
      latin: "Alhamdulillaahil ladzii 'aafaanii mimmab talaaka bihi wa fadhdhalanii 'alaa katsiirin mimman khalaqa tafdhiilaa",
      meaning: 'Segala puji bagi Allah yang telah menyelamatkan aku dari ujian yang menimpamu dan mengutamakan aku atas kebanyakan makhluk-Nya',
      target: 1,
      time: 'both',
      virtue: 'Dibaca saat melihat orang yang tertimpa ujian. Diselamatkan dari ujian tersebut.',
      source: 'HR. Tirmidzi',
      icon: '👁️'
    },
    {
      id: 'sayyidul_istighfar',
      arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ وَأَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَعْتَرِفُ بِذُنُوبِي فَاغْفِرْ لِي ذُنُوبِي إِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      latin: "Allaahumma anta rabbii laa ilaaha illaa anta, khalaqtanii wa ana 'abduka wa ana 'alaa 'ahdika wa wa'dika mastatha'tu. A'uudzu bika min syarri maa shana'tu. Abu'u laka bini'matika 'alayya wa a'tarifu bidzunuubii faghfir lii dzunuubii innahu laa yaghfirudz dzunuuba illaa anta",
      meaning: 'Ya Allah, Engkau adalah Tuhanku. Tidak ada Tuhan selain Engkau. Engkau telah menciptakan aku dan aku adalah hamba-Mu...',
      target: 1,
      time: 'both',
      virtue: 'Sayyidul Istighfar - Membacanya pagi/sore lalu meninggal hari itu, masuk surga.',
      source: 'HR. Bukhari',
      icon: '👑'
    },
    
    // === TARGET 3x ===
    {
      id: 'radhitu',
      arabic: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ رَسُولًا',
      latin: "Radhiitu billaahi rabban, wa bil islaami diinan, wa bi muhammadin rasuulan",
      meaning: 'Aku ridha Allah sebagai Tuhan, Islam sebagai agama, dan Muhammad sebagai Rasul',
      target: 3,
      time: 'both',
      virtue: 'Wajib baginya untuk masuk Surga.',
      source: 'HR. Abu Dawud',
      icon: '🕌'
    },
    {
      id: 'istighfar',
      arabic: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ',
      latin: "Astaghfirullaahal ladzii laa ilaaha illaa huwal hayyul qayyuum wa atuubu ilaih",
      meaning: 'Aku memohon ampun kepada Allah yang tidak ada Tuhan selain Dia, Yang Maha Hidup lagi Maha Berdiri Sendiri',
      target: 3,
      time: 'both',
      virtue: 'Akan diampuni walaupun dia pernah lari dari medan pertempuran.',
      source: 'HR. Abu Dawud & Tirmidzi',
      icon: '🙏'
    },
    {
      id: 'bismillah_perlindungan',
      arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      latin: "Bismillaahil ladzii laa yadhurru ma'asmihi syai'un fil ardhi wa laa fis samaa'i wa huwas samii'ul 'aliim",
      meaning: 'Dengan nama Allah yang tidak ada sesuatupun di bumi dan di langit yang membahayakan bersama nama-Nya',
      target: 3,
      time: 'both',
      virtue: 'Tidak akan diganggu oleh sesuatupun.',
      source: 'HR. Abu Dawud & Tirmidzi',
      icon: '🛡️'
    },
    
    // === TARGET 7x ===
    {
      id: 'doa_kesusahan',
      arabic: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
      latin: "Laa ilaaha illallaahul 'azhiimul haliim. Laa ilaaha illallaahu rabbul 'arsyil 'azhiim. Laa ilaaha illallaahu rabbus samaawaati wa rabbul ardhi wa rabbul 'arsyil kariim",
      meaning: 'Tidak ada Tuhan selain Allah Yang Maha Agung lagi Maha Penyantun...',
      target: 7,
      time: 'both',
      virtue: 'Doa Nabi ﷺ saat kesusahan dan kesedihan.',
      source: 'HR. Bukhari & Muslim',
      icon: '🤲'
    },
    
    // === TARGET 33x ===
    {
      id: 'subhanallah_azim',
      arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
      latin: "Subhaanallaahi wa bihamdihi, Subhaanallaahil 'Azhiim",
      meaning: 'Maha Suci Allah dan segala puji bagi-Nya, Maha Suci Allah Yang Maha Agung',
      target: 33,
      time: 'both',
      virtue: 'Dua kalimat yang ringan di lisan, berat di timbangan, dan disukai Ar-Rahman.',
      source: 'HR. Bukhari & Muslim',
      icon: '⚖️'
    },
    {
      id: 'tahlil_takbir',
      arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
      latin: "Laa ilaaha illallaahu wallaahu akbar, wa laa hawla wa laa quwwata illaa billaah",
      meaning: 'Tidak ada Tuhan selain Allah, Allah Maha Besar, tidak ada daya dan kekuatan kecuali dengan Allah',
      target: 33,
      time: 'both',
      virtue: 'Diampuni dosa-dosanya walaupun seperti buih lautan.',
      source: 'HR. Muslim',
      icon: '🌟'
    },
    
    // === TARGET 100x (paling banyak) - diurutkan dari pendek ke panjang ===
    {
      id: 'tasbih_100',
      arabic: 'سُبْحَانَ اللَّهِ',
      latin: "Subhaanallah",
      meaning: 'Maha Suci Allah',
      target: 100,
      time: 'both',
      virtue: 'Seperti pahala 100 kali haji.',
      source: 'HR. Tirmidzi',
      icon: '✨'
    },
    {
      id: 'tahmid_100',
      arabic: 'الْحَمْدُ لِلَّهِ',
      latin: "Alhamdulillah",
      meaning: 'Segala puji bagi Allah',
      target: 100,
      time: 'both',
      virtue: 'Seperti membawa 100 kuda di jalan Allah.',
      source: 'HR. Tirmidzi',
      icon: '🐎'
    },
    {
      id: 'tahlil_murni_100',
      arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
      latin: "Laa ilaaha illallah",
      meaning: 'Tidak ada Tuhan selain Allah',
      target: 100,
      time: 'both',
      virtue: 'Seperti memerdekakan budak dari anak Ismail.',
      source: 'HR. Tirmidzi',
      icon: '🕊️'
    },
    {
      id: 'takbir_100',
      arabic: 'اللَّهُ أَكْبَرُ',
      latin: "Allahu Akbar",
      meaning: 'Allah Maha Besar',
      target: 100,
      time: 'both',
      virtue: 'Tidak ada yang membawa amal lebih banyak kecuali yang membaca lebih banyak.',
      source: 'HR. Tirmidzi',
      icon: '🌙'
    },
    {
      id: 'subhanallah_100',
      arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
      latin: "Subhaanallaahi wa bihamdihi",
      meaning: 'Maha Suci Allah dan segala puji bagi-Nya',
      target: 100,
      time: 'both',
      virtue: 'Kesalahan-kesalahannya akan terampuni walaupun sebanyak buih di lautan.',
      source: 'HR. Bukhari & Muslim',
      icon: '🌊'
    },
    {
      id: 'taubat',
      arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
      latin: "Rabbighfir lii wa tub 'alayya innaka antat tawwaabur rahiim",
      meaning: 'Ya Tuhanku, ampunilah aku dan terimalah taubatku. Sesungguhnya Engkau Maha Penerima taubat',
      target: 100,
      time: 'both',
      virtue: 'Nabi ﷺ membaca doa ini 100 kali dalam sehari.',
      source: 'HR. Tirmidzi & Ibnu Majah',
      icon: '💚'
    },
    {
      id: 'tahlil_100',
      arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      latin: "Laa ilaaha illallaahu wahdahu laa syariika lahu, lahul mulku wa lahul hamdu wa huwa 'alaa kulli syai'in qadiir",
      meaning: 'Tidak ada Tuhan selain Allah, Yang Maha Esa, tidak ada sekutu bagi-Nya. Bagi-Nya kerajaan dan pujian.',
      target: 100,
      time: 'both',
      virtue: 'Pahala seperti membebaskan 10 budak, ditetapkan 100 kebaikan, dijauhkan 100 keburukan.',
      source: 'HR. Bukhari & Muslim',
      icon: '🏆'
    }
  ],
  
  // Vibration patterns
  VIBRATION: {
    tap: 30,           // Ketukan normal
    complete: [100, 50, 100, 50, 200], // Selesai target - getaran panjang
    navigate: 20,      // Navigasi
    error: [50, 100, 50] // Error
  },
  
  // Initialize
  init() {
    // Sort data by target (ascending), then by arabic length (ascending)
    this.state.sortedData = [...this.DATA].sort((a, b) => {
      if (a.target !== b.target) {
        return a.target - b.target; // Target lebih sedikit dulu
      }
      return a.arabic.length - b.arabic.length; // Text lebih pendek dulu
    });
    
    // Load progress dari localStorage
    const today = this.getTodayString();
    const savedData = localStorage.getItem(`dzikir_${today}`);
    if (savedData) {
      try {
        this.state.progress = JSON.parse(savedData);
      } catch(e) {
        this.state.progress = {};
      }
    }
    
    // Auto detect waktu
    const hour = new Date().getHours();
    this.state.time = hour < 12 ? 'pagi' : 'sore';
    
    this.renderPage();
  },
  
  // Get today string
  getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },
  
  // Get filtered & sorted data based on time
  getFilteredData() {
    return this.state.sortedData.filter(d => d.time === 'both' || d.time === this.state.time);
  },
  
  // Get progress for current time
  getTimeProgress() {
    return this.state.progress[this.state.time] || {};
  },
  
  // Calculate overall progress
  getOverallProgress() {
    const data = this.getFilteredData();
    const progress = this.getTimeProgress();
    
    let completed = 0;
    let total = data.length;
    
    data.forEach(d => {
      if ((progress[d.id] || 0) >= d.target) {
        completed++;
      }
    });
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  },
  
  // Set time (pagi/sore)
  setTime(time) {
    this.state.time = time;
    this.renderPage();
  },
  
  // Vibrate device
  vibrate(pattern) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  },
  
  // Save progress to localStorage
  saveProgress() {
    const today = this.getTodayString();
    localStorage.setItem(`dzikir_${today}`, JSON.stringify(this.state.progress));
  },
  
  // Open dzikir counter
  openCounter(id) {
    const data = this.getFilteredData();
    const index = data.findIndex(d => d.id === id);
    if (index === -1) return;
    
    const dzikir = data[index];
    
    this.state.currentDzikir = dzikir;
    this.state.currentIndex = index;
    
    const progress = this.getTimeProgress();
    this.state.currentCount = progress[id] || 0;
    
    this.state.isFullscreen = true;
    this.renderFullscreen();
    
    // Show fullscreen
    document.getElementById('dzikirFullscreen').classList.add('active');
    document.body.classList.add('dzikir-fullscreen-active');
    document.body.style.overflow = 'hidden';
  },
  
  // Close fullscreen
  closeFullscreen() {
    this.state.isFullscreen = false;
    document.getElementById('dzikirFullscreen').classList.remove('active');
    document.body.classList.remove('dzikir-fullscreen-active');
    document.body.style.overflow = '';
    
    this.saveProgress();
    this.renderPage();
  },
  
  // Increment counter
  increment() {
    if (!this.state.currentDzikir) return;
    
    const target = this.state.currentDzikir.target;
    const prevCount = this.state.currentCount;
    
    this.state.currentCount++;
    
    // Update progress
    if (!this.state.progress[this.state.time]) {
      this.state.progress[this.state.time] = {};
    }
    this.state.progress[this.state.time][this.state.currentDzikir.id] = this.state.currentCount;
    
    // Update UI
    this.updateFullscreenCount();
    
    // Check if target reached
    if (prevCount < target && this.state.currentCount >= target) {
      // TARGET REACHED! Getaran panjang dan auto-advance
      this.vibrate(this.VIBRATION.complete);
      
      // Save progress
      this.saveProgress();
      
      // Auto advance to next dzikir after short delay
      setTimeout(() => {
        this.goToNext(true); // true = auto advance (from completion)
      }, 800); // Tunggu sebentar agar user merasakan getaran
      
    } else {
      // Normal tap vibration
      this.vibrate(this.VIBRATION.tap);
    }
  },
  
  // Decrement counter
  decrement() {
    if (this.state.currentCount > 0) {
      this.state.currentCount--;
      
      // Update progress
      if (!this.state.progress[this.state.time]) {
        this.state.progress[this.state.time] = {};
      }
      this.state.progress[this.state.time][this.state.currentDzikir.id] = this.state.currentCount;
      
      this.updateFullscreenCount();
      this.vibrate(this.VIBRATION.tap);
    }
  },
  
  // Reset counter
  reset() {
    this.state.currentCount = 0;
    
    if (!this.state.progress[this.state.time]) {
      this.state.progress[this.state.time] = {};
    }
    this.state.progress[this.state.time][this.state.currentDzikir.id] = 0;
    
    this.updateFullscreenCount();
  },
  
  // Go to previous dzikir
  goToPrev() {
    if (this.state.currentIndex <= 0) return;
    
    this.saveProgress();
    
    const data = this.getFilteredData();
    this.state.currentIndex--;
    const dzikir = data[this.state.currentIndex];
    this.state.currentDzikir = dzikir;
    
    const progress = this.getTimeProgress();
    this.state.currentCount = progress[dzikir.id] || 0;
    
    this.renderFullscreen();
    this.vibrate(this.VIBRATION.navigate);
  },
  
  // Go to next dzikir
  goToNext(isAutoAdvance = false) {
    const data = this.getFilteredData();
    
    if (this.state.currentIndex >= data.length - 1) {
      // Sudah dzikir terakhir
      if (isAutoAdvance) {
        // Show completion message
        this.showCompletionToast();
      }
      return;
    }
    
    this.saveProgress();
    
    this.state.currentIndex++;
    const dzikir = data[this.state.currentIndex];
    this.state.currentDzikir = dzikir;
    
    const progress = this.getTimeProgress();
    this.state.currentCount = progress[dzikir.id] || 0;
    
    this.renderFullscreen();
    
    if (!isAutoAdvance) {
      this.vibrate(this.VIBRATION.navigate);
    }
  },
  
  // Show completion toast
  showCompletionToast() {
    if (typeof showToast === 'function') {
      showToast('Masya Allah! Semua dzikir selesai ✨', 'success');
    }
  },
  
  // Update fullscreen count display
  updateFullscreenCount() {
    const countEl = document.getElementById('dzikirFsCount');
    const progressBar = document.getElementById('dzikirFsProgressBar');
    const circle = document.getElementById('dzikirFsCircle');
    const completeBtn = document.getElementById('dzikirFsCompleteBtn');
    
    if (!countEl) return;
    
    const target = this.state.currentDzikir?.target || 100;
    const count = this.state.currentCount;
    const percentage = Math.min((count / target) * 100, 100);
    
    countEl.textContent = count;
    
    if (progressBar) {
      progressBar.style.width = percentage + '%';
    }
    
    // Update styling based on completion
    const isCompleted = count >= target;
    
    if (circle) {
      circle.classList.toggle('completed', isCompleted);
    }
    
    if (progressBar) {
      progressBar.classList.toggle('completed', isCompleted);
    }
    
    if (completeBtn) {
      completeBtn.classList.toggle('done', isCompleted);
      completeBtn.textContent = isCompleted ? '✓ Alhamdulillah!' : '✓ Selesai & Simpan';
    }
  },
  
  // Render fullscreen UI
  renderFullscreen() {
    const dzikir = this.state.currentDzikir;
    if (!dzikir) return;
    
    const data = this.getFilteredData();
    
    // Title
    const titleEl = document.getElementById('dzikirFsTitle');
    if (titleEl) {
      titleEl.textContent = `${dzikir.icon} ${dzikir.latin.substring(0, 25)}${dzikir.latin.length > 25 ? '...' : ''}`;
    }
    
    // Arabic text
    const arabicEl = document.getElementById('dzikirFsArabic');
    if (arabicEl) {
      arabicEl.textContent = dzikir.arabic;
    }
    
    // Latin text
    const latinEl = document.getElementById('dzikirFsLatin');
    if (latinEl) {
      latinEl.textContent = dzikir.latin;
    }
    
    // Meaning
    const meaningEl = document.getElementById('dzikirFsMeaning');
    if (meaningEl) {
      meaningEl.textContent = dzikir.meaning;
    }
    
    // Target
    const targetEl = document.getElementById('dzikirFsTarget');
    if (targetEl) {
      targetEl.textContent = `/ ${dzikir.target}`;
    }
    
    // Virtue
    const virtueEl = document.getElementById('dzikirFsVirtueText');
    if (virtueEl) {
      virtueEl.textContent = dzikir.virtue;
    }
    
    // Navigation indicator
    const indicatorEl = document.getElementById('dzikirNavIndicator');
    if (indicatorEl) {
      indicatorEl.textContent = `${this.state.currentIndex + 1}/${data.length}`;
    }
    
    // Prev/Next buttons
    const prevBtn = document.getElementById('dzikirPrevBtn');
    const nextBtn = document.getElementById('dzikirNextBtn');
    
    if (prevBtn) {
      prevBtn.disabled = this.state.currentIndex === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = this.state.currentIndex === data.length - 1;
    }
    
    // Update count
    this.updateFullscreenCount();
  },
  
  // Render main page
  renderPage() {
    const container = document.getElementById('dzikirList');
    if (!container) return;
    
    const data = this.getFilteredData();
    const progress = this.getTimeProgress();
    const overallProgress = this.getOverallProgress();
    
    // Update header progress
    const headerProgress = document.getElementById('dzikirProgress');
    if (headerProgress) {
      headerProgress.textContent = `${overallProgress.percentage}%`;
    }
    
    // Update time tabs
    document.querySelectorAll('.dzikir-time-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.time === this.state.time);
    });
    
    // Render list with grouping by target
    let html = '';
    let currentGroup = null;
    
    data.forEach((d, index) => {
      const count = progress[d.id] || 0;
      const isCompleted = count >= d.target;
      
      // Group header
      if (currentGroup !== d.target) {
        currentGroup = d.target;
        html += `
          <div class="dzikir-group-header">
            <span class="dzikir-group-target">${d.target}x</span>
            <span class="dzikir-group-label">${this.getGroupLabel(d.target)}</span>
          </div>
        `;
      }
      
      html += `
        <div class="dzikir-item ${isCompleted ? 'completed' : ''}" onclick="SyncDzikir.openCounter('${d.id}')">
          <div class="dzikir-item-icon">${isCompleted ? '✓' : d.icon}</div>
          <div class="dzikir-item-content">
            <div class="dzikir-item-arabic">${d.arabic.substring(0, 50)}${d.arabic.length > 50 ? '...' : ''}</div>
            <div class="dzikir-item-title">${d.latin.substring(0, 40)}${d.latin.length > 40 ? '...' : ''}</div>
            <div class="dzikir-item-count">${d.target}x • ${d.source}</div>
          </div>
          <div class="dzikir-item-progress">
            <div class="dzikir-item-progress-text">${count}/${d.target}</div>
            <div class="dzikir-item-progress-bar">
              <div class="dzikir-item-progress-fill" style="width: ${Math.min((count/d.target)*100, 100)}%"></div>
            </div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    // Update summary
    const summaryEl = document.getElementById('dzikirSummary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="dzikir-summary-item">
          <span class="dzikir-summary-value">${overallProgress.completed}</span>
          <span class="dzikir-summary-label">Selesai</span>
        </div>
        <div class="dzikir-summary-divider"></div>
        <div class="dzikir-summary-item">
          <span class="dzikir-summary-value">${overallProgress.total - overallProgress.completed}</span>
          <span class="dzikir-summary-label">Tersisa</span>
        </div>
        <div class="dzikir-summary-divider"></div>
        <div class="dzikir-summary-item">
          <span class="dzikir-summary-value">${overallProgress.percentage}%</span>
          <span class="dzikir-summary-label">Progress</span>
        </div>
      `;
    }
  },
  
  // Get group label
  getGroupLabel(target) {
    const labels = {
      1: 'Sekali baca',
      3: 'Tiga kali',
      7: 'Tujuh kali',
      33: 'Tiga puluh tiga kali',
      100: 'Seratus kali'
    };
    return labels[target] || `${target} kali`;
  },
  
  // Reset all progress today
  resetToday() {
    if (!confirm('Reset semua dzikir hari ini?')) return;
    
    this.state.progress = {};
    const today = this.getTodayString();
    localStorage.removeItem(`dzikir_${today}`);
    
    this.renderPage();
    
    if (typeof showToast === 'function') {
      showToast('Dzikir direset', 'info');
    }
  },
  
  // Start from first incomplete dzikir
  startSession() {
    const data = this.getFilteredData();
    const progress = this.getTimeProgress();
    
    // Find first incomplete dzikir
    const firstIncomplete = data.findIndex(d => (progress[d.id] || 0) < d.target);
    
    if (firstIncomplete === -1) {
      // All complete
      if (typeof showToast === 'function') {
        showToast('Semua dzikir sudah selesai! Masya Allah ✨', 'success');
      }
      return;
    }
    
    this.openCounter(data[firstIncomplete].id);
  }
};

// Backward compatibility functions
function initDzikir() { SyncDzikir.init(); }
function openDzikirCounter(id) { SyncDzikir.openCounter(id); }
function closeDzikirFullscreen() { SyncDzikir.closeFullscreen(); }
function incrementDzikirFs() { SyncDzikir.increment(); }
function decrementDzikirFs() { SyncDzikir.decrement(); }
function resetDzikirFs() { SyncDzikir.reset(); }
function goToPrevDzikir() { SyncDzikir.goToPrev(); }
function goToNextDzikir() { SyncDzikir.goToNext(); }
function completeDzikirFs() { 
  SyncDzikir.saveProgress();
  SyncDzikir.closeFullscreen();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SyncDzikir };
}
