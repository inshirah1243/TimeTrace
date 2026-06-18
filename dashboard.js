console.log("Chart =", typeof Chart);
function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainder}s`;
  }
  return `${remainder}s`;
}

function renderMetrics(usage) {
  const totalMs = Object.values(usage).reduce((sum, value) => sum + value, 0);
  const domains = Object.keys(usage);
  const sortedSites = domains
  .filter(
    domain =>
      !ignoredSites.some(item =>
        domain.includes(item)
      )
  )
  .map((domain) => ({
    domain,
    time: usage[domain]
  })).sort((a, b) => b.time - a.time);
  document.getElementById('total-time').textContent = formatDuration(totalMs);
  document.getElementById('site-count').textContent = domains.length;
  const score = calculateScore(usage);
  const scoreElement =
  document.getElementById('productivity-score');
  scoreElement.textContent = `${score} / 100`;
  scoreElement.classList.remove(
    "score-excellent",
    "score-good",
    "score-average",
    "score-low",
    "score-poor"
  );
  scoreElement.classList.add(
    getScoreClass(score)
  );


  const scoreBox = document.querySelector('.score-box');
  if (scoreBox) {
    scoreBox.classList.remove(
      'score-excellent-card',
      'score-good-card',
      'score-average-card',
      'score-low-card',
      'score-poor-card'
    );
    if (typeof score === 'number') {
      scoreBox.classList.add(`${getScoreClass(score)}-card`);
    }
  }

  const motivationMessageElement = document.getElementById('productivity-message');
  if (motivationMessageElement) {
    if (score !== 'N/A' && typeof score === 'number') {
      const motivationMessage = getDailyMessage(score);
      motivationMessageElement.textContent = motivationMessage;
    } else {
      motivationMessageElement.textContent = 'Start browsing to generate insights.';
    }
  }

    /*const topSitesElement = document.getElementById('top-sites');
    topSitesElement.innerHTML = '';
    if (sortedSites.length === 0) {
        topSitesElement.innerHTML = '<li>No tracked sites yet</li>';
    } else {
        sortedSites.slice(0, 5).forEach((site) => {
        const item = document.createElement('li');
        item.textContent = `${site.domain} • ${formatDuration(site.time)}`;
        item.innerHTML = `
        <span>${site.domain}</span>
        <strong>${formatDuration(site.time)}</strong>`;
        topSitesElement.appendChild(item);
        });
      } */
    
    const mostUsedSiteElement =document.getElementById('most-used-site');
      if (mostUsedSiteElement) {
        if (sortedSites.length > 0) {
          mostUsedSiteElement.textContent =`${sortedSites[0].domain} • ${formatDuration(sortedSites[0].time)}`;
        } else {
          mostUsedSiteElement.textContent = 'No data yet';
        }
      }
        
  return sortedSites;
}

function renderChart(sortedSites) {
  const chartElement = document.getElementById('usageChart');
  const labels = sortedSites.slice(0, 5).map((site) => site.domain);
  const data = sortedSites.slice(0, 5).map((site) => Math.round(site.time / 1000 / 60));

  if (window.timeTraceChart) {
    window.timeTraceChart.destroy();
  }

  window.timeTraceChart = new Chart(chartElement, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Minutes spent',
          data,
          backgroundColor: '#3b82f6',
          borderRadius: 12,
          maxBarThickness: 42,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      layout: {
        padding: {
          top: 20,
          right: 20,
          left: 20,
          bottom: 15
        }
      },

      plugins: {
        legend: {
          display: false
        }
      },

      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            padding: 12
          }
        },

        y: {
          beginAtZero: true,

          ticks: {
            padding: 10
          },

          grid: {
            color: 'rgba(0,0,0,0.06)'
          }
        }
      }
    }
  });
}

function getFrequentlyUsedSites(allUsage) {
  const combined = {};
  Object.values(allUsage).forEach(dayUsage => {
    Object.entries(dayUsage).forEach(([domain, time]) => {
      combined[domain] = (combined[domain] || 0) + time;
    });
  });

  return Object.entries(combined)
    .map(([domain, time]) => ({domain,time}))
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);
}

function loadDashboardData() {
  chrome.storage.local.get({ usage: {} }, (data) => {
    const allUsage = data.usage || {};
    const todayUsage = allUsage[getTodayKey()] || {};
    renderMetrics(todayUsage);
    const days = Object.keys(allUsage);
    const frequentSites = getFrequentlyUsedSites(allUsage);
    renderChart(frequentSites);

    const average = calculateDailyAverage(allUsage);
    document.getElementById("daily-average").textContent =average? formatDuration(average): "No data yet";
    document.getElementById("tracked-days" ).textContent =
    `Based on ${days.length} tracked day${days.length === 1 ? "" : "s"}`;

    let totalScore = 0;
    days.forEach(day => {totalScore += calculateScore(allUsage[day]);
    });
    const averageScore =days.length > 0? Math.round(totalScore / days.length): 0; // avg prod score
    document.getElementById("average-score").textContent =`${averageScore} / 100`;
    const avgScoreElement =
  document.getElementById("average-score");
    avgScoreElement.classList.remove(
      "score-excellent",
      "score-good",
      "score-average",
      "score-low",
      "score-poor"
    );

    avgScoreElement.classList.add(
      getScoreClass(averageScore)
    );
    });

}

function calculateDailyAverage(allUsage) {
  const days = Object.keys(allUsage);

  if (days.length === 0) {
    return null;
  }
  let totalTime = 0;
  days.forEach(day => {
    totalTime += Object.values(
      allUsage[day]
    ).reduce(
      (sum, value) => sum + value,
      0
    );
  });

  return totalTime / days.length;
}

window.addEventListener(
  'DOMContentLoaded',
  () => {
    loadDashboardData();
    const todayCard = document.getElementById('today-card');
    if (todayCard) {
      todayCard.addEventListener('click', () => {
        window.location.href = 'today.html';
      });
    }

    setInterval(() => {loadDashboardData();}, 5000);
  }
);
 