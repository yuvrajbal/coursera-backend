const { Router } = require("express");
const { adminModel, courseModel } = require("../db");
const { adminMiddleware } = require("../middleware/admin");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const adminRouter = Router();
require("dotenv").config();

adminRouter.post("/signup", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const existingAdmin = await adminModel.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "admin already exists" });
    }
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS)
    );

    console.log(hashedPassword);
    const adminDoc = await adminModel.create({
      username: username,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: adminDoc._id,
      },
      process.env.JWT_ADMIN_PASSWORD
    );

    res.json({
      message: "Admin created successfully",
      token: token,
    });
  } catch (err) {
    res.status(500).json({
      message: "error while creating admin",
      error: err,
    });
  }
});

adminRouter.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const foundAdmin = await adminModel.findOne({ username });
    if (!foundAdmin) {
      return res.status(400).json({
        message: "invalid username",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, foundAdmin.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "invalid password" });
    }

    const token = jwt.sign(
      {
        id: foundAdmin._id,
      },
      process.env.JWT_ADMIN_PASSWORD
    );
    res.status(200).json({
      message: "Logged in successfully",
      token: token,
    });
  } catch (err) {
    res.status(500).json({ message: "error while Signing in", error: err });
  }
});

// add courses
adminRouter.post("/courses", adminMiddleware, async function (req, res) {
  const adminId = req.userId;
  const { title, description, imageUrl, price } = req.body;

  try {
    const course = await courseModel.create({
      title: title,
      description: description,
      price: price,
      imageUrl: imageUrl,
      creatorId: adminId,
    });
    res.status(200).json({
      message: "Course created successfully",
      courseId: course._id,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while creating course", error: err });
  }
});

// update course
adminRouter.put(
  "/courses/:courseId",
  adminMiddleware,
  async function (req, res) {
    const courseId = req.params.courseId;
    const adminId = req.userId;
    const { title, description, price, imageUrl } = req.body;

    try {
      const course = await courseModel.updateOne(
        { _id: courseId, creatorId: adminId },
        {
          title: title,
          description: description,
          price: price,
          imageUrl: imageUrl,
        }
      );

      res.status(200).json({
        message: "course updated successfully",
        courseId: course._id,
      });
    } catch (err) {
      res.status(500).json({
        message: "error while updating course",
        error: err,
      });
    }
  }
);

// fetch all courses created by the admin
adminRouter.get("/courses", adminMiddleware, async function (req, res) {
  const adminId = req.userId;
  try {
    const courses = await courseModel.find({
      creatorId: adminId,
    });

    res.status(200).json({
      courses: courses,
    });
  } catch (err) {
    res.status(500).json({
      message: "error while getting courses",
      error: err,
    });
  }
});

adminRouter.get(
  "/course/:courseId",
  adminMiddleware,
  async function (req, res) {
    const courseId = req.params.courseId;

    try {
      const course = await courseModel.find({ _id: courseId });
      res.status(200).json({
        message: "fetched course data",
        course: course,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error while getting course data",
      });
    }
  }
);
module.exports = {
  adminRouter: adminRouter,
};
