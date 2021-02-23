let form = document.querySelector("#setting-form");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  let data = new FormData(form);
  let body = {};
  for (const [name, value] of data) {
    body[name] = value;
  }

  fetch(window.location.origin + "/saveSettings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Settings Saved");
    })
    .catch((err) => console.error(err));
});
