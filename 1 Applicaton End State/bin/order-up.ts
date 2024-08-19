#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database/database';
import { VPCStack } from '../lib/networking/vpc';
import { LambdaStack } from '../lib/lambda/lambda';
import { APIStack } from '../lib/api-gateway/api';
import { FrontendStack } from '../lib/frontend/frontend';
import { OrderUpStack } from '../lib/order-up-stack';

const app = new cdk.App();
// new OrderUpStack(app, 'OrderUpStack', { });

const orderUpDBStack = new DatabaseStack(app, 'OrderUpDBStack', {
  tableName: 'OrderUpDB'
});

const orderUpVPCStack = new VPCStack(app, 'OrderUpVPCStack', { });

const orderUpLambdaStack = new LambdaStack(app, 'OrderUpLambdaStack', orderUpDBStack.table, { });

const orderUpAPIStack = new APIStack(app, 'OrderUpAPIStack', orderUpLambdaStack.ordersFunction, { });

const orderUpFontendStack = new FrontendStack(app, 'OrderUpFrontendStack', {
  api: orderUpAPIStack.api, 
  vpc: orderUpVPCStack.vpc,
});
