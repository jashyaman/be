let div1 = document.getElementById("logindiv");
let div2 = document.getElementById("appdiv");
let openLoginDialog = document.getElementById("logmein");
var dialog = document.getElementById("loginDialog");
let clearLogin = document.getElementById("clearLogin");
let submitLogin = document.getElementById("submitLogin");
let closeLogin = document.getElementById("closeLogin");
let logoutBtn = document.getElementById("logoutBtn");
let loginUsername = document.getElementById("username");
let loginPassword = document.getElementById("password");
let dialogboxMsg = document.getElementById("dialogboxMsg");
let greetingLabel = document.getElementById("greetingLbl");
div1.style.display = "block";
div2.style.display = "none";

var userOfApp = "";
openLoginDialog.onclick = function() {
    dialogboxMsg.innerHTML = "";
    loginUsername.value = "shyam";
    loginPassword.value = "raman";
    dialog.show();
    loginUsername.focus();
}

closeLogin.onclick = () => dialog.close();
clearLogin.onclick = () => { loginUsername.value = ""; loginPassword.value = ""; };
logoutBtn.onclick = () => { reset(); localStorage.clear(); };


submitLogin.onclick = function () {
    let userStr = loginUsername.value,
      passStr = btoa(loginPassword.value);
    console.log(userStr + " " + passStr);
    if (userStr && passStr) {
      loginAttempt(userStr, passStr)
    } else {
      dialogboxMsg.innerHTML = "Please enter credentials";
      loginUsername.focus();
    }
};

function loginAttempt(userStr, passStr) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4) {
        if (this.status == 200) {
          console.log(this.responseText + " successful login");
          console.log("successful login");
          
          localStorage.setItem(
            "x-access-token",
            JSON.parse(this.responseText).token
          );
          userOfApp = userStr;
          div1.style.display = "none";
          let greetStr = "hello " + userStr;
          greetingLabel.innerHTML = greetStr;
          div2.style.display = "block";
          dialog.close();
          populateNavBar();
        } else {
          console.log(this.responseText + " invalid credentials");
          dialogboxMsg.innerHTML = "Invalid credentials";
          loginUsername.value = "";
          loginPassword.value = "";
          loginUsername.focus();
        }
      } else {
        //console.log("authenticating... state:"+this.readyState);
      }
    };
    xhttp.open("PUT", "/api/login", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({ username: userStr, password: passStr }));
  }
  
