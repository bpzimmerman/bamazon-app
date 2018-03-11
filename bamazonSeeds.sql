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

CREATE TABLE departments(
  department VARCHAR(100) NOT NULL PRIMARY KEY,
  overhead DECIMAL(10,2) DEFAULT 0.00
);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Nylabone", "Pet Supplies", 6.00, 100, 5904.00), ("Rubber Balls", "Pet Supplies", 7.95, 75, 5191.35), ("Feather Toy", "Pet Supplies", 10.95, 75, 7686.90), ("Catnip Toy", "Pet Supplies", 8.99, 5, 4818.64);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Into the Great Wide Open", "Music", 8.29, 200, 2064.21), ("Yield", "Music", 9.99, 150, 2957.04), ("American Idiot", "Music", 9.49, 2, 3805.49), ("...And Justice for All", "Music", 9.99, 125, 2327.67);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("The Dark Elf Trilogy", "Books", 9.99, 150, 2747.25), ("Stranger in Strange Land", "Books", 8.99, 4, 3488.12), ("A Clockwork Orange", "Books", 9.39, 120, 2507.13), ("Neuromancer", "Books", 7.95, 90, 2774.55);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("LG OLED55E7P", "Electronics", 2199.00, 3, 8796.00), ("Raspberry Pi", "Electronics", 35.95, 90, 1006.60), ("Moto G PLUS", "Electronics", 259.99, 75, 4159.84), ("Garmin Forerunner 935", "Electronics", 499.99, 60, 5499.89);

INSERT INTO departments (department, overhead)
VALUES ("Pet Supplies", 15000.00), ("Music", 10000.00), ("Books", 12000.00), ("Electronics", 20000.00);