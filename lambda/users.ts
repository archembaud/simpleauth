import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

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

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Method not allowed. Only POST requests are supported.',
        }),
      };
    }

    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'User created successfully',
        userID: userData.userID,
        clientID: userData.clientID,
        createdAt: userRecord.createdAt,
      }),
    };

  } catch (error) {
    console.error('Error processing user creation:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};
