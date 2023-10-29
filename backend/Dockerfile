# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy all source files to the working directory
COPY . .

#ENV NEO4J_URI=neo4j+s://1face838.databases.neo4j.io
#ENV NEO4J_USER=neo4j
#ENV NEO4J_PASSWORD=abIABwzjtj2Nm3P4ytNJV_T1T39BHw7JBao-75VlQH8

# Compile TypeScript code to JavaScript (you might need to adjust the path if your TypeScript source files are in a different location)
RUN npm run build

# Expose the port your application will run on
EXPOSE 8000

# Command to run your application using node
CMD ["node", "dist/controllers/index.js"]

