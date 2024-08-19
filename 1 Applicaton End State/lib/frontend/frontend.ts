import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import { Construct } from 'constructs';
import { DockerImage } from './docker';
import { FargateService } from './fargate';

interface FrontendStackProps extends cdk.StackProps {
  api: apigateway.HttpApi;
  vpc: ec2.Vpc;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const dockerImage = new DockerImage(this);

    new FargateService(this, 'FargateService', {
      api: props.api,
      vpc: props.vpc,
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImage.image),
    });
  }
}