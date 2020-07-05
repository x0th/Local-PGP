function deleteOptions(option) {
  if(option == 1) {
    chrome.storage.local.clear();
    chrome.storage.local.set({'deleteStored': 1, 'publicKeys': [] });
  } else if(option == 2) {
    chrome.storage.local.remove(['name', 'email', 'myPrivateKey', 'myPublicKey', 'passphrase']);
  } else if(option == 3) {
    chrome.storage.local.remove(['publicKeys']);
    chrome.storage.local.set({ 'publicKeys': [] });
  }
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({ 'publicKeys': [] });
  chrome.storage.local.set({ 'deleteStored': 0 });
});

chrome.runtime.onConnect.addListener(function(port) {
  port.onDisconnect.addListener(function() {
    chrome.storage.local.get({ "deleteStored": 0 }, function(result) {
      deleteOptions(result.deleteStored);
    });
  });
});