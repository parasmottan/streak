// generate-streak-svg.js
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
    // 1. Fetch recent public events for streak count
    const events = await fetchGitHub(`/users/${username}/events/public`);
    const dates = [...new Set(events.map(e => e.created_at.split("T")[0]))];
    const today = new Date();
    
    let streak = 0;
    let day = new Date(today);
    
    while(true) {
      const dayStr = day.toISOString().split("T")[0];
      if (dates.includes(dayStr)) {
        streak++;
        day.setDate(day.getDate() - 1);
      } else {
        break;
      }
    }

    // 2. Fetch latest repo
    const repos = await fetchGitHub(`/users/${username}/repos?sort=updated&per_page=1`);
    const latestRepo = repos[0]?.name || "No repo found";

    // 3. Generate SVG content with gradient, icons and shadows
    const svg = `
<svg width="700" height="180" viewBox="0 0 700 180" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub Streak Card">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6a11cb"/>
      <stop offset="100%" stop-color="#2575fc"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <rect width="700" height="180" rx="20" fill="url(#grad)" filter="url(#shadow)" />
  
  <text x="350" y="55" text-anchor="middle" fill="#fff" font-size="28" font-weight="700" font-family="Segoe UI, sans-serif" filter="url(#shadow)">
    🔥 ${streak}-Day Streak Ongoing
  </text>

  <text x="350" y="100" text-anchor="middle" fill="#e0e0e0" font-size="18" font-weight="500" font-family="Segoe UI, sans-serif" letter-spacing="1">
    🧠 Creating on daily basis • Consistent in this field
  </text>

  <text x="350" y="145" text-anchor="middle" fill="#fff" font-size="20" font-weight="600" font-family="Segoe UI, sans-serif" style="text-decoration: underline; cursor: pointer;">
    🛠️ Latest Repo: <tspan fill="#ffdd57">${latestRepo}</tspan>
  </text>
</svg>`;

    // 4. Write to file
    fs.mkdirSync(".github/assets", { recursive: true });
    fs.writeFileSync(outputPath, svg);

    console.log("✅ streak-card.svg updated successfully!");

  } catch (error) {
    console.error("❌ Error generating streak SVG:", error);
  }
})();
