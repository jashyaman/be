var express = require('express');
var router = express.Router();
var auth = require("./auth");
  
  router.post('', auth, (req, res) => {
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

router.delete("/:id", auth, (req, res) => {
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

router.put('/search', auth, (req, res) => {
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

router.put('', auth, (req, res) => {
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

module.exports = router;