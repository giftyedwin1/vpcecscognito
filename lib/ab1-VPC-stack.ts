import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class Ab1VPCStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const clientPrefix = `Octank`;

    // Create VPC for use with Neptune
    const octankVpc = new ec2.Vpc(this, `${clientPrefix}-vpc`, {
      cidr: "192.168.0.0/16",
      maxAzs: 2,
      natGateways: 1,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      
      subnetConfiguration: [{
        cidrMask: 19,
        name: `${clientPrefix}-Private1`,
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      }, {
        cidrMask: 19,
        name: `${clientPrefix}-Private2`,
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },{
        cidrMask: 19,
        name: `${clientPrefix}-Public1`,
        subnetType: ec2.SubnetType.PUBLIC,
      }, {
        cidrMask: 19,
        name: `${clientPrefix}-Public2`,
        subnetType: ec2.SubnetType.PUBLIC,
      }],
    });

    // Output the VPC ID
    new cdk.CfnOutput(this, "VPCId", {
      value: octankVpc.vpcId,
      description: `${clientPrefix}-VPC ID`,
      exportName: `${clientPrefix}-VpcStack:vpcId`
    });
  }
}
