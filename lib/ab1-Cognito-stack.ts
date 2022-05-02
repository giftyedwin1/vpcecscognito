import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cdk from 'aws-cdk-lib';

export class Ab1CognitoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const clientPrefix = `Octank`;

    const userPool = new cognito.UserPool(this, `${clientPrefix}-user-pool`, {
    signInAliases: {
      email: true,
      username: true,
    },
    passwordPolicy: {
      minLength: 8,
      requireDigits: false,
      requireLowercase: false,
      requireSymbols: false,
      requireUppercase: false,
    },
    selfSignUpEnabled: true,
    userVerification: {
      emailSubject: 'Verify your email for our awesome app!',
      emailBody: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
      emailStyle: cognito.VerificationEmailStyle.CODE,
      smsMessage: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
    },
     
  })

  const client = userPool.addClient(`${clientPrefix}-app-client`, {
    authFlows: {
      userPassword: true,
      userSrp: true,
    },
  })

  new cdk.CfnOutput(this, 'userPoolId', {
    value: userPool.userPoolId,
  })

  new cdk.CfnOutput(this, 'userPoolClientId', {
    value: client.userPoolClientId,
  })
  }
}
