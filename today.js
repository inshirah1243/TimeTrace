console.log("shared loaded?");
console.log(typeof getTodayKey);
console.log(typeof calculateScore);
console.log(typeof formatDuration);
console.log(typeof getCategoryTimes);
function renderTodayMetrics(usage) {
  const totalMs = Object.values(usage).reduce((sum, value) => sum + value, 0);
  document.getElementById('total-time').textContent = formatDuration(totalMs);

  const score = calculateScore(usage);
  const scoreBox = document.querySelector('.score-box');
  if (scoreBox) {const scoreElement = document.getElementById('productivity-score');
  scoreElement.textContent = `${score} / 100`;
  scoreElement.classList.remove(
    'score-excellent',
    'score-good',
    'score-average',
    'score-low',
    'score-poor'
  );
  scoreElement.classList.add(getScoreClass(score));
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

  const categoryTimes = getCategoryTimes(usage);
  document.getElementById('productive-time').textContent = formatDuration(categoryTimes.productiveTime);
  document.getElementById('neutral-time').textContent = formatDuration(categoryTimes.neutralTime);
  document.getElementById('distracting-time').textContent = formatDuration(categoryTimes.distractingTime);

  const domains = Object.keys(usage);
  const sortedSites = domains
    .filter(domain => !ignoredSites.some(item => domain.includes(item)))
    .map(domain => ({ domain, time: usage[domain] }))
    .sort((a, b) => b.time - a.time);

  const websiteList = document.getElementById('website-list');
  websiteList.innerHTML = '';
  if (sortedSites.length === 0) {
    websiteList.innerHTML = '<li>No data yet</li>';
  } else {
    sortedSites.forEach(site => {
      const item = document.createElement('li');
      item.innerHTML = `<span>${site.domain}</span><strong>${formatDuration(site.time)}</strong>`;
      websiteList.appendChild(item);
      const categoryTimes = getCategoryTimes(usage);
    });
  }

  return sortedSites;
}

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

function renderTodayChart(sortedSites) {
  const chartElement = document.getElementById('usageChart');
  const labels = sortedSites.slice(0, 5).map(site => site.domain);
  const data = sortedSites.slice(0, 5).map(site => Math.round(site.time / 1000 / 60));

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
          bottom: 15,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            padding: 12,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            padding: 10,
          },
          grid: {
            color: 'rgba(0,0,0,0.06)',
          },
        },
      },
    },
  });
}

function loadTodayData() {
  chrome.storage.local.get({ usage: {} }, data => {
    const allUsage = data.usage || {};
    const todayUsage = allUsage[getTodayKey()] || {};
    const sortedSites = renderTodayMetrics(todayUsage);
    renderTodayChart(sortedSites);
  });
}

window.addEventListener('DOMContentLoaded', loadTodayData);
