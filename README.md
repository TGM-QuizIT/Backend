# QuizITBackend

Dieses Repository enthält das Backend für die QuizIT-Applikation, entwickelt mit Express.js und Node.js. Es stellt eine REST-API bereit, die mit einer MariaDB-Datenbank und einem LDAP-Server verbunden ist.

## Technologien

- **Node.js (LTS-Version 20.15.1)**
- **Express.js**
- **MariaDB**
- **LDAP**
- **npm (Version 10.7.0)**

## Entwicklungsumgebung

Für die Entwicklung wurde IntelliJ IDEA (Version 2024.3.4.1) verwendet.

## Installation

1. Installiere den Express-Generator global:

    ```bash
    npm install -g express-generator
    ```

2. Generiere das Projekt:

    ```bash
    express QuizITBackend --view pug
    ```

3. Wechsel in das Projektverzeichnis und installiere die Abhängigkeiten:

    ```bash
    cd QuizITBackend
    npm install
    ```

## Verwendete Packages

- **ldapjs**: Verbindung zu einem LDAP-Server zur Benutzer-Authentifizierung.
- **dotenv**: Laden von Umgebungsvariablen aus der `.env`-Datei.
- **mariadb**: Verbindung zur MariaDB-Datenbank.
- **cors**: Konfiguration von HTTP-Zugriffsrechten.
- **path**: Unterstützung für die Arbeit mit Dateipfaden.
- **http**: Bereitstellung der grundlegenden HTTP-Server-Funktionen.

## Projektstruktur

Die Struktur des Projekts sieht folgendermaßen aus:

### Ordner und Dateien:

- **/bin**: Enthält Skripte, die zum Starten des Servers verwendet werden.
- **/config**: Beinhaltet Konfigurationsdateien für die Datenbankverbindung und die LDAP-Verbindung.
- **/node_modules**: Hier werden alle von npm installierten Pakete abgelegt.
- **/public**: Öffentliche Ressourcen wie CSS-Dateien, JavaScript-Dateien und Bilder.
- **/routes**: Der Ordner enthält die Routen der API, die in `app.js` eingebunden werden.
- **/views**: Falls benötigt, enthält dieser Ordner die Pug-Dateien für serverseitiges Rendering (wird in diesem Projekt nicht intensiv verwendet).
- **.env**: Diese Datei enthält Umgebungsvariablen wie Zugangsdaten für Datenbanken und API-Keys.
- **app.js**: Die zentrale Datei, in der alle Routen und Middleware-Funktionen definiert werden.
- **Dockerfile**: Dient zur Erstellung des Docker-Containers für das Projekt.
- **package.json**: Enthält alle npm-Pakete sowie Konfigurationen und Skripte für das Projekt.

## API-Endpunkte

Die API bietet verschiedene Endpunkte für unterschiedliche Operationen:

- `/user`: Endpoints für Benutzer, z.B. Login und Schüler-Statistik.
- `/subject`: Endpoints für Fächer, z.B. Abrufen aller Fächer eines Users.
- `/focus`: Endpoints für Schwerpunkte, z.B. Aktivierung/Deaktivierung von Schwerpunkten.
- `/question`: Endpoints für die Verwaltung von Fragen (Admin-Website).
- `/quiz`: Endpoints für Quiz-Generierung.
- `/result`: Endpoints für das Speichern von Ergebnissen.
- `/friends`: Endpoints zur Verwaltung von Freundschaften.
- `/challenge`: Endpoints für die Verwaltung von Herausforderungen.

## Error Monitoring

Um Fehler während des Deployments zu überwachen wurde [BugSnag](https://www.bugsnag.com/) eingebunden. Der API-Key wurde in der .env-Datei bewusst die Umgebungsvariable leer gelassen. Es kann einfach ein neues Projekt erstellt werden wobei Server, dann Node.js und zuletzt Express.js auszuwählen ist. Anschließend wurde ein API-Key generiert, welcher einfach eingefügt werden kann.

## Environment Variablen
| Name                      | Verwendung |
| --------                  | ------- |
| API_PORT                  | Der interne Port, auf dem die API im Container läuft. |
| DEPLOYMENT_PORT_API       | Der externe Port, auf dem die API auch dem Schulnetzwerk erreichbar ist. Ist mit dem Administrator festgelegt. |
| MARIADB_PORT              | Der interne Port, auf dem die Datenbank im Container läuft.|
| DEPLOYMENT_PORT_DB        | Der externe Port, auf dem die Datenbank auch dem Schulnetzwerk erreichbar ist. Ist mit dem Administrator festgelegt. |
| API_KEY                   | Der API-Key, welcher bei jedem Request benötigt wird,  damit Abfragen nicht abgewiesen werden. |
| NODE_ENV                  | Der Mode, in welchem die API läuft. |
| MARIADB_ROOT_USER         | Der Benutzernamen des Super-Users der Datenbank |
| MARIADB_ROOT_PW           | Das Passwort des Super-Users der Datenbank |
| MARIADB_USER              | Der Benutzernamen des Standard-Users der Datenbank |
| MARIADB_PW                | Der Passwort des Standard-Users der Datenbank |
| MARIADB_DATABASE          | Der Namen der Datenbank im DBMS |
| LDAP_URL                  | Die URL des TGM-LDAP-Server|
| APPLE_PASSWORD            | Passwort des Apple-Test-Accounts |
| FIRST_PASSWORD            | Passwort für Test-Account |
| SECOND_PASSWORD           | Passwort für Test-Account |
| THIRD_PASSWORD            | Passwort für Test-Account |
| FOURTH_PASSWORD           | Passwort für Test-Account |
| FIFTH_PASSWORD            | Passwort für Test-Account |
| BUGSNAG_API_KEY           | API-Key des Error-Monitoring-Tools Bugsnag|

---