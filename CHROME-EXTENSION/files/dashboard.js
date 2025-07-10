fetch("http://localhost:5000/api/weekly")
  .then((res) => res.json())
  .then((data) => {
    if (!Array.isArray(data) || data.length === 0) {
      document.body.innerHTML += "<p>No data to display.</p>";
      return;
    }

    const labels = data.map(item => item.domain + " (" + item.type + ")");
    const values = data.map(item => Math.round(item.totalTime / 1000));
    const colors = data.map(item => item.type === "productive" ? "green" : "red");

    const ctx = document.getElementById("timeChart").getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Time Spent (seconds)",
          data: values,
          backgroundColor: colors
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Time Spent on Sites"
          },
          legend: {
            display: false
          }
        }
      }
    });
  })
  .catch(err => {
    console.error("Chart load error:", err);
    document.body.innerHTML += "<p>Error loading chart. Is backend running?</p>";
  });
