#!/bin/bash

# Create SSL directory for the app
mkdir -p ../ssl

# Generate self-signed certificate for the app
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ../ssl/server.key \
  -out ../ssl/server.cert \
  -subj "/C=US/ST=State/L=City/O=CG Analytics/CN=172.31.20.69"

# Set appropriate permissions
chmod 600 ../ssl/server.key
chmod 644 ../ssl/server.cert

echo "SSL certificates generated successfully in ssl/ directory"
echo "Certificate is valid for 365 days"
echo "Note: This is a self-signed certificate. Browsers will show a security warning."