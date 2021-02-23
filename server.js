const express = require("express");
const path = require("path");
const app = express();
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");

let db = new JsonDB(new Config("./back-end/_database"));

app.use(express.json());
app.use(require("./back-end/checkout-page"));
app.use(require("./back-end/settings-page"));
app.use(require("./back-end/order-page"));
app.use(express.static(path.join(__dirname, "./front-end")));

const port = process.env.PORT || 4242;

// Show the Settings page by default
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./front-end/settings-page/settings.html"));
});

app.listen(port, () => {
  console.log("Server running on: http://localhost:" + port);
});
