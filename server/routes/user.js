const router = require("express").Router();
let newUser = require("../models/newUser.model");
let existingUser = require("../models/existingUser.model");

router.route("/").get((req, res) => {
  newUser
    .find()
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/signup").post((req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const userFriend = req.body.userFriend;

  const newAddedUser = new newUser({
    firstName,
    lastName,
    email,
    password,
    userFriend,
  });

  newAddedUser
    .save()
    .then(() => res.json("user Added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});
router.route("/signin").post((req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const newUserLogin = new existingUser({
    email,
    password,
  });
  newUserLogin
    .save()
    .then(() => res.json("user Loged In!"))
    .catch((err) => res.status(400).json("Error: " + err));
});


router.route("/:id").get((req, res) => {
  newUser
    .findById(req.params.id)
    .then((newUser) => res.json(newUser))
    .catch((err) => res.status(400).json("Error: " + err));
});
router.route("/update/:id").post((req, res) => {
  newUser
    .findById(req.params.id)
    .then((newUser) => {
      newUser.firstName = req.body.firstName;
      newUser.lastName = req.body.lastName;
      newUser.email = req.body.email;
      newUser.password = req.body.password;
      newUser.userFriend = req.body.userFriend;

      newUser
        .save()
        .then(() => res.json("User updated"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
