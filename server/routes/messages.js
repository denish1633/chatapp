const router = require("express").Router();
let newMessage = require("../models/messages.model");

router.route("/:roomId").get((req, res) => {
  newMessage
    .find({_id:req.params.roomId})
    .then((messages) => res.json(messages))
    .catch((err) => res.status(400).json("Error: " + err));
});

// route to add new entry to message collection
router.route("/new").post((req, res) => {
  const messageHistory = req.body.messageHistory;
  const _id = req.body._id;

  const newMessageAdded = new newMessage({_id,messageHistory });

  newMessageAdded
    .save()
    .then(() => res.json("message Added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id").get((req, res) => {
  newMessage
    .findById(req.params.id)
    .then((newUser) => res.json(newUser))
    .catch((err) => res.status(400).json("Error: " + err));
});
router.route("/update/:id").post((req, res) => {
  newMessage
    .findById(req.params.id)
    .then((newUser) => {
      newUser.messageHistory = req.body;
      

      newUser
        .save()
        .then(() => res.json("User updated"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
