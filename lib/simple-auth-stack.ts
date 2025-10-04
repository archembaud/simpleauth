import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';

export class SimpleAuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Validate that ADMIN_PASSWORD environment variable is set
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD must be defined in the environment');
    }

    // Create DynamoDB table for users
    const usersTable = new dynamodb.Table(this, 'SimpleAuthUsersTable', {
      tableName: 'simple-auth-users',
      partitionKey: { name: 'clientID', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'userID', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only
    });

    // Create a Lambda function for healthcheck
    const helloWorldFunction = new lambda.Function(this, 'HelloWorldFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'hello-world.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        ADMIN_PASSWORD: adminPassword,
      },
    });

    // Create a Lambda function for users endpoint
    const usersFunction = new lambda.Function(this, 'UsersFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'users.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        USERS_TABLE_NAME: usersTable.tableName,
        ADMIN_PASSWORD: adminPassword,
      },
    });

    // Grant the users function permission to read/write to the DynamoDB table
    usersTable.grantReadWriteData(usersFunction);

    // Create an API Gateway
    const api = new apigateway.RestApi(this, 'SimpleAuthApi', {
      restApiName: 'Simple Auth API',
      description: 'This is a simple authentication API with healthcheck and user management endpoints',
    });

    // Create resources and methods
    const healthcheckResource = api.root.addResource('healthcheck');
    healthcheckResource.addMethod('GET', new apigateway.LambdaIntegration(helloWorldFunction));

    // Create /users endpoint
    const usersResource = api.root.addResource('users');
    usersResource.addMethod('POST', new apigateway.LambdaIntegration(usersFunction));
    usersResource.addMethod('GET', new apigateway.LambdaIntegration(usersFunction));

    // Output the API endpoint URL
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'The URL of the API endpoint',
    });

    // Output the DynamoDB table name
    new cdk.CfnOutput(this, 'UsersTableName', {
      value: usersTable.tableName,
      description: 'The name of the DynamoDB table for users',
    });
  }
}
