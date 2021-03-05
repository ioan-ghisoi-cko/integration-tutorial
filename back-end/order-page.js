const express = require("express");
const path = require("path");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");

// Use the Json file as DB
let db = new JsonDB(new Config("./back-end/_database"));

const router = express.Router();

// Show the Order Page
router.get("/orders", (req, res) => {
  res.sendFile(path.join(__dirname, "../front-end/orders-page/orders.html"));
});

router.get("/getOrders", (req, res) => {
  res.send(db.getData("/orders"));
});

router.post("/updateOrders", (req, res) => {
  let orders = db.getData("/orders");

  orders.forEach((order, index) => {
    if (order.id === req.body.data.id) {
      let currentOrder = db.getData(`/orders[${index}]`);
      db.push(
        `/orders[${index}]`,
        {
          ...currentOrder,
          status: req.body.type,
        },
        true
      );
    }
  });
  res.send("ok");
});

module.exports = router;
