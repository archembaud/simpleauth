#!/bin/bash

# Test script for creating a user via the /users endpoint
# Usage: URL=https://your-api-gateway-url.amazonaws.com/prod ./user_creation.sh

# Check if URL environment variable is set
if [ -z "$URL" ]; then
    echo "Error: URL environment variable is not set"
    echo "Usage: URL=https://your-api-gateway-url.amazonaws.com/prod ./user_creation.sh"
    exit 1
fi

# Test data for user creation
USER_DATA='{
  "userID": "test_user_123",
  "userEmail": "test@example.com",
  "userFirstName": "John",
  "userLastName": "Doe",
  "userPassword": "securePassword123",
  "userPasswordClue": "My favorite color",
  "clientID": "test_client_456",
  "userAttributes": {
    "role": "admin",
    "department": "engineering",
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }
}'

echo "Testing user creation endpoint..."
echo "Target URL: $URL/users"
echo "Request data:"
echo "$USER_DATA" | jq '.' 2>/dev/null || echo "$USER_DATA"
echo ""

# Perform the POST request
curl -X POST \
  -H "Content-Type: application/json" \
  -d "$USER_DATA" \
  -w "\n\nHTTP Status: %{http_code}\nTotal Time: %{time_total}s\n" \
  "$URL/users"

echo ""
echo "Test completed!"
