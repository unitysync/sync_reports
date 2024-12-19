CREATE TABLE `reports` (
  `reportId` INT PRIMARY KEY AUTO_INCREMENT,
  `target` INT,
  `report` TEXT NOT NULL,
  `player` INT NOT NULL,
  `playerName` VARCHAR(255) NOT NULL,
  `active` INT NOT NULL DEFAULT 1
);
