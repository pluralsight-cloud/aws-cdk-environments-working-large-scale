import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { LambdaRoles } from './iam';
import { Construct } from 'constructs';

export class LambdaStack extends cdk.Stack {

  public readonly ordersFunction: lambda.Function;

  constructor(scope: Construct, id: string, table: dynamodb.TableV2, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaRoles = new LambdaRoles(this);

    // Lambda function
    this.ordersFunction = new lambda.Function(this, 'OrderFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRoles.lambdaRole,
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    // Grant DynamoDB permissions to the Lambda functions
    table.grantReadWriteData(this.ordersFunction);

  }
}