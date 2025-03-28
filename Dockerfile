FROM node:23-alpine
LABEL version="1.0"
LABEL org.opencontainers.image.authors="Raphael Tarnoczi raphi.tarnoczi@gmail.com"
LABEL description="Image für Backend der DA QuizIT am TGM"

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
