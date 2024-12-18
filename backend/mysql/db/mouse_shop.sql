-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 18, 2024 at 06:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
-- Table structure for table `admin_dashboard_stats`
--

CREATE TABLE `admin_dashboard_stats` (
  `stat_id` bigint(20) UNSIGNED NOT NULL,
  `total_users` int(11) DEFAULT 0,
  `total_orders` int(11) DEFAULT 0,
  `total_revenue` decimal(12,2) DEFAULT 0.00,
  `total_products` int(11) DEFAULT 0,
  `avg_order_value` decimal(10,2) DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `page_views`
--

CREATE TABLE `page_views` (
  `pageview_id` bigint(20) UNSIGNED NOT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `url_path` varchar(255) NOT NULL,
  `referrer` varchar(255) DEFAULT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `device_type` varchar(50) DEFAULT NULL,
  `browser` varchar(50) DEFAULT NULL,
  `os` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `name`, `description`, `price`, `stock_quantity`, `hand_size`, `grip_style`, `is_wireless`, `brand`, `is_active`, `avg_user_rating`, `avg_expert_rating`, `total_reviews`, `created_at`, `updated_at`) VALUES
(1, 'Logitech G Pro 2', 'Professional Gaming Mouse', 129.99, 100, 'medium', 'claw', 1, 'Logitech', 1, NULL, NULL, 0, '2024-12-18 07:54:43', '2024-12-18 07:54:43'),
(2, 'Logitech G Pro X Superlight', 'Ultra-lightweight wireless gaming mouse featuring HERO 25K sensor and LIGHTSPEED wireless technology', 149.99, 50, 'medium', 'claw', 1, 'Logitech', 1, NULL, NULL, 0, '2024-12-18 08:46:52', '2024-12-18 08:52:57'),
(3, 'Razer DeathAdder V3 Pro', 'Professional-grade wireless gaming mouse with Focus Pro 30K optical sensor', 159.99, 40, 'large', 'palm', 1, 'Razer', 1, NULL, NULL, 0, '2024-12-18 08:47:07', '2024-12-18 08:56:25'),
(4, 'Zowie EC2-C', 'Professional e-sports gaming mouse with ergonomic right-handed design', 79.99, 30, 'medium', 'palm', 0, 'Zowie', 1, NULL, NULL, 0, '2024-12-18 08:47:37', '2024-12-18 08:56:57'),
(5, 'Pulsar X2 Mini', 'Ultra-lightweight gaming mouse designed for small hands', 69.99, 25, 'small', 'fingertip', 1, 'Pulsar', 1, NULL, NULL, 0, '2024-12-18 08:48:05', '2024-12-18 13:12:15');

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
(5, 5, 26000, 52.00, 114.00, 58.00, 36.00, 'PAW3395', 1000, 'Kailh 8.0', 80000000, '2.4GHz Wireless', 70, 'USB-C', 1, 6, '4 onboard profiles');

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
(2, 'testuser1', 'testuser1@example.com', '$2b$12$tyR4pcU1IA9Q3WWJAd94wOSJlmQ4ARWArGnWbG3X7RoRY8n9ZJOvq', 'Test User', NULL, NULL, 'user', '2024-12-04 05:01:46', '2024-12-04 05:01:46');

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
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_dashboard_stats`
--
ALTER TABLE `admin_dashboard_stats`
  ADD PRIMARY KEY (`stat_id`);

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
-- Indexes for table `expert_reviews`
--
ALTER TABLE `expert_reviews`
  ADD PRIMARY KEY (`expert_review_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `idx_orders_user_id` (`user_id`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`order_detail_id`),
  ADD KEY `idx_order_details_order_id` (`order_id`);

--
-- Indexes for table `page_views`
--
ALTER TABLE `page_views`
  ADD PRIMARY KEY (`pageview_id`),
  ADD KEY `idx_page_views_session_id` (`session_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `idx_products_brand` (`brand`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`image_id`);

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
  ADD PRIMARY KEY (`preference_id`);

--
-- Indexes for table `user_reviews`
--
ALTER TABLE `user_reviews`
  ADD PRIMARY KEY (`review_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_dashboard_stats`
--
ALTER TABLE `admin_dashboard_stats`
  MODIFY `stat_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `cart_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expert_reviews`
--
ALTER TABLE `expert_reviews`
  MODIFY `expert_review_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `order_detail_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `page_views`
--
ALTER TABLE `page_views`
  MODIFY `pageview_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `image_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `technical_specs`
--
ALTER TABLE `technical_specs`
  MODIFY `spec_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `traffic_analytics`
--
ALTER TABLE `traffic_analytics`
  MODIFY `analytics_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `preference_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_reviews`
--
ALTER TABLE `user_reviews`
  MODIFY `review_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `technical_specs`
--
ALTER TABLE `technical_specs`
  ADD CONSTRAINT `fk_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
