let div1 = document.getElementById("determineuser");
let username = document.getElementById("username");
let determinUserBtn = document.getElementById("determineUsername");

let div2 = document.getElementById("addtodos");
let taskName = document.getElementById("taskname");
let addTaskBtn = document.getElementById("addTask");

let greetingLabel = document.getElementById("greetingLbl");
let statusMessage = document.getElementById("statusLbl");

let todoTable = document.getElementById("todotable");

div1.style.display = "block";
div2.style.display = "none";
var userOfApp = "";
todoTable.style.display = "none";
determinUserBtn.onclick = function() {
    let userStr = username.value;
    if(userStr) {
        userOfApp = username.value;
        div1.style.display = "none";
        let greetStr = "hello " + userStr;
        greetingLabel.innerHTML = greetStr;
        div2.style.display = "block";
    } else {
        alert("enter username. (mandatory)");
        username.focus();
    }
}

addTaskBtn.onclick = function() {
    let taskname = taskName.value;
    if(taskname) {
        if(userOfApp) {
            submitTask(userOfApp, taskname);
        } else {
            alert("error: username was not recorded. resetting");
            reset()
        }
    } else {
        alert("enter task name (mandatory)");
        taskName.focus();
    }
}

function reset() {
    div1.style.display = "block";
    div2.style.display = "none";
    username.value = ''
    taskName = '';
    greetingLabel.innerHTML = '';
    todoTable.style.display = "none";

}

function submitTask(uname, taskname) {
    console.log(uname);
    console.log(taskname);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        statusLbl.innerHTML = this.responseText;
        loadTodos(uname);
      }
    };
    xhttp.open("POST", "http://localhost:3000/api/todo", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send("{ \"uname\" : \""+uname+"\" , \"taskname\": \""+taskname+"\"}");
}

function loadTodos(uname) {
    console.log("loading todos");
    if(uname) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            statusLbl.innerHTML = this.responseText;
            todoTable.style.display = "block";
          }
        };
        xhttp.open("PUT", "http://localhost:3000/api/todo", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send("{ \"uname\" : \""+uname+"\"}");
    } else {
        alert("error: username was not recorded. resetting");
        reset();
    }
}