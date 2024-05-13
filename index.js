const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5001;
const app = express();
const corsOption = {
  origin: ["http://localhost:5173"],
  Credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOption));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello from doccare...");
});

app.listen(port, () => {
  console.log(`server running on ,${port}`);
});
