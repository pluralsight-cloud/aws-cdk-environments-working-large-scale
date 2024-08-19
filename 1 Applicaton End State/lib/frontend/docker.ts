import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Construct } from 'constructs';
import * as path from 'path';

export class DockerImage {
  
  public readonly image: DockerImageAsset;

  constructor(scope: Construct) {

    this.image = new DockerImageAsset(scope, 'OrderUpFrontendImage', {
      directory: path.join(__dirname, '..', '..', 'webserver')
    });
  
  }

}