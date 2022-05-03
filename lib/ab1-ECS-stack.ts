import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from "aws-cdk-lib/aws-route53";

import * as elasticloadbalancer from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { domain } from 'process';
import { ISubnet } from 'aws-cdk-lib/aws-ec2';

export class Ab1ECSStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //TODO:Externalize
    const clientPrefix = `greenman`; //ECR repo has to be all lower case
    const vpcId = `vpc-0d12c5c9e9285a2cc`;
    const domain = 'aboctank.com'
    const EPHEMERAL_PORT_RANGE = ec2.Port.tcpRange(32768, 65535);
    //End TODO:Externalize

    const vpc = ec2.Vpc.fromLookup(this, `${clientPrefix}-vpc`, {
      vpcId: vpcId,
    });

    /*Hosted Zone manually created
    const zone = route53.HostedZone.fromLookup(this, `${clientPrefix}-zone`, {
      domainName: domain,
    });*/

    const repository = new ecr.Repository(this, `${clientPrefix}-repository`, {
      repositoryName: `${clientPrefix}-repository`,
    });

    const cluster = new ecs.Cluster(this, `${clientPrefix}-cluster`, {
      clusterName: `${clientPrefix}-cluster`,
      vpc,
    });

    // Handle one subnet per AZ
    const subnets: ISubnet[] = [] as ISubnet[];
    vpc.publicSubnets.forEach(subnet => {
      if (subnets.length == 0) {
        subnets.push(subnet);
      } else if (
        subnets.length < 2 &&
        subnets.find(v => {
          if (v.availabilityZone == subnet.availabilityZone) {
            return false;
          }
          return true;
        })
      ) {
        subnets.push(subnet);
      }
    });
    // load balancer resources
    const elb = new elasticloadbalancer.NetworkLoadBalancer(
      this,
      `${clientPrefix}-elb`,
      {
        vpc,
        vpcSubnets: { subnets: subnets, onePerAz: true },
        internetFacing: true,
      }
    );

    const elbSG = new ec2.SecurityGroup(this, `${clientPrefix}-elbSG`, {
      vpc,
      allowAllOutbound: true,
    });

    elbSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8080),
      "Allow https traffic"
    );

    // the role assumed by the task and its containers
    const taskRole = new iam.Role(this, "task-role", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      roleName: "task-role",
      description: "Role that the api task definitions use to run the api code",
    });

    taskRole.attachInlinePolicy(
      new iam.Policy(this, `${clientPrefix}-task-policy`, {
        statements: [
          // policies to allow access to other AWS services from within the container e.g Translate
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["translate:*"],
            resources: ["*"],
          }),
        ],
      })
    );
    const taskDefinition = new ecs.FargateTaskDefinition(this,`${clientPrefix}-task`, {
        family: `${clientPrefix}-task`,
        cpu: 256,
        memoryLimitMiB: 512,
        taskRole: taskRole,
      });

    const image = ecs.RepositoryImage.fromEcrRepository(repository, "latest");

    taskDefinition.addContainer(`${clientPrefix}-container`, {
      image: image,
      portMappings: [ {containerPort: 8080, hostPort: 8080, protocol: ecs.Protocol.TCP} ],
      memoryLimitMiB: 512,
      //environment: props.taskEnv,
      logging: ecs.LogDriver.awsLogs({ streamPrefix: clientPrefix }),
    });

    const service = new ecs.FargateService(this, `${clientPrefix}-service`, {
      cluster,
      desiredCount: 1,
      taskDefinition,
      assignPublicIp: true,
      securityGroups: [elbSG]
    });

    const scalableTaget = service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 5,
    });

    scalableTaget.scaleOnMemoryUtilization(`${clientPrefix}-ScaleUpMem`, {
      targetUtilizationPercent: 75,
    });

    scalableTaget.scaleOnCpuUtilization(`${clientPrefix}-ScaleUpCPU`, {
      targetUtilizationPercent: 75,
    });

    const listener = elb.addListener("Listener", {
      port: 80,
      //certificates: [privatecert],
    });

    listener.addTargets(`${clientPrefix}-target`, {
      targetGroupName: `${clientPrefix}-targetGrpName`,
      port:8080,
      targets: [service]
    });

    // outputs to be used in code deployments
    new cdk.CfnOutput(this, `ServiceName`, {
      exportName: `ServiceName`,
      value: service.serviceName,
    });

    new cdk.CfnOutput(this, `ImageRepositoryUri`, {
      exportName: `ImageRepositoryUri`,
      value: repository.repositoryUri,
    });

    new cdk.CfnOutput(this, `ImageName`, {
      exportName: `ImageName`,
      value: image.imageName,
    });

    new cdk.CfnOutput(this, `ClusterName`, {
      exportName: `ClusterName`,
      value: cluster.clusterName,
    });
    
  }
}
