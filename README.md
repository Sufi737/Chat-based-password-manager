### Chat Based Password Manager

A chat based password manager interface where user can:

1. Store credentials for websites which consists of a username and a password
2. Fetch credentials for a given website's username
3. Fetch all credentials for a given website

#### Password storage 

<b>Authentication: </b>For end user authentication the interface will take one password and store it as SHA-256 hash in the database. For the next time this SHA-256 encrypted hash will be compared for authentication.

<b>Credentials: </b>For the credentials it uses PBKDF(Password Based Key Derivation Functions) which takes user's password and adds a random salt. 

#### Credentials retrieval mechanism

For the storage and retrieval of credentials, it uses Python's Fernet library which uses a Fernet key to encrypt and decrypt the credentials. The key is stored as a key-value pair in the database for a given website and username