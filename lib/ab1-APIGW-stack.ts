import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as elasticloadbalancer from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as cognito from 'aws-cdk-lib/aws-cognito'
import { AuthorizationType, MethodLoggingLevel } from 'aws-cdk-lib/aws-apigateway';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { NetworkLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { UserPool } from 'aws-cdk-lib/aws-cognito';


export interface Ab1APIGWStackProps extends cdk.StackProps {
  vpc: Vpc,
  nlb: NetworkLoadBalancer,
  tenant: string,
  userPool: UserPool
}


export class Ab1APIGWStack extends Stack {
  constructor(scope: Construct, id: string, props?: Ab1APIGWStackProps) {
    super(scope, id, props);

    const clientPrefix = props?.tenant;
    const userPoolArn = props?.userPool.userPoolArn!;
   
    const tenantVpc = props?.vpc!;
    const nlb = props?.nlb!;
    
    const vpcLink = new apigateway.VpcLink(this, `${clientPrefix}-vpc-ink`, {
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
      deployOptions: {
        dataTraceEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        tracingEnabled: true
      },      
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
