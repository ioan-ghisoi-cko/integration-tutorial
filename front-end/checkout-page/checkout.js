var payButton = document.getElementById("pay-button");
// When the page loads get the key from the DB
(function () {
  fetch(window.location.origin + "/getPublicKey", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      googleConfig.allowedPaymentMethods[0].tokenizationSpecification.parameters.gatewayMerchantId =
        data.pk;
      initializeFrames(data.pk);
    })
    .catch((err) => console.error(err));

  fetch(window.location.origin + "/getSaveCard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      showSavedCard(data);
    })
    .catch((err) => console.error(err));
})();

let initializeFrames = (pk) => {
  Frames.init(pk);
};

let showSavedCard = (card) => {
  if (card) {
    document.getElementById("saved-card").style.display = "block";
    let label = document.createElement("label");
    label.htmlFor = "mySaveCard";
    label.innerHTML = `Use your ${card.type} ending in ${card.last4}`;
    let input = document.createElement("input");
    input.type = "checkbox";
    input.name = card.id;
    input.id = "mySaveCard";
    input.value = card.id;
    document.getElementById("saved-card").appendChild(input);
    document.getElementById("saved-card").appendChild(label);
  }
};

Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, (event) => {
  pay(event.token);
});

payButton.addEventListener("click", (event) => {
  if (
    document.getElementById("mySaveCard") &&
    document.getElementById("mySaveCard").checked
  ) {
    pay(document.getElementById("mySaveCard").value);
  } else {
    Frames.submitCard();
  }
});

let pay = (token) => {
  fetch(window.location.origin + "/pay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: token,
      amount: "256",
      currency: "USD",
      reference: "" + Math.floor(Math.random() * 1000000000), // create a random reference
    }),
  })
    .then((response) => response.json())
    .then((payment) => {
      if (payment.requiresRedirect) {
        window.location.href = payment.redirectLink;
      } else {
        alert(payment.status);
      }
    })
    .catch((err) => console.error(err));
};

// Google Pay
let paymentsClient = null;
const googleConfig = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: "CARD",
      parameters: {
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
        allowedCardNetworks: [
          "AMEX",
          "DISCOVER",
          "INTERAC",
          "JCB",
          "MASTERCARD",
          "VISA",
        ],
      },
      tokenizationSpecification: {
        type: "PAYMENT_GATEWAY",
        parameters: {
          gateway: "checkoutltd",
          gatewayMerchantId: "pk_test_f257243a-eed8-478a-954c-5b7fc5a008aa",
        },
      },
    },
  ],
  transactionInfo: {
    countryCode: "US",
    currencyCode: "USD",
    totalPriceStatus: "FINAL",
    totalPrice: "1.00",
  },
};

function getGooglePaymentsClient() {
  if (paymentsClient === null) {
    paymentsClient = new google.payments.api.PaymentsClient({
      environment: "TEST",
    });
  }
  return paymentsClient;
}

function onGooglePayLoaded() {
  const paymentsClient = getGooglePaymentsClient();
  paymentsClient
    .isReadyToPay(googleConfig)
    .then(function (response) {
      if (response.result) {
        addGooglePayButton();
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function addGooglePayButton() {
  const paymentsClient = getGooglePaymentsClient();
  const button = paymentsClient.createButton({
    onClick: onGooglePaymentButtonClicked,
  });
  document.getElementById("google-pay-container").appendChild(button);
}

function onGooglePaymentButtonClicked() {
  googleConfig.allowedPaymentMethods[0].parameters.allowedAuthMethods = [
    "PAN_ONLY",
    "CRYPTOGRAM_3DS",
  ];
  googleConfig.allowedPaymentMethods[0].parameters.allowedCardNetworks = [
    "AMEX",
    "DISCOVER",
    "INTERAC",
    "JCB",
    "MASTERCARD",
    "VISA",
  ];
  googleConfig.transactionInfo.currencyCode = "USD";
  googleConfig.transactionInfo.totalPrice = "256.0";

  const paymentsClient = getGooglePaymentsClient();
  paymentsClient
    .loadPaymentData(googleConfig)
    .then(function (paymentData) {
      processGooglePayment(paymentData);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function processGooglePayment(paymentData) {
  paymentToken = paymentData.paymentMethodData.tokenizationData.token;

  fetch(window.location.origin + "/payGoogle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      signature: JSON.parse(paymentToken).signature,
      protocolVersion: JSON.parse(paymentToken).protocolVersion,
      signedMessage: JSON.parse(paymentToken).signedMessage,
      amount: "256",
      currency: "USD",
      reference: "" + Math.floor(Math.random() * 1000000000), // create a random reference
    }),
  })
    .then((response) => response.json())
    .then((payment) => {
      alert(payment.status);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
