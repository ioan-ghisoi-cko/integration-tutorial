// Get all the orders
(function () {
  fetch(window.location.origin + "/getOrders", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      createTable(data);
    })
    .catch((err) => console.error(err));
})();

const createTable = (rows) => {
  var html = "<table border='1|1'>";
  html += "<th>Order Reference</th><th>Payment Id</th><th>Status</th>";
  for (var i = 0; i < rows.length; i++) {
    html += "<tr>";
    html += "<td>" + rows[i].reference + "</td>";
    html += "<td>" + rows[i].id + "</td>";
    html += "<td>" + rows[i].status + "</td>";

    html += "</tr>";
  }
  html += "</table>";
  document.getElementById("table-area").innerHTML = html;
};
