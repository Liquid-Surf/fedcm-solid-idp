# Migrating data from v6 to v7

Below is a description of the changes that are necessary to migration data from v6 to v7 of the server.

## Account data

The format of the "Forgot passwords records was changed",
but seeing as those are not important and new ones can be created if necessary,
these can just be removed when migrating.
By default, these were located in the `.internal/forgot-password/` folder so this entire folder can be removed.

For existing accounts, the data was stored in the following format and location.
Additionally to the details below, the tail of all resource identifiers were base64 encoded.

* **Account data**
    * Storage location: `.internal/accounts/`
    * Resource identifiers: `"account/" + encodeURIComponent(email)`
    * Data format: `{ webId, email, password, verified }`
* **Account settings**
    * Storage location: `.internal/accounts/`, so same location as the account data
    * Resource identifiers: `webId`
    * Data format: `{ useIdp, podBaseUrl?, clientCredentials? }`
        * `useIdp` indicates if the WebID is linked to the account for identification.
        * `podBaseUrl` is defined if the account was created with a pod.
        * `clientCredentials` is an array containing the labels of all client credentials tokens created by the account.
* **Client credentials tokens**
    * Storage location: `.internal/accounts/credentials/`
    * Resource identifiers: the token label
    * Data format: `{ webId, secret }`

The `V6MigrationInitializer` class is responsible for migrating from this format to the new one
and does so by reading in the old data and creating new instances in the `IndexedStorage`.
In case you have an instance that made impactful changes to how storage is handled
that would be the class to investigate and replace.
Password data can be reused as the algorithm there was not changed.
Email addresses are now stored in lowercase, so these need to be converted during migration.

## Other internal data

The format of all other internal data was changed in the same way:

* Keys are no longer base64 encoded.
  This means that if there were any slashes in the keys these will now result in containers.
  Keys are URL encoded when necessary to prevent issues with file names when using the file system.
* Keys where the part of the key after the last slash is longer than 150 characters will be hashed.
* All values will be wrapped in a JSON object with 2 keys:
    * **key**: Contains the original key. Relevant for when keys are hashed so the original key can be retrieved.
    * **payload**: The original value.

All internal storage that is not account data as described in the previous section
will be removed to prevent issues with outdated formats.
This applies to the following stored data:

* The key used for signing OIDC tokens. A new one will be generated by the server.
    * `.internal/idp/keys/`
* All OIDC related tokens/grants/sessions/etc. Users will have to authenticate again.
    * `.internal/idp/adapter/`
* All notification subscriptions. Users will have to resubscribe.
    * `.internal/notifications/`
* All setup values.
    * These actually need to be migrated as some are important to prevent issues, such as the `rootInitialized` key,
    which prevents initialized roots from being overwritten.
    * `.internal/setup/`
