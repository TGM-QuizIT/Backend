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

---