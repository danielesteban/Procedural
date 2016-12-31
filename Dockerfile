FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/Procedural
WORKDIR /usr/src/Procedural

# Install app dependencies
COPY package.json /usr/src/Procedural/package.json
RUN npm install

# Start dev server
EXPOSE 8080
CMD npm start
