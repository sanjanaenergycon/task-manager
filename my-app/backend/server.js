const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend chal raha hai 🚀");
});

app.post("/api/add-task", (req, res) => {
  console.log("API HIT ✅");
  console.log(req.body);

  res.json({ success: true });
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5000");
});