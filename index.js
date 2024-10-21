const express = require("express");
const { courseRouter } = require("./routes/course");
const { userRouter } = require("./routes/user");
const { adminRouter } = require("./routes/admin");

const mongoose = require("mongoose");
const cors = require("cors");
const { createRouteHandler } = require("uploadthing/express");
const uploadRouter = require("./routes/uploadthing");
// const admin = require("./routes/admin");

require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors());

const MONGODB_URI = process.env.MONGODB_URI;

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: {
      token: process.env.UPLOADTHING_TOKEN,
    },
  })
);
app.use("/user", userRouter);
app.use("/course", courseRouter);
app.use("/admin", adminRouter);

async function main() {
  await mongoose.connect(MONGODB_URI);
  app.listen(5000, () => {
    console.log("SERVER IS RUNNING ON PORT 5000");
  });
}
main();
