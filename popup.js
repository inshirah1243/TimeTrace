function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function renderUsage(usage) {
  const list = document.getElementById('usage-list');
  list.innerHTML = '';

  const domains = Object.keys(usage);
  if (domains.length === 0) {
    list.innerHTML = '<p class="empty-state">No usage data yet.</p>';
    return;
  }

  domains
    .sort((a, b) => usage[b] - usage[a])
    .forEach((domain) => {
      const item = document.createElement('div');
      item.className = 'usage-item';
      item.innerHTML = `
        <strong>${domain}</strong>
        <span>${formatDuration(usage[domain])}</span>
      `;
      list.appendChild(item);
    });
}

function loadUsage() {
  chrome.storage.local.get(
    { usage: {} },
    (data) => {
      const today =
        new Date()
          .toISOString()
          .split("T")[0];
      const usage =
        data.usage?.[today] || {};
      renderPopup(usage);
    }
  );
}

function renderPopup(usage) {
  const total =
    Object.values(usage)
      .reduce((a,b)=>a+b,0);
  document.getElementById(
    "screen-time"
  ).textContent =
    formatDuration(total);

  const score =
    calculateScore(usage);
  document.getElementById(
    "popup-score"
  ).textContent =
    `${score}/100`;

  document.getElementById(
    "popup-message"
  ).textContent =
    getDailyMessage(score);

  const categoryTimes =
    getCategoryTimes(usage);

  document.getElementById(
    "productive-time"
  ).textContent =
    formatDuration(
      categoryTimes.productiveTime
    );

  document.getElementById(
    "neutral-time"
  ).textContent =
    formatDuration(
      categoryTimes.neutralTime
    );

  document.getElementById(
    "distracting-time"
  ).textContent =
    formatDuration(
      categoryTimes.distractingTime
    );
  renderTopSites(usage);
}

function renderTopSites(usage) {
  const container =
    document.getElementById("top-sites");
  container.innerHTML = "";
  const sortedSites =
    Object.entries(usage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  sortedSites.forEach(([site, time]) => {
    const div =
      document.createElement("div");
    div.className = "site-item";
    div.innerHTML = `
      <span>${site}</span>
      <strong>${formatDuration(time)}</strong>
    `;

    container.appendChild(div);
  });
}

function openDashboard() {
  const dashboardUrl = chrome.runtime.getURL('dashboard.html');
  chrome.tabs.create({ url: dashboardUrl });
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    loadUsage();
    setInterval(  loadUsage,5000);
    const todayCard = document.getElementById('today-card');
    if (todayCard) {
      todayCard.addEventListener('click', () => {
        chrome.tabs.create({
        url: chrome.runtime.getURL('today.html')  
        });
      });
    }
    document.getElementById("open-dashboard").addEventListener("click",openDashboard);
  }
);