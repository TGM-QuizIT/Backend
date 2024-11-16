FROM node:23

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

#Placeholder Port
EXPOSE 3000

CMD ["npm", "start"]
