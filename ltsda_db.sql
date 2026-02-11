-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 11, 2026 at 04:14 AM
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
-- Database: `ltsda_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` int(11) NOT NULL,
  `member_code` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `civil_status` enum('Single','Married','Widow/er','Separated') DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `birthplace` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `address_street` varchar(255) DEFAULT NULL,
  `barangay` varchar(100) DEFAULT NULL,
  `town_city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `phone_no` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `educational_level` varchar(100) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `former_religion` varchar(100) DEFAULT NULL,
  `hobbies_gifts` text DEFAULT NULL,
  `spouse_name` varchar(100) DEFAULT NULL,
  `conversion_method` varchar(100) DEFAULT NULL,
  `baptism_date` date DEFAULT NULL,
  `officiating_minister` varchar(255) DEFAULT NULL,
  `rebaptism_date` date DEFAULT NULL,
  `rebaptism_minister` varchar(100) DEFAULT NULL,
  `rebaptism_place` varchar(100) DEFAULT NULL,
  `received_by` varchar(50) DEFAULT NULL,
  `date_received` date DEFAULT NULL,
  `from_church` varchar(100) DEFAULT NULL,
  `place_of_baptism` varchar(255) DEFAULT NULL,
  `date_received_letter` date DEFAULT NULL,
  `from_church_group` varchar(255) DEFAULT NULL,
  `date_transferred_letter` date DEFAULT NULL,
  `to_church_group` varchar(255) DEFAULT NULL,
  `observation` text DEFAULT NULL,
  `exclusion_type` varchar(50) DEFAULT NULL,
  `exclusion_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `member_code`, `status`, `full_name`, `profile_pic`, `gender`, `civil_status`, `birth_date`, `birthplace`, `mother_name`, `father_name`, `address_street`, `barangay`, `town_city`, `province`, `zip_code`, `phone_no`, `email`, `educational_level`, `occupation`, `former_religion`, `hobbies_gifts`, `spouse_name`, `conversion_method`, `baptism_date`, `officiating_minister`, `rebaptism_date`, `rebaptism_minister`, `rebaptism_place`, `received_by`, `date_received`, `from_church`, `place_of_baptism`, `date_received_letter`, `from_church_group`, `date_transferred_letter`, `to_church_group`, `observation`, `exclusion_type`, `exclusion_date`, `created_at`) VALUES
(1, '', 'Active', 'Leano, Karlo Jim F.', NULL, 'Male', 'Single', '2000-05-12', 'Benguet General Hospital', 'Michellyn Diego', 'Joseph Diego', 'Block 21 Lot 14', 'Taddiangan', 'Tuba', 'Benguet', '2603', '09503245002', '', 'College', 'Student', 'Roman Catholic', 'Music', NULL, NULL, '2010-12-12', 'Pr. ', NULL, '', '', 'Baptism', '2010-02-12', '', 'Piraso', NULL, NULL, NULL, NULL, 'None', NULL, NULL, '2026-02-11 01:46:34'),
(2, '', 'Active', 'Joshua Sean Diego', NULL, 'Male', 'Single', '2003-08-03', 'La Trinidad', 'Michellyn Diego', 'Joseph Diego', 'A-67', NULL, NULL, NULL, NULL, '0987654321', '', 'Senior High School', 'Student', 'Roman Catholic', '', NULL, NULL, '2010-03-03', 'Pr.', NULL, '', '', 'Baptism', NULL, NULL, 'La Trinidad Benguet', NULL, NULL, NULL, NULL, '', NULL, NULL, '2026-02-11 02:08:01');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role` enum('admin','clerk') DEFAULT 'clerk',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `role`, `created_at`) VALUES
(1, 'clerk_admin', 'password123', 'LTSDA Clerk', 'admin', '2026-02-11 00:52:06'),
(2, 'admin', 'password123', 'Head Clerk', 'admin', '2026-02-11 01:18:36');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
