const { Router } = require("express");
const { userModel, courseModel, purchaseModel } = require("../db");
const { userMiddleware } = require("../middleware/user");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const existingUser = await userModel.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS)
    );
    const user = await userModel.create({
      username: username,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_USER_PASSWORD
    );

    res.status(200).json({
      message: "User created successfully",
      token: token,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error while signing up",
      error: err,
    });
  }
});

userRouter.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const foundUser = await userModel.findOne({ username });
    if (!foundUser) {
      return res.status(400).json({
        message: "invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      res.status(400).json({ message: "invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: foundUser._id,
      },
      process.env.JWT_USER_PASSWORD
    );
    res.status(200).json({
      message: "Logged in successfully",
      token: token,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error while logging in",
      error: err,
    });
  }
});

userRouter.get("/courses", userMiddleware, async function (req, res) {
  try {
    const courses = await courseModel.find();

    res.status(200).json({
      courses: courses,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error while getting courses",
    });
  }
});

userRouter.get("/course/:courseId", userMiddleware, async function (req, res) {
  const courseId = req.params.courseId;
  try {
    const course = await courseModel.findOne({ _id: courseId });
    res.status(200).json({
      message: "Course data fetched",
      course: course,
    });
  } catch (err) {
    res.status(500).json({ message: "cannot fetch course" });
  }
});

userRouter.get("/purchasedCourses", userMiddleware, async function (req, res) {
  const userId = req.userId;
  try {
    const purchases = await purchaseModel.find({ userId });

    const purchasedCoursesIds = [];
    for (let i = 0; i < purchases.length; i++) {
      purchasedCoursesIds.push(purchases[i].courseId);
    }

    const purchasedCourses = await courseModel.find({
      _id: { $in: purchasedCoursesIds },
    });
    res.status(200).json({
      purchasedCourses: purchasedCourses,
    });
  } catch (err) {
    res.status(500).json({
      message: "error while getting purchased courses",
      error: err,
    });
  }
});

userRouter.post(
  "/courses/:courseId",
  userMiddleware,
  async function (req, res) {
    const userId = req.userId;
    const courseId = req.params.courseId;

    try {
      const purchase = await purchaseModel.create({
        userId: userId,
        courseId: courseId,
      });
      res.status(200).json({
        message: "Course purchased successfully",
      });
    } catch (err) {
      res.status(500).json({
        message: "error while purchasing course",
      });
    }
  }
);

module.exports = {
  userRouter: userRouter,
};
