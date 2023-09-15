let startTime = new Date().getTime();

// Listen for the window's unload event (e.g., when a tab is closed)
window.addEventListener("unload", function () {
  const endTime = new Date().getTime();
  const elapsedTime = (endTime - startTime) / 1000; // in seconds

  // Store or process the elapsedTime as needed
  console.log("Time spent on this page: " + elapsedTime + " seconds");
});
