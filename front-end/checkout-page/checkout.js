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
