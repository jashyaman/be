var express = require('express');
var router = express.Router();
var auth = require("./auth");
var schemas = require("./db")
const ObjectId = require("mongoose").Types.ObjectId;


router.post("", (req, res) => {
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


  router.get("/:id", (req, res) => {
    var id = req.params['id'];
    let filter = { _id : ObjectId(id) };
    schemas.Subtask.aggregate(
      [
        { "$match" : filter },
        { "$project": { "parentId": { "$toObjectId": "$parent" },
        "subtask_name" : 1,
        "estimate" : 1,
        "description" : 1, 
        "owner_name" : 1, 
        "complete" : 1,
        "parent" : 1 } }, 
        { "$lookup": { "from": "tasks", "localField": "parentId", "foreignField": "_id", "as": "parentRec" } },
      ]
    ).exec((err, docs) => {
        if(err) {
            console.log(err);
            res.send(err);
        }
        //console.log(docs);
        res.send(docs[0]);
    })
  });


  router.put("/:id", (req, res) => {
    var id = req.params['id'];
    var update = req.body;
    let filter = { _id : id };
    console.log(update);
    console.log(filter);
    schemas.Subtask.findOneAndUpdate(filter,update, (err, docs) => {
        if(err) {
            console.log(err);
            res.send(err);
        }
        console.log(docs);
        res.send(docs);
    })
  });








module.exports = router;