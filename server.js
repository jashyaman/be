const express = require('express')
const app = express()
const port = 3000
var path = require('path');
import schemas from "./db.js"


app.use(express.static(path.join(__dirname, 'ui')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname+"/ui/html/index.html")
})

app.get('/todo', (req, res) => {
    res.sendFile(__dirname+"/ui/html/todo.html")
})

app.post('/todo', (req, res) => {
    let inputuname = req.body.uname,
        inputtaskname = req.body.taskname;

        console.log(inputuname);;
        console.log(inputtaskname);
        
        let document = { "uname" : inputuname , "taskname" : inputtaskname }
        var todoEntry = new schemas.TodoEntry(document);
        todoEntry.save().then( () => console.log("entry added " + JSON.stringify(document) ) );
        res.send("entry added " + JSON.stringify(document))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})