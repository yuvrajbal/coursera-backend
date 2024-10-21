const { Router } = require("express");
const { courseModel } = require("../db");
const courseRouter = Router();

courseRouter.post("/purchase", function (req, res) {
  res.json({
    msg: "buy course",
  });
});
courseRouter.get("/preview", function (req, res) {
  res.json({
    msg: "course preview endpoint",
  });
});

courseRouter.get("/allcourses", async function (req, res) {
  try {
    const courses = await courseModel.find();
    res.status(200).json({
      message: "fetched courses",
      courses: courses,
    });
  } catch (err) {
    res.status(500).json({ message: "error while fetching courses from db" });
  }
});

module.exports = {
  courseRouter: courseRouter,
};
