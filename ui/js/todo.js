let div1 = document.getElementById("determineuser");
let determinUserBtn = document.getElementById("determineUsername");

let div2 = document.getElementById("addtodos");
let taskName = document.getElementById("taskname");
let addTaskBtn = document.getElementById("addTask");

let greetingLabel = document.getElementById("greetingLbl");
let statusMessage = document.getElementById("statusLbl");

let todoTable = document.getElementById("todotable");
var dialog = document.getElementById("loginDialog");

let clearLogin = document.getElementById("clearLogin");
let submitLogin = document.getElementById("submitLogin");

let loginUsername = document.getElementById("username1");
let loginPassword = document.getElementById("password");

let closeLogin = document.getElementById("closeLogin");

let logoutBtn = document.getElementById("logoutBtn");
let dialogboxMsg = document.getElementById("dialogboxMsg");

div1.style.display = "block";
div2.style.display = "none";
var userOfApp = "";
todoTable.style.display = "none";
determinUserBtn.onclick = function () {
  dialogboxMsg.innerHTML = "";
  loginUsername.value = "";
  loginPassword.value = "";
  dialog.show();
  loginUsername.focus();
};

addTaskBtn.onclick = function () {
  if (taskName.value) {
    if (userOfApp) {
      submitTask(userOfApp, taskName.value);
      taskName.value = "";
    } else {
      alert("error: username was not recorded. resetting");
      reset();
    }
  } else {
    alert("enter task name (mandatory)");
    taskName.focus();
  }
};

function reset() {
  div1.style.display = "block";
  div2.style.display = "none";
  loginUsername.value = "";
  loginPassword.value = "";
  dialogboxMsg.innerHTML = "";
  userOfApp = "";
  taskName = "";
  greetingLabel.innerHTML = "";
  todoTable.style.display = "none";
}

function submitTask(uname, taskname) {
  console.log(uname);
  console.log(taskname);
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = onsubmitTaskCompleteFn;
  xhttp.open("POST", "http://localhost:3000/api/todo", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "x-access-token",
    localStorage.getItem("x-access-token")
  );
  xhttp.send('{ "uname" : "' + uname + '" , "taskname": "' + taskname + '"}');
}

function onsubmitTaskCompleteFn() {
  if (this.readyState == 4 && this.status == 200) {
    statusLbl.innerHTML = this.responseText;
    loadTodos();
  }
}

