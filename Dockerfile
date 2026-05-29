FROM nginx:alpine

# Copy all files from the current directory to the Nginx serve directory
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
