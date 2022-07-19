import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cdk from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

export class Ab1CognitoStack extends Stack {

  public readonly userPool: UserPool;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const clientPrefix = `Greenman`;

    this.userPool = new UserPool(this, `${clientPrefix}-user-pool`, {
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

    const client = this.userPool.addClient(`${clientPrefix}-app-client`, {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    })

    new CfnOutput(this, 'userPoolId', {
      value: this.userPool.userPoolId,
    })

    new CfnOutput(this, 'userPoolARN', {
      value: this.userPool.userPoolArn,
    })

    new CfnOutput(this, 'userPoolClientId', {
      value: client.userPoolClientId,
    })
  }
}
