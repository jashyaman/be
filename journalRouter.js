var express = require("express");
var router = express.Router();
var auth = require("./auth");
var schemas = require("./db");
const ObjectId = require("mongoose").Types.ObjectId;

router.post("", (req, res) => {
  let requestBody = req.body;
  let requestJson = requestBody;
  //console.log(requestBody);
  let journalModel = {
    title: requestJson.title, 
    entry: requestJson.entry,
    dateOf: requestJson.entryDate,
    emoBefore: requestJson.emotionBefore,
    emoAfter: requestJson.emotionAfter,
    tags: requestJson.tags,
    author: requestJson.author
  }
  let journal = new schemas.Journal(journalModel);
  journal.save().then(
    (response) => {
      //console.log(response);
      res.send("entry processing " + JSON.stringify(journalModel) + JSON.stringify(response));
    },
    (err) => {
      res.send("ERROR in entry processing " + err);
    }
  );
});


router.get("", auth, (req, res) => {
    let token = req.user
    let author = token["user_id"];
    //console.log(author);
    if(!author) res.sendStatus(400);
    let query = {
        "author" : author
    };
    schemas.Journal.find(query,  (err, docs) => {
        if(err) {
            res.status(500).send(err);
        }
        res.json(docs);
    })
});

router.delete("/:id", auth, (req, res) => {
  var id = req.params["id"];
  let filter = { _id: id };
  schemas.Journal.findOneAndDelete(filter, (err, docs) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(200).send();
    }
  });
})

module.exports = router;