-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 29, 2024 at 03:52 PM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hr`
--

-- --------------------------------------------------------

--
-- Table structure for table `contributions_and_taxes`
--

DROP TABLE IF EXISTS `contributions_and_taxes`;
CREATE TABLE IF NOT EXISTS `contributions_and_taxes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `contributions_and_taxes`
--

INSERT INTO `contributions_and_taxes` (`id`, `type`, `percentage`) VALUES
(1, 'Social Contribution', 2.00),
(2, 'Income Tax', 2.40);

-- --------------------------------------------------------

--
-- Table structure for table `departements`
--

DROP TABLE IF EXISTS `departements`;
CREATE TABLE IF NOT EXISTS `departements` (
  `d_id` int NOT NULL AUTO_INCREMENT,
  `dep_nom` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`d_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departements`
--

INSERT INTO `departements` (`d_id`, `dep_nom`) VALUES
(1, 'Marketing'),
(2, 'IT'),
(3, 'Research and Development'),
(4, 'Production'),
(5, 'Finance');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
CREATE TABLE IF NOT EXISTS `employees` (
  `e_id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `prenom` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `ppic` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '/img/profiles/default.png',
  `d_id` int NOT NULL,
  `suspended` tinyint(1) NOT NULL DEFAULT '0',
  `base_salary` decimal(10,2) NOT NULL DEFAULT '0.00',
  `experience_years` int NOT NULL DEFAULT '0',
  `zone_id` int NOT NULL,
  PRIMARY KEY (`e_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`e_id`, `nom`, `prenom`, `email`, `ppic`, `d_id`, `suspended`, `base_salary`, `experience_years`, `zone_id`) VALUES
(16, 'Aounallah', 'Amorabdelaziz', 'aounallahomarabdelaziz@gmail.com', '/img/profiles/default.png', 1, 0, 180000.00, 21, 1),
(17, 'Bouazza ', 'Abderrahmane', 'bouazzaabderrahmane@gmail.com', '/img/profiles/default.png', 4, 0, 80000.00, 10, 2),
(18, 'TOUKA ', 'SAKER', 'toukasaker@gmail.com', '/img/profiles/default.png', 3, 0, 79000.00, 8, 3);

-- --------------------------------------------------------

--
-- Table structure for table `experience_bonuses`
--

DROP TABLE IF EXISTS `experience_bonuses`;
CREATE TABLE IF NOT EXISTS `experience_bonuses` (
  `experience_years` int NOT NULL,
  `bonus_percentage` decimal(5,2) NOT NULL,
  PRIMARY KEY (`experience_years`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `experience_bonuses`
--

INSERT INTO `experience_bonuses` (`experience_years`, `bonus_percentage`) VALUES
(1, 5.00),
(2, 7.50),
(3, 10.00);

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reason` text,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `leave_type_id` (`leave_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `status`, `reason`) VALUES
(6, 17, 3, '2024-12-08', '2024-12-15', 'approved', '');

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

DROP TABLE IF EXISTS `leave_types`;
CREATE TABLE IF NOT EXISTS `leave_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(255) NOT NULL,
  `default_days` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`id`, `type_name`, `default_days`) VALUES
(1, 'Paid Leave', 20),
(2, 'Unpaid Leave', 0),
(3, 'Sick Leave', 10),
(4, 'Maternity Leave', 90),
(5, 'Paternity Leave', 15);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('4XIDau-vak72pr8xdSMbfhzbXAJ_c57w', 1732966787, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"user\":\"admin\"}'),
('7BhqfuPvYF-ZKytysK3qqTEvsGBBuViq', 1732966921, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"user\":\"admin\"}'),
('G9iO3pBIC5A_HglSS9adwfNjI3Pkg8YL', 1732900170, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"user\":\"admin\"}'),
('_Cp0JDipl5eVD2uAYD_9jXarFmZ5zHJ1', 1732965496, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"user\":\"admin\"}'),
('kU_UBH0GUY8oHPNbjZv02hW4PteZW5XZ', 1732896960, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"user\":\"admin\"}');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `uid` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `type` int NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`uid`, `username`, `password`, `type`) VALUES
(1, 'admin', 'admin', 1),
(2, 'user', 'user', 0);

-- --------------------------------------------------------

--
-- Table structure for table `zones`
--

DROP TABLE IF EXISTS `zones`;
CREATE TABLE IF NOT EXISTS `zones` (
  `zone_id` int NOT NULL AUTO_INCREMENT,
  `zone_name` varchar(255) NOT NULL,
  `bonus_value` decimal(10,2) NOT NULL,
  PRIMARY KEY (`zone_id`),
  KEY `idx_zone_id` (`zone_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `zones`
--

INSERT INTO `zones` (`zone_id`, `zone_name`, `bonus_value`) VALUES
(1, 'Zone A', 1000.00),
(2, 'Zone B', 1500.00),
(3, 'Zone C', 2000.00),
(4, 'Zone D', 2500.00),
(5, 'Zone E', 3000.00);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`e_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
