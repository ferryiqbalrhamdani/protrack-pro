<div align="center">

# 🚀 ProTrack Pro

**Sistem Manajemen Proyek Pengadaan Barang & Jasa**

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> *Kelola seluruh siklus hidup proyek pengadaan dari kontrak hingga pengiriman dalam satu platform yang terintegrasi.*

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Screenshot](#-screenshot)
- [Teknologi](#-teknologi)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Modul Aplikasi](#-modul-aplikasi)
- [Struktur Proyek](#-struktur-proyek)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## 🎯 Tentang Proyek

**ProTrack Pro** adalah aplikasi manajemen proyek berbasis web yang dirancang khusus untuk mengelola proyek pengadaan barang & jasa secara menyeluruh. Mulai dari penandatanganan kontrak, pelacakan merchandising, penagihan, hingga pengiriman barang — semua terintegrasi dalam satu dashboard yang modern dan responsif.

Dibangun menggunakan **Laravel + Inertia.js + React**, ProTrack Pro menghadirkan pengalaman SPA (Single Page Application) yang cepat dan mulus tanpa meninggalkan kekuatan backend Laravel.

---

## ✨ Fitur Utama

### 📊 Dashboard & Laporan
- Overview ringkasan proyek aktif, pending, dan selesai
- Widget lifecycle status per modul (Kontrak, Merchandiser, Penagihan, Pengiriman)
- Akumulasi nilai kontrak dan pembayaran
- Laporan detail proyek dengan kemampuan **cetak PDF landscape**
- **Watermark otomatis** berdasarkan status proyek (ONGOING / PENDING / COMPLETED)

### 📁 Manajemen Proyek
- CRUD proyek lengkap dengan informasi kontrak, vendor, PIC, dan anggaran
- Filter dan pencarian proyek dengan pagination server-side
- Log aktivitas otomatis pada setiap perubahan

### 📜 Modul Kontrak
- Pengelolaan Nomor Jaminan (JAMLAK, JAMUK, JAMWAR) beserta nilai nominalnya
- Tahapan/Steps kontrak dengan status penyelesaian
- Lampiran dokumen kontrak

### 🛒 Modul Merchandiser
- Tracking items kontrak vs items diterima (dalam unit & EA)
- Manajemen Purchase Order (PO) & Invoice terintegrasi
- Upload multi-file dokumen pendukung
- Progress tracking dengan persentase penyelesaian

### 💰 Modul Penagihan (Billing)
- Manajemen BAST (Berita Acara Serah Terima)
- Tahapan tagihan dengan status lunas/pending
- Lampiran dokumen penagihan

### 🚚 Modul Pengiriman (Shipping)
- Pencatatan BA Anname dan BA Inname
- Status dan tanggal pengiriman
- Dokumen pendukung pengiriman

### 🗂️ Master Data
- Manajemen **Perusahaan**, **Instansi**, **Vendor**, **PIC**
- **Jenis Lelang**, **Jenis Anggaran**, **Asal Merek & Sertifikasi**
- CRUD lengkap dengan activity logging

### 👥 Manajemen Pengguna & Roles
- Multi-role user management
- Akses kontrol berbasis role
- Activity log seluruh pengguna

---

## 🖥️ Screenshot

> *Coming soon — tampilan dashboard, modul kontrak, dan laporan cetak.*

---

## 🛠️ Teknologi

| Layer | Teknologi |
|---|---|
| **Backend** | [Laravel 12](https://laravel.com) |
| **Frontend** | [React 18](https://reactjs.org) + [Inertia.js 2](https://inertiajs.com) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) |
| **Build Tool** | [Vite 6](https://vitejs.dev) |
| **Database** | MySQL / MariaDB |
| **UI Icons** | [Google Material Symbols](https://fonts.google.com/icons) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com) |
| **PDF Export** | [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) |

---

## 📦 Persyaratan Sistem

Pastikan sistem Anda memiliki:

- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 20.x & **NPM** >= 10.x
- **MySQL** >= 8.0 atau **MariaDB** >= 10.4
- **Git**

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/protrack-pro.git
cd protrack-pro
```

### 2. Install Dependensi PHP

```bash
composer install
```

### 3. Install Dependensi JavaScript

```bash
npm install
```

### 4. Salin File Environment

```bash
cp .env.example .env
```

### 5. Generate Application Key

```bash
php artisan key:generate
```

### 6. Konfigurasi Database

Edit file `.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=protrack_pro
DB_USERNAME=root
DB_PASSWORD=
```

### 7. Jalankan Migrasi & Seeder

```bash
php artisan migrate --seed
```

---

## ⚙️ Konfigurasi

### Storage Link (untuk upload file)

```bash
php artisan storage:link
```

### Konfigurasi `.env` Penting

```env
APP_NAME=ProTrack Pro
APP_URL=http://localhost

# Email (opsional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
```

---

## ▶️ Menjalankan Aplikasi

### Mode Development (dengan HMR)

Jalankan dua terminal secara bersamaan:

```bash
# Terminal 1 — Backend
php artisan serve

# Terminal 2 — Frontend (Vite)
npm run dev
```

Akses aplikasi di: **http://localhost:8000**

### Mode Production

```bash
npm run build
php artisan serve
```

---

## 🗂️ Modul Aplikasi

```
ProTrack Pro
├── 📊 Dashboard          — Ringkasan & statistik proyek
├── 📁 Proyek             — Daftar & manajemen proyek
│   ├── Informasi Umum
│   ├── Kontrak & Finansial
│   ├── Modul Kontrak
│   ├── Modul Merchandiser
│   ├── Modul Penagihan
│   └── Modul Pengiriman
├── 📑 Laporan            — Laporan detail & cetak PDF
├── 🗄️  Master Data
│   ├── Perusahaan
│   ├── Instansi
│   ├── Vendor
│   ├── Jenis Lelang
│   ├── Jenis Anggaran
│   └── Asal Merek & Sertifikasi
└── 👤 Pengguna & Roles
```

---

## 📂 Struktur Proyek

```
protrack-pro/
├── app/
│   ├── Http/
│   │   └── Controllers/       # Controller utama
│   ├── Models/                # Eloquent Models
│   └── Support/               # Helper (Hashid, dll.)
├── database/
│   ├── migrations/            # Skema database
│   └── seeders/               # Data awal
├── resources/
│   └── js/
│       └── Pages/             # Halaman React (Inertia)
│           ├── Dashboard/
│           ├── Projects/
│           ├── Reports/
│           ├── MasterData/
│           └── Users/
├── routes/
│   └── web.php                # Definisi routing
└── public/                    # Asset publik
```

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Cara berkontribusi:

1. **Fork** repository ini
2. Buat **branch baru** (`git checkout -b feature/nama-fitur`)
3. **Commit** perubahan (`git commit -m 'feat: menambahkan fitur X'`)
4. **Push** ke branch (`git push origin feature/nama-fitur`)
5. Buat **Pull Request**

### Konvensi Commit

Gunakan format [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — Fitur baru
- `fix:` — Perbaikan bug
- `docs:` — Perubahan dokumentasi
- `style:` — Perubahan styling/formatting
- `refactor:` — Refactoring kode
- `chore:` — Perubahan tooling, config, dsb.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<div align="center">

**Dibuat dengan ❤️ menggunakan Laravel & React**

[🐛 Laporkan Bug](../../issues) · [💡 Request Fitur](../../issues) · [📖 Dokumentasi](../../wiki)

</div>
