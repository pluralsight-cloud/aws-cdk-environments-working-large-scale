import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  tableName: string,
}

export class DatabaseStack extends cdk.Stack {

  public readonly table: dynamodb.TableV2;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    // DynamoDB table
    this.table = new dynamodb.TableV2(this, 'OrdersTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: props.tableName,
    });

  }
}