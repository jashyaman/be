var express = require("express");
var router = express.Router();
var auth = require("./auth");
var schemas = require("./db");
const ObjectId = require("mongoose").Types.ObjectId;

router.post("", (req, res) => {
  let requestBody = req.body;
  let document = {
    task_name: requestBody.task_name,
    owner_name: requestBody.owner_name,
    estimate: requestBody.estimate,
    description: requestBody.description,
    parent: requestBody.submodule_name,
  };
  let model = new schemas.Task(document);
  model.save().then(
    (response) => {
      res.send("entry processing " + JSON.stringify(document));
    },
    (err) => {
      res.send("ERROR in entry processing " + err);
    }
  );
});

router.get("/:id", (req, res) => {
  var id = req.params["id"];
  let filter = { _id: ObjectId(id) };
  schemas.Task.aggregate([
    { $match: filter },
    {
      $project: {
        parentId: { $toObjectId: "$parent" },
        task_name: 1,
        estimate: 1,
        description: 1,
        owner_name: 1,
        complete: 1,
        parent: 1,
      },
    },
    {
      $lookup: {
        from: "submodules",
        localField: "parentId",
        foreignField: "_id",
        as: "parentRec",
      },
    },
  ]).exec((err, docs) => {
    if (err) {
      console.log(err);
      res.send(err);
    }
    res.send(docs[0]);
  });
});

router.put("/:id", (req, res) => {
  var id = req.params["id"];
  let requestBody = req.body;
  let update = {
    task_name: requestBody.task_name,
    owner_name: requestBody.owner_name,
    estimate: requestBody.estimate,
    description: requestBody.description,
    parent: requestBody.submodule_name,
    complete: requestBody.complete,
  };
  let filter = { _id: id };
  if (update["complete"] != undefined || update["complete"] == true) {
    schemas.Subtask.find({ parent: id }, { complete: 1, subtask_name: 1 }, (err, docs) => {
      if (err) {
        console.log(err);
        res.send(err);
      }
      let reasons = [];
      docs.forEach(doc => {
        if (!doc.complete) {
          reasons.push(doc.subtask_name + " in not marked complete");
        }
      });
      if (reasons.length > 0) {
        res.status(409).send({ "reasons": reasons });
        return;
      }
      schemas.Task.findOneAndUpdate(filter, update, (err, docs) => {
        if (err) {
          console.log(err);
          res.send(err);
        }
        //      console.log(docs);
        res.send(docs);
      });
    });
  } else {
    schemas.Task.findOneAndUpdate(filter, update, (err, docs) => {
      if (err) {
        console.log(err);
        res.send(err);
      }
      //      console.log(docs);
      res.send(docs);
    });
  }
});

router.delete("/:id", (req, res) => {
  var id = req.params["id"];
  let filter = { _id: id };
  schemas.Subtask.find({ parent: id }, (err, docs) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      if (docs.length > 0) {
        res
          .status(409)
          .send({
            error: "unable to update id: " + id,
            reason: docs.length + " subtask(s) exists under task",
          });
      } else {
        console.log(" no dependencies found");
        schemas.Project.findOneAndDelete(filter, (err, docs) => {
          if (err) {
            console.log(err);
            res.status(500).send(err);
          } else {
            res.status(200).send();
          }
        });
      }
    }
  });
});

module.exports = router;
