'use strict';

const nameToStore = document.getElementById('store-name');
const keyToStore = document.getElementById('store-key');

const keyListShow = document.getElementById('public-keys-show');
const keyListUse = document.getElementById('public-keys-use');

const generateButton = document.getElementById('generate');

const userGenerateContainer = document.getElementById('user-generate');

var redirectOption;

/*
	Change the tab shown to user
	tab: string id of the tab div, has to be of tabcontent class
*/
function changeTab(tab) {
	var i, tabcontent, tablinks;

	tabcontent = document.getElementsByClassName("tabcontent");
  	for (i = 0; i < tabcontent.length; i++) {
    	tabcontent[i].style.display = "none";
  	}

  	document.getElementById(tab).style.display = "block";
}

/*
	Download file in json format to the browser Downloads location
	options: filename -- name of the file, content -- body of the file
*/
function downloadFile(options) {
    var blob = new Blob([ options.content ], {type : "application/json;charset=UTF-8"});
    options.url = window.URL.createObjectURL(blob);
    browser.downloads.download({
        url: options.url,
        filename: options.filename
    });
}

/*
	Add public key from #store-key with a name from #store-name to the DB
*/
function addPublicKey() {
	var name = nameToStore.value;
	var key = keyToStore.value;
	browser.storage.local.get(['publicKeys'], function(result) {
		var publicKeys = result.publicKeys;
		var ent = publicKeys.find(entry => entry.name == name);
		if(ent == null) {
			publicKeys.push({ name: name, key: key });
			browser.storage.local.set({ publicKeys: publicKeys });
			getKeyList(true);
			nameToStore.value = '';
			keyToStore.value = '';
		}
	});
}

/*
	Selects which tab to open after #me was clicked (depends on whether or not personal credentials are stored)
*/
function selectView() {
	browser.storage.local.get({ "name": null }, function(result) {
		console.log(result.name);
		if(result.name == null)
			changeTab('user-none');
		else
			changeTab('user-main');
	});
}

/*
	Shows personal credentials to user on #user-info-tab
*/
function populateInfo() {
	browser.storage.local.get({ "name": "", "email": "", "myPrivateKey": "", "myPublicKey": "" }, function(result) {
		document.getElementById('name-info').value = result.name;
		document.getElementById('email-info').value = result.email;
		document.getElementById('privateKey-info').value = result.myPrivateKey;
		document.getElementById('publicKey-info').value = result.myPublicKey;
	});
}

/*
	Check if entered passphrase is valid and take appropriate actionn
*/
function redirectPass() {
	browser.storage.local.get({ passphrase: null }, function (result) {
		console.log(result.passphrase);
		if(result.passphrase == document.getElementById('pass-text').value) {
			document.getElementById('pass-text').value = '';
			console.log(redirectOption);
			if(redirectOption) {
				populateInfo();
				changeTab('user-info-tab');
			} else {
				browser.storage.local.remove(['name', 'privateKey', 'publicKey', 'passphrase'], function() {
					changeTab('user-none');
				});
			}
		} else
			document.getElementById('pass-text').value = 'Incorrect passphrase';
	});
}

/*
	Download personal credentials
*/
function downloadUser() {
	browser.storage.local.get({ "name": "", "email": "", "myPrivateKey": "", "myPublicKey": "" }, function(result) {
		downloadFile({ filename: "credentials.json", content: JSON.stringify(result) });
	});
}

/*
	Copy content from a textarea to clipboard
	event: button click event (presumably of id *textarea-id*-copy)
*/
function copyContent(event) {
	let textarea = document.getElementById(event.target.id.split("-copy")[0]);
	textarea.select();
	document.execCommand('copy');
}

/*
	Get public key from storage by name, display in area
	name: name associated with stored key
	area: id of html element to display in
*/
function getPublicKey(name, area) {
	browser.storage.local.get(['publicKeys'], function(result) {
		var publicKeys = result.publicKeys;
		var key = publicKeys.find(entry => entry.name === name);
		if(key != null)
			key = key.key;
		if(area)
			document.getElementById(area).value = key;
	});
}

/*
	Get list of public keys from browser storage, either update selection boxes or download them
	show: boolean; true -- update selection boxes (#public-keys-show, #public-keys-use); false -- download list as a json file
*/
function getKeyList(show) {
	browser.storage.local.get(['publicKeys'], function(result) {
		var publicKeys = result.publicKeys;
		if(show) {
			if(publicKeys) {
				for(var i = 0; i < publicKeys.length; i++) {
					var optionShow = document.createElement('option');
					optionShow.value = publicKeys[i].name;
					optionShow.text = publicKeys[i].name;
					keyListShow.appendChild(optionShow);
					
					var optionUse = document.createElement('option');
					optionUse.value = publicKeys[i].name;
					optionUse.text = publicKeys[i].name;
					keyListUse.appendChild(optionUse);
				}
			}
		} else {
			downloadFile({filename: "stored_public_keys.json", content: JSON.stringify(publicKeys)});
		}
	});
}

/*
	Set user creds entered in #user-enter
*/
function addExistingCreds() {
	browser.storage.local.set({
		name: document.getElementById('name-enter').value, 
		email: document.getElementById('email-enter').value,
		myPrivateKey: document.getElementById('privateKey-enter').value, 
		myPublicKey: document.getElementById('publicKey-enter').value, 
		passphrase: document.getElementById('passphrase-enter').value }, function() { changeTab('user-main'); });
}

