#!/bin/bash

# Test script for listing users via the /users GET endpoint
# Usage: URL=https://your-api-gateway-url.amazonaws.com/prod ADMIN_PASSWORD=your-admin-password ./user_list.sh

# Check if URL environment variable is set
if [ -z "$URL" ]; then
    echo "Error: URL environment variable is not set"
    echo "Usage: URL=https://your-api-gateway-url.amazonaws.com/prod ADMIN_PASSWORD=your-admin-password ./user_list.sh"
    exit 1
fi

# Check if ADMIN_PASSWORD environment variable is set
if [ -z "$ADMIN_PASSWORD" ]; then
    echo "Error: ADMIN_PASSWORD environment variable is not set"
    echo "Usage: URL=https://your-api-gateway-url.amazonaws.com/prod ADMIN_PASSWORD=your-admin-password ./user_list.sh"
    exit 1
fi

echo "Testing user list endpoint..."
echo "Target URL: $URL/users"
echo "Admin Password: [HIDDEN]"
echo ""

# Perform the GET request with admin authentication
curl -X GET \
  -H "Authorization: $ADMIN_PASSWORD" \
  "$URL/users"

echo ""
echo "Test completed!"
