var message;

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

function popupDecrypt(selection) {
  var sel =  selection.slice(0, 27) + '\n' +  selection.slice(28, 55) + '\n' +  selection.slice(56, 88) + '\n\n' +  selection.slice(88,  selection.length - 31) + '\n' +  selection.slice( selection.length - 31,  selection.length - 25) + '\n' +  selection.slice( selection.length - 25) + '\n';

  chrome.storage.local.get({"myPublicKey": null, "myPrivateKey": null, "passphrase": null, "contextMenus": [false, false, false]}, async function(result) {
    var myPublicKey = result.myPublicKey;
    var myPrivateKey = result.myPrivateKey;
    var passphrase = result.passphrase;
    const { keys: [privateKey] } = await openpgp.key.readArmored(myPrivateKey);
    await privateKey.decrypt(passphrase);

    const { data: decrypted } = await openpgp.decrypt({
          message: await openpgp.message.readArmored(sel),
          publicKeys: (await openpgp.key.readArmored(myPublicKey)).keys,
          privateKeys: [privateKey]
      });

    if(result.contextMenus[0])
      message = decrypted;

    if(result.contextMenus[1]) {
      var selectArea = document.createElement('textarea');
      document.body.appendChild(selectArea);
      selectArea.value = decrypted;
      selectArea.select();
      document.execCommand('copy');
    }

    if(result.contextMenus[2])
      chrome.notifications.create({ type: "basic", title: "Decrypted message", message: decrypted, iconUrl: "icons/icon_128.png" });
  });
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({ 'publicKeys': [] });
  chrome.storage.local.set({ 'deleteStored': 0 });
  chrome.storage.local.set({ 'contextMenus': [true, false, false] });
  chrome.contextMenus.create({ id: 'decrypt', title: 'Decrypt', contexts: ['selection'] });

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
      popupDecrypt(info.selectionText);
  });

  var imported = document.createElement('script');
  imported.src = '/openpgp.min.js';
  document.head.appendChild(imported);
});

chrome.runtime.onConnect.addListener(function(port) {
  if(message != null)
    port.postMessage({ message: message });

  port.onMessage.addListener(function(msg) {
    if(msg.seen)
      message = null;
  });

  port.onDisconnect.addListener(function() {
    chrome.storage.local.get({ "deleteStored": 0 }, function(result) {
      deleteOptions(result.deleteStored);
    });
  });
});