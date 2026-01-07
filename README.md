# 🎣 Strike It - Mobile App

**Strike It** adalah aplikasi mobile untuk **pemesanan kolam pancing** dan **toko perlengkapan pancing (e-commerce)**. Proyek ini terdiri dari dua bagian utama: **Back-End** berbasis Node.js (Fastify) dan **Front-End** menggunakan React Native (Expo).

---

## 📑 Daftar Isi

- [Tech Stack](#-tech-stack)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur Proyek](#-arsitektur-proyek)
- [Prasyarat](#-prasyarat)
- [Instalasi & Konfigurasi](#-instalasi--konfigurasi)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Setup Database](#2-setup-database)
  - [3. Setup Back-End](#3-setup-back-end)
  - [4. Setup Front-End](#4-setup-front-end)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
  - [Menjalankan Back-End](#menjalankan-back-end)
  - [Menjalankan Front-End](#menjalankan-front-end)
  - [Koneksi HP Fisik dengan Ngrok](#koneksi-hp-fisik-dengan-ngrok)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Struktur Folder](#-struktur-folder)
- [Kontributor](#-kontributor)
- [Lisensi](#-lisensi)

---

## 📱 Tech Stack

### Back-End
| Teknologi | Keterangan |
|-----------|------------|
| [Node.js](https://nodejs.org/) | JavaScript runtime |
| [Fastify](https://www.fastify.io/) | Web framework cepat dan minimalis |
| [MySQL2](https://www.npmjs.com/package/mysql2) | Database driver |
| [JWT](https://jwt.io/) | Autentikasi berbasis token |
| [Bcrypt](https://www.npmjs.com/package/bcrypt) | Hashing password |
| [Node-Cron](https://www.npmjs.com/package/node-cron) | Scheduler untuk tugas berkala |
| [Expo Server SDK](https://docs.expo.dev/push-notifications/overview/) | Push notifications |

### Front-End
| Teknologi | Keterangan |
|-----------|------------|
| [React Native](https://reactnative.dev/) | Framework mobile cross-platform |
| [Expo SDK 54](https://expo.dev/) | Toolchain untuk React Native |
| [TypeScript](https://www.typescriptlang.org/) | Strongly typed JavaScript |
| [NativeWind](https://www.nativewind.dev/) | Tailwind CSS untuk React Native |
| [React Navigation](https://reactnavigation.org/) | Navigasi (Stack & Bottom Tabs) |
| [Axios](https://axios-http.com/) | HTTP client |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Penyimpanan lokal |
| [Lucide React Native](https://lucide.dev/) | Icon library |

---

## ✨ Fitur Utama

### 🔐 Autentikasi
- Login & Register dengan email/password
- Login dengan Google OAuth2
- Guest Mode (melihat aplikasi tanpa akun)
- JWT Token-based authentication
- Auto logout saat sesi berakhir

### 🗺️ Booking (Pemesanan Kolam Pancing)
- Daftar lokasi kolam pancing
- Detail lokasi dengan fasilitas & peta
- Cek ketersediaan spot berdasarkan tanggal & waktu
- Form booking dengan pilihan durasi
- Voucher/diskon promo

### 🛍️ Shop (E-Commerce)
- Katalog produk dengan filter & pencarian
- Detail produk dengan gambar & ulasan
- Keranjang belanja (tambah/kurang quantity)
- Checkout dengan berbagai metode pembayaran

### 👥 Komunitas & Sosial
- Feed postingan komunitas
- Like & komentar dengan sistem reply bersarang (threaded)
- Upload gambar

### 📱 Profil & Membership
- Informasi akun & edit profil
- Upgrade membership (Bronze, Silver, Gold)
- Riwayat transaksi (Order & Booking History)
- Push notifications

---

## 🏗️ Arsitektur Proyek

```
MobileApp/
├── Back-End/           # Server API (Fastify + MySQL)
│   ├── src/
│   │   ├── config/     # Konfigurasi database
│   │   ├── routes/     # 14 Module API
│   │   └── services/   # Business logic & scheduler
│   ├── uploads/        # File upload storage
│   ├── test/           # Unit tests
│   ├── server.js       # Entry point server
│   └── package.json
│
├── Front-End/          # React Native (Expo)
│   ├── src/
│   │   ├── assets/     # Font & gambar statis
│   │   ├── components/ # Komponen global
│   │   ├── features/   # Fitur utama (auth, booking, shop, dll)
│   │   ├── navigation/ # Konfigurasi Router
│   │   ├── services/   # API client (Axios)
│   │   └── utils/      # Helper functions
│   ├── App.tsx         # Entry point aplikasi
│   └── package.json
│
├── strike_it.sql       # SQL dump database
└── README.md           # Dokumentasi (file ini)
```

---

## ⚙️ Prasyarat

Pastikan Anda sudah menginstall:

| Software | Minimum Version | Link Download |
|----------|-----------------|---------------|
| Node.js | v18.x atau lebih baru | [nodejs.org](https://nodejs.org/) |
| npm atau bun | npm v9+ / bun v1+ | Termasuk dalam Node.js / [bun.sh](https://bun.sh/) |
| MySQL | v8.0+ | [mysql.com](https://www.mysql.com/) |
| Git | Terbaru | [git-scm.com](https://git-scm.com/) |
| Expo Go (Mobile) | Terbaru | [App Store](https://apps.apple.com/) / [Play Store](https://play.google.com/) |

**Opsional:**
- [Ngrok](https://ngrok.com/) - Untuk testing di HP fisik
- [Android Studio](https://developer.android.com/studio) - Untuk Android Emulator
- [Xcode](https://developer.apple.com/xcode/) - Untuk iOS Simulator (macOS only)

---

## 🔧 Instalasi & Konfigurasi

### 1. Clone Repository

```bash
git clone https://github.com/iqbaalz28/MobileApp.git
cd MobileApp
```

### 2. Setup Database

1. **Buat database baru** di MySQL:
   ```sql
   CREATE DATABASE strike_it;
   ```

2. **Import struktur & data** dari file SQL:
   ```bash
   mysql -u root -p strike_it < strike_it.sql
   ```
   
   Atau gunakan GUI seperti phpMyAdmin / MySQL Workbench untuk import file `strike_it.sql`.

### 3. Setup Back-End

1. **Masuk ke folder Back-End:**
   ```bash
   cd Back-End
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # atau
   bun install
   ```

3. **Buat file `.env`** berdasarkan template berikut:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=strike_it
   
   # Server Configuration
   PORT=3000
   
   # JWT Secret (Ganti dengan string acak yang kuat)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Google OAuth2 (Opsional - untuk Login dengan Google)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

   > ⚠️ **PENTING:** Jangan commit file `.env` ke repository!

### 4. Setup Front-End

1. **Masuk ke folder Front-End:**
   ```bash
   cd ../Front-End
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # atau
   bun install
   ```

3. **Konfigurasi API URL:**
   
   Buka file `src/services/api.ts` dan sesuaikan `BASE_URL`:
   
   **Untuk Emulator/Simulator:**
   ```typescript
   // Uncomment OPSI A dan comment OPSI B
   const getDeviceIP = () => {
     const debuggerHost = Constants.expoConfig?.hostUri;
     if (debuggerHost) {
       const host = debuggerHost.split(":")[0];
       return `http://${host}:3000`;
     }
     return Platform.OS === "android"
       ? "http://10.0.2.2:3000"
       : "http://localhost:3000";
   };
   export const BASE_URL = getDeviceIP();
   ```
   
   **Untuk HP Fisik (Ngrok):**
   ```typescript
   // Gunakan OPSI B dengan URL Ngrok Anda
   export const BASE_URL = "https://your-ngrok-url.ngrok-free.dev";
   ```

---

## 🚀 Menjalankan Aplikasi

### Menjalankan Back-End

1. **Pastikan MySQL sudah berjalan** dan database sudah di-import.

2. **Jalankan server:**
   ```bash
   cd Back-End
   npm start
   ```

3. **Verifikasi server berjalan:**
   ```
   Server running on port 3000
   ✅ Database terhubung sukses!
   ```

   Server akan mencetak daftar routes yang tersedia.

### Menjalankan Front-End

1. **Buka terminal baru**, masuk ke folder Front-End:
   ```bash
   cd Front-End
   ```

2. **Jalankan Expo:**
   ```bash
   npx expo start -c
   ```
   
   Flag `-c` untuk membersihkan cache.

3. **Pilih cara menjalankan:**
   - **`a`** - Buka di Android Emulator
   - **`i`** - Buka di iOS Simulator (macOS only)
   - **`w`** - Buka di Web browser
   - **Scan QR Code** - Buka di Expo Go (HP fisik)

### Koneksi HP Fisik dengan Ngrok

Jika ingin testing di HP fisik, Anda perlu meng-expose server lokal ke internet:

1. **Install Ngrok:**
   ```bash
   npm install -g ngrok
   # atau download dari https://ngrok.com/
   ```

2. **Jalankan Ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Salin URL yang diberikan** (contoh: `https://abc123.ngrok-free.dev`)

4. **Update `BASE_URL`** di `Front-End/src/services/api.ts`:
   ```typescript
   export const BASE_URL = "https://abc123.ngrok-free.dev";
   ```

5. **Update callback URL** di `Back-End/server.js` (untuk OAuth):
   ```javascript
   callbackUri: "https://abc123.ngrok-free.dev/auth/google/callback",
   ```

> ⚠️ **Catatan:** URL Ngrok berubah setiap kali restart (kecuali paket berbayar).

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| **AUTH** | | |
| POST | `/register` | Registrasi user baru |
| POST | `/login` | Login user |
| GET | `/auth/google` | Login dengan Google OAuth2 |
| **USERS** | | |
| GET | `/users/me` | Get profile user yang login |
| PUT | `/users/me` | Update profile |
| **PRODUCTS** | | |
| GET | `/products` | Get semua produk |
| GET | `/products/:id` | Get detail produk |
| GET | `/products/:id/reviews` | Get ulasan produk |
| **LOCATIONS** | | |
| GET | `/locations` | Get semua lokasi kolam |
| GET | `/locations/:id` | Get detail lokasi |
| GET | `/locations/:id/spots` | Cek ketersediaan spot |
| GET | `/locations/:id/availability` | Cek ketersediaan per jam |
| **BOOKINGS** | | |
| POST | `/bookings` | Buat booking baru |
| GET | `/bookings/my-bookings` | Get riwayat booking |
| GET | `/bookings/:id` | Get detail booking |
| **ORDERS** | | |
| POST | `/orders` | Buat order baru |
| GET | `/orders/my-orders` | Get riwayat order |
| GET | `/orders/:id` | Get detail order |
| **CART** | | |
| GET | `/cart` | Get isi keranjang |
| POST | `/cart` | Tambah item ke keranjang |
| DELETE | `/cart/:id` | Hapus item dari keranjang |
| **COMMUNITY** | | |
| GET | `/community/posts` | Get semua postingan |
| POST | `/community/posts` | Buat postingan baru |
| POST | `/community/posts/:id/like` | Toggle like postingan |
| GET | `/community/posts/:id/comments` | Get komentar |
| POST | `/community/posts/:id/comments` | Buat komentar |
| **PAYMENTS** | | |
| POST | `/payments/pay/booking/:id` | Bayar booking |
| POST | `/payments/pay/order/:id` | Bayar order |
| POST | `/payments/upgrade-membership` | Upgrade membership |
| **NOTIFICATIONS** | | |
| POST | `/notifications/register-token` | Daftar push token |
| GET | `/notifications` | Get notifikasi |
| PUT | `/notifications/:id/read` | Tandai sudah dibaca |
| **REFERENCES** | | |
| GET | `/references/discounts` | Get voucher/diskon |
| GET | `/references/memberships` | Get tipe membership |
| GET | `/references/payment-methods` | Get metode pembayaran |

---

## 🧪 Testing

### Back-End Testing

```bash
cd Back-End
npm test
```

Menggunakan **Vitest** untuk unit testing.

### Front-End Testing

```bash
cd Front-End
npm test
```

---

## 🔧 Troubleshooting

### ❌ Error: "Cannot connect to database"

- Pastikan MySQL sudah berjalan
- Cek kredensial di file `.env`
- Pastikan database `strike_it` sudah dibuat

### ❌ Error: "Network Error" di aplikasi

- Pastikan Back-End server sudah berjalan di port 3000
- Untuk Android Emulator, gunakan `10.0.2.2:3000` (bukan `localhost`)
- Untuk HP fisik, gunakan Ngrok atau IP lokal komputer

### ❌ QR Code tidak bisa di-scan

- Pastikan HP dan komputer **dalam jaringan WiFi yang sama**
- Coba tekan `s` di terminal untuk switch ke Expo Go
- Pastikan aplikasi Expo Go sudah terinstall

### ❌ Error: "JavaScript heap out of memory"

Tambahkan memory untuk Node.js:
```bash
# Windows (PowerShell)
$env:NODE_OPTIONS="--max-old-space-size=4096"

# Mac/Linux
export NODE_OPTIONS="--max-old-space-size=4096"
```

### ❌ Error: Module not found

```bash
# Hapus cache dan reinstall
rm -rf node_modules
npm install
npx expo start -c
```

---

## 📂 Struktur Folder Detail

### Back-End

```
Back-End/
├── src/
│   ├── config/
│   │   └── db.js           # Konfigurasi MySQL Pool
│   ├── routes/
│   │   ├── auth.js         # Login, register, OAuth
│   │   ├── users.js        # User profile CRUD
│   │   ├── products.js     # Produk & ulasan
│   │   ├── locations.js    # Lokasi kolam
│   │   ├── bookings.js     # Booking kolam
│   │   ├── orders.js       # Order produk
│   │   ├── cart.js         # Keranjang belanja
│   │   ├── payments.js     # Payment processing
│   │   ├── community.js    # Posts & comments
│   │   ├── notifications.js # Push notifications
│   │   ├── reviews.js      # Review management
│   │   ├── references.js   # Master data
│   │   ├── upload.js       # File upload
│   │   └── events.js       # Events/promo
│   └── services/
│       └── (scheduler, etc.)
├── uploads/               # Uploaded files storage
├── test/                  # Test files
├── server.js              # Main entry point
├── package.json
└── .env                   # Environment variables
```

### Front-End

```
Front-End/
├── src/
│   ├── assets/
│   │   ├── fonts/          # Custom fonts (Outfit)
│   │   └── images/         # Gambar statis
│   ├── components/
│   │   └── LoadingScreen.tsx
│   ├── features/
│   │   ├── auth/           # LoginScreen, RegisterScreen
│   │   ├── booking/        # Flow pemesanan kolam
│   │   ├── community/      # Feed & post detail
│   │   ├── home/           # HomeScreen & sections
│   │   ├── profile/        # ProfileScreen & settings
│   │   └── shop/           # Katalog, cart, checkout
│   ├── navigation/
│   │   ├── RootNavigator.tsx    # Root stack
│   │   ├── TabNavigator.tsx     # Bottom tabs
│   │   ├── AuthStack.tsx        # Auth flow
│   │   └── navigationRef.ts     # Navigation helpers
│   ├── services/
│   │   ├── api.ts          # Axios instance & endpoints
│   │   └── notifications.ts # Push notification setup
│   └── utils/
│       ├── assets.ts       # Asset mapping
│       └── formatCurrency.ts
├── App.tsx                 # Application entry
├── app.json               # Expo config
├── tailwind.config.js     # NativeWind config
└── package.json
```

---

## 👥 Kontributor

<table>
  <tr>
    <td align="center">
      <strong>Tim Pengembang</strong>
    </td>
  </tr>
</table>

---

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan akademis sebagai bagian dari tugas **Web & Mobile Programming** di **Universitas Pendidikan Indonesia** (Semester 3).

---

## 📞 Kontak & Dukungan

Jika ada pertanyaan atau kendala, silakan buat Issue di repository ini atau hubungi tim pengembang.

---

<div align="center">
  <strong>🎣 Happy Fishing! 🎣</strong>
  <br><br>
  Made with ❤️ using React Native & Fastify
</div>
