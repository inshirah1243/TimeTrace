const productiveSites = [
    "github.com",
    "stackoverflow.com",
    "chatgpt.com",
    "freecodecamp.org",
    "codechef.com",
    "leetcode.com",
    "https://gnits963.examly.io/",
    "geeksforgeeks.org",
    "w3schools.com",
    "coursera.org",
    "infyspringboard.onwingspan.com",
    "udemy.com",
    "careerride.com",
    "excler.com",
    "nptel.ac.in",
    "hackerrank.com",
    "kaggle.com",
    "tutorialspoint.com",
    "javatpoint.com",
    "developer.mozilla.org",
    "roadmap.sh"
  ];

const ignoredSites = [
  "extensions",
  "chrome",
  "chrome-extension",
  "localhost",
  "nbbelomappmmlagdjhijinmbhojcifcl",
  "127.0.0.1",
  "cdnjs.com"
];

  const neutralSites = [
    "youtube.com",
    "google.com",
    "gmail.com",
    "drive.google.com",
    "docs.google.com",
    "linkedin.com"
  ];

  const distractingSites = [
    "instagram.com",
    "facebook.com",
    "snapchat.com",
    "x.com",
    "twitter.com",
    "netflix.com/in/",
    "jiohotstar.com",
    "primevideo.com",
    "discord.com",
  ];
const productivityMessages = {
  excellent: [
    "Mission accomplished!!! Your focus was locked in today 🥳",
    "Top performer mode activated 🙂‍↕️",
    "Focus Streak: Legendary 🏆",
    "Time well invested. Every minute counted. ⏳✨"
  ],

  good: [
    "Strong momentum. You're spending time where it matters ⚡",
    "You're building consistency. Keep it going! 🫡",
    "Focus Streak: Epic 🤩",
    "You're spending more time creating than consuming 🔥"
  ],

  average: [
    "Productive with a few detours. Still a solid day",
    "Progress made, but there's room to level up 📈",
    "A productive day with a few distractions along the way 🧭"
  ],

  low: [
    "Focus drift detected. Time to steer back on course 🧭",
    "Looks like focus took a few breaks today 😬",
    "Your attention was split. Tomorrow can be sharper 😗"
  ],

  poor: [
    "Study mode seems to be on vacation 🤡",
    "Focus Streak Broken 💀",
    "High distraction detected 🤯",
    "Mission interrupted. Too many distractions today 😶‍🌫️"
  ]
};

function getDailyMessage(score) {
  let category;
  if (score >= 90) {
    category = productivityMessages.excellent;
  } else if (score >= 75) {
    category = productivityMessages.good;
  } else if (score >= 60) {
    category = productivityMessages.average;
  } else if (score >= 40) {
    category = productivityMessages.low;
  } else {
    category = productivityMessages.poor;
  }
  const today = new Date();
  const seed =
    today.getFullYear() +
    today.getMonth() +
    today.getDate();
  return category[seed % category.length];
}

function calculateScore(usage) {
  let productiveTime = 0;
  let neutralTime = 0;
  let distractingTime = 0;
  for (const site in usage) {
    
    const time = usage[site];
    if (productiveSites.some(domain => site.includes(domain))) {
      productiveTime += time;
    }
    else if (neutralSites.some(domain => site.includes(domain))) {
      neutralTime += time;
    }
    else if (distractingSites.some(domain => site.includes(domain))) {
      distractingTime += time;
    }
    else {
      neutralTime += time;
    }
  }
  const totalTime =
    productiveTime +
    neutralTime +
    distractingTime;
  if (totalTime === 0) {
    return "N/A";
  }
  let score = Math.round(
    (
      productiveTime +
      neutralTime * 0.5 -
      distractingTime
    ) / totalTime * 100
  );
  score = Math.max(0, Math.min(100, score));
  return score;
}

function getScoreClass(score) {
  if (score >= 90) return "score-excellent";
  if (score >= 75) return "score-good";
  if (score >= 60) return "score-average";
  if (score >= 40) return "score-low";
  return "score-poor";
}

function getCategoryTimes(usage) {
  let productiveTime = 0;
  let neutralTime = 0;
  let distractingTime = 0;
  for (const site in usage) {
    if (
      ignoredSites.some(domain =>
        site.includes(domain)
      )
    ) {
      continue;
    }
    const time = usage[site];

    if (
      productiveSites.some(domain =>
        site.includes(domain)
      )
    ) {
      productiveTime += time;
    }
    else if (
      neutralSites.some(domain =>
        site.includes(domain)
      )
    ) {
      neutralTime += time;
    }
    else if (
      distractingSites.some(domain =>
        site.includes(domain)
      )
    ) {
      distractingTime += time;
    }
    else {
      neutralTime += time;
    }
  }

  return {
    productiveTime,
    neutralTime,
    distractingTime
  };
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}
