import { Construct } from 'constructs';
import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { HttpMethod } from "aws-cdk-lib/aws-stepfunctions-tasks";

import * as path from 'path';

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment"

export class HelloWorldNuxtLambdaStack extends cdk.Stack {

    private readonly prefix = "helloWorldDev";

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // API Gateway for HTTP API
        const appGateway = new HttpApi(this, `${this.prefix}-appGateway`, {
            description: 'Connects the app Lambda to a public internet endpoint',
            corsPreflight: undefined
        });

        // Bucket for public assets
        const allowPublicAccessWithPolicies = new s3.BlockPublicAccess({
            blockPublicAcls: true,
            blockPublicPolicy: false,
            ignorePublicAcls: true,
            restrictPublicBuckets: false
        });
        const assetsBucket = new s3.Bucket(this, `${this.prefix}-appAssetsBucket`, {
            blockPublicAccess: allowPublicAccessWithPolicies,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
            publicReadAccess: true,
            cors: [{
                allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
                allowedOrigins: [appGateway.apiEndpoint],
                allowedHeaders: ['*']
            }]
        });

        // Deploy assets to bucket
        const assetsDeployment = new s3deploy.BucketDeployment(this, `${this.prefix}-deployAssets`, {
            sources: [s3deploy.Source.asset(path.join(__dirname, '../nuxt_app/.output/public'))],
            destinationBucket: assetsBucket,
            prune: true
        });

        // Create app lambda, point assets lookup to deployed bucket
        const appLambda = new lambda.Function(this, `${this.prefix}-appLambda`, {
            description: "Runs the Nuxt app sever on AWS Lambda",
            code: lambda.Code.fromAsset(path.join(__dirname, '../nuxt_app/.output/server')),
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            timeout: cdk.Duration.seconds(15),
            environment: {
                'NUXT_APP_CDN_URL': `https://${assetsDeployment.deployedBucket.bucketDomainName}`
            }
        });

        // Connect gateway to Lambda
        appGateway.addRoutes({
            integration: new HttpLambdaIntegration(`${this.prefix}-integration`, appLambda),
            path: '/{proxy+}',
            methods: [HttpMethod.GET, HttpMethod.HEAD],
        });
    }
}
