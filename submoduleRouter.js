var express = require("express");
var router = express.Router();
var auth = require("./auth");
var schemas = require("./db");
const ObjectId = require("mongoose").Types.ObjectId;

router.post("", (req, res) => {
  let requestBody = req.body;
  //console.log(requestBody);
  let document = {
    submodule_name: requestBody.submodule_name,
    owner_name: requestBody.owner_name,
    estimate: requestBody.estimate,
    description: requestBody.description,
    parent: requestBody.module_name,
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

router.get("/:id", (req, res) => {
  var id = req.params["id"];
  let filter = { _id: ObjectId(id) };
  schemas.Submodule.aggregate([
    { $match: filter },
    {
      $project: {
        parentId: { $toObjectId: "$parent" },
        submodule_name: 1,
        estimate: 1,
        description: 1,
        owner_name: 1,
        complete: 1,
        parent: 1,
      },
    },
    {
      $lookup: {
        from: "modules",
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
    submodule_name: requestBody.submodule_name,
    owner_name: requestBody.owner_name,
    estimate: requestBody.estimate,
    description: requestBody.description,
    parent: requestBody.module_name,
    complete: requestBody.complete,
  };
  if (update["complete"] != undefined || update["complete"] == true) {
    let filter = { _id: id };
    schemas.Task.find({ parent: id }, { complete: 1, task_name: 1 }, (err, docs) => {
      if (err) {
        console.log(err);
        res.send(err);
      }
      let reasons = [];
      docs.forEach(doc => {
        if (!doc.complete) {
          reasons.push(doc.task_name + " in not marked complete");
        }
      });
      if (reasons.length > 0) {
        res.status(409).send({ "reasons": reasons });
        return;
      }
      schemas.Submodule.findOneAndUpdate(filter, update, (err, docs) => {
        if (err) {
          console.log(err);
          res.send(err);
        }
        res.send(docs);
      });
    });
  } else {
    schemas.Submodule.findOneAndUpdate(filter, update, (err, docs) => {
      if (err) {
        console.log(err);
        res.send(err);
      }
      res.send(docs);
    });
  }
});

router.delete("/:id", (req, res) => {
  var id = req.params["id"];
  let filter = { _id: id };
  schemas.Task.find({ parent: id }, (err, docs) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      if (docs.length > 0) {
        res
          .status(409)
          .send({
            error: "unable to update id: " + id,
            reason: docs.length + " task(s) exists under submodule",
          });
      } else {
        console.log(" no dependencies found");
        schemas.Submodule.findOneAndDelete(filter, (err, docs) => {
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
