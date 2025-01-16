-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 16, 2025 at 02:21 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mouse_shop`
--

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `cart_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`cart_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 2, '2025-01-02 14:13:44', '2025-01-02 14:13:44');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `cart_item_id` bigint(20) UNSIGNED NOT NULL,
  `cart_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`cart_item_id`, `cart_id`, `product_id`, `quantity`, `added_at`) VALUES
(62, 1, 1, 1, '2025-01-16 01:15:29'),
(63, 1, 4, 1, '2025-01-16 01:15:43');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `coupon_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed_amount') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_value` decimal(10,2) DEFAULT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `total_usage_limit` int(11) DEFAULT NULL COMMENT 'Giới hạn tổng số lần sử dụng',
  `user_usage_limit` int(11) DEFAULT 1 COMMENT 'Số lần sử dụng tối đa cho mỗi user',
  `used_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`coupon_id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `min_order_value`, `max_discount_amount`, `start_date`, `end_date`, `total_usage_limit`, `user_usage_limit`, `used_count`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'TEST2025', 'Welcome Discount', 'New user discount', 'percentage', 10.00, 30.00, 50.00, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 1000, 1, 0, 1, '2025-01-09 17:09:04', '2025-01-09 17:09:04'),
(2, 'WELCOME2025', 'Welcome Discount', 'New user discount', 'percentage', 10.00, 30.00, 50.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 1000, 1, 0, 1, '2025-01-16 10:02:06', '2025-01-16 10:02:06');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_category_restrictions`
--

CREATE TABLE `coupon_category_restrictions` (
  `restriction_id` bigint(20) UNSIGNED NOT NULL,
  `coupon_id` bigint(20) UNSIGNED NOT NULL,
  `category` varchar(50) NOT NULL COMMENT 'Ví dụ: brand, hand_size, grip_style',
  `category_value` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupon_category_restrictions`
--

INSERT INTO `coupon_category_restrictions` (`restriction_id`, `coupon_id`, `category`, `category_value`) VALUES
(1, 1, 'brand', 'Logitech'),
(2, 2, 'brand', 'Logitech');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_usage_history`
--

CREATE TABLE `coupon_usage_history` (
  `usage_id` bigint(20) UNSIGNED NOT NULL,
  `coupon_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `discount_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expert_reviews`
--

CREATE TABLE `expert_reviews` (
  `expert_review_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `expert_name` varchar(100) NOT NULL,
  `expert_title` varchar(100) DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL,
  `detailed_review` text DEFAULT NULL,
  `review_url` varchar(255) DEFAULT NULL,
  `review_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expert_reviews`
--

INSERT INTO `expert_reviews` (`expert_review_id`, `product_id`, `expert_name`, `expert_title`, `rating`, `detailed_review`, `review_url`, `review_date`, `created_at`) VALUES
(1, 1, 'Anh Hoang', 'Dân chơi chuột', 2.50, 'Logitech là biểu hiện của chủ nghĩa tư bản. Logitech là biểu hiện của chủ nghĩa tư bản. Logitech là biểu hiện của chủ nghĩa tư bản. Logitech là biểu hiện của chủ nghĩa tư bản. Logitech là biểu hiện của chủ nghĩa tư bản.', 'https://mousereview.com/logitech-g-pro-x-review', '2025-01-05 16:07:47', '2025-01-05 16:07:47');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT NULL CHECK (`status` in ('pending','processing','shipped','delivered','cancelled')),
  `shipping_address` text NOT NULL,
  `note` text DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `promotion_id` bigint(20) UNSIGNED DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `coupon_id` bigint(20) UNSIGNED DEFAULT NULL,
  `coupon_discount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status`, `shipping_address`, `note`, `order_date`, `updated_at`, `promotion_id`, `discount_amount`, `coupon_id`, `coupon_discount`) VALUES
(1, 1, 129.99, 'pending', '123 Main St, City, Country, 12345', NULL, '2025-01-05 09:04:34', '2025-01-05 09:04:34', NULL, 0.00, NULL, 0.00),
(2, 2, 107.99, 'delivered', 'Test User, 0123456789, So 7, Thien Quang', 'tét', '2025-01-12 11:56:07', '2025-01-12 11:56:07', 1, 30.00, 1, 12.00),
(3, 2, 207.98, 'delivered', 'Test User, 01234567899, So 7, Thien Quang', '', '2025-01-14 16:52:47', '2025-01-14 16:52:47', 1, 32.00, NULL, 0.00),
(4, 2, 79.99, 'pending', 'Test User, 01234567899, So 7, Thien Quang', '', '2025-01-14 23:13:13', '2025-01-14 23:13:13', NULL, 0.00, NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `order_detail_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_details`
--

INSERT INTO `order_details` (`order_detail_id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`) VALUES
(1, 1, 1, 1, 129.99, 129.99),
(2, 2, 2, 1, 149.99, 149.99),
(3, 3, 3, 1, 159.99, 159.99),
(4, 3, 4, 1, 79.99, 79.99),
(5, 4, 4, 1, 79.99, 79.99);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL,
  `hand_size` varchar(20) DEFAULT NULL CHECK (`hand_size` in ('small','medium','large')),
  `grip_style` varchar(20) DEFAULT NULL CHECK (`grip_style` in ('palm','claw','fingertip')),
  `is_wireless` tinyint(1) DEFAULT 0,
  `brand` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `avg_user_rating` decimal(3,2) DEFAULT NULL,
  `avg_expert_rating` decimal(3,2) DEFAULT NULL,
  `total_reviews` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `main_image` varchar(255) DEFAULT NULL,
  `thumbnail_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`thumbnail_images`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `name`, `description`, `price`, `stock_quantity`, `hand_size`, `grip_style`, `is_wireless`, `brand`, `is_active`, `avg_user_rating`, `avg_expert_rating`, `total_reviews`, `created_at`, `updated_at`, `main_image`, `thumbnail_images`) VALUES
