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
openLoginDialog.onclick = function () {
  dialogboxMsg.innerHTML = "";
  loginUsername.value = "shyam";
  loginPassword.value = "raman";
  dialog.show();
  loginUsername.focus();
};

closeLogin.onclick = () => dialog.close();
clearLogin.onclick = () => {
  loginUsername.value = "";
  loginPassword.value = "";
};
logoutBtn.onclick = () => {
  reset();
  localStorage.clear();
  greetingLabel.innerHTML = "logout successful";
};

submitLogin.onclick = function () {
  let userStr = loginUsername.value,
    passStr = btoa(loginPassword.value);
  // console.log(userStr + " " + passStr);
  if (userStr && passStr) {
    loginAttempt(userStr, passStr);
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
        // console.log(this.responseText + " successful login");
        // console.log("successful login");

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
        greetingLabel.innerHTML = "login successful";
      } else {
      //  console.log(this.responseText + " invalid credentials");
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
  while (workarea.firstChild) {
    workarea.removeChild(workarea.firstChild);
  }
  let navbar = document.getElementById("navbar");
  while (navbar.firstChild) {
    navbar.removeChild(navbar.firstChild);
  }
}

// login functions end.

let workarea = document.getElementById("workarea");
while (workarea.firstChild) {
  workarea.removeChild(workarea.firstChild);
}
let fieldsMeta = [];
let metadata = {
  project: {
    type: "project",
    endpoint: "/api/projects",
    "config-endpoint": "/api/config/cproject",
    parent: "none",
    parentType: "none",
  },
  module: {
    type: "module",
    endpoint: "/api/modules",
    "config-endpoint": "/api/config/cmodule",
    parent: "project_name",
    parentType: "project",
  },
  submodule: {
    type: "submodule",
    endpoint: "/api/submodules",
    "config-endpoint": "/api/config/csubmodule",
    parent: "module_name",
    parentType: "module",
  },
  task: {
    type: "task",
    endpoint: "/api/tasks",
    "config-endpoint": "/api/config/ctask",
    parent: "submodule_name",
    parentType: "submodule",
  },
  subtask: {
    type: "subtask",
    endpoint: "/api/subtasks",
    "config-endpoint": "/api/config/csubtask",
    parent: "task_name",
    parentType: "task",
  },
};
let sourceType = {};

let cproject = document.getElementById("cproject");
cproject.onclick = function () {
  sourceType = metadata["project"];
  formElementConfigLookup();
};

let cmodule = document.getElementById("cmodule");
cmodule.onclick = function () {
  sourceType = metadata["module"];
  formElementConfigLookup();
};
let csubmodule = document.getElementById("csubmodule");
csubmodule.onclick = function () {
  sourceType = metadata["submodule"];
  formElementConfigLookup();
};
let ctask = document.getElementById("ctask");
ctask.onclick = function () {
  sourceType = metadata["task"];
  formElementConfigLookup();
};
let csubtask = document.getElementById("csubtask");
csubtask.onclick = function () {
  sourceType = metadata["subtask"];
  formElementConfigLookup();
};

function formElementConfigLookup(editedObj) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", sourceType["config-endpoint"], true);
  xhttp.setRequestHeader(
    "x-access-token",
    localStorage.getItem("x-access-token")
  );
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        let data = JSON.parse(this.responseText);
        createForm(data, editedObj);
        fieldsMeta = data[0].data.fields;
      }
    }
  };
}

