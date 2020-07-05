const deleteAll = document.getElementById('delete-all');
const deleteUser = document.getElementById('delete-user');
const deletePublic = document.getElementById('delete-public');
const deleteAllContainer = document.getElementById('delete-all-container');
const deleteUserContainer = document.getElementById('delete-user-container');
const deletePublicContainer = document.getElementById('delete-public-container');

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

function defaultChecks() {
	chrome.storage.local.get({ "deleteStored": 0 }, function(result) {
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
	});
}

document.addEventListener('DOMContentLoaded', function() {
	defaultChecks();
	document.getElementById('delete-all-container').addEventListener('click', function() { setClicks(1); });
	document.getElementById('delete-user-container').addEventListener('click', function() { setClicks(2); });
	document.getElementById('delete-public-container').addEventListener('click', function() { setClicks(3); });
});