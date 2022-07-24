#The image is built on top of one that has node preinstalled
FROM node:latest
#Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install  

# Bundle app source
COPY . .
# Open appropriate port 
EXPOSE 4000

# Start the application
CMD [ "node", "server.js" ]