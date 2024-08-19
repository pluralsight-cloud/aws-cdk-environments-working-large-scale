import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as escp from 'aws-cdk-lib/aws-ecs-patterns';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import { Construct } from 'constructs';

interface FargateServiceProps extends cdk.StackProps {
  api: apigateway.HttpApi;
  vpc: ec2.IVpc;
  image: ecs.ContainerImage;
}

export class FargateService extends Construct {
  constructor(scope: Construct, id: string,  props: FargateServiceProps) {
    super(scope, id);

    new escp.ApplicationLoadBalancedFargateService(this, 'OrderUpWebservice', {
      vpc: props.vpc,
      taskImageOptions: {
        image: props.image,
        environment: {
          API_URL: props.api.apiEndpoint,
        },
        containerPort: 3000,
      },
      publicLoadBalancer: true,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64, // Remove if workstation uses a non-ARM architecture
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });
  }
}
