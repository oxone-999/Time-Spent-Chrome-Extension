function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function displayDomainList() {
  const domainList = document.getElementById("domain-list");

  // Clear the existing list to avoid duplicates
  domainList.innerHTML = "";

  chrome.storage.local.get(null, function (data) {
    for (const domain in data) {
      if (data.hasOwnProperty(domain)) {
        const totalTime = parseInt(data[domain]);
        const listItem = document.createElement("li");

        // Create an image element for the favicon
        const favicon = document.createElement("img");
        favicon.src = `https://www.google.com/s2/favicons?domain=${domain}`;
        favicon.alt = "Favicon";
        favicon.classList.add("favicon");

        // Create a span for the domain and time
        const domainSpan = document.createElement("span");
        domainSpan.textContent = domain;

        const timeSpan = document.createElement("span");
        timeSpan.textContent = totalTime + " s";

        const listDiv = document.createElement("div");
        const timeDiv = document.createElement("div");

        listDiv.classList.add("list-div");
        timeDiv.classList.add("time-div");

        // Append the domain and time span to the list div
        listDiv.appendChild(favicon);
        listDiv.appendChild(domainSpan);

        // Append the time span to the time div
        timeDiv.appendChild(timeSpan);

        // Append the favicon and domain span to the list item
        listItem.appendChild(listDiv);
        listItem.appendChild(timeDiv);

        const info = document.getElementById("chart");

        const infoDiv = document.createElement("div");

        infoDiv.classList.add("info-div");
        infoDiv.style.width = totalTime + "%";
        infoDiv.style.backgroundColor = getRandomColor();

        // Create a tooltip element
        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.textContent = domain; // Replace with your desired tooltip text
        tooltip.style.display = "none"; // Initially hide the tooltip

        // Add event listeners to show/hide tooltip on hover
        infoDiv.addEventListener("mouseenter", () => {
          tooltip.style.display = "block";
        });
        infoDiv.addEventListener("mouseleave", () => {
          tooltip.style.display = "none";
        });

        // Append the tooltip to the infoDiv
        infoDiv.appendChild(tooltip);

        info.appendChild(infoDiv);

        // Append the list item to the domain list
        domainList.appendChild(listItem);
      }
    }
  });
}

// Add an event listener for tab activation changes
chrome.tabs.onActivated.addListener(function (activeInfo) {
  // Update the time when the active tab changes
  displayDomainList();
});

// Call the function to display the domain list when the popup is opened
document.addEventListener("DOMContentLoaded", function () {
  displayDomainList();
});
