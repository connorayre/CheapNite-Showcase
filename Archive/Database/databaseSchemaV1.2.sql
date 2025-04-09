-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: CheapNite
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `restaurant_deals`
--

DROP TABLE IF EXISTS `restaurant_deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_deals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `restaurant_name` varchar(100) NOT NULL,
  `deal_title` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `deal_description` varchar(250) DEFAULT NULL,
  `terms_and_conditions` varchar(250) DEFAULT NULL,
  `image_url` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_deals`
--

LOCK TABLES `restaurant_deals` WRITE;
/*!40000 ALTER TABLE `restaurant_deals` DISABLE KEYS */;
INSERT INTO `restaurant_deals` VALUES (1,'Restaurant@email.com','Cons doghouse','Wings','Wild wings','2023-06-22','2023-06-30','Wings','Wings','https://firebasestorage.googleapis.com/v0/b/cheapnite.appspot.com/o/images%2Fwings?alt=media&token=856f2246-6565-4d63-aa44-01a397ffd5ba'),(2,'Restaurant@email.com','Cons doghouse','Wild wing night','Judes','2023-06-18','2023-06-30','Free wings for all','Terms is you get free wings','https://firebasestorage.googleapis.com/v0/b/cheapnite.appspot.com/o/images%2Frestaurant_email_com_wild_wing_night_1687016976206?alt=media&token=97cadaea-b7ef-48bd-b376-f46d13258a93'),(3,'Restaurant@email.com','Cons doghouse','Crazy deal!','Montanas','2023-06-18','2023-06-24','The description!','Terms!!','https://firebasestorage.googleapis.com/v0/b/cheapnite.appspot.com/o/images%2Frestaurant_email_com_crazy_deal__1687018973826?alt=media&token=8779fe23-dc38-45ca-9c44-7db9a6f85372'),(4,'Restaurant@email.com','Cons doghouse','New deal','Location','2023-06-18','2023-06-30','Dessdi','Terms','https://firebasestorage.googleapis.com/v0/b/cheapnite.appspot.com/o/images%2Frestaurant_email_com_new_deal_1687019330935?alt=media&token=c85bdb40-8fdf-4873-baca-ab9a40cd709b'),(5,'Restaurant@email.com','Cons doghouse','Test','Test','2023-06-21','2023-06-29','Deal','Terms','https://firebasestorage.googleapis.com/v0/b/cheapnite.appspot.com/o/images%2Frestaurant_email_com_test_1687019618145?alt=media&token=46a12ba1-d8e0-412d-824b-55b1cd0573ee'),(6,'Restaurant@email.com','Cons doghouse','Crazy unreal deal','Locccy','2023-06-18','2023-06-28','Description','Terms','https://firebasestorage.googleapis.com/v0/b/cheapnite.appspot.com/o/images%2Frestaurant_email_com_crazy_unreal_deal_1687020372151?alt=media&token=37913c6b-5248-4c42-91e7-cbb64f40044f'),(7,'deliciousdiner@example.com','Delicious Diner','Half-off appetizers','123 Main St','2023-07-01','2023-07-31','Get 50% off appetizers during the month of July.','Dine-in only.','https://via.placeholder.com/200'),(8,'spicyspot@example.com','Spicy Spot','Buy one get one free','456 Oak St','2023-08-01','2023-08-31','Buy one meal, get one of equal or lesser value free.','Takeout only.','https://via.placeholder.com/200'),(9,'veganvillage@example.com','Vegan Village','Free dessert with meal','789 Pine St','2023-09-01','2023-09-30','Get a free dessert with any meal purchase.','Dine-in only.','https://via.placeholder.com/200'),(10,'pizzaplace@example.com','Pizza Place','10% off any pizza','012 Elm St','2023-10-01','2023-10-31','Take 10% off any pizza during the month of October.','Delivery only.','https://via.placeholder.com/200'),(11,'burgerbar@example.com','Burger Bar','Free fries with burger','345 Maple St','2023-11-01','2023-11-30','Get a free order of fries with any burger purchase.','Dine-in only.','https://via.placeholder.com/200');
/*!40000 ALTER TABLE `restaurant_deals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurantName` varchar(30) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(256) NOT NULL,
  `phoneNumber` varchar(10) NOT NULL,
  `relationship` varchar(30) NOT NULL,
  `type` int NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `restaurants_chk_1` CHECK ((`type` in (0,1,2)))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (1,'Cons doghouse','Restaurant@email.com','$2b$10$yzq6H4XMZf47KUpBENIqAeCMx5DlVDS0TKqtIBnOUGvZ6pI7JDnNi','8196457693','Owner',1,1),(2,'Delicious Diner','deliciousdiner@example.com','bcrypt_hash1','1234567890','franchise',1,1),(3,'Spicy Spot','spicyspot@example.com','bcrypt_hash2','4567890123','independent',1,1),(4,'Vegan Village','veganvillage@example.com','bcrypt_hash3','7890123456','chain',1,1),(5,'Pizza Place','pizzaplace@example.com','bcrypt_hash4','0123456789','franchise',1,1),(6,'Burger Bar','burgerbar@example.com','bcrypt_hash5','3456789012','independent',1,1);
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `type` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  CONSTRAINT `users_chk_1` CHECK ((`type` in (0,1,2)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'$2b$10$cTpiVB0kRVzjQILQejTrE.oFkB1oHSfZl.kY53Yshu6lNHtmqwLR6','Connor@ayre.com','8196357693',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-06-17 14:47:30
