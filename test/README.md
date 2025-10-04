# Test Scripts

This folder contains test scripts for the Simple Auth API endpoints.

## Prerequisites

1. Set the required environment variable:
   ```bash
   export ADMIN_PASSWORD="your-secure-admin-password"
   ```
2. Deploy the CDK stack: `cdk deploy`
3. Get the API Gateway URL from the deployment output
4. Set the URL environment variable for testing

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

### user_list.sh (Linux/macOS/WSL)

Bash script to test the `/users` GET endpoint (admin only).

**Usage:**
```bash
# Set the required environment variables
export URL="https://your-api-gateway-url.amazonaws.com/prod"
export ADMIN_PASSWORD="your-admin-password"

# Run the test script
./user_list.sh
```

### user_list.ps1 (Windows PowerShell)

PowerShell script to test the `/users` GET endpoint (admin only).

**Usage:**
```powershell
# Set the required environment variables
$env:URL = "https://your-api-gateway-url.amazonaws.com/prod"
$env:ADMIN_PASSWORD = "your-admin-password"

# Run the test script
.\user_list.ps1
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
