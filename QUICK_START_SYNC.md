# ⚡ Quick Start - Google Sheets Sync

Panduan singkat untuk setup sync dalam 5 menit!

---

## 🎯 3 Langkah Utama

### 1️⃣ Deploy Apps Script (3 menit)

1. Buka: https://docs.google.com/spreadsheets/d/17OKXU-lLbQvpY6bliaH5wgVzU597vqG6AAeZDVPdEaM/edit
2. **Extensions** > **Apps Script**
3. Copy paste kode dari `google-apps-script.js`
4. **Run** > `setupSheets` (untuk buat sheets otomatis)
5. **Deploy** > **New deployment** > **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. **Copy URL** yang muncul

### 2️⃣ Update Config (1 menit)

Edit file `js/config.js`:

```javascript
GOOGLE_APPS_SCRIPT_URL: 'PASTE_URL_DISINI',
SYNC_ENABLED: true,  // Ubah jadi true
DEBUG: false         // Ubah jadi false
```

### 3️⃣ Test (1 menit)

1. Refresh aplikasi
2. Tambah data (dzikir/sholat)
3. Klik tombol 🔄 di header
4. Cek Google Sheets - data harus muncul!

---

## ✅ Checklist

- [ ] Apps Script sudah di-deploy
- [ ] URL sudah di-paste ke config.js
- [ ] SYNC_ENABLED = true
- [ ] Test manual sync berhasil
- [ ] Data muncul di Google Sheets

---

## 🆘 Troubleshooting Cepat

**Error 403?** → Re-deploy dengan "Who has access: Anyone"

**Data tidak muncul?** → Cek Console (F12) untuk error

**Sync lambat?** → Normal, tunggu beberapa detik

---

Dokumentasi lengkap: `SETUP_GOOGLE_SHEETS.md`