(1, 'Logitech G Pro 2', 'Professional Gaming Mouse', 129.99, 96, 'medium', 'claw', 1, 'Logitech', 1, NULL, NULL, 0, '2024-12-18 07:54:43', '2024-12-18 07:54:43', NULL, NULL),
(2, 'Logitech G Pro X Superlight', 'Ultra-lightweight wireless gaming mouse featuring HERO 25K sensor and LIGHTSPEED wireless technology', 149.99, 47, 'medium', 'claw', 1, 'Logitech', 1, NULL, NULL, 0, '2024-12-18 08:46:52', '2024-12-18 08:52:57', NULL, NULL),
(3, 'Razer DeathAdder V3 Pro', 'Professional-grade wireless gaming mouse with Focus Pro 30K optical sensor', 159.99, 38, 'large', 'palm', 1, 'Razer', 1, NULL, NULL, 0, '2024-12-18 08:47:07', '2024-12-18 08:56:25', NULL, NULL),
(4, 'Zowie EC2-C', 'Professional e-sports gaming mouse with ergonomic right-handed design', 79.99, 26, 'medium', 'palm', 0, 'Zowie', 1, NULL, NULL, 0, '2024-12-18 08:47:37', '2024-12-18 08:56:57', NULL, NULL),
(5, 'Pulsar X2 Mini', 'Ultra-lightweight gaming mouse designed for small hands', 69.99, 23, 'small', 'fingertip', 1, 'Pulsar', 1, NULL, NULL, 0, '2024-12-18 08:48:05', '2024-12-18 13:12:15', NULL, NULL),
(6, 'Razer Viper V2 Pro', 'Wireless gaming mouse with advanced optical sensor and ultra-lightweight design', 159.99, 20, 'medium', 'claw', 1, 'Razer', 1, NULL, NULL, 0, '2025-01-14 15:56:57', '2025-01-14 15:56:57', NULL, NULL),
(7, 'Waizowl OGM Cloud V2', 'Wireless Gaming Mouse perfect for those looking for a high-quality mouse with many features', 89.99, 15, 'large', 'claw', 1, 'Waizowl', 1, NULL, NULL, 0, '2025-01-16 11:01:37', '2025-01-16 11:01:37', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `image_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`image_id`, `product_id`, `image_url`, `is_primary`, `created_at`) VALUES
(1, 1, '/static/products/1/main.webp', 1, '2025-01-15 09:14:32'),
(2, 1, '/static/products/1/thumb1.webp', 0, '2025-01-15 09:52:28');

-- --------------------------------------------------------

--
-- Table structure for table `product_promotions`
--

CREATE TABLE `product_promotions` (
  `product_promotion_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `promotion_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_promotions`
--

INSERT INTO `product_promotions` (`product_promotion_id`, `product_id`, `promotion_id`, `created_at`) VALUES
(1, 1, 1, '2025-01-09 17:06:11'),
(2, 2, 1, '2025-01-09 17:06:11'),
(3, 3, 1, '2025-01-09 17:06:11');

-- --------------------------------------------------------

--
-- Table structure for table `product_views`
--

CREATE TABLE `product_views` (
  `view_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `session_id` varchar(100) NOT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_views`
--

INSERT INTO `product_views` (`view_id`, `product_id`, `session_id`, `viewed_at`) VALUES
(1, 1, '1736864067176-85mzn8s5g', '2025-01-14 14:14:27'),
(2, 4, '1736864067176-85mzn8s5g', '2025-01-14 14:14:47'),
(3, 4, '1736864067176-85mzn8s5g', '2025-01-14 14:15:21'),
(4, 1, '1736864067176-85mzn8s5g', '2025-01-14 14:16:57'),
(5, 5, '1736864067176-85mzn8s5g', '2025-01-14 14:17:00'),
(6, 2, '1736864236968-fwo31h00s', '2025-01-14 14:17:16'),
(7, 2, '1736864236968-fwo31h00s', '2025-01-14 14:22:46'),
(8, 2, '1736864067176-85mzn8s5g', '2025-01-14 14:24:08'),
(9, 2, '1736864067176-85mzn8s5g', '2025-01-14 14:24:15'),
(10, 2, '1736864067176-85mzn8s5g', '2025-01-14 14:24:23'),
(11, 2, '1736864236968-fwo31h00s', '2025-01-14 14:25:10'),
(12, 2, '1736864236968-fwo31h00s', '2025-01-14 14:25:24'),
(13, 2, '1736864236968-fwo31h00s', '2025-01-14 14:27:32'),
(14, 3, '1736864067176-85mzn8s5g', '2025-01-14 15:34:41'),
(15, 3, '1736864067176-85mzn8s5g', '2025-01-14 15:39:47'),
(16, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:39:49'),
(17, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:39:51'),
(18, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:40:07'),
(19, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:40:09'),
(20, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:40:13'),
(21, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:40:25'),
(22, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:40:31'),
(23, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:40:34'),
(24, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:40:37'),
(25, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:40:42'),
(26, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:40:44'),
(27, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:40:46'),
(28, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:40:48'),
(29, 3, '1736864067176-85mzn8s5g', '2025-01-14 15:40:51'),
(30, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:41:36'),
(31, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:42:09'),
(32, 4, '1736864067176-85mzn8s5g', '2025-01-14 15:42:16'),
(33, 1, '1736864067176-85mzn8s5g', '2025-01-14 15:42:24'),
(34, 1, '1736864067176-85mzn8s5g', '2025-01-14 15:43:16'),
(35, 1, '1736864067176-85mzn8s5g', '2025-01-14 15:43:28'),
(36, 1, '1736864067176-85mzn8s5g', '2025-01-14 15:43:53'),
(37, 6, '1736864067176-85mzn8s5g', '2025-01-14 15:57:03'),
(38, 4, '1736864067176-85mzn8s5g', '2025-01-14 17:11:54'),
(39, 2, '1736864236968-fwo31h00s', '2025-01-14 22:42:38'),
(40, 1, '1736864236968-fwo31h00s', '2025-01-14 22:42:41'),
(41, 3, '1736864236968-fwo31h00s', '2025-01-14 22:42:43'),
(42, 4, '1736864236968-fwo31h00s', '2025-01-14 22:42:44'),
(43, 4, '1736864236968-fwo31h00s', '2025-01-14 22:42:47'),
(44, 4, '1736864236968-fwo31h00s', '2025-01-14 22:42:48'),
(45, 4, '1736864236968-fwo31h00s', '2025-01-14 22:42:50'),
(46, 2, '1736864236968-fwo31h00s', '2025-01-14 23:10:44'),
(47, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:29:32'),
(48, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:31:58'),
(49, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:39:14'),
(50, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:39:24'),
(51, 2, '1736864067176-85mzn8s5g', '2025-01-15 09:47:45'),
(52, 4, '1736864067176-85mzn8s5g', '2025-01-15 09:47:47'),
(53, 5, '1736864067176-85mzn8s5g', '2025-01-15 09:47:49'),
(54, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:48:13'),
(55, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:51:50'),
(56, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:52:32'),
(57, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:53:43'),
(58, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:54:22'),
(59, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:55:27'),
(60, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:55:34'),
(61, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:55:40'),
(62, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:59:01'),
(63, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:59:01'),
(64, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:59:33'),
(65, 1, '1736864067176-85mzn8s5g', '2025-01-15 09:59:33'),
(66, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:00:21'),
(67, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:05:09'),
(68, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:06:14'),
(69, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:06:22'),
(70, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:06:24'),
(71, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:06:33'),
(72, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:06:33'),
(73, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:06:35'),
(74, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:12:14'),
(75, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:12:14'),
(76, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:13:00'),
(77, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:13:22'),
(78, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:13:37'),
(79, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:13:37'),
(80, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:13:42'),
(81, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:14:19'),
(82, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:14:23'),
(83, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:15:56'),
(84, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:17:09'),
(85, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:17:09'),
(86, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:17:26'),
(87, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:17:40'),
(88, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:17:43'),
(89, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:17:59'),
(90, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:18:01'),
(91, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:18:08'),
(92, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:18:11'),
(93, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:18:13'),
(94, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:18:26'),
(95, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:19:38'),
(96, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:19:38'),
(97, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:27:44'),
(98, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:28:10'),
(99, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:28:15'),
(100, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:28:20'),
(101, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:29:26'),
(102, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:29:28'),
(103, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:29:32'),
(104, 1, '1736864067176-85mzn8s5g', '2025-01-15 10:29:52'),
(105, 2, '1736943116478-5io6c8bcl', '2025-01-15 12:35:35'),
(106, 1, '1736943232094-rl74d1tew', '2025-01-15 13:54:34'),
(107, 2, '1736943232094-rl74d1tew', '2025-01-15 13:55:43'),
(108, 1, '1736943232094-rl74d1tew', '2025-01-15 13:55:56'),
(109, 1, '1736943232094-rl74d1tew', '2025-01-15 14:10:58'),
(110, 1, '1736943232094-rl74d1tew', '2025-01-15 20:43:50'),
(111, 1, '1736943232094-rl74d1tew', '2025-01-15 20:46:55'),
(112, 2, '1736864067176-85mzn8s5g', '2025-01-16 01:14:39'),
(113, 1, '1736943116478-5io6c8bcl', '2025-01-16 10:41:31'),
(114, 1, '1736864067176-85mzn8s5g', '2025-01-16 10:49:31');

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `promotion_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed_amount') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `min_order_value` decimal(10,2) DEFAULT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promotions`
--

INSERT INTO `promotions` (`promotion_id`, `name`, `description`, `discount_type`, `discount_value`, `start_date`, `end_date`, `min_order_value`, `max_discount_amount`, `usage_limit`, `used_count`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Summer Sale', 'Summer promotion 20% off', 'percentage', 20.00, '2024-12-31 00:00:00', '2025-06-30 23:59:59', 50.00, 100.00, 100, 2, 1, '2025-01-09 17:05:55', '2025-01-09 17:05:55');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(100) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ended_at` timestamp NULL DEFAULT NULL,
  `utm_source` varchar(50) DEFAULT NULL,
  `utm_medium` varchar(50) DEFAULT NULL,
  `utm_campaign` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `technical_specs`
--

CREATE TABLE `technical_specs` (
  `spec_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `dpi` int(11) DEFAULT NULL,
  `weight_g` decimal(6,2) DEFAULT NULL,
  `length_mm` decimal(6,2) DEFAULT NULL,
  `width_mm` decimal(6,2) DEFAULT NULL,
  `height_mm` decimal(6,2) DEFAULT NULL,
  `sensor_type` varchar(50) DEFAULT NULL,
  `polling_rate` int(11) DEFAULT NULL,
  `switch_type` varchar(50) DEFAULT NULL,
  `switch_durability` int(11) DEFAULT NULL,
  `connectivity` varchar(50) DEFAULT NULL,
  `battery_life` int(11) DEFAULT NULL,
  `cable_type` varchar(50) DEFAULT NULL,
  `rgb_lighting` tinyint(1) DEFAULT 0,
  `programmable_buttons` int(11) DEFAULT NULL,
  `memory_profiles` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `technical_specs`
--

INSERT INTO `technical_specs` (`spec_id`, `product_id`, `dpi`, `weight_g`, `length_mm`, `width_mm`, `height_mm`, `sensor_type`, `polling_rate`, `switch_type`, `switch_durability`, `connectivity`, `battery_life`, `cable_type`, `rgb_lighting`, `programmable_buttons`, `memory_profiles`) VALUES
(1, 1, 25600, 80.00, 125.00, 63.50, 40.00, 'HERO 25K', 1000, 'Omron', 50000000, 'LIGHTSPEED Wireless', 70, 'USB-C', 1, 8, '5 onboard profiles'),
(2, 2, 25600, 63.00, 125.00, 63.50, 40.00, 'HERO 25K', 1000, 'Omron', 50000000, 'LIGHTSPEED Wireless', 70, 'USB-C', 0, 5, '5 onboard profiles'),
(3, 3, 30000, 63.00, 128.00, 68.00, 44.00, 'Focus Pro 30K', 1000, 'Optical Gen-3', 90000000, 'HyperSpeed Wireless', 90, 'USB-C', 0, 6, '5 onboard profiles'),
(4, 4, 3200, 73.00, 120.00, 64.00, 40.00, '3360', 1000, 'Huano', 20000000, 'Wired', 0, 'USB-C', 0, 5, 'No onboard memory'),
(5, 5, 26000, 52.00, 114.00, 58.00, 36.00, 'PAW3395', 1000, 'Kailh 8.0', 80000000, '2.4GHz Wireless', 70, 'USB-C', 1, 6, '4 onboard profiles'),
(11, 6, 30000, 58.00, 126.70, 57.60, 37.80, 'Optical', 1000, 'Optical Gen-3', 90000000, 'Wireless', 80, 'USB-C', 0, 5, '5'),
(12, 7, 30000, 56.00, 126.00, 57.00, 38.00, ' PAW3950', 8000, 'Huano TBPD', 80000000, '2.4GHz, Bluetooth, USB', 130, 'USB-C', 0, 6, '5');

-- --------------------------------------------------------

--
-- Table structure for table `traffic_analytics`
--

CREATE TABLE `traffic_analytics` (
  `analytics_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `total_visits` int(11) DEFAULT 0,
  `unique_visitors` int(11) DEFAULT 0,
  `bounce_rate` int(11) DEFAULT NULL,
  `avg_session_duration` decimal(10,2) DEFAULT NULL,
  `page_views` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `full_name`, `phone`, `address`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admintest', 'admin@example.com', '$2b$12$.4tn.sVnaxkxlxMhpXaURuVE0gBta5Z/aE7S7GIcDU0s19.cgZaLm', 'Hoang Dinh Hai Anh', NULL, NULL, 'admin', '2024-12-04 03:38:09', '2024-12-04 03:38:09'),
(2, 'testuser1', 'testuser12@example.com', '$2b$12$Ioq39SHgbrcF9ighx9ljXuWoQehiwRPSI5cJ3Nz2/bTukvEwYP/uq', 'Test User', '01234567899', 'So 7, Thien Quang', 'user', '2024-12-04 05:01:46', '2025-01-13 12:12:00'),
(3, 'testuser2', 'test2@example.eg', '$2b$12$WVwDUZBsSWiw2P8uZ52Rc.xRIcbOdPjPFrXacuLd5X.fB7F4uKH3q', 'Không Có Tên', '0366771508', 'lay đây mai đó', 'user', '2025-01-14 22:49:17', '2025-01-16 10:43:43');

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `preference_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `hand_size` varchar(20) DEFAULT NULL CHECK (`hand_size` in ('small','medium','large')),
  `grip_style` varchar(20) DEFAULT NULL CHECK (`grip_style` in ('palm','claw','fingertip')),
  `wireless_preferred` tinyint(1) DEFAULT 0,
  `usage_type` varchar(20) DEFAULT NULL CHECK (`usage_type` in ('gaming','office','general')),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`preference_id`, `user_id`, `hand_size`, `grip_style`, `wireless_preferred`, `usage_type`, `updated_at`) VALUES
(1, 2, 'medium', 'claw', 1, 'gaming', '2025-01-13 12:12:00');

-- --------------------------------------------------------

--
-- Table structure for table `user_reviews`
--

CREATE TABLE `user_reviews` (
  `review_id` bigint(20) UNSIGNED NOT NULL,
  `order_detail_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_reviews`
--

INSERT INTO `user_reviews` (`review_id`, `order_detail_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'dm logitech', '2025-01-05 09:05:18', '2025-01-05 09:05:18'),
(2, 2, 5, 'chay nhu do thai', '2025-01-14 21:31:29', '2025-01-14 21:31:29'),
(3, 3, 1, 'vcl qua dien', '2025-01-14 21:32:34', '2025-01-14 21:32:34'),
(4, 4, 2, '.....................', '2025-01-14 21:32:43', '2025-01-14 21:32:43');

-- --------------------------------------------------------

--
-- Table structure for table `warranty_claims`
--

CREATE TABLE `warranty_claims` (
  `claim_id` bigint(20) UNSIGNED NOT NULL,
  `order_detail_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `claim_date` datetime DEFAULT current_timestamp(),
  `issue_description` text NOT NULL,
  `status` enum('pending','processing','completed','rejected') NOT NULL,
  `resolution_notes` text DEFAULT NULL,
  `resolved_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `warranty_claims`
--

INSERT INTO `warranty_claims` (`claim_id`, `order_detail_id`, `user_id`, `claim_date`, `issue_description`, `status`, `resolution_notes`, `resolved_date`, `created_at`, `updated_at`) VALUES
(1, 2, 2, '2025-01-16 20:03:45', 'Hàng này cũng bán được thì chịu dồi', 'pending', 'Hoàn x10', NULL, '2025-01-16 13:03:45', '2025-01-16 13:03:45');

-- --------------------------------------------------------

--
-- Table structure for table `warranty_policies`
--

CREATE TABLE `warranty_policies` (
  `warranty_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `warranty_period` int(11) NOT NULL COMMENT 'Số tháng bảo hành',
  `warranty_type` varchar(50) NOT NULL COMMENT 'Loại bảo hành (ví dụ: Bảo hành chính hãng, Bảo hành cửa hàng)',
  `warranty_description` text DEFAULT NULL,
  `warranty_conditions` text DEFAULT NULL COMMENT 'Điều kiện bảo hành',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `warranty_policies`
--

INSERT INTO `warranty_policies` (`warranty_id`, `product_id`, `warranty_period`, `warranty_type`, `warranty_description`, `warranty_conditions`, `created_at`, `updated_at`) VALUES
(1, 1, 24, 'Manufacturer Warranty', '2 years manufacturer warranty', 'Valid only with original receipt', '2025-01-16 13:08:35', '2025-01-16 13:08:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`cart_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`cart_item_id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`coupon_id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_coupon_code` (`code`);

--
-- Indexes for table `coupon_category_restrictions`
--
ALTER TABLE `coupon_category_restrictions`
  ADD PRIMARY KEY (`restriction_id`),
  ADD KEY `coupon_id` (`coupon_id`);

--
-- Indexes for table `coupon_usage_history`
--
ALTER TABLE `coupon_usage_history`
  ADD PRIMARY KEY (`usage_id`),
  ADD KEY `coupon_id` (`coupon_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `expert_reviews`
--
ALTER TABLE `expert_reviews`
  ADD PRIMARY KEY (`expert_review_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `idx_orders_user_id` (`user_id`),
  ADD KEY `promotion_id` (`promotion_id`),
  ADD KEY `coupon_id` (`coupon_id`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`order_detail_id`),
  ADD KEY `idx_order_details_order_id` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `idx_products_brand` (`brand`),
  ADD KEY `idx_products_main_image` (`main_image`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`image_id`);

--
-- Indexes for table `product_promotions`
--
ALTER TABLE `product_promotions`
  ADD PRIMARY KEY (`product_promotion_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `promotion_id` (`promotion_id`);

--
-- Indexes for table `product_views`
--
ALTER TABLE `product_views`
  ADD PRIMARY KEY (`view_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`promotion_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_sessions_user_id` (`user_id`);

--
-- Indexes for table `technical_specs`
--
ALTER TABLE `technical_specs`
  ADD PRIMARY KEY (`spec_id`),
  ADD UNIQUE KEY `unique_product_id` (`product_id`);

--
-- Indexes for table `traffic_analytics`
--
ALTER TABLE `traffic_analytics`
  ADD PRIMARY KEY (`analytics_id`),
  ADD KEY `idx_traffic_analytics_date` (`date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`preference_id`),
  ADD UNIQUE KEY `unique_user_id` (`user_id`);

--
-- Indexes for table `user_reviews`
--
ALTER TABLE `user_reviews`
  ADD PRIMARY KEY (`review_id`);

--
-- Indexes for table `warranty_claims`
--
ALTER TABLE `warranty_claims`
  ADD PRIMARY KEY (`claim_id`),
  ADD KEY `order_detail_id` (`order_detail_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `warranty_policies`
--
ALTER TABLE `warranty_policies`
  ADD PRIMARY KEY (`warranty_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `cart_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `coupon_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `coupon_category_restrictions`
--
ALTER TABLE `coupon_category_restrictions`
  MODIFY `restriction_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `coupon_usage_history`
--
ALTER TABLE `coupon_usage_history`
  MODIFY `usage_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `expert_reviews`
--
ALTER TABLE `expert_reviews`
  MODIFY `expert_review_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `order_detail_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `image_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `product_promotions`
--
ALTER TABLE `product_promotions`
  MODIFY `product_promotion_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `product_views`
--
ALTER TABLE `product_views`
  MODIFY `view_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `promotion_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `technical_specs`
--
ALTER TABLE `technical_specs`
  MODIFY `spec_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `traffic_analytics`
--
ALTER TABLE `traffic_analytics`
  MODIFY `analytics_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `preference_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_reviews`
--
ALTER TABLE `user_reviews`
  MODIFY `review_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `warranty_claims`
--
ALTER TABLE `warranty_claims`
  MODIFY `claim_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `warranty_policies`
--
ALTER TABLE `warranty_policies`
  MODIFY `warranty_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `coupon_category_restrictions`
--
ALTER TABLE `coupon_category_restrictions`
  ADD CONSTRAINT `coupon_category_restrictions_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`coupon_id`);

--
-- Constraints for table `coupon_usage_history`
--
ALTER TABLE `coupon_usage_history`
  ADD CONSTRAINT `coupon_usage_history_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`coupon_id`),
  ADD CONSTRAINT `coupon_usage_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `coupon_usage_history_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`promotion_id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`coupon_id`);

--
-- Constraints for table `product_promotions`
--
ALTER TABLE `product_promotions`
  ADD CONSTRAINT `product_promotions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `product_promotions_ibfk_2` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`promotion_id`);

--
-- Constraints for table `product_views`
--
ALTER TABLE `product_views`
  ADD CONSTRAINT `product_views_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `technical_specs`
--
ALTER TABLE `technical_specs`
  ADD CONSTRAINT `fk_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `warranty_claims`
--
ALTER TABLE `warranty_claims`
  ADD CONSTRAINT `warranty_claims_ibfk_1` FOREIGN KEY (`order_detail_id`) REFERENCES `order_details` (`order_detail_id`),
  ADD CONSTRAINT `warranty_claims_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `warranty_policies`
--
ALTER TABLE `warranty_policies`
  ADD CONSTRAINT `warranty_policies_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
