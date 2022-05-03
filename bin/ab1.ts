#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Ab1VPCStack } from '../lib/ab1-VPC-stack';
import { Ab1ECSStack } from '../lib/ab1-ECS-stack';
import { Ab1APIGWStack } from '../lib/ab1-APIGW-stack';
import { Ab1CognitoStack } from '../lib/ab1-Cognito-stack';

const app = new cdk.App();

//Gifty Isengard test
const env_us_east1  = { account: '527384991348', region: 'us-east-1' };

new Ab1VPCStack(app, 'Ab1VPCStack', {
  env: env_us_east1,
  tags: {
    tenant: 'Greenman',
  }
});

new Ab1ECSStack(app, 'Ab1ECSStack', {
  env: env_us_east1,
  tags: {
    tenant: 'Greenman',
  }
});

new Ab1APIGWStack(app, 'Ab1APIGWStack', {
  env: env_us_east1,
  tags: {
    tenant: 'Greenman',
  }
});

new Ab1CognitoStack(app, 'Ab1CognitoStack', {
  env: env_us_east1,
  tags: {
    tenant: 'Greenman',
  }
});