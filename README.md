# Local PGP Browser support

Install: [Chrome](https://chrome.google.com/webstore/detail/local-pgp-browser-encrypt/hlcbdlnnolgaenfoddgdlmgjflcapbba)

The extension uses [OpenPGP.js](https://openpgpjs.org/) for everything associated with cryptography.

Note: **The extension's security is limited by it being local and browser-operated. Always keep a backup of stored keys somewhere secure.**

# Features

* The extension allows you to encrypt and decrypt messages with PGP in-browser as opposed to by using a mailing client.
* You can store your PGP keys directly in-browser for the purpose of decryption.
* If you do not have PGP keys, you can generate them in the extension. **Remember to also store them elsewhere for backup**.
* You can keep an 'address book' of known public keys for encryption purposes.
* Don't like such information being stored in a browser? You can tweak storage settings in the extension options.
* Want to export your key databases? You can download them in a comfortable .json format.

# Navigation

### Want to store/generate your PGP keys?

Navigate to *My Keys -> Enter Existing* or *My Keys -> Generate new* accordingly.

### Want to view/delete your credentials?

Once your credentials are stored, you can navigate to *My Keys -> Show my info* or *My Keys -> Delete my info*.

### Ready to decrypt?

After you have entered/generated your PGP keys, you can decrypt any message that was encrypted using your public key in the *Decrypt* tab.

### Want to encrypt a message?

Just store a public key that was given to you by going to *Encrypt -> Add*. After you have stored a key that way, you are ready to encrypt! Just choose a key from the list in the *Encrypt* tab. You can also view your 'address book' in the *View Stored Keys* found in the *Encrypt -> Add* tab.

### Searching for options?

You can find them in *My Keys -> Options*. There, you can enable/disable storage of your PGP keys and 'address book' during every session.