function loadTodos() {
  if (userOfApp) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            statusLbl.innerHTML = this.responseText;
            try {
              let jsonArr = JSON.parse(this.responseText);
              if (jsonArr.length == 0) {
                statusLbl.innerHTML = "No task entries for user";
                todoTable.style.display = "none";
              } else {
                todoTable.style.display = "block";
              }
              const table1 = document.createElement("table");
              let hdrRow = document.createElement("tr");
              let hdrList = ["id", "uname", "taskname", "status", "delete"];
              hdrList.forEach((elem) => {
                let hdrcell = document.createElement("th");
                hdrcell.innerText = elem;
                hdrRow.appendChild(hdrcell);
              });
              table1.appendChild(hdrRow);
              for (let index = 0; index < jsonArr.length; index++) {
                let dataRow = document.createElement("tr");
                let eachTask = jsonArr[index];
                let idCell = document.createElement("td");
                idCell.innerText = index + 1;
                dataRow.appendChild(idCell);
                let unameCell = document.createElement("td");
                unameCell.innerText = eachTask["uname"];
                dataRow.appendChild(unameCell);
                let tasknameCell = document.createElement("td");
                tasknameCell.innerText = eachTask["taskname"];
                dataRow.appendChild(tasknameCell);
                let statusCell = document.createElement("td");
                let statusCheckbox = document.createElement("input");
                statusCheckbox.setAttribute("type", "checkbox");
                statusCheckbox.checked = eachTask.done;
                statusCheckbox.onclick = function () {
                  eachTask.done = this.checked;
                //   console.log(this.checked);
                  let rowElems = this.parentElement.parentElement.children;
                  for (let i = 0; i < rowElems.length; i++) {
                    rowElems[i].classList.toggle("linethrough");
                  }
                  var miniXhttp = new XMLHttpRequest();
                  miniXhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                      statusMessage.innerHTML =
                        "marking task : " +
                        eachTask.taskname +
                        " as updated :" +
                        this.responseText;
                    }
                  };
                  miniXhttp.open("PUT", "http://localhost:3000/api/todo", true);
                  miniXhttp.setRequestHeader("Content-type", "application/json");
                  miniXhttp.setRequestHeader(
                    "x-access-token",
                    localStorage.getItem("x-access-token")
                  );
                  miniXhttp.send(JSON.stringify(eachTask));
                };
                statusCell.appendChild(statusCheckbox);
                dataRow.appendChild(statusCell);
                if (eachTask.done) {
                  let rowElems = dataRow.children;
                  for (let i = 0; i < rowElems.length; i++) {
                    rowElems[i].classList.add("linethrough");
                  }
                }
                let delCell = document.createElement("td");
                let deleteBtn = document.createElement("i");
                deleteBtn.classList.add("fa");
                deleteBtn.classList.add("fa-trash");
                deleteBtn.onclick = function () {
                  let taskId = eachTask._id;
                  var xhttp = new XMLHttpRequest();
                  xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                      statusMessage.innerHTML = this.responseText;
                      loadTodos();
                    }
                  };
                  xhttp.open(
                    "DELETE",
                    "http://localhost:3000/api/todo/" + taskId,
                    true
                  );
                  xhttp.setRequestHeader("Content-type", "application/json");
                  xhttp.setRequestHeader(
                    "x-access-token",
                    localStorage.getItem("x-access-token")
                  );
                  xhttp.send();
                };
                delCell.appendChild(deleteBtn);
                dataRow.appendChild(delCell);
                table1.appendChild(dataRow);
              }
              todoTable.removeChild(todoTable.firstChild);
              todoTable.appendChild(table1);
              statusMessage.innerHTML = "Task List:";
              if (this.responseText == "[]") {
                statusMessage.innerHTML = "Task List: &lt;empty&gt;";
              }
            } catch (e) {
              statusMessage.innerHTML = "error parsing response " + e;
            }
          } else {
              console.log("error in loading todos");
          }
        } else {
          //console.log("loading todos..." + this.readyState);
        }
      }
    xhttp.open("PUT", "http://localhost:3000/api/todo/search", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.setRequestHeader(
      "x-access-token",
      localStorage.getItem("x-access-token")
    );
    xhttp.send(JSON.stringify({ uname: userOfApp }));
  } else {
    alert("error: username was not recorded. resetting");
    reset();
  }
}



clearLogin.onclick = function () {
  loginUsername.value = "";
  loginPassword.value = "";
};

submitLogin.onclick = function () {
  let userStr = loginUsername.value,
    passStr = btoa(loginPassword.value);
  console.log(userStr + " " + passStr);
  if (userStr && passStr) {
    if (loginAttempt(userStr, passStr)) {
    } else {
    }
  } else {
    dialogboxMsg.innerHTML = "Please enter credentials";
    loginUsername.focus();
  }
};

closeLogin.onclick = () => dialog.close();

function loginAttempt(userStr, passStr) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        console.log(this.responseText + " successful login");
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
        loadTodos();
      } else {
        console.log(this.responseText + " invalid credentials");
        dialogboxMsg.innerHTML = "Invalid credentials";
        loginUsername.value = "";
        loginPassword.value = "";
        loginUsername.focus();
      }
    } else {
      console.log("authenticating...");
    }
  };
  xhttp.open("PUT", "http://localhost:3000/api/login", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify({ username: userStr, password: passStr }));
}

logoutBtn.onclick = () => {
  reset();
  localStorage.clear();
};
