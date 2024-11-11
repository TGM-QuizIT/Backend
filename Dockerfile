# Verwenden, des offizielle Node.js-Image als Basis
FROM node:23

# Erstellen des Arbeitsverzeichnis im Container
WORKDIR /app

# Kopieren Sie die package.json- und package-lock.json-Dateien und installieren Sie die Abhängigkeiten
COPY package*.json ./
RUN npm install

# Kopieren Sie den gesamten Projektinhalt in das Arbeitsverzeichnis
COPY . .

# Öffnen Sie den Port, auf dem Ihre Node.js-Anwendung lauscht (falls erforderlich)
EXPOSE 3000

# Starten Sie Ihre Node.js-Anwendung
CMD [ "npm", "start" ]
