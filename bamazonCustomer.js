var Customer = function(){
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
      that.initial();
    });
  };
  // function asking the user what department's products he/she would like to display
  this.initial = function() {
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
              console.log(results);
              var dptArray = [];
              // checks to make sure there are departments in the database
              if (results.length === 0){
                dptArray.push("No Departments");
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
          if (answer.dept === "Exit" || answer.dept === "No Departments"){
            that.finish(answer.dept);
          } else {
            // otherwise calls the function to display the products in the selected department
            that.productDisplay(answer.dept);
          }
        });
    });
  };
  this.productDisplay = function(dept){
    // build the MySQL query based on whether "All" or a specific department was selected
    var query = "SELECT * FROM products";
    if (dept != "All"){
      query += ` WHERE department_name = "${dept}"`;
    };
    var that = this;
    this.connection.query(query, function(err, res) {
      if (err) throw err;
      // create a header array for the display table
      var headers = ["ID", "Product Name", "Price", "# Available"];
      var dataTable = [];
      // push the header array into the dataTable array
      dataTable.push(headers);
      // loop through the MySQL query results and create an array for each product and push that array into the dataTable array
      res.forEach(function(item, index) {
        var row = [];
        var formattedPrice = that.accounting.formatMoney(item.price);
        row.push(item.id, item.product_name, formattedPrice, item.stock_quantity);
        dataTable.push(row);
      });
      // creates and displays the resulting table
      var output = that.table.table(dataTable);
      console.log("\n" + output);
      // calls function select what the user wants to buy (the results from the select query are sent as an arguement)
      that.productToBuy(res);
    });
  };
  this.productToBuy = function(deptProducts){
    var that = this;
    this.inquirer
      .prompt([
        {
          name: "buy",
          type: "list",
          message: "Please select the Item you wish to purchase.",
          choices: function() {
            var prodArray = [];
            // pushes the option if none of the displayed items is wanted
            prodArray.push("None of these", new that.inquirer.Separator());
            // loop that goes through the arguement and displays all the products from the selected department
            for (var i = 0; i < deptProducts.length; i += 1) {
              prodArray.push(deptProducts[i].product_name);
            }
            // pushes the option to exit the application
            prodArray.push(new that.inquirer.Separator(), "Exit");
            return prodArray;
          }
        },
        {
          name: "quantity",
          type: "input",
          message: "How many would you like to purchase (Cancel will exit)?",
          default: "Cancel",
          // only askes this question if neither "None of these" nor "Exit" is selected
          when: function(sel){
            return sel.buy != "None of these" && sel.buy != "Exit";
          },
          // validates that the value entered is a number
          validate: function(value){
            if ((isNaN(parseFloat(value)) === false &&
                parseFloat(value) > 0 &&
                parseFloat(value) === parseInt(value)) || value.trim().toLowerCase() === "cancel"){
              return true;
            } else {
              console.log(that.chalk.red(" This value must be either 'Cancel' or a positive integer!"));
              return false;
            };
          }
        }
      ])
      .then(function(answer) {
        // calls the finish function if "None of these", "Exit", or "Cancel" was selected
        if (answer.buy === "None of these" || answer.buy === "Exit" || answer.quantity.trim().toLowerCase() === "cancel"){
          that.finish(answer.buy);
        } else {
          // creates variables to store the values from the selected item
          var availQty = 0;
          var unitPrice = 0;
          var productSales = 0;
          // loops through the results argument, finds the selected item, and sets the values from the selected item
          deptProducts.forEach(function(item){
            if (answer.buy === item.product_name){
              availQty = item.stock_quantity;
              unitPrice = item.price;
              productSales = item.product_sales
            };
          });
          // makes the quantity entered a number
          var ansQty = parseFloat(answer.quantity);
          // verifys that the requested quantity is less than the available quantity from the results argument
          if (ansQty < availQty){
            // sets the header for the purchase display
            var invoiceHeader = ["Product", "Qty Purchased", "Unit Price", "Total"];
            // creates and formats the data variables for the purchase display
            var formattedUnitPrice = that.accounting.formatMoney(unitPrice);
            var total = unitPrice * ansQty;
            var formattedTotal = that.accounting.formatMoney(total);
            // creates the array to hold the data variables for the purchase display
            var invoiceData = [answer.buy, ansQty, formattedUnitPrice, formattedTotal];
            // creates and displays the purchase display table
            var invoice = [];
            invoice.push(invoiceHeader, invoiceData);
            var invoiceTable = that.table.table(invoice);
            console.log("\n" + invoiceTable);
            // creates a string variable that will be sent to the database for evaluation
            var sql = `UPDATE ?? SET ?? = ?? - ${ansQty}, ?? = ?? + ${total} WHERE ?? = ?`
            // array variable containing the escapes
            var inserts = ['products', 'stock_quantity', 'stock_quantity', 'product_sales', 'product_sales', 'product_name', answer.buy];
            // update the sql variable with the escapes in the correct format
            sql = that.mysql.format(sql, inserts);
            // calls the function used to update the database using the sql variable as an argument
            that.updateProduct(sql);
          } else {
            // lets the user know if the quantity in the database was insufficient to fulfill the user's request and re-displays the products in the originally selected department
            console.log("There is insufficient quantity to fulfill that order.");
            that.productToBuy(deptProducts);
          };
        };
      });
  };
  this.updateProduct = function(str) {
    // updates the database with the information in the arguement object
    var query = this.connection.query(
      str, function(err, res) {
        if (err) throw err;
      }
    );
    var that = this;
    this.inquirer
      .prompt([
        {
          // askes the user if he/she wants to continue
          type: "confirm",
          message: "Would you like to continue shopping?",
          name: "continue",
          default: true
        }
      ])
      .then(function(res){
        // calls the finish function with the argument set depending on the user's answer
        if (res.continue === true){
          that.finish(res.continue);
        } else {
          that.finish("Exit");
        };
      });
  };
  this.finish = function(arg) {
    // exits the application if the passed argument is "Exit", otherwise the application starts over
    if (arg === "Exit"){
      this.connection.end();
    } else {
      this.initial();
    };
  };
};

module.exports = Customer;