async function createForm(data, editedObj) {
  let divOuter = document.createElement("div");
  divOuter.classList.add("form");
  let fields = data[0].data.fields;
  for (let index = 0; index < fields.length; index++) {
    let elem = fields[index];
    // console.log(elem.name);
    // console.log(elem.type);
    // console.log(elem.label);
    // console.log(elem.values);
    let divEnclosing = document.createElement("div");
    let labelField = document.createElement("label");
    labelField.innerHTML = elem.label ? elem.label : elem.name;
    let inputField = null;
    if (elem.type == "String") {
      inputField = document.createElement("input");
      inputField.classList.add("anyinput");
      inputField.type = "text";
      inputField.name = elem.name;
      inputField.id = elem.name;
      inputField.placeholder = "enter " + elem.name;
    } else if (elem.type == "list") {
      inputField = document.createElement("select");
      inputField.id = elem.name;
      inputField.classList.add("anyinput");
      elem.values.forEach((val) => {
        let optionField = document.createElement("option");
        optionField.value = val;
        optionField.selected = false;
        optionField.innerHTML = val;
        inputField.appendChild(optionField);
      });
    } else if (elem.type == "dblist") {
      inputField = document.createElement("select");
      inputField.id = elem.name;
      inputField.classList.add("anyinput");
      let optionValues = [];
      let lookupListFn = async () => {
        let response = await fetch("/api/dblist", {
          method: "PUT",
          headers: {
            "x-access-token": localStorage.getItem("x-access-token"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(elem.values),
        });
        optionValues = await response.text();
      };
      await lookupListFn();
      optionValues = JSON.parse(optionValues);
      //console.log(optionValues);
      optionValues.forEach((option) => {
        let optionField = document.createElement("option");
        optionField.value = option._id;
        optionField.selected = false;
        optionField.innerHTML = option[sourceType["parent"]];
        inputField.appendChild(optionField);
      });
    } else {
      console.log("unrecognized type " + elem.type);
    }
    if (editedObj) {
      if (elem.type == "String" || elem.type == "list") {
        inputField.value = editedObj[elem.name];
      } else if (elem.type == "dblist") {
        //        console.log(editedObj);
        inputField.value = editedObj["parent"];
      }
    } else {
      if (elem.type == "String" && elem.name == "owner_name") {
        //console.log(localStorage.getItem("x-access-token"));
        let jwtToken = localStorage.getItem("x-access-token");
        let tokenBody = parseToken(jwtToken);
        inputField.value = tokenBody["user_id"];
      }
    }
    divEnclosing.appendChild(labelField);
    divEnclosing.appendChild(inputField);
    divOuter.appendChild(divEnclosing);
  }

  let submitBtn = document.createElement("input");
  divOuter.appendChild(submitBtn);
  submitBtn.type = "button";
  if (editedObj) {
    submitBtn.value = "update";
    submitBtn.onclick = function () {
      onFormUpdate(editedObj);
    };
  } else {
    submitBtn.value = "submit form";
    submitBtn.onclick = onFormSubmit;
  }

  while (workarea.firstChild) {
    workarea.removeChild(workarea.firstChild);
  }
  workarea.appendChild(divOuter);
}

function onFormUpdate(doc) {
  let editedObj = {};
  fieldsMeta.forEach((field) => {
    //    console.log(field.name);
    let elem = document.getElementById(field.name);
    if (
      field.type == "String" ||
      field.type == "list" ||
      field.type == "dblist"
    ) {
      editedObj[field.name] = elem.value;
    } else {
      console.log("unknown type " + field.type);
    }
  });
  var xhttp = new XMLHttpRequest();
  xhttp.open("PUT", sourceType["endpoint"] + "/" + doc["_id"], true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "x-access-token",
    localStorage.getItem("x-access-token")
  );
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        //console.log("after update");
        //console.log(this.responseText);
        populateNavBar();
        alert("updated");
        greetingLabel.innerHTML = "update complete";
      }
    }
  };
  xhttp.send(JSON.stringify(editedObj));
  while (workarea.firstChild) {
    workarea.removeChild(workarea.firstChild);
  }
}

function onFormSubmit() {
  let formDataObj = {};
  fieldsMeta.forEach((field) => {
    //console.log(field.name);
    let elem = document.getElementById(field.name);
    if (
      field.type == "String" ||
      field.type == "list" ||
      field.type == "dblist"
    ) {
      formDataObj[field.name] = elem.value;
    } else {
      console.log("unknown type " + field.type);
    }
  });

  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", sourceType["endpoint"], true);
  xhttp.setRequestHeader(
    "x-access-token",
    localStorage.getItem("x-access-token")
  );
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(formDataObj));
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        //console.log(this.responseText);
        greetingLabel.innerHTML = "create successful";
        populateNavBar();
      }
    }
  };
  while (workarea.firstChild) {
    workarea.removeChild(workarea.firstChild);
  }
}

