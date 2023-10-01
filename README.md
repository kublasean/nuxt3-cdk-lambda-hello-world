# Hello World Nuxt3 + AWS Lambda / S3 with CDK
Steps for running Nuxt Vue app on AWS Lambda with CDK, all in one repo. ***[-->Example URL<---](https://sm0muwlejl.execute-api.us-east-2.amazonaws.com/)***

Heavily inspired by https://github.com/ferdinandfrank/cdk-nuxt, referenced a lot of code. Please star this repo and check it out for an example of a much more detailed / fully featured setup with better handling of cold-starts, assets, and custom domains. This repo instead is more of a stripped down starting point, minimal thing that works also including an example nuxt app built in. 

* The top-level directory is a CDK project, which defines infrastructure as code for setting up the Lambda in */bin* and */lib*
* The *nuxt_app* directory is a Nuxt3 app
* ```HelloWorldNuxtLambdaStack``` deploys the rendering / API Nitro server to Lambda, and the public assets to a public S3 bucket, which is passed as the CDK URL for the nuxt app

Contributions welcome to improve this readme, add FAQ / gotches, and to improve code style and organization

***This setup is NOT compatible with ```npm run generate / nuxt generate```, will not work for deploying a static site without major modifications***

My original intent was to create a client-side-rendering-only Nuxt app, deploying static files to S3, and have that client call my Nuxt */api* routes which would be deployed to Lambda - but that does not appear to be possible currently with how hybrid rendering works. So instead this example is for a server-side rendered app (SSR: true), with static assets (.css files, fonts) deployed to S3 - which does work. 

## Section 0. Prereqs
1. Install nodejs

## Section 1. Setup: AWS Dev Access
1. Sign up for AWS Account
2. In AWS create access role for app dev using [AWS IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/get-started-enable-identity-center.html). This will be a new user name / password that grants CLI & programmatic access separate from the ownership account. I created a user called seandev that has PowerUser permissions, which is Admin minus the ability to modify users
3. Now to use this IAM account follow [Step 2: Configure SDKs and tools to use IAM Identity Center](https://docs.aws.amazon.com/sdkref/latest/guide/access-sso.html)
    1. First download AWS-CLI 
    2. Now, login to AWS Console as PowerUser. Go to AWS IAM Identity Center -> Settings and bookmark the *AWS access portal URL*. Visit the access portal and login as PowerUser
    3. On CLI follow [Configure your profile with the aws configure sso wizard](https://docs.aws.amazon.com/cli/latest/userguide/sso-configure-profile-token.html#sso-configure-profile-token-auto-sso). This will handle refreshing access credentials
    4. Now we have an AWS CLI profile we can use, I named highheat-seandev, like this: ```aws s3 ls --profile highheat-seandev```

Get credentials

```
aws sso login --profile highheat-seandev
```

Check creds (after accepting in browser)
```
aws s3 ls --profile highheat-seandev
sean@Seans-MBP highheat-admin % aws sts get-caller-identity --profile highheat-seandev
{
    "UserId": "AROAZMN4XMBNDSDR6SUYJ:seandev",
    "Account": "645177761882",
    "Arn": "arn:aws:sts::645177761882:assumed-role/AWSReservedSSO_PowerUserAccess_d5e582afd0b97b4c/seandev"
}
```

## Section 2. Setup: AWS CDK 
1. Follow [Install the AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)
    1. Install cdk globally on machine ```sean@Seans-MBP ~ % sudo npm install -g aws-cdk```
    2. Bootstrap cdk (uhhh what does this do???) ```sean@Seans-MBP test-cdk % cdk bootstrap aws://645177761882/us-east-2 --profile highheat-seandev```
        * fails with ```AWSReservedSSO_PowerUserAccess_d5e582afd0b97b4c/seandev is not authorized to perform: iam:GetRole on resource: role cdk-hnb659fds-image-publishing-role-645177761882-us-east-2 because no identity-based policy allows the iam:GetRole action```
        * see [Must cdk bootstrapping be done by a User with admin access?](https://stackoverflow.com/questions/71848231/must-cdk-bootstrapping-be-done-by-a-user-with-admin-access) and cry, we created a PowerUser so we didn't have to use Admin - but now we need admin :(
    3. Create Admin user since we can't Bootstrap with PowerUser. Created a 'seanadmin' username with AdministratorAccess permissions. Not allowed to use the same Email as PowerUser, but can use the email+suffix@gmail.com hack (my-email+admin@gmail.com instead of my-email@gmail.com). Did not set up AWS CLI profile for CMD Line SSO because I just need this for one-time to bootstrap (copied credentials from Portal and exported on CLI). 
        * Fails because the deployment bucket created before exists -> solution is to delete in console (under S3)
        * Retry succeeds ``` ✅  Environment aws://645177761882/us-east-2 bootstrapped.```


## Section 3. Deploy the app
1. Run the nuxt app in dev
    1. ```cd nuxt_app```
    1. ```npm install```
    1. ```npm run dev``` <--- any errors seen here may require adding/removing/upgrading packages in package.json
    1. Verify no errors and that localhost:port serves the app correctly showing "Hello World" with an example API response
1. Build the nuxt app for production
    1. ```cd nuxt_app```
    2. ```npm run build```
    3. Inspect *nuxt_app/.output* to see what this command generates, these files are what is deployed
1. Test that you can synthesize, from project root:
    1. ```npm install```
    1. ```cdk synth --profile [name of AWS_CLI profile]```
    2. Inspect the output and see what resource will be created in your AWS Account
1. Deploy
    1. ```cdk deploy --profile [name of AWS_CLI profile]```
    1. Login into your AWS management console and find the app link under API Gateway


```
helloWorldDev: deploying... [1/1]
helloWorldDev: creating CloudFormation changeset...

 ✅  helloWorldDev

✨  Deployment time: 126.45s
```

## CDK Useful commands
The `cdk.json` file tells the CDK Toolkit how to execute your app.

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


## References
* Nuxt rendering modes https://nuxt.com/docs/guide/concepts/rendering
* Nuxt deployment https://nuxt.com/docs/getting-started/deployment
* Code reference for CDK setup https://github.com/ferdinandfrank/cdk-nuxt
* Hosting a static website on S3 https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html
* AWS Lambda Nitro setup https://nitro.unjs.io/deploy/providers/aws
* AWS Lambda deployment not serving files from public/_nuxt folder https://github.com/nuxt/nuxt/issues/13478
    * Fix for this is you must be assets in CDN and use CDN_URL environment variable