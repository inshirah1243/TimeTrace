let currentTabId = null;
let currentDomain = null;
let currentStart = null;

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}
function getDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}


function saveTime(domain, durationMs) {
  if (!domain || durationMs <= 0) return;
  chrome.storage.local.get({ usage: {} }, (data) => {
    const usage = data.usage || {};
    const today = getTodayKey(); //daily tracking
    if (!usage[today]) {
      usage[today] = {};
    }
    usage[today][domain] =
      (usage[today][domain] || 0) + durationMs;
    chrome.storage.local.set({ usage });
  });
}

function commitCurrentUsage() {
  if (!currentDomain || currentStart === null) {
    return;
  }

  const elapsed = Date.now() - currentStart;
  if (elapsed > 0) {
    saveTime(currentDomain, elapsed);
  }

  currentStart = null;
}

function setActiveState(tab) {
  const domain = tab ? getDomain(tab.url) : null;
  const tabId = tab ? tab.id : null;

  if (tabId === currentTabId && domain === currentDomain && currentStart !== null) {
    return;
  }

  commitCurrentUsage();
  currentTabId = tabId;
  currentDomain = domain;
  currentStart = tab ? Date.now() : null;
}

function getActiveTab(callback) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    callback(tabs[0] || null);
  });
}

function handleActiveTabChange() {
  getActiveTab((tab) => {
    setActiveState(tab);
  });
}

function handleWindowFocusChanged(windowId) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    commitCurrentUsage();
    currentTabId = null;
    currentDomain = null;
    return;
  }

  handleActiveTabChange();
}

function handleTabUpdated(tabId, changeInfo, tab) {
  if (tabId !== currentTabId) {
    return;
  }

  if (changeInfo.url) {
    setActiveState(tab);
  }
}

function initializeUsageStorage() {
  chrome.storage.local.get({ usage: {} }, (data) => {
    if (!data.usage) {
      chrome.storage.local.set({ usage: {} });
    }
  });
}

chrome.tabs.onActivated.addListener(handleActiveTabChange);
chrome.windows.onFocusChanged.addListener(handleWindowFocusChanged);
chrome.tabs.onUpdated.addListener(handleTabUpdated);
chrome.runtime.onStartup.addListener(handleActiveTabChange);
chrome.runtime.onInstalled.addListener(() => {
  initializeUsageStorage();
  handleActiveTabChange();
});
chrome.runtime.onSuspend.addListener(() => {
  commitCurrentUsage();
});
