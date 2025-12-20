# 🔄 Setup Google Sheets Sync - Sync Planner

Panduan lengkap untuk mengaktifkan sinkronisasi otomatis aplikasi Sync Planner dengan Google Sheets.

---

## 📋 Daftar Isi

1. [Persiapan](#persiapan)
2. [Setup Google Sheets](#setup-google-sheets)
3. [Deploy Apps Script](#deploy-apps-script)
4. [Konfigurasi Aplikasi](#konfigurasi-aplikasi)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## ⚙️ Persiapan

### Yang Anda Butuhkan:
- ✅ Akun Google
- ✅ Google Sheets yang sudah disiapkan
- ✅ Akses ke Google Apps Script

---

## 📊 Setup Google Sheets

### Langkah 1: Buka Google Sheets Anda

Buka link ini di browser:
```
https://docs.google.com/spreadsheets/d/17OKXU-lLbQvpY6bliaH5wgVzU597vqG6AAeZDVPdEaM/edit
```

### Langkah 2: Buat Struktur Sheets

Anda bisa setup otomatis atau manual:

#### Opsi A: Setup Otomatis (Recommended)
1. Buka **Extensions** > **Apps Script**
2. Copy paste kode dari file `google-apps-script.js`
3. Simpan (Ctrl+S atau Cmd+S)
4. Klik **Run** > Pilih function `setupSheets`
5. Authorize script (klik "Review Permissions" > pilih akun > "Allow")
6. Tunggu hingga selesai (cek log di bawah)

#### Opsi B: Setup Manual
Buat 8 sheets dengan nama berikut (case-sensitive):
- `Dzikir`
- `Sholat`
- `Tasks`
- `Journal`
- `Pomodoro`
- `Habits`
- `Goals`
- `SyncLog`

Setiap sheet harus punya header di row pertama:
```
UserId | Date | Data | LastSync
```

---

## 🚀 Deploy Apps Script

### Langkah 1: Buka Apps Script Editor

1. Di Google Sheets, klik **Extensions** > **Apps Script**
2. Hapus kode default yang ada
3. Copy **SEMUA** kode dari file `google-apps-script.js` di folder project
4. Paste ke Apps Script editor
5. Ubah nama project jadi "Sync Planner API" (optional)
6. Klik **Save** (💾 icon atau Ctrl+S)

### Langkah 2: Deploy sebagai Web App

1. Klik **Deploy** > **New deployment**
2. Klik ⚙️ icon di samping "Select type"
3. Pilih **Web app**
4. Isi konfigurasi:
   - **Description**: "Sync Planner API v1"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone**
5. Klik **Deploy**
6. Authorize app (klik "Authorize access")
   - Pilih akun Google Anda
   - Klik "Advanced" > "Go to Sync Planner API (unsafe)"
   - Klik "Allow"
7. **PENTING**: Copy **Web app URL** yang muncul
   - Contoh: `https://script.google.com/macros/s/AKfycby.../exec`
   - Simpan URL ini, akan dipakai di langkah berikutnya

### Langkah 3: Test Apps Script

Test apakah Apps Script sudah berjalan:

1. Buka tab baru di browser
2. Paste URL web app Anda dan tambahkan parameter test:
   ```
   https://script.google.com/.../exec?action=getAllData&userId=default
   ```
3. Jika berhasil, Anda akan melihat response JSON:
   ```json
   {
     "success": true,
     "data": {
       "dzikir": {},
       "sholat": {},
       ...
     }
   }
   ```

---

## 🔧 Konfigurasi Aplikasi

### Langkah 1: Update Config File

Buka file `js/config.js` dan update:

```javascript
const Config = {
  // Paste Web App URL dari langkah sebelumnya
  GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby.../exec',

  // User ID (bisa email atau 'default')
  USER_ID: 'default',

  // Aktifkan sync
  SYNC_ENABLED: true,  // ← Ubah jadi true
  AUTO_SYNC: true,
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 menit

  // Debug mode (false untuk production)
  DEBUG: false  // ← Ubah jadi false untuk production
};
```

### Langkah 2: Save & Refresh

1. Save file `config.js`
2. Refresh aplikasi Sync Planner di browser (Ctrl+R atau Cmd+R)
3. Buka Console (F12) untuk melihat log sync

---

## ✅ Testing

### Test 1: Manual Sync

1. Buka aplikasi Sync Planner
2. Tambah data (misal: isi dzikir atau sholat)
3. Klik tombol **🔄** di header (sync button)
4. Harus muncul toast: "✓ Tersinkronisasi dengan Google Sheets"
5. Buka Google Sheets dan cek sheet "Dzikir" atau "Sholat"
6. Data harus muncul di sana

### Test 2: Auto Sync

1. Buka aplikasi
2. Tambah beberapa data
3. Pindah ke tab/halaman lain
4. Kembali ke Google Sheets
5. Data harus otomatis tersinkronisasi

### Test 3: Load from Cloud

1. Hapus localStorage browser (F12 > Application > Local Storage > Clear All)
2. Refresh aplikasi
3. Data harus otomatis dimuat dari Google Sheets

---

## 🐛 Troubleshooting

### Masalah: "Sync failed" atau error 403

**Penyebab**: Apps Script tidak authorized atau setting access salah

**Solusi**:
1. Buka Apps Script editor
2. Re-deploy dengan setting "Who has access: Anyone"
3. Test URL lagi di browser

### Masalah: Data tidak tersimpan ke Sheets

**Penyebab**: Sheet name salah atau struktur header salah

**Solusi**:
1. Pastikan nama sheets persis sama (case-sensitive)
2. Jalankan function `setupSheets()` untuk auto-create sheets
3. Cek Console browser (F12) untuk error message

### Masalah: "CORS error"

**Penyebab**: Apps Script URL salah atau belum di-deploy

**Solusi**:
1. Pastikan URL di config.js adalah **Web app URL**, bukan script project URL
2. URL harus diakhiri dengan `/exec`
3. Re-deploy Apps Script jika perlu

### Masalah: Sync lambat

**Penyebab**: Terlalu banyak data atau koneksi internet lambat

**Solusi**:
1. Ubah `SYNC_INTERVAL` di config.js jadi lebih besar (misal 10 menit)
2. Kurangi data yang disimpan (hapus data lama di localStorage)

### Debug Mode

Untuk troubleshooting lebih detail, aktifkan debug mode di `config.js`:

```javascript
DEBUG: true
```

Lalu buka Console (F12) untuk melihat log detail:
- `✓ Sync Manager initialized` - Sync ready
- `📤 Syncing to Google Sheets...` - Proses sync dimulai
- `✓ Sync completed` - Sync berhasil
- `❌ Sync error: ...` - Error message

---

## 📱 Multi-Device Sync

Untuk sync antar perangkat (HP, laptop, dll):

1. Gunakan **USER_ID** yang berbeda untuk setiap user
2. Atau gunakan email sebagai USER_ID:
   ```javascript
   USER_ID: 'email@example.com'
   ```
3. Data akan terpisah per user di Google Sheets

---

## 🔒 Keamanan

### Data Privacy

- Semua data tersimpan di Google Sheets **milik Anda sendiri**
- Apps Script berjalan dengan **akun Anda**
- Tidak ada server pihak ketiga yang menyimpan data
- Setting "Anyone" di Apps Script artinya siapa saja yang punya URL bisa akses
- Jika ingin lebih aman, gunakan authentication (advanced)

### Backup

Google Sheets otomatis backup data Anda. Untuk backup manual:

1. Buka Google Sheets
2. File > Download > Excel (.xlsx) atau CSV
3. Simpan di komputer sebagai backup

---

## 📚 Struktur Data di Google Sheets

Setiap sheet menyimpan data dengan format:

| UserId  | Date       | Data (JSON)                          | LastSync           |
|---------|------------|--------------------------------------|--------------------|
| default | 2025-12-20 | {"d01": 5, "d02": 10, ...}          | 2025-12-20T10:30Z  |
| default | 2025-12-21 | {"d01": 7, "d02": 12, ...}          | 2025-12-21T09:15Z  |

- **UserId**: Identifier user (default atau email)
- **Date**: Tanggal data (YYYY-MM-DD)
- **Data**: JSON object berisi data lengkap hari itu
- **LastSync**: Timestamp terakhir sync

---

## 🎉 Selesai!

Aplikasi Sync Planner Anda sekarang sudah terhubung dengan Google Sheets!

Semua data akan otomatis tersinkronisasi:
- ✅ Saat pindah halaman/tab
- ✅ Setiap 5 menit (jika ada perubahan)
- ✅ Saat klik tombol sync manual
- ✅ Saat close browser (menggunakan beacon)

---

## 📞 Support

Jika ada masalah:
1. Cek Console browser (F12) untuk error message
2. Cek Execution log di Apps Script editor (View > Logs)
3. Review dokumentasi ini lagi
4. Test dengan data kecil dulu sebelum production

**Happy Syncing! 🚀**
