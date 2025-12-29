# 🎣 Strike It - Mobile App

Aplikasi mobile untuk pemesanan kolam pancing dan toko perlengkapan pancing (e-commerce). Repositori ini berisi kode sumber **Front-End** yang dibangun menggunakan **React Native (Expo)**.

> 🚧 **Status Proyek:** Dalam Tahap Pengembangan (Development).
> Saat ini aplikasi dikonfigurasi untuk berjalan dengan data simulasi (Mock Data) atau API lokal.

## 📱 Tech Stack

* **Framework:** [React Native](https://reactnative.dev/) (via Expo SDK)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS untuk React Native)
* **Navigation:** [React Navigation](https://reactnavigation.org/) (Stack & Bottom Tabs)
* **Icons:** Lucide React Native
* **Storage:** AsyncStorage
* **Networking:** Axios

## ✨ Fitur Utama (Saat Ini)

### 1. 🔐 Autentikasi & Guest Mode
* **Login & Register:** UI sudah tersedia.
* **Guest Mode:** Pengguna dapat masuk sebagai tamu ("Lewati login") untuk melihat-lihat aplikasi tanpa akun.
* **Mock Login:** Bypass login sementara untuk keperluan testing tanpa backend.

### 2. 🗺️ Booking (Pemesanan)
* **Daftar Lokasi:** Melihat daftar kolam pancing.
* **Detail Lokasi:** Informasi lengkap, fasilitas, peta (preview), dan ulasan.
* **Form Booking:** UI untuk memilih tanggal dan pemesanan.

### 3. 🛍️ Shop (Toko Alat Pancing)
* **Katalog Produk:** Grid produk dengan indikator harga Sewa/Beli.
* **Filter & Pencarian:** Modal filter berdasarkan harga dan kategori.
* **Detail Produk:** Gambar, deskripsi, dan ulasan produk.
* **Keranjang (Cart):** Manajemen item, tambah/kurang quantity.
* **Checkout:** Ringkasan pesanan dan pemilihan metode pembayaran.

### 4. 👥 Komunitas & Profil
* **Feed:** Melihat postingan komunitas.
* **Detail Post:** Melihat komentar.
* **Profil Pengguna:** Info akun, status member, dan logout.

## 📂 Struktur Folder

Proyek ini menggunakan pendekatan **Feature-Based Architecture**:

```text
src/
├── assets/             # Font dan Gambar statis
├── components/         # Komponen global (LoadingScreen, dll)
├── config/             # Konfigurasi Env
├── features/           # Fitur utama aplikasi
│   ├── auth/           # Login, Register
│   ├── booking/        # Flow pemesanan kolam
│   ├── community/      # Flow komunitas/sosial
│   ├── home/           # Halaman Beranda & Section
│   ├── profile/        # Profil user & History
│   └── shop/           # Flow E-commerce (Cart, Checkout)
├── navigation/         # Konfigurasi Navigasi (Root, Tab, Stacks)
├── services/           # Konfigurasi API (Axios)
└── utils/              # Helper functions (Assets mapping, Format currency)
```

## 🚀 Cara Menjalankan (Getting Started)
Pastikan Anda sudah menginstal Node.js dan Git.

1. Install Dependensi
```
npm install
```
2. Run Project
```
npx expo start -c
```
3
