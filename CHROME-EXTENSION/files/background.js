let currentTab = null;
let startTime = null;

// Classify domain as productive or unproductive
function classifyDomain(domain) {
  const productiveSites = [
    "github.com",
    "stackoverflow.com",
    "w3schools.com",
    "localhost",
    "developer.mozilla.org"
  ];

  return productiveSites.includes(domain) ? "productive" : "unproductive";
}

// Tab switched
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleTabChange(tab);
});

// Tab reloaded or navigated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    handleTabChange(tab);
  }
});

function handleTabChange(tab) {
  if (!tab.url || !tab.url.startsWith("http")) return;

  const now = Date.now();

  if (currentTab && startTime) {
    const timeSpent = now - startTime;
    const url = new URL(currentTab.url);
    const domain = url.hostname.replace("www.", "");
    const type = classifyDomain(domain);

    console.log("Switched from:", domain);
    console.log("Time spent:", timeSpent, "ms");
    console.log("Type:", type);

    saveTime(domain, timeSpent, type);
  }

  currentTab = tab;
  startTime = now;
  console.log("Started tracking:", tab.url);
}

function saveTime(domain, time, type) {
  console.log("Sending to backend:", domain, time, type);

  fetch("http://localhost:5000/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain, time, type })
  })
    .then((res) => {
      console.log("Backend responded:", res.status);
    })
    .catch((err) => {
      console.error("Error sending to backend:", err);
    });
}
