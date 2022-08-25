#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Ab1VPCStack } from '../lib/ab1-VPC-stack';
import { Ab1ECSStack } from '../lib/ab1-ECS-stack';
import { Ab1APIGWStack } from '../lib/ab1-APIGW-stack';
import { Ab1CognitoStack } from '../lib/ab1-Cognito-stack';

const app = new cdk.App();

//Gifty Isengard acme
const env_us_east1  = { account: '884535117483', region: 'us-east-1' };
const tenant = 'etsy';

const vpcStack = new Ab1VPCStack(app, 'Ab1VPCStack', {
  env: env_us_east1,
  tags: {
    tenant: tenant,
  },
  tenant: tenant
});

const ecsStack = new Ab1ECSStack(app, 'Ab1ECSStack', {
  env: env_us_east1,
  tags: {
    tenant: tenant,
  },
  tenant: tenant,
  vpc: vpcStack.vpc
});

const cognitoStack = new Ab1CognitoStack(app, 'Ab1CognitoStack', {
  env: env_us_east1,
  tags: {
    tenant: tenant,
  }
});

new Ab1APIGWStack(app, 'Ab1APIGWStack', {
  env: env_us_east1,
  tags: {
    tenant: tenant,
  },
  tenant: tenant,
  vpc: vpcStack.vpc,
  nlb: ecsStack.loadbalancer,
  userPool: cognitoStack.userPool
});

