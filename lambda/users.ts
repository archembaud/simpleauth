import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface UserRequest {
  userID: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userPassword: string;
  userPasswordClue: string;
  clientID: string;
  userAttributes: Record<string, any>;
}

interface UserSummary {
  userID: string;
  clientID: string;
  userEmail: string;
}

// Helper function to check admin authentication
const checkAdminAuth = (event: APIGatewayProxyEvent): boolean => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return false;
  }

  const authHeader = event.headers.Authorization || event.headers.authorization;
  return authHeader === adminPassword;
};

// Helper function to create standard response headers
const createHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Handle GET requests (admin only)
    if (event.httpMethod === 'GET') {
      return await handleGetUsers(event);
    }
    
    // Handle POST requests (user creation)
    if (event.httpMethod === 'POST') {
      return await handleCreateUser(event);
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers: createHeaders(),
      body: JSON.stringify({
        error: 'Method not allowed. Only GET and POST requests are supported.',
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      headers: createHeaders(),
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};

// Handle GET request to list all users (admin only)
const handleGetUsers = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Check admin authentication
  if (!checkAdminAuth(event)) {
    return {
      statusCode: 401,
      headers: createHeaders(),
      body: JSON.stringify({
        error: 'Unauthorized. Valid admin authentication required.',
      }),
    };
  }

  const tableName = process.env.USERS_TABLE_NAME;
  if (!tableName) {
    throw new Error('USERS_TABLE_NAME environment variable is not set');
  }

  // Scan all users from DynamoDB
  const scanCommand = new ScanCommand({
    TableName: tableName,
    ProjectionExpression: 'userID, clientID, userEmail',
  });

  const result = await docClient.send(scanCommand);
  
  const users: UserSummary[] = (result.Items || []).map(item => ({
    userID: item.userID as string,
    clientID: item.clientID as string,
    userEmail: item.userEmail as string,
  }));

  return {
    statusCode: 200,
    headers: createHeaders(),
    body: JSON.stringify({
      users,
      count: users.length,
    }),
  };
};

// Handle POST request to create a new user
const handleCreateUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Parse request body
  if (!event.body) {
    return {
      statusCode: 400,
      headers: createHeaders(),
      body: JSON.stringify({
        error: 'Request body is required.',
      }),
    };
  }

  let userData: UserRequest;
  try {
    userData = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      headers: createHeaders(),
      body: JSON.stringify({
        error: 'Invalid JSON in request body.',
      }),
    };
  }

  // Validate required fields
  const requiredFields = ['userID', 'userEmail', 'userFirstName', 'userLastName', 'userPassword', 'userPasswordClue', 'clientID'];
  const missingFields = requiredFields.filter(field => !userData[field as keyof UserRequest]);
  
  if (missingFields.length > 0) {
    return {
      statusCode: 400,
      headers: createHeaders(),
      body: JSON.stringify({
        error: `Missing required fields: ${missingFields.join(', ')}`,
      }),
    };
  }

  const tableName = process.env.USERS_TABLE_NAME;
  if (!tableName) {
    throw new Error('USERS_TABLE_NAME environment variable is not set');
  }

  // Check if user already exists
  const getCommand = new GetCommand({
    TableName: tableName,
    Key: {
      clientID: userData.clientID,
      userID: userData.userID,
    },
  });

  const existingUser = await docClient.send(getCommand);

  if (existingUser.Item) {
    return {
      statusCode: 409,
      headers: createHeaders(),
      body: JSON.stringify({
        error: 'User already exists with the same userID and clientID.',
      }),
    };
  }

  // Create new user record
  const userRecord = {
    clientID: userData.clientID,
    userID: userData.userID,
    userEmail: userData.userEmail,
    userFirstName: userData.userFirstName,
    userLastName: userData.userLastName,
    userPassword: userData.userPassword, // Note: In production, this should be hashed
    userPasswordClue: userData.userPasswordClue,
    userAttributes: userData.userAttributes || {},
    createdAt: new Date().toISOString(),
  };

  const putCommand = new PutCommand({
    TableName: tableName,
    Item: userRecord,
  });

  await docClient.send(putCommand);

  return {
    statusCode: 201,
    headers: createHeaders(),
    body: JSON.stringify({
      message: 'User created successfully',
      userID: userData.userID,
      clientID: userData.clientID,
      createdAt: userRecord.createdAt,
    }),
  };
};
