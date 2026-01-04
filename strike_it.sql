-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 04, 2026 at 10:30 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.4.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `strike_it`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_location` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `spot_number` varchar(10) DEFAULT NULL,
  `booking_date` date DEFAULT NULL,
  `booking_start` datetime DEFAULT NULL,
  `booking_end` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `payment_status` enum('unpaid','paid') DEFAULT 'unpaid',
  `payment_method` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `invoice_number` varchar(50) DEFAULT NULL,
  `tax_amount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `id_user`, `id_location`, `first_name`, `last_name`, `email`, `phone`, `spot_number`, `booking_date`, `booking_start`, `booking_end`, `duration`, `total_price`, `status`, `payment_status`, `payment_method`, `created_at`, `invoice_number`, `tax_amount`) VALUES
(1, 4, 1, NULL, NULL, NULL, NULL, 'T1', '2025-11-20', '2025-11-20 13:44:27', '2025-11-20 15:44:27', 2, 30000.00, 'completed', 'paid', 1, '2025-11-25 06:44:27', NULL, 0.00),
(2, 5, 1, NULL, NULL, NULL, NULL, 'B5', '2025-11-23', '2025-11-23 13:44:27', '2025-11-23 16:44:27', 3, 45000.00, 'completed', 'paid', 1, '2025-11-25 06:44:27', NULL, 0.00),
(3, 6, 1, NULL, NULL, NULL, NULL, 'T1', '2025-11-15', '2025-11-25 13:44:27', '2025-11-25 13:44:27', 3, 45000.00, 'completed', 'paid', 1, '2025-11-25 06:44:27', 'INV-REV-001', 0.00),
(4, 7, 2, NULL, NULL, NULL, NULL, 'B5', '2025-11-20', '2025-11-25 13:44:27', '2025-11-25 13:44:27', 4, 80000.00, 'completed', 'paid', 1, '2025-11-25 06:44:27', 'INV-REV-002', 0.00),
(5, 8, 3, NULL, NULL, NULL, NULL, 'L2', '2025-11-23', '2025-11-25 13:44:27', '2025-11-25 13:44:27', 2, 50000.00, 'completed', 'paid', 1, '2025-11-25 06:44:27', 'INV-REV-003', 0.00),
(6, 9, 4, NULL, NULL, NULL, NULL, 'R1', '2025-11-24', '2025-11-25 13:44:27', '2025-11-25 13:44:27', 5, 150000.00, 'completed', 'paid', 1, '2025-11-25 06:44:27', 'INV-REV-004', 0.00),
(7, 10, 5, NULL, NULL, NULL, NULL, 'T5', '2025-11-05', '2025-11-25 13:44:27', '2025-11-25 13:44:27', 2, 36000.00, 'completed', 'paid', 1, '2025-11-25 06:44:27', 'INV-REV-005', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `category_products`
--

CREATE TABLE `category_products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category_products`
--

INSERT INTO `category_products` (`id`, `name`) VALUES
(1, 'Joran'),
(2, 'Reel'),
(3, 'Umpan'),
(4, 'Kail'),
(5, 'Senar');

-- --------------------------------------------------------

--
-- Table structure for table `comment_likes`
--

CREATE TABLE `comment_likes` (
  `id` int(11) NOT NULL,
  `id_comment` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `community_posts`
--

CREATE TABLE `community_posts` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `category` enum('general','review','event','discussion','umpan','piranti','laporan mancing','tips & trik') DEFAULT NULL,
  `likes_count` int(11) DEFAULT 0,
  `reply_count` int(11) DEFAULT 0,
  `views_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `community_posts`
--

INSERT INTO `community_posts` (`id`, `id_user`, `title`, `body`, `category`, `likes_count`, `reply_count`, `views_count`, `created_at`) VALUES
(1, 1, 'Umpan putih andalan?', 'Mohon pencerahannya suhu...', 'umpan', 0, 0, 0, '2025-11-25 06:44:27'),
(2, 2, 'Laporan mancing di Situ Rawa Indah', 'Hasil tangkapan lumayan...', 'laporan mancing', 0, 0, 0, '2025-11-25 06:44:27');

-- --------------------------------------------------------

--
-- Table structure for table `discounts`
--

CREATE TABLE `discounts` (
  `id` int(11) NOT NULL,
  `discount_value` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `used_count` int(11) DEFAULT 0,
  `max_usage` int(11) DEFAULT 100
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discounts`
--

INSERT INTO `discounts` (`id`, `discount_value`, `code`, `used_count`, `max_usage`) VALUES
(1, '15%', 'AASNAAD998', 122, 130),
(2, '15%', 'ASD12229SDA', 122, 130),
(3, '15%', 'ADAD9988', 122, 130);

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `img` varchar(255) NOT NULL,
  `link_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `name`, `img`, `link_url`) VALUES
(1, 'Lomba Mancing Bakti Forkabi Untuk Negeri', '/eventimg/poster1.png', 'https://drive.google.com/'),
(2, 'Lomba Mancing HUT RI Ke-74 Warga Garon', '/eventimg/poster2.png', 'https://drive.google.com/'),
(3, 'Lomba Mancing Karang Taruna Taanimulya', '/eventimg/poster3.png', 'https://drive.google.com/');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `price_per_hour` decimal(10,2) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `rating_average` decimal(3,2) DEFAULT 0.00,
  `total_reviews` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`, `city`, `description`, `address`, `price_per_hour`, `img`, `lat`, `lng`, `rating_average`, `total_reviews`) VALUES
(1, 'Situ Rawa Indah', 'Jakarta', 'Suasananya asri dan dikelilingi pepohonan. Karena merupakan fasilitas publik, kelengkapan fasilitasnya tidak seperti kolam pemancingan komersial, namun tetap menjadi favorit untuk bersantai.', 'Jl. Kh Hasyim Ashari No.125', 15000.00, 'locationimg/jakarta.jpg', -6.20000000, 106.81666600, 4.50, 5),
(2, 'Lembah Pancing Citarum', 'Bandung', 'Atmosfernya penuh semangat kompetisi, dengan para pemancing serius yang fokus memantau ujung jorannya. Karena tujuannya adalah perlombaan untuk mendapatkan ikan terberat, fasilitasnya lebih fungsional.', 'Jl. Diponegoro No.22, Citarum', 20000.00, 'locationimg/bandung.png', -6.91750000, 107.61910000, 4.20, 8),
(3, 'Pancingan Tirta Sari', 'Bekasi', 'Suasananya dirancang untuk rekreasi keluarga, sering kali dilengkapi saung lesehan di atas air dan alunan musik yang santai. Tempat ini adalah pilihan sempurna untuk keluarga.', 'Jl. Pramuka No.59', 25000.00, 'locationimg/bekasi.png', -6.23830000, 106.97560000, 4.70, 12),
(4, 'Kolam Pancing Nirwana', 'Banten', 'Suasananya hening dan menyatu dengan alam, seringkali hanya ditemani suara aliran air dan serangga hutan. Aksesnya bisa jadi sulit tapi petualangannya luar biasa.', 'Jl. Pelelangan Ikan Karangantu', 30000.00, 'locationimg/banten.png', -6.12000000, 106.15000000, 4.90, 15),
(5, 'Danau Singkarak', 'Tangerang', 'Suasananya hening dan menyatu dengan alam, seringkali hanya ditemani suara aliran air. Tempat yang cocok untuk mencari ketenangan.', 'Jl. Pegangsaan Timur No 55', 18000.00, 'locationimg/tangerang.png', -6.17830000, 106.63190000, 4.60, 10);

-- --------------------------------------------------------

--
-- Table structure for table `location_images`
--

CREATE TABLE `location_images` (
  `id` int(11) NOT NULL,
  `id_location` int(11) NOT NULL,
  `img_path` varchar(255) NOT NULL,
  `img_type` enum('main','gallery') DEFAULT 'gallery',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `location_images`
--

INSERT INTO `location_images` (`id`, `id_location`, `img_path`, `img_type`, `created_at`) VALUES
(1, 1, 'locationimg/jakarta.jpg', 'main', '2025-11-25 06:44:27'),
(2, 1, 'locationimg/banten.png', 'gallery', '2025-11-25 06:44:27'),
(3, 1, 'locationimg/bekasi.png', 'gallery', '2025-11-25 06:44:27'),
(4, 2, 'locationimg/bandung.png', 'main', '2025-11-25 06:44:27'),
(5, 2, 'locationimg/jakarta.jpg', 'gallery', '2025-11-25 06:44:27'),
(6, 2, 'locationimg/bekasi.png', 'gallery', '2025-11-25 06:44:27'),
(7, 3, 'locationimg/bekasi.png', 'main', '2025-11-25 06:44:27'),
(8, 3, 'locationimg/bandung.png', 'gallery', '2025-11-25 06:44:27'),
(9, 3, 'locationimg/banten.png', 'gallery', '2025-11-25 06:44:27'),
(10, 4, 'locationimg/banten.png', 'main', '2025-11-25 06:44:27'),
(11, 4, 'locationimg/tangerang.png', 'gallery', '2025-11-25 06:44:27'),
(12, 4, 'locationimg/jakarta.jpg', 'gallery', '2025-11-25 06:44:27'),
(13, 5, 'locationimg/tangerang.png', 'main', '2025-11-25 06:44:27'),
(14, 5, 'locationimg/banten.png', 'gallery', '2025-11-25 06:44:27'),
(15, 5, 'locationimg/bandung.png', 'gallery', '2025-11-25 06:44:27');

-- --------------------------------------------------------

--
-- Table structure for table `location_reviews`
--

CREATE TABLE `location_reviews` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_location` int(11) NOT NULL,
  `id_booking` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `location_reviews`
--

INSERT INTO `location_reviews` (`id`, `id_user`, `id_location`, `id_booking`, `comment`, `rating`, `img`, `created_at`) VALUES
(1, 4, 1, 1, 'Layanan luar biasa!', 5, NULL, '2025-11-25 06:44:27'),
(2, 5, 1, 2, 'Tempatnya nyaman.', 4, NULL, '2025-11-25 06:44:27'),
(3, 6, 1, 3, 'Tempatnya luas dan sangat bersih. Ikan mas-nya juga lumayan gampang makan. Fasilitas toilet oke, mushola bersih. Recommended buat ajak keluarga!', 5, NULL, '2025-11-25 06:44:27'),
(4, 7, 2, 4, 'Suasananya sejuk banget khas Bandung. Ikannya besar-besar (babon), tarikannya mantap! Cuma parkiran mobil agak sempit kalau weekend.', 4, NULL, '2025-11-25 06:44:27'),
(5, 8, 3, 5, 'Pelayanan ramah, saungnya nyaman buat ngopi sambil nunggu strike. Cocok buat yang mau mancing santai.', 5, NULL, '2025-11-25 06:44:27'),
(6, 9, 4, 6, 'Tempatnya benar-benar alami dan tenang. Jauh dari kebisingan kota. Akses jalan masuk agak berbatu tapi terbayar dengan suasananya.', 5, NULL, '2025-11-25 06:44:27'),
(7, 10, 5, 7, 'Harga tiket masuk terjangkau. Kolamnya luas, lapaknya juga berjarak jadi nggak sempit-sempitan. Sayang kantinnya tutup pas saya datang.', 4, NULL, '2025-11-25 06:44:27');

-- --------------------------------------------------------

--
-- Table structure for table `location_spots`
--

CREATE TABLE `location_spots` (
  `id` int(11) NOT NULL,
  `id_location` int(11) NOT NULL,
  `spot_name` varchar(10) NOT NULL,
  `spot_type` varchar(50) DEFAULT 'general',
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `location_spots`
--

INSERT INTO `location_spots` (`id`, `id_location`, `spot_name`, `spot_type`, `is_active`) VALUES
(1, 1, 'T1', 'general', 1),
(2, 1, 'T2', 'general', 1),
(3, 1, 'T3', 'general', 1),
(4, 1, 'T4', 'general', 1),
(5, 1, 'T5', 'general', 1),
(6, 1, 'T6', 'general', 1),
(7, 1, 'T7', 'general', 1),
(8, 1, 'T8', 'general', 1),
(9, 1, 'T9', 'general', 1),
(10, 1, 'B1', 'general', 1),
(11, 1, 'B2', 'general', 1),
(12, 1, 'B3', 'general', 1),
(13, 1, 'B4', 'general', 1),
(14, 1, 'B5', 'general', 1),
(15, 1, 'B6', 'general', 1),
(16, 1, 'B7', 'general', 1),
(17, 1, 'B8', 'general', 1),
(18, 1, 'B9', 'general', 1),
(19, 1, 'L1', 'general', 1),
(20, 1, 'L2', 'general', 1),
(21, 1, 'L3', 'general', 1),
(22, 1, 'R1', 'general', 1),
(23, 1, 'R2', 'general', 1),
(24, 1, 'R3', 'general', 1),
(25, 2, 'T1', 'general', 1),
(26, 2, 'T2', 'general', 1),
(27, 2, 'T3', 'general', 1),
(28, 2, 'T4', 'general', 1),
(29, 2, 'T5', 'general', 1),
(30, 2, 'T6', 'general', 1),
(31, 2, 'T7', 'general', 1),
(32, 2, 'T8', 'general', 1),
(33, 2, 'T9', 'general', 1),
(34, 2, 'B1', 'general', 1),
(35, 2, 'B2', 'general', 1),
(36, 2, 'B3', 'general', 1),
(37, 2, 'B4', 'general', 1),
(38, 2, 'B5', 'general', 1),
(39, 2, 'B6', 'general', 1),
(40, 2, 'B7', 'general', 1),
(41, 2, 'B8', 'general', 1),
(42, 2, 'B9', 'general', 1),
(43, 2, 'L1', 'general', 1),
(44, 2, 'L2', 'general', 1),
(45, 2, 'L3', 'general', 1),
(46, 2, 'R1', 'general', 1),
(47, 2, 'R2', 'general', 1),
(48, 2, 'R3', 'general', 1),
(49, 3, 'T1', 'general', 1),
(50, 3, 'T2', 'general', 1),
(51, 3, 'T3', 'general', 1),
(52, 3, 'T4', 'general', 1),
(53, 3, 'T5', 'general', 1),
(54, 3, 'T6', 'general', 1),
(55, 3, 'T7', 'general', 1),
(56, 3, 'T8', 'general', 1),
(57, 3, 'T9', 'general', 1),
(58, 3, 'B1', 'general', 1),
(59, 3, 'B2', 'general', 1),
(60, 3, 'B3', 'general', 1),
(61, 3, 'B4', 'general', 1),
(62, 3, 'B5', 'general', 1),
(63, 3, 'B6', 'general', 1),
(64, 3, 'B7', 'general', 1),
(65, 3, 'B8', 'general', 1),
(66, 3, 'B9', 'general', 1),
(67, 3, 'L1', 'general', 1),
(68, 3, 'L2', 'general', 1),
(69, 3, 'L3', 'general', 1),
(70, 3, 'R1', 'general', 1),
(71, 3, 'R2', 'general', 1),
(72, 3, 'R3', 'general', 1),
(73, 4, 'T1', 'general', 1),
(74, 4, 'T2', 'general', 1),
(75, 4, 'T3', 'general', 1),
(76, 4, 'T4', 'general', 1),
(77, 4, 'T5', 'general', 1),
(78, 4, 'T6', 'general', 1),
(79, 4, 'T7', 'general', 1),
(80, 4, 'T8', 'general', 1),
(81, 4, 'T9', 'general', 1),
(82, 4, 'B1', 'general', 1),
(83, 4, 'B2', 'general', 1),
(84, 4, 'B3', 'general', 1),
(85, 4, 'B4', 'general', 1),
(86, 4, 'B5', 'general', 1),
(87, 4, 'B6', 'general', 1),
(88, 4, 'B7', 'general', 1),
(89, 4, 'B8', 'general', 1),
(90, 4, 'B9', 'general', 1),
(91, 4, 'L1', 'general', 1),
(92, 4, 'L2', 'general', 1),
(93, 4, 'L3', 'general', 1),
(94, 4, 'R1', 'general', 1),
(95, 4, 'R2', 'general', 1),
(96, 4, 'R3', 'general', 1),
(97, 5, 'T1', 'general', 1),
(98, 5, 'T2', 'general', 1),
(99, 5, 'T3', 'general', 1),
(100, 5, 'T4', 'general', 1),
(101, 5, 'T5', 'general', 1),
(102, 5, 'T6', 'general', 1),
(103, 5, 'T7', 'general', 1),
(104, 5, 'T8', 'general', 1),
(105, 5, 'T9', 'general', 1),
(106, 5, 'B1', 'general', 1),
(107, 5, 'B2', 'general', 1),
(108, 5, 'B3', 'general', 1),
(109, 5, 'B4', 'general', 1),
(110, 5, 'B5', 'general', 1),
(111, 5, 'B6', 'general', 1),
(112, 5, 'B7', 'general', 1),
(113, 5, 'B8', 'general', 1),
(114, 5, 'B9', 'general', 1),
(115, 5, 'L1', 'general', 1),
(116, 5, 'L2', 'general', 1),
(117, 5, 'L3', 'general', 1),
(118, 5, 'R1', 'general', 1),
(119, 5, 'R2', 'general', 1),
(120, 5, 'R3', 'general', 1);

-- --------------------------------------------------------

--
-- Table structure for table `memberships`
--

CREATE TABLE `memberships` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_popular` tinyint(1) DEFAULT 0,
  `price_per_month` decimal(10,2) NOT NULL,
  `benefits` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `memberships`
--

INSERT INTO `memberships` (`id`, `name`, `description`, `is_popular`, `price_per_month`, `benefits`) VALUES
(1, 'Juragan Mancing', 'Untuk Para Hobiis Sejati.', 1, 100000.00, 'Anda dapat menghentikan atau membatalkan kapan saja.\nDiskon 10% untuk sewa alat pancing.\nDiskon 20% untuk pembelian umpan.\nPemberian umpan dasar gratis saat kedatangan.\nKesempatan mengikuti turnamen bulanan secara gratis.'),
(2, 'Kawan Mancing', 'Mancing cerdas. Kantong puas.', 0, 75000.00, 'Anda dapat menghentikan atau membatalkan kapan saja.\nDiskon 10% untuk sewa alat pancing.\nVoucher makan di restoran/kantin.\nPemberian umpan dasar gratis saat kedatangan.'),
(3, 'Jawara Mancing', 'Pengalaman Terbaik.', 0, 150000.00, 'Anda dapat menghentikan atau membatalkan kapan saja.\nDiskon 10% untuk sewa alat pancing.\nDiskon 20% untuk pembelian umpan.\nKesempatan mengikuti turnamen bulanan secara gratis.\nSatu sesi konsultasi mingguan dengan pemandu mancing profesional.');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `order_number` varchar(50) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `shipping_cost` decimal(10,2) DEFAULT 0.00,
  `shipping_address` varchar(255) DEFAULT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `payment_status` enum('unpaid','paid') DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `payment_method` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `transaction_type` enum('sewa','beli') DEFAULT 'beli'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `name`) VALUES
(1, 'Debit Card'),
(2, 'Bank Transfer'),
(3, 'QRIS'),
(4, 'Cash on Delivery');

-- --------------------------------------------------------

--
-- Table structure for table `post_comments`
--

CREATE TABLE `post_comments` (
  `id` int(11) NOT NULL,
  `id_post` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `content` text NOT NULL,
  `likes_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `post_likes`
--

CREATE TABLE `post_likes` (
  `id` int(11) NOT NULL,
  `id_post` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `price_sale` decimal(10,2) DEFAULT NULL,
  `price_rent` decimal(10,2) DEFAULT NULL,
  `specification` text DEFAULT NULL,
  `sold_count` int(11) DEFAULT 0,
  `stock` int(11) DEFAULT 0,
  `rating_average` decimal(3,2) DEFAULT 0.00,
  `total_reviews` int(11) DEFAULT 0,
  `id_category` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `img`, `price_sale`, `price_rent`, `specification`, `sold_count`, `stock`, `rating_average`, `total_reviews`, `id_category`) VALUES
(1, 'Joran Shimano FX', 'Joran berkualitas', 'alatimg/joran1.png', 489000.00, 50000.00, 'Spec A', 0, 10, 0.00, 0, 1),
(2, 'Reel Daiwa BG', 'Reel kuat', 'alatimg/reels2.png', NULL, 35000.00, 'Spec B', 0, 18, 0.00, 0, 2),
(3, 'Joran Daiwa Crossfire', 'Joran ringan dan sensitif', 'alatimg/joran2.png', 550000.00, NULL, 'Carbon Composite, 6-14lbs', 0, 15, 0.00, 0, 1),
(4, 'Joran Maguro Ottoman', 'Joran khusus galatama', 'alatimg/joran3.png', NULL, 45000.00, 'Hard Action, 180cm', 0, 20, 0.00, 0, 1),
(5, 'Joran Abu Garcia Vengeance', 'Desain modern Amerika', 'alatimg/joran4.png', 675000.00, NULL, 'Graphite Blank, Medium Heavy', 0, 8, 0.00, 0, 1),
(6, 'Joran Relix Nusantara', 'Karya anak bangsa, ultralight', 'alatimg/joran5.png', 850000.00, NULL, 'Ultralight 2-6lbs', 0, 12, 0.00, 0, 1),
(7, 'Joran Shimano Cruzar', 'Pilihan terbaik pemula', 'alatimg/joran6.png', NULL, 35000.00, 'Solid Glass, Strong Blank', 0, 25, 0.00, 0, 1),
(8, 'Joran Kenzi Toray', 'Material carbon berkualitas', 'alatimg/joran7.png', 490000.00, NULL, 'Carbon Solid, 10-20lbs', 0, 10, 0.00, 0, 1),
(9, 'Joran Ryobi Kukri', 'Gagang ergonomis EVA', 'alatimg/joran8.png', NULL, 50000.00, 'Medium Light, 702 section', 0, 14, 0.00, 0, 1),
(10, 'Joran Penn Squadron', 'Tahan air asin (Saltwater)', 'alatimg/joran9.png', 950000.00, NULL, 'Saltwater Grade, Heavy', 0, 6, 0.00, 0, 1),
(11, 'Joran Daido Manta', 'Sangat kuat angkat beban', 'alatimg/joran10.png', NULL, 30000.00, 'Solid Fiber, 15kg Drag', 0, 30, 0.00, 0, 1),
(12, 'Joran Ugly Stik GX2', 'Joran legendaris tahan banting', 'alatimg/joran11.png', 1100000.00, NULL, 'Ugly Tech Construction', 0, 5, 0.00, 0, 1),
(13, 'Joran Pioneer Fire', 'Warna cerah, aksi medium', 'alatimg/joran12.png', 315000.00, NULL, 'E-Glass, Medium Action', 0, 18, 0.00, 0, 1),
(14, 'Joran Sougayilang Portable', 'Mudah dibawa kemana saja', 'alatimg/joran13.png', NULL, 25000.00, 'Telescopic, Compact', 0, 40, 0.00, 0, 1),
(15, 'Joran KastKing Perigee', 'Kualitas turnamen profesional', 'alatimg/joran14.png', 890000.00, NULL, 'Twin-Tip, Carbon Fiber', 0, 7, 0.00, 0, 1),
(16, 'Joran Fenwick Eagle', 'Sensitivitas klasik', 'alatimg/joran15.png', NULL, 125000.00, 'Cork Handle, Fast Action', 0, 3, 0.00, 0, 1),
(17, 'Reel Shimano Stradic', 'Reel halus untuk casting', 'alatimg/reels1.png', 1250000.00, NULL, 'Hagane Body, X-Ship', 0, 10, 0.00, 0, 2),
(18, 'Reel Abu Garcia Revo', 'Reel ringan dan kuat', 'alatimg/reels3.png', 950000.00, NULL, 'Carbon Matrix Drag System', 0, 12, 0.00, 0, 2),
(19, 'Reel Penn Battle II', 'Tahan karat air asin', 'alatimg/reels4.png', 1350000.00, NULL, 'Full Metal Body, HT-100 Drag', 0, 8, 0.00, 0, 2),
(20, 'Reel Okuma Ceymar', 'Pilihan ekonomis berkualitas', 'alatimg/reels5.png', NULL, 60000.00, 'Lightweight Graphite Frame', 0, 20, 0.00, 0, 2),
(21, 'Reel Lews Mach Crush', 'Performa tinggi untuk turnamen', 'alatimg/reels6.png', 1450000.00, NULL, 'Carbon Fiber Spool', 0, 5, 0.00, 0, 2),
(22, 'Reel KastKing Valiant', 'Teknologi anti-penggumpalan line', 'alatimg/reels7.png', NULL, 70000.00, 'Superline Spool Design', 0, 18, 0.00, 0, 2),
(23, 'Reel Ryobi Ecusima', 'Desain klasik Jepang', 'alatimg/reels8.png', 850000.00, NULL, 'Aluminum Body, Smooth Drag', 0, 14, 0.00, 0, 2),
(24, 'Reel Quantum Smoke S3', 'Ringan dan seimbang', 'alatimg/reels9.png', NULL, 90000.00, 'Carbon Matrix Drag System', 0, 16, 0.00, 0, 2),
(25, 'Reel Mitchell Avocet III', 'Reel legendaris harga terjangkau', 'alatimg/reels10.png', 400000.00, NULL, 'Graphite Frame and Rotor', 0, 25, 0.00, 0, 2),
(26, 'Reel Pflueger President XT', 'Kinerja halus dan andal', 'alatimg/reels11.png', NULL, 85000.00, 'Durable Aluminum Body', 0, 22, 0.00, 0, 2),
(27, 'Reel Shimano Sedona', 'Reel serbaguna untuk semua teknik', 'alatimg/reels12.png', 750000.00, NULL, 'G-Free Body Design', 0, 11, 0.00, 0, 2),
(28, 'Reel Daiwa BG Spinning', 'Tahan banting untuk petualangan ekstrim', 'alatimg/reels13.png', NULL, 95000.00, 'Air Rotor Technology', 0, 9, 0.00, 0, 2),
(29, 'Reel Abu Garcia Black Max', 'Kualitas Abu Garcia dengan harga terjangkau', 'alatimg/reels14.png', 550000.00, NULL, 'C6 Carbon Frame', 0, 30, 0.00, 0, 2),
(30, 'Reel Okuma Helios SX', 'Desain futuristik dan ringan', 'alatimg/reels15.png', NULL, 110000.00, 'Lightweight Magnesium Body', 0, 13, 0.00, 0, 2),
(31, 'Kail Size 6', 'Kail tajam untuk ikan kecil', 'alatimg/kail1.png', 5000.00, NULL, 'Material Carbon Steel, Size 6', 0, 100, 0.00, 0, 4),
(32, 'Kail Size 8', 'Kail serbaguna untuk berbagai ikan', 'alatimg/kail2.png', 6000.00, NULL, 'Material High Carbon, Size 8', 0, 150, 0.00, 0, 4),
(33, 'Kail Size 10', 'Kail kuat untuk ikan sedang', 'alatimg/kail3.png', 7000.00, NULL, 'Material Stainless Steel, Size 10', 0, 120, 0.00, 0, 4),
(34, 'Kail Size 12', 'Kail tahan karat untuk air tawar', 'alatimg/kail4.png', 8000.00, NULL, 'Material Alloy Steel, Size 12', 0, 130, 0.00, 0, 4),
(35, 'Kail Size 14', 'Kail ultra tajam untuk ikan kecil hingga sedang', 'alatimg/kail5.png', 9000.00, NULL, 'Material High Carbon Steel, Size 14', 0, 110, 0.00, 0, 4),
(36, 'Umpan FS10 5g', 'Umpan buatan untuk ikan air tawar', 'alatimg/umpan1.png', 15000.00, NULL, 'Soft Plastic, 5g', 0, 200, 0.00, 0, 3),
(37, 'Umpan Crankbait 5g', 'Umpan keras dengan aksi renang realistis', 'alatimg/umpan2.png', 25000.00, NULL, 'Hard Bait, 10g', 0, 180, 0.00, 0, 3),
(38, 'Umpan Caperlan 20g', 'Umpan berputar untuk menarik perhatian ikan', 'alatimg/umpan3.png', 30000.00, NULL, 'Metal Blade, 15g', 0, 160, 0.00, 0, 3),
(39, 'Umpan Caperlan 10g', 'Umpan agresif untuk ikan predator', 'alatimg/umpan4.png', 28000.00, NULL, 'Floating Bait, 12g', 0, 170, 0.00, 0, 3),
(40, 'Umpan Caperlan 8g', 'Umpan lentur untuk berbagai teknik mancing', 'alatimg/umpan5.png', 12000.00, NULL, 'Soft Plastic, 8g', 0, 220, 0.00, 0, 3),
(41, 'Umpan Udang Galah', 'Umpan alami favorit ikan air tawar', 'alatimg/umpan6.png', 20000.00, NULL, 'Natural Shrimp Bait, 50g', 0, 140, 0.00, 0, 3),
(42, 'Senar Monofilament 0.25mm', 'Senar serbaguna untuk berbagai teknik', 'alatimg/senar1.png', 40000.00, NULL, 'Monofilament, 0.25mm, 100m', 0, 80, 0.00, 0, 5),
(43, 'Senar Braided 0.20mm', 'Senar kuat dengan diameter tipis', 'alatimg/senar2.png', 60000.00, NULL, 'Braided, 0.20mm, 100m', 0, 70, 0.00, 0, 5);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `img_path` varchar(255) NOT NULL,
  `img_type` enum('main','gallery') DEFAULT 'gallery',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `id_product`, `img_path`, `img_type`, `created_at`) VALUES
(1, 1, 'alatimg/joran1.png', 'main', '2025-11-25 06:44:27'),
(2, 1, 'alatimg/joran2.png', 'gallery', '2025-11-25 06:44:27'),
(3, 1, 'alatimg/joran3.png', 'gallery', '2025-11-25 06:44:27'),
(4, 1, 'alatimg/joran4.png', 'gallery', '2025-11-25 06:44:27'),
(5, 2, 'alatimg/joran2.png', 'main', '2025-11-25 06:44:27'),
(6, 2, 'alatimg/joran1.png', 'gallery', '2025-11-25 06:44:27'),
(7, 2, 'alatimg/reels1.png', 'gallery', '2025-11-25 06:44:27');

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `id_order_item` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shopping_cart`
--

CREATE TABLE `shopping_cart` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `transaction_type` enum('sewa','beli') DEFAULT 'beli',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `avatar_img` varchar(255) DEFAULT NULL,
  `date_birth` date DEFAULT NULL,
  `id_payment_method` int(11) DEFAULT NULL,
  `id_membership` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `google_id`, `password`, `bio`, `avatar_img`, `date_birth`, `id_payment_method`, `id_membership`, `created_at`) VALUES
(1, 'Joran_Melengkung', 'joran_melengkung@example.com', NULL, 'pass123', 'Hobi mancing', 'avatar/joran_melengkung.png', NULL, 1, 1, '2025-11-25 06:44:27'),
(2, 'Kang_Asep_Mancing', 'kang_asep_mancing@example.com', NULL, 'pass456', 'Mancing mania', 'avatar/kang_asep_mancing.png', NULL, 2, 2, '2025-11-25 06:44:27'),
(3, 'Pemula_Casting', 'pemula_casting@example.com', NULL, 'pass789', 'Newbie', 'avatar/pemula_casting.png', NULL, 1, 1, '2025-11-25 06:44:27'),
(4, 'Jayesh Patil', 'jayesh.patil@dummy.com', NULL, 'pass123', NULL, 'https://placehold.co/40x40/FF7F50/FFFFFF/png?text=JP', NULL, 1, 1, '2025-11-25 06:44:27'),
(5, 'Dina Sari', 'dina.sari@dummy.com', NULL, 'pass123', NULL, 'https://placehold.co/40x40/90EE90/FFFFFF/png?text=DS', NULL, 1, 1, '2025-11-25 06:44:27'),
(6, 'Budi Santoso', 'budi.review@test.com', NULL, '12345', 'Hobi mancing galatama', 'https://randomuser.me/api/portraits/men/32.jpg', NULL, 1, 1, '2025-11-25 06:44:27'),
(7, 'Siti Aminah', 'siti.review@test.com', NULL, '12345', 'Pemula casting', 'https://randomuser.me/api/portraits/women/44.jpg', NULL, 1, 1, '2025-11-25 06:44:27'),
(8, 'Rudi Hermawan', 'rudi.review@test.com', NULL, '12345', 'Mancing mania mantap', 'https://randomuser.me/api/portraits/men/85.jpg', NULL, 1, 2, '2025-11-25 06:44:27'),
(9, 'Dewi Sartika', 'dewi.review@test.com', NULL, '12345', 'Healing fishing', 'https://randomuser.me/api/portraits/women/68.jpg', NULL, 1, 1, '2025-11-25 06:44:27'),
(10, 'Andi Pratama', 'andi.review@test.com', NULL, '12345', 'Casting lover', 'https://randomuser.me/api/portraits/men/11.jpg', NULL, 1, 1, '2025-11-25 06:44:27'),
(11, 'DZAKA MUSYAFFA', 'dzokodolog@upi.edu', '117108749320151513373', NULL, NULL, NULL, NULL, NULL, 2, '2025-11-25 06:44:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `id_location` (`id_location`),
  ADD KEY `payment_method` (`payment_method`),
  ADD KEY `idx_bookings_user_date` (`id_user`,`booking_date`);

--
-- Indexes for table `category_products`
--
ALTER TABLE `category_products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_comment_like` (`id_comment`,`id_user`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `community_posts`
--
ALTER TABLE `community_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_posts_user_date` (`id_user`,`created_at`);

--
-- Indexes for table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_locations_city` (`city`);

--
-- Indexes for table `location_images`
--
ALTER TABLE `location_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_location` (`id_location`);

--
-- Indexes for table `location_reviews`
--
ALTER TABLE `location_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_booking_review` (`id_booking`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_location` (`id_location`);

--
-- Indexes for table `location_spots`
--
ALTER TABLE `location_spots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_spot_per_location` (`id_location`,`spot_name`);

--
-- Indexes for table `memberships`
--
ALTER TABLE `memberships`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_orders_user_date` (`id_user`,`created_at`),
  ADD KEY `fk_orders_payment_method` (`payment_method`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_order` (`id_order`),
  ADD KEY `id_product` (`id_product`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `post_comments`
--
ALTER TABLE `post_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `idx_post_comments_post` (`id_post`);

--
-- Indexes for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`id_post`,`id_user`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `idx_post_likes_post` (`id_post`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category` (`id_category`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_product` (`id_product`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_product` (`id_product`),
  ADD KEY `id_order_item` (`id_order_item`);

--
-- Indexes for table `shopping_cart`
--
ALTER TABLE `shopping_cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_item` (`id_user`,`id_product`),
  ADD KEY `id_product` (`id_product`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`),
  ADD KEY `id_payment_method` (`id_payment_method`),
  ADD KEY `id_membership` (`id_membership`),
  ADD KEY `idx_users_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `category_products`
--
ALTER TABLE `category_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `comment_likes`
--
ALTER TABLE `comment_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `community_posts`
--
ALTER TABLE `community_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `location_images`
--
ALTER TABLE `location_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `location_reviews`
--
ALTER TABLE `location_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `location_spots`
--
ALTER TABLE `location_spots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `memberships`
--
ALTER TABLE `memberships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `post_comments`
--
ALTER TABLE `post_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `post_likes`
--
ALTER TABLE `post_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shopping_cart`
--
ALTER TABLE `shopping_cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`id_location`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`payment_method`) REFERENCES `payment_methods` (`id`);

--
-- Constraints for table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD CONSTRAINT `comment_likes_ibfk_1` FOREIGN KEY (`id_comment`) REFERENCES `post_comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comment_likes_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

--
-- Constraints for table `community_posts`
--
ALTER TABLE `community_posts`
  ADD CONSTRAINT `community_posts_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `location_images`
--
ALTER TABLE `location_images`
  ADD CONSTRAINT `location_images_ibfk_1` FOREIGN KEY (`id_location`) REFERENCES `locations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `location_reviews`
--
ALTER TABLE `location_reviews`
  ADD CONSTRAINT `location_reviews_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `location_reviews_ibfk_2` FOREIGN KEY (`id_location`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `location_reviews_ibfk_3` FOREIGN KEY (`id_booking`) REFERENCES `bookings` (`id`);

--
-- Constraints for table `location_spots`
--
ALTER TABLE `location_spots`
  ADD CONSTRAINT `location_spots_ibfk_1` FOREIGN KEY (`id_location`) REFERENCES `locations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_payment_method` FOREIGN KEY (`payment_method`) REFERENCES `payment_methods` (`id`),
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`id_product`) REFERENCES `products` (`id`);

--
-- Constraints for table `post_comments`
--
ALTER TABLE `post_comments`
  ADD CONSTRAINT `post_comments_ibfk_1` FOREIGN KEY (`id_post`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_comments_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

--
-- Constraints for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`id_post`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`id_category`) REFERENCES `category_products` (`id`);

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`id_product`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`id_product`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `product_reviews_ibfk_3` FOREIGN KEY (`id_order_item`) REFERENCES `order_items` (`id`);

--
-- Constraints for table `shopping_cart`
--
ALTER TABLE `shopping_cart`
  ADD CONSTRAINT `shopping_cart_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shopping_cart_ibfk_2` FOREIGN KEY (`id_product`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_payment_method`) REFERENCES `payment_methods` (`id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`id_membership`) REFERENCES `memberships` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
