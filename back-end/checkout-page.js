const express = require("express");
const path = require("path");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const { Checkout } = require("checkout-sdk-node");

// Use the Json file as DB
let db = new JsonDB(new Config("./back-end/_database"));

// Initialize the Checkout.com SDK
const cko = new Checkout(db.getData("/keys/sk"), {
  pk: db.getData("/keys/pk"),
});

const router = express.Router();

// Show the Checkout Page
router.get("/checkout", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../front-end/checkout-page/checkout.html")
  );
});

// Show the 3DS Outcome Page
router.get("/outcome", (req, res) => {
  res.sendFile(path.join(__dirname, "../front-end/checkout-page/outcome.html"));
});

router.get("/getPublicKey", async (req, res) => {
  res.send({
    pk: await db.getData("/keys/pk"),
  });
});

router.get("/getConfig", async (req, res) => {
  res.send(await db.getData("/config"));
});

router.get("/getSaveCard", async (req, res) => {
  res.send(await db.getData("/savedCard"));
});

router.post("/pay", async (req, res) => {
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

router.post("/payGoogle", async (req, res) => {
  try {
    let token = await cko.tokens.request({
      token_data: {
        protocolVersion: req.body.protocolVersion,
        signature: req.body.signature,
        signedMessage: req.body.signedMessage,
      },
    });

    let payment = await cko.payments.request({
      source: {
        token: token.token,
      },
      amount: req.body.amount * 100,
      currency: req.body.currency,
      reference: req.body.reference,
    });

    db.push(`/orders[]`, {
      timestamp: Date.now(),
      reference: payment.reference,
      id: payment.id,
      status: payment.status,
    });

    res.send(payment);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.post("/getPayment", async (req, res) => {
  try {
    let payment = await cko.payments.get(req.body.id);
    res.send(payment);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

module.exports = router;
