var inquirer = require('inquirer');
var mysql = require('mysql');
var Customer = require('./bamazonCustomer');
var Manager = require('./bamazonManager');
var Supervisor = require('./bamazonSupervisor');

// create the connection information for the sql database
connection = mysql.createConnection({
  host: "localhost",
  // the default port is 3306 - may need to change this for your machine
  port: 3307,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

inquirer
  .prompt([
    {
      type: "list",
      message: "What module would you like to run?",
      name: "module",
      choices: ["Customer", "Manager", "Supervisor", new inquirer.Separator(), "Exit"],
      default: "Customer"
    }
  ])
  .then(function(response){
    switch(response.module){
      case "Customer":
        var customer = new Customer(connection);
        customer.begin();
        break;
      case "Manager":
        var manager = new Manager(connection);
        manager.begin();
        break;
      case "Supervisor":
        var supervisor = new Supervisor(connection);
        supervisor.begin();
        break;
      case "Exit":
        console.log("\nGoodbye!");
    };
  });