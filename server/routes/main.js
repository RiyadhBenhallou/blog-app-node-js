const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

//get route
router.get("/", async (req, res) => {
  try {
    //const data = await Post.find();

    //couldn't undesrtand this
    let perPage = 6;
    let page = req.query.page || 1;
    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index.ejs", {
      data: data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});

//get posts by id
router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });
    res.render("post.ejs", { data: data });
  } catch (error) {
    console.log(error);
  }
});

// post, search blogs
router.post("/search", async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: searchNoSpecialChar, $options: "i" } },
        { body: { $regex: searchNoSpecialChar, $options: "i" } },
      ],
    });
    res.render("search.ejs", { data: data });
  } catch (error) {
    console.log(error);
  }
});

router.get("/about", (req, res) => {
  res.render("about.ejs");
});

router.get("/contact", (req, res) => {
  res.render("contcat.ejs");
});

/*const insertPostData = () => {
  Post.insertMany([
    {
      title: "Hello",
      body: "World",
    },
    {
      title: "Hi",
      body: "Again",
    },
  ]);
};
insertPostData();*/

module.exports = router;
