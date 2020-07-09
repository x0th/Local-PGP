var message;

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

function popupDecrypt(selection) {
  browser.storage.local.get({"myPublicKey": null, "myPrivateKey": null, "passphrase": null, "contextMenus": [false, false, false]}, async function(result) {
    var myPublicKey = result.myPublicKey;
    var myPrivateKey = result.myPrivateKey;
    var passphrase = result.passphrase;
    const { keys: [privateKey] } = await openpgp.key.readArmored(myPrivateKey);
    await privateKey.decrypt(passphrase);

    const { data: decrypted } = await openpgp.decrypt({
          message: await openpgp.message.readArmored(selection),
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
      browser.notifications.create({ type: "basic", title: "Decrypted message", message: decrypted, iconUrl: "icons/icon_128.png" });
  });
}

browser.runtime.onInstalled.addListener(function() {
  browser.storage.local.set({ 'publicKeys': [] });
  browser.storage.local.set({ 'deleteStored': 0 });
  browser.storage.local.set({ 'contextMenus': [true, false, false] });
  browser.contextMenus.create({ id: 'decrypt', title: 'Decrypt', contexts: ['selection'] });

  browser.contextMenus.onClicked.addListener(function(info, tab) {
      popupDecrypt(info.selectionText);
  });

  var imported = document.createElement('script');
  imported.src = '/openpgp.min.js';
  document.head.appendChild(imported);
});

browser.runtime.onConnect.addListener(function(port) {
  if(message != null)
    port.postMessage({ message: message });

  port.onMessage.addListener(function(msg) {
    if(msg.seen)
      message = null;
  });

  port.onDisconnect.addListener(function() {
    browser.storage.local.get({ "deleteStored": 0 }, function(result) {
      deleteOptions(result.deleteStored);
    });
  });
});