function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Function to populate the date selector dropdown
function populateDateSelector(data) {
  const selectDate = document.getElementById("select-date");

  // Create a Set to store unique dates
  const uniqueDates = new Set();

  // Iterate through the data and extract the dates
  for (const domain in data) {
    if (data.hasOwnProperty(domain)) {
      const domainData = data[domain];
      for (const date in domainData) {
        if (domainData.hasOwnProperty(date)) {
          // Add the date to the Set if it's not already there
          uniqueDates.add(date);
        }
      }
    }
  }

  // Convert the Set back to an array
  const sortedDates = Array.from(uniqueDates).sort();

  // Create an option element for each date
  sortedDates.forEach((date) => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    selectDate.appendChild(option);
  });

  // Add an event listener to handle date selection
  selectDate.addEventListener("change", function () {
    const selectedDate = this.value;
    // Call a function to update the list based on the selected date
    displayDomainList(selectedDate);
  });
}

// Function to display domain list for a specific date
function displayDomainList(selectedDate) {
  const domainList = document.getElementById("domain-list");

  // Clear the existing list to avoid duplicates
  domainList.innerHTML = "";

  //iterate through the data and sum all the totaltime for the selected date
  let accTime = 0;
  //collect the top five domains according to the time spent on them
  let topFive = [];

  chrome.storage.local.get(null, function (data) {
    for (const domain in data) {
      if (data.hasOwnProperty(domain)) {
        const domainData = data[domain];
        accTime += domainData[selectedDate] || 0;
        topFive.push([domain, domainData[selectedDate] || 0]);
      }
    }

    //sort the top five domains according to the time spent on them
    topFive.sort(function (a, b) {
      return b[1] - a[1];
    });

    //get the top five domains
    topFive = topFive.slice(0, 5);
    console.log(topFive);

    //iterate through the data and display the top five domains
    try {
      for (let i = 0; i < topFive.length; i++) {
        const domain = topFive[i];
        console.log(domain);
        const topDiv = document.getElementById("top-five");
        const list = document.createElement("div");
        list.classList.add("top-list");
        const domainSpan = document.createElement("span");
        domainSpan.textContent = domain[0];
        const timeSpan = document.createElement("span");
        timeSpan.textContent = (domain[1] / 3600).toFixed(3) + " h";
        list.appendChild(domainSpan);
        list.appendChild(timeSpan);
        topDiv.appendChild(list);
      }
    } catch (error) {
      // Handle errors here, e.g., log the error or show an error message
      console.error("An error occurred:", error);
    }
  });

  chrome.storage.local.get(null, function (data) {
    for (const domain in data) {
      if (data.hasOwnProperty(domain)) {
        const domainData = data[domain];
        let totalTime = domainData[selectedDate] || 0;
        const width = totalTime;
        totalTime /= 3600; // Convert seconds to hours
        //show in two deciaml places
        totalTime = totalTime.toFixed(3);
        const listItem = document.createElement("li");

        // Create an image element for the favicon
        const favicon = document.createElement("img");
        // favicon.src = `https://www.google.com/s2/favicons?domain=${domain}`;
        favicon.alt = "Favicon";
        favicon.classList.add("favicon");

        // Create a span for the domain and time
        const domainSpan = document.createElement("span");
        domainSpan.textContent = domain;

        const timeSpan = document.createElement("span");
        timeSpan.textContent = totalTime + " h";

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
        infoDiv.style.width = (width / accTime) * 100 + "%";
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

// Call the function to populate the date selector when the popup is opened
document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(null, function (data) {
    populateDateSelector(data);
    // Initially, display the domain list for the first date in the dropdown
    const firstDate = document.getElementById("select-date").value;
    console.log(firstDate);
    console.log(new Date().toLocaleDateString());
    displayDomainList(firstDate);
  });
});
