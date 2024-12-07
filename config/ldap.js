const {createErrorResponse} = require("./response");
const ldap = require("ldapjs");

const createSearchOptions = (username) => ({
    filter: `(&(mailNickname=${username})(objectClass=user))`,
    scope: "sub",
    attributes: ["name", "mailNickname", "mail", "department", "employeetype"], //Angabe spezifischer Attribute
});

function createLDAPRequest(username, password, res, successCallback, failureCallback) {
    //LDAP-Client erstellen
    const client = ldap.createClient({
        url: process.env.LDAP_URL,
    });

    // Verbindung mit LDAP Server und Authentifizierung (tgm BN & PW)
    client.bind(`tgm\\${username}`, password, (err) => {
        if (err) {
            if (err.name === 'InvalidCredentialsError') {
                failureCallback("InvalidCredentialsError");
            } else {
                failureCallback(err)
            }
            return;
        }

        //Suche durchführen
        client.search(
            "ou=People,ou=tgm,dc=tgm,dc=ac,dc=at", //Base für Search
            createSearchOptions(username),
            (err, res) => {
                if (err) {
                    console.error(`Fehler bei der Suche für ${username}:`, err);
                    return;
                }

                var attributes;
                // Verarbeiten des Resultates
                res.on("searchEntry", (entry) => {
                    attributes = entry.attributes.reduce((acc, attr) => {
                        acc[attr.type] = attr.values;
                        return acc;
                    }, {});

                });

                // Verweise abhandeln
                res.on("searchReference", (referral) => {
                    console.log(`Verweis für ${username}:`, referral.uris.join());
                });

                //Fehlerbehandlung während Suche
                res.on("error", (err) => {
                    console.error(`Fehler bei der Suche für ${username}:`, err.message);
                });

                // Suche abgeschlossen
                res.on("end", () => {

                    if (client.connected) {
                        client.unbind();
                        successCallback(attributes)
                    }
                });
            }
        );
    });
}

module.exports = {createLDAPRequest};