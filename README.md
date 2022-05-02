# Simple CDK Project that can be used to create the following stacks
    - VPC 192.168.0.0/16
    - Subnets - 92.168.XX.0/19 (4 Public and 4 Private) with NAT
    - ECS - Creates FargateService, ECR Repo, NLB and a sample task
    - APIGW with {proxy+} to NLB and target

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk list`        list of CF Stacks
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template



Deploy the stacks, in the following order
* `cdk deploy Ab1VPCStack`      deploy VPC/Subnet Stack
* `cdk deploy Ab1ECSStack`      deploy ECS stack
* `cdk deploy Ab1CognitoStack`  Cognito
* `cdk deploy Ab1APIGWStack`    API GW Stack with cognito auto

TODO: In ab1-APIGW-stack, replace the following variables, I still need to make these to be passed (even better get it from SSM)
const nlbArn = `xxxxxxxx`;
const userPoolArn = `xxxxxx`;