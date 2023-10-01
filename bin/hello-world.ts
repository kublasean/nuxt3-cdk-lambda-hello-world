#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HelloWorldNuxtLambdaStack } from '../lib/hello-world-nuxt-lambda-stack';

const app = new cdk.App();
new HelloWorldNuxtLambdaStack(app, 'helloWorldDev', {
    // Deploy using AWS-CLI profile
    // For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
});