<div align="center">

<br/>

<img src="public/logo.png" alt="Protrack Pro Logo" width="96" height="96" />

# **Protrack Pro**

### Sistem Manajemen Proyek Terpadu

*Contract • Merchandising • Billing • Shipping*

<br/>

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📋 Tentang Protrack Pro

**Protrack Pro** adalah sistem manajemen proyek berbasis web yang dirancang untuk memudahkan pengelolaan proyek pengadaan barang dan jasa. Sistem ini menyediakan alur kerja terintegrasi mulai dari kontrak, merchandising, penagihan, hingga pengiriman — semuanya dalam satu platform yang modern dan responsif.

### ✨ Fitur Utama

| Modul | Deskripsi |
|---|---|
| 📄 **Kontrak** | Manajemen nomor kontrak, tahapan pelaksanaan, dan jaminan (JAMLAK, JAMUK, JAMWAR) |
| 🛒 **Merchandiser** | Tracking barang kontrak & diterima, Purchase Order (PO), dan invoice vendor |
| 💰 **Penagihan** | Manajemen BAST dan tahapan tagihan |
| 🚚 **Pengiriman** | Pencatatan BA Annaming & BA Inname dengan dokumen terkait |
| 📊 **Laporan** | Detail project, preview, dan cetak PDF dengan watermark status |
| 👥 **Manajemen Pengguna** | Role & permission berbasis Spatie, multi-user support |

---

## 🛠️ Teknologi

### Backend
- **[Laravel 12](https://laravel.com)** – PHP Framework
- **[Inertia.js (Server)](https://inertiajs.com)** – SSR Bridge antara Laravel dan React
- **[Spatie Laravel Permission](https://spatie.be/docs/laravel-permission)** – Role & Permissions
- **[Laravel Sanctum](https://laravel.com/docs/sanctum)** – API Authentication
- **[Hashids](https://hashids.org/php/)** – Obfuscated URL IDs

### Frontend
- **[React 18](https://react.dev)** – UI Library
- **[Inertia.js (Client)](https://inertiajs.com)** – SPA-style navigation tanpa API
- **[TailwindCSS 3](https://tailwindcss.com)** – Utility-first CSS Framework
- **[Framer Motion](https://www.framer.com/motion/)** – Animasi & transisi
- **[React Hot Toast](https://react-hot-toast.com)** – Notifikasi toast
- **[Headless UI](https://headlessui.com)** – Komponen UI aksesibel

### Tooling
- **[Vite](https://vitejs.dev)** – Build tool & dev server
- **[PestPHP](https://pestphp.com)** – Testing framework

---

## ⚙️ Instalasi & Konfigurasi

### Prasyarat

- PHP >= 8.2
- Composer >= 2.x
- Node.js >= 18.x & NPM
- Database: MySQL / PostgreSQL / SQLite

### Langkah Instalasi

**1. Clone Repository**

```bash
git clone https://github.com/your-org/protrack-pro.git
cd protrack-pro
```

**2. Install Dependensi PHP**

```bash
composer install
```

**3. Install Dependensi Node.js**

```bash
npm install
```

**4. Konfigurasi Environment**

```bash
cp .env.example .env
php artisan key:generate
```

Lalu edit file `.env` sesuai konfigurasi database Anda:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=protrack_pro
DB_USERNAME=root
DB_PASSWORD=your_password
```

**5. Migrasi & Seeder Database**

```bash
php artisan migrate --seed
```

**6. Buat Symlink Storage**

```bash
php artisan storage:link
```

**7. Jalankan Development Server**

```bash
# Jalankan semua sekaligus (Laravel + Vite + Queue + Logs)
composer dev

# Atau secara terpisah:
php artisan serve
npm run dev
```

Akses aplikasi di: **http://localhost:8000**

---

## 🗂️ Struktur Proyek

```
protrack-pro/
├── app/
│   ├── Http/
│   │   ├── Controllers/        # Controller utama aplikasi
│   │   └── Middleware/         # Middleware kustom
│   ├── Models/                 # Eloquent models
│   └── Support/                # Helper (Hashid, dll.)
├── database/
│   ├── migrations/             # Migrasi database
│   └── seeders/                # Data seeder
├── resources/
│   └── js/
│       ├── Components/         # Komponen React reusable
│       ├── Layouts/            # Layout global
│       └── Pages/              # Halaman utama (Inertia)
│           ├── Contract/
│           ├── Merchandiser/
│           ├── Billing/
│           ├── Shipping/
│           └── Reports/
├── routes/
│   └── web.php                 # Routing web
└── public/                     # Asset publik
```

---

## 🚀 Perintah Penting

```bash
# Development server all-in-one
composer dev

# Build production assets
npm run build

# Jalankan tests
php artisan test

# Format kode PHP
./vendor/bin/pint

# Clear cache
php artisan optimize:clear
```

---

## 📄 Lisensi

Proyek ini bersifat **proprietary** dan hanya untuk penggunaan internal.

---

<div align="center">

Dibuat dengan ❤️ menggunakan Laravel + React + Inertia.js

</div>
