const express = require('express')
const app = express()
require("dotenv").config();
var path = require('path');
var schemas = require("./db")

const jwt = require("jsonwebtoken");
app.use(express.json({ limit: "50mb" }));
 var auth = require("./auth");
const port = process.env.PORT

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
        let document = { "uname" : inputuname , "taskname" : inputtaskname }
        var todoEntry = new schemas.TodoEntry(document);
        todoEntry.save().then(
          (response) => {
            res.send("entry processing " + JSON.stringify(document))
          }, 
          (err) => {
              res.send("ERROR in entry processing " + err);         
          }
        );
});

app.delete("/api/todo/:id", auth, (req, res) => {
  console.log(req.tokendetail);
  var taskId = req.params['id']
  var username = req.user.user_id;
  console.log(username);
  let filter = { "uname" : username, _id : taskId }
  console.log(JSON.stringify(filter));
  schemas.TodoEntry.deleteOne(filter, (err, response) => {
    if(!err) {
      res.send(JSON.stringify(response));
    } else {
      res.send("ERROR in entry processing " + err);
    }
  })
})

app.put('/api/todo/search', (req, res) => {
  let inputuname = req.body.uname;
      //  console.log(inputuname);
      let document = { "uname" : inputuname }
      let sortBy = { sort: { done : 1 }}
      schemas.TodoEntry.find(document,["uname","taskname","done"], sortBy, (err, docs) => {
        // console.log("search result of " + JSON.stringify(document) + " is ");
        if(err) {
          console.error(err);
          res.status(500).send(err);
        } else {
          // console.log(docs);
          res.status(200).send(docs);
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

app.put('/api/login', (req, res) => {
  let requestBody = req.body;
  let document = {"username" : requestBody.username, "password" : requestBody.password };
  schemas.UserLogin.find(document, (err, docs) => {
    if(err) {
      res.status(500)
      res.send("unexpected error " + err);
    } else {
      if(docs) {
        if(docs.length == 1) {
          res.status(200);
          const jwToken = jwt.sign({user_id: docs[0].username},process.env.TOKEN_KEY,{expiresIn: "120"});
          res.send({ token : jwToken, username : docs[0].username});
        } else {
          res.status(401)
          res.send("unauthorized");
        }
      } else {
        res.status(401);
        res.send("unauthorized");
      }
    }
    
  })
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

module.exports = app;