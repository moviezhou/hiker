EmployersCollection = new Meteor.Collection('Employers');
EmployeesCollection = new Meteor.Collection('Employees');
TransactionsCollection = new Meteor.Collection('Transactions');

Router.map(function(){
  this.route('home', {
    path: '/',
    template: 'employer',
    layoutTemplate: 'layout'
  });

  this.route('employee',{
    path: 'employee',
    template: 'employee',
    layoutTemplate: 'layout'
  });

  this.route('transaction',{
    path: 'transaction',
    template: 'transaction',
    layoutTemplate: 'layout'
  })
});

if (Meteor.isClient) {
  Template.employerView.title = function () {
    var title = "单位管理"
    return title;
  };

  // EmployerView

  Template.employerView.employer = function(){
    return EmployersCollection.find();
  }

  Template.employerView.selectedClass = function(){
    var employer_id = this._id;
    var selectedEmployer = Session.get('selectedEmployer');
    if(selectedEmployer === employer_id){
      return 'selected';
    }
  }

  Template.addEmployerForm.events({
    'submit form': function(theEvent, theTemplate){
      theEvent.preventDefault();
      var employerID = $('#employerID').val();
      var employerName = $('#employerName').val();
      
      EmployersCollection.insert({
        id: employerID,
        name: employerName
        });
    }
  });

  Template.employerView.events({
    'click tr.employer':function(){
      var employer_id = this._id;
      Session.set('selectedEmployer', employer_id);
    },
    'dblclick tr.employer': function(){
      Router.go('employee');
     }
  });

  // EmployeeView
  Template.employeeView.title = function () {
    var title = "职工管理";
    return title;
  }

  Template.employeeView.employer = function(){
    var employer_id = Session.get('selectedEmployer');
    var employer = EmployersCollection.findOne({_id: employer_id});
    if(employer){
      return employer.id + " " + employer.name; 
    } 
  }

  Template.employeeView.employee = function(){
    var employerID = Session.get('selectedEmployer');
    return EmployeesCollection.find({employerID: employerID});
  }

  Template.employeeView.selectedClass = function(){
    var employee_id = this._id;
    var selectedEmployee = Session.get('selectedEmployee');
    if(selectedEmployee === employee_id){
      return 'selected';
    }
  }

  Template.transactionForm.events({
    'change .selectMonth': function(){
      var selectedMonth = $('#month').val();
      Session.set('selectedMonth', selectedMonth);
    }
  });

  Template.transactionForm.selectedMonth = function(){
    return Session.get('selectedMonth');
  }

  Template.addEmployeeForm.events({
      'submit form': function(theEvent, theTemplate){
        theEvent.preventDefault();

        var employerID = Session.get('selectedEmployer');

        var employeeAccount = $('#employeeAccount').val();
        var employeeName = $('#employeeName').val();
        var employeeID = $('#employeeID').val();
        //console.log(employeeAccount, employeeName, employeeID); 

        EmployeesCollection.insert({
          account: employeeAccount,
          name: employeeName,
          id: employeeID,
          employerID: employerID 
        });
      }
    });

  Template.employeeView.events({
    'click tr.employee': function(){
      var employee_id = this._id;
      Session.set('selectedEmployee', employee_id);
    }, 
    'dblclick tr.employee': function(){
      Router.go('transaction');
    }
  });

  // TransactionView
  Template.transactionView.title = function(){
    var title = "职工明细账";
    return title;
  }


  Template.transactionView.employee = function(){
    var employee_id = Session.get('selectedEmployee');
    var employee = EmployeesCollection.findOne({_id: employee_id});
    if(employee){
      return employee.account + " " + employee.name; 
    } 
  }

  Template.transactionView.transactions = function(){
    var employeeID = Session.get('selectedEmployee');
    return TransactionsCollection.find(
      {employee: employeeID},
      {"employee": 0, "month": 0}
      );
  }

  Template.transactionView.selectedClass = function(){
    var transaction_id = this._id;
    var selectedTransaction = Session.get('selectedTransaction');
    if(selectedTransaction === transaction_id){
      return 'selected';
    }
  }

  Template.transactionForm.events({
    'submit form': function(theEvent, theTemplate){
      theEvent.preventDefault();
      var date = $('#date-input').val();
      var month = $('#month-input').val();

      var radios = new Array(theTemplate.find('#hj'),theTemplate.find('#bj'),theTemplate.find('#zq'),theTemplate.find('#jx'));
      
      var code = "";
      var category = "";

      for(var i=0; i<radios.length; i++){
        if(radios[i].checked === true){
          code = radios[i].value;
          break;
        }
      }

      switch(code){
        case "-1":
          category = "支取";
          break;
        case "0":
          category = "补缴";
          break;
        case "1":
          category = "汇缴";
          break;
        case "2":
          category = "结息";
          break;
      }

      var money = $('#money-input').val();

      var abstract = "";
      var income = 0.0;
      var defray = 0.0;

      if(code != "-1"){
        abstract = category + month + "月";
        income = money;
      }
      else{
        abstract = category;
        defray = money;
      }

      //console.log(abstract);


      var employeeID = Session.get('selectedEmployee');
      var balance = 0.0;

      TransactionsCollection.insert({
        employee: employeeID,
        date: date,
        month: month,
        abstract: abstract,
        income: income,
        defray: defray,
        balance: balance
      });
    }
  });

  Template.transactionView.events({
    'click tr.transaction': function(){
      var transaction_id = this._id;
      Session.set('selectedTransaction', transaction_id);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
