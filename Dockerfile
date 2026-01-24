# Use the official Node.js runtime as the base image
FROM node:18-alpine as build

# Set the working directory in the container
WORKDIR /app

# Set environment variables - these get baked into the build
ENV REACT_APP_API_URL=https://linesmart-api-650169261019.us-central1.run.app
ENV REACT_APP_FIREBASE_API_KEY=AIzaSyAaXlvuopHtTZglfghnlc_hBqGr1YzPrBk
ENV REACT_APP_FIREBASE_AUTH_DOMAIN=fredfix.firebaseapp.com
ENV REACT_APP_FIREBASE_PROJECT_ID=fredfix
ENV REACT_APP_FIREBASE_STORAGE_BUCKET=fredfix.firebasestorage.app
ENV REACT_APP_FIREBASE_MESSAGING_SENDER_ID=650169261019
ENV REACT_APP_FIREBASE_APP_ID=1:650169261019:web:0106d844197d7f44eca5fe

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# Use nginx to serve the built app
FROM nginx:alpine

# Copy the built app from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Google Cloud Run requirement)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
