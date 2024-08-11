document.addEventListener('DOMContentLoaded', () => {
    // Load preset values
    browser.storage.local.get('autoRefreshPreset').then((data) => {
      if (data.autoRefreshPreset) {
        document.getElementById('interval').value = data.autoRefreshPreset.interval;
        document.getElementById('textToFind').value = data.autoRefreshPreset.textToFind;
        document.getElementById('matchCase').checked = data.autoRefreshPreset.matchCase;
      }
    });
  
    // Load logs
    browser.runtime.sendMessage({ action: 'getLogs' }).then((logs) => {
      const logsContainer = document.getElementById('logs');
      logsContainer.innerHTML = logs.map(log => `<p>${log}</p>`).join('');
    });
  });
  
  document.getElementById('start').addEventListener('click', () => {
    const interval = parseInt(document.getElementById('interval').value);
    const textToFind = document.getElementById('textToFind').value;
    const matchCase = document.getElementById('matchCase').checked;
  
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tabId = tabs[0].id;
  
      browser.runtime.sendMessage({
        action: 'start',
        interval,
        textToFind,
        matchCase,
        tabId
      });
    });
  });
  
  document.getElementById('stop').addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'stop' });
  });
  
  document.getElementById('savePreset').addEventListener('click', () => {
    const interval = document.getElementById('interval').value;
    const textToFind = document.getElementById('textToFind').value;
    const matchCase = document.getElementById('matchCase').checked;
  
    const preset = { interval, textToFind, matchCase };
    browser.storage.local.set({ 'autoRefreshPreset': preset }).then(() => {
      alert('Preset saved!');
    });
  });
  