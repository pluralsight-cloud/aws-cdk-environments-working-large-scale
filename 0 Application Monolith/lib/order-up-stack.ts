import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as escp from 'aws-cdk-lib/aws-ecs-patterns';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import * as path from 'path';

export class OrderUpStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table

    const table = new dynamodb.Table(this, 'OrdersTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda IAM privleges

    const lambdaMicroservicePolicy = new iam.ManagedPolicy(this, 'LambdaMicroservicePolicy', {
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
          resources: [ `arn:aws:dynamodb:${this.region}:${this.account}:table/*` ]
        })
      ]
    });

    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        lambdaMicroservicePolicy
      ],
    });

    // Lambda function

    const ordersFunction = new lambda.Function(this, 'OrderFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    // Grant DynamoDB permissions to the Lambda functions

    table.grantReadWriteData(ordersFunction);

    // API Gateway setup

    const orderIntegration = new HttpLambdaIntegration('OrderIntegration', ordersFunction);

    const api = new apigateway.HttpApi(this, 'OrdersApi', {
      apiName: 'Orders Service',
      description: 'This service serves orders.',
    });

    // API Gateway routes

    // GET /orders
    api.addRoutes ({
      path: '/orders',
      methods: [ apigateway.HttpMethod.GET],
      integration: orderIntegration
    })

    // PUT /orders
    api.addRoutes ({
      path: '/orders',
      methods: [ apigateway.HttpMethod.PUT],
      integration: orderIntegration
    })

    // GET /orders/{id}
    api.addRoutes ({
      path: '/orders/{id}',
      methods: [ apigateway.HttpMethod.GET],
      integration: orderIntegration
    })

    // DELETE /orders/{id}
    api.addRoutes ({
      path: '/orders/{id}',
      methods: [ apigateway.HttpMethod.DELETE],
      integration: orderIntegration
    })

    // Output API Gateway URL

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.apiEndpoint,
      description: 'The URL of the API Gateway',
    });

    // Create VPC

    const vpc = new ec2.Vpc(this, 'OrderUpVPC', {
      maxAzs: 2,
    });

    // Generate Docker image

    const orderFrontendImage = new DockerImageAsset(this, 'OrderUpFrontendImage', {
      directory: path.join(__dirname, '..', 'webserver')
    });

    // Create Fargate containers

    const orderUpWebservice = new escp.ApplicationLoadBalancedFargateService(this, 'OrderUpWebservice', {
      vpc: vpc,
      taskImageOptions: {
        image: ecs.ContainerImage.fromDockerImageAsset(orderFrontendImage),
        environment: {
          API_URL: api.apiEndpoint,
        },
        containerPort: 3000,
      },
      publicLoadBalancer: true,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64, // remove line if working computer is not ARM-based
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      }
    });

  }
}
