var inquirer = require('inquirer');
var Customer = require('./bamazonCustomer');
var Manager = require('./bamazonManager');

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
        var customer = new Customer();
        customer.begin();
        break;
      case "Manager":
        var manager = new Manager();
        manager.begin();
        break;
      case "Supervisor":
        console.log("\nSupervisor module under construction!");
        break;
      case "Exit":
        console.log("\nGoodbye!");
    };
  });