# Test Scripts

This folder contains test scripts for the Simple Auth API endpoints.

## Prerequisites

1. Deploy the CDK stack: `cdk deploy`
2. Get the API Gateway URL from the deployment output
3. Set the URL environment variable

## Available Scripts

### user_creation.sh (Linux/macOS/WSL)

Bash script to test the `/users` POST endpoint.

**Usage:**
```bash
# Set the URL environment variable
export URL="https://your-api-gateway-url.amazonaws.com/prod"

# Run the test script
./user_creation.sh
```
## Test Data

The user creation script uses the following test data:

```json
{
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
}
```

## Expected Responses

- **201 Created**: User created successfully
- **400 Bad Request**: Missing required fields or invalid JSON
- **405 Method Not Allowed**: Only POST requests are supported
- **409 Conflict**: User already exists with same userID and clientID
- **500 Internal Server Error**: Server-side error

## Notes

- The scripts include error handling and formatted output
- The bash script uses `jq` for JSON formatting if available
- Both scripts validate that the URL environment variable is set
- You can modify the test data in the scripts to test different scenarios
