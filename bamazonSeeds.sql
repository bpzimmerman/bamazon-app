DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
  id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  stock_quantity INT DEFAULT 0,
  product_sales DECIMAL(10,2) DEFAULT 0.00,
  PRIMARY KEY (id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Nylabone", "Pet Supplies", 6.00, 100), ("Rubber Balls", "Pet Supplies", 7.95, 75), ("Feather Toy", "Pet Supplies", 10.95, 75), ("Catnip Toy", "Pet Supplies", 8.99, 125);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Into the Great Wide Open", "Music", 8.29, 200), ("Yield", "Music", 9.99, 150), ("American Idiot", "Music", 9.49, 225), ("...And Justice for All", "Music", 9.99, 125);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("The Dark Elf Trilogy", "Books", 39.99, 150), ("Stranger in Strange Land", "Books", 8.99, 175), (" A Clockwork Orange", "Books", 9.39, 120), ("Neuromancer", "Books", 7.95, 90);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("LG OLED55E7P", "Electronics", 2199.00, 50), ("Raspberry Pi", "Electronics", 35.95, 90), ("Moto G PLUS", "Electronics", 259.99, 75), ("Garmin Forerunner 935", "Electronics", 499.99, 60);