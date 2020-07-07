function deleteOptions(option) {
  if(option == 1) {
    browser.storage.local.clear();
    browser.storage.local.set({'deleteStored': 1, 'publicKeys': [] });
  } else if(option == 2) {
    browser.storage.local.remove(['name', 'email', 'myPrivateKey', 'myPublicKey', 'passphrase']);
  } else if(option == 3) {
    browser.storage.local.remove(['publicKeys']);
    browser.storage.local.set({ 'publicKeys': [] });
  }
}

browser.runtime.onInstalled.addListener(function() {
  browser.storage.local.set({ 'publicKeys': [] });
  browser.storage.local.set({ 'deleteStored': 0 });
});

browser.runtime.onConnect.addListener(function(port) {
  port.onDisconnect.addListener(function() {
    browser.storage.local.get({ "deleteStored": 0 }, function(result) {
      deleteOptions(result.deleteStored);
    });
  });
});