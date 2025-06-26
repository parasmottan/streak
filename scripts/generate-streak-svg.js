// ✅ scripts/generate-streak-svg.js
const fs = require("fs");
const https = require("https");

const username = "parasmottan";
const outputPath = ".github/assets/streak-card.svg";

function fetchGitHub(endpoint) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: "api.github.com",
      path: endpoint,
      headers: { "User-Agent": "Node.js" },
    }, res => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

(async () => {
  try {
    // 1. Get events to calculate streak
    const events = await fetchGitHub(`/users/${username}/events/public`);
    const dates = events.map(e => e.created_at.split("T")[0]);
    const today = new Date().toISOString().split("T")[0];

    let streak = 0;
    let date = new Date();

    for (;;) {
      const dateStr = date.toISOString().split("T")[0];
      if (dates.includes(dateStr)) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else break;
    }

    // 2. Get latest repo
    const repos = await fetchGitHub(`/users/${username}/repos?sort=updated&per_page=1`);
    const latestRepo = repos[0]?.name || "No repo found";

    // 3. Generate SVG
    const svg = `
<svg viewBox="0 0 700 150" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bg { fill: url(#grad); }
    .text1 { font: 700 20px 'Segoe UI', sans-serif; fill: #fff; text-anchor: middle; }
    .text2 { font: 600 14px 'Segoe UI', sans-serif; fill: #fff; text-anchor: middle; }
  </style>
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#84fab0"/>
      <stop offset="100%" stop-color="#8fd3f4"/>
    </linearGradient>
  </defs>
  <rect class="bg" width="700" height="150" rx="16"/>
  <text x="50%" y="45" class="text1">🔥 ${streak}-day streak ongoing</text>
  <text x="50%" y="80" class="text2">🧠 Creating on daily basis • Consistent in this field</text>
  <text x="50%" y="115" class="text2">🛠️ Latest Repo: ${latestRepo}</text>
</svg>`;

    fs.writeFileSync(outputPath, svg);
    console.log("✅ streak-card.svg updated");
  } catch (err) {
    console.error("❌ Failed to update streak card:", err);
  }
})();
