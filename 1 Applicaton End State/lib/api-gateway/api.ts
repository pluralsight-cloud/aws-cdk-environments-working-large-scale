import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import { Construct } from 'constructs';

export class APIStack extends cdk.Stack {

  public readonly api: apigateway.HttpApi;

  constructor(scope: Construct, id: string, ordersFunction: lambda.Function, props?: cdk.StackProps) {
    super(scope, id, props);

    // API Gateway setup
    const orderIntegration = new HttpLambdaIntegration('OrderIntegration', ordersFunction);

    this.api = new apigateway.HttpApi(this, 'OrdersApi', {
      apiName: 'Orders Service',
      description: 'This service serves orders.',
    });

    // API Gateway routes
    // GET /orders
    this.api.addRoutes ({
      path: '/orders',
      methods: [ apigateway.HttpMethod.GET],
      integration: orderIntegration
    })

    // PUT /orders
    this.api.addRoutes ({
      path: '/orders',
      methods: [ apigateway.HttpMethod.PUT],
      integration: orderIntegration
    })

    // GET /orders/{id}
    this.api.addRoutes ({
      path: '/orders/{id}',
      methods: [ apigateway.HttpMethod.GET],
      integration: orderIntegration
    })

    // DELETE /orders/{id}
    this.api.addRoutes ({
      path: '/orders/{id}',
      methods: [ apigateway.HttpMethod.DELETE],
      integration: orderIntegration
    })

    // Output API Gateway URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.apiEndpoint,
      description: 'The URL of the API Gateway',
    });

  }
}