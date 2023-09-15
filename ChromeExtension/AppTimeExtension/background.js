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

  let domainName = "";
  try {
    const tab = await chrome.tabs.get(activeTabId);
    const tabUrl = tab.url;
    domainName = new URL(tabUrl).hostname;
  } catch (error) {
    console.error("Invalid URL:", error);
    // Send a message to the background script to show an error notification
    chrome.runtime.sendMessage({
      type: "show_error_notification",
      message: "Invalid URL",
    });
    // Handle the error or set domainName to a default value as needed
  }

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

// Add an event listener to handle messages from popup.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "show_error_notification") {
    // Show an error notification using chrome.notifications API
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png", // Replace with your icon URL
      title: "Error",
      message: message.message,
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
