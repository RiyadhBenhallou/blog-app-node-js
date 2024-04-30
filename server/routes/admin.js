const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

//middleware
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

//get route -- admin page
router.get("/admin", async (req, res) => {
  try {
    res.render("admin/index.ejs");
  } catch (error) {
    console.log(error);
  }
});

//post route -- admin login
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }); // Fix typo: findOnr -> findOne
    if (!user) {
      return res.status(404).json("invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json("invalid credentials");
    }
    //res.status(200).json("Login successful");

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SERCRET);
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

//post route -- admin login
router.get("/dashboard", async (req, res) => {
  try {
    const data = await Post.find();
    res.render("admin/dashboard.ejs", { data });
  } catch (error) {
    console.log(error);
  }
});

//get route -- admin add post
router.get("/add-post", async (req, res) => {
  try {
    const data = await Post.find();
    res.render("admin/add-post.ejs");
  } catch (error) {
    console.log(error);
  }
});

//post route -- admin add post
router.post("/add-post", async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });
      await Post.create(newPost);
    } catch (error) {
      console.log(error);
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

//get route -- admin update post
router.get("/edit-post/:id", async (req, res) => {
  try {
    const data = await Post.findOne({ _id: req.params.id });
    res.render("admin/edit-post", { data });
  } catch (error) {
    console.log(error);
  }
});

//put route -- admin update post
router.put("/edit-post/:id", async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});

router.delete("/delete-post/:id", async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

// get route - user logout
router.get("/logout", async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "you've been successfully logged out, now ro7 tr9od" });
});

//post route -- admin register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "user created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already in use" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
