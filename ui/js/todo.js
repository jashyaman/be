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
        if(userStr) {
            loadTodos(userStr);
        }
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
            taskname.value = '';
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
    xhttp.onreadystatechange = onsubmitTaskCompleteFn;
    xhttp.open("POST", "http://localhost:3000/api/todo", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send("{ \"uname\" : \""+uname+"\" , \"taskname\": \""+taskname+"\"}");
}

function onsubmitTaskCompleteFn() {
    if (this.readyState == 4 && this.status == 200) {
      statusLbl.innerHTML = this.responseText;
      loadTodos(uname);
    }
  };

function loadTodos(uname) {
    console.log("loading todos");
    if(uname) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = onloadTodosCompleteFn;
        xhttp.open("PUT", "http://localhost:3000/api/todo/search", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send("{ \"uname\" : \""+uname+"\"}");
    } else {
        alert("error: username was not recorded. resetting");
        reset();
    }
}

function onloadTodosCompleteFn() {
    if (this.readyState == 4 && this.status == 200) {
      statusLbl.innerHTML = this.responseText;
      try {
          let jsonArr = JSON.parse(this.responseText);
          if(jsonArr.length == 0) {
              statusLbl.innerHTML = "No task entries for user: " + uname;
              todoTable.style.display = "none";
          } else {
              todoTable.style.display = "block";
          }
          const table1 = document.createElement("table");
          let hdrRow = document.createElement("tr");
          let hdrList = ["id", "uname", "taskname", "status"];
          hdrList.forEach(elem => {
              let hdrcell = document.createElement("th");
              hdrcell.innerText = elem;
              hdrRow.appendChild(hdrcell);
          })
          table1.appendChild(hdrRow);
          for(let index =0;index < jsonArr.length; index++) {
              let dataRow = document.createElement("tr");
              let eachTask = jsonArr[index];
              let idCell = document.createElement("td");
              idCell.innerText = (index+1);
              dataRow.appendChild(idCell);
              let unameCell = document.createElement("td");
              unameCell.innerText = eachTask["uname"];
              dataRow.appendChild(unameCell);
              let tasknameCell = document.createElement("td");
              tasknameCell.innerText = eachTask["taskname"];
              dataRow.appendChild(tasknameCell);
              let statusCell = document.createElement("td");
              let statusCheckbox = document.createElement("input")
              statusCheckbox.setAttribute('type', 'checkbox');
              statusCheckbox.checked = eachTask.done;
              statusCheckbox.onclick = checkBoxOnClickFn
              statusCell.appendChild(statusCheckbox);
              dataRow.appendChild(statusCell);
              if(eachTask.done) {
                  let rowElems = dataRow.children;
                  for(let i=0;i<rowElems.length;i++) {
                      rowElems[i].classList.add("linethrough");
                  }
              }
              table1.appendChild(dataRow);
        }
        todoTable.removeChild(todoTable.firstChild);
        todoTable.appendChild(table1);
        statusLbl.innerHTML = "Task List:"
      } catch(e) {
          statusLbl.innerHTML = "error parsing response " + e;
      }            
    }
  }

  function checkBoxOnClickFn() {
    eachTask.done = this.checked;
    console.log(this.checked);
    let rowElems = this.parentElement.parentElement.children;
    for(let i=0;i<rowElems.length;i++) {
        rowElems[i].classList.toggle("linethrough");
    }
    var miniXhttp = new XMLHttpRequest();
    miniXhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            statusMessage.innerHTML = "marking task : " + eachTask.taskname + " as done :" + this.responseText;
        }
    }
    miniXhttp.open("PUT", "http://localhost:3000/api/todo", true);
    miniXhttp.setRequestHeader("Content-type", "application/json");
    miniXhttp.send(JSON.stringify(eachTask));
}