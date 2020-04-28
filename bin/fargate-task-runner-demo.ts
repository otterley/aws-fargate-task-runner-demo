#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FargateTaskRunnerDemoStack } from '../lib/fargate-task-runner-demo-stack';

const app = new cdk.App();
new FargateTaskRunnerDemoStack(app, 'FargateTaskRunnerDemoStack');
