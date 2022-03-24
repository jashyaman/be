var express = require('express');
var router = express.Router();
var auth = require("./auth");
var schemas = require("./db");

router.post("", (req, res) => {
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

  router.get("/:id", (req, res) => {
    var projectId = req.params['id'];
    let filter = { _id : projectId};
    schemas.Project.findOne(filter,{"__v": 0}, (err, docs) => {
        if(err) {
            console.log(err);
            res.send(err);
        }
        //console.log(docs);
        res.send(docs);
    })
  });

  router.put("/:id", (req, res) => {
    var projectId = req.params['id'];
    var document = req.body;
    let filter = { _id : projectId };
    let update = { project_name: document["project_name"],
    owner_name : document["owner_name"],
    project_type : document["project_type"],
    complete : document["complete"]
    };
    console.log(update);
    console.log(filter);
    schemas.Project.findOneAndUpdate(filter,update, (err, docs) => {
        if(err) {
            console.log(err);
            res.send(err);
        }
        console.log(docs);
        res.send(docs);
    })
  });



  module.exports = router;