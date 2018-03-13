# bamazon-app

### Overview

This is a node.js command line application utilizing mySQL to store data related product inventory. The mySQL database will sotre products for sale with the sale price. It will also store the dollar amount of sales for each product. It also has functions to allow replentishment of invenotry, adding new products and departments, and displaying the sales by department.

[Watch the demo](bamazon_demo.mp4)

### Before you Begin

1. In the terminal command line, go to the directory where you installed the files and type `npm install` (no quotes).  This should install the required npm packages.

2. Open the MAMP application and verify that both the Apache and MySQL servers are running.

3. Open the application of choice to create a mySQL database (e.g. MySQL Workbench) and open an existing connection (or create a new one if needed).

4. Copy all the information in the `bamazonSeeds.sql` file and paste it into the new query field.

5. Execute the entire script to create the database and seed it with initial data.

6. At the top of the index.js file the connection to the database is created. Verify the values for `port`, `user`, and `password` correspond to you specific settings.

### Running the app

1. In the terminal command line, go to the directory where you installed the files and type `node index.js` (no quotes).

That's It! The app will ask you questions to get the input it needs to provide you with the requested information or perform the requested functions.