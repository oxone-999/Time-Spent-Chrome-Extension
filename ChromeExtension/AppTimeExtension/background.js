let activeTabId = null;
let startTime = null;
let previousTime = null;
let today = new Date().toLocaleDateString(); // To keep track of the current day
let previousDomain = null;

function saveDataToStorage(domain, elapsedTime) {
  return new Promise((resolve) => {
    chrome.storage.local.get(domain, function (data) {
      const previousTotalTime = data[domain] || 0;

      console.log(previousDomain,previousTotalTime, elapsedTime);

      // Update the storage with the new total time for the domain
      chrome.storage.local.set(
        { [domain]: previousTotalTime + elapsedTime },
        function () {
          resolve();
        }
      );
    });
  });
}

chrome.tabs.onActivated.addListener(async function (activeInfo) {
  activeTabId = activeInfo.tabId;

  // Check if the current day is different from the stored day
  const currentDate = new Date().toLocaleDateString();
  if (today !== currentDate || startTime === null) {
    today = currentDate; // Update the current day
    startTime = new Date().getTime(); // Reset the start time
    previousTime = new Date().getTime(); // Reset the end time
  }

  startTime = new Date().getTime(); // Update the start time

  // Check if the current tab is in the same domain as the previous tab
  const tab = await chrome.tabs.get(activeTabId);
  const tabUrl = tab.url;
  const domainName = new URL(tabUrl).hostname;

  if (previousDomain && previousDomain !== domainName) {
    const elapsedTime = (startTime - previousTime) / 1000;

    // Save the data and wait for it to complete
    await saveDataToStorage(previousDomain, elapsedTime);

    previousTime = startTime;
  }

  previousDomain = domainName;
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.tabs.create({
      url: "onboarding.html",
    });
  }
});

// Save data when the extension is unloaded (browser closed)
chrome.runtime.onSuspend.addListener(async function () {
  if (previousDomain) {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - previousTime;

    // Save the data and wait for it to complete
    await saveDataToStorage(previousDomain, elapsedTime);
  }
});
