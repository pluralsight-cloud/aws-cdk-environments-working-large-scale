import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class LambdaRoles {
  public readonly lambdaRole: iam.Role;

  constructor(scope: Construct) {
    const lambdaMicroservicePolicy = new iam.ManagedPolicy(scope, 'LambdaMicroservicePolicy', {
      managedPolicyName: 'AWSLambdaMicroserviceExecutionRole',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "dynamodb:DeleteItem",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:Scan",
            "dynamodb:UpdateItem"
          ],
          resources: [`arn:aws:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/*`],
        }),
      ],
    });

    this.lambdaRole = new iam.Role(scope, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        lambdaMicroservicePolicy,
      ],
    });
  }
}