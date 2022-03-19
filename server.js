const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
var path = require("path");

var todorouter = require("./todoRouter");
var schemas = require("./db");
var auth = require("./auth");
var aggregations = require("./aggregations");

const jwt = require("jsonwebtoken");

app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "ui")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/todo", todorouter);

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

app.post("/api/projects", (req, res) => {
  let requestBody = req.body;
  let document = {
    project_name: requestBody.projectName,
    owner_name: requestBody.ownerName,
    project_type: requestBody.projectType,
  };
  let project = new schemas.Project(document);
  project.save().then(
    (response) => {
      //console.log(response);
      res.send("entry processing " + JSON.stringify(document));
    },
    (err) => {
      res.send("ERROR in entry processing " + err);
    }
  );
});

app.post("/api/modules", (req, res) => {
  let requestBody = req.body;
  //console.log(requestBody);
  let document = {
    module_name: requestBody.moduleName,
    owner_name: requestBody.ownerName,
    estimate: requestBody.estimate,
    description: requestBody.description,
    parent: requestBody.projectName,
  };
  let model = new schemas.Module(document);
  model.save().then(
    (response) => {
      //console.log(response);
      res.send("entry processing " + JSON.stringify(document));
    },
    (err) => {
      res.send("ERROR in entry processing " + err);
    }
  );
});

app.post("/api/submodules", (req, res) => {
  let requestBody = req.body;
  //console.log(requestBody);
  let document = {
    submodule_name: requestBody.submoduleName,
    owner_name: requestBody.ownerName,
    estimate: requestBody.estimate,
    description: requestBody.description,
    parent: requestBody.moduleName,
  };
  let model = new schemas.Submodule(document);
  model.save().then(
    (response) => {
      //console.log(response);
      res.send("entry processing " + JSON.stringify(document));
    },
    (err) => {
      res.send("ERROR in entry processing " + err);
    }
  );
});

app.post("/api/tasks", (req, res) => {
  let requestBody = req.body;
  //console.log(requestBody);
  let document = {
    task_name: requestBody.taskName,
    owner_name: requestBody.ownerName,
    estimate: requestBody.estimate,
    description: requestBody.description,
    parent: requestBody.submoduleName,
  };
  let model = new schemas.Task(document);
  model.save().then(
    (response) => {
      //console.log(response);
      res.send("entry processing " + JSON.stringify(document));
    },
    (err) => {
      res.send("ERROR in entry processing " + err);
    }
  );
});

app.post("/api/subtasks", (req, res) => {
  let requestBody = req.body;
  console.log(requestBody);
  let document = {
    subtask_name: requestBody.subTaskName,
    owner_name: requestBody.ownerName,
    estimate: requestBody.estimate,
    description: requestBody.description,
    parent: requestBody.taskName,
  };
  let model = new schemas.Subtask(document);
  model.save().then(
    (response) => {
      //console.log(response);
      res.send("entry processing " + JSON.stringify(document));
    },
    (err) => {
      res.send("ERROR in entry processing " + err);
    }
  );
});

app.put("/api/login", (req, res) => {
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
      if (docs) {
        if (docs.length == 1) {
          res.status(200);
          let jwToken = jwt.sign(
            { user_id: docs[0].username },
            process.env.TOKEN_KEY,
            { expiresIn: "1h" }
          );
          res.send({ token: jwToken, username: docs[0].username });
        } else {
          res.status(401);
          res.send("unauthorized");
        }
      } else {
        res.status(401);
        res.send("unauthorized");
      }
    }
  });
});

app.get("/api/nav", auth, (req, res) => {
  let navbarList = [];
  let username = req.user.user_id;
  console.log(username);
  schemas.Project.aggregate(
    aggregations(username)
  ).exec( (err, docs)=> {
    if(err) {
      console.log(err);
      res.send(err);
    }
    console.log(docs);
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
