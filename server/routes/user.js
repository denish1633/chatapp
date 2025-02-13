const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
let newUser = require("../models/newUser.model");
let existingUser = require("../models/existingUser.model");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./uploads/", // Save to "uploads" folder
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
router.route("/").get((req, res) => {
  newUser
    .find()
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.post("/signup", upload.single("profilePhoto"), async (req, res) => {
  console.log("Signup request received");
  console.log("Request Body:", req.body);
  console.log("Uploaded File:", req.file);

  try {
    const { firstName, lastName, email, password } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No profile picture uploaded" });
    }

    const newAddedUser = new newUser({
      firstName,
      lastName,
      email,
      password,
      profilePhoto: req.file.filename, // Save only filename
    });

    await newAddedUser.save();
    res.json(newAddedUser);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json("Error: " + err);
  }
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
