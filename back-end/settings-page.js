const express = require("express");
const path = require("path");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const { Certificate } = require("crypto");

let db = new JsonDB(new Config("./back-end/_database"));

const router = express.Router();

// Show the Settings Page
router.get("/settings", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../front-end/settings-page/settings.html")
  );
});

// Save Settings in DB
router.post("/saveSettings", (req, res) => {
  db.push(`/keys/sk`, req.body["sk"]);
  db.push(`/keys/pk`, req.body["pk"]);
  db.push(`/config/3ds`, req.body["3ds"] ? true : false);
  db.push(`/config/saved-cards`, req.body["saved-cards"] ? true : false);
  db.push(`/config/google-id`, req.body["google-id"]);
  db.push(`/config/apple-id`, req.body["apple-id"]);
  db.push(`/config/apple-cert`, req.body["apple-cert"]);
  db.push(`/config/apple-key`, req.body["apple-key"]);

  res.send({ saved: true });
});

module.exports = router;