function reset() {
    div1.style.display = "block";
    div2.style.display = "none";
    loginUsername.value = "";
    loginPassword.value = "";
    dialogboxMsg.innerHTML = "";
    userOfApp = "";
    taskName = "";
    greetingLabel.innerHTML = "";
    let workarea = document.getElementById("workarea");
    while(workarea.firstChild) {
      workarea.removeChild(workarea.firstChild);
    }
    let navbar = document.getElementById("navbar");
    while(navbar.firstChild) {
      navbar.removeChild(navbar.firstChild);
    }
  }

  // login functions end.
  
  let workarea = document.getElementById("workarea");
  while(workarea.firstChild) {
    workarea.removeChild(workarea.firstChild);
  }
  let fieldsMeta = [];
  let metadata = { 
  "project" : { "endpoint" : "/api/projects", "config-endpoint" : "/api/config/cproject", "parent":"none"},
  "module" : { "endpoint" : "/api/modules", "config-endpoint" : "/api/config/cmodule", "parent":"project_name" },
  "submodule" : { "endpoint" : "/api/submodules", "config-endpoint" : "/api/config/csubmodule", "parent":"module_name" },
  "task" : { "endpoint" : "/api/tasks", "config-endpoint" : "/api/config/ctask", "parent":"submodule_name" },
  "subtask" : { "endpoint" : "/api/subtasks", "config-endpoint" : "/api/config/csubtask", "parent":"task_name" } 
  }
  let sourceType = {};
  
  let cproject = document.getElementById("cproject");
  cproject.onclick = function() {
    sourceType = metadata["project"];
    formElementConfigLookup();
  }

  let cmodule = document.getElementById("cmodule");
  cmodule.onclick = function() {
    sourceType = metadata["module"];
    formElementConfigLookup();
  }
  let csubmodule = document.getElementById("csubmodule");
  csubmodule.onclick = function() {
    sourceType = metadata["submodule"];
    formElementConfigLookup();
  }
  let ctask = document.getElementById("ctask");
  ctask.onclick = function() {
    sourceType = metadata["task"];
    formElementConfigLookup();
  }
  let csubtask = document.getElementById("csubtask");
  csubtask.onclick = function() {
    sourceType = metadata["subtask"];
    formElementConfigLookup();
  }

  function formElementConfigLookup() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", sourceType["config-endpoint"], true);
    xhttp.setRequestHeader("x-access-token", localStorage.getItem("x-access-token"));
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 200) {
                let data = JSON.parse(this.responseText);
                createForm(data);
                fieldsMeta =  data[0].data.fields;
            }
        }
    }
  }

  async function createForm(data) {
      let divOuter = document.createElement("div");
      divOuter.classList.add("form");
      let fields = data[0].data.fields;
      for(let index = 0;index < fields.length;index++) {
        let elem = fields[index];
        // console.log(elem.name);
        // console.log(elem.type);
        // console.log(elem.label);
        // console.log(elem.values);        
        let divEnclosing = document.createElement("div");
        let labelField = document.createElement("label");
        labelField.innerHTML = elem.label ? elem.label : elem.name;
        let inputField = null;
        if(elem.type == "String") {
          inputField = document.createElement("input");
          inputField.classList.add("anyinput");
          inputField.type = "text";
          inputField.name = elem.name;
          inputField.id = elem.name;
          inputField.placeholder = "enter " + elem.name;
        } else if(elem.type == "list") {
          inputField = document.createElement("select");
          inputField.id = elem.name;
          inputField.classList.add("anyinput");
          elem.values.forEach(val => {
            let optionField = document.createElement("option");
            optionField.value = val;
            optionField.selected = false;
            optionField.innerHTML = val;
            inputField.appendChild(optionField);
          });
        } else if(elem.type == "dblist") {
          inputField = document.createElement("select");
          inputField.id = elem.name;
          inputField.classList.add("anyinput");
          let optionValues = [];
          let lookupListFn = async () => {
            let response = await fetch("/api/dblist", {
              method: "PUT",
              headers: {
                'x-access-token' : localStorage.getItem('x-access-token'),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(elem.values)
            });
            optionValues = await response.text();
          }
          await lookupListFn();
          optionValues = JSON.parse(optionValues);
          //console.log(optionValues);
          optionValues.forEach(option => {
            let optionField = document.createElement("option");
            optionField.value = option._id;
            optionField.selected = false;
            optionField.innerHTML = option[sourceType['parent']];
            inputField.appendChild(optionField);
          });
        } else {
          console.log("unrecognized type " + elem.type);
        }
        divEnclosing.appendChild(labelField);
        divEnclosing.appendChild(inputField);
        divOuter.appendChild(divEnclosing);
      }

      let submitBtn = document.createElement("input");
      submitBtn.value = "submit form";
      submitBtn.type = "button";
      submitBtn.onclick = onFormSubmit;
      divOuter.appendChild(submitBtn);
      while(workarea.firstChild) {
        workarea.removeChild(workarea.firstChild);
      }
      workarea.appendChild(divOuter);
  }

  function onFormSubmit() {
    let formDataObj = {};
    fieldsMeta.forEach(field => {
      console.log(field.name);
      let elem = document.getElementById(field.name);
      if(field.type == "String" || field.type == "list" || field.type == "dblist") {
        formDataObj[field.name] = elem.value
      } else {
        console.log("unknown type " + field.type);
      }
    })
    
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", sourceType["endpoint"], true);
    xhttp.setRequestHeader("x-access-token", localStorage.getItem("x-access-token"));
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(formDataObj));
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 200) {
                console.log(this.responseText);
                populateNavBar();
            }
        }
    }
    while(workarea.firstChild) {
      workarea.removeChild(workarea.firstChild);
    }
  }


  function populateNavBar() {
    let navbar = document.getElementById("navbar");
    while(navbar.firstChild) {
      navbar.removeChild(navbar.firstChild);
    }
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/api/nav", true);
    xhttp.setRequestHeader("x-access-token", localStorage.getItem("x-access-token"));
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 200) {
                //console.log(this.responseText);
                let list = JSON.parse(this.responseText);
                list.forEach(project => {
                  let projectdiv = document.createElement('div');
                  let projectlabel = document.createElement("label");
                  projectlabel.innerHTML = project.project_name;
                  projectlabel.onclick = () => { viewDocument("project", project._id) }
                  projectlabel.classList.add("module");
                  projectdiv.appendChild(projectlabel);
                  projectdiv.classList.add("project");
                  project.modules.forEach(module => {
                    let modulediv = document.createElement("div");
                    let modulelabel = document.createElement("label");
                    modulelabel.innerHTML = module.module_name;
                    modulelabel.onclick = () => { viewDocument("module", module._id) }
                    modulelabel.classList.add("module");
                    modulediv.appendChild(modulelabel);
                    modulediv.classList.add("module");
                    project.submodules
                    .filter(m => m.parent == module._id)
                    .forEach(submodule => {
                      let submodulediv = document.createElement("div");
                      let submodulelabel = document.createElement("label");
                      submodulelabel.innerHTML = submodule.submodule_name;
                      submodulelabel.onclick = () => { viewDocument("submodule", submodule._id) }
                      submodulelabel.classList.add("submodule");
                      submodulediv.appendChild(submodulelabel);
                      submodulediv.classList.add("submodule");
                      project.tasks
                      .filter(t => t.parent == submodule._id)
                      .forEach(task =>{
                         let taskdiv = document.createElement("div");
                         let tasklabel = document.createElement("label");
                         tasklabel.innerHTML = task.task_name;
                         tasklabel.onclick = () => { viewDocument("task", task._id) }
                         tasklabel.classList.add("task");
                         taskdiv.appendChild(tasklabel);
                         taskdiv.classList.add("task");
                          project.subtasks
                          .filter(st => st.parent == task._id)
                          .forEach(subtask =>{
                            let subtaskdiv = document.createElement("div");
                            let subtasklabel = document.createElement("label");
                            subtasklabel.innerHTML = subtask.subtask_name;
                            subtasklabel.onclick = () => { viewDocument("subtask", subtask._id) }
                            subtasklabel.classList.add("task");
                            subtaskdiv.appendChild(subtasklabel);
                            subtaskdiv.classList.add("subtask");
                            taskdiv.appendChild(subtaskdiv);
                          })
                         submodulediv.appendChild(taskdiv);
                       });
                      modulediv.appendChild(submodulediv);
                    });
                    projectdiv.appendChild(modulediv);
                  });
                  navbar.appendChild(projectdiv)
                });
            }
        }
    }
    xhttp.send();
  }

  function viewDocument(type, id) {
    console.log("type " + type + " id " + id);
  }