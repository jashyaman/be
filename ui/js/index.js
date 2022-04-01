let btn1 = document.getElementById("clickme")
let projmgrBtn = document.getElementById("projmgrBtn");

btn1.onclick = function() {
    window.location.replace('http://localhost:3000/todo');
}

projmgrBtn.onclick = function() {
    window.location.replace('http://localhost:3000/projmgr');
}

journalBtn.onclick = function() {
    window.location.replace("/journal")
}
