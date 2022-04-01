const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
var path = require("path");

var todorouter = require("./todoRouter");
var projectrouter = require("./projectRouter");
var modulerouter = require("./moduleRouter");
var submodulerouter = require("./submoduleRouter");
var taskrouter = require("./taskRouter");
var subtaskrouter = require("./subtaskRouter");
var journalRouter = require("./journalRouter");
var schemas = require("./db");
var auth = require("./auth");
var aggregations = require("./aggregations");

const jwt = require("jsonwebtoken");

app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "ui")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/todo", todorouter);
app.use("/api/projects", projectrouter);
app.use("/api/modules", modulerouter);
app.use("/api/submodules", submodulerouter);
app.use("/api/tasks", taskrouter);
app.use("/api/subtasks", subtaskrouter);
app.use("/api/journal", journalRouter);

app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/ui/html/index.html");
});

app.get("/todo", (req, res) => {
  res.sendFile(__dirname + "/ui/html/todo.html");
});

app.get("/projmgr", (req, res) => {
  res.sendFile(__dirname + "/ui/html/projmgr.html");
});

app.get("/journal", (req, res) => {
  res.sendFile(__dirname + "/ui/html/journal.html");
})



function determineFilter(filter, user) {
  if (typeof filter == "string") {
    if (filter == "ownerName") {
      return { owner_name: user };
    } else {
      console.log("unrecognized filter field " + filter);
    }
  } else {
    console.log("unprocessable filter " + filter);
  }
}

app.put("/api/dblist", auth, (req, res) => {
  //console.log(req.body);
  let collectionName = req.body.collection;
  let schema = schemas.determineSchema(collectionName);
  let filter = determineFilter(req.body.filter, req.user.user_id);
  schema.find(filter, (err, docs) => {
    if (err) {
      res.status(500).send(err);
    } else {
      //console.log(docs);
      res.status(200).send(docs);
    }
  });
});

app.get("/api/config/:type", auth, (req, res) => {
  let filter = { type: req.params["type"] };
  schemas.Configuration.find(filter, (err, docs) => {
    if (err) {
      res.status(500).send(err);
    }
    if (docs) {
      res.status(200).send(docs);
    } else {
      res.status(404).send();
    }
  });
});

app.put("/api/login", (req, res) => {
  // console.log(req.body);
  let requestBody = req.body;
  let document = {
    username: requestBody.username,
    password: requestBody.password,
  };
  //console.log(document);
  schemas.UserLogin.find(document, (err, docs) => {
    if (err) {
      res.status(500);
      res.send("unexpected error " + err);
    } else {
      if (docs && docs.length == 1) {
        res.status(200);
        let jwToken = jwt.sign(
          { user_id: docs[0].username },
          process.env.TOKEN_KEY,
          { expiresIn: "1h" }
        );
        res.send({ token: jwToken, username: docs[0].username });
      } else {
        res.status(401);
        res.send("no user found");
      }
    }
  });
});

app.get("/api/nav", auth, (req, res) => {
  let navbarList = [];
  let username = req.user.user_id;
  //console.log(username);
  schemas.Project.aggregate(
    aggregations(username)
  ).exec( (err, docs)=> {
    if(err) {
      console.log(err);
      res.send(err);
    }
    //console.log(docs);
    res.send(docs);
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
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;