function populateNavBar() {
  let navbar = document.getElementById("navbar");
  while (navbar.firstChild) {
    navbar.removeChild(navbar.firstChild);
  }
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/api/nav", true);
  xhttp.setRequestHeader(
    "x-access-token",
    localStorage.getItem("x-access-token")
  );
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        //console.log(this.responseText);
        let list = JSON.parse(this.responseText);
        list.forEach((project) => {
          let projectdiv = document.createElement("div");
          let projectlabel = document.createElement("label");
          projectlabel.innerHTML = project.project_name;
          projectlabel.onclick = () => {
            viewDocument("project", project._id);
          };
          projectlabel.classList.add("module");
          projectdiv.appendChild(projectlabel);
          projectdiv.classList.add("project");
          project.modules.forEach((module) => {
            let modulediv = document.createElement("div");
            let modulelabel = document.createElement("label");
            modulelabel.innerHTML = module.module_name;
            modulelabel.onclick = () => {
              viewDocument("module", module._id);
            };
            modulelabel.classList.add("module");
            modulediv.appendChild(modulelabel);
            modulediv.classList.add("module");
            project.submodules
              .filter((m) => m.parent == module._id)
              .forEach((submodule) => {
                let submodulediv = document.createElement("div");
                let submodulelabel = document.createElement("label");
                submodulelabel.innerHTML = submodule.submodule_name;
                submodulelabel.onclick = () => {
                  viewDocument("submodule", submodule._id);
                };
                submodulelabel.classList.add("submodule");
                submodulediv.appendChild(submodulelabel);
                submodulediv.classList.add("submodule");
                project.tasks
                  .filter((t) => t.parent == submodule._id)
                  .forEach((task) => {
                    let taskdiv = document.createElement("div");
                    let tasklabel = document.createElement("label");
                    tasklabel.innerHTML = task.task_name;
                    tasklabel.onclick = () => {
                      viewDocument("task", task._id);
                    };
                    tasklabel.classList.add("task");
                    taskdiv.appendChild(tasklabel);
                    taskdiv.classList.add("task");
                    project.subtasks
                      .filter((st) => st.parent == task._id)
                      .forEach((subtask) => {
                        let subtaskdiv = document.createElement("div");
                        let subtasklabel = document.createElement("label");
                        subtasklabel.innerHTML = subtask.subtask_name;
                        subtasklabel.onclick = () => {
                          viewDocument("subtask", subtask._id);
                        };
                        subtasklabel.classList.add("task");
                        subtaskdiv.appendChild(subtasklabel);
                        subtaskdiv.classList.add("subtask");
                        taskdiv.appendChild(subtaskdiv);
                      });
                    submodulediv.appendChild(taskdiv);
                  });
                modulediv.appendChild(submodulediv);
              });
            projectdiv.appendChild(modulediv);
          });
          navbar.appendChild(projectdiv);
        });
      }
    }
  };
  xhttp.send();
}

function viewDocument(type, id) {
  //console.log("type " + type + " id " + id);
  sourceType = metadata[type];
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", sourceType["endpoint"] + "/" + id, true);
  xhttp.setRequestHeader(
    "x-access-token",
    localStorage.getItem("x-access-token")
  );
  xhttp.setRequestHeader("Content-type", "application/json");

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        createDataTable(JSON.parse(this.responseText));
      }
    }
  };
  xhttp.send();
}

function displayName(value) {
  if(value.indexOf("_") == -1) return value[0].toUpperCase() + value.substring(1);
  return value.split("_").map(word => word[0].toUpperCase() + word.substring(1)).toString().replaceAll(","," ")
}

