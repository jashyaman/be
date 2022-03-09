const express = require('express')
const app = express()
const port = 3000
var path = require('path');
var schemas = require("./db")


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

app.post('/api/todo', (req, res) => {
    let inputuname = req.body.uname,
        inputtaskname = req.body.taskname;

        // console.log(inputuname);;
        // console.log(inputtaskname);
        
        let document = { "uname" : inputuname , "taskname" : inputtaskname }
        var todoEntry = new schemas.TodoEntry(document);
        todoEntry.save().then(
          (response) => {
            //console.log("entry added " + JSON.stringify(document) + " " + response); 
            res.send("entry processing " + JSON.stringify(document))
          }, 
          (err) => {
              res.send("ERROR in entry processing " + err);            
          }
        );
});

app.put('/api/todo/search', (req, res) => {
  let inputuname = req.body.uname;
      // console.log(inputuname);;
      let document = { "uname" : inputuname }   
      schemas.TodoEntry.find(document, (err, docs) => {
        //console.log("search result of " + JSON.stringify(document) + " is ");
        if(err) {
          console.error(err);
        } else {
          res.send(docs);
        }
      });   
});

app.put('/api/todo', (req, res) => {
  let requestBody = req.body;
      const filter = { _id: requestBody._id };
      const update = { uname: requestBody.uname, taskname: requestBody.taskname, done: requestBody.done };
       schemas.TodoEntry.findOneAndUpdate(filter, update, (err, docs) => {
        if(err) {
          console.error(err);
          res.send("fails " + err);
        } else {
          res.send("success")
        }
       });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})