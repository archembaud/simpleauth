# Simple Auth

A simple authentication API built with AWS CDK, API Gateway, Lambda, and DynamoDB for user management.

## Features

- **Health Check Endpoint**: `GET /healthcheck` - Returns a simple health check response
- **User Creation Endpoint**: `POST /users` - Creates new users with duplicate checking
- **User List Endpoint**: `GET /users` - Lists all users (admin authentication required)

## API Endpoints

### POST /users

Creates a new user in the system. The request body should contain:

```json
{
  "userID": "string",           // Unique identifier for the user
  "userEmail": "string",        // User's email address
  "userFirstName": "string",    // User's first name
  "userLastName": "string",     // User's last name
  "userPassword": "string",     // User's password
  "userPasswordClue": "string", // Password hint/clue
  "clientID": "string",         // Unique identifier for the client/system
  "userAttributes": {}          // Arbitrary JSON object for additional user data
}
```

**Response Codes:**
- `201` - User created successfully
- `400` - Bad request (missing fields, invalid JSON)
- `405` - Method not allowed (only POST is supported)
- `409` - User already exists with same userID and clientID
- `500` - Internal server error

### GET /users

Lists all users in the system (admin only). Requires admin authentication via Authorization header.

**Headers:**
- `Authorization`: Must match the ADMIN_PASSWORD environment variable

**Response:**
```json
{
  "users": [
    {
      "userID": "string",
      "clientID": "string", 
      "userEmail": "string"
    }
  ],
  "count": 1
}
```

**Response Codes:**
- `200` - Users retrieved successfully
- `401` - Unauthorized (invalid or missing admin password)
- `500` - Internal server error

## Infrastructure

- **DynamoDB Table**: `simple-auth-users`
  - Partition Key: `clientID` (String)
  - Sort Key: `userID` (String)
- **Lambda Functions**: 
  - Health check function
  - Users management function
- **API Gateway**: REST API with CORS enabled

## Deployment

### Prerequisites

Before deploying, you must set the `ADMIN_PASSWORD` environment variable:

```bash
export ADMIN_PASSWORD="your-secure-admin-password"
```

### Deploy Steps

```bash
npm install
npm run build
cdk deploy
```

**Note**: The deployment will fail if `ADMIN_PASSWORD` is not defined in the environment.

## Development

```bash
npm run watch  # Watch for TypeScript changes
```
