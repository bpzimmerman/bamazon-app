var Manager = function(){
  // require the npm modules used in this application
  this.mysql = require("mysql");
  this.inquirer = require("inquirer");
  this.table = require("table");
  this.accounting = require("accounting");
  this.chalk = require("chalk");
  // create the connection information for the sql database
  this.connection = this.mysql.createConnection({
    host: "localhost",
    // the default port is 3306 - may need to change this for your machine
    port: 3307,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
  });
  this.begin = function(){
    var that = this;
    this.connection.connect(function(err) {
      if (err) throw err;
      // run the initial function after the connection is made to prompt the user
      that.menu();
    });
  };
  // initial function that prompts the user for what he/she wants to do
  this.menu = function(){
    var that = this;
    this.inquirer
      .prompt([
        {
          type: "list",
          message: "What would you like to do?",
          name: "action",
          choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Remove Product", new that.inquirer.Separator(), "Exit"],
          default: "View Products for Sale"
        }
      ])
      .then(function(response){
        switch(response.action){
          case "View Products for Sale":
            that.viewDepartments();
            break;
          case "View Low Inventory":
            that.viewLow();
            break;
          case "Add to Inventory":
            that.addInventory();
            break;
          case "Add New Product":
            that.addProduct();
            break;
          case "Remove Product":
            that.removeProduct();
            break;
          case "Exit":
            that.finish(response.action);
        };
      });
  };
  // function to prompt the user for the department's he/she wants to display
  this.viewDepartments = function(){
    var that = this;
    this.connection.query("SELECT * FROM departments", function(err, results) {
      if (err) throw err;
      that.inquirer
        .prompt([
          {
            name: "dept",
            type: "list",
            message: "What department's products would you like to display?",
            choices: function() {
              var dptArray = [];
              // checks to make sure there are products in the database
              if (results.length === 0){
                dptArray.push("No Products");
              } else {
                // pushes an option to display all the products in the database
                dptArray.push("All", new that.inquirer.Separator());
                // loop that puts the departments in an array
                for (var i = 0; i < results.length; i += 1) {
                    dptArray.push(results[i].department);
                }
              };
              // pushes an option to exit the application
              dptArray.push(new that.inquirer.Separator(), "Exit");
              return dptArray;
            }
          }
        ])
        .then(function(answer) {
          // calls the finish function if "Exit" or "No Products" were selected
          if (answer.dept === "Exit" || answer.dept === "No Products"){
            that.finish(answer.dept);
          } else {
            // otherwise calls the function to display the products in the selected department
            that.productDisplay(answer.dept);
          }
        });
    });
  };
  this.tableDisplay = function(title, data, cxt){
    var dataTable = [];
    // push the header array into the dataTable array
    dataTable.push(title);
    // loop through the MySQL query results and create an array for each product and push that array into the dataTable array
    data.forEach(function(item, index) {
      var row = [];
      var formattedPrice = cxt.accounting.formatMoney(item.price);
      row.push(item.id, item.product_name, item.department_name, formattedPrice, item.stock_quantity);
      dataTable.push(row);
    });
    // creates and displays the resulting table
    var output = cxt.table.table(dataTable);
    console.log("\n" + output);
  };
  this.productDisplay = function(dept){
    // build the MySQL query based on whether "All" or a specific department was selected
    var query = "SELECT * FROM products";
    if (dept != "All"){
      query += ` WHERE department_name = "${dept}"`;
    };
    query += " ORDER BY department_name, id";
    var that = this;
    this.connection.query(query, function(err, res) {
      if (err) throw err;
      // create a header array for the display table
      var headers = ["ID", "Product Name", "Department", "Price", "# Available"];
      // calls function to build and display the table
      that.tableDisplay(headers, res, that);
      // calls function select what the user wants to buy (the results from the select query are sent as an arguement)
      that.menu();
    });
  };
  this.viewLow = function() {
    // build the MySQL query to get the products where the inventory is less than or equal to 5
    var query = "SELECT * FROM ?? WHERE ?? <= ?";
    var inserts = ["products", "stock_quantity", 5];
    query = this.mysql.format(query, inserts);
    var that = this;
    this.connection.query(query, function(err, res) {
      if (err) throw err;
      // create a header array for the display table
      var headers = ["ID", "Product Name", "Department", "Price", "# Available"];
      // calls function to build and display the table
      that.tableDisplay(headers, res, that);
      // calls initial function
      that.menu();
    });
  };
  // function to add inventory to an existing product
  this.addInventory = function(){
    var that = this;
    this.connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;
      that.inquirer
        .prompt([
          {
            name: "prodId",
            type: "input",
            message: "Please enter the ID of the Item whose quantity you want to increase (Cancel will exit).",
            default: "Cancel",
            validate: function(value){
              var chkArray = [];
              results.forEach(function(item){
                chkArray.push(item.id);
              });
              if (chkArray.indexOf(parseFloat(value)) != -1 || value.trim().toLowerCase() === "cancel"){
                return true;
              } else {
                console.log(that.chalk.red(" That ID does not exist (Cancel will exit)!"));
                return false;
              };
            }
          },
          {
            name: "qtyIncrease",
            type: "input",
            message: "How much inventory would you like to add (Cancel will exit)?",
            default: "Cancel",
            validate: function(value){
              if ((isNaN(parseFloat(value)) === false &&
                  parseFloat(value) > 0 &&
                  parseFloat(value) === parseInt(value)) ||
                  value.trim().toLowerCase() === "cancel"){
                return true;
              } else {
                console.log(that.chalk.red(" This value must be a positive integer (Cancel will exit)!"));
                return false;
              };
            },
            when: function(ans){
              return ans.prodId.trim().toLowerCase() != "cancel";
            }
          }
        ]).then(function(answer){
          // check if the user entered cancel
          if (answer.prodId.trim().toLowerCase() === "cancel" || answer.qtyIncrease.trim().toLowerCase() === "cancel"){
            that.finish("cancel");
          } else {
            // makes the quantity entered a number
            var ansQty = parseFloat(answer.qtyIncrease);
            // runs the function to update the database
            that.updateInventory(answer.prodId, ansQty);
          };
        });
    });
  };
  this.updateInventory = function(itemId, updateQty){
    // builds the update query string
    var queryStr = `UPDATE ?? SET ?? = ?? + ${updateQty} WHERE ?? = ?`;
    // array variable containing the escapes
    var inserts = ['products', 'stock_quantity', 'stock_quantity', 'id', itemId];
    // update the query variable with the escapes in the correct format
    queryStr = this.mysql.format(queryStr, inserts);
    // update the database
    var updateQuery = this.connection.query(
      queryStr, function(err, res) {
        if (err) throw err;
      }
    );
    // builds the select query string
    var selQueryStr = "SELECT ??, ?? FROM ?? WHERE ?? = ?";
    // array variable containing the escapes
    var selInserts = ['stock_quantity', 'product_name', 'products', 'id', itemId];
    // update the query variable with the escapes in the correct format
    selQueryStr = this.mysql.format(selQueryStr, selInserts);
    var that = this;
    // retreives the information from the database
    this.connection.query(selQueryStr, function(err, results) {
      if (err) throw err;
      var increaseHeader = ["ID", "Item Name", "Qty Added", "Stocked Qty"];
      // creates and formats the data variables for the update display
      var increaseData = [itemId, results[0].product_name, updateQty, results[0].stock_quantity];
      // creates and displays the update display table
      var increaseArray = [];
      increaseArray.push(increaseHeader, increaseData);
      var increaseTable = that.table.table(increaseArray);
      console.log("\n" + increaseTable);
      // calls the initial function
      that.menu();
    });
  };
  // function to add a new product
  this.addProduct = function(){
    var that = this;
    this.connection.query("SELECT * FROM departments", function(err, results) {
      if (err) throw err;
      that.inquirer
        .prompt([
          {
            name: "item",
            type: "input",
            message: "Please enter the name of the Item you wish to add (Cancel will exit).",
            default: "Cancel",
            validate: function(answer){
              if (answer.trim() === ""){
                console.log(that.chalk.red(" Something must be entered for this value (Cancel will exit)!"));
                return false;
              } else {
                return true;
              };
            }
          },
          {
            name: "dept",
            type: "list",
            message: "Please select the department where you want to add this product.",
            choices: function() {
              var dptArray = [];
              // checks to make sure there are products in the database
              if (results.length === 0){
                dptArray.push("No Products");
              } else {
                // loop that puts the departments in an array
                for (var i = 0; i < results.length; i += 1) {
                    dptArray.push(results[i].department);
                }
              };
              // pushes an option to cancel
              dptArray.push(new that.inquirer.Separator(), "Cancel");
              return dptArray;
            },
            when: function(sel){
              return sel.item.trim().toLowerCase() != "cancel";
            }
          },
          {
            name: "price",
            type: "input",
            message: "Please enter a price for the new Item.",
            default: "Cancel",
            validate: function(answer){
              if ((isNaN(parseFloat(answer)) === false &&
                  parseFloat(answer) >= 0) || answer.trim().toLowerCase() === "cancel"){
                return true;
              } else {
                console.log(that.chalk.red(" This value must be either 'Cancel' or a non-negative number!"));
                return false;
              };
            },
            when: function(sel){
              return sel.item.trim().toLowerCase() != "cancel" && sel.dept != "Cancel" && sel.dept != "No Products";
            }
          }
        ])
        .then(function(answer) {
          // calls the finish function if "Cancel" or "No Products" were selected
          if (answer.dept === "Cancel" || answer.dept === "No Products" || answer.item.trim().toLowerCase() === "cancel" || answer.price.trim().toLowerCase() === "cancel"){
            that.finish(answer.dept);
          } else {
            // otherwise calls the function to display the products in the selected department
            that.insertProduct(answer.item, answer.dept, answer.price);
          }
        });
    });
  };
  this.insertProduct = function(prod, dept, amt){
    var that = this;
    // update the database
    var insertQuery = this.connection.query(
      "INSERT INTO ?? SET ?",
      [
        "products",
        {
          product_name: prod,
          department_name: dept,
          price: amt
        }
      ],
      function(err, res) {
        if (err) throw err;
        console.log("\nProduct added!\n");
        that.menu();
      }
    );
  };
  // function to prompt the user for the item to be deleted
  this.removeProduct = function(){
    var that = this;
    this.connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;
      that.inquirer
        .prompt([
          {
            name: "remId",
            type: "input",
            message: "Please enter the ID of the Item that you want to remove (Cancel will exit).",
            default: "Cancel",
            validate: function(value){
              // puts the item ids from the database into an array
              var chkArray = [];
              results.forEach(function(item){
                chkArray.push(item.id);
              });
              // checks the value entered versus the item id array to make sure the id entered exists
              if (chkArray.indexOf(parseFloat(value)) != -1 || value.trim().toLowerCase() === "cancel"){
                return true;
              } else {
                console.log(that.chalk.red(" That ID does not exist!"));
                return false;
              };
            }
          }
        ]).then(function(answer){
          if (answer.remId.trim().toLowerCase() === "cancel"){
            // runs the function to exit
            that.finish(answer.remId);
          } else {
            // runs the function to delete the product from the database
            that.deleteProduct(answer.remId);
          };
        });
    });
  };
  // function to delete a product
  this.deleteProduct = function(delId){
    var that = this;
    this.connection.query(
      "DELETE FROM ?? WHERE ?",
      [
        "products",
        {
          id: delId
        }
      ],
      function(err, res) {
        console.log(`\nProduct ID: ${delId} removed!\n`);
        // call the initial function
        that.menu();
      }
    );
  };
  this.finish = function(arg) {
    // exits the application if the passed argument is "Exit", otherwise the application starts over
    if (arg === "Exit"){
      this.connection.end();
    } else {
      this.menu();
    };
  };
};

module.exports = Manager;