#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Ab1VPCStack } from '../lib/ab1-VPC-stack';

const app = new cdk.App();

//Gifty Isengard test
const env_us_east1  = { account: '078209247224', region: 'us-east-1' };

new Ab1VPCStack(app, 'Ab1VPCStack', {
  env: env_us_east1
});

