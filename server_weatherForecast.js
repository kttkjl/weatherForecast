const express = require("express");
const path = require("path");
const app = express();
const port = 50051;

// Use built directory and normal public directory
app.use(express.static(path.join(__dirname, "build")));
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Weatherforecast app listening on port ${port}!`);
});
