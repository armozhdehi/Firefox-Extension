let intervalId = null;
let logs = [];

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    const { interval, textToFind, matchCase, tabId } = request;

    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Log the start action
    logs.push(`Started checking for "${textToFind}" every ${interval} ms.`);

    // Start the interval
    intervalId = setInterval(() => {
      browser.tabs.executeScript(tabId, {
        code: `
          const textToFind = "${textToFind}";
          const bodyText = document.body.innerText;
          ${matchCase ? `bodyText.includes(textToFind)` : `bodyText.toLowerCase().includes(textToFind.toLowerCase())`}
        `
      }).then((results) => {
        if (results[0]) {
          clearInterval(intervalId);
          logs.push(`Text "${textToFind}" found. Stopping the refresh.`);
          browser.tabs.update(tabId, { active: true }).then(() => {
            alert('Text found!');
          });
        } else {
          logs.push(`Text "${textToFind}" not found. Refreshing the page.`);
          browser.tabs.reload(tabId, { bypassCache: true });
        }
      }).catch((error) => {
        logs.push(`Error: ${error.message}`);
        console.error('Error executing script:', error);
      });
    }, interval);

  } else if (request.action === 'stop') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      logs.push('Stopped checking.');
    }
  } else if (request.action === 'getLogs') {
    sendResponse(logs);
  }
});

// Ensure the interval is cleared if the extension is unloaded
browser.runtime.onSuspend.addListener(() => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
});
