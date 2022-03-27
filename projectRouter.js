var express = require("express");
var router = express.Router();
var auth = require("./auth");
var schemas = require("./db");

router.post("", (req, res) => {
  let requestBody = req.body;
  let document = {
    project_name: requestBody.project_name,
    owner_name: requestBody.owner_name,
    project_type: requestBody.project_type,
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
  var projectId = req.params["id"];
  let filter = { _id: projectId };
  schemas.Project.findOne(filter, { __v: 0 }, (err, docs) => {
    if (err) {
      console.log(err);
      res.send(err);
    }
    //console.log(docs);
    res.send(docs);
  });
});

router.put("/:id", (req, res) => {
  var id = req.params["id"];
  var document = req.body;
  let filter = { _id: id };
  let update = {
    project_name: document["project_name"],
    owner_name: document["owner_name"],
    project_type: document["project_type"],
    complete: document["complete"],
  };
  // console.log(update);
  // console.log(filter);

  if (document["complete"] != undefined || document["complete"] == true) {
    schemas.Module.find(
      { parent: id },
      { complete: 1, module_name: 1 },
      (err, docs) => {
        if (err) {
          console.log(err);
          res.send(err);
        }
        let reasons = [];
        docs.forEach((doc) => {
          if (!doc.complete) {
            reasons.push(doc.module_name + " in not marked complete");
          }
        });
        if (reasons.length > 0) {
          res.status(409).send({ reasons: reasons });
          return;
        }
        schemas.Project.findOneAndUpdate(filter, update, (err, docs) => {
          if (err) {
            console.log(err);
            res.send(err);
          }
          //      console.log(docs);
          res.send(docs);
        });
      }
    );
  } else {
    schemas.Project.findOneAndUpdate(filter, update, (err, docs) => {
      if (err) {
        console.log(err);
        res.send(err);
      }
      //     console.log(docs);
      res.send(docs);
    });
  }
});
router.delete("/:id", (req, res) => {
  var id = req.params["id"];
  let filter = { _id: id };
  schemas.Module.find({ parent: id }, (err, docs) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      if (docs.length > 0) {
        res
          .status(409)
          .send({
            error: "unable to update id: " + id,
            reason: docs.length + " module(s) exists under project",
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
