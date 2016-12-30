FROM node:boron

# Force DEV environment
ENV NODE_ENV development

# Create app directory
RUN mkdir -p /usr/src/Procedural
WORKDIR /usr/src/Procedural

# Install app dependencies
COPY package.json /usr/src/Procedural/package.json
RUN npm install

# Start server
EXPOSE 8080
CMD [ "npm", "start" ]
