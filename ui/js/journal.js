username.value = "shyam";
password.value = "raman";
logoutBtn.style.display = "none";
createJournaldiv.style.display = "none";
divbelow.style.display = "none";
overlay.style.display = "none";


loginBtn.onclick = function() {
  overlay.style.display = "block"
}

cancel.onclick = function() {
    username.value = "";
    password.value = "";
    overlay.style.display = "none"
}

submit.onclick = function(){
    let userStr = username.value,
    passStr = btoa(password.value);
    //console.log(userStr + " " + passStr);
    if (userStr && passStr) {
        loginAttempt(userStr, passStr);
    } else {
        dialogboxMsg.innerHTML = "Please enter credentials";
        username.focus();
    }
}

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
        loginBtn.style.display = "none";
        let greetStr = "hello " + userStr;
        greetingLabel.innerHTML = greetStr;
        logoutBtn.style.display = "block";
        greetingLabel.innerHTML = "login successful";
        overlay.style.display = "none";
        divbelow.style.display = "block";
        loadnavbar();
      } else {
      //  console.log(this.responseText + " invalid credentials");
        dialogboxMsg.innerHTML = "Invalid credentials";
        username.value = "";
        password.value = "";
      }
      username.disabled = false;
      password.disabled = false;
      submit.disabled = false;
      cancel.disabled = false;
    } else {
      //console.log("authenticating... state:"+this.readyState);
    }
  };
  xhttp.open("PUT", "/api/login", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader("x-auth-token","");
  xhttp.send(JSON.stringify({ username: userStr, password: passStr }));
  username.disabled = true
    password.disabled = true
    submit.disabled = true
    cancel.disabled = true
}

logoutBtn.onclick = () => {
  reset();
  localStorage.clear();
  greetingLabel.innerHTML = "logout successful";
};


function reset() {
  overlay.style.display = "none";
  username.value = "";
  password.value = "";
  dialogboxMsg.innerHTML = "";
  greetingLabel.innerHTML = "";
  createJournaldiv.style.display = "none"
}

newEntry.onclick = function() {
  if( createJournaldiv.style.display == "none") {
    createJournaldiv.style.display = "block";
  } else {
    createJournaldiv.style.display = "none";
  }
}

submitEntry.onclick = function() {
  // console.log(moodSelector2.value);
  // console.log(journalEntry.value);
  // console.log(moodSelector1.value);
  // console.log(journalDate.value);
  // console.log(journalTitle.value);
  // console.log(taglist.innerHTML);
  var now = new Date();
  now.setHours(0,0,0,0);
  if(Date.parse(journalDate.value) < now) {
    alert("date cannot be in the past");
    journalDate.focus();
    return;
  }
  if(journalTitle.value == "" || journalEntry.value == "") {
    alert("title and entry cannot be empty");
    if(journalTitle.value) {
      journalEntry.focus();
    } else {
      journalTitle.focus();
    }
    return;
  }
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        // console.log(this.responseText);
        loadnavbar();
      } else {
        console.log(this.status);
      }
      moodSelector2.value = "";
      moodSelector1.value = "";
      journalEntry.value = "";
      journalTitle.value = "";
      taglist.innerHTML = "";
      createJournaldiv.style.display = "none";
    }
  }
  let requestBody = {};
  requestBody["title"] = journalTitle.value;
  requestBody["entry"] = journalEntry.value;
  requestBody["entryDate"] = journalDate.value;
  requestBody["emotionBefore"] = moodSelector1.value;
  requestBody["emotionAfter"] = moodSelector2.value;
  requestBody["tags"] = taglist.innerHTML.split(", ");
  let jwtToken = localStorage.getItem("x-access-token");
  let tokenBody = parseToken(jwtToken);
  requestBody["author"] = tokenBody["user_id"]

  xhttp.open("POST", "/api/journal", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(requestBody));
}

clearEntry.onclick = function() {
  moodSelector2.value = "";
  moodSelector1.value = "";
  journalEntry.value = "";
  journalTitle = "";
  taglist.innerHTML = "";
}

tag.onkeydown = function(event) {
  if(event.keyCode == 13) {
    let val = tag.value;
    let list = taglist.innerHTML;
    if(list) {
      list+=", #" + val;
    } else {
      list="#"+val;
    }
    tag.value = "";
    taglist.innerHTML = list;
  }
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

function loadnavbar() {
  let userId = parseToken(localStorage.getItem("x-access-token"))["user_id"]
//  console.log(userId);
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        populateNavBar(this.responseText);
      } else {
        console.log(this.status);
      }
    }
  }
  xhttp.open("GET", "/api/journal", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader("x-access-token", localStorage.getItem("x-access-token"));
  xhttp.send();
}

function populateNavBar(listStr) {
  let list = JSON.parse(listStr);
  if(list) {
    divleft.innerHTML = "";
    for(let i=0;i<list.length;i++) {
      let elem = document.createElement("div");
      elem.id = list[i]._id
      elem.innerHTML = list[i].title;
      elem.onclick = function() {
        console.log(elem.id);
        createTable(list[i]);
      }
      elem.style.cursor = "pointer";
      elem.classList.add("act");
      let innerdiv = document.createElement("div")
      innerdiv.classList.add("flexboxmain");
      innerdiv.appendChild(elem);
      let delbtn = document.createElement("i");
      delbtn.classList.add("fa");
      delbtn.classList.add("fa-trash");
      delbtn.onclick = function() {
        console.log(" deleting " + elem.id)
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {
              //console.log("delete successful");
              loadnavbar();
            } else {
              alert(this.responseText);
            }
          }
        }
        xhttp.open("DELETE", "/api/journal/"+elem.id, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("x-access-token", localStorage.getItem("x-access-token"));
        xhttp.send();
      }
      innerdiv.appendChild(delbtn);
      divleft.appendChild(innerdiv);
    }
  }
}

function createTable(journal) {
  while(journalbody.firstChild) {
    journalbody.removeChild(journalbody.firstChild);
  }
  console.log(journal);
  console.log(Object.keys(journal));
  let ignoreList = ["__v", "_id", "author"];
  let keys = Object.keys(journal).filter(k => !ignoreList.includes(k));
  let table = document.createElement("table");
  table.classList.add("disptable");
  keys.forEach(k => {
    let tr = document.createElement("tr");
    let th = document.createElement("th");
    th.innerHTML = k;
    let td = document.createElement("td");
    td.innerHTML = journal[k];
    tr.appendChild(th);
    tr.appendChild(td);
    table.appendChild(tr);
  });
  journalbody.appendChild(table);
}