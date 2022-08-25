# Simple CDK Project that can be used to create the following stacks
    - VPC 192.168.0.0/16
    - Subnets - 92.168.XX.0/19 (4 Public and 4 Private) with NAT
    - ECS - Creates FargateService, ECR Repo, NLB and a sample task
    - APIGW with {proxy+} to NLB and target

# IMPORTANT 
Edit /bin/ab1.ts, use your account ID
* `const env_us_east1  = { account: '<YOUR_ACCOUNT_ID>', region: 'us-east-1' };`
* `const tenant = '<YOUR_TENANT_ID>';`

e.g
* `const env_us_east1  = { account: '123456789', region: 'us-east-1' };`
* `const tenant = 'milo';`


## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk list`        list of CF Stacks
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


# Make sure docker is installed locally

If this is a brand new account run
* `cdk bootstrap`

Deploy the stacks, in the following order
* `cdk deploy Ab1VPCStack`      deploy VPC/Subnet Stack
* `cdk deploy Ab1ECSStack`      deploy ECS stack
* `cdk deploy Ab1CognitoStack`  Cognito
* `cdk deploy Ab1APIGWStack`    API GW Stack with cognito auto


Create a cognito user
* `aws cognito-idp admin-create-user \
  --user-pool-id <YOUR_POOL_ID> \
  --username john \
  --user-attributes Name="given_name",Value="john" \
     Name="family_name",Value="smith"`

* `aws cognito-idp admin-set-user-password \
  --user-pool-id <YOUR_POOL_ID> \
  --username john \
  --password Passw0rd! \
  --permanent`


  # Login and get JWT
    `curl --location --request POST 'https://cognito-idp.us-east-1.amazonaws.com/' \
    --header 'X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth' \
    --header 'Content-Type: application/x-amz-json-1.1' \
    --data-raw '{
        "AuthParameters" : {
            "USERNAME" : "john",
            "PASSWORD" : "Passw0rd!"
        },
        "AuthFlow" : "USER_PASSWORD_AUTH",
        "ClientId" : "<YOU_CLIENT_ID>"
    }'`

# Get the ID Token from the previous command and run the following
    `curl --location --request POST 'https://<YOUR_APIGATEWAY_URL>/translate' \
    --header 'Authorization: Bearer <YOUR_ID_TOKEN>' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "textToTranslate": "AWS Cost Explorer is a tool that enables you to view and analyze your costs and usage. You can explore your usage and costs using the main graph, the Cost Explorer cost and usage reports, or the Cost Explorer RI reports. You can view data for up to the last 12 months, forecast how much you'\''re likely to spend for the next 12 months, and get recommendations for what Reserved Instances to purchase. You can use Cost Explorer to identify areas that need further inquiry and see trends that you can use to understand your costs.",
        "source": "en",
        "target": "zh"
    }'`


# Clean up
* `cdk destroy Ab1APIGWStack`
* `cdk destroy Ab1ECSStack`
* `cdk destroy Ab1CognitoStack`
