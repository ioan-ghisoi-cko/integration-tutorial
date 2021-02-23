const express = require("express");
const path = require("path");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const { Checkout } = require("checkout-sdk-node");

let db = new JsonDB(new Config("./back-end/_database"));

const router = express.Router();

// Show the Checkout Page
router.get("/checkout", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../front-end/checkout-page/checkout.html")
  );
});

// Get the public key needed to initialize Frames
router.get("/getPublicKey", async (req, res) => {
  res.send({
    pk: await db.getData("/keys/pk"),
  });
});

// Get save card
router.get("/getSaveCard", async (req, res) => {
  res.send(await db.getData("/savedCard"));
});

router.post("/pay", async (req, res) => {
  const cko = new Checkout(db.getData("/keys/sk"));
  const use3DS = db.getData("/config/3ds");
  const saveCard = db.getData("/config/saved-cards");

  let source = null;

  // use id source for saved cards
  if (req.body.token.startsWith("src_")) {
    source = {
      id: req.body.token,
    };
  } else {
    source = {
      token: req.body.token,
    };
  }
  let requestBody = {
    source,
    amount: req.body.amount * 100,
    currency: req.body.currency,
    reference: req.body.reference,
  };

  if (use3DS) {
    requestBody["3ds"] = {
      enabled: true,
    };
    requestBody["success_url"] = "http://localhost:4242/outcome";
    requestBody["failure_url"] = "http://localhost:4242/outcome";
  }

  let payment = await cko.payments.request(requestBody);

  db.push(`/orders[]`, {
    timestamp: Date.now(),
    reference: payment.reference,
    id: payment.id,
    status: payment.status,
  });

  if (saveCard && !payment.requiresRedirect) {
    db.push(`/savedCard`, {
      id: payment.source.id,
      last4: payment.source.last4,
      type: payment.source.scheme,
    });
  }

  res.send(payment);
});

router.post("/getPayment", async (req, res) => {
  const ck = new Checkout(db.getData("/keys/sk"));
  try {
    let payment = await ck.payments.get(req.body.id);
    res.send(payment);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// Show the 3DS Outcome Page
router.get("/outcome", (req, res) => {
  res.sendFile(path.join(__dirname, "../front-end/checkout-page/outcome.html"));
});

module.exports = router;
