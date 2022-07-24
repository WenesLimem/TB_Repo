#The image is built on top of one that has node preinstalled
FROM node:16-alpine
#Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .
# Open appropriate port 
EXPOSE 4003

# Start the application
CMD [ "node", "server.js" ]