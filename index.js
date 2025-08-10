const express = require("express");
const dotenv = require("dotenv");
const schoolsRouter = require("./routes/schools");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", schoolsRouter);

app.get("/", (req, res) => {
  res.send({ success: true, message: "School Management API is running" });
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
