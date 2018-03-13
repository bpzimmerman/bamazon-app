var Supervisor = function(connection){
  // require the npm modules used in this application
  this.mysql = require("mysql");
  this.inquirer = require("inquirer");
  this.table = require("table");
  this.accounting = require("accounting");
  this.chalk = require("chalk");
  this.begin = function(){
    var that = this;
    connection.connect(function(err) {
      if (err) throw err;
      // run the initial function after the connection is made to prompt the user
      that.menu();
    });
  };
  this.menu = function(){
    var that = this;
    this.inquirer
      .prompt([
        {
          type: "list",
          message: "What would you like to do?",
          name: "action",
          choices: ["Product Sales by Department", "Add New Department", new that.inquirer.Separator(), "Exit"],
          default: "Product Sales by Department"
        }
      ])
      .then(function(response){
        switch(response.action){
          case "Product Sales by Department":
            that.viewSales();
            break;
          case "Add New Department":
            that.addDepartment();
            break;
          case "Exit":
            that.finish(response.action);
        };
      });
  };
  this.viewSales = function() {
    // builds query string to view the sales by department
    var queryStr = "SELECT departments.department, departments.overhead, SUM(products.product_sales) AS sales ";
    queryStr += "FROM departments LEFT JOIN products ON departments.department = products.department_name ";
    queryStr += "GROUP BY departments.department ORDER BY departments.department";
    var that = this;
    connection.query(queryStr, function(err, res) {
      // create a header array for the display table
      var headers = ["Department Name", "Overhead Costs", "Product Sales", "Total Profit"];
      // calls function to build and display the table
      that.tableDisplay(headers, res, that);
      // calls the initial function
      that.menu();
    });
  };
  this.tableDisplay = function(title, data, cxt){
    var dataTable = [];
    // push the header array into the dataTable array
    dataTable.push(title);
    // loop through the MySQL query results and create an array for each product and push that array into the dataTable array
    data.forEach(function(item, index) {
      var row = [];
      var formattedOverhead = cxt.accounting.formatMoney(item.overhead);
      var formattedSales = cxt.accounting.formatMoney(item.sales);
      var formattedProfit = cxt.accounting.formatMoney(item.sales - item.overhead);
      row.push(item.department, formattedOverhead, formattedSales, formattedProfit);
      dataTable.push(row);
    });
    // creates and displays the resulting table
    var output = cxt.table.table(dataTable);
    console.log("\n" + output);
  };
  this.addDepartment = function() {
    var that = this;
    connection.query("SELECT * FROM departments", function(err, results) {
      if (err) throw err;
      that.inquirer
        .prompt([
          {
            name: "dept",
            type: "input",
            message: "Please enter the name of the Department you wish to add (Cancel will exit).",
            default: "Cancel",
            validate: function(answer){
              var chkArray = [];
              results.forEach(function(item){
                chkArray.push(item.department);
              });
              if (answer.trim() === ""){
                console.log(that.chalk.red(" Something must be entered for this value (Cancel will exit)!"));
                return false;
              } else if (chkArray.indexOf(answer.trim()) != -1){
                console.log(that.chalk.red(" That department already exists (Cancel will exit)!"));
                return false;
              } else {
                return true;
              };
            }
          },
          {
            name: "overhead",
            type: "input",
            message: "Please enter the overhead costs for this department (Cancel will exit).",
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
              return sel.dept.trim().toLowerCase() != "cancel";
            }
          }
        ])
        .then(function(answer) {
          // calls the finish function if "Cancel" was selected
          if (answer.dept.trim().toLowerCase() === "cancel" || answer.overhead.trim().toLowerCase() === "cancel"){
            that.finish("Cancel");
          } else {
            // otherwise calls the function to display the products in the selected department
            that.insertDepartment(answer.dept, answer.overhead);
          }
        });
    });
  };
  this.insertDepartment = function(dept, over){
    var that = this;
    // update the database
    var insertQuery = connection.query(
      "INSERT INTO ?? SET ?",
      [
        "departments",
        {
          department: dept,
          overhead: over,
        }
      ],
      function(err, res) {
        if (err) throw err;
        console.log("\nDepartment added!\n");
        that.menu();
      }
    );
  };
  this.finish = function(arg) {
    // exits the application if the passed argument is "Exit", otherwise the application starts over
    if (arg === "Exit"){
      connection.end();
    } else {
      this.menu();
    };
  };
};

module.exports = Supervisor;