/*
	Generate public and private keys using openpgp.js, store them
*/
async function generateKey() {
	var nameVal= document.getElementById('name').value;
	var emailVal = document.getElementById('email').value;
	var passVal = document.getElementById('passphrase').value;
	const { privateKeyArmored, publicKeyArmored, revocationCertificate } = await openpgp.generateKey({
		userIds: [{ name: nameVal, email: emailVal }],
		curve: 'ed25519',
		passphrase: passVal
	});

	browser.storage.local.set({ name: nameVal, email: emailVal, myPrivateKey: privateKeyArmored, myPublicKey: publicKeyArmored, passphrase: passVal });

	var msg = document.createElement('p');
	msg.innerHTML = "Remember to store the generated keys and your passphrase in a secure place!";
	generateButton.parentNode.insertBefore(msg, generateButton.nextSibling);

	document.getElementById('privateKey').value = privateKeyArmored;
	document.getElementById('publicKey').value = publicKeyArmored;
//  console.log(revocationCertificate);
}

/*
	Shortcut function to show needed public key in #lookupKey
*/
function showPublicKey() {
	getPublicKey(keyListShow.value, 'lookupKey');
}

/*
	Delete public key fron DB by name in #public-keys-show
*/
function deletePublicKey() {
	if(keyListShow.value) {
		browser.storage.local.get(['publicKeys'], function(result) {
			var publicKeys = result.publicKeys;
			for(var i = 0; i < publicKeys.length; i++) {
				if(publicKeys[i].name == keyListShow.value) {
					publicKeys.splice(i, 1);
					browser.storage.local.set({ publicKeys: publicKeys });
					getKeyList(true);
					location.reload();
					break;
				}
			}
		});
	}
}

/*
	Encrypt message from #encrypt-message with selected public key using openpgp.js
*/
function encryptMessage() {
	browser.storage.local.get(['publicKeys'], async function(result) {
		var publicKeys = result.publicKeys;
		console.log(publicKeys);
		for(var i = 0; i < publicKeys.length; i++) {
			var name = publicKeys[i].name;
			if(name === keyListUse.value) {
				var key = publicKeys[i].key;
		console.log(key);
		const { data: encrypted } = await openpgp.encrypt({
			message: openpgp.message.fromText(document.getElementById('encrypt-message').value),
			publicKeys: (await openpgp.key.readArmored(key)).keys,
		});
		document.getElementById('encrypt-message').value = encrypted;}
		}
	});
}

/*
	Decrypt message from #decrypt-message using openpgp.js (must have stored personal credentials)
*/
function decryptMessage() {
	browser.storage.local.get({"myPublicKey": null, "myPrivateKey": null, "passphrase": null}, async function(result) {
		var myPublicKey = result.myPublicKey;
		var myPrivateKey = result.myPrivateKey;
		var passphrase = result.passphrase;
		console.log(`${myPrivateKey}\n${myPublicKey}\n${passphrase}`);
		const { keys: [privateKey] } = await openpgp.key.readArmored(myPrivateKey);
		await privateKey.decrypt(passphrase);

		const { data: decrypted } = await openpgp.decrypt({
        	message: await openpgp.message.readArmored(document.getElementById('decrypt-message').value),
        	publicKeys: (await openpgp.key.readArmored(myPublicKey)).keys,
        	privateKeys: [privateKey]
    	});

    	document.getElementById('decrypt-message').value = decrypted;
	});
}

document.addEventListener('DOMContentLoaded', function() {
	browser.runtime.connect();

	document.getElementById('store-button').addEventListener('click', addPublicKey);
	document.getElementById('creds').addEventListener('click', addExistingCreds);
	document.getElementById('delete-key').addEventListener('click', deletePublicKey);
	generateButton.addEventListener('click', generateKey);
	document.getElementById('encrypt').addEventListener('click', encryptMessage);
	document.getElementById('decrypt').addEventListener('click', decryptMessage);
	document.getElementById('me').addEventListener('click', selectView);
	document.getElementById('keys').addEventListener('click', function () { changeTab('store-keys'); });
	document.getElementById('export-public').addEventListener('click', function () { getKeyList(false); });
	document.getElementById('generate-keys').addEventListener('click', function () { changeTab('user-generate'); });
	document.getElementById('enter-keys').addEventListener('click', function () { changeTab('user-enter'); });
	document.getElementById('user-info').addEventListener('click', function () { redirectOption = true; changeTab('user-pass'); });
	document.getElementById('delete-user').addEventListener('click', function () { redirectOption = false; changeTab('user-pass'); });
	document.getElementById('get-pass').addEventListener('click', redirectPass);
	document.getElementById('download-info').addEventListener('click', downloadUser);
	document.getElementById('keys-main-button').addEventListener('click', function () { changeTab('keys-main'); });

	document.getElementById('encrypt-message-copy').addEventListener('click', function() { copyContent(event); });
	document.getElementById('decrypt-message-copy').addEventListener('click', function() { copyContent(event); });
	document.getElementById('lookupKey-copy').addEventListener('click', function() { copyContent(event); });
	document.getElementById('privateKey-info-copy').addEventListener('click', function() { copyContent(event); });
	document.getElementById('publicKey-info-copy').addEventListener('click', function() { copyContent(event); });
	document.getElementById('privateKey-copy').addEventListener('click', function() { copyContent(event); });
	document.getElementById('publicKey-copy').addEventListener('click', function() { copyContent(event); });

	document.getElementById('encrypt-tab-button').addEventListener('click', function() { changeTab('encrypt-tab'); });
	document.getElementById('decrypt-tab-button').addEventListener('click', function() { changeTab('decrypt-tab'); });

	document.getElementById('public-keys-show').addEventListener('change', showPublicKey);

	document.getElementById('options-none').addEventListener('click', function () { browser.runtime.openOptionsPage(); });
	document.getElementById('options-main').addEventListener('click', function () { browser.runtime.openOptionsPage(); });

	getKeyList(true);
	changeTab('empty');
});