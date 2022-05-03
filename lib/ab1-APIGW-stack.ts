import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as elasticloadbalancer from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as cognito from 'aws-cdk-lib/aws-cognito'
import { AuthorizationType } from 'aws-cdk-lib/aws-apigateway';

export class Ab1APIGWStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const clientPrefix = `Greenman`;
    const vpcId = 'Ab1VPCStack/Greenman-vpc'
    const nlbArn = `arn:aws:elasticloadbalancing:us-east-1:527384991348:loadbalancer/net/Ab1EC-green-9WF6JWY7ZO7J/0209e9350c109a41`;
    const userPoolArn = `arn:aws:cognito-idp:us-east-1:527384991348:userpool/us-east-1_OXoibuufg`;

    const tenantVpc = ec2.Vpc.fromLookup(this, `${clientPrefix}-link`, {vpcName: `${vpcId}`});
    const nlb = elasticloadbalancer.NetworkLoadBalancer.fromLookup(this, '${clientPrefix}-nlb', {loadBalancerArn: `${nlbArn}`});
    
    const vpcLink = new apigateway.VpcLink(this, `$clientPrefix}-vpc-ink`, {
      targets: [nlb],
    });

    const integration = new apigateway.Integration({
      type: apigateway.IntegrationType.HTTP_PROXY,
      integrationHttpMethod: "ANY",
      options: {
        connectionType: apigateway.ConnectionType.VPC_LINK,
        vpcLink: vpcLink,
        requestParameters: {
          "integration.request.path.proxy": "method.request.path.proxy"
        }
      },
      uri: "http://aboctank.com/{proxy}/"
    });

    const restapi = new apigateway.RestApi(this, "RestApi", {
      restApiName: "Tenant API to nlb",
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      defaultIntegration: integration
    });

    const authorizor = new apigateway.CfnAuthorizer(this, `${clientPrefix}-authorizor`, {
      name: "CognitoAuthorizor",
      type: AuthorizationType.COGNITO,
      identitySource: 'method.request.header.Authorization',
      restApiId: restapi.restApiId,
      providerArns: [userPoolArn]
    });
  
    const proxyResource = new apigateway.ProxyResource(this, "ProxyResource", {
      parent: restapi.root,
      anyMethod: false,
    })
  
    proxyResource.addMethod( "ANY", integration, {
        methodResponses: [{ statusCode: "200" }],
        requestParameters: {
          "method.request.path.proxy": true
        },
        authorizer: {
          authorizationType: AuthorizationType.COGNITO,
          authorizerId: authorizor.ref
        }
    })
  
    new cdk.CfnOutput(this, 'nlbABAPIUrl', { value: restapi.url! })
  }
}
