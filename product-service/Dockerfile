#The image is built on top of one that has node preinstalled
FROM node:latest
#Create app directory
WORKDIR /usr/src/app
# Bundle app source

COPY package*.json ./

RUN npm install

COPY . .
# Open appropriate port 
EXPOSE 4002

# Start the application
CMD [ "node", "server.js" ]