import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
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
import { ISubnet, Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { NetworkLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Policy, Role } from 'aws-cdk-lib/aws-iam';
import { FargateTaskDefinition, LogDriver, RepositoryImage } from 'aws-cdk-lib/aws-ecs';

export interface Ab1ECSStackProps extends cdk.StackProps {
  vpc: ec2.Vpc,
  tenant: string
}

export class Ab1ECSStack extends Stack {
  
  public readonly loadbalancer: NetworkLoadBalancer;

  constructor(scope: Construct, id: string, props?: Ab1ECSStackProps) {
    super(scope, id, props);

    const clientPrefix = props?.tenant!; //ECR repo has to be all lower case
    const vpc = props?.vpc!;

    const repository = new ecr.Repository(this, `${clientPrefix}-repository`, {
      repositoryName: `${clientPrefix}-repository`,
    });

    const xrayRepository = new ecr.Repository(this, `${clientPrefix}-xray-repository`, {
      repositoryName: `${clientPrefix}-xray-repository`,
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
    this.loadbalancer = new NetworkLoadBalancer(
      this,
      `${clientPrefix}-elb`,
      {
        vpc,
        vpcSubnets: { subnets: subnets, onePerAz: true },
        internetFacing: true,
      }
    );

    const elbSG = new SecurityGroup(this, `${clientPrefix}-elbSG`, {
      vpc,
      allowAllOutbound: true,
    });

    elbSG.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(8080),
      "Allow https traffic"
    );

    // the role assumed by the task and its containers
    const taskRole = new Role(this, "task-role", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      roleName: "task-role",
      description: "Role that the api task definitions use to run the api code",
    });

    taskRole.attachInlinePolicy(
      new Policy(this, `${clientPrefix}-task-policy`, {
        statements: [
          // policies to allow access to other AWS services from within the container e.g Translate
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["translate:*"],
            resources: ["*"]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["xray:*"],
            resources: ["*"]
          })
        ],
      })
    );

    const taskDefinition = new FargateTaskDefinition(this,`${clientPrefix}-task`, {
        family: `${clientPrefix}-task`,
        cpu: 256,
        memoryLimitMiB: 512,
        taskRole: taskRole,
      });

    const image = RepositoryImage.fromEcrRepository(repository, "latest");

    taskDefinition.addContainer(`${clientPrefix}-container`, {
      image: image,
      portMappings: [ {containerPort: 8080, hostPort: 8080, protocol: ecs.Protocol.TCP} ],
      memoryLimitMiB: 512,
      //environment: props.taskEnv,
      logging: ecs.LogDriver.awsLogs({ streamPrefix: clientPrefix }),
    });

    const xrayImage = RepositoryImage.fromEcrRepository(xrayRepository, "latest");
    const xray = taskDefinition.addContainer('xray', {
      image: xrayImage,
      cpu: 32,
      memoryReservationMiB: 256,
      essential: false,
      logging: LogDriver.awsLogs({ streamPrefix: clientPrefix })
    });
    xray.addPortMappings({
      containerPort: 2000,
      protocol: ecs.Protocol.UDP
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

    const listener = this.loadbalancer.addListener("Listener", {
      port: 80,
      //certificates: [privatecert],
    });

    listener.addTargets(`${clientPrefix}-target`, {
      targetGroupName: `${clientPrefix}-targetGrpName`,
      port:8080,
      targets: [service]
    });

    // outputs to be used in code deployments
    new CfnOutput(this, `ServiceName`, {
      exportName: `ServiceName`,
      value: service.serviceName,
    });

    new CfnOutput(this, `ImageRepositoryUri`, {
      exportName: `ImageRepositoryUri`,
      value: repository.repositoryUri,
    });

    new CfnOutput(this, `ImageName`, {
      exportName: `ImageName`,
      value: image.imageName,
    });

    new CfnOutput(this, `ClusterName`, {
      exportName: `ClusterName`,
      value: cluster.clusterName,
    });
    
  }
}
