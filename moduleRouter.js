var express = require("express");
var router = express.Router();
var auth = require("./auth");
var schemas = require("./db");
const ObjectId = require("mongoose").Types.ObjectId;

router.post("", (req, res) => {
  let requestBody = req.body;
  let document = {
    module_name: requestBody.module_name,
    owner_name: requestBody.owner_name,
    estimate: requestBody.estimate,
    description: requestBody.description,
    parent: requestBody.project_name,
  };
  let model = new schemas.Module(document);
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
  schemas.Module.aggregate([
    { $match: filter },
    {
      $project: {
        parentId: { $toObjectId: "$parent" },
        module_name: 1,
        estimate: 1,
        description: 1,
        owner_name: 1,
        complete: 1,
        parent: 1,
      },
    },
    {
      $lookup: {
        from: "projects",
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
  var requestBody = req.body;
  let update = {
    module_name: requestBody.module_name,
    owner_name: requestBody.owner_name,
    estimate: requestBody.estimate,
    description: requestBody.description,
    parent: requestBody.project_name,
    complete: requestBody.complete,
  };
  let filter = { _id: id };
  if (update["complete"] != undefined || update["complete"] == true) {
    schemas.Submodule.find(
      { parent: id },
      { complete: 1, submodule_name: 1 },
      (err, docs) => {
        if (err) {
          console.log(err);
          res.send(err);
        }
        let reasons = [];
        docs.forEach((doc) => {
          if (!doc.complete) {
            reasons.push(doc.submodule_name + " in not marked complete");
          }
        });
        if (reasons.length > 0) {
          res.status(409).send({ reasons: reasons });
          return;
        }
        schemas.Module.findOneAndUpdate(filter, update, (err, docs) => {
          if (err) {
            console.log(err);
            res.send(err);
          }
          res.send(docs);
        });
      }
    );
  } else {
    schemas.Module.findOneAndUpdate(filter, update, (err, docs) => {
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
  schemas.Submodule.find({ parent: id }, (err, docs) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      if (docs.length > 0) {
        res
          .status(409)
          .send({
            error: "unable to update id: " + id,
            reason: docs.length + " submodule(s) exists under module",
          });
      } else {
        console.log(" no dependencies found");
        schemas.Module.findOneAndDelete(filter, (err, docs) => {
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