function createDataTable(doc) {
  let workarea = document.getElementById("workarea");
  let table = document.createElement("table");
  table.classList.add("table");

  let keys = Object.keys(doc);
  let keysToRemove = ["_id", "complete", "parentName", "parentRec", "parentId"];
  keysToRemove.forEach((key) => {
    let i = keys.indexOf(key);
    if (i != -1) {
      keys.splice(i, 1);
    }
  });
  for (let i = 0; i < keys.length; i++) {
    let tr = document.createElement("tr");
    let th = document.createElement("th");
    th.innerHTML = displayName(keys[i]);
    tr.appendChild(th);
    let td = document.createElement("td");
    if (keys[i] == "parent") {
      if (doc["parentRec"]) {
        td.innerHTML = doc["parentRec"][0][sourceType["parent"]];
      } else {
        td.innerHTML = "not defined";
      }
      td.classList.add("hover");
      td.onclick = () => {
        viewDocument(sourceType.parentType, doc["parentId"]);
      };
    } else {
      td.innerHTML = doc[keys[i]];
    }
    tr.appendChild(td);
    table.appendChild(tr);
  }
  let tr = document.createElement("tr");
  let th = document.createElement("th");
  th.innerHTML = "complete";
  tr.appendChild(th);
  let chk = document.createElement("td");
  let chkbox = document.createElement("input");
  chkbox.id = doc["_id"];
  chkbox.value = doc["_id"];
  chkbox.type = "checkbox";
  chkbox.checked = doc["complete"];
  chkbox.onchange = function() { doc["complete"] = chkbox.checked; onMarkComplete(doc); };
  chk.appendChild(chkbox);
  tr.appendChild(chk);
  table.appendChild(tr);
  while (workarea.firstChild) {
    workarea.removeChild(workarea.firstChild);
  }
  workarea.appendChild(table);
  let editBtn = document.createElement("button");
  editBtn.onclick = function () {
    //console.log("editing record with id " + doc["_id"]);
    while (workarea.firstChild) {
      workarea.removeChild(workarea.firstChild);
    }
    formElementConfigLookup(doc);
  };
  editBtn.innerText = "Edit " + sourceType["type"];
  workarea.appendChild(editBtn);

  let deleteBtn = document.createElement("button");
  deleteBtn.innerText = "Delete " + sourceType["type"];
  deleteBtn.onclick = function () {
    //console.log("deleting record with id " + doc["_id"]);
    let choice = confirm(
      "Are you sure you want to delete " +
        sourceType["type"] +
        " (" +
        doc[sourceType["type"] + "_name"] +
        ") ?"
    );
    if (choice) {
      var xhttp = new XMLHttpRequest();
      xhttp.open("DELETE", sourceType["endpoint"] + "/" + doc["_id"], true);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.setRequestHeader(
        "x-access-token",
        localStorage.getItem("x-access-token")
      );
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            alert("delete successful");
            while (workarea.firstChild) {
              workarea.removeChild(workarea.firstChild);
            }
            populateNavBar();
          } else if (this.status == 409) {
            // conflict
            let responseJson = JSON.parse(this.responseText);
            //console.log("after delete attempt");
            //console.log(responseJson);
            alert(
              "delete unsuccessful\n" + "reason: " + responseJson["reason"]
            );
          }
        }
      };
      xhttp.send();
    }
  };
  workarea.appendChild(deleteBtn);
}

function parseToken(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  //console.log(jsonPayload);
  return JSON.parse(jsonPayload);
}

function onMarkComplete(doc) {
  let chkbox = document.getElementById(doc["_id"]);
  let editedObj = {};
  editedObj["complete"] = doc["complete"];
  xhttp = new XMLHttpRequest();
  xhttp.open("PUT", sourceType["endpoint"] + "/" + doc["_id"], true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "x-access-token",
    localStorage.getItem("x-access-token")
  );
  xhttp.send(JSON.stringify(editedObj));
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        let responseJson = JSON.parse(this.responseText);
       // console.log("after update");
      //  console.log(responseJson);
        greetingLabel.innerHTML = "update successful";
      } else if (this.status == 409) {
        // conflict
        let responseJson = JSON.parse(this.responseText);
        // console.log("after update");
        // console.log(responseJson);
        alert(
          "unable to mark as 'complete'\n" +
            "reason: " + responseJson["reasons"]
        );
        
        chkbox.checked = false;
        greetingLabel.innerHTML = "update unsuccessful";
      }
    }
  };
}
