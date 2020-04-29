#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FargateTaskRunnerDemoStack } from '../lib/fargate-task-runner-demo-stack';

const app = new cdk.App();
cdk.Tag.add(app, 'Application', 'FargateSQSConsumerDemo');
// eslint-disable-next-line no-new
new FargateTaskRunnerDemoStack(app, 'FargateTaskRunnerDemoStack');
