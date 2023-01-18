const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
let newUser = require("../models/newUser.model");
let existingUser = require("../models/existingUser.model");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./client/public/uploads/");
  },
  filename: function (req, file, cb) {
    console.log(file);

    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).single("profilePhoto");

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
  const pendingRequest = req.body.pendingRequest;
  const roomId = req.body.roomId;
  const socketId = req.body.socketId;
  const newAddedUser = new newUser({
    firstName,
    lastName,
    email,
    password,
    userFriend,
    pendingRequest,
    roomId,
    socketId,
  });
  newAddedUser
    .save()
    .then(() => {
      res.json(newAddedUser);
    })
    .catch((err) => {
      res.status(400).json("Error: " + err);
      console.log(err);
    });
});
router.route("/signin").post((req, res) => {
  const email = req.body.email;
  const password = req.body.password;
 
  const newUserLogin = new existingUser({
    email,
    password,
  });
  console.log(newUserLogin)
  newUserLogin
    .save()
    .then(() => {res.json("Data Added")})
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id").get((req, res) => {
  newUser
    .findById(req.params.id)
    .then(() => res.json(404))
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
      newUser.pendingRequest = req.body.pendingRequest;
      newUser.roomId = req.body.roomId;
      newUser.socketId = req.body.socketId;

      newUser
        .save()
        .then(() => res.json("User updated"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
