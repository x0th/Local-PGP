const deleteAll = document.getElementById('delete-all');
const deleteUser = document.getElementById('delete-user');
const deletePublic = document.getElementById('delete-public');
const deleteAllContainer = document.getElementById('delete-all-container');
const deleteUserContainer = document.getElementById('delete-user-container');
const deletePublicContainer = document.getElementById('delete-public-container');

const sendToPopup = document.getElementById('send-to-popup');
const copyText = document.getElementById('copy-text');
const desktopNotification = document.getElementById('desktop-notification');
const sendToPopupContainer = document.getElementById('send-to-popup-container');
const copyTextContainer = document.getElementById('copy-text-container');
const desktopNotificationContainer = document.getElementById('desktop-notification-container');

function setClicks(option) {
	switch(option) {
		case 1:
			if(deleteAll.checked) {
				deleteUser.checked = false;
				deleteUserContainer.style.pointerEvents = 'none';
				deletePublic.checked = false;
				deletePublicContainer.style.pointerEvents = 'none';
				deleteParameters(1);
			} else {
				deleteUserContainer.style.pointerEvents = 'auto';
				deletePublicContainer.style.pointerEvents = 'auto';
				deleteParameters(0);
			}
			break;
		case 2:
			if(deleteAll.checked)
				break;
			if(deleteUser.checked) {
				if(deletePublic.checked) {
					deleteAll.checked = true;
					setClicks(1);
				} else
					deleteParameters(2);
			} else
				deleteParameters(0);
			break;
		case 3:
			if(deleteAll.checked)
				break;
			if(deletePublic.checked) {
				if(deleteUser.checked) {
					deleteAll.checked = true;
					setClicks(1);
				} else
					deleteParameters(3);
			} else
				deleteParameters(0);
			break;
		default:
			break;
	}
}

function deleteParameters(option) {
	chrome.storage.local.set({ "deleteStored": option });
}

function setContextMenus(option) {
	chrome.storage.local.get({ "contextMenus": [true, false, false] }, function(result) {
		var contextMenus = result.contextMenus;
		if(option == 0)
			contextMenus[option] = sendToPopup.checked;
		else if(option == 1)
			contextMenus[option] = copyText.checked;
		else if(option == 2)
			contextMenus[option] = desktopNotification.checked;

		chrome.storage.local.set({ contextMenus: contextMenus });
	});
}

function defaultChecks() {
	chrome.storage.local.get({ "deleteStored": 0, "contextMenus": [true, false, false] }, function(result) {
		switch(result.deleteStored) {
			case 1:
				deleteAll.checked = true;
				deleteUserContainer.style.pointerEvents = 'none';
				deletePublicContainer.style.pointerEvents = 'none';
				break;
			case 2:
				deleteUser.checked = true;
				break;
			case 3:
				deletePublic.checked = true;
				break;
			default:
				break;
		}

		if(result.contextMenus[0])
			sendToPopup.checked = true;
		if(result.contextMenus[1])
			copyText.checked = true;
		if(result.contextMenus[2])
			desktopNotification.checked = true;
	});
}


document.addEventListener('DOMContentLoaded', function() {
	defaultChecks();
	deleteAllContainer.addEventListener('click', function() { setClicks(1); });
	deleteUserContainer.addEventListener('click', function() { setClicks(2); });
	deletePublicContainer.addEventListener('click', function() { setClicks(3); });

	sendToPopupContainer.addEventListener('click', function() { setContextMenus(0); });
	copyTextContainer.addEventListener('click', function() { setContextMenus(1); });
	desktopNotificationContainer.addEventListener('click', function() { setContextMenus(2); })
});