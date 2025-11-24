# Use Ubuntu so apt works reliably on Render
FROM ubuntu:22.04

# Prevent tzdata asking questions
ENV DEBIAN_FRONTEND=noninteractive

# Update & install dependencies
RUN apt-get update && \
    apt-get install -y wget curl git poppler-utils && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Workdir
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install npm deps
RUN npm install

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "src/index.